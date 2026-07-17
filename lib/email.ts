import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailClient {
  firstName: string
  lastName: string
  email: string
  clientNumber: string
}

export async function sendWelcomeEmail(client: EmailClient) {
  try {
    await resend.emails.send({
      from: 'Caribbean Supply <noreply@caribbeansupply.net>',
      to: client.email,
      subject: `🎉 Bienvenue chez Caribbean Supply - Votre numéro client: ${client.clientNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #0f766e 0%, #06b6d4 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">🎉 Bienvenue!</h1>
          </div>

          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px;">
            <p>Bonjour <strong>${client.firstName} ${client.lastName}</strong>,</p>

            <p>Votre compte Caribbean Supply a été créé avec succès!</p>

            <div style="background: white; border: 2px solid #06b6d4; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px;">Votre N° client</p>
              <p style="margin: 0; font-size: 28px; font-weight: bold; color: #06b6d4; font-family: monospace;">${client.clientNumber}</p>
            </div>

            <p><strong>⚠️ IMPORTANT:</strong> Indiquez ce numéro sur <strong>TOUS vos colis</strong> en Chine!</p>

            <h3 style="color: #0f766e; margin-top: 30px;">📦 Adresse du Warehouse:</h3>
            <div style="background: #f0f9ff; border-left: 4px solid #06b6d4; padding: 15px; border-radius: 4px; font-family: monospace; font-size: 14px;">
              Caribbean Supply<br/>
              深圳市龙岗区朗深科技园 102室<br/>
              <strong>📞 +86 19898149058</strong><br/>
              <strong>👤 Destinataire: Peggy</strong>
            </div>

            <h3 style="color: #0f766e; margin-top: 30px;">🚀 Prochaines étapes:</h3>
            <ol>
              <li>Donnez votre N° client à votre fournisseur</li>
              <li>Préparez vos colis avec <strong>codes articles (SKU)</strong></li>
              <li>Suivez votre expédition sur notre site</li>
              <li>Payez le fret en ligne (380€ HT/CBM)</li>
            </ol>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #666;">
              Des questions? Contactez-nous sur WhatsApp: <strong>+596 696 19 15 09</strong>
            </p>
          </div>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email bienvenue:', error)
    return { success: false }
  }
}

export async function sendPaymentConfirmationEmail(
  client: EmailClient,
  cbm: number,
  amount: number,
  invoiceNumber: string
) {
  try {
    await resend.emails.send({
      from: 'Caribbean Supply <noreply@caribbeansupply.net>',
      to: client.email,
      subject: `✅ Paiement confirmé - Facture ${invoiceNumber}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">✅ Paiement confirmé!</h1>
          </div>

          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px;">
            <p>Bonjour <strong>${client.firstName}</strong>,</p>

            <p>Votre paiement a été reçu avec succès! ✨</p>

            <div style="background: white; border: 2px solid #10b981; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px; color: #059669;">📄 Récapitulatif:</h3>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span>N° client:</span>
                <strong>${client.clientNumber}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Volume (CBM):</span>
                <strong>${cbm.toFixed(2)} CBM</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                <span>Prix unitaire:</span>
                <strong>380€ HT/CBM</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; font-weight: bold; font-size: 16px; color: #059669;">
                <span>Total:</span>
                <span>${amount.toFixed(2)}€</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; color: #666; font-size: 12px;">
                <span>Facture:</span>
                <strong>${invoiceNumber}</strong>
              </div>
            </div>

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px;"><strong>✓ Votre expédition est confirmée!</strong></p>
              <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Vous recevrez un email de suivi quand votre conteneur arrive à destination.</p>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Consultez l'onglet "Suivi" sur notre site pour voir l'état de votre expédition en temps réel.
            </p>
          </div>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email paiement:', error)
    return { success: false }
  }
}

export async function sendReminderEmail(client: EmailClient) {
  try {
    await resend.emails.send({
      from: 'Caribbean Supply <noreply@caribbeansupply.net>',
      to: client.email,
      subject: `📦 Rappel: Avez-vous préparé vos colis? (${client.clientNumber})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">📦 Petit rappel!</h1>
          </div>

          <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 10px 10px;">
            <p>Bonjour <strong>${client.firstName}</strong>,</p>

            <p>Nous avons remarqué que vous ne nous avez pas encore envoyé vos colis...</p>

            <div style="background: white; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold; color: #f59e0b;">📍 Adresse du warehouse:</p>
              <p style="margin: 10px 0 0; font-family: monospace; font-size: 14px; line-height: 1.6;">
                Caribbean Supply<br/>
                ${client.clientNumber}<br/>
                深圳市龙岗区朗深科技园 102室<br/>
                <strong>📞 +86 19898149058</strong><br/>
                <strong>👤 Peggy</strong>
              </p>
            </div>

            <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; font-size: 13px;"><strong>⚠️ N'oubliez pas:</strong></p>
              <ul style="margin: 5px 0 0; padding-left: 20px; font-size: 13px;">
                <li>Tous les colis DOIVENT avoir votre N° client</li>
                <li>Codes articles (SKU) obligatoires sur chaque carton</li>
                <li>Délai moyen: 60 jours jusqu'aux Antilles</li>
              </ul>
            </div>

            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Une fois vos colis envoyés, vous pourrez suivre votre expédition en temps réel sur notre site.
            </p>
          </div>
        </div>
      `,
    })
    return { success: true }
  } catch (error) {
    console.error('Erreur envoi email relance:', error)
    return { success: false }
  }
}
