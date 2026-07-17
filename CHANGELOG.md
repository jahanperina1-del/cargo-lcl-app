# Changelog — Caribbean Supply LCL

## Session 2026-07-17: Platform Updates

### ✅ 1. Warehouse Address Update
**Commit:** `0d57000`
- **Adresse officielle mise à jour:** 深圳市龙岗区朗深科技园102室 (Shenzhen, Longgang District)
- **Téléphone warehouse:** +86 19898149058
- **Destinataire:** Peggy
- **Localisation:** Éspace client dashboard (warehouse-card section)
- **Fichiers modifiés:** `public/espace-client.html`

### ✅ 2. Critical SKU Code Alert
**Commit:** `0d57000`
- **Alerte Rouge:** "⚠️ IMPORTANT — Codes articles obligatoires"
- **Message clair:** "Nous n'acceptons PAS les colis sans codes articles (SKU)"
- **Boîte d'alerte:** "🚫 Pas de code article = Colis refusé au warehouse"
- **Instructions au fournisseur:** Format d'exemple fourni avec numéro client auto-rempli
- **Localisation:** Éspace client dashboard (après dash-head)
- **Fichiers modifiés:** `public/espace-client.html`

### ✅ 3. Delivery Timeline Update
**Commit:** `d6f7b8b`
- **Changement:** 35 jours → **60 jours** délai estimé
- **Pages mises à jour:**
  - `public/index.html` — Cartes destinations Martinique & Guadeloupe (~60 j)
  - `public/comment-ca-marche.html` — Section "Expédition maritime" (~60 j)
  - `public/simulateur.html` — Note résultat (~60 j)
- **Impact:** Toutes les pages affichent maintenant 60 jours comme délai estimé

### ✅ 4. Pricing Clarification (HT = Hors Taxes)
**Commit:** `cb6c5d2`
- **Changement:** 380€ → **380€ HT/CBM** (hors TVA et droits de douane)
- **Pages mises à jour:**
  - `public/index.html` — Cartes destinations (3x) + price-strip + footer
  - `public/espace-client.html` — Section paiement + footer (2x)
  - `public/simulateur.html` — Description + footer (2x)
  - `public/comment-ca-marche.html` — Footer
  - `public/contact.html` — Footer
  - `public/sourcing.html` — Footer
- **Total:** 14 occurrences mises à jour
- **Message:** Clarification que les prix affichés sont HT (avant TVA 8.5% et douanes)

## Git History

```
cb6c5d2 Clarifier tarif: 380€ HT/CBM (hors TVA et droits de douane)
d6f7b8b Mettre à jour délais de livraison: 35 jours → 60 jours
0d57000 Ajouter warehouse adresse Shenzhen et alerte SKU obligatoire
```

## Files Modified
- `public/espace-client.html` (warehouse address + SKU alert)
- `public/index.html` (delays + pricing)
- `public/simulateur.html` (delays + pricing)
- `public/comment-ca-marche.html` (delays + pricing)
- `public/espace-client.html` (pricing)
- `public/contact.html` (pricing)
- `public/sourcing.html` (pricing)

## Summary
✅ **Warehouse opérationnel** avec adresse confirmée (Shenzhen, Peggy)
✅ **Alertes clients** sur obligations SKU code
✅ **Délais réalistes** communiqués (60 jours)
✅ **Transparence tarifaire** (HT vs TTC bien différencié)

**Status:** Ready for production deployment 🚀
