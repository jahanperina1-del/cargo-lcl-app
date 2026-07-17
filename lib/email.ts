import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://caribbeansupply.net'
const WAREHOUSE_PHONE = '+86 19898149058'
const WAREHOUSE_NAME = 'Peggy'
const SUPPORT_WHATSAPP = '+596 696 19 15 09'
const PRICE_PER_CBM = '380€ HT/CBM'
const DELIVERY_TIME = '~60 jours'

interface EmailClient {
  firstName: string
  lastName: string
  email: string
  clientNumber: string
}

// ============================================================
// TEMPLATE 1: EMAIL DE BIENVENUE (Après inscription)
// ============================================================
export async function sendWelcomeEmail(client: EmailClient) {
  try {
    await resend.emails.send({
      from: 'Caribbean Supply <noreply@caribbeansupply.net>',
      to: client.email,
      subject: `🎉 Bienvenue chez Caribbean Supply - Votre numéro client: ${client.clientNumber}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <!-- HEADER -->
          <div style="background: linear-gradient(135deg, #0f766e 0%, #06b6d4 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🎉 Bienvenue!</h1>
            <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Caribbean Supply LCL</p>
          </div>

          <!-- BODY -->
          <div style="padding: 40px 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${client.firstName} ${client.lastName}</strong>,</p>

            <p style="font-size: 15px; line-height: 1.6; color: #555;">Votre compte Caribbean Supply a été créé avec succès! 🎊</p>

            <!-- CLIENT NUMBER BOX -->
            <div style="background: white; border: 3px solid #06b6d4; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <p style="margin: 0 0 12px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">📌 Votre Numéro Client</p>
              <p style="margin: 0; font-size: 32px; font-weight: bold; color: #06b6d4; font-family: 'Courier New', monospace; letter-spacing: 2px;">${client.clientNumber}</p>
              <p style="margin: 12px 0 0; font-size: 12px; color: #f59e0b; font-weight: bold;">⚠️ À INDIQUER SUR TOUS VOS COLIS</p>
            </div>

            <!-- WAREHOUSE INFO -->
            <h3 style="color: #0f766e; margin: 30px 0 15px; font-size: 18px; font-weight: bold;">📦 Adresse du Warehouse (Shenzhen):</h3>
            <div style="background: #f0f9ff; border-left: 5px solid #06b6d4; padding: 18px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 14px; line-height: 1.8;">
              <strong>Caribbean Supply</strong><br/>
              <strong>${client.clientNumber}</strong><br/>
              <br/>
              深圳市龙岗区朗深科技园 102室<br/>
              <strong style="color: #06b6d4;">📞 ${WAREHOUSE_PHONE}</strong><br/>
              <strong style="color: #06b6d4;">👤 Contact: ${WAREHOUSE_NAME}</strong>
            </div>

            <!-- IMPORTANT REQUIREMENTS -->
            <div style="background: #fff5e6; border-left: 5px solid #f59e0b; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 12px; font-weight: bold; color: #b45309;">⚠️ IMPORTANT - Codes Articles Obligatoires:</p>
              <ul style="margin: 8px 0; padding-left: 20px; font-size: 14px;">
                <li style="margin: 6px 0;"><strong>SKU Code</strong> sur chaque carton</li>
                <li style="margin: 6px 0;"><strong>Votre N° Client:</strong> ${client.clientNumber}</li>
                <li style="margin: 6px 0;"><strong>Quantité</strong> visible</li>
              </ul>
              <p style="margin: 12px 0 0; font-size: 12px; color: #92400e;">❌ Pas de code article = Colis refusé au warehouse</p>
            </div>

            <!-- NEXT STEPS -->
            <h3 style="color: #0f766e; margin: 30px 0 15px; font-size: 18px; font-weight: bold;">🚀 Prochaines étapes:</h3>
            <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                <li style="margin: 8px 0;"><strong>Communiquez</strong> votre N° client à votre fournisseur chinois</li>
                <li style="margin: 8px 0;"><strong>Préparez</strong> vos colis avec codes articles (SKU)</li>
                <li style="margin: 8px 0;"><strong>Envoyez</strong> vos colis au warehouse</li>
                <li style="margin: 8px 0;"><strong>Suivez</strong> votre expédition en temps réel</li>
                <li style="margin: 8px 0;"><strong>Payez</strong> le fret en ligne (${PRICE_PER_CBM})</li>
              </ol>
            </div>

            <!-- INFO BOX -->
            <div style="background: #ecfdf5; border-left: 5px solid #10b981; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>📊 Tarifs & Délais:</strong></p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #065f46;">• <strong>${PRICE_PER_CBM}</strong> (transport LCL)<br/>• <strong>${DELIVERY_TIME}</strong> jusqu'aux Antilles</p>
            </div>

            <!-- FOOTER -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #666;">Des questions? Contactez-nous:</p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong style="color: #06b6d4;">WhatsApp:</strong> ${SUPPORT_WHATSAPP}<br/>
                <strong style="color: #06b6d4;">Email:</strong> contact@caribbeansupply.fr
              </p>
            </div>
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

// ============================================================
// TEMPLATE 2: CONFIRMATION DE PAIEMENT (Après Stripe)
// ============================================================
export async function sendPaymentConfirmationEmail(
  client: EmailClient,
  cbm: number,
  amount: number,
  invoiceNumber: string
) {
  try {
    const taxAmount = amount * 0.085 // TVA 8.5%
    const ttcAmount = amount + taxAmount

    await resend.emails.send({
      from: 'Caribbean Supply <noreply@caribbeansupply.net>',
      to: client.email,
      subject: `✅ Paiement confirmé - Facture #${invoiceNumber}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <!-- HEADER -->
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">✅ Paiement confirmé!</h1>
            <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Votre expédition est activée</p>
          </div>

          <!-- BODY -->
          <div style="padding: 40px 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${client.firstName}</strong>,</p>

            <p style="font-size: 15px; line-height: 1.6; color: #555;">Votre paiement a été reçu et confirmé! 🎉</p>

            <!-- INVOICE BOX -->
            <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h3 style="margin: 0 0 20px; color: #059669; font-size: 18px; font-weight: bold;">📄 Récapitulatif de facturation:</h3>

              <!-- INVOICE DETAILS -->
              <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                  <span style="color: #666;">N° client:</span>
                  <strong style="color: #059669; font-family: monospace;">${client.clientNumber}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                  <span style="color: #666;">Facture:</span>
                  <strong style="color: #059669; font-family: monospace;">#${invoiceNumber}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px;">
                  <span style="color: #666;">Date:</span>
                  <strong>${new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                </div>
              </div>

              <!-- PRICING BREAKDOWN -->
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                  <span>Volume:</span>
                  <strong>${cbm.toFixed(2)} CBM</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                  <span>Tarif:</span>
                  <strong>${PRICE_PER_CBM}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 2px solid #e5e7eb;">
                  <span style="font-weight: bold;">Sous-total (HT):</span>
                  <strong style="color: #059669;">${amount.toFixed(2)}€</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                  <span>TVA (8.5%):</span>
                  <strong>${taxAmount.toFixed(2)}€</strong>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; font-weight: bold; color: #059669;">
                  <span>TOTAL TTC:</span>
                  <span style="font-size: 20px;">${ttcAmount.toFixed(2)}€</span>
                </div>
              </div>
            </div>

            <!-- SUCCESS MESSAGE -->
            <div style="background: #f0fdf4; border-left: 5px solid #10b981; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 15px; color: #065f46;"><strong>✓ Votre expédition est activée!</strong></p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #065f46;">Vous recevrez un email de notification quand votre conteneur quitte la Chine.</p>
            </div>

            <!-- NEXT STEPS -->
            <h3 style="color: #059669; margin: 30px 0 15px; font-size: 16px; font-weight: bold;">📋 Que se passe-t-il ensuite?</h3>
            <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 2;">
                <li><strong>Arrivée au warehouse:</strong> Vos colis sont reçus et triés</li>
                <li><strong>Conteneurisation:</strong> Vos produits sont regroupés</li>
                <li><strong>Départ:</strong> Le conteneur part vers les Antilles</li>
                <li><strong>Livraison:</strong> Réception aux Antilles (${DELIVERY_TIME})</li>
              </ol>
            </div>

            <!-- TRACKING INFO -->
            <div style="background: #e0f2fe; border-left: 5px solid #06b6d4; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #0c4a6e;"><strong>📊 Suivi en temps réel:</strong></p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #0c4a6e;">Visitez la page "Suivi" pour voir l'état de votre expédition en direct</p>
            </div>

            <!-- SUPPORT -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #666;">Des questions sur votre facture?</p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong style="color: #059669;">WhatsApp:</strong> ${SUPPORT_WHATSAPP}<br/>
                <strong style="color: #059669;">Email:</strong> contact@caribbeansupply.fr
              </p>
            </div>
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

// ============================================================
// TEMPLATE 3: EMAIL DE RELANCE (3 jours après inscription)
// ============================================================
export async function sendReminderEmail(client: EmailClient) {
  try {
    await resend.emails.send({
      from: 'Caribbean Supply <noreply@caribbeansupply.net>',
      to: client.email,
      subject: `📦 ${client.firstName}, vos colis sont prêts? (${client.clientNumber})`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <!-- HEADER -->
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">📦 Un petit rappel!</h1>
            <p style="margin: 8px 0 0; font-size: 16px; opacity: 0.9;">Vous êtes bien enregistré, et après?</p>
          </div>

          <!-- BODY -->
          <div style="padding: 40px 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; line-height: 1.6;">Bonjour <strong>${client.firstName}</strong>,</p>

            <p style="font-size: 15px; line-height: 1.6; color: #555;">Vous êtes inscrit depuis 3 jours maintenant! 🎉 Avez-vous commencé à préparer vos colis?</p>

            <!-- WAREHOUSE INFO REMINDER -->
            <div style="background: white; border: 3px solid #f59e0b; border-radius: 12px; padding: 25px; margin: 25px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h3 style="margin: 0 0 15px; color: #b45309; font-size: 16px; font-weight: bold;">📍 Adresse du Warehouse (à envoyer à votre fournisseur):</h3>
              <div style="background: #fffbeb; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8;">
                <strong>Caribbean Supply</strong><br/>
                <strong style="color: #f59e0b; font-size: 16px;">${client.clientNumber}</strong><br/>
                <br/>
                深圳市龙岗区朗深科技园 102室<br/>
                <strong style="color: #b45309;">📞 ${WAREHOUSE_PHONE}</strong><br/>
                <strong style="color: #b45309;">👤 Destinataire: ${WAREHOUSE_NAME}</strong>
              </div>
            </div>

            <!-- CRITICAL REQUIREMENTS -->
            <div style="background: #fee2e2; border-left: 5px solid #dc2626; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 12px; font-weight: bold; color: #991b1b; font-size: 15px;">🚫 COLIS SANS SKU = REFUSÉ!</p>
              <p style="margin: 0 0 12px; font-size: 14px; color: #7f1d1d;">Chaque carton DOIT avoir:</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #7f1d1d;">
                <li style="margin: 6px 0;"><strong>N° Client:</strong> ${client.clientNumber}</li>
                <li style="margin: 6px 0;"><strong>Code Article (SKU)</strong> lisible</li>
                <li style="margin: 6px 0;"><strong>Quantité</strong> indiquée</li>
              </ul>
            </div>

            <!-- CHECKLIST -->
            <h3 style="color: #b45309; margin: 30px 0 15px; font-size: 16px; font-weight: bold;">✅ Checklist avant d'envoyer:</h3>
            <div style="background: white; padding: 18px; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="display: flex; gap: 12px; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                <span style="font-size: 18px;">□</span>
                <div>
                  <p style="margin: 0; font-weight: bold;">Tous les colis ont votre N° client (${client.clientNumber})</p>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Sur l'étiquette en gros caractères</p>
                </div>
              </div>
              <div style="display: flex; gap: 12px; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                <span style="font-size: 18px;">□</span>
                <div>
                  <p style="margin: 0; font-weight: bold;">Codes articles (SKU) visibles sur chaque carton</p>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Format recommandé: SKU-XXXXX-A | Qty: XX pcs</p>
                </div>
              </div>
              <div style="display: flex; gap: 12px; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                <span style="font-size: 18px;">□</span>
                <div>
                  <p style="margin: 0; font-weight: bold;">Quantité écrite clairement</p>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #666;">En chiffres (50 pcs, 100 kg, etc.)</p>
                </div>
              </div>
              <div style="display: flex; gap: 12px; padding: 10px 0; font-size: 14px;">
                <span style="font-size: 18px;">□</span>
                <div>
                  <p style="margin: 0; font-weight: bold;">Prêt à envoyer à l'adresse du warehouse</p>
                  <p style="margin: 4px 0 0; font-size: 12px; color: #666;">Address ci-dessus</p>
                </div>
              </div>
            </div>

            <!-- WHAT HAPPENS NEXT -->
            <div style="background: #ecfdf5; border-left: 5px solid #10b981; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #065f46;"><strong>📊 Une fois vos colis arrivés:</strong></p>
              <ol style="margin: 8px 0 0; padding-left: 20px; font-size: 13px; color: #065f46; line-height: 1.8;">
                <li>Réception et tri au warehouse</li>
                <li>Regroupement dans les conteneurs</li>
                <li>Départ vers les Antilles (${DELIVERY_TIME})</li>
                <li>Suivi en temps réel sur notre site</li>
              </ol>
            </div>

            <!-- PRICING REMINDER -->
            <div style="background: #e0f2fe; border-left: 5px solid #06b6d4; padding: 18px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #0c4a6e;"><strong>💳 Tarifs:</strong></p>
              <p style="margin: 8px 0 0; font-size: 13px; color: #0c4a6e;"><strong>${PRICE_PER_CBM}</strong> TTC (transport LCL)<br/>Paiement en ligne simple et sécurisé</p>
            </div>

            <!-- CALL TO ACTION -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${SITE_URL}/espace-client.html" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px;">
                📊 Consulter mon espace
              </a>
            </div>

            <!-- SUPPORT -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #666;">Des questions? On est là pour aider!</p>
              <p style="margin: 4px 0; font-size: 13px;">
                <strong style="color: #b45309;">WhatsApp:</strong> ${SUPPORT_WHATSAPP}<br/>
                <strong style="color: #b45309;">Email:</strong> contact@caribbeansupply.fr
              </p>
            </div>
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
