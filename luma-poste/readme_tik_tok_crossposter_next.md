# TikTok Crossposter (Next.js + Firebase)

MVP pour planifier et publier automatiquement des vidéos TikTok sur plusieurs comptes **TikTok Business** via **Next.js + Firebase/GCP**.

---

## 🎯 Objectif

- Upload direct des vidéos depuis le navigateur vers **Cloud Storage** (URL signées)
- Connexion de plusieurs comptes **TikTok Business** (OAuth)
- **Planification** précise des posts avec **Cloud Tasks**
- Publication automatique via **Cloud Functions (Gen2)**
- Suivi des statuts (PENDING/QUEUED/POSTED/FAILED)

---

## 🧱 Stack

- **Frontend** : Next.js (App Router) + TypeScript, Tailwind, shadcn/ui
- **Backend** : Routes API Next.js + Cloud Functions (Gen2)
- **Data** : Firestore (NoSQL)
- **Files** : Cloud Storage (GCS)
- **Scheduling** : Cloud Tasks (+ Cloud Scheduler facultatif)
- **Auth Utilisateur** : Google Sign-In (Firebase Auth)
- **Secrets** : Secret Manager
- **Monitoring** : Cloud Logging

---

## 🗺️ Architecture

```
[Client Next.js]
  ├── Auth Google (Firebase Auth)
  ├── Upload → URL signée (WRITE) → [Cloud Storage]
  └── API Routes (App Router) ───────────────────────────┐
                                                         │
                                                    [Firestore]
                                                         │
   (scheduleTime)  [Cloud Tasks Queue] ── POST OIDC ──> [Cloud Function publishTikTok]
                                                         │
                                                     [TikTok API]
                                                         │
                                                 (URL TikTok + statut)
```

**Points clés Spark-friendly**

- **Aucune VM** : uniquement **Hosting**, **Firestore**, **Storage**, **Functions**, **Tasks**.
- **Pas de polling** : **Cloud Tasks** déclenche à l’heure exacte → évite les lectures Firestore inutiles.
- **Uploads directs** au bucket via **URL signées** → pas de transfert via Functions.
- **Auth Google** native Firebase → garde la simplicité et le quota gratuit.
- **Secrets** via Secret Manager (accès runtime par Functions).

---

## 📦 Arborescence (suggestion)

```
.
├─ app/
│  ├─ api/
│  │  ├─ upload/sign/route.ts        # URL signées Storage
│  │  ├─ schedules/route.ts          # Création planification + Cloud Task
│  │  └─ auth/tiktok/callback/route.ts
│  ├─ dashboard/
│  └─ page.tsx
├─ lib/
│  ├─ firebaseAdmin.ts               # Admin SDK
│  ├─ crypto.ts                      # chiffrement AES-256
│  └─ tiktok.ts                      # helpers client
├─ functions/src/
│  ├─ index.ts                       # export publishTikTok
│  ├─ publishTikTok.ts               # cœur de publication
│  ├─ tiktokApi.ts                   # wrappers upload/publish
│  └─ tiktokAuth.ts                  # refresh tokens, decrypt
├─ .env.local                        # variables Next.js
├─ firebase.json                     # config deploy
└─ README.md
```

---

## ✅ Pré-requis

- Compte **GCP/Firebase**
- Node 18+
- **TikTok Business Developer** (client_id/client_secret)

---

## 🚀 Mise en route

### 1) Créer / configurer le projet GCP

Active **Firestore**, **Cloud Storage**, **Cloud Functions (Gen2)**, **Cloud Tasks**, **Cloud Scheduler** (optionnel), **Secret Manager**.

```bash
gcloud services enable firestore.googleapis.com storage.googleapis.com \
  cloudfunctions.googleapis.com cloudtasks.googleapis.com \
  cloudscheduler.googleapis.com secretmanager.googleapis.com
```

Crée Firestore en mode **production** (région ex. `europe-west1`).

### 2) Bucket Storage

- Crée un bucket régional (ex. `gs://tiktok-crosspost-eu`)
- Désactive l’accès public, on utilise **URL signées**.

### 3) Queue Cloud Tasks

```bash
gcloud tasks queues create publish-queue --location=europe-west1 \
  --max-attempts=10 --max-backoff=600s --min-backoff=5s
```

### 4) Compte de service pour l’invocation

```bash
gcloud iam service-accounts create tasks-invoker \
  --display-name="Cloud Tasks Invoker"

# Rôle d’invocation des Cloud Functions
PROJECT_ID=$(gcloud config get-value project)
gcloud run services add-iam-policy-binding publishTikTok \
  --member=serviceAccount:tasks-invoker@${PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/run.invoker --region=europe-west1
```

> Si la fonction n’existe pas encore, ajoute le rôle après le premier déploiement.

### 5) Secrets

Stocke : `TIKTOK_CLIENT_ID`, `TIKTOK_CLIENT_SECRET`, `ENCRYPTION_KEY` (32 bytes base64), `BUCKET_NAME`.

```bash
firebase functions:secrets:set TIKTOK_CLIENT_ID
firebase functions:secrets:set TIKTOK_CLIENT_SECRET
firebase functions:secrets:set ENCRYPTION_KEY
firebase functions:secrets:set BUCKET_NAME
```

### 6) Variables d’environnement Next.js

`.env.local` (exemple) :

```
NEXT_PUBLIC_APP_URL=https://localhost:3000
GCP_PROJECT=your-project-id
GCP_LOCATION=europe-west1
TASK_QUEUE=publish-queue
PUBLISH_ENDPOINT=https://publish-tiktok-xxxxxxxx-ew.a.run.app
TASK_SA=tasks-invoker@your-project-id.iam.gserviceaccount.com
BUCKET_NAME=tiktok-crosspost-eu
TIKTOK_CLIENT_ID=...
TIKTOK_CLIENT_SECRET=...
OAUTH_REDIRECT_URI=https://your-domain.com/api/auth/tiktok/callback
ENCRYPTION_KEY=base64-32-bytes
```

---

## 🔐 Données (Firestore)

**Collections** :

- `accounts/{id}` — comptes TikTok connectés (tokens chiffrés)
- `videos/{id}` — métadonnées vidéo (chemin Storage, titre, caption)
- `schedules/{id}` — planifications

**Doc types** :

```jsonc
// accounts
{
  "userId": "uid",
  "platform": "tiktok",
  "tiktokUserId": "...",
  "accessTokenEnc": "...",
  "refreshTokenEnc": "...",
  "expiresAt": 1700000000,
  "createdAt": 1700000000,
  "updatedAt": 1700000000
}
```

```jsonc
// videos
{
  "userId": "uid",
  "storageKey": "uploads/uid/abc.mp4",
  "title": "Titre",
  "caption": "#tags",
  "durationSec": 23,
  "thumbnailKey": "thumbs/uid/abc.jpg",
  "createdAt": 1700000000
}
```

```jsonc
// schedules
{
  "videoId": "...",
  "accountId": "...",
  "scheduledAt": 1700000000,
  "status": "PENDING",
  "lastError": null,
  "createdAt": 1700000000
}
```

---

## 🔁 Flux de fonctionnement

### Résumé en 5 étapes (vision produit)

1. **Création de compte via Google** → l’utilisateur se connecte au SaaS avec **Google Sign-In** (Firebase Auth).
2. **Liaison TikTok Business** → l’utilisateur connecte son compte **TikTok Business** au SaaS via **OAuth**.
3. **Upload vidéo** (Next.js → URL signée **Cloud Storage**) + saisie **titre/hashtags**.
4. **Planification** → sélection des **comptes cibles** + **date/heure** → création des **schedules**.
5. **Publication & suivi** → le **worker** publie à l’heure, gère les **retries**, enregistre l’**URL TikTok** & le **statut**. **Tableau de bord** avec calendrier, statuts, filtres, et **re-tentatives en 1 clic**.

### A) Onboarding & Auth (Google + TikTok)

**Connexion SaaS :** l’utilisateur se connecte **simplement avec Google** (Firebase Auth → Google Sign-In).

**Lier TikTok Business :**

1. L’utilisateur clique « Connecter TikTok » dans le SaaS → page d’autorisation TikTok.
2. TikTok redirige vers `/api/auth/tiktok/callback?code=...&state=uid`.
3. Échange `code` ↔ `access_token` + `refresh_token`.
4. Chiffre et stocke les tokens dans `accounts`.

### B) Connexion compte TikTok (OAuth)

1. L’utilisateur clique « Connecter TikTok » → page d’autorisation TikTok
2. TikTok redirige vers `/api/auth/tiktok/callback?code=...&state=uid`
3. Échange `code` ↔ `access_token` + `refresh_token`
4. Chiffre et stocke les tokens dans `accounts`

### B) Upload vidéo

1. UI appelle `POST /api/upload/sign` avec `contentType` et `size`
2. Le serveur renvoie URL signée + `storageKey`
3. Le navigateur fait `PUT` de la vidéo vers **Cloud Storage** (direct, sans transiter par le serveur)

### C) Planification

1. UI appelle `POST /api/schedules` avec `{ videoId, accountId, scheduledAt }`
2. Le serveur crée un doc `schedules` et **enqueue** une **Cloud Task** avec `scheduleTime = scheduledAt`
3. Le statut du schedule passe `PENDING → QUEUED`

### D) Publication (Cloud Function)

1. À l’heure, Cloud Tasks fait un `POST` (OIDC) vers `publishTikTok`
2. La fonction :
   - charge `schedule`, `video`, `account`
   - déchiffre/refresh le token TikTok
   - récupère une URL **READ** signée pour la vidéo
   - **upload** la vidéo vers TikTok, puis **publish** avec titre/caption
   - met à jour `status: POSTED` (ou `FAILED` + `lastError`)

---

## 🔒 Sécurité

- **Tokens chiffrés** (AES-256-GCM) avant stockage Firestore
- **OIDC** entre Cloud Tasks et la Function (service account `tasks-invoker`)
- **Règles Firestore** : isolation par `userId`
- **Bucket privé** : uniquement via URLs signées (WRITE pour upload, READ éphémère pour la Function)
- Validation stricte des fichiers (MIME/size) côté serveur **et** client

**Exemple règles Firestore (à adapter)** :

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /accounts/{id} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /videos/{id} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /schedules/{id} {
      allow read, write: if request.auth != null; // et vérifier ownership côté serveur
    }
  }
}
```

---

## 🧩 Endpoints clés

- `POST /api/upload/sign` → génère URL signée (WRITE) pour Cloud Storage
- `POST /api/schedules` → crée doc + planifie Cloud Task
- `GET  /api/auth/tiktok/callback` → échange OAuth TikTok
- **Cloud Function** `publishTikTok` (HTTPS) → exécutée par Cloud Tasks

---

## 🧠 Best practices (coût, fiabilité, sécurité)

### Coût (Spark Plan)

- **Éviter le polling** : déclencher par **Cloud Tasks**, pas par cron minuté.
- **Compresser**/optimiser les vidéos en amont; limiter à **≤ 200 Mo** en MVP.
- **Stockage froid** : nettoyer les brouillons non utilisés via un job hebdo (Scheduler → Function) pour rester < 5 Go.
- **Batches Firestore** : regrouper écritures (statuts, logs) et éviter les updates fréquents.
- **Logs** : niveau `INFO` seulement; `DEBUG` en local (les logs comptent sur Functions).

### Fiabilité

- **Idempotence** : `publishTikTok` doit ignorer un même `scheduleId` déjà `POSTED`.
- **Retries** : activer backoff exponentiel dans la queue (5s → 10m) pour les 429/5xx TikTok.
- **Timezones** : stocker en **UTC** dans Firestore, convertir côté UI.
- **Validation stricte** : type MIME/poids/durée avant d’accepter l’upload.
- **Verrou léger** : empêcher deux publications concurrentes sur le même `scheduleId` (champ `lockedAt`).

### Sécurité

- **Tokens chiffrés** (AES-256-GCM) + rotation (refresh) automatique.
- **OIDC Cloud Tasks → Function** (service account dédié `tasks-invoker`).
- **Bucket privé** : READ/WRITE uniquement par URL signées courtes (≤ 15 min).
- **Règles Firestore** : ownership strict par `userId` + validations côté serveur.
- **Entrées utilisateur** : nettoyer les captions (XSS), échapper dans l’UI.

### Observabilité

- **Trace `scheduleId`** partout (logs, Firestore) pour remonter un incident.
- **Dashboard statuts** : filtres `FAILED` avec message d’erreur et bouton **Retry**.
- **Métriques** simples (compter POSTED/FAILED par jour) stockées dans Firestore.

### DX & perfs

- **Next.js App Router** + **React Server Components** sur les pages dashboard.
- **Cache** côté client avec React Query; invalidation après transitions (optimistic UI).
- **Cold starts** : Functions en **région unique** proche Storage/Firestore (ex. `europe-west1`).

---

## 🧪 Dev local

- Utilise les **Emulators** Firebase (Firestore/Functions) quand c’est possible
- Pour Cloud Tasks (non émulé officiellement), prévoir un **cron local** qui appelle l’endpoint de test, ou tester sur un projet GCP sandbox

---

## 🌐 Déploiement

1. Déployer la Function :

```bash
firebase deploy --only functions:publishTikTok
```

2. Récupérer l’URL HTTPS de la Function → mettre dans `PUBLISH_ENDPOINT`
3. Donner le rôle `run.invoker` au service account `tasks-invoker` sur la Function
4. Déployer Next.js (Vercel/Firebase Hosting) avec `.env` configuré

**Checklist Spark Plan**

- [ ] 1 région unique (`europe-west1`)
- [ ] Function mémoire 256–512 Mo, timeout 120s max
- [ ] Logs au strict nécessaire
- [ ] Nettoyage hebdo des fichiers orphelins
- [ ] Pas de tâches récurrentes minute → Tasks à l’heure exact

1. Déployer la Function :

```bash
firebase deploy --only functions:publishTikTok
```

2. Récupérer l’URL HTTPS de la Function → mettre dans `PUBLISH_ENDPOINT`
3. Donner le rôle `run.invoker` au service account `tasks-invoker` sur la Function
4. Déployer Next.js (Vercel/Firebase Hosting) avec `.env` configuré

---

## 💰 Coûts & quotas (ordre de grandeur MVP)

⚡ **Objectif : rester dans les limites du plan gratuit (Spark Plan Firebase)**

- Hébergement Next.js/Firebase Hosting : inclus (1 Go stockage / 10 Go transfert mois)
- Firestore : 1 GiB stockage + 50 000 lectures / 20 000 écritures / jour
- Cloud Storage : 5 Go gratuits / 1 Go téléchargement par jour
- Cloud Functions (Gen2) : 2 millions d’invocations, 400 000 Go‑s et 200 000 CPU‑s gratuits par mois
- Authentication : 10 000 connexions/mois gratuites (Google Sign‑In inclus)
- Cloud Tasks / Scheduler : facturation minimale (peut rester sous quelques centimes ou dans le quota gratuit selon usage)

> En gardant un volume modéré (ex. < 500 planifications/mois, vidéos < 200 Mo), le projet reste intégralement dans les **quotas gratuits Firebase**.

- Firestore : faible (documents légers)
- Storage : ~0,02–0,05 €/Go/mois + egress
- Cloud Functions : au nombre d’invocations + temps CPU/mémoire
- Cloud Tasks : très économique
- TikTok API : attention aux **rate-limits** (gérer retry/backoff)

---

## 🛠️ Dépannage

- **401/403 sur la Function** : vérifier le rôle `run.invoker` et l’OIDC de Cloud Tasks
- **Signature URL expirée** : durée trop courte → augmenter (ex. 15 min)
- **429 TikTok** : ajouter backoff exponentiel + retries Cloud Tasks
- **CORS upload** : configurer CORS du bucket GCS pour `PUT`
- **Horodatage** : travailler en **UTC** côté serveur, convertir côté UI

---

## 🗺️ Roadmap

- Support miniature personnalisée
- Multi-platform (YouTube Shorts, Reels)
- Webhooks TikTok (statuts, commentaires) si disponibles
- Tableau de bord analytics
- Transcodage/validation via Cloud Run Jobs + FFmpeg

---

## 📄 Licence

À définir (MIT par défaut recommandé pour un template).
