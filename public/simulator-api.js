/**
 * Simulator API Integration
 * Connecte le formulaire HTML aux APIs Next.js
 */

// Attendre que le DOM soit prêt
document.addEventListener('DOMContentLoaded', () => {
  initSimulatorAPI()
})

function initSimulatorAPI() {
  const waBtn = document.getElementById('waBtn')
  const mailBtn = document.getElementById('mailBtn')

  if (waBtn) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault()
      sendQuote('whatsapp')
    })
  }

  if (mailBtn) {
    mailBtn.addEventListener('click', (e) => {
      e.preventDefault()
      sendQuote('email')
    })
  }

  console.log('✓ Simulator API initialized')
}

/**
 * Envoyer le devis
 */
async function sendQuote(method) {
  try {
    // Collecter les données du formulaire
    const destination = document.querySelector('input[name="dest"]:checked')?.value
    const productType = document.getElementById('ptype')?.value
    const productValue = parseFloat(document.getElementById('pval')?.value || 0)

    if (!destination) {
      alert('Veuillez sélectionner une destination')
      return
    }

    // Récupérer les données des colis (depuis le JS du simulateur)
    const parcels = window.parcels || [] // À implémenter dans app.js
    if (parcels.length === 0) {
      alert('Veuillez ajouter au moins un colis')
      return
    }

    // Calculer CBM et poids
    let totalCBM = 0
    let totalWeight = 0
    for (const p of parcels) {
      totalCBM += (p.l * p.w * p.h) / 1000000
      totalWeight += p.weight
    }

    const billedCBM = Math.max(totalCBM, totalWeight / 1000)
    const transportPrice = billedCBM * 380
    const insurance = (productValue * 1.5) / 100

    // Afficher un loading
    const btn = method === 'whatsapp' ? document.getElementById('waBtn') : document.getElementById('mailBtn')
    const originalText = btn.textContent
    btn.disabled = true
    btn.textContent = 'Envoi...'

    // 1. Calculer le devis (optionnel, on peut calculer côté client aussi)
    const quoteResponse = await fetch('/api/simulator/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        destination,
        parcels,
        productType,
        productValue,
      }),
    })

    if (!quoteResponse.ok) throw new Error('Erreur calcul devis')
    const quote = await quoteResponse.json()

    // 2. Envoyer le devis
    const sendResponse = await fetch('/api/simulator/send-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Client', // À récupérer depuis un formulaire de contact
        email: 'contact@example.com',
        phone: '+596696191509',
        destination,
        totalCBM: quote.quote.totalCBM,
        totalWeight: quote.quote.totalWeight,
        transportPrice: quote.quote.transportPrice,
        insurance: quote.quote.insurance,
        productValue,
        productType,
        method,
      }),
    })

    if (!sendResponse.ok) throw new Error('Erreur envoi devis')

    // Success
    alert(`Devis envoyé par ${method === 'whatsapp' ? 'WhatsApp' : 'email'} !`)

    // Si WhatsApp, ouvrir dans une nouvelle fenêtre
    if (method === 'whatsapp') {
      const waMessage = encodeURIComponent(`
Bonjour,

Je souhaite envoyer une cargaison vers ${destination}.

📦 Volume: ${quote.quote.billedCBM.toFixed(2)} CBM
⚖️ Poids: ${quote.quote.totalWeight} kg
💰 Prix transport: ${quote.quote.transportPrice.toFixed(2)}€
🛡️ Assurance: ${quote.quote.insurance.toFixed(2)}€
---
💵 TOTAL: ${quote.quote.totalPrice.toFixed(2)}€

Merci!
      `.trim())
      window.open(`https://wa.me/596696191509?text=${waMessage}`, '_blank')
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de l\'envoi du devis: ' + error.message)
  } finally {
    const btn = method === 'whatsapp' ? document.getElementById('waBtn') : document.getElementById('mailBtn')
    btn.disabled = false
    btn.textContent = originalText
  }
}

/**
 * Exposer les fonctions globalement pour le HTML
 */
window.sendQuote = sendQuote
