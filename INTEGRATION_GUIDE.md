# 🔗 Guide d'intégration API - Caribbean Supply

## ✅ Ce qui a été créé

Tes fichiers HTML/CSS/JS sont **copiés dans `/public`** et servis par Next.js.

Les **APIs backend** sont prêtes à recevoir les devis:
- `POST /api/simulator/quote` - Calcule le devis
- `POST /api/simulator/send-quote` - Envoie par WhatsApp/Email

---

## 🚀 Accéder aux pages

Une fois le serveur lancé (`npm run dev`):

| Page | URL |
|------|-----|
| Accueil | `http://localhost:3000` → `/public/index.html` |
| Simulateur | `http://localhost:3000/simulateur.html` |
| Espace client | `http://localhost:3000/espace-client.html` |
| Contact | `http://localhost:3000/contact.html` |
| Comment ça marche | `http://localhost:3000/comment-ca-marche.html` |
| Sourcing | `http://localhost:3000/sourcing.html` |

---

## 🔌 API Endpoints

### 1️⃣ POST `/api/simulator/quote`

**Calcule le devis** (CBM, poids, prix)

```javascript
// Appel depuis le formulaire
const response = await fetch('/api/simulator/quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    destination: 'Martinique',
    parcels: [
      { length: 100, width: 50, height: 30, weight: 20 }
    ],
    productType: 'Électronique',
    productValue: 5000
  })
})

const quote = await response.json()
// Résultat:
// {
//   success: true,
//   quote: {
//     destination: 'Martinique',
//     totalCBM: 0.15,
//     totalWeight: 20,
//     billedCBM: 1.0,
//     transportPrice: 380,
//     insurance: 75,
//     totalPrice: 455
//   }
// }
```

### 2️⃣ POST `/api/simulator/send-quote`

**Envoie le devis par WhatsApp ou Email**

```javascript
const response = await fetch('/api/simulator/send-quote', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jean Dupont',
    email: 'jean@example.com',
    phone: '+596696191509',
    destination: 'Martinique',
    totalCBM: 1.5,
    totalWeight: 100,
    transportPrice: 570,
    insurance: 75,
    productValue: 5000,
    productType: 'Électronique',
    method: 'whatsapp' // ou 'email' ou 'both'
  })
})
```

---

## 📝 Intégrer les APIs au formulaire HTML

Le fichier `/public/simulator-api.js` est **automatiquement chargé** par le HTML.

Il connecte les boutons aux APIs:

```html
<!-- Ces boutons déclenchent l'envoi -->
<a class="btn btn-wa btn-block" id="waBtn">Envoyer sur WhatsApp</a>
<a class="btn btn-ghost-dark btn-block" id="mailBtn">Recevoir par e-mail</a>
```

### Modifier le formulaire

Tu dois aussi **collecter les infos client** (name, email, phone):

**Dans `simulateur.html`, après le formulaire, ajoute:**

```html
<div class="panel-step-label">Étape 4 — Contact</div>
<h2 style="margin-bottom:16px">Vos infos</h2>
<div class="field-row">
  <div class="field">
    <label for="name">Nom</label>
    <input class="input" id="name" type="text" placeholder="Votre nom" required />
  </div>
  <div class="field">
    <label for="email">Email</label>
    <input class="input" id="email" type="email" placeholder="votre@email.com" required />
  </div>
  <div class="field">
    <label for="phone">Téléphone</label>
    <input class="input" id="phone" type="tel" placeholder="+596 696 191 509" required />
  </div>
</div>
```

Puis **modifie `/public/simulator-api.js`** pour récupérer ces infos:

```javascript
// Ligne ~65, remplace par:
const name = document.getElementById('name')?.value || 'Client'
const email = document.getElementById('email')?.value || 'contact@caribbeansupply.net'
const phone = document.getElementById('phone')?.value || '+596696191509'
```

---

## 🛠️ Configurer les services externes

### Resend (Email)

1. Va sur [resend.com](https://resend.com)
2. Crée un compte gratuit
3. Copie la clé API dans `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

### WhatsApp

Les messages WhatsApp s'ouvrent directement via:
```
https://wa.me/596696191509?text=MESSAGE
```

Aucune config nécessaire! ✨

### Google Drive (optionnel)

Si tu veux sauvegarder les PDFs:

1. Crée un compte service (voir `DOUANES_README.md`)
2. Ajoute dans `.env.local`:
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./secrets/google-service-account.json
   GOOGLE_SHEETS_ID=xxxxxxxxxxxxx
   ```

---

## 🚀 Tester les APIs

### Test WhatsApp

1. Va sur `http://localhost:3000/simulateur.html`
2. Remplis le formulaire
3. Clique "Envoyer sur WhatsApp"
4. Ça ouvre WhatsApp avec le message prérempli ✅

### Test Email

1. Configure `RESEND_API_KEY` dans `.env.local`
2. Clique "Recevoir par e-mail"
3. Le mail arrive dans quelques secondes ✅

---

## 📊 Structure des fichiers

```
cargo-lcl-app/
├── public/
│   ├── index.html              ← Accueil
│   ├── simulateur.html         ← Formulaire
│   ├── espace-client.html      ← Dashboard
│   ├── styles.css              ← Design
│   ├── app.js                  ← Logique formulaire
│   ├── simulator-api.js        ← ← NOUVEAU! Connexion aux APIs
│   └── uploads/                ← Images client
│
├── app/
│   ├── api/
│   │   ├── simulator/
│   │   │   ├── quote/route.ts          ← Calcul devis
│   │   │   └── send-quote/route.ts     ← Envoi devis
│   │   └── ...
│   │
│   ├── simulateur/
│   │   └── page.tsx            ← Serve simulateur.html
│   └── ...
│
└── .env.local                  ← À configurer
```

---

## ⚙️ Configuration `.env.local`

```env
# Email
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Google Drive (optionnel)
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./secrets/google-service-account.json
GOOGLE_SHEETS_ID=xxxxxxxxxxxxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🐛 Débogage

### "API not found" → 404
```
→ Vérifier que les fichiers sont dans app/api/simulator/
→ Redémarrer le serveur: Ctrl+C, npm run dev
```

### "WhatsApp ne s'ouvre pas"
```
→ Numéro téléphone incorrect dans le script
→ Vérifier: https://wa.me/596696191509
```

### "Email non reçu"
```
→ Vérifier RESEND_API_KEY dans .env.local
→ Vérifier que Resend est activé (pas en test)
→ Regarder les logs: npm run dev
```

---

## 🎯 Next Steps

- ✅ APIs prêtes
- ⏳ Google Drive sync (PDF auto-save)
- ⏳ Stripe Premium (paiements)
- ⏳ Dashboard client avec historique

**T'as besoin de quoi d'autre?** 🚀

---

**Besoin d'aide?** Dis-moi! 💬
