// ============================================
// CARIBBEAN SUPPLY — Google Sheets par Destination
// Sépare les données Clients & Devis par destination
// Suivi des paiements et conteneurs en temps réel
// ============================================

// ⚠️ À REMPLIR: ID de ton Google Sheet
const SPREADSHEET_ID = 'A_REMPLIR_AVEC_TON_ID';

// Les onglets par destination
const SHEETS = {
  clientsMTQ: 'Clients Martinique',
  clientsGLP: 'Clients Guadeloupe',
  clientsGUY: 'Clients Guyane',
  devisMTQ: 'Devis Martinique',
  devisGLP: 'Devis Guadeloupe',
  devisGUY: 'Devis Guyane',
  expeditionsMTQ: 'Expéditions Martinique',
  expeditionsGLP: 'Expéditions Guadeloupe',
  expeditionsGUY: 'Expéditions Guyane',
  suivi: 'Suivi Conteneurs',
};

// Capacité des conteneurs en CBM
const CONTAINER_CAPACITY = 67;

// Fichiers Google Sheet DÉDIÉS pour les expéditions (un fichier séparé par île)
const EXPEDITION_SPREADSHEETS = {
  MTQ: SPREADSHEET_ID, // reste dans le fichier principal (déjà des données dedans)
  GLP: '19fHqOviub01vlw4taq7Gu39wr8jzK3DhT0REjfAUstU',
  GUY: '1uD2JryW9n9ZqZJD1eHBcT2tIP8PZccQiDtVybwYkFvQ',
};

function getExpeditionSpreadsheet(destination) {
  const destCode = destination?.toUpperCase()?.substring(0, 3) || 'MTQ';
  const id = EXPEDITION_SPREADSHEETS[destCode] || EXPEDITION_SPREADSHEETS.MTQ;
  return SpreadsheetApp.openById(id);
}

// ============================================
// Fonction appelée par POST depuis ton app
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type; // 'client', 'devis', ou 'payment'
    const destination = data.destination || 'MTQ'; // Par défaut Martinique

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (type === 'client') {
      appendClient(ss, data, destination);
    } else if (type === 'devis') {
      appendQuote(ss, data, destination);
    } else if (type === 'expedition') {
      appendExpedition(data, destination);
    } else if (type === 'expedition_delete') {
      deleteExpedition(data, destination);
    } else if (type === 'payment') {
      updatePaymentStatus(ss, data, destination);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Erreur webhook:', error);
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// Fonction doGet — suivi conteneurs (défaut) ou expéditions d'un client
// (?action=expeditions&clientNumber=XXX&destination=MTQ)
// ============================================
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const action = e.parameter && e.parameter.action;

    if (action === 'expeditions') {
      const clientNumber = e.parameter.clientNumber || '';
      const destination = e.parameter.destination || 'MTQ';
      const expeditions = getClientExpeditions(clientNumber, destination);
      return ContentService.createTextOutput(JSON.stringify({ expeditions: expeditions }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const tracking = buildContainerTracking(ss);

    return ContentService.createTextOutput(JSON.stringify(tracking))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    console.error('Erreur doGet:', error);
    return ContentService.createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// Récupère les expéditions d'un client depuis le fichier de son île
// ============================================
function getClientExpeditions(clientNumber, destination) {
  const ss = getExpeditionSpreadsheet(destination);
  const sheetName = getExpeditionSheetName(destination);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  ensureIdColumn(sheet);

  const allData = sheet.getDataRange().getValues();
  const headerRow = allData[0];
  const dateCol = headerRow.indexOf('Date');
  const numCol = headerRow.indexOf('N° Client');
  const descCol = headerRow.indexOf('Colis');
  const weightCol = headerRow.indexOf('Poids Total (kg)');
  const cbmCol = headerRow.indexOf('CBM Total');
  const statusCol = headerRow.indexOf('Statut');
  const idCol = headerRow.indexOf('ID');

  const results = [];
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][numCol] === clientNumber) {
      results.push({
        id: allData[i][idCol] || '',
        date: allData[i][dateCol],
        description: allData[i][descCol],
        weight: allData[i][weightCol],
        cbm: allData[i][cbmCol],
        status: allData[i][statusCol],
      });
    }
  }
  // Plus récent en premier
  results.reverse();
  return results;
}

// ============================================
// S'assure que la colonne ID existe (ajoutée à la fin pour ne pas
// décaler les données déjà présentes dans les onglets existants)
// ============================================
function ensureIdColumn(sheet) {
  const lastCol = sheet.getLastColumn();
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  if (headerRow.indexOf('ID') === -1) {
    sheet.getRange(1, lastCol + 1).setValue('ID');
    sheet.getRange(1, lastCol + 1).setFontWeight('bold').setBackground('#0FAFAA').setFontColor('#FFFFFF');
  }
}

// ============================================
// Annule une expédition annoncée (uniquement si pas encore reçue)
// ============================================
function deleteExpedition(data, destination) {
  const ss = getExpeditionSpreadsheet(destination);
  const sheetName = getExpeditionSheetName(destination);
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return;

  ensureIdColumn(sheet);

  const allData = sheet.getDataRange().getValues();
  const headerRow = allData[0];
  const numCol = headerRow.indexOf('N° Client');
  const statusCol = headerRow.indexOf('Statut');
  const idCol = headerRow.indexOf('ID');

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idCol] === data.id && allData[i][numCol] === data.clientNumber) {
      const status = (allData[i][statusCol] || '').toString().toLowerCase();
      if (status.indexOf('reçu') !== -1 || status.indexOf('recu') !== -1) {
        return; // Sécurité: jamais supprimer un colis déjà vérifié au warehouse
      }
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

// ============================================
// Ajoute un client à l'onglet correspondant
// ============================================
function appendClient(ss, data, destination) {
  const sheetName = getClientSheetName(destination);
  let sheet = getOrCreateSheet(ss, sheetName);

  // En-têtes si vide
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Date', 'N° Client', 'Nom', 'Email', 'Téléphone', 'Destination', 'Créé à']);
  }

  // Ajouter la ligne
  sheet.appendRow([
    new Date().toLocaleString('fr-FR'),
    data.clientNumber || '',
    (data.firstName || '') + ' ' + (data.lastName || ''),
    data.email || '',
    data.phone || '',
    destination,
    data.createdAt || new Date().toISOString(),
  ]);

  // Formater l'en-tête
  const headerRange = sheet.getRange(1, 1, 1, 7);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#15264A');
  headerRange.setFontColor('#FFFFFF');

  // Auto-resize colonnes
  sheet.autoResizeColumns(1, 7);
}

// ============================================
// Ajoute un devis à l'onglet correspondant
// ============================================
function appendQuote(ss, data, destination) {
  const sheetName = getQuoteSheetName(destination);
  let sheet = getOrCreateSheet(ss, sheetName);

  // En-têtes si vide
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Date',
      'N° Client',
      'Nom/Source',
      'Email',
      'Téléphone',
      'Type Produit',
      'Description',
      'Poids (kg)',
      'CBM',
      'Destination',
      'Valeur Marchandise (€)',
      'Prix Estimé (€)',
      'Canal',
    ]);
  }

  // Ajouter la ligne
  sheet.appendRow([
    new Date().toLocaleString('fr-FR'),
    data.clientNumber || '',
    data.name || '',
    data.email || '',
    data.phone || '',
    data.productType || '',
    data.description || '',
    data.weight || '',
    data.cbm || '',
    destination,
    data.value || '',
    data.totalPrice || '',
    data.channel || '',
  ]);

  // Formater l'en-tête
  const headerRange = sheet.getRange(1, 1, 1, 13);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#15264A');
  headerRange.setFontColor('#FFFFFF');

  // Auto-resize colonnes
  sheet.autoResizeColumns(1, 13);
}

// ============================================
// Ajoute une expédition réelle (colis envoyés à la warehouse)
// Écrit dans le fichier Google Sheet dédié à l'île du client
// ============================================
function appendExpedition(data, destination) {
  const ss = getExpeditionSpreadsheet(destination);
  const sheetName = getExpeditionSheetName(destination);
  let sheet = getOrCreateSheet(ss, sheetName);

  // En-têtes si vide
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Date',
      'N° Client',
      'Nom',
      'Email',
      'Colis',
      'Poids Total (kg)',
      'CBM Total',
      'Destination',
      'Statut',
      'ID',
    ]);
  }

  ensureIdColumn(sheet);
  const expeditionId = Utilities.getUuid();

  // Ajouter la ligne
  sheet.appendRow([
    new Date().toLocaleString('fr-FR'),
    data.clientNumber || '',
    data.name || '',
    data.email || '',
    data.description || '',
    data.weight || '',
    data.cbm || '',
    destination,
    'Annoncé',
    expeditionId,
  ]);

  // Formater l'en-tête
  const lastCol = sheet.getLastColumn();
  const headerRange = sheet.getRange(1, 1, 1, lastCol);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0FAFAA');
  headerRange.setFontColor('#FFFFFF');

  // Auto-resize colonnes
  sheet.autoResizeColumns(1, lastCol);
}

// ============================================
// Utilitaires
// ============================================
function getClientSheetName(destination) {
  const destCode = destination?.toUpperCase()?.substring(0, 3) || 'MTQ';
  if (destCode === 'MTQ') return SHEETS.clientsMTQ;
  if (destCode === 'GLP') return SHEETS.clientsGLP;
  if (destCode === 'GUY') return SHEETS.clientsGUY;
  return SHEETS.clientsMTQ; // Default
}

function getQuoteSheetName(destination) {
  const destCode = destination?.toUpperCase()?.substring(0, 3) || 'MTQ';
  if (destCode === 'MTQ') return SHEETS.devisMTQ;
  if (destCode === 'GLP') return SHEETS.devisGLP;
  if (destCode === 'GUY') return SHEETS.devisGUY;
  return SHEETS.devisMTQ; // Default
}

function getExpeditionSheetName(destination) {
  const destCode = destination?.toUpperCase()?.substring(0, 3) || 'MTQ';
  if (destCode === 'MTQ') return SHEETS.expeditionsMTQ;
  if (destCode === 'GLP') return SHEETS.expeditionsGLP;
  if (destCode === 'GUY') return SHEETS.expeditionsGUY;
  return SHEETS.expeditionsMTQ; // Default
}

function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

// ============================================
// Met à jour le statut de paiement d'un client
// ============================================
function updatePaymentStatus(ss, data, destination) {
  const sheetName = getClientSheetName(destination);
  let sheet = getOrCreateSheet(ss, sheetName);

  // Trouver la colonne "N° Client" et "Statut Paiement"
  const headerRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const clientNumCol = headerRow.indexOf('N° Client') + 1;
  const statusCol = headerRow.indexOf('Statut Paiement') + 1;
  const paymentDateCol = headerRow.indexOf('Date Paiement') + 1;

  // Si les colonnes n'existent pas, les ajouter
  if (statusCol === 0) {
    sheet.appendRow(['Statut Paiement', 'Date Paiement']);
    sheet.getRange(1, sheet.getLastColumn() - 1, 1, 2).setFontWeight('bold').setBackground('#15264A').setFontColor('#FFFFFF');
  }

  // Trouver la ligne du client
  const allData = sheet.getDataRange().getValues();
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][clientNumCol - 1] === data.clientId) {
      sheet.getRange(i + 1, statusCol).setValue('Payé');
      sheet.getRange(i + 1, paymentDateCol).setValue(new Date().toLocaleString('fr-FR'));
      break;
    }
  }

  // Mettre à jour le suivi des conteneurs
  updateContainerTracking(ss, data, destination);
}

// ============================================
// Construit le suivi des conteneurs en temps réel
// ============================================
function buildContainerTracking(ss) {
  const destinations = ['MTQ', 'GLP', 'GUY'];
  const destNames = ['Martinique', 'Guadeloupe', 'Guyane'];
  const containers = [];
  let totalPaid = 0;
  let totalCapacity = 0;

  for (let i = 0; i < destinations.length; i++) {
    const destCode = destinations[i];
    const destName = destNames[i];
    const sheetName = getClientSheetName(destCode);
    let sheet = null;

    try {
      sheet = ss.getSheetByName(sheetName);
    } catch (e) {
      continue;
    }

    if (!sheet) continue;

    const allData = sheet.getDataRange().getValues();
    const headerRow = allData[0];
    const cbmCol = headerRow.indexOf('CBM') + 1;
    const nameCol = headerRow.indexOf('Nom') + 1;
    const totalPriceCol = headerRow.indexOf('Montant') + 1;
    const statusCol = headerRow.indexOf('Statut Paiement') + 1;
    const paymentDateCol = headerRow.indexOf('Date Paiement') + 1;

    let containerLoad = 0;
    const paidClients = [];

    for (let j = 1; j < allData.length; j++) {
      const cbm = parseFloat(allData[j][cbmCol - 1]) || 0;
      const status = allData[j][statusCol - 1] || '';

      if (cbm > 0 && status === 'Payé') {
        containerLoad += cbm;
        paidClients.push({
          clientId: allData[j][0],
          name: allData[j][nameCol - 1],
          cbm: cbm,
          amount: parseFloat(allData[j][totalPriceCol - 1]) || 0,
          paymentDate: allData[j][paymentDateCol - 1],
          position: `Slot ${paidClients.length + 1}`,
        });
      }
    }

    const fillPercentage = (containerLoad / CONTAINER_CAPACITY) * 100;
    const status = containerLoad === 0 ? 'vide' : (containerLoad >= CONTAINER_CAPACITY ? 'plein' : 'en_cours');

    containers.push({
      id: `${destCode}-40ft-001`,
      destination: destName,
      containerType: '40ft',
      capacity: CONTAINER_CAPACITY,
      currentLoad: containerLoad,
      fillPercentage: fillPercentage,
      status: status,
      paidClients: paidClients,
      pendingClients: [],
      departureDate: null,
      eta: null,
      lastUpdated: new Date().toISOString(),
    });

    totalPaid += containerLoad;
    totalCapacity += CONTAINER_CAPACITY;
  }

  return {
    containers: containers,
    summary: {
      totalContainers: containers.length,
      totalPaid: totalPaid,
      totalPending: 0,
      totalCapacity: totalCapacity,
      totalUtilization: totalCapacity > 0 ? (totalPaid / totalCapacity) * 100 : 0,
      lastUpdated: new Date().toISOString(),
    },
  };
}

// ============================================
// Met à jour la feuille de suivi des conteneurs
// ============================================
function updateContainerTracking(ss, data, destination) {
  let sheet = getOrCreateSheet(ss, SHEETS.suivi);

  // Créer les en-têtes si vide
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Date',
      'Destination',
      'N° Client',
      'Nom Client',
      'CBM',
      'Montant (€)',
      'Statut Paiement',
      'Conteneur',
      'Position',
    ]);
    const headerRange = sheet.getRange(1, 1, 1, 9);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#15264A');
    headerRange.setFontColor('#FFFFFF');
  }

  // Ajouter une ligne
  sheet.appendRow([
    new Date().toLocaleString('fr-FR'),
    destination,
    data.clientId || '',
    data.clientName || '',
    data.cbm || '',
    data.amount || '',
    'Payé',
    data.containerId || `${destination}-40ft-001`,
    data.position || `Slot ${sheet.getLastRow()}`,
  ]);

  sheet.autoResizeColumns(1, 9);
}
