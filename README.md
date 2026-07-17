# Cargo LCL - Simulateur de Devis

Web app pour générer des devis automatisés pour le cargo LCL (Chine → Martinique/Guadeloupe/Guyane).

## Features

- 🎯 Simulateur de prix en temps réel
- 📧 Envoi automatique des devis par email
- 📱 Intégration WhatsApp
- 📊 Sync Google Sheets automatique
- 📱 Design responsive & mobile-first
- 🚀 Déploiement Vercel

## Stack

- Next.js 14
- React 18
- Tailwind CSS
- TypeScript
- React Hook Form

## Setup Local

1. Installer les dépendances:
```bash
cd cargo-lcl-app
npm install
```

2. Copier les variables d'environnement:
```bash
cp .env.example .env.local
```

3. Remplir les variables (voir Configuration ci-dessous)

4. Lancer le serveur de dev:
```bash
npm run dev
```

5. Ouvrir http://localhost:3000

## Configuration

### Google Sheets (Zapier)

1. Aller sur https://zapier.com
2. Créer un Zap: "Webhooks by Zapier" → "Google Sheets"
3. Copier le webhook URL dans `.env.local`

### Email (Resend)

1. Créer un compte sur https://resend.com
2. Copier l'API key dans `.env.local`
3. Configurer le domaine de sender

### WhatsApp

Option 1: Twilio
- Créer un compte https://www.twilio.com
- Copier Account SID et Auth Token
- Activer WhatsApp Sandbox

Option 2: WhatsApp Cloud API
- Déjà configuré avec +596696191509
- À intégrer avec l'API officielle Meta

## Déploiement Vercel

1. Pousser le code sur GitHub
2. Connecter Vercel au repo
3. Ajouter les variables d'environnement dans Vercel
4. Deploy!

```bash
vercel deploy
```

## Tarification

- **300€ / CBM** (tous destinations)
- Destinations: Martinique, Guadeloupe, Guyane

## Structure

```
app/
├── page.tsx              # Homepage
├── simulator/
│   └── page.tsx         # Simulateur devis
├── api/
│   └── send-quote/
│       └── route.ts     # API pour envoyer devis
├── globals.css
└── layout.tsx

components/              # À ajouter
lib/                    # Utilitaires
```

## TODO

- [ ] Intégrer Resend pour l'email
- [ ] Intégrer Twilio/WhatsApp API
- [ ] Ajouter upload photos
- [ ] Ajouter dashboard client
- [ ] Ajouter paiement (Stripe)
- [ ] Analytics (Vercel Analytics)

## Support

WhatsApp: +596696191509
Email: jahanperina1@gmail.com
