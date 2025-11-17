# Dockerfile pour watermark - Service IA de traitement vidéo
FROM python:3.12-slim

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

# Installer les dépendances système (FFmpeg, etc.)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Installer uv (gestionnaire de paquets Python rapide)
RUN pip install --no-cache-dir uv

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY pyproject.toml uv.lock ./

# Installer les dépendances Python avec uv
RUN uv sync --frozen --no-dev

# Copier le code source
COPY . .

# Créer les répertoires nécessaires
RUN mkdir -p resources output logs data working_dir

# Exposer le port 8000
EXPOSE 8000

# Commande par défaut
CMD ["uv", "run", "python", "start_server.py", "--host", "0.0.0.0", "--port", "8000"]

