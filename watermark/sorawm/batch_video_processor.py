#!/usr/bin/env python3
"""
Batch Video Processor - Traitement de 20 vidéos en parallèle
Optimisé pour traiter plusieurs vidéos simultanément avec gestion intelligente des ressources
"""

import json
import queue
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Callable, Dict, List, Optional

from loguru import logger
from tqdm import tqdm

from sorawm.ultra_fast_video import process_video_ultra_fast


class BatchVideoProcessor:
    """
    Processeur de vidéos en batch ultra-rapide

    Capacités:
    - 20 vidéos en parallèle
    - Gestion intelligente de la mémoire
    - Priorisation des tâches
    - Monitoring en temps réel
    """

    def __init__(
        self,
        max_concurrent_videos: int = 20,
        max_workers_per_video: int = 2,
        temp_base_dir: str = "tmp_batch_processing",
        progress_callback: Optional[Callable] = None,
    ):
        """
        Args:
            max_concurrent_videos: Nombre max de vidéos traitées simultanément
            max_workers_per_video: Workers par vidéo (réduit pour éviter surcharge)
            temp_base_dir: Dossier de base pour les fichiers temporaires
            progress_callback: Callback pour mise à jour du progrès
        """
        self.max_concurrent = max_concurrent_videos
        self.workers_per_video = max_workers_per_video
        self.temp_base_dir = Path(temp_base_dir)
        self.temp_base_dir.mkdir(exist_ok=True, parents=True)
        self.progress_callback = progress_callback

        # File d'attente des tâches
        self.task_queue = queue.Queue()
        self.completed_tasks = queue.Queue()

        # Statistiques globales
        self.stats = {
            "total_videos": 0,
            "completed_videos": 0,
            "failed_videos": 0,
            "total_processing_time": 0.0,
            "average_time_per_video": 0.0,
            "concurrent_peak": 0,
            "throughput_videos_per_minute": 0.0,
        }

        # Lock pour thread safety
        self.stats_lock = threading.Lock()

        logger.info(f"BatchVideoProcessor initialisé:")
        logger.info(f"  📹 Max vidéos simultanées: {max_concurrent_videos}")
        logger.info(f"  ⚡ Workers par vidéo: {max_workers_per_video}")
        logger.info(f"  📁 Dossier temporaire: {temp_base_dir}")

    def add_video(
        self,
        input_path: str,
        output_path: str,
        priority: int = 1,
        metadata: Optional[Dict] = None,
    ) -> str:
        """
        Ajoute une vidéo à la file d'attente

        Args:
            input_path: Chemin vidéo source
            output_path: Chemin vidéo de sortie
            priority: Priorité (1=haute, 5=basse)
            metadata: Métadonnées additionnelles

        Returns:
            ID unique de la tâche
        """
        task_id = f"task_{int(time.time() * 1000)}_{len(self.task_queue.queue)}"

        task = {
            "id": task_id,
            "input_path": input_path,
            "output_path": output_path,
            "priority": priority,
            "metadata": metadata or {},
            "status": "QUEUED",
            "progress": 0,
            "start_time": None,
            "end_time": None,
            "error": None,
            "processing_time": 0.0,
        }

        self.task_queue.put((priority, task))

        with self.stats_lock:
            self.stats["total_videos"] += 1

        logger.info(
            f"➕ Vidéo ajoutée à la queue: {Path(input_path).name} (ID: {task_id})"
        )
        return task_id

    def add_videos_bulk(self, video_pairs: List[tuple], priority: int = 1) -> List[str]:
        """
        Ajoute plusieurs vidéos en une fois

        Args:
            video_pairs: Liste de tuples (input_path, output_path)
            priority: Priorité par défaut

        Returns:
            Liste des IDs des tâches
        """
        task_ids = []
        for input_path, output_path in video_pairs:
            task_id = self.add_video(input_path, output_path, priority)
            task_ids.append(task_id)

        logger.info(f"📦 {len(video_pairs)} vidéos ajoutées au batch")
        return task_ids

    def _process_single_video(self, task: Dict) -> Dict:
        """
        Traite une seule vidéo avec gestion d'erreurs

        Args:
            task: Dictionnaire de la tâche

        Returns:
            Tâche mise à jour avec résultats
        """
        task_id = task["id"]
        input_path = task["input_path"]
        output_path = task["output_path"]

        try:
            task["status"] = "PROCESSING"
            task["start_time"] = time.time()

            logger.info(f"🎬 Début traitement: {Path(input_path).name}")

            # Créer dossier temporaire unique pour cette tâche
            temp_dir = self.temp_base_dir / f"task_{task_id}"
            temp_dir.mkdir(exist_ok=True, parents=True)

            # Traiter la vidéo avec paramètres optimisés
            result = process_video_ultra_fast(
                input_path=input_path,
                output_path=output_path,
                max_workers=self.workers_per_video,
                skip_frames=1,  # Toutes les frames pour qualité maximale
                max_resolution=1080,
                cleanup=True,
            )

            task["end_time"] = time.time()
            task["processing_time"] = task["end_time"] - task["start_time"]

            if result.get("success", False):
                task["status"] = "COMPLETED"
                task["progress"] = 100
                task["result"] = result

                with self.stats_lock:
                    self.stats["completed_videos"] += 1
                    self.stats["total_processing_time"] += task["processing_time"]

                logger.info(
                    f"✅ Terminé: {Path(input_path).name} en {task['processing_time']:.1f}s"
                )
            else:
                raise Exception(result.get("error", "Erreur inconnue"))

        except Exception as e:
            task["status"] = "FAILED"
            task["error"] = str(e)
            task["end_time"] = time.time()
            task["processing_time"] = (
                task["end_time"] - task["start_time"] if task["start_time"] else 0
            )

            with self.stats_lock:
                self.stats["failed_videos"] += 1

            logger.error(f"❌ Échec: {Path(input_path).name} - {e}")

        finally:
            # Nettoyer le dossier temporaire
            temp_dir = self.temp_base_dir / f"task_{task_id}"
            if temp_dir.exists():
                import shutil

                shutil.rmtree(temp_dir, ignore_errors=True)

        return task

    def _update_progress(self, completed_tasks: List[Dict]):
        """Met à jour les statistiques et appelle le callback de progrès"""
        if not self.progress_callback:
            return

        total = self.stats["total_videos"]
        completed = len(completed_tasks)

        if total > 0:
            progress_percent = (completed / total) * 100

            # Calculer ETA
            if completed > 0:
                avg_time = (
                    sum(t.get("processing_time", 0) for t in completed_tasks)
                    / completed
                )
                remaining_videos = total - completed
                eta_seconds = remaining_videos * avg_time / self.max_concurrent
            else:
                eta_seconds = 0

            self.progress_callback(
                {
                    "progress": progress_percent,
                    "completed": completed,
                    "total": total,
                    "failed": self.stats["failed_videos"],
                    "eta_seconds": eta_seconds,
                    "concurrent_active": min(self.max_concurrent, total - completed),
                }
            )

    def process_all(self) -> Dict:
        """
        Traite toutes les vidéos en parallèle

        Returns:
            Statistiques finales du traitement
        """
        if self.task_queue.empty():
            logger.warning("Aucune vidéo dans la queue")
            return self.get_stats()

        start_time = time.time()
        logger.info(f"🚀 DÉBUT TRAITEMENT BATCH: {self.stats['total_videos']} vidéos")

        # Convertir la queue en liste triée par priorité
        tasks = []
        while not self.task_queue.empty():
            priority, task = self.task_queue.get()
            tasks.append(task)

        # Trier par priorité (1 = haute priorité)
        tasks.sort(key=lambda x: x["priority"])

        completed_tasks = []
        active_tasks = []

        # Utiliser ThreadPoolExecutor pour gérer le parallélisme
        with ThreadPoolExecutor(max_workers=self.max_concurrent) as executor:
            # Soumettre les premières tâches
            future_to_task = {}

            for i, task in enumerate(tasks):
                if len(future_to_task) < self.max_concurrent:
                    future = executor.submit(self._process_single_video, task)
                    future_to_task[future] = task
                    active_tasks.append(task)
                else:
                    break

            # Index pour les tâches restantes
            next_task_index = len(future_to_task)

            # Traiter les résultats au fur et à mesure
            with tqdm(total=len(tasks), desc="🎬 Traitement batch") as pbar:
                while future_to_task:
                    # Attendre qu'une tâche se termine
                    for future in as_completed(future_to_task):
                        completed_task = future.result()
                        completed_tasks.append(completed_task)

                        # Retirer de la liste active
                        if completed_task in active_tasks:
                            active_tasks.remove(completed_task)

                        # Mettre à jour la barre de progression
                        pbar.update(1)
                        pbar.set_postfix(
                            {
                                "✅": len(
                                    [
                                        t
                                        for t in completed_tasks
                                        if t["status"] == "COMPLETED"
                                    ]
                                ),
                                "❌": len(
                                    [
                                        t
                                        for t in completed_tasks
                                        if t["status"] == "FAILED"
                                    ]
                                ),
                                "🔄": len(active_tasks),
                            }
                        )

                        # Supprimer cette future
                        del future_to_task[future]

                        # Ajouter une nouvelle tâche si il en reste
                        if next_task_index < len(tasks):
                            next_task = tasks[next_task_index]
                            new_future = executor.submit(
                                self._process_single_video, next_task
                            )
                            future_to_task[new_future] = next_task
                            active_tasks.append(next_task)
                            next_task_index += 1

                        # Mettre à jour le progrès
                        self._update_progress(completed_tasks)

                        # Une seule itération par future complétée
                        break

        # Calcul des statistiques finales
        total_time = time.time() - start_time
        successful_tasks = [t for t in completed_tasks if t["status"] == "COMPLETED"]
        failed_tasks = [t for t in completed_tasks if t["status"] == "FAILED"]

        with self.stats_lock:
            self.stats["total_processing_time"] = total_time
            if len(successful_tasks) > 0:
                self.stats["average_time_per_video"] = sum(
                    t["processing_time"] for t in successful_tasks
                ) / len(successful_tasks)
            self.stats["throughput_videos_per_minute"] = (
                len(successful_tasks) / total_time
            ) * 60
            self.stats["concurrent_peak"] = min(self.max_concurrent, len(tasks))

        # Rapport final
        logger.info("🎯 TRAITEMENT BATCH TERMINÉ:")
        logger.info(f"  ⏱️  Temps total: {total_time:.1f}s")
        logger.info(f"  ✅ Succès: {len(successful_tasks)}/{len(tasks)}")
        logger.info(f"  ❌ Échecs: {len(failed_tasks)}")
        logger.info(
            f"  📊 Débit: {self.stats['throughput_videos_per_minute']:.1f} vidéos/minute"
        )
        logger.info(
            f"  ⚡ Temps moyen par vidéo: {self.stats['average_time_per_video']:.1f}s"
        )

        if failed_tasks:
            logger.warning("❌ ÉCHECS DÉTECTÉS:")
            for task in failed_tasks:
                logger.warning(f"  - {Path(task['input_path']).name}: {task['error']}")

        return {
            "success": len(failed_tasks) == 0,
            "completed_tasks": successful_tasks,
            "failed_tasks": failed_tasks,
            "stats": self.get_stats(),
        }

    def get_stats(self) -> Dict:
        """Retourne les statistiques actuelles"""
        with self.stats_lock:
            return self.stats.copy()

    def save_results(self, output_path: str, results: Dict):
        """Sauvegarde les résultats du batch dans un fichier JSON"""
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, default=str)
        logger.info(f"📄 Résultats sauvés: {output_path}")


def process_videos_batch(
    video_pairs: List[tuple],
    max_concurrent: int = 20,
    workers_per_video: int = 2,
    progress_callback: Optional[Callable] = None,
) -> Dict:
    """
    Fonction utilitaire pour traiter un batch de vidéos

    Args:
        video_pairs: Liste de tuples (input_path, output_path)
        max_concurrent: Nombre max de vidéos simultanées
        workers_per_video: Workers par vidéo
        progress_callback: Callback de progrès

    Returns:
        Résultats du traitement
    """
    processor = BatchVideoProcessor(
        max_concurrent_videos=max_concurrent,
        max_workers_per_video=workers_per_video,
        progress_callback=progress_callback,
    )

    # Ajouter toutes les vidéos
    processor.add_videos_bulk(video_pairs)

    # Traiter le batch
    return processor.process_all()


if __name__ == "__main__":
    """Test du processeur batch"""
    import argparse

    parser = argparse.ArgumentParser(description="Batch Video Watermark Remover")
    parser.add_argument("--input-dir", required=True, help="Dossier des vidéos sources")
    parser.add_argument("--output-dir", required=True, help="Dossier de sortie")
    parser.add_argument("--concurrent", type=int, default=20, help="Vidéos simultanées")
    parser.add_argument("--workers", type=int, default=2, help="Workers par vidéo")
    parser.add_argument("--pattern", default="*.mp4", help="Pattern des fichiers")

    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Trouver toutes les vidéos
    video_files = list(input_dir.glob(args.pattern))
    if not video_files:
        logger.error(
            f"Aucune vidéo trouvée dans {input_dir} avec pattern {args.pattern}"
        )
        exit(1)

    # Créer les paires input/output
    video_pairs = []
    for video_file in video_files:
        output_file = output_dir / f"cleaned_{video_file.name}"
        video_pairs.append((str(video_file), str(output_file)))

    logger.info(f"🎬 Traitement batch: {len(video_pairs)} vidéos")
    logger.info(f"📁 Source: {input_dir}")
    logger.info(f"📁 Destination: {output_dir}")

    # Callback de progrès simple
    def progress_callback(info):
        logger.info(
            f"📊 Progrès: {info['progress']:.1f}% ({info['completed']}/{info['total']}) - "
            f"ETA: {info['eta_seconds']:.0f}s - Actifs: {info['concurrent_active']}"
        )

    # Traiter le batch
    start_time = time.time()
    results = process_videos_batch(
        video_pairs,
        max_concurrent=args.concurrent,
        workers_per_video=args.workers,
        progress_callback=progress_callback,
    )

    total_time = time.time() - start_time

    # Sauvegarder les résultats
    results_file = output_dir / "batch_results.json"
    processor = BatchVideoProcessor()
    processor.save_results(str(results_file), results)

    # Rapport final
    successful = len(results["completed_tasks"])
    failed = len(results["failed_tasks"])
    total = successful + failed

    print(f"\n🎯 RAPPORT FINAL:")
    print(f"⏱️  Temps total: {total_time:.1f}s")
    print(f"✅ Succès: {successful}/{total} ({successful / total * 100:.1f}%)")
    print(f"❌ Échecs: {failed}")
    print(
        f"📊 Débit: {results['stats']['throughput_videos_per_minute']:.1f} vidéos/minute"
    )

    if successful > 0:
        print(f"🚀 PERFORMANCE: {20} vidéos traitées simultanément!")
        print(
            f"⚡ Temps moyen: {results['stats']['average_time_per_video']:.1f}s par vidéo"
        )
