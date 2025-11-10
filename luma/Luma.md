# 📱 Luma – Assistant de Contenu TikTok

**Luma** est l'outil ultime pour les créateurs TikTok qui veulent améliorer leur contenu et gagner un temps précieux.

De l'analyse de profil à la génération automatique de scripts, Luma vous aide à grandir plus intelligemment et plus rapidement sur TikTok.

---

## 🎨 Charte Graphique

### Typographie

- **Police principale** : _Inter_ (sans-serif moderne)
- **Styles** : Regular, Medium, Bold, Extra Bold

### Palette de Couleurs

#### Couleurs Primaires

- **Rose Vif** : `#FC2652` - Actions principales, CTA
- **Noir Profond** : `#1E1E1E` - Backgrounds, texte principal
- **Orange** : `#FF9800` - Accents secondaires

#### Couleurs Secondaires

- **Blanc** : `#FFFFFF` - Texte sur fond sombre
- **Gris Clair** : `#E0E0E0` - Boutons secondaires
- **Gris Moyen** : `#888888` - Texte secondaire

#### Dégradés

- **Gradient Principal** :

```css
  linear-gradient(135deg, #00ACC1 0%, #5E7CE2 50%, #D946A6 100%)
```

Turquoise → Bleu → Rose magenta

### Composants UI

- **Boutons** : Coins arrondis (border-radius: 24px)
- **Cards** : Fond sombre avec bordures subtiles
- **Icônes** : Style minimaliste, monochrome

---

## ✨ Que Pouvez-Vous Faire Avec Luma ?

Avec Luma, vous pouvez :

- **Analyser votre profil TikTok** pour détecter vos forces et opportunités de croissance

- **Générer des idées de contenu** adaptées à votre audience et votre niche

- **Créer automatiquement des scripts vidéo** prêts à filmer

- **Sauvegarder et organiser vos idées** pour vos futurs contenus

Dites adieu au blocage créatif et bonjour à la création intelligente.

**Commencez à développer votre audience TikTok dès aujourd'hui avec Luma AI.** 🚀

---

## 🔧 Stack Technique

- **Mobile** : React Native + Expo + TypeScript
- **Backend** : Firebase (Auth, Firestore, Functions, Storage)
- **IA** : Llama (via Cloud Function sécurisée)
- **Gestion d'état** : Zustand ou React Query
- **Authentification** : Google Sign-In & Apple Sign-In

---

## 🧠 Fonctionnalités MVP

1. 🔐 Authentification rapide (Google / Apple)
2. 📊 Analyse de profil TikTok (forces & opportunités)
3. 🎯 Génération d'idées de contenu par IA
4. ✍️ Hooks & scripts vidéo auto-formatés
5. 💾 Sauvegarde et organisation de vos idées dans Firestore
6. 📋 Consultation de l'historique de vos idées

---

## 📁 Structure du Projet

```bash
.
├─ app/
│  ├─ _layout.tsx          # Navigation principale (Expo Router)
│  ├─ index.tsx            # Écran d'accueil
│  ├─ auth/
│  │   └─ login.tsx        # Connexion (Google / Apple)
│  └─ tiktok/
│      ├─ generate.tsx     # Génération d'idées + appel IA
│      ├─ ideas.tsx        # Liste des idées sauvegardées
│      ├─ analytics.tsx    # Analyse de profil
│      └─ profile.tsx      # Profil utilisateur
├─ src/
│  ├─ lib/
│  │   ├─ firebase.ts      # Initialisation Firebase
│  │   └─ functions.ts     # Appels Cloud Functions
│  ├─ store/
│  │   └─ ideasStore.ts    # Gestion d'état des idées
│  ├─ theme/
│  │   └─ colors.ts        # Palette de couleurs
│  └─ types/
│      └─ tiktok.ts
├─ functions/
│  ├─ src/
│  │   ├─ index.ts         # Cloud Functions
│  │   └─ llama.ts         # Intégration Llama AI
│  └─ package.json
├─ assets/
│  └─ fonts/
│      └─ Inter/           # Police Inter
├─ .env.local
├─ package.json
└─ README.md
```

---

## 🧭 Navigation

### 📱 Écrans Principaux

- **Accueil** (`/`) : Page d'accueil et présentation de l'app
- **Générer** (`/tiktok/generate`) : Génération d'idées par IA
- **Idées** (`/tiktok/ideas`) : Consultation des idées sauvegardées
- **Analytics** (`/tiktok/analytics`) : Analyse de profil & insights
- **Profil** (`/tiktok/profile`) : Paramètres utilisateur

### 🔐 Authentification

- **Connexion** (`/auth/login`) : Connexion rapide avec Google ou Apple

---

## 🚀 Installation et Démarrage

### Prérequis

- Node.js 18+
- Expo CLI
- Compte Firebase
- Credentials Google OAuth & Apple Sign In

### Installation

```bash
npm install
npx expo install expo-auth-session expo-apple-authentication expo-crypto
```

### Configuration Firebase

Créez un fichier `.env.local` :

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your_ios_client_id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your_android_client_id
```

### Configuration des Couleurs

Créez `src/theme/colors.ts` :

```typescript
export const colors = {
  primary: "#FC2652", // Rose vif
  secondary: "#FF9800", // Orange
  background: "#1E1E1E", // Noir profond
  text: "#FFFFFF", // Blanc
  textSecondary: "#888888", // Gris
  buttonSecondary: "#E0E0E0",
  gradient: {
    start: "#00ACC1", // Turquoise
    middle: "#5E7CE2", // Bleu
    end: "#D946A6", // Rose magenta
  },
};
```

### Lancer l'Application

```bash
npx expo start
```

---

## 📝 Comment Ça Marche

1. **Connectez-vous** avec Google ou Apple en un clic
2. **Analysez votre profil TikTok** pour découvrir des opportunités d'optimisation
3. **Générez des idées de contenu** en décrivant votre niche et votre audience
4. **Obtenez des scripts prêts à l'emploi** avec des hooks et des storylines engageantes
5. **Sauvegardez vos favoris** et accédez-y à tout moment dans votre bibliothèque d'idées

---

## 🔮 Prochainement

- [ ] Calendrier de contenu & planificateur
- [ ] Export des scripts en PDF
- [ ] Suggestions de hashtags tendances
- [ ] Suivi des performances vidéo
- [ ] Support multilingue

---

## 📄 Licence

MIT

---

**Fait avec ❤️ pour les créateurs TikTok**
