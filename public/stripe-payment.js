/**
 * Stripe Payment Integration
 * Gère les paiements par CBM dans l'espace client
 */

document.addEventListener('DOMContentLoaded', () => {
  checkPaymentStatus()
  initStripePayment()
})

// Au retour du paiement Stripe : confirmer côté serveur (ce qui coche "Payé"
// dans Google Sheets) puis recharger sur une URL propre pour afficher le statut à jour.
async function checkPaymentStatus() {
  // Bannière affichée une seule fois après le rechargement propre
  const doneRef = sessionStorage.getItem('cs_payment_done')
  if (doneRef) {
    sessionStorage.removeItem('cs_payment_done')
    showPaymentSuccessMessage(doneRef)
  }

  const params = new URLSearchParams(window.location.search)
  const sessionId = params.get('session_id')
  if (params.get('payment_success') === 'true' && sessionId) {
    try {
      // Marque les colis reçus comme "Payé" (le webhook Stripe le refait en secours)
      await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })
    } catch (e) {
      console.error('Erreur confirmation paiement:', e)
    }

    sessionStorage.setItem('cs_payment_done', sessionId.slice(-8))
    // Recharge sur l'URL sans les paramètres → les expéditions se rechargent à jour
    window.location.replace(window.location.pathname)
  }
}

function showPaymentSuccessMessage(ref) {
  const msgContainer = document.createElement('div')
  msgContainer.className = 'payment-success-banner'
  msgContainer.innerHTML = `
    <div style="background: rgba(16,185,129,.1); border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px; color: #065f46;">
      <strong>✓ Paiement reçu !</strong><br/>
      <small>Merci ! Vos colis réglés sont maintenant marqués comme payés.</small><br/>
      <small style="color: #047857;">Réf : ${ref}</small>
    </div>
  `

  const anchor = document.querySelector('.orders-section') || document.querySelector('.expedition-section')
  if (anchor && anchor.parentNode) {
    anchor.parentNode.insertBefore(msgContainer, anchor)
  }
}

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
      alert('Veuillez saisir un montant valide')
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
