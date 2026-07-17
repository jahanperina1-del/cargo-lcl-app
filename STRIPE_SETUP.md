# 💳 Configuration Stripe - Paiement par CBM

## ✅ Ce qui a été ajouté

Tu peux maintenant **payer directement ton CBM** depuis l'espace client:

1. ✅ Formulaire de paiement (380€/CBM)
2. ✅ API Stripe intégrée
3. ✅ Page de succès après paiement
4. ✅ Historique des paiements

---

## 🚀 Utiliser la fonctionnalité

### Depuis l'espace client:

1. Va sur `/espace-client.html`
2. **Connecte-toi** avec un compte
3. Scroll jusqu'à la section **"💳 Payer en ligne"**
4. Entre le **volume (CBM)** que tu veux payer
5. Le prix se calcule automatiquement (380€/CBM)
6. Clique **"Payer avec Stripe"**
7. Tu es redirigé vers le paiement Stripe
8. Après succès → Page de confirmation ✅

---

## ⚙️ Configuration Stripe (IMPORTANT!)

### 1️⃣ Créer un compte Stripe

Va sur [stripe.com](https://stripe.com) et crée un compte (gratuit)

### 2️⃣ Récupérer tes clés

1. Va dans **Dashboard → Developers → API keys**
2. Copie ta **Secret key** (commence par `sk_test_`)
3. Copie ta **Publishable key** (commence par `pk_test_`)

### 3️⃣ Ajouter les clés dans `.env.local`

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
```

### 4️⃣ Redémarrer le serveur

```bash
npm run dev
```

---

## 🧪 Tester les paiements

### Cartes de test Stripe:

```
Numéro:     4242 4242 4242 4242
Expiration: 04/26
CVC:        424
```

Avec ces données, **tous les paiements réussissent** en mode test! ✅

### Paiement refusé (test):

```
Numéro:     4000 0000 0000 0002
Expiration: 04/26
CVC:        424
```

---

## 📊 Flux de paiement

```
Client remplit CBM
        ↓
API /api/stripe/create-checkout
        ↓
Session Stripe créée
        ↓
Redirection vers Stripe
        ↓
Client rentre ses infos
        ↓
Paiement effectué
        ↓
Redirect → Page succès ✅
```

---

## 🔗 API Endpoints

### POST `/api/stripe/create-checkout`

**Request:**
```json
{
  "cbm": 2.5,
  "amount": 950,
  "clientName": "Jean Dupont",
  "clientEmail": "jean@example.com",
  "clientNumber": "MTQ-ABC-001"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_..."
}
```

---

## 🛠️ Dépannage

### "STRIPE_SECRET_KEY not found"
```
→ Vérifier que .env.local est rempli
→ Redémarrer: npm run dev
→ Vérifier la clé commence par sk_test_
```

### "Session creation failed"
```
→ Vérifier que STRIPE_SECRET_KEY est correct
→ Vérifier que amount > 0
→ Vérifier la réponse dans les logs: npm run dev
```

### Stripe ne s'ouvre pas
```
→ Checker la console du navigateur (F12)
→ Vérifier que l'utilisateur est connecté
→ Vérifier que CBM > 0
```

---

## 💰 Tarification

```
1 CBM    = 380€
2 CBM    = 760€
5 CBM    = 1900€
10 CBM   = 3800€
```

---

## 📈 Après le paiement

Une fois le paiement réussi:
- ✅ Client reçoit un reçu par email
- ✅ Historique mis à jour dans l'espace client
- ✅ Métadonnées sauvegardées pour tracking

---

## 🔐 Webhook Stripe (Optionnel)

Pour tracer les paiements en temps réel:

1. Va dans Stripe Dashboard → Webhooks
2. Ajoute endpoint: `https://caribbeansupply.net/api/stripe/webhook`
3. Sélectionne les événements:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copie le **Signing secret** dans `.env.local`:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

---

**Ready?** Essaie et dis-moi si c'est OK! 🚀

---

Pour les questions: jahan@caribbeansupply.net | +596 696 191 509
