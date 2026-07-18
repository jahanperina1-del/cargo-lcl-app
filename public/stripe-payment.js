/**
 * Stripe Payment Integration
 * Gère les paiements par CBM dans l'espace client
 */

document.addEventListener('DOMContentLoaded', () => {
  initStripePayment()
})

function initStripePayment() {
  const cbmInput = document.getElementById('paymentCBM')
  const amountDisplay = document.getElementById('paymentAmount')
  const payBtn = document.getElementById('stripePayBtn')

  if (!cbmInput || !payBtn) return

  // Le CBM est calculé automatiquement (colis reçus et vérifiés au warehouse,
  // moins ce qui est déjà payé) — le client ne le saisit plus lui-même.

  // Cliquer pour payer
  payBtn.addEventListener('click', async () => {
    const cbm = parseFloat(cbmInput.value)

    if (!cbm || cbm <= 0) {
      return
    }

    const amount = cbm * 380
    const restoreLabel = payBtn.textContent

    // Récupérer les infos client
    const client = JSON.parse(localStorage.getItem('cs_client') || '{}')
    if (!client.email) {
      alert('Veuillez vous connecter d\'abord')
      return
    }

    payBtn.disabled = true
    payBtn.textContent = 'Connexion Stripe...'

    try {
      // Appeler l'API pour créer une session Stripe
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cbm,
          amount,
          clientName: client.name,
          clientEmail: client.email,
          clientNumber: client.number,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur création session')
      }

      const { url } = await response.json()

      // Rediriger vers Stripe
      if (url) {
        window.location.href = url
      } else {
        alert('Impossible de créer la session de paiement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur: ' + error.message)
    } finally {
      payBtn.disabled = false
      payBtn.textContent = restoreLabel
    }
  })

  console.log('✓ Stripe Payment initialized')
}
