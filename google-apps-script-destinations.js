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
      appendExpedition(ss, data, destination);
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
// Fonction doGet pour retourner le suivi en temps réel
// Appelée par l'API container-tracking
// ============================================
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
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
// ============================================
function appendExpedition(ss, data, destination) {
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
    ]);
  }

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
  ]);

  // Formater l'en-tête
  const headerRange = sheet.getRange(1, 1, 1, 9);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#0FAFAA');
  headerRange.setFontColor('#FFFFFF');

  // Auto-resize colonnes
  sheet.autoResizeColumns(1, 9);
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
