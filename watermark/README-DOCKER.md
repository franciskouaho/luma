# 🐳 Lancement de watermark avec Docker

## Prérequis

- Docker installé
- Docker Compose installé (optionnel, mais recommandé)

## 🚀 Méthode 1 : Docker Compose (Recommandé)

### Lancer le service

```bash
cd watermark
docker-compose up -d
```

### Voir les logs

```bash
docker-compose logs -f
```

### Arrêter le service

```bash
docker-compose down
```

### Reconstruire l'image

```bash
docker-compose build --no-cache
docker-compose up -d
```

## 🚀 Méthode 2 : Docker classique

### Construire l'image

```bash
cd watermark
docker build -t watermark-service .
```

### Lancer le conteneur

```bash
docker run -d \
  --name watermark-service \
  -p 8000:8000 \
  -v $(pwd)/resources:/app/resources \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/output:/app/output \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/working_dir:/app/working_dir \
  watermark-service
```

### Voir les logs

```bash
docker logs -f watermark-service
```

### Arrêter le conteneur

```bash
docker stop watermark-service
docker rm watermark-service
```

## 📡 Utilisation

Une fois le service lancé, l'API est disponible sur :

- **URL** : `http://localhost:8000`
- **Documentation API** : `http://localhost:8000/docs` (si FastAPI docs activés)

### Endpoints disponibles

- `POST /submit_remove_task` - Soumettre une vidéo pour traitement
- `GET /get_results?remove_task_id={task_id}` - Obtenir le statut d'une tâche
- `GET /download/{task_id}` - Télécharger la vidéo traitée

## 🔧 Configuration

### Port

Le port par défaut est **8000**. Pour le changer :

1. Modifier `start_server.py` (ligne 12)
2. Modifier `docker-compose.yml` (ligne 9) : `"NOUVEAU_PORT:8000"`

### GPU (Optionnel)

Pour utiliser le GPU, décommentez les lignes dans `docker-compose.yml` :

```yaml
deploy:
  resources:
    reservations:
      devices:
        - driver: nvidia
          count: 1
          capabilities: [gpu]
```

Et installez [nvidia-container-toolkit](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html).

## 📁 Volumes

Les volumes montés permettent de :
- **resources/** : Stocker les modèles YOLO et autres ressources
- **data/** : Stocker les vidéos uploadées
- **output/** : Stocker les vidéos traitées
- **logs/** : Stocker les logs du service
- **working_dir/** : Répertoire de travail temporaire

## 🐛 Dépannage

### Vérifier que le conteneur tourne

```bash
docker ps | grep watermark
```

### Accéder au shell du conteneur

```bash
docker exec -it watermark-service bash
```

### Vérifier les logs d'erreur

```bash
docker-compose logs watermark
```

### Reconstruire depuis zéro

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

