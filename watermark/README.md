# SoraWatermarkCleaner

## Installation locale (uv)

```bash
uv sync
source .venv/bin/activate
uv run python start_server.py --host 0.0.0.0 --port 8000
```

L’API FastAPI est alors disponible sur `http://localhost:8000`.

## Intégration Next.js

Dans ton application Next, configure l’URL de l’API (par exemple via `.env.local`) :

```bash
NEXT_PUBLIC_WATERMARK_API_URL=http://localhost:8000
```

Le composant `src/app/dashboard/ai-tools/page.tsx` consomme directement l’API (`/submit_remove_task`, `/get_results`, `/download/{id}`).

### CORS

Par défaut, toutes les origines sont autorisées. Ajuste la variable d’environnement côté serveur si besoin :

```bash
SORA_ALLOWED_ORIGINS=http://localhost:3000,https://ton-domaine.com
```

## Docker (CPU par défaut)

```bash
docker build -t sorawatermarkcleaner .
docker run --rm -p 8000:8000 \
  -v "$(pwd)/outputs:/app/outputs" \
  -v "$(pwd)/resources:/app/resources" \
  -v "${HOME}/.cache/sorawm:/root/.cache" \
  -e SORA_WORKER_CONCURRENCY=2 \
  sorawatermarkcleaner
```

- `/app/resources` et `/root/.cache` sont déclarés comme volumes pour conserver les poids téléchargés (YOLO, LAMA, etc.).
- L’API écoute sur le port `8000`.

## Accélération GPU

1. Construire l’image avec les roues PyTorch CUDA :

```bash
docker build -t sorawatermarkcleaner-gpu \
  --build-arg TORCH_CUDA_SUFFIX=+cu124 \
  --build-arg TORCH_CUDA_INDEX_URL=https://download.pytorch.org/whl/cu124 \
  .
```

2. Lancer le conteneur avec accès GPU (NVIDIA Container Toolkit requis) :

```bash
docker run --rm --gpus all -p 8000:8000 \
  -v "$(pwd)/outputs:/app/outputs" \
  -v "$(pwd)/resources:/app/resources" \
  -v "${HOME}/.cache/sorawm:/root/.cache" \
  sorawatermarkcleaner-gpu
```

## Configuration de la concurrence

Le serveur peut traiter plusieurs vidéos en parallèle. Utilise la variable d’environnement `SORA_WORKER_CONCURRENCY` pour définir le nombre de traitements simultanés (par défaut : 2 en mode Docker Compose).

```bash
SORA_WORKER_CONCURRENCY=4 uv run python start_server.py --host 0.0.0.0 --port 8000
```

## CLI batch

```bash
uv run python cli.py -i /chemin/vers/input -o /chemin/vers/output
```
