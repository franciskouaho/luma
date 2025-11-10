import gc
import threading
import time

import cv2
import numpy as np
import torch
from loguru import logger

from sorawm.configs import DEFAULT_WATERMARK_REMOVE_MODEL
from sorawm.iopaint.const import DEFAULT_MODEL_DIR
from sorawm.iopaint.download import cli_download_model, scan_models
from sorawm.iopaint.model_manager import ModelManager
from sorawm.iopaint.schema import InpaintRequest
from sorawm.utils.devices_utils import get_device

# This codebase is from https://github.com/Sanster/IOPaint#, thanks for their amazing work!


class WaterMarkCleaner:
    # Cache statique partagé entre toutes les instances (économie mémoire Docker)
    _model_cache = {}
    _cache_lock = threading.Lock()

    def __init__(self, lazy_load=True, ultra_fast=True):
        self.model = DEFAULT_WATERMARK_REMOVE_MODEL
        self.device = get_device()
        self.model_manager = None
        # Use model_validate with empty dict to get all defaults
        self.inpaint_request = InpaintRequest.model_validate({})  # type: ignore[call-arg]
        self._last_used = time.time()

        # NOUVELLE OPTION: Mode ultra-rapide avec cv2.inpaint au lieu de lama
        self.ultra_fast = ultra_fast
        logger.info(
            f"WaterMarkCleaner initialisé - Mode: {'ULTRA-RAPIDE (cv2.inpaint)' if ultra_fast else 'Standard (lama)'}"
        )

        if not lazy_load and not ultra_fast:
            self._ensure_model_loaded()

    def _ensure_model_loaded(self):
        """Charge le modèle seulement si nécessaire (lazy loading)"""
        if self.model_manager is not None:
            self._last_used = time.time()
            return

        cache_key = f"{self.model}_{self.device}"

        with WaterMarkCleaner._cache_lock:
            # Vérifier si le modèle est déjà en cache
            if cache_key in WaterMarkCleaner._model_cache:
                self.model_manager = WaterMarkCleaner._model_cache[cache_key]
                logger.info(f"Modèle {self.model} récupéré du cache")
                self._last_used = time.time()
                return

        # Charger le modèle
        scanned_models = scan_models()
        if self.model not in [it.name for it in scanned_models]:
            logger.info(
                f"{self.model} not found in {DEFAULT_MODEL_DIR}, downloading..."
            )
            cli_download_model(self.model)

        logger.info(f"Chargement du modèle {self.model} sur {self.device}")
        self.model_manager = ModelManager(name=self.model, device=self.device)

        with WaterMarkCleaner._cache_lock:
            WaterMarkCleaner._model_cache[cache_key] = self.model_manager

        self._last_used = time.time()

    def clean(self, input_image: np.ndarray, watermark_mask: np.ndarray) -> np.ndarray:
        """
        Nettoie les watermarks de l'image

        Mode ultra_fast=True: Utilise cv2.inpaint (8x plus rapide)
        Mode ultra_fast=False: Utilise le modèle lama (plus lent mais meilleure qualité)
        """
        # OPTIMISATION 1: Ne traiter que la région du watermark au lieu de toute l'image
        mask_coords = np.where(watermark_mask > 0)

        if len(mask_coords[0]) == 0:
            # Pas de watermark, retourner l'image originale
            return input_image

        y_min, y_max = mask_coords[0].min(), mask_coords[0].max()
        x_min, x_max = mask_coords[1].min(), mask_coords[1].max()

        # Ajouter une marge adaptative selon la taille du watermark
        bbox_width = x_max - x_min
        bbox_height = y_max - y_min
        bbox_size = max(bbox_width, bbox_height)

        # Marge adaptative : 15-50 pixels selon la taille du watermark
        margin = max(15, min(50, bbox_size // 3))
        h, w = input_image.shape[:2]
        y_min = max(0, y_min - margin)
        y_max = min(h, y_max + margin)
        x_min = max(0, x_min - margin)
        x_max = min(w, x_max + margin)

        # Extraire seulement la région à nettoyer
        cropped_image = input_image[y_min:y_max, x_min:x_max]
        cropped_mask = watermark_mask[y_min:y_max, x_min:x_max]

        # OPTIMISATION 2: Choisir la méthode selon le mode
        if self.ultra_fast:
            # MODE ULTRA-RAPIDE: cv2.inpaint (8x plus rapide)
            start_time = time.time()
            cleaned_crop = cv2.inpaint(
                cropped_image, cropped_mask, 7, cv2.INPAINT_TELEA
            )
            processing_time = time.time() - start_time
            logger.debug(
                f"Ultra-fast cleaning: {processing_time:.3f}s pour région {cropped_image.shape}"
            )
        else:
            # MODE STANDARD: Modèle lama (plus lent mais meilleure qualité)
            self._ensure_model_loaded()
            if self.model_manager is None:
                raise RuntimeError("Model manager failed to load")

            start_time = time.time()
            cleaned_crop = self.model_manager(
                cropped_image, cropped_mask, self.inpaint_request
            )
            cleaned_crop = cv2.cvtColor(cleaned_crop, cv2.COLOR_BGR2RGB)
            processing_time = time.time() - start_time
            logger.debug(
                f"Standard cleaning: {processing_time:.3f}s pour région {cropped_image.shape}"
            )

        # Recoller la région nettoyée dans l'image originale
        result = input_image.copy()
        result[y_min:y_max, x_min:x_max] = cleaned_crop

        return result

    def release_model(self):
        """Libère la mémoire du modèle (utile en Docker avec mémoire limitée)"""
        if self.model_manager is not None:
            del self.model_manager
            self.model_manager = None

            # Nettoyer la mémoire GPU
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            gc.collect()

            logger.info(f"Modèle {self.model} libéré de la mémoire")

    @classmethod
    def clear_cache(cls):
        """Vide tout le cache des modèles"""
        with cls._cache_lock:
            for model_manager in cls._model_cache.values():
                del model_manager
            cls._model_cache.clear()

            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            gc.collect()

            logger.info("Cache des modèles vidé")

    def __del__(self):
        """Nettoyage automatique à la destruction de l'objet"""
        # Ne pas libérer le modèle du cache, juste nettoyer la référence
        self.model_manager = None
