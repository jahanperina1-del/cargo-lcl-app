# 📦 Calculateur Douanes & TVA DOM

App **complète** de calcul de droits de douane et TVA pour les territoires français d'outre-mer (Martinique, Guadeloupe, Guyane, Réunion, Mayotte).

## 🎯 Fonctionnalités

✅ **Calcul ultra-précis** - Taux réels 2026 CTM/Douanes
✅ **22 catégories** de produits avec taux spécifiques
✅ **Formules correctes** - CIF → Octroi de mer → TVA
✅ **Stockage Google Drive** - PDF + Excel + historique
✅ **Paiement Stripe** - Modèle Freemium (5 calculs gratuits/mois)
✅ **Authentification** - Client registration & dashboard
✅ **Export PDF** - Chaque calcul sauvegardé automatiquement

## 📂 Structure

```
app/douanes/
├── page.tsx              # Calculateur principal
├── dashboard/
│   └── page.tsx         # Historique des calculs
└── success/
    └── page.tsx         # Confirmation paiement Stripe

app/api/douanes/
├── calculate/
│   └── route.ts         # API de calcul
└── history/
    └── route.ts         # Récupération historique

lib/
├── douanes-data.ts      # Taux & formules (22 catégories)
├── stripe-client.ts     # Intégration Stripe
└── google-drive.ts      # Sauvegarde Google Drive

api/stripe/
└── webhook/
    └── route.ts         # Webhook Stripe
```

## 🚀 Installation rapide

### 1. Installer les dépendances

```bash
npm install stripe googleapis
```

### 2. Configurer les variables d'env

Copie `.env.example` vers `.env.local` et remplis:

```bash
cp .env.example .env.local
```

Puis configure:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./secrets/google-service-account.json
GOOGLE_SHEETS_ID=...

# App
NEXT_PUBLIC_APP_URL=https://caribbeansupply.net
```

### 3. Google Drive Setup

#### Créer un compte de service Google:

1. Va sur [Google Cloud Console](https://console.cloud.google.com)
2. Crée un nouveau projet "Caribbean Supply"
3. Active "Google Drive API" et "Google Sheets API"
4. Crée un **Service Account** (Compte de service)
5. Génère une clé JSON et sauvegarde-la dans `./secrets/google-service-account.json`

#### Donner l'accès au service account:

- Partage le dossier Google Drive avec l'email du service account
- Partage la Google Sheets avec le service account

### 4. Stripe Setup

1. Va sur [Stripe Dashboard](https://dashboard.stripe.com)
2. Crée un **Product** "Premium Douanes"
3. Crée un **Price** en mode `subscription` ($9/mois)
4. Configure le webhook dans "Webhooks" :
   - URL: `https://caribbeansupply.net/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`

### 5. Google Sheets Template

Crée une Google Sheet avec ces colonnes pour l'historique:

```
A: Date
B: User ID
C: Territoire
D: Catégorie
E: FOB Value
F: Fret
G: CIF
H: Octroi de Mer
I: TVA
J: Total Taxes
K: Prix Final
```

## 💰 Modèle Freemium

```
🆓 GRATUIT:
  - 5 calculs/mois
  - Export PDF
  - Historique 30 jours

⭐ PREMIUM (9€/mois):
  - Calculs illimités
  - Export PDF + Excel
  - Historique illimité
  - API access
  - Intégration Zapier
```

## 📊 Catégories de produits supportées

| Taux OM | Catégories |
|---------|-----------|
| 0% | Médical, Solaire, Livres |
| 2-5% | Textile, Petite déco |
| 7-10% | Meubles, Équipement resto, Tentes |
| 10-15% | Électronique, Sacs, Bijoux |
| 40-50% | ⚠️ Alcool, Tabac (fortement taxé) |

### Exemple de calcul:

```
Produit: Climatiseur 3 unités
Destination: Martinique
FOB Value: 900€
CBM: 1.5

Résultat:
┌─────────────────────────┬───────┐
│ Valeur FOB              │ 900€  │
│ + Fret maritime (380€/CBM) │ 570€  │
│ + Assurance (1%)        │ 9€    │
│ = CIF                   │ 1.479€│
├─────────────────────────┼───────┤
│ Octroi de mer (15%)     │ 222€  │
│ TVA (8.5%)              │ 145€  │
├─────────────────────────┼───────┤
│ TOTAL LIVRÉ             │ 1.846€│
└─────────────────────────┴───────┘
```

## 🔌 API Endpoints

### POST `/api/douanes/calculate`

**Request:**
```json
{
  "territory": "martinique",
  "category_id": "electromenager",
  "fob_value": 900,
  "cbm": 1.5,
  "weight": 100,
  "insurance_percent": 1
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "territory": "martinique",
    "fob_value": 900,
    "freight_cost": 570,
    "cif_value": 1479,
    "octroi_de_mer": 222,
    "tva": 145,
    "total_taxes": 367,
    "total_delivered_price": 1846,
    "shipping_days": 18
  }
}
```

## 🔐 Authentification

Les utilisateurs connectés à l'app:
1. Reçoivent un JWT token
2. Peuvent faire jusqu'à 5 calculs gratuits/mois
3. Après: payent via Stripe pour continuer

## 📲 Webhook Stripe

Quand un utilisateur paie:
1. Stripe envoie un webhook à `/api/stripe/webhook`
2. On marque l'utilisateur comme `premium: true`
3. Il a accès illimité aux calculs

## 🐛 Dépannage

**Erreur "Google Drive not found":**
- Vérifier que `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` existe
- Vérifier les permissions du service account

**Stripe checkout échoue:**
- Vérifier `STRIPE_SECRET_KEY` et `STRIPE_PRICE_ID`
- Vérifier que les webhooks sont configurés

**Calculs ne se sauvegardent pas:**
- Vérifier `GOOGLE_SHEETS_ID` et l'accès au Sheet
- Vérifier que le service account a l'accès en écriture

## 📞 Support

Pour les questions:
- Mail: jahan@caribbeansupply.net
- WhatsApp: +596 696 191 509

---

**v1.0** - Juin 2026 | Caribbean Supply 🚢
