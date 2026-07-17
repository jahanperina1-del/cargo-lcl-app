import { google } from 'googleapis'
import type { CalculationResult } from './douanes-data'

/**
 * Initialise le client Google Drive
 */
function getGoogleDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
    scopes: ['https://www.googleapis.com/auth/drive'],
  })

  return google.drive({ version: 'v3', auth })
}

/**
 * Sauvegarde un calcul douanes en PDF dans Google Drive
 */
export async function saveCalculationToDrive(
  userId: string,
  result: CalculationResult
): Promise<string> {
  try {
    const drive = getGoogleDriveClient()

    // Créer le PDF
    const pdfContent = generateCalculationPDF(result)
    const fileName = `devis-douanes-${result.territory}-${Date.now()}.pdf`

    // Chercher ou créer le dossier utilisateur
    const folderName = `Caribbean Supply - Calculs Douanes - ${userId}`
    let folderId: string

    // Chercher si le dossier existe
    const folders = await drive.files.list({
      q: `name='${folderName}' and trashed=false and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id)',
      spaces: 'drive',
    })

    if (folders.data.files && folders.data.files.length > 0) {
      folderId = folders.data.files[0].id!
    } else {
      // Créer le dossier
      const newFolder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      })
      folderId = newFolder.data.id!
    }

    // Uploader le fichier PDF
    const fileResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/pdf',
        parents: [folderId],
      },
      media: {
        mimeType: 'application/pdf',
        body: pdfContent,
      },
    })

    console.log(`✓ Calcul sauvegardé sur Google Drive: ${fileResponse.data.id}`)

    // Ajouter à la feuille Google Sheets d'historique
    await appendToHistorySheet(userId, result)

    return fileResponse.data.id!
  } catch (err) {
    console.error('Erreur Google Drive:', err)
    throw err
  }
}

/**
 * Ajoute un calcul à la feuille d'historique
 */
async function appendToHistorySheet(
  userId: string,
  result: CalculationResult
): Promise<void> {
  try {
    const sheets = google.sheets({
      version: 'v4',
      auth: new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      }),
    })

    // ID de la feuille (à configurer en env)
    const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID

    if (!SPREADSHEET_ID) {
      console.warn('GOOGLE_SHEETS_ID non configuré')
      return
    }

    const values = [
      [
        new Date().toISOString(),
        userId,
        result.territory,
        result.category.name,
        result.fob_value,
        result.freight_cost,
        result.cif_value,
        result.octroi_de_mer,
        result.tva,
        result.total_taxes,
        result.total_delivered_price,
      ],
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Historique!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values },
    })

    console.log('✓ Calcul ajouté à l\'historique Google Sheets')
  } catch (err) {
    console.error('Erreur ajout historique:', err)
  }
}

/**
 * Génère un PDF du calcul
 */
function generateCalculationPDF(result: CalculationResult): Buffer {
  // Utiliser une librairie comme pdfkit ou html-to-pdf
  // Pour l'MVP, retourner un contenu simple
  const content = `
CALCUL DOUANES & TVA - CARIBBEAN SUPPLY
========================================

Date: ${new Date().toLocaleString('fr-FR')}
Destination: ${result.territory.toUpperCase()}
Catégorie: ${result.category.name}

--- DÉTAILS DU CALCUL ---

Valeur FOB:              ${result.fob_value.toFixed(2)}€
+ Fret maritime:         ${result.freight_cost.toFixed(2)}€
+ Assurance:             ${result.insurance_cost.toFixed(2)}€
= CIF (base taxable):    ${result.cif_value.toFixed(2)}€

Octroi de mer (${(result.category.om_rate * 100).toFixed(0)}%):  ${result.octroi_de_mer.toFixed(2)}€
TVA (${(result.category.tva_rate * 100).toFixed(1)}%):             ${result.tva.toFixed(2)}€

TOTAL TAXES:             ${result.total_taxes.toFixed(2)}€
PRIX FINAL LIVRÉ:        ${result.total_delivered_price.toFixed(2)}€

Délai estimé: ${result.shipping_days} jours

DISCLAIMER:
Ce calcul est une estimation basée sur les taux officiels 2026.
Les frais réels peuvent varier selon la classification douanière exacte.
  `

  return Buffer.from(content)
}
