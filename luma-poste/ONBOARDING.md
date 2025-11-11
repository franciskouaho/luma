# 🎯 Système d'Onboarding LumaPost

Documentation du flow d'onboarding après connexion, style OnePost avec les couleurs LumaPost.

## 📋 Vue d'ensemble

Le système d'onboarding guide les nouveaux utilisateurs à travers 2 étapes essentielles après leur première connexion :

1. **Étape 1** : Création du workspace (nom, type, fuseau horaire)
2. **Étape 2** : Choix du plan tarifaire (Starter, Pro, Premium)

## 🔄 Flow utilisateur

```
Connexion → Vérification onboarding → Onboarding (si pas complété) → Dashboard
```

### Si onboarding complété
```
/auth → Connexion → /dashboard
```

### Si onboarding non complété
```
/auth → Connexion → /onboarding → Compléter → /dashboard
```

## 🏗️ Architecture

### Composants créés

#### 1. Page Onboarding
**Fichier** : `src/app/onboarding/page.tsx`

**Fonctionnalités** :
- ✅ 2 étapes avec barre de progression
- ✅ Étape 1 : Workspace (nom, type, fuseau horaire)
- ✅ Étape 2 : Plans tarifaires (Starter/Pro/Premium)
- ✅ Navigation Précédent/Continuer
- ✅ Validation des données
- ✅ Sauvegarde dans Firestore
- ✅ Redirection automatique vers dashboard après

#### 2. Hook useOnboarding
**Fichier** : `src/hooks/use-onboarding.ts`

**Fonctionnalités** :
- ✅ Vérifie si l'utilisateur a complété l'onboarding
- ✅ Lit le status depuis Firestore (`users/{userId}`)
- ✅ Retourne : `{ onboardingCompleted, loading, user }`

#### 3. OnboardingGuard Component
**Fichier** : `src/components/auth/onboarding-guard.tsx`

**Fonctionnalités** :
- ✅ Protège les routes du dashboard
- ✅ Redirige vers `/onboarding` si pas complété
- ✅ Affiche un loader pendant la vérification
- ✅ Intégré dans `dashboard/layout.tsx`

## 📊 Structure Firestore

### Collection `users`

```typescript
{
  uid: string,
  onboardingCompleted: boolean,    // true après l'onboarding
  workspaceId: string,              // ID du workspace créé
  completedAt: Timestamp           // Date de complétion
}
```

### Collection `workspaces`

```typescript
{
  name: string,                    // Nom du workspace
  type: "Personel" | "Equipe" | "Agence",  // Type choisi
  timezone: string,                // Ex: "Paris (CET/CEST)"
  ownerId: string,                 // UID de l'utilisateur
  plan: "starter" | "professional" | "premium",  // Plan choisi
  createdAt: Timestamp,
  settings: {
    allowMemberInvites: boolean,
    requireApprovalForPosts: boolean,
    allowMemberAccountConnections: boolean
  }
}
```

## 🎨 Design

Le design est inspiré de OnePost avec :

### Couleurs
- **Primary** : `#9B6BFF` (Violet LumaPost)
- **Accent** : `#F97316` (Orange pour les CTA)
- **Success** : `#10B981` (Vert)
- **Text** : Gris (900/700/600/500)

### Étape 1 : Workspace
- Icône orange en haut
- Formulaire centré
- 3 champs : Nom, Type (dropdown), Fuseau horaire (dropdown)
- Détection automatique du fuseau horaire
- Progression : Étape 1 sur 2

### Étape 2 : Plans
- Toggle Mensuel/Annuel
- 3 cartes de pricing côte à côte
- Badge "Meilleure offre" sur le plan Pro
- Sélection au clic avec border violet
- Liste des features avec checkmarks violets
- Badge vert "Essai gratuit 7 jours"

## 🔒 Règles Firestore

### Permissions Users
```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Permissions Workspaces
```javascript
match /workspaces/{workspaceId} {
  // Création : si owner
  allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;

  // Lecture/Modification : si owner ou membre
  allow read, update, delete: if request.auth != null &&
    (resource.data.ownerId == request.auth.uid ||
     exists(/databases/$(database)/documents/workspaceMembers/$(workspaceId + '_' + request.auth.uid)));
}
```

## 🚀 Comment tester

### 1. Créer un nouveau compte

```bash
# Aller sur /auth
# S'inscrire avec un nouvel email
```

### 2. Vérifier la redirection

Après connexion, vous devez être automatiquement redirigé vers `/onboarding`

### 3. Compléter l'onboarding

**Étape 1** :
- Entrer un nom de workspace
- Choisir un type (Personnel/Équipe/Agence)
- Confirmer le fuseau horaire
- Cliquer sur "Continuer"

**Étape 2** :
- Choisir un plan (Starter, Pro, ou Premium)
- Cliquer sur "Continuer"

### 4. Vérifier dans Firestore

Console Firebase → Firestore :

**Collection `users`** :
```json
{
  "onboardingCompleted": true,
  "workspaceId": "USER_ID_default",
  "completedAt": "2025-01-11..."
}
```

**Collection `workspaces`** :
```json
{
  "name": "Mon Workspace",
  "type": "Personel",
  "timezone": "Paris (CET/CEST)",
  "plan": "professional",
  "ownerId": "USER_ID",
  ...
}
```

### 5. Vérifier la protection des routes

Essayer d'accéder à `/dashboard` :
- Si onboarding pas complété → Redirection vers `/onboarding`
- Si onboarding complété → Accès au dashboard

## 🔧 Personnalisation

### Modifier les types de workspace

`src/app/onboarding/page.tsx` :

```tsx
<select value={workspaceType} onChange={(e) => setWorkspaceType(e.target.value)}>
  <option value="Personel">Personnel</option>
  <option value="Equipe">Équipe</option>
  <option value="Agence">Agence</option>
  <option value="Autre">Autre</option>  {/* Nouveau type */}
</select>
```

### Ajouter des fuseaux horaires

```tsx
<option value="Dakar (GMT)">Dakar (GMT)</option>
<option value="Montreal (EST/EDT)">Montreal (EST/EDT)</option>
```

### Modifier les plans

Éditer la section "Étape 2" dans `/onboarding/page.tsx`

### Ajouter une étape

1. Incrémenter `totalSteps` de 2 à 3
2. Ajouter la logique dans `handleNextStep()`
3. Ajouter le JSX pour `currentStep === 3`

## 📝 Déploiement

### Déployer les règles Firestore

```bash
firebase deploy --only firestore:rules
```

### Tester avant production

1. Créer un compte de test
2. Compléter l'onboarding
3. Vérifier dans Firestore
4. Tester les redirections
5. Vérifier la protection des routes

## 🐛 Troubleshooting

### L'utilisateur est bloqué en boucle sur /onboarding

**Cause** : Le document user n'a pas été créé ou `onboardingCompleted` n'est pas à `true`

**Solution** :
```bash
# Dans Firebase Console
# Aller dans Firestore → users → [user_id]
# Vérifier que onboardingCompleted = true
```

### Redirection infinie entre /dashboard et /onboarding

**Cause** : Race condition dans useOnboarding

**Solution** : Vérifier les logs console, s'assurer que le hook retourne correctement les données

### Les règles Firestore bloquent la création du workspace

**Cause** : Permissions insuffisantes

**Solution** :
```bash
# Déployer les règles mises à jour
firebase deploy --only firestore:rules
```

## 🎯 Métriques à suivre

- Taux de complétion de l'onboarding
- Temps moyen pour compléter
- Plans les plus choisis
- Types de workspace les plus créés
- Abandons à chaque étape

## 📞 Support

Pour toute question :
- Documentation : `/docs/onboarding`
- Email : support@lumapost.fr

---

**Créé avec ❤️ pour LumaPost**
