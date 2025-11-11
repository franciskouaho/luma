# 🚀 Système Waitlist LumaPost

Ce document explique comment utiliser le système de waitlist et basculer entre la landing page et la page d'inscription waitlist.

## ⚙️ Configuration

Le système utilise un fichier de configuration central : `src/lib/config.ts`

```typescript
export const APP_CONFIG = {
  // Mettre à true pour afficher la waitlist, false pour la landing page
  showWaitlist: true,

  // Informations de la waitlist
  waitlist: {
    signupsCount: 127, // Nombre d'inscrits (à mettre à jour)
    launchDate: "Janvier 2026", // Date de lancement prévue
  }
} as const;
```

## 🔄 Basculer entre Waitlist et Landing Page

### Afficher la Waitlist

Éditer `src/lib/config.ts` :

```typescript
showWaitlist: true  // ✅ Affiche la waitlist
```

### Afficher la Landing Page complète

Éditer `src/lib/config.ts` :

```typescript
showWaitlist: false  // ✅ Affiche la landing page
```

## 📊 Structure Firestore

### Collection `waitlist`

```typescript
{
  firstName: string,      // Prénom de l'inscrit
  email: string,          // Email (lowercase)
  createdAt: Timestamp,   // Date d'inscription
  source: string          // Source: "web", "mobile", etc.
}
```

## 🔒 Règles de sécurité Firestore

Les règles sont définies dans `firestore.rules` :

- **CREATE** : Ouvert à tous (même non authentifiés)
- **READ/UPDATE/DELETE** : Réservé aux admins (via Admin SDK)

```javascript
match /waitlist/{waitlistId} {
  allow create: if request.resource.data.keys().hasAll(['firstName', 'email', 'createdAt']) &&
                   request.resource.data.email.matches('.*@.*');
  allow read, update, delete: if false;
}
```

### Déployer les règles

```bash
firebase deploy --only firestore:rules
```

## 📝 Page Admin Waitlist

### Accès

URL : `/admin/waitlist`

**Authentification requise** : Vous devez être connecté pour accéder à cette page.

### Fonctionnalités

- Liste complète des inscriptions
- Tri par date (plus récent en premier)
- Export des données
- Filtrage par source

### Utilisation

1. Se connecter à l'application
2. Naviguer vers `/admin/waitlist`
3. Voir toutes les inscriptions avec :
   - Prénom
   - Email
   - Source
   - Date d'inscription

## 🎨 Design de la Waitlist

La page waitlist est inspirée de Qomment.io avec :

- ✅ Design centré et minimaliste
- ✅ Couleurs violet (#9B6BFF) de LumaPost
- ✅ Formulaire prénom + email
- ✅ Social proof (nombre d'inscrits)
- ✅ Mockup du produit
- ✅ Badges flottants
- ✅ Message de confirmation après inscription

## 🔧 API Routes

### POST /api/admin/waitlist

**Authentification** : Token Bearer requis

**Response** :
```json
{
  "success": true,
  "entries": [...],
  "count": 127
}
```

## 📱 Composants

### `<WaitlistPage />`

Composant principal de la waitlist :
- Localisation : `src/components/waitlist/waitlist-page.tsx`
- Gère le formulaire d'inscription
- Connexion Firebase pour sauvegarder les inscriptions
- Affichage de confirmation après inscription

## 🚀 Workflow de lancement

### Phase 1 : Waitlist (Actuelle)

```typescript
showWaitlist: true
```

- Collecter les emails
- Créer du buzz
- Valider l'intérêt

### Phase 2 : Lancement

```typescript
showWaitlist: false
```

- Afficher la landing page complète
- Permettre les inscriptions
- Accès complet à l'application

## 📧 Export des emails

Pour exporter les emails de la waitlist, utiliser Firebase Console :

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionner votre projet
3. Cloud Firestore → Collection `waitlist`
4. Exporter les données

Ou utiliser le script Node.js (à créer) :

```bash
node scripts/export-waitlist.js > waitlist-export.csv
```

## 🎯 Métriques à suivre

- Nombre total d'inscriptions
- Taux de conversion (visiteurs → inscrits)
- Source des inscriptions (web, mobile, etc.)
- Progression quotidienne
- Emails uniques vs doublons

## 🛠️ Commandes utiles

```bash
# Démarrer le serveur de développement
npm run dev

# Déployer les règles Firestore
firebase deploy --only firestore:rules

# Voir les logs Firebase
firebase functions:log

# Backup Firestore
gcloud firestore export gs://[BUCKET_NAME]
```

## 📞 Support

Pour toute question sur le système waitlist :
- Email : support@lumapost.fr
- Documentation : `/docs/waitlist`

---

**Créé avec ❤️ pour LumaPost**
