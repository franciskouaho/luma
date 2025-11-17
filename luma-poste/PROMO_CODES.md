# Codes Promo / Beta

Ce fichier explique comment créer et gérer les codes promo pour LumaPost.

## Structure Firestore

Les codes promo sont stockés dans la collection `promoCodes` avec la structure suivante :

```typescript
{
  code: string,          // Code en majuscules (ex: "BETA2025")
  type: string,          // Type: "beta", "admin", "promo"
  active: boolean,       // Si le code est actif
  maxUses: number,       // Nombre max d'utilisations (null = illimité)
  usedCount: number,     // Nombre d'utilisations actuelles
  usedBy: string[],      // Liste des UIDs qui ont utilisé ce code
  expiresAt: Timestamp,  // Date d'expiration (null = jamais)
  createdAt: Timestamp,  // Date de création
  lastUsedAt: Timestamp, // Dernière utilisation
  description: string,   // Description du code
}
```

## Créer des codes via Firebase Console

1. Aller dans Firebase Console → Firestore Database
2. Créer un document dans la collection `promoCodes`
3. Utiliser le **code en majuscules** comme ID du document

### Exemples de codes

#### Code Beta illimité (pour tous les beta testeurs)
```
Collection: promoCodes
Document ID: BETA2025

Champs:
- active: true
- type: "beta"
- maxUses: null (ou ne pas ajouter ce champ)
- usedCount: 0
- usedBy: []
- expiresAt: null (ou ne pas ajouter ce champ)
- createdAt: (timestamp actuel)
- description: "Code beta pour testeurs"
```

#### Code Admin (usage unique par personne)
```
Collection: promoCodes
Document ID: ADMIN2025

Champs:
- active: true
- type: "admin"
- maxUses: 10
- usedCount: 0
- usedBy: []
- expiresAt: null
- createdAt: (timestamp actuel)
- description: "Code admin - 10 utilisations max"
```

#### Code Promo temporaire (expire dans 30 jours)
```
Collection: promoCodes
Document ID: PROMO30J

Champs:
- active: true
- type: "promo"
- maxUses: 100
- usedCount: 0
- usedBy: []
- expiresAt: (timestamp dans 30 jours)
- createdAt: (timestamp actuel)
- description: "Promo 30 jours - 100 utilisations"
```

## Créer des codes via script

Créez un fichier `scripts/create-promo-codes.js` :

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function createPromoCode(code, options = {}) {
  const {
    type = 'beta',
    maxUses = null,
    expiresAt = null,
    description = '',
  } = options;

  const promoRef = db.collection('promoCodes').doc(code.toUpperCase());

  await promoRef.set({
    active: true,
    type,
    maxUses,
    usedCount: 0,
    usedBy: [],
    expiresAt,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    description,
  });

  console.log(`✅ Code créé: ${code.toUpperCase()}`);
}

// Créer plusieurs codes
async function main() {
  // Code beta illimité
  await createPromoCode('BETA2025', {
    type: 'beta',
    description: 'Beta testeurs 2025',
  });

  // Code admin limité
  await createPromoCode('ADMIN2025', {
    type: 'admin',
    maxUses: 10,
    description: 'Admin access - 10 max',
  });

  // Code promo avec expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await createPromoCode('PROMO30', {
    type: 'promo',
    maxUses: 100,
    expiresAt,
    description: 'Promo 30 jours',
  });

  console.log('✅ Tous les codes ont été créés !');
  process.exit(0);
}

main().catch(console.error);
```

## Gérer les codes

### Désactiver un code
```javascript
await db.collection('promoCodes').doc('BETA2025').update({
  active: false
});
```

### Voir les utilisations d'un code
```javascript
const codeDoc = await db.collection('promoCodes').doc('BETA2025').get();
const data = codeDoc.data();
console.log(`Utilisations: ${data.usedCount}/${data.maxUses || '∞'}`);
console.log(`Utilisé par:`, data.usedBy);
```

### Réinitialiser un code
```javascript
await db.collection('promoCodes').doc('BETA2025').update({
  usedCount: 0,
  usedBy: []
});
```

## Codes recommandés pour le lancement

- **BETA2025** : Pour tous les beta testeurs (illimité)
- **ADMIN** : Pour l'équipe interne (10 max)
- **EARLYBIRD** : Pour les premiers utilisateurs (100 max, 30 jours)
- **FRIEND** : Pour les amis et partenaires (50 max)

## Sécurité

⚠️ **Important** :
- Les codes sont stockés en majuscules
- Un utilisateur ne peut utiliser un code qu'une seule fois
- Les codes désactivés ou expirés ne peuvent pas être utilisés
- Les codes sont vérifiés côté serveur (pas de bypass possible)
