// ============================================
// CARIBBEAN SUPPLY — Onglet Conteneurs (Stats)
// Synchronise l'état des conteneurs depuis l'API
// À ajouter DANS LE MÊME projet que le webhook principal
// ============================================

// ⚠️ À REMPLIR: ID de ton Google Sheet
const SPREADSHEET_ID = 'A_REMPLIR_AVEC_TON_ID';
const CONTAINER_SHEET_NAME = 'Conteneurs';

// Remplacez par l'URL réelle de votre application déployée
// (en dev: http://localhost:3000)
const APP_URL = 'http://localhost:3000';

// ============================================
// Fonction pour mettre à jour l'onglet Conteneurs
// À exécuter manuellement ou via un trigger
// ============================================
function updateContainerStats() {
  try {
    // Récupérer les stats depuis l'API
    const url = APP_URL + '/api/container-stats';
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

    if (response.getResponseCode() !== 200) {
      Logger.log('Erreur API:', response.getResponseCode());
      return;
    }

    const data = JSON.parse(response.getContentText());
    const containers = data.containers;

    // Préparer le sheet
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(CONTAINER_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(CONTAINER_SHEET_NAME, 0); // À l'avant
    } else {
      sheet.clearContents();
    }

    // En-têtes
    sheet.appendRow([
      'Destination',
      'Drapeau',
      'CBM Actuels',
      'Capacité (CBM)',
      'Remplissage (%)',
      'CBM Restants',
      'Statut',
      'Mis à jour',
    ]);

    // Formater l'en-tête
    const headerRange = sheet.getRange(1, 1, 1, 8);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#15264A');
    headerRange.setFontColor('#FFFFFF');

    // Données pour chaque destination
    const destinations = [
      { code: 'MTQ', name: 'Martinique', flag: '🇲🇶' },
      { code: 'GLP', name: 'Guadeloupe', flag: '🇬🇵' },
      { code: 'GUY', name: 'Guyane', flag: '🇬🇫' },
    ];

    let row = 2;
    destinations.forEach(function (dest) {
      const stats = containers[dest.code];
      const status = stats.isFull ? 'PLEIN ✓' : stats.percent >= 50 ? 'EN COURS' : 'VIDE';
      const statusColor = stats.isFull ? '#FFCDD2' : stats.percent >= 50 ? '#FFF3E0' : '#E8F5E9';

      sheet.appendRow([
        dest.name,
        dest.flag,
        stats.cbm.toFixed(2),
        stats.capacity,
        stats.percent,
        (stats.capacity - stats.cbm).toFixed(2),
        status,
        new Date(data.lastUpdated).toLocaleString('fr-FR'),
      ]);

      // Formater la ligne
      const rowRange = sheet.getRange(row, 1, 1, 8);
      rowRange.setBackground(statusColor);

      // Colorer le % de remplissage en vert/orange/rouge
      const percentCell = sheet.getRange(row, 5);
      if (stats.isFull) {
        percentCell.setFontColor('#C62828');
      } else if (stats.percent >= 50) {
        percentCell.setFontColor('#E65100');
      } else {
        percentCell.setFontColor('#2E7D32');
      }

      row++;
    });

    // Ajuster les largeurs
    sheet.autoResizeColumns(1, 8);

    Logger.log('Stats conteneurs mises à jour avec succès');
  } catch (error) {
    Logger.log('Erreur:', error.toString());
  }
}

// ============================================
// Trigger automatique (optionnel)
// Exécute updateContainerStats toutes les 10 minutes
// ============================================
function setUpTrigger() {
  // Supprimer les anciens triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (trigger) {
    if (trigger.getHandlerFunction() === 'updateContainerStats') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Créer un nouveau trigger (toutes les 10 minutes)
  ScriptApp.newTrigger('updateContainerStats')
    .timeBased()
    .everyMinutes(10)
    .create();

  Logger.log('Trigger activé: mise à jour toutes les 10 minutes');
}
