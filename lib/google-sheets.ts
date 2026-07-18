const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK || ''

interface SheetData {
  type: 'client' | 'devis' | 'sourcing' | 'expedition' | 'expedition_delete'
  [key: string]: any
}

export async function sendToGoogleSheet(data: SheetData): Promise<boolean> {
  if (!WEBHOOK_URL) {
    console.log('[Google Sheets] Webhook non configuré - données non envoyées')
    return false
  }

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (result.success) {
      console.log(`[Google Sheets] ✓ ${data.type} ajouté`)
      return true
    } else {
      console.error('[Google Sheets] Erreur:', result.error)
      return false
    }
  } catch (error) {
    console.error('[Google Sheets] Erreur réseau:', error)
    return false
  }
}
