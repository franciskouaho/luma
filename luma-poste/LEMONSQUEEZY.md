# 💳 Configuration Lemon Squeezy

Guide complet pour intégrer Lemon Squeezy comme système de paiement pour LumaPost.

## 📋 Prérequis

1. Compte Lemon Squeezy créé sur https://www.lemonsqueezy.com/
2. Store créé dans Lemon Squeezy
3. Produits et variants créés

## 🔧 Configuration Lemon Squeezy

### 1. Créer un Store

1. Va sur https://app.lemonsqueezy.com/
2. Clique sur **Settings** → **Stores**
3. Crée un nouveau store ou utilise ton store existant
4. Note le **Store ID** (tu en auras besoin)

### 2. Créer les Produits

Crée **3 produits** pour les 3 plans :

#### Plan Starter - €12,99/mois
1. Va dans **Products** → **New Product**
2. Nom : **LumaPost Starter**
3. Description : Base solide pour débuter sereinement
4. Prix : **€12,99** / mois
5. Type : **Subscription**
6. Note le **Variant ID** (commence par `variant_`)

#### Plan Pro - €29,99/mois
1. Crée un nouveau produit
2. Nom : **LumaPost Pro**
3. Description : Outils IA avancés pour les entreprises et équipes
4. Prix : **€29,99** / mois
5. Type : **Subscription**
6. Note le **Variant ID**

#### Plan Premium - €89,99/mois
1. Crée un nouveau produit
2. Nom : **LumaPost Premium**
3. Description : Tout illimité + priorités et SLA
4. Prix : **€89,99** / mois
5. Type : **Subscription**
6. Note le **Variant ID**

### 3. Obtenir l'API Key

1. Va dans **Settings** → **API**
2. Crée une nouvelle **API Key**
3. Copie la clé (elle ne sera affichée qu'une fois !)

### 4. Configurer les Webhooks

1. Va dans **Settings** → **Webhooks**
2. Clique sur **Add Endpoint**
3. URL : `https://ton-domaine.com/api/webhooks/lemonsqueezy`
4. Événements à sélectionner :
   - ✅ `order_created`
   - ✅ `subscription_created`
   - ✅ `subscription_updated`
   - ✅ `subscription_cancelled`
   - ✅ `subscription_expired`
5. Copie le **Signing Secret** (webhook secret)

## 🔐 Variables d'Environnement

Ajoute ces variables dans ton fichier `.env.local` :

```bash
# Lemon Squeezy Configuration
LEMONSQUEEZY_API_KEY=lsv1_xxxxxxxxxxxxxxxxxxxx
LEMONSQUEEZY_STORE_ID=12345
LEMONSQUEEZY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxx

# Variant IDs (publics - visibles côté client)
NEXT_PUBLIC_LS_STARTER_VARIANT_ID=123456
NEXT_PUBLIC_LS_PRO_VARIANT_ID=123457
NEXT_PUBLIC_LS_PREMIUM_VARIANT_ID=123458
```

### Comment trouver les IDs ?

**Store ID** :
- Dashboard Lemon Squeezy → Settings → Stores
- URL format : `https://app.lemonsqueezy.com/stores/{STORE_ID}`

**Variant IDs** :
- Produits → Clique sur un produit → Pricing
- Chaque variant a un ID visible dans l'URL ou dans les détails
- Format : `123456` (nombre uniquement)

## 🔄 Flow de Paiement

1. **Utilisateur complète l'onboarding** → Choisit un plan (Starter/Pro/Premium)
2. **App crée workspace** → Sauvegarde dans Firestore avec `paymentStatus: "pending"`
3. **App appelle `/api/checkout`** → Génère un checkout URL Lemon Squeezy
4. **Redirection vers Lemon Squeezy** → Utilisateur entre ses infos de paiement
5. **Paiement effectué** → Lemon Squeezy envoie un webhook `order_created`
6. **Webhook reçu** → App met à jour Firestore avec `paymentStatus: "paid"`
7. **Redirection vers dashboard** → Utilisateur accède à l'app

## 📊 Structure Firestore

### Collection `users/{userId}`
```json
{
  "onboardingCompleted": true,
  "subscriptionStatus": "active" | "pending" | "cancelled",
  "subscriptionId": "sub_xxxx",
  "plan": "starter" | "professional" | "premium",
  "workspaceId": "USER_ID_default",
  "completedAt": "2025-01-11T..."
}
```

### Collection `workspaces/{workspaceId}`
```json
{
  "name": "Mon Workspace",
  "type": "Personel" | "Equipe" | "Agence",
  "ownerId": "USER_ID",
  "plan": "starter" | "professional" | "premium",
  "paymentStatus": "pending" | "paid",
  "createdAt": "2025-01-11T..."
}
```

### Collection `subscriptions/{subscriptionId}`
```json
{
  "userId": "USER_ID",
  "plan": "professional",
  "status": "active",
  "variantId": "123457",
  "customerId": "cus_xxxx",
  "renewsAt": "2025-02-11T...",
  "endsAt": null,
  "createdAt": "2025-01-11T..."
}
```

## 🧪 Tester l'Intégration

### En Local

1. Installe ngrok pour exposer ton webhook :
```bash
ngrok http 3001
```

2. Copie l'URL ngrok (ex: `https://xxxx.ngrok.io`)

3. Configure le webhook dans Lemon Squeezy :
```
https://xxxx.ngrok.io/api/webhooks/lemonsqueezy
```

4. Lance l'app :
```bash
npm run dev
```

5. Teste l'onboarding :
- Crée un compte
- Complète l'étape 1 (workspace)
- Choisis un plan à l'étape 2
- Clique sur "Continuer"
- Tu seras redirigé vers Lemon Squeezy

6. Utilise une carte de test :
- Numéro : `4242 4242 4242 4242`
- Date : N'importe quelle date future
- CVC : N'importe quel 3 chiffres

### En Production

1. Configure l'URL de webhook avec ton domaine :
```
https://lumapost.fr/api/webhooks/lemonsqueezy
```

2. Vérifie que toutes les variables d'environnement sont configurées

3. Teste avec un vrai paiement

## 🔍 Débogage

### Vérifier les Webhooks

1. Va dans Lemon Squeezy → Settings → Webhooks
2. Clique sur ton endpoint
3. Onglet **Deliveries** pour voir tous les webhooks envoyés
4. Clique sur un delivery pour voir les détails et retry si nécessaire

### Logs

- Côté serveur : Vérifie les logs dans ta console Next.js
- Côté Lemon Squeezy : Vérifie les webhook deliveries

### Erreurs Courantes

**"Invalid signature"** :
- Vérifie que `LEMONSQUEEZY_WEBHOOK_SECRET` est correct
- Assure-toi d'utiliser le signing secret du webhook

**"No variant ID"** :
- Vérifie que les `NEXT_PUBLIC_LS_*_VARIANT_ID` sont corrects
- Les variant IDs doivent être des nombres

**Checkout ne se crée pas** :
- Vérifie `LEMONSQUEEZY_API_KEY`
- Vérifie `LEMONSQUEEZY_STORE_ID`
- Regarde les logs serveur pour plus de détails

## 🎨 Personnalisation

### Changer les URLs de Redirection

Dans `src/app/api/checkout/route.ts` :
```typescript
redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`
```

### Ajouter des Métadonnées Custom

Dans `src/app/api/checkout/route.ts` :
```typescript
custom: {
  user_id: userId,
  plan: plan,
  workspace_name: workspaceName,
  // Ajoute d'autres données ici
}
```

### Modifier les Emails

Configure les emails dans Lemon Squeezy :
- Dashboard → Settings → Email
- Personnalise les templates

## 📞 Support

- Documentation Lemon Squeezy : https://docs.lemonsqueezy.com/
- API Reference : https://docs.lemonsqueezy.com/api
- Support : https://www.lemonsqueezy.com/help

---

**Créé avec ❤️ pour LumaPost**
