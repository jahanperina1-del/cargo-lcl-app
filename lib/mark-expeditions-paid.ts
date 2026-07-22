/**
 * Marque comme "Payé" les colis reçus d'un client dans Google Sheets.
 * Appelé quand un paiement Stripe est confirmé (webhook + retour client).
 * La colonne "Payé" du Sheet est la seule source de vérité du statut de paiement.
 */
export async function markExpeditionsPaid(clientNumber?: string | null) {
  const webhook = process.env.GOOGLE_SHEET_WEBHOOK
  if (!webhook || !clientNumber) return

  // Le code île est encodé au début du n° client : MTQ-xxx / GLP-xxx / GUY-xxx
  const destination = clientNumber.substring(0, 3).toUpperCase()

  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'mark_paid', clientNumber, destination }),
    })
  } catch (e) {
    console.error('Erreur mark_paid Google Sheet:', e)
  }
}
