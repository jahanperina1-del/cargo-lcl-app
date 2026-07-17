# 📦 Configuration du Suivi des Conteneurs

## ✅ Ce qui marche MAINTENANT

**Page de suivi en temps réel:** `/suivi-conteneurs` (lien dans la navigation 📦 Suivi)

Deux jauges visuelles qui affichent:
- **% de remplissage** par destination (Martinique, Guadeloupe, Guyane)
- **CBM actuels** vs **capacité max** (67 CBM par container 40 pieds)
- **Statut**: VIDE / EN COURS / PLEIN

Les jauges se **mettent à jour en temps réel** (rafraîchissement toutes les 10 secondes):
- Quand un client crée un compte → le CBM est ajouté
- Quand un devis est envoyé via WhatsApp/Email → le CBM est ajouté

---

## 🔌 CONNECTEUR GOOGLE SHEETS (Optionnel)

Si tu veux **aussi** afficher les stats dans ton Google Sheet:

### ÉTAPE 1: Ajouter le code dans Google Apps Script

1. Va sur **https://script.google.com** (le même projet que le webhook principal)
2. En bas à gauche, clique l'icône **➕** → **Nouveau fichier** → **Script (.gs)**
3. Nomme-le: `Containers` (ou ce que tu veux)
4. Colle le contenu de `/Users/jahan/cargo-lcl-app/google-apps-script-containers.js`

### ÉTAPE 2: Adapter le script

Modifie ces lignes:

```javascript
const SPREADSHEET_ID = 'CET_ID_DE_TON_SHEET'; // Même ID que précédemment
const APP_URL = 'http://localhost:3000'; // Ou ton URL en prod (caribbeansupply.net)
```

### ÉTAPE 3: Exécuter manuellement d'abord

1. En haut, dans le menu déroulant, sélectionne `updateContainerStats`
2. Clique le bouton ▶️ **Exécuter**
3. Un nouvel onglet **"Conteneurs"** devrait apparaître dans ton Sheet
4. Tu dois voir les 3 destinations (MTQ, GLP, GUY) avec leurs stats

### ÉTAPE 4: (Optionnel) Automatiser la mise à jour

Pour que le Sheet se **mette à jour automatiquement** toutes les 10 minutes:

1. Dans Google Apps Script, clique sur `setUpTrigger`
2. Clique ▶️ **Exécuter**
3. Accepte les permissions
4. Désormais, le Sheet se met à jour **automatiquement** toutes les 10 minutes

**Note:** Sans trigger, tu dois exécuter manuellement de temps en temps. Avec trigger, c'est automatique mais coûte des quotas (gratuit dans les limites Google).

---

## 🧪 TEST

### Tester les jauges en direct:

1. Va sur **http://localhost:3000/suivi-conteneurs**
2. Tu devrais voir 3 jauges à 0%
3. Ouvre le **simulateur** → crée un devis → envoie-le
4. **Retour à la page de suivi** → la jauge correspondante monta! 🎉

### Remplir un container en test:

```bash
# Dans le terminal:
curl -X POST http://localhost:3000/api/container-stats \
  -H "Content-Type: application/json" \
  -d '{"destination":"MTQ","cbm":35}'
```

La jauge Martinique passe à ~52%

---

## 📊 Architecture

```
Simulateur (client fait un devis)
        ↓
/api/track-quote (enregistre + met à jour CBM)
        ↓
/api/container-stats (tient à jour data/containers.json)
        ↓
       /suivi-conteneurs (affiche les jauges en temps réel)
        ↓
   (Optionnel) Google Sheets (sync via Google Apps Script)
```

---

## 📈 Flux réel

```
1. Client remplit simulateur → envoie par WhatsApp
2. /api/track-quote enregistre dans Google Sheet
3. /api/track-quote met à jour container-stats
4. Page /suivi-conteneurs récupère les stats
5. Jauges se remplissent visuellement
6. (Optionnel) Google Sheet met à jour onglet Conteneurs
```

---

## 🎯 Utilisation quotidienne

**Matin**: Regarde **http://localhost:3000/suivi-conteneurs** pour voir l'état de remplissage

**Soir**: Quand un container est plein, tu peux:
- Réinitialiser les stats (optionnel): `echo '{"mtq":0,"glp":0,"guy":0,"lastUpdated":"'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"}' > data/containers.json`
- Créer un nouveau container

---

## 📝 Notes techniques

- **Data source**: `data/containers.json` (fichier local)
- **API**: `GET /api/container-stats` (lecture) + `POST` (écriture)
- **Frontend**: `/suivi-conteneurs.html` (page statique + fetch JS)
- **Refresh**: 10 secondes (configurable dans suivi-conteneurs.html ligne ~260)

---

## 🔧 Troubleshooting

**Les jauges ne se mettent pas à jour?**
- Vérifier que `/api/container-stats` répond: `curl http://localhost:3000/api/container-stats`
- Rafraîchir la page (F5)
- Vérifier la console navigateur (F12)

**Google Sheet ne se met pas à jour?**
- Vérifier que `SPREADSHEET_ID` est correct
- Vérifier que `APP_URL` est accessible (en prod: URL publique)
- Essayer d'exécuter manuellement d'abord

**Container reste à 0%?**
- Vérifier qu'un devis a bien été enregistré (voir Google Sheet "Devis")
- Vérifier que `data/containers.json` existe: `cat data/containers.json`

---

**C'est prêt!** La page de suivi fonctionne dès maintenant. Le Google Sheet est optionnel. 🚀
