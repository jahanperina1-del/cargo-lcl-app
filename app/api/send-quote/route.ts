import { NextRequest, NextResponse } from 'next/server'
import { sendToGoogleSheet } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // 1. Sync Google Sheet
    await sendToGoogleSheet({ type: 'devis', ...data })

    // 2. Envoyer email (via Resend ou SendGrid)
    const emailResponse = await sendEmail({
      to: data.email,
      subject: `Votre Devis Cargo LCL - ${data.cbm} CBM - ${data.totalPrice}€`,
      html: generateEmailHTML(data),
    })

    // 3. Envoyer WhatsApp (via Twilio ou API direct)
    const whatsappMessage = `Devis reçu ✓\n\nNom: ${data.name}\nVolume: ${data.cbm} CBM\nDestination: ${data.destination}\nPrix: ${data.totalPrice}€\n\nDétails complets envoyés par email.`

    await sendWhatsApp(data.phone, whatsappMessage)

    return NextResponse.json({
      success: true,
      message: 'Devis envoyé avec succès'
    })
  } catch (error) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du devis' },
      { status: 500 }
    )
  }
}

async function sendEmail({ to, subject, html }: any) {
  // Utiliser Resend, SendGrid ou un service email
  // Pour maintenant, on affiche juste en console
  console.log('Email à envoyer:', { to, subject })

  // TODO: Intégrer un vrai service email
  return { success: true }
}

async function sendWhatsApp(phone: string, message: string) {
  // Utiliser Twilio, WhatsApp Cloud API ou autre
  console.log('WhatsApp à envoyer:', { phone, message })

  // TODO: Intégrer WhatsApp API
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
            <h1>Votre Devis Cargo LCL</h1>
          </div>

          <div class="section">
            <h2>Informations Client</h2>
            <p><strong>Nom:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Téléphone:</strong> ${data.phone}</p>
          </div>

          <div class="section">
            <h2>Détails Marchandises</h2>
            <p><strong>Type:</strong> ${data.productType}</p>
            <p><strong>Description:</strong> ${data.description}</p>
            <p><strong>Poids:</strong> ${data.weight} kg</p>
            <p><strong>Dimensions:</strong> ${data.length} x ${data.width} x ${data.height} cm</p>
            <p><strong>Volume (CBM):</strong> ${data.cbm}</p>
          </div>

          <div class="section">
            <h2>Détails Expédition</h2>
            <p><strong>Destination:</strong> ${data.destination}</p>
            <p><strong>Valeur marchandise:</strong> ${data.value}€</p>
          </div>

          <div class="section">
            <h2>Prix</h2>
            <p><strong>Tarif:</strong> 300€ / CBM</p>
            <p><strong>Fret estimé:</strong> <span class="price">${data.totalPrice}€</span></p>
            <p style="font-size: 12px; color: #999;">*Prix estimé, hors frais supplémentaires</p>
          </div>

          <div class="section" style="background: #fff; border: 2px solid #FF9500; text-align: center;">
            <p>Confirmez votre commande par WhatsApp ou répondez à cet email.</p>
            <p><a href="https://wa.me/596696191509" style="color: #25D366; text-decoration: none; font-weight: bold;">📱 Chat WhatsApp →</a></p>
          </div>

          <div class="footer">
            <p>© 2026 Cargo LCL - Service Client 24/7</p>
          </div>
        </div>
      </body>
    </html>
  `
}
