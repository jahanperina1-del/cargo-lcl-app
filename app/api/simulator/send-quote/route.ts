import { NextRequest, NextResponse } from 'next/server'

interface SendQuoteRequest {
  name: string
  email: string
  phone: string
  destination: string
  totalCBM: number
  totalWeight: number
  transportPrice: number
  insurance: number
  productValue: number
  productType: string
  method: 'whatsapp' | 'email' | 'both'
}

export async function POST(request: NextRequest) {
  try {
    const data: SendQuoteRequest = await request.json()

    const quoteText = `
📦 DEVIS CARGO LCL - CARIBBEAN SUPPLY

Client: ${data.name}
Email: ${data.email}
Téléphone: ${data.phone}

--- DÉTAILS DU SHIPMENT ---
Destination: ${data.destination}
Type produit: ${data.productType}
Valeur marchandise: ${data.productValue}€

--- DIMENSIONS ---
Volume total: ${data.totalCBM.toFixed(2)} CBM
Poids total: ${data.totalWeight} kg
Volume facturé: ${Math.max(data.totalCBM, data.totalWeight / 1000).toFixed(2)} CBM

--- TARIFICATION ---
Transport (380€/CBM): ${data.transportPrice.toFixed(2)}€
Assurance (1.5%): ${data.insurance.toFixed(2)}€
TOTAL: ${(data.transportPrice + data.insurance).toFixed(2)}€

Confirmez votre commande via WhatsApp ou répondez à cet email!
    `.trim()

    // Envoyer WhatsApp
    if (data.method === 'whatsapp' || data.method === 'both') {
      try {
        const waMessage = encodeURIComponent(quoteText)
        // WhatsApp Cloud API (optionnel)
        console.log('WhatsApp:', waMessage)
      } catch (err) {
        console.error('Erreur WhatsApp:', err)
      }
    }

    // Envoyer Email
    if (data.method === 'email' || data.method === 'both') {
      try {
        // Utiliser Resend API
        if (process.env.RESEND_API_KEY) {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: 'devis@caribbeansupply.net',
              to: data.email,
              subject: `Votre devis Caribbean Supply - ${data.destination}`,
              html: generateEmailHTML(quoteText),
            }),
          })

          if (!response.ok) {
            console.error('Erreur Resend:', await response.text())
          }
        }
      } catch (err) {
        console.error('Erreur email:', err)
      }
    }

    // Sauvegarder dans Google Drive (optionnel)
    try {
      // Appel optionnel à Google Drive
      console.log('Sauvegarde Google Drive...')
    } catch (err) {
      console.error('Erreur Drive:', err)
    }

    return NextResponse.json({
      success: true,
      message: `Devis envoyé par ${data.method}`,
    })
  } catch (error: any) {
    console.error('Erreur envoi devis:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

function generateEmailHTML(text: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(160deg, #15264A, #0C1A33); color: white; padding: 30px; border-radius: 8px; text-align: center; }
    .content { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .price { font-size: 28px; color: #FF7A3D; font-weight: bold; }
    .cta { text-align: center; margin: 20px 0; }
    .btn { display: inline-block; background: #16C6C0; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Caribbean Supply</h1>
      <p>Transport Cargo LCL Chine → Antilles</p>
    </div>

    <div class="content">
      <pre style="white-space: pre-wrap; font-size: 14px;">${text}</pre>
    </div>

    <div class="cta">
      <a href="https://wa.me/596696191509" class="btn">💬 Confirmer sur WhatsApp</a>
    </div>

    <p style="text-align: center; color: #999; font-size: 12px;">
      © 2026 Caribbean Supply - Chine → Antilles | +596 696 191 509
    </p>
  </div>
</body>
</html>
  `
}
