// ============================================
// CARIBBEAN SUPPLY — Google Sheets Webhook
// Reçoit les devis + clients en POST
// ============================================

// ⚠️ À REMPLIR: ID de ton Google Sheet vide
// Format: docs.google.com/spreadsheets/d/[CET_ID]/edit
const SPREADSHEET_ID = 'A_REMPLIR_AVEC_TON_ID';

// Les deux onglets (créés auto s'ils n'existent pas)
const SHEETS = {
  clients: 'Clients',
  devis: 'Devis',
};

// ============================================
// Fonction appelée par POST depuis ton app
// ============================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.type; // 'client' ou 'devis'

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (type === 'client') {
      appendClient(ss, data);
    } else if (type === 'devis') {
      appendQuote(ss, data);
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
// Ajoute un client à l'onglet "Clients"
// ============================================
function appendClient(ss, data) {
  let sheet = getOrCreateSheet(ss, SHEETS.clients);

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
    data.destination || '',
    data.createdAt || new Date().toISOString(),
  ]);
}

// ============================================
// Ajoute un devis à l'onglet "Devis"
// ============================================
function appendQuote(ss, data) {
  let sheet = getOrCreateSheet(ss, SHEETS.devis);

  // En-têtes si vide
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Date',
      'Réf Client',
      'Nom/Source',
      'Email',
      'Téléphone',
      'Type Produit',
      'Description',
      'Poids (kg)',
      'Longueur (cm)',
      'Largeur (cm)',
      'Hauteur (cm)',
      'CBM',
      'Destination',
      'Valeur Marchandise (€)',
      'Prix Estimé (€)',
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
    data.length || '',
    data.width || '',
    data.height || '',
    data.cbm || '',
    data.destination || '',
    data.value || '',
    data.totalPrice || '',
  ]);
}

// ============================================
// Utilitaire: crée l'onglet s'il n'existe pas
// ============================================
function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}
