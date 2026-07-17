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

  // Mettre à jour le montant en temps réel
  cbmInput.addEventListener('input', () => {
    const cbm = parseFloat(cbmInput.value) || 0
    const amount = cbm * 380
    amountDisplay.textContent = `${amount.toFixed(2)}€`
  })

  // Cliquer pour payer
  payBtn.addEventListener('click', async () => {
    const cbm = parseFloat(cbmInput.value)

    if (!cbm || cbm <= 0) {
      alert('Veuillez entrer un volume valide (min 0.1 CBM)')
      return
    }

    const amount = cbm * 380

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
      payBtn.textContent = 'Payer avec Stripe'
    }
  })

  console.log('✓ Stripe Payment initialized')
}
