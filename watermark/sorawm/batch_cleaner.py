#!/usr/bin/env python3
"""
Nettoyeur de watermarks optimisé pour traitement par batch
Spécialement conçu pour les environnements Docker avec ressources limitées
"""

import gc
import queue
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
import torch
from loguru import logger

from sorawm.watermark_cleaner import WaterMarkCleaner


class BatchWaterMarkCleaner:
    """
    Nettoyeur optimisé pour traiter plusieurs images en batch
    - Pool de workers réutilisables
    - Gestion intelligente de la mémoire GPU
    - Cache des régions similaires
    - Optimisations Docker
    """

    def __init__(
        self,
        max_workers: int = 2,
        max_queue_size: int = 10,
        gpu_memory_limit_mb: int = 1024,
        enable_region_cache: bool = True,
    ):
        self.max_workers = max_workers
        self.max_queue_size = max_queue_size
        self.gpu_memory_limit = gpu_memory_limit_mb * 1024 * 1024  # Convert to bytes
        self.enable_region_cache = enable_region_cache

        # Pool de workers
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.work_queue = queue.Queue(maxsize=max_queue_size)

        # Cache des régions fréquemment nettoyées
        self.region_cache: Dict[str, np.ndarray] = {}
        self.cache_hits = 0
        self.cache_misses = 0

        # Statistiques
        self.processed_count = 0
        self.total_processing_time = 0.0
        self.memory_cleanups = 0

        # Instance de cleaner réutilisable
        self.cleaner = WaterMarkCleaner(lazy_load=True)

        logger.info(
            f"BatchCleaner initialisé: {max_workers} workers, "
            f"limite GPU: {gpu_memory_limit_mb}MB, "
            f"cache régions: {enable_region_cache}"
        )

    def _get_region_hash(
        self, image_region: np.ndarray, mask_region: np.ndarray
    ) -> str:
        """Génère un hash pour identifier des régions similaires"""
        # Hash basé sur la forme et quelques pixels représentatifs
        h, w = image_region.shape[:2]
        if h * w == 0:
            return ""

        # Échantillonner quelques pixels pour le hash
        sample_step = max(1, min(h, w) // 8)
        sample_pixels = image_region[::sample_step, ::sample_step].flatten()
        mask_pixels = mask_region[::sample_step, ::sample_step].flatten()

        # Créer un hash simple mais efficace
        image_hash = hash(tuple(sample_pixels[:50]))  # Limiter à 50 pixels
        mask_hash = hash(tuple(mask_pixels[:50]))
        shape_hash = hash((h, w))

        return f"{shape_hash}_{image_hash}_{mask_hash}"

    def _check_gpu_memory(self) -> bool:
        """Vérifie si la mémoire GPU est disponible"""
        if not torch.cuda.is_available():
            return True

        try:
            memory_allocated = torch.cuda.memory_allocated()
            return memory_allocated < self.gpu_memory_limit
        except Exception as e:
            logger.warning(f"Erreur vérification mémoire GPU: {e}")
            return True

    def _cleanup_memory(self):
        """Nettoie la mémoire GPU et système"""
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        gc.collect()
        self.memory_cleanups += 1

        # Nettoyer le cache des régions si trop plein
        if len(self.region_cache) > 100:
            # Garder seulement les 50 plus récents
            items = list(self.region_cache.items())
            self.region_cache = dict(items[-50:])

        logger.debug("Mémoire nettoyée")

    def _process_single_image(
        self, image: np.ndarray, mask: np.ndarray, image_id: str = None
    ) -> Tuple[np.ndarray, Dict]:
        """Traite une seule image avec optimisations"""
        start_time = time.time()

        # Statistiques de cette image
        stats = {
            "cache_hit": False,
            "processing_time": 0.0,
            "watermark_pixels": 0,
            "image_id": image_id,
        }

        try:
            # Vérifier la mémoire avant de commencer
            if not self._check_gpu_memory():
                self._cleanup_memory()

            # Trouver la région du watermark
            mask_coords = np.where(mask > 0)
            if len(mask_coords[0]) == 0:
                stats["processing_time"] = time.time() - start_time
                return image.copy(), stats

            # Calculer la bbox
            y_min, y_max = mask_coords[0].min(), mask_coords[0].max()
            x_min, x_max = mask_coords[1].min(), mask_coords[1].max()

            # Marge adaptative
            bbox_width = x_max - x_min
            bbox_height = y_max - y_min
            bbox_size = max(bbox_width, bbox_height)
            margin = max(10, min(50, bbox_size // 4))

            # Ajuster la bbox avec marge
            h, w = image.shape[:2]
            y_min = max(0, y_min - margin)
            y_max = min(h, y_max + margin)
            x_min = max(0, x_min - margin)
            x_max = min(w, x_max + margin)

            # Extraire les régions
            cropped_image = image[y_min:y_max, x_min:x_max].copy()
            cropped_mask = mask[y_min:y_max, x_min:x_max].copy()

            stats["watermark_pixels"] = np.sum(cropped_mask > 0)

            # Vérifier le cache si activé
            cleaned_crop = None
            if self.enable_region_cache and cropped_image.size > 0:
                region_hash = self._get_region_hash(cropped_image, cropped_mask)

                if region_hash in self.region_cache:
                    cleaned_crop = self.region_cache[region_hash].copy()
                    stats["cache_hit"] = True
                    self.cache_hits += 1
                    logger.debug(f"Cache hit pour région {region_hash[:8]}...")

            # Si pas de cache hit, traiter avec le modèle
            if cleaned_crop is None:
                cleaned_crop = self.cleaner.clean(cropped_image, cropped_mask)
                self.cache_misses += 1

                # Ajouter au cache si la région est assez grande pour mériter le cache
                if (
                    self.enable_region_cache
                    and cropped_image.size > 5000  # Au moins 5K pixels
                    and len(self.region_cache) < 100
                ):
                    region_hash = self._get_region_hash(cropped_image, cropped_mask)
                    self.region_cache[region_hash] = cleaned_crop.copy()

            # Recoller dans l'image originale
            result = image.copy()
            result[y_min:y_max, x_min:x_max] = cleaned_crop

            stats["processing_time"] = time.time() - start_time
            self.processed_count += 1
            self.total_processing_time += stats["processing_time"]

            return result, stats

        except Exception as e:
            logger.error(f"Erreur traitement image {image_id}: {e}")
            stats["processing_time"] = time.time() - start_time
            stats["error"] = str(e)
            return image.copy(), stats

    def process_batch(
        self,
        images: List[np.ndarray],
        masks: List[np.ndarray],
        image_ids: List[str] = None,
    ) -> Tuple[List[np.ndarray], List[Dict]]:
        """
        Traite un batch d'images de manière optimisée

        Args:
            images: Liste des images à nettoyer
            masks: Liste des masques correspondants
            image_ids: IDs optionnels pour le tracking

        Returns:
            Tuple (images_nettoyées, statistiques)
        """
        if len(images) != len(masks):
            raise ValueError("Le nombre d'images et de masques doit être identique")

        if image_ids is None:
            image_ids = [f"img_{i}" for i in range(len(images))]

        logger.info(f"Traitement batch de {len(images)} images")
        batch_start = time.time()

        # Trier par taille de watermark (traiter les plus petits en premier)
        def get_watermark_size(i):
            return np.sum(masks[i] > 0)

        # Créer les tuples (index, taille) et trier
        indexed_items = [(i, get_watermark_size(i)) for i in range(len(images))]
        indexed_items.sort(key=lambda x: x[1])

        # Réorganiser selon l'ordre optimisé
        sorted_indices = [item[0] for item in indexed_items]

        # Traiter en parallèle
        futures = []
        for idx in sorted_indices:
            future = self.executor.submit(
                self._process_single_image, images[idx], masks[idx], image_ids[idx]
            )
            futures.append((idx, future))

        # Collecter les résultats
        results = [None] * len(images)
        all_stats = [None] * len(images)

        for original_idx, future in futures:
            try:
                result_image, stats = future.result(timeout=300)  # 5 minutes max
                results[original_idx] = result_image
                all_stats[original_idx] = stats
            except Exception as e:
                logger.error(f"Erreur traitement image {original_idx}: {e}")
                results[original_idx] = images[original_idx].copy()
                all_stats[original_idx] = {
                    "error": str(e),
                    "processing_time": 0.0,
                    "image_id": image_ids[original_idx],
                }

        # Nettoyer la mémoire après le batch
        self._cleanup_memory()

        batch_time = time.time() - batch_start
        logger.info(
            f"Batch terminé en {batch_time:.2f}s "
            f"(moyenne: {batch_time / len(images):.2f}s/image)"
        )

        return results, all_stats

    def get_performance_stats(self) -> Dict:
        """Retourne les statistiques de performance"""
        cache_total = self.cache_hits + self.cache_misses
        cache_ratio = self.cache_hits / cache_total if cache_total > 0 else 0

        avg_time = (
            self.total_processing_time / self.processed_count
            if self.processed_count > 0
            else 0
        )

        return {
            "images_processed": self.processed_count,
            "total_time": self.total_processing_time,
            "avg_time_per_image": avg_time,
            "cache_hit_ratio": cache_ratio,
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "memory_cleanups": self.memory_cleanups,
            "cached_regions": len(self.region_cache),
        }

    def clear_cache(self):
        """Vide le cache des régions"""
        self.region_cache.clear()
        self.cache_hits = 0
        self.cache_misses = 0
        logger.info("Cache des régions vidé")

    def shutdown(self):
        """Ferme proprement le batch cleaner"""
        logger.info("Fermeture du BatchCleaner...")
        self.executor.shutdown(wait=True)
        self.cleaner.release_model()
        self.clear_cache()
        WaterMarkCleaner.clear_cache()
        self._cleanup_memory()
        logger.info("BatchCleaner fermé")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.shutdown()


# Fonction utilitaire pour usage simple
def clean_images_batch(
    images: List[np.ndarray],
    masks: List[np.ndarray],
    max_workers: int = 2,
    gpu_memory_limit_mb: int = 1024,
) -> List[np.ndarray]:
    """
    Fonction simple pour nettoyer un batch d'images

    Args:
        images: Liste des images à nettoyer
        masks: Liste des masques de watermarks
        max_workers: Nombre de workers parallèles
        gpu_memory_limit_mb: Limite mémoire GPU en MB

    Returns:
        Liste des images nettoyées
    """
    with BatchWaterMarkCleaner(
        max_workers=max_workers, gpu_memory_limit_mb=gpu_memory_limit_mb
    ) as batch_cleaner:
        cleaned_images, stats = batch_cleaner.process_batch(images, masks)

        # Log des statistiques
        perf_stats = batch_cleaner.get_performance_stats()
        logger.info(f"Performance: {perf_stats}")

        return cleaned_images


if __name__ == "__main__":
    # Test simple
    logger.info("Test du BatchWaterMarkCleaner")

    # Créer des images de test
    test_images = []
    test_masks = []

    for i in range(3):
        # Image de test 200x200
        img = np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8)
        mask = np.zeros((200, 200), dtype=np.uint8)

        # Ajouter un "watermark" dans le coin
        mask[150:180, 150:180] = 255

        test_images.append(img)
        test_masks.append(mask)

    # Tester le batch cleaner
    with BatchWaterMarkCleaner(max_workers=1) as batch_cleaner:
        results, stats = batch_cleaner.process_batch(test_images, test_masks)

        print("Résultats:")
        for i, stat in enumerate(stats):
            print(f"  Image {i}: {stat}")

        perf = batch_cleaner.get_performance_stats()
        print(f"Performance globale: {perf}")
