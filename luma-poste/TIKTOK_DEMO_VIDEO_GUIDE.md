# 🎥 Guide Vidéo de Démo TikTok API - Points Essentiels

## ⏱️ Durée cible : 3-5 minutes

---

## ✅ CHECKLIST DES POINTS CRITIQUES À MONTRER

### 1️⃣ PRIVACY LEVEL - PAS DE DÉFAUT (20 sec)

**🚨 CRITIQUE - Cause principale de rejet**

**À montrer :**
- ✅ Menu déroulant "Who can view this video" VIDE avec placeholder "Select privacy level"
- ✅ AUCUNE valeur pré-sélectionnée
- ✅ Cliquer et sélectionner MANUELLEMENT une option

**Annotation vidéo :**
```
"NO DEFAULT VALUE - User must manually select"
```

---

### 2️⃣ INTERACTIONS - TOUTES DÉCOCHÉES (20 sec)

**🚨 CRITIQUE**

**À montrer :**
- ✅ Les 3 cases (Comment, Duet, Stitch) sont DÉCOCHÉES
- ✅ Cocher MANUELLEMENT chaque case une par une
- ✅ (Bonus) Montrer une case grisée si désactivée dans TikTok

**Annotation vidéo :**
```
"ALL UNCHECKED BY DEFAULT - Manual activation required"
```

---

### 3️⃣ CONTENU COMMERCIAL - LE PLUS IMPORTANT (90 sec)

**🚨 SUPER CRITIQUE - Principale raison de rejet**

#### Étape A : Toggle OFF (10 sec)
**À montrer :**
- ✅ Toggle "Disclose video content" DÉSACTIVÉ (gris/off)
- ✅ Aucune case visible

**Annotation :**
```
"Toggle OFF by default - REQUIRED"
```

#### Étape B : Activer le Toggle (10 sec)
**À montrer :**
- ✅ Cliquer sur le toggle → il devient ON
- ✅ 2 cases apparaissent : "Your brand" et "Branded content"
- ✅ Les 2 cases sont DÉCOCHÉES

**Annotation :**
```
"When enabled, both checkboxes appear UNCHECKED"
```

#### Étape C : Sélection "Your Brand" (10 sec)
**À montrer :**
- ✅ Cocher "Your brand"
- ✅ Message apparaît : "Your video will be labeled 'Promotional content'"

#### Étape D : Sélection "Branded Content" (10 sec)
**À montrer :**
- ✅ Décocher "Your brand"
- ✅ Cocher "Branded content"
- ✅ Message change : "Your video will be labeled 'Paid partnership'"

#### Étape E : Les Deux Sélectionnés (5 sec)
**À montrer :**
- ✅ Cocher les 2 cases ensemble
- ✅ Message reste : "Paid partnership"

#### Étape F : VALIDATION - Toggle ON, Aucune Sélection (15 sec)
**🚨 SUPER IMPORTANT**

**À montrer :**
- ✅ Décocher les 2 cases (toggle reste ON)
- ✅ Message d'erreur apparaît :
  ```
  ⚠️ You need to indicate if your content promotes yourself, a third party, or both.
  ```
- ✅ (Optionnel) Essayer de cliquer "Publish" → montrer que c'est bloqué

**Annotation :**
```
"VALIDATION: Cannot publish if toggle ON but no selection"
```

#### Étape G : Restriction Privacy (15 sec)
**À montrer :**
- ✅ Cocher "Branded content"
- ✅ Changer Privacy Level → "Private (Only me)"
- ✅ "Branded content" devient grisé/désactivé
- ✅ Message : "Branded content visibility cannot be set to private"

**Annotation :**
```
"Branded content CANNOT be private - auto-disabled"
```

---

### 4️⃣ DÉCLARATION MUSIC USAGE (20 sec)

**🚨 CRITIQUE**

**À montrer :**
- ✅ Scroller vers le bouton "Publish"
- ✅ Montrer la déclaration AVANT le bouton :
  ```
  By posting, you agree to TikTok's Music Usage Confirmation
  ```
- ✅ Activer "Branded content"
- ✅ Montrer que le texte change :
  ```
  By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation
  ```
- ✅ Cliquer sur les liens pour montrer qu'ils sont cliquables

**Annotation :**
```
"Declaration BEFORE publish button - Links are clickable - Text changes based on commercial content"
```

---

### 5️⃣ INFORMATIONS CRÉATEUR (10 sec)

**À montrer :**
- ✅ Pseudo TikTok affiché (@username)
- ✅ Durée maximale vidéo affichée (ex: "3 min 0s")

**Annotation :**
```
"Creator info displayed: username and max video duration"
```

---

## 📋 STRUCTURE VIDÉO RECOMMANDÉE

```
00:00 - 00:10 : Introduction + Sélection compte TikTok
00:10 - 00:20 : Upload vidéo
00:20 - 00:40 : Privacy Level (PAS DE DÉFAUT) ⚠️
00:40 - 01:00 : Interactions (DÉCOCHÉES) ⚠️
01:00 - 02:30 : Contenu Commercial (TOUTES LES ÉTAPES) ⚠️⚠️⚠️
02:30 - 02:50 : Déclaration Music Usage ⚠️
02:50 - 03:00 : Informations Créateur
03:00 - 03:10 : Publication et conclusion
```

---

## 🎯 LES 4 POINTS QUI FONT ÉCHOUER 99% DES DEMANDES

### ❌ CE QU'IL NE FAUT PAS MONTRER :
1. Privacy Level avec une valeur par défaut (ex: "Public" déjà sélectionné)
2. Cases Comment/Duet/Stitch déjà cochées
3. Toggle commercial content déjà activé
4. Pas de validation quand toggle ON mais aucune sélection

### ✅ CE QU'IL FAUT ABSOLUMENT MONTRER :
1. Privacy Level VIDE → sélection manuelle
2. Toutes les cases DÉCOCHÉES → activation manuelle
3. Toggle DÉSACTIVÉ par défaut → toutes les étapes de validation
4. Déclaration Music Usage visible AVANT le bouton Publish

---

## 🛠️ AVANT D'ENREGISTRER

- [ ] Compte TikTok Business connecté
- [ ] Vidéo de test prête
- [ ] Navigateur en plein écran (1080p minimum)
- [ ] Enregistreur d'écran prêt (QuickTime/OBS)
- [ ] Tester le parcours complet AVANT d'enregistrer

---

## 💡 CONSEILS TECHNIQUES

1. **Vitesse** : Allez lentement, laissez 2-3 secondes sur chaque élément important
2. **Zoom** : Zoomez sur les parties critiques (Privacy vide, cases décochées, messages de validation)
3. **Annotations** : Ajoutez des flèches/textes pour souligner les points importants
4. **Résolution** : Minimum 720p, idéalement 1080p
5. **Audio** : Pas obligatoire, mais si voix off, parlez lentement et clairement

---

## 📤 SOUMISSION

Avec la vidéo, incluez ce texte dans votre demande :

```
This demo video shows all required UX implementations:

✅ Privacy Level: No default value - users must manually select (00:20)
✅ Interactions: All unchecked by default - manual activation required (00:40)
✅ Commercial Content: Toggle OFF by default with full validation flow (01:00)
✅ Music Usage Declaration: Displayed before publish button with clickable links (02:30)
✅ Creator Info: Username and max duration displayed (02:50)

All requirements from https://developers.tiktok.com/doc/content-sharing-guidelines
have been implemented as specified in "Required UX Implementation in Your App".
```

---

## ⚠️ DERNIÈRE VÉRIFICATION

Avant d'envoyer, regardez votre vidéo et vérifiez que vous voyez CLAIREMENT :

- [ ] Privacy Level avec placeholder "Select privacy level" (pas de valeur)
- [ ] Les 3 cases d'interaction décochées
- [ ] Toggle commercial content désactivé au départ
- [ ] Les 2 cases qui apparaissent quand toggle activé
- [ ] Tous les messages de validation et labels
- [ ] Le message d'erreur si toggle ON sans sélection
- [ ] La déclaration Music Usage avant le bouton Publish
- [ ] Les liens cliquables dans la déclaration

Si UN SEUL de ces points n'est pas visible → REFAIRE LA VIDÉO

---

**Bonne chance ! 🚀**
