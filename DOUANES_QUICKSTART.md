# ⚡ Démarrage rapide - Calculateur Douanes

## 5 étapes pour lancer l'app en DEV

### 1️⃣ Installer + Configurer

```bash
cd /Users/jahan/cargo-lcl-app

# Installer les dépendances
npm install

# Copier la config d'exemple
cp .env.example .env.local
```

### 2️⃣ Ajouter les secrets

Crée `./secrets/google-service-account.json` avec ta clé Google Cloud:

```json
{
  "type": "service_account",
  "project_id": "caribbean-supply",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

### 3️⃣ Remplir `.env.local`

```env
# Stripe (get from stripe.com/dashboard)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google (from google cloud console)
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./secrets/google-service-account.json
GOOGLE_SHEETS_ID=xxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=your-super-secret-key-min-32-chars-long

# Email
RESEND_API_KEY=re_...

# WhatsApp
WHATSAPP_PHONE_NUMBER=+596696191509
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
```

### 4️⃣ Démarrer le serveur

```bash
npm run dev
```

L'app est accessible à: **http://localhost:3000/douanes**

### 5️⃣ Tester les calculs

1. Va sur http://localhost:3000/douanes
2. Remplis le formulaire
3. Clique "Calculer les taxes ⚡"
4. Voilà! 🎉

---

## 📚 Pages disponibles

| URL | Fonction |
|-----|----------|
| `/douanes` | 📦 Calculateur principal |
| `/douanes/dashboard` | 📊 Historique des calculs |
| `/douanes/success` | ✅ Confirmation paiement Stripe |
| `/api/douanes/calculate` | 🔌 API de calcul |

---

## 🎯 Mode "Sans Stripe" (dev rapide)

Si tu veux tester SANS Stripe pour le moment:

**Dans `app/douanes/page.tsx`, remplace:**
```tsx
<button onClick={handleCalculate} ...>
```

**Par:**
```tsx
<button onClick={() => {
  handleCalculate()
  // Sauvegarder en localStorage
  const history = JSON.parse(localStorage.getItem('douanes_history') || '[]')
  if (result) history.push({
    id: Date.now().toString(),
    date: new Date().toISOString(),
    territory: result.territory,
    category: result.category.name,
    fob_value: result.fob_value,
    total_taxes: result.total_taxes,
    total_delivered_price: result.total_delivered_price,
  })
  localStorage.setItem('douanes_history', JSON.stringify(history))
}} ...>
```

---

## 🚨 Erreurs courantes

### "GOOGLE_SERVICE_ACCOUNT_KEY_FILE not found"
```bash
# Créer le dossier
mkdir -p ./secrets
# Placer le fichier
cp ~/Downloads/google-service-account.json ./secrets/
```

### "Stripe key not found"
```env
# Générer des clés de test:
# 1. Va sur https://dashboard.stripe.com/apikeys
# 2. Copie la "Secret key" (commence par sk_test_)
# 3. Colle dans STRIPE_SECRET_KEY
```

### "Google Drive API not enabled"
```
1. Va sur Google Cloud Console
2. Va dans "APIs & Services"
3. Clique "+ Enable APIs and Services"
4. Cherche "Google Drive API"
5. Clique "Enable"
```

---

## 📊 Tester les calculs

### Exemple 1: Climatiseur (15% OM)
```
Territoire: Martinique
Catégorie: Électronique
FOB: 900€
CBM: 1.5

Résultat attendu: ~1.800€ livré
```

### Exemple 2: Meubles (7% OM)
```
Territoire: Guadeloupe
Catégorie: Meubles
FOB: 2000€
CBM: 3

Résultat attendu: ~2.500€ livré
```

### Exemple 3: Solaire (0% OM ✨)
```
Territoire: Guyane
Catégorie: Panneaux solaires
FOB: 5000€
CBM: 4

Résultat attendu: ~5.600€ livré (TVA seulement)
```

---

## 🔗 Intégrations à faire après

- [ ] Google Drive API (sauvegarde PDF)
- [ ] Google Sheets API (historique Excel)
- [ ] Stripe Checkout (paiements réels)
- [ ] Email via Resend (confirmations)
- [ ] WhatsApp via Twilio (notifications)
- [ ] Auth (JWT tokens)

---

**Besoin d'aide?** 
- 📧 Mail: jahan@caribbeansupply.net
- 💬 WhatsApp: +596 696 191 509

Happy calculating! 🚀
