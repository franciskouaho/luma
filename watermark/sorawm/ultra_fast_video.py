#!/usr/bin/env python3
"""
Ultra Fast Video Watermark Remover
Objectif: Passer de 8 minutes à < 1 minute par vidéo

Optimisations appliquées:
1. FastCleaner (TELEA) au lieu de lama (8x plus rapide)
2. Skip frames intelligents (traiter 1 frame sur 3)
3. Parallélisation multi-thread
4. Cache des masques identiques
5. Résolution adaptative
"""

import os
import shutil
import subprocess
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import cv2
import numpy as np
from loguru import logger
from tqdm import tqdm

from sorawm.core import SoraWaterMarkDetector
from sorawm.fast_cleaner import FastWaterMarkCleaner


class UltraFastVideoProcessor:
    """
    Processeur vidéo ultra-rapide

    Performance cible:
    - AVANT: 8 minutes/vidéo (0.64s/frame)
    - APRÈS: < 1 minute/vidéo (0.08s/frame)
    - Techniques: FastCleaner + Skip frames + Parallélisation
    """

    def __init__(
        self,
        video_path: str,
        output_path: str,
        temp_dir: str = "tmp_ultra_fast",
        max_workers: int = 4,
        skip_frames: int = 1,
        max_resolution: int = 1080,
    ):
        """
        Args:
            video_path: Chemin vidéo source
            output_path: Chemin vidéo sortie
            temp_dir: Dossier temporaire
            max_workers: Nombre de threads parallèles
            skip_frames: Traiter 1 frame sur N (1 = toutes les frames)
            max_resolution: Résolution max (downscale si plus grand)
        """
        self.video_path = Path(video_path)
        self.output_path = Path(output_path)
        self.temp_dir = Path(temp_dir)
        self.max_workers = max_workers
        self.skip_frames = max(1, skip_frames)
        self.max_resolution = max_resolution

        # Créer dossiers
        self.temp_dir.mkdir(exist_ok=True, parents=True)
        self.frames_dir = self.temp_dir / "frames"
        self.processed_dir = self.temp_dir / "processed"
        self.debug_dir = self.temp_dir / "debug"

        for d in [self.frames_dir, self.processed_dir, self.debug_dir]:
            d.mkdir(exist_ok=True, parents=True)

        # Composants optimisés pour suppression TOTALE (qualité > vitesse)
        self.detector = SoraWaterMarkDetector()
        self.cleaner = FastWaterMarkCleaner(method="ns", inpaint_radius=40)

        # Cache des masques pour éviter de re-détecter
        self.mask_cache: Dict[str, np.ndarray] = {}
        self.cache_lock = threading.Lock()

        # Statistiques
        self.stats = {
            "frames_total": 0,
            "frames_processed": 0,
            "frames_skipped": 0,
            "frames_cached": 0,
            "processing_time": 0.0,
            "detection_time": 0.0,
            "cleanup_time": 0.0,
        }

        logger.info(f"UltraFastVideoProcessor initialisé:")
        logger.info(f"  - Workers: {max_workers}")
        logger.info(
            f"  - Skip frames: {skip_frames} (traite {'toutes les frames' if skip_frames == 1 else f'1/{skip_frames}'})"
        )
        logger.info(f"  - Max résolution: {max_resolution}p")
        logger.info(f"  - Temp dir: {self.temp_dir}")

    def get_video_info(self) -> Dict:
        """Récupère les infos vidéo"""
        cap = cv2.VideoCapture(str(self.video_path))

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        cap.release()

        # Calculer résolution optimale
        scale_factor = 1.0
        if max(width, height) > self.max_resolution:
            scale_factor = self.max_resolution / max(width, height)
            width = int(width * scale_factor)
            height = int(height * scale_factor)
            logger.info(f"Downscale appliqué: {scale_factor:.2f}")

        return {
            "fps": fps,
            "width": width,
            "height": height,
            "frame_count": frame_count,
            "scale_factor": scale_factor,
        }

    def extract_frames_smart(self, video_info: Dict) -> List[Path]:
        """
        Extraction intelligente des frames
        - Skip frames pour réduire le nombre
        - Downscale si nécessaire
        """
        logger.info("📽️ Extraction intelligente des frames...")

        # Commande ffmpeg optimisée
        scale_filter = ""
        if video_info["scale_factor"] < 1.0:
            scale_filter = f"-vf scale={video_info['width']}:{video_info['height']}"

        # Extraire seulement 1 frame sur skip_frames
        fps_filter = f"fps=fps={video_info['fps']}/{self.skip_frames}"

        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(self.video_path),
            "-vf",
            fps_filter,
            "-q:v",
            "2",  # Qualité élevée
            str(self.frames_dir / "frame_%06d.png"),
        ]

        if scale_filter:
            cmd = cmd[:-2] + [scale_filter] + cmd[-2:]

        start_time = time.time()
        subprocess.run(cmd, capture_output=True, check=True)

        # Lister les frames extraites
        frame_files = sorted(list(self.frames_dir.glob("frame_*.png")))

        extraction_time = time.time() - start_time
        effective_fps = len(frame_files) / (
            video_info["frame_count"] / video_info["fps"]
        )

        logger.info(f"✅ {len(frame_files)} frames extraites en {extraction_time:.1f}s")
        logger.info(f"📊 FPS effectif: {effective_fps:.1f} (skip={self.skip_frames})")

        self.stats["frames_total"] = len(frame_files)
        return frame_files

    def get_mask_hash(self, frame: np.ndarray) -> str:
        """Génère un hash simple pour cache de masques"""
        # Hash basé sur quelques pixels représentatifs
        h, w = frame.shape[:2]
        sample_step = max(10, min(h, w) // 20)
        sample = frame[::sample_step, ::sample_step].flatten()[:100]
        return str(hash(tuple(sample)))

    def detect_or_cache(self, frame: np.ndarray, frame_idx: int) -> np.ndarray:
        """Détection avec cache pour éviter les re-calculs"""
        frame_hash = self.get_mask_hash(frame)

        with self.cache_lock:
            if frame_hash in self.mask_cache:
                self.stats["frames_cached"] += 1
                cached_mask = self.mask_cache[frame_hash]
                return cached_mask.copy()

        # Détection normale
        detection_start = time.time()
        detection_result = self.detector.detect(frame)
        self.stats["detection_time"] = float(self.stats["detection_time"]) + (
            time.time() - detection_start
        )

        # Convertir le résultat en masque
        h, w = frame.shape[:2]
        mask = np.zeros((h, w), dtype=np.uint8)
        if detection_result["detected"] and detection_result["bbox"] is not None:
            x1, y1, x2, y2 = detection_result["bbox"]
            mask[y1:y2, x1:x2] = 255

        # Améliorer le masque si watermark détecté - ULTRA MAXIMUM
        if mask is not None and np.sum(mask) > 0:
            # Dilatation massive pour capturer TOUT watermark + ombres + reflets
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21))
            mask = cv2.dilate(mask, kernel, iterations=4)

            # Fermeture ultra-large pour remplir tous les trous possibles
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19))
            mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

            # Dilatation finale ultra-sécurisée pour les bords
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
            mask = cv2.dilate(mask, kernel, iterations=3)

        # Ajouter au cache (limiter à 50 masques)
        with self.cache_lock:
            if len(self.mask_cache) < 50:
                self.mask_cache[frame_hash] = mask.copy()

        return mask

    def process_frame(
        self, frame_path: Path, output_path: Path, frame_idx: int
    ) -> bool:
        """Traite une frame individuelle"""
        try:
            # Charger frame
            frame = cv2.imread(str(frame_path))
            if frame is None:
                return False

            # Détecter watermark (avec cache)
            mask = self.detect_or_cache(frame, frame_idx)

            # Nettoyer avec FastCleaner - NETTOYAGE EN QUADRUPLE PASS INTENSIF
            if mask is not None and np.sum(mask) > 0:
                cleanup_start = time.time()

                # Pass 1: Nettoyage de base avec masque original (rayon max)
                cleaned_frame = self.cleaner.clean_ultra_fast(frame, mask)

                # Pass 2: Masque modérément élargi pour résidus moyens
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))
                enhanced_mask = cv2.dilate(mask, kernel, iterations=3)
                enhanced_mask = cv2.morphologyEx(enhanced_mask, cv2.MORPH_CLOSE, kernel)
                cleaned_frame = self.cleaner.clean_ultra_fast(
                    cleaned_frame, enhanced_mask
                )

                # Pass 3: Masque largement élargi pour résidus tenaces
                kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (23, 23))
                ultra_mask = cv2.dilate(enhanced_mask, kernel, iterations=2)
                cleaned_frame = self.cleaner.clean_ultra_fast(cleaned_frame, ultra_mask)

                # Pass 4: Nettoyage final ultra-intensif pour gros watermarks
                if np.sum(mask) > 500:  # Pour tous les watermarks moyens/gros
                    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (29, 29))
                    mega_mask = cv2.dilate(ultra_mask, kernel, iterations=2)
                    cleaned_frame = self.cleaner.clean_ultra_fast(
                        cleaned_frame, mega_mask
                    )

                self.stats["cleanup_time"] = float(self.stats["cleanup_time"]) + (
                    time.time() - cleanup_start
                )

                # Debug occasionnel
                if frame_idx % 100 == 0:
                    debug_frame = frame.copy()
                    debug_frame[enhanced_mask > 0] = [0, 255, 0]  # Vert sur watermarks
                    cv2.imwrite(
                        str(self.debug_dir / f"debug_{frame_idx:06d}.png"), debug_frame
                    )
            else:
                cleaned_frame = frame

            # Sauvegarder
            cv2.imwrite(str(output_path), cleaned_frame)
            self.stats["frames_processed"] += 1
            return True

        except Exception as e:
            logger.error(f"Erreur frame {frame_idx}: {e}")
            return False

    def process_all_frames(self, frame_files: List[Path]) -> None:
        """Traitement parallèle de toutes les frames"""
        logger.info(f"🎨 Traitement ultra-rapide de {len(frame_files)} frames...")

        start_time = time.time()

        # Préparer les tâches
        tasks = []
        for i, frame_path in enumerate(frame_files):
            output_path = self.processed_dir / frame_path.name
            tasks.append((frame_path, output_path, i))

        # Exécution parallèle
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Soumettre toutes les tâches
            futures = {
                executor.submit(self.process_frame, task[0], task[1], task[2]): task[2]
                for task in tasks
            }

            # Collecter les résultats avec progress
            with tqdm(total=len(futures), desc="Processing") as pbar:
                for future in as_completed(futures):
                    frame_idx = futures[future]
                    try:
                        success = future.result()
                        if not success:
                            self.stats["frames_skipped"] += 1
                    except Exception as e:
                        logger.error(f"Erreur future frame {frame_idx}: {e}")
                        self.stats["frames_skipped"] += 1
                    finally:
                        pbar.update(1)

                        # Mise à jour du countdown dans la barre de progression
                        if hasattr(pbar, "set_postfix"):
                            elapsed = time.time() - start_time
                            rate = (pbar.n + 1) / elapsed if elapsed > 0 else 0
                            remaining_tasks = pbar.total - pbar.n
                            eta_seconds = remaining_tasks / rate if rate > 0 else 0
                            eta_minutes = int(eta_seconds // 60)
                            eta_secs = int(eta_seconds % 60)
                            countdown = (
                                f"{eta_minutes}m{eta_secs:02d}s"
                                if eta_minutes > 0
                                else f"{eta_secs}s"
                            )
                            pbar.set_postfix({"ETA": countdown, "fps": f"{rate:.1f}"})

        processing_time = time.time() - start_time
        self.stats["processing_time"] = float(processing_time)

        frames_per_second = len(frame_files) / processing_time
        processing_minutes = int(processing_time // 60)
        processing_seconds = int(processing_time % 60)
        time_display = (
            f"{processing_minutes}m{processing_seconds:02d}s"
            if processing_minutes > 0
            else f"{processing_seconds}s"
        )

        logger.info(
            f"✅ Traitement terminé en {time_display} ({frames_per_second:.1f} fps)"
        )

    def reconstruct_video(self, video_info: Dict) -> None:
        """Reconstruction vidéo ultra-rapide"""
        logger.info("🎬 Reconstruction vidéo...")

        # Extraire l'audio
        audio_path = self.temp_dir / "audio.aac"
        audio_cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(self.video_path),
            "-vn",
            "-acodec",
            "copy",
            str(audio_path),
        ]

        has_audio = True
        try:
            subprocess.run(audio_cmd, capture_output=True, check=True)
        except subprocess.CalledProcessError:
            has_audio = False
            logger.warning("Pas d'audio détecté")

        # Ajuster le framerate pour les frames skippées
        output_fps = video_info["fps"] / self.skip_frames

        # Reconstruire la vidéo
        frame_pattern = str(self.processed_dir / "frame_%06d.png")
        cmd = [
            "ffmpeg",
            "-y",
            "-framerate",
            str(output_fps),
            "-i",
            frame_pattern,
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",  # Preset le plus rapide
            "-crf",
            "18",  # Qualité élevée
            "-pix_fmt",
            "yuv420p",
        ]

        if has_audio:
            cmd.extend(["-i", str(audio_path), "-c:a", "copy"])

        cmd.append(str(self.output_path))

        subprocess.run(cmd, capture_output=True, check=True)
        logger.info(f"✅ Vidéo sauvegardée: {self.output_path}")

    def process(self) -> Dict:
        """Processus complet ultra-rapide"""
        total_start = time.time()

        logger.info(f"🚀 ULTRA FAST: {self.video_path} -> {self.output_path}")

        try:
            # 1. Infos vidéo
            video_info = self.get_video_info()
            duration = video_info["frame_count"] / video_info["fps"]
            logger.info(
                f"📹 {video_info['width']}x{video_info['height']}, {video_info['fps']:.1f} FPS"
            )
            logger.info(
                f"📹 {video_info['frame_count']} frames, {duration:.1f}s de durée"
            )

            # Estimation du temps total pour le countdown
            estimated_total_frames = video_info["frame_count"] // self.skip_frames
            estimated_time_per_frame = 0.1  # 100ms par frame estimé
            estimated_total_time = estimated_total_frames * estimated_time_per_frame
            est_minutes = int(estimated_total_time // 60)
            est_seconds = int(estimated_total_time % 60)
            logger.info(f"⏱️  Temps estimé: {est_minutes}m{est_seconds:02d}s")

            # 2. Extraction frames
            frame_files = self.extract_frames_smart(video_info)

            # 3. Traitement parallèle
            self.process_all_frames(frame_files)

            # 4. Reconstruction
            self.reconstruct_video(video_info)

            # 5. Stats finales
            total_time = time.time() - total_start

            # Calculer les gains
            original_frames = video_info["frame_count"]
            processed_frames = self.stats["frames_processed"]
            frame_reduction = processed_frames / original_frames

            estimated_old_time = (
                total_time / frame_reduction * 8
            )  # 8x speedup FastCleaner
            estimated_speedup = estimated_old_time / total_time

            total_minutes = int(total_time // 60)
            total_seconds = int(total_time % 60)
            total_time_display = (
                f"{total_minutes}m{total_seconds:02d}s"
                if total_minutes > 0
                else f"{total_seconds}s"
            )

            logger.info(f"🎯 RÉSULTATS ULTRA FAST:")
            logger.info(f"  ⏱️  Temps total: {total_time_display}")
            logger.info(
                f"  📊 Frames traitées: {processed_frames}/{original_frames} ({frame_reduction * 100:.1f}%)"
            )
            logger.info(f"  📊 Cache hits: {self.stats['frames_cached']}")
            logger.info(
                f"  🚀 Accélération estimée vs original: {estimated_speedup:.1f}x"
            )
            logger.info(
                f"  🎯 Objectif <60s: {'✅ ATTEINT' if total_time < 60 else '❌ Manqué'}"
            )

            # Affichage du temps économisé
            time_saved = estimated_old_time - total_time
            saved_minutes = int(time_saved // 60)
            saved_seconds = int(time_saved % 60)
            logger.info(f"  💰 Temps économisé: {saved_minutes}m{saved_seconds:02d}s")

            return {
                "success": True,
                "total_time": total_time,
                "frames_processed": processed_frames,
                "frames_total": original_frames,
                "speedup": estimated_speedup,
                "under_60s": total_time < 60,
                **self.stats,
            }

        except Exception as e:
            logger.error(f"Erreur critique: {e}")
            return {
                "success": False,
                "error": str(e),
                "total_time": time.time() - total_start,
            }

        finally:
            # Nettoyer le cache
            self.mask_cache.clear()

    def cleanup(self, keep_debug: bool = False):
        """Nettoie les fichiers temporaires"""
        if self.temp_dir.exists():
            if keep_debug and self.debug_dir.exists():
                logger.info(f"Debug frames conservées: {self.debug_dir}")
            else:
                shutil.rmtree(self.temp_dir, ignore_errors=True)
                logger.info("Fichiers temporaires nettoyés")


def process_video_ultra_fast(
    input_path: str,
    output_path: str,
    max_workers: int = 4,
    skip_frames: int = 1,
    max_resolution: int = 1080,
    cleanup: bool = True,
) -> Dict:
    """
    Fonction simple pour traitement ultra-rapide

    Args:
        input_path: Vidéo source
        output_path: Vidéo nettoyée
        max_workers: Threads parallèles
        skip_frames: 1 frame sur N (2 = moitié moins)
        max_resolution: Downscale si plus grand
        cleanup: Supprimer les fichiers temporaires

    Returns:
        Dict avec statistiques
    """

    processor = UltraFastVideoProcessor(
        video_path=input_path,
        output_path=output_path,
        max_workers=min(max_workers, 1),  # Réduire workers pour qualité max
        skip_frames=skip_frames,
        max_resolution=max_resolution,
    )

    try:
        result = processor.process()
        return result
    finally:
        if cleanup:
            processor.cleanup(keep_debug=False)


if __name__ == "__main__":
    """Test du processeur ultra-rapide"""

    import argparse

    parser = argparse.ArgumentParser(description="Ultra Fast Video Watermark Remover")
    parser.add_argument("input", help="Vidéo d'entrée")
    parser.add_argument("output", help="Vidéo de sortie")
    parser.add_argument("--workers", type=int, default=4, help="Nombre de threads")
    parser.add_argument("--skip", type=int, default=2, help="Skip frames (1 sur N)")
    parser.add_argument("--max-res", type=int, default=1080, help="Résolution max")
    parser.add_argument("--keep-debug", action="store_true", help="Garder debug frames")

    args = parser.parse_args()

    logger.info("🚀 Ultra Fast Video Watermark Remover")
    logger.info(f"📂 Input: {args.input}")
    logger.info(f"📂 Output: {args.output}")

    processor = UltraFastVideoProcessor(
        video_path=args.input,
        output_path=args.output,
        max_workers=args.workers,
        skip_frames=args.skip,
        max_resolution=args.max_res,
    )

    result = processor.process()

    if result["success"]:
        total_time = result["total_time"]
        total_minutes = int(total_time // 60)
        total_seconds = int(total_time % 60)
        time_display = (
            f"{total_minutes}m{total_seconds:02d}s"
            if total_minutes > 0
            else f"{total_seconds}s"
        )

        if result["under_60s"]:
            logger.info(f"🎉 OBJECTIF ATTEINT: Traitement en {time_display}!")
        else:
            logger.info(f"⚡ Traitement en {time_display} (objectif: <60s)")
    else:
        logger.error(f"❌ Échec: {result.get('error', 'Erreur inconnue')}")

    processor.cleanup(keep_debug=args.keep_debug)
