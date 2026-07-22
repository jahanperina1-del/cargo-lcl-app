/**
 * Stripe Payment Integration
 * Gère les paiements par CBM dans l'espace client
 */

document.addEventListener('DOMContentLoaded', () => {
  checkPaymentStatus()
  initStripePayment()
})

// Vérifier si le paiement vient de réussir
function checkPaymentStatus() {
  const params = new URLSearchParams(window.location.search)
  const paymentSuccess = params.get('payment_success')
  const sessionId = params.get('session_id')

  if (paymentSuccess === 'true' && sessionId) {
    showPaymentSuccessMessage(sessionId)
    // Nettoyer l'URL
    window.history.replaceState({}, document.title, window.location.pathname)
  }
}

function showPaymentSuccessMessage(sessionId) {
  const msgContainer = document.createElement('div')
  msgContainer.className = 'payment-success-banner'
  msgContainer.innerHTML = `
    <div style="background: rgba(16,185,129,.1); border: 2px solid #10b981; border-radius: 8px; padding: 16px; margin-bottom: 20px; color: #065f46;">
      <strong>✓ Paiement reçu!</strong><br/>
      <small>Merci pour ton paiement. Tes fichiers d'expédition sont maintenant marqués comme payés.</small><br/>
      <small style="color: #047857;">Session: ${sessionId.slice(-8)}</small>
    </div>
  `

  const paymentSection = document.querySelector('.payment-section') || document.querySelector('.orders-section')
  if (paymentSection) {
    paymentSection.parentNode.insertBefore(msgContainer, paymentSection)
  }

  // Recharger les paiements pour mettre à jour le statut
  loadClientPayments()
}

// Charger les paiements du client pour vérifier ce qui a déjà été payé
async function loadClientPayments() {
  try {
    const client = JSON.parse(localStorage.getItem('cs_client') || '{}')
    if (!client.number) return

    // Chercher les paiements du client dans Supabase
    // Note: Cette fonction nécessite une API endpoint pour récupérer les paiements
    // Pour maintenant, on met à jour l'affichage via le localStorage
    localStorage.setItem('cs_payment_loaded', new Date().toISOString())
  } catch (err) {
    console.error('Erreur chargement paiements:', err)
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
