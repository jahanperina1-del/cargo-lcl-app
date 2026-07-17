import { NextRequest, NextResponse } from 'next/server'
import { sendToGoogleSheet } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Sync Google Sheet
    await sendToGoogleSheet({ type: 'sourcing', ...data })

    // Envoyer email
    await sendEmail({
      to: data.email,
      subject: `Devis Sourcing Reçu - ${data.productDescription.substring(0, 50)}... - ${data.price}€`,
      html: generateEmailHTML(data),
    })

    // Envoyer WhatsApp
    const whatsappMessage = `Devis Sourcing reçu ✓\n\nProduit: ${data.productDescription.substring(0, 50)}...\nQuantité: ${data.quantity}\nFrais: ${data.price}€\n\nDétails complets envoyés par email.`
    await sendWhatsApp(data.phone, whatsappMessage)

    return NextResponse.json({
      success: true,
      message: 'Demande de sourcing envoyée avec succès'
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la demande' },
      { status: 500 }
    )
  }
}

async function sendEmail({ to, subject, html }: any) {
  console.log('Email à envoyer:', { to, subject })
  return { success: true }
}

async function sendWhatsApp(phone: string, message: string) {
  console.log('WhatsApp à envoyer:', { phone, message })
  return { success: true }
}

function generateEmailHTML(data: any) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2D1B69; color: white; padding: 20px; border-radius: 8px; text-align: center; }
          .section { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .price { font-size: 32px; color: #FF9500; font-weight: bold; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Devis Sourcing Cargo LCL</h1>
          </div>

          <div class="section">
            <h2>Produit Recherché</h2>
            <p><strong>Description:</strong> ${data.productDescription}</p>
            <p><strong>Quantité:</strong> ${data.quantity} unités</p>
            <p><strong>Budget unitaire:</strong> ${data.budget ? data.budget + '€' : 'À discuter'}</p>
            <p><strong>Délai:</strong> ${data.deadline}</p>
          </div>

          <div class="section">
            <h2>Spécifications & Références</h2>
            <p>${data.specifications || 'Aucune spécification fournie'}</p>
          </div>

          <div class="section">
            <h2>Frais de Devis</h2>
            <p><strong>Frais de sourcing:</strong> <span class="price">${data.price}€</span></p>
            <p style="font-size: 12px; color: #999;">*Déduit du prix final si vous commandez via nous</p>
          </div>

          <div class="section" style="background: #fff; border: 2px solid #FF9500; text-align: center;">
            <h3>Prochaines étapes</h3>
            <p>1. Nous recherchons le meilleur fournisseur</p>
            <p>2. Nous vous envoyons les options dans 3-7 jours</p>
            <p>3. Vous validez et nous organisez la production</p>
            <p><a href="https://wa.me/596696191509" style="color: #25D366; text-decoration: none; font-weight: bold;">📱 Chat WhatsApp →</a></p>
          </div>

          <div class="footer">
            <p>© 2026 Cargo LCL - Service Sourcing + Cargo</p>
          </div>
        </div>
      </body>
    </html>
  `
}
