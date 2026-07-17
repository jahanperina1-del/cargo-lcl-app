// ============================================================
// EMAIL TEMPLATE GENERATOR - SCRIPTS AUTONOMES
// Génère les emails HTML avec les variables du client
// ============================================================

// Couleurs du site Caribbean Supply
const COLORS = {
  primary: '#0f766e', // Turquoise foncé
  secondary: '#06b6d4', // Turquoise clair
  success: '#10b981', // Vert
  warning: '#f59e0b', // Orange
  danger: '#dc2626', // Rouge
  light: '#f8fafc',
  white: '#ffffff',
}

interface ClientData {
  firstName: string
  lastName: string
  email: string
  clientNumber: string
  destination?: string
}

interface PaymentData extends ClientData {
  cbm: number
  amount: number
  invoiceNumber: string
}

// ============================================================
// EMAIL 1: WELCOME EMAIL
// ============================================================
export function generateWelcomeEmail(client: ClientData): string {
  const warehousePhone = '+86 19898149058'
  const warehouseName = 'Peggy'
  const supportWhatsApp = '+596 696 19 15 09'
  const pricePerCBM = '380€ HT/CBM'
  const deliveryTime = '~60 jours'
  const siteUrl = 'https://caribbeansupply.net'

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bienvenue chez Caribbean Supply</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc;">
      <div style="max-width: 650px; margin: 0 auto; background: white;">

        <!-- HERO -->
        <div style="background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%); color: white; padding: 50px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 36px; font-weight: bold;">🌍 Bienvenue à bord!</h1>
          <p style="margin: 12px 0 0; font-size: 18px; opacity: 0.95;">Votre aventure logistique commence maintenant</p>
        </div>

        <!-- BODY -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Salut <strong>${client.firstName}</strong>! 🚀</p>

          <p style="font-size: 15px; line-height: 1.8; color: #555; margin: 0 0 20px;">
            Vous venez de franchir la première étape de votre expansion en Asie!
            <strong style="color: ${COLORS.primary};">Félicitations!</strong> 🎉
          </p>

          <p style="font-size: 15px; line-height: 1.8; color: #555; margin: 0 0 25px;">
            Vous avez maintenant accès au <strong>système complet de groupage LCL</strong> vers les Antilles.
            De la Chine aux Antilles, nous gérons tout pour vous.
          </p>

          <!-- CLIENT NUMBER -->
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 3px solid ${COLORS.secondary}; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 10px; font-size: 12px; color: #0c4a6e; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">📌 Votre identifiant unique</p>
            <p style="margin: 0; font-size: 40px; font-weight: bold; color: ${COLORS.secondary}; font-family: 'Courier New', monospace; letter-spacing: 3px;">${client.clientNumber}</p>
            <p style="margin: 15px 0 0; font-size: 12px; color: ${COLORS.warning}; font-weight: bold;">⚠️ À INDIQUER SUR TOUS LES COLIS</p>
          </div>

          <!-- WAREHOUSE -->
          <h2 style="color: ${COLORS.primary}; font-size: 18px; margin: 35px 0 15px; font-weight: bold;">📍 Voici où envoyer vos colis:</h2>
          <div style="background: #fffbeb; border-left: 5px solid ${COLORS.warning}; padding: 20px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.9;">
            <strong style="font-size: 15px;">Caribbean Supply</strong><br/>
            <strong style="color: ${COLORS.warning}; font-size: 16px;">${client.clientNumber}</strong><br/>
            <br/>
            深圳市龙岗区朗深科技园 102室<br/>
            <strong style="color: #b45309;">📞 ${warehousePhone}</strong><br/>
            <strong style="color: #b45309;">👤 Demander: ${warehouseName}</strong>
          </div>

          <!-- WARNING -->
          <div style="background: #fee2e2; border-left: 5px solid ${COLORS.danger}; padding: 18px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 10px; font-weight: bold; color: #991b1b; font-size: 15px;">🚫 ATTENTION - Les SKU codes sont OBLIGATOIRES!</p>
            <p style="margin: 0 0 12px; font-size: 13px; color: #7f1d1d;">
              <strong>SANS codes articles, vos colis seront refusés au warehouse.</strong>
            </p>
            <p style="margin: 0; font-size: 12px; color: #7f1d1d;">
              Format recommandé sur chaque carton:<br/>
              <strong style="font-family: monospace;">SKU-12345-A | Qty: 50 pcs | N°: ${client.clientNumber}</strong>
            </p>
          </div>

          <!-- NEXT STEPS -->
          <h2 style="color: ${COLORS.primary}; font-size: 18px; margin: 30px 0 15px; font-weight: bold;">🎯 Par où commencer?</h2>
          <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 5px solid ${COLORS.secondary};">
            <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 2; color: #0c4a6e;">
              <li><strong>Donnez</strong> ce numéro à votre fournisseur: <strong style="font-family: monospace;">${client.clientNumber}</strong></li>
              <li><strong>Exigez</strong> des codes SKU sur CHAQUE carton (non-négociable)</li>
              <li><strong>Envoyez</strong> vos colis au warehouse ci-dessus</li>
              <li><strong>Suivez</strong> votre expédition en temps réel</li>
              <li><strong>Payez</strong> une fois reçu (${pricePerCBM})</li>
            </ol>
          </div>

          <!-- INFO -->
          <div style="background: #ecfdf5; border-left: 5px solid ${COLORS.success}; padding: 18px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #065f46;">⏱️ Délai: ${deliveryTime} jusqu'aux Antilles</p>
            <p style="margin: 6px 0 0; font-size: 13px; color: #065f46;">Tarif: <strong>${pricePerCBM}</strong> (tout compris)</p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}/espace-client.html" style="display: inline-block; background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%); color: white; padding: 16px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 8px;">
              📊 Accéder à mon compte
            </a>
            <br/>
            <a href="https://wa.me/596696191509?text=Salut%20Peggy%2C%20j%27ai%20des%20questions" style="display: inline-block; background: #25d366; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 8px;">
              💬 Parler à Peggy (WhatsApp)
            </a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 2px solid #e5e7eb;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #666; font-weight: bold;">Caribbean Supply LCL</p>
          <p style="margin: 0; font-size: 11px; color: #999;">Chine → Antilles françaises en 60 jours</p>
        </div>

      </div>
    </body>
    </html>
  `
}

// ============================================================
// EMAIL 2: PAYMENT CONFIRMATION EMAIL
// ============================================================
export function generatePaymentEmail(data: PaymentData): string {
  const siteUrl = 'https://caribbeansupply.net'
  const supportWhatsApp = '+596 696 19 15 09'
  const taxAmount = data.amount * 0.085
  const ttcAmount = data.amount + taxAmount
  const paymentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Paiement confirmé</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc;">
      <div style="max-width: 650px; margin: 0 auto; background: white;">

        <!-- HERO -->
        <div style="background: linear-gradient(135deg, ${COLORS.success} 0%, #059669 100%); color: white; padding: 50px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 36px; font-weight: bold;">✅ C'est parti!</h1>
          <p style="margin: 12px 0 0; font-size: 18px; opacity: 0.95;">Votre expédition est activée</p>
        </div>

        <!-- BODY -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;"><strong>${data.firstName}</strong>, merci! 🎊</p>

          <p style="font-size: 15px; line-height: 1.8; color: #555; margin: 0 0 25px;">
            Votre paiement a été confirmé et <strong style="color: ${COLORS.success};">votre expédition est maintenant ACTIVE</strong>!
            Votre conteneur est prêt à quitter la Chine dès que vos colis arrivent au warehouse.
          </p>

          <!-- INVOICE -->
          <div style="background: #f0fdf4; border: 2px solid ${COLORS.success}; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h2 style="margin: 0 0 20px; color: #059669; font-size: 16px; font-weight: bold;">📄 Voici votre facture:</h2>

            <div style="background: white; padding: 15px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
                <span style="color: #666;">N° client:</span>
                <strong style="font-family: monospace; color: #059669;">${data.clientNumber}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
                <span style="color: #666;">Facture:</span>
                <strong style="font-family: monospace; color: #059669;">#${data.invoiceNumber}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
                <span style="color: #666;">Date:</span>
                <strong>${paymentDate}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid #e5e7eb; font-size: 14px; font-weight: bold;">
                <span>Volume:</span>
                <strong>${data.cbm.toFixed(2)} CBM</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
                <span style="color: #666;">Tarif:</span>
                <strong>380€ HT/CBM</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 2px solid #e5e7eb; font-size: 14px;">
                <span style="font-weight: bold;">Sous-total (HT):</span>
                <strong style="color: ${COLORS.success};">${data.amount.toFixed(2)}€</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px;">
                <span>TVA (8.5%):</span>
                <strong>${taxAmount.toFixed(2)}€</strong>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 12px 0; font-size: 16px; font-weight: bold; color: ${COLORS.success};">
                <span>TOTAL TTC:</span>
                <span style="font-size: 20px;">${ttcAmount.toFixed(2)}€</span>
              </div>
            </div>
          </div>

          <!-- TIMELINE -->
          <h2 style="color: ${COLORS.success}; font-size: 18px; margin: 30px 0 15px; font-weight: bold;">📊 Que se passe-t-il maintenant?</h2>
          <div style="background: white; border-left: 5px solid ${COLORS.success}; padding: 20px; border-radius: 8px;">
            <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 2;">
              <li style="color: #065f46;"><strong>Vos colis arrivent</strong> au warehouse (Shenzhen)</li>
              <li style="color: #065f46;"><strong>Tri & regroupement</strong> dans le conteneur</li>
              <li style="color: #065f46;"><strong>Départ vers les Antilles</strong> (~60 jours)</li>
              <li style="color: #065f46;"><strong>Livraison à destination</strong> (Martinique/Guadeloupe/Guyane)</li>
            </ol>
          </div>

          <!-- TRACKING -->
          <div style="background: #e0f2fe; border-left: 5px solid ${COLORS.secondary}; padding: 18px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #0c4a6e;">📍 Suivi en temps réel</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #0c4a6e;">
              Consultez la page "Suivi" pour voir où est votre conteneur 24/7.
              <strong>Aucune surprise, tout est transparent!</strong>
            </p>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}/suivi" style="display: inline-block; background: linear-gradient(135deg, ${COLORS.success} 0%, #059669 100%); color: white; padding: 16px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 8px;">
              📊 Suivre mon expédition
            </a>
            <br/>
            <a href="${siteUrl}/espace-client.html" style="display: inline-block; background: ${COLORS.secondary}; color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 8px;">
              📋 Retour au compte
            </a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 2px solid #e5e7eb;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #666; font-weight: bold;">Des questions?</p>
          <p style="margin: 0; font-size: 11px; color: #999;">
            <a href="https://wa.me/596696191509" style="color: #25d366; text-decoration: none; font-weight: bold;">WhatsApp ${supportWhatsApp}</a>
            ou contact@caribbeansupply.fr
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}

// ============================================================
// EMAIL 3: REMINDER EMAIL
// ============================================================
export function generateReminderEmail(client: ClientData): string {
  const siteUrl = 'https://caribbeansupply.net'
  const supportWhatsApp = '+596 696 19 15 09'
  const warehousePhone = '+86 19898149058'
  const warehouseName = 'Peggy'

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rappel - Vos colis</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc;">
      <div style="max-width: 650px; margin: 0 auto; background: white;">

        <!-- HERO -->
        <div style="background: linear-gradient(135deg, ${COLORS.warning} 0%, #f97316 100%); color: white; padding: 50px 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 36px; font-weight: bold;">📦 Et vos colis?</h1>
          <p style="margin: 12px 0 0; font-size: 18px; opacity: 0.95;">Petit coup de pouce! 🚀</p>
        </div>

        <!-- BODY -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px;">Coucou <strong>${client.firstName}</strong>! 👋</p>

          <p style="font-size: 15px; line-height: 1.8; color: #555; margin: 0 0 25px;">
            Ça fait 3 jours que votre compte est actif et <strong style="color: ${COLORS.warning};">on a hâte de commencer!</strong> 🎉
            <br/><br/>
            Avez-vous déjà contacté votre fournisseur chinois pour envoyer vos colis?
          </p>

          <!-- WAREHOUSE -->
          <div style="background: #fffbeb; border: 3px solid ${COLORS.warning}; border-radius: 12px; padding: 25px; margin: 25px 0;">
            <h2 style="margin: 0 0 15px; color: #b45309; font-size: 16px; font-weight: bold;">📍 Où envoyer:</h2>
            <div style="background: white; padding: 15px; border-radius: 8px; font-family: 'Courier New', monospace; font-size: 13px; line-height: 1.8;">
              <strong style="font-size: 15px;">Caribbean Supply</strong><br/>
              <strong style="color: ${COLORS.warning}; font-size: 16px;">${client.clientNumber}</strong><br/>
              <br/>
              深圳市龙岗区朗深科技园 102室<br/>
              <strong style="color: #b45309;">📞 ${warehousePhone}</strong><br/>
              <strong style="color: #b45309;">👤 ${warehouseName}</strong>
            </div>
          </div>

          <!-- CHECKLIST -->
          <h2 style="color: #b45309; font-size: 18px; margin: 30px 0 15px; font-weight: bold;">✅ Avant d'envoyer:</h2>
          <div style="background: #fee2e2; border-left: 5px solid ${COLORS.danger}; padding: 20px; border-radius: 8px;">
            <p style="margin: 0 0 15px; font-weight: bold; color: #991b1b; font-size: 14px;">🚫 LISTE DE VÉRIFICATION (NON-NÉGOCIABLE):</p>

            <div style="background: white; padding: 15px; border-radius: 8px;">
              <div style="display: flex; gap: 10px; margin: 10px 0; font-size: 13px;">
                <span style="font-size: 20px;">☐</span>
                <div>
                  <p style="margin: 0; font-weight: bold; color: #991b1b;">N° client écrit en GROS sur chaque carton</p>
                  <p style="margin: 4px 0 0; font-size: 11px; color: #7f1d1d;">${client.clientNumber}</p>
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin: 10px 0; font-size: 13px;">
                <span style="font-size: 20px;">☐</span>
                <div>
                  <p style="margin: 0; font-weight: bold; color: #991b1b;">SKU Code lisible sur chaque carton</p>
                  <p style="margin: 4px 0 0; font-size: 11px; color: #7f1d1d;">Ex: SKU-12345-A | Qty: 50 pcs</p>
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin: 10px 0; font-size: 13px;">
                <span style="font-size: 20px;">☐</span>
                <div>
                  <p style="margin: 0; font-weight: bold; color: #991b1b;">Quantité marquée clairement</p>
                  <p style="margin: 4px 0 0; font-size: 11px; color: #7f1d1d;">En chiffres (50 pcs, 100 kg, etc.)</p>
                </div>
              </div>

              <div style="display: flex; gap: 10px; margin: 10px 0; font-size: 13px;">
                <span style="font-size: 20px;">☐</span>
                <div>
                  <p style="margin: 0; font-weight: bold; color: #991b1b;">Description du produit</p>
                  <p style="margin: 4px 0 0; font-size: 11px; color: #7f1d1d;">Au verso du carton (utile pour la douane)</p>
                </div>
              </div>
            </div>

            <p style="margin: 15px 0 0; font-size: 12px; color: #991b1b; font-weight: bold;">
              ⚠️ PAS DE SKU = COLIS REFUSÉ. Pas de compromis là-dessus!
            </p>
          </div>

          <!-- BENEFITS -->
          <div style="background: #ecfdf5; border-left: 5px solid ${COLORS.success}; padding: 18px; border-radius: 8px; margin: 25px 0;">
            <p style="margin: 0 0 10px; font-size: 14px; font-weight: bold; color: #065f46;">✨ Pourquoi dépêcher?</p>
            <ul style="margin: 8px 0 0; padding-left: 20px; font-size: 13px; color: #065f46; line-height: 1.8;">
              <li>Plus tôt les colis arrivent = plus tôt vous payez = plus tôt ils livrent</li>
              <li>Économies sur le stockage warehouse</li>
              <li>Suivi en temps réel de votre expédition</li>
            </ul>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://wa.me/596696191509?text=Salut%20Peggy%2C%20j%27ai%20une%20question%20sur%20mes%20colis" style="display: inline-block; background: #25d366; color: white; padding: 16px 35px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 8px;">
              💬 Parler à Peggy (WhatsApp)
            </a>
            <br/>
            <a href="${siteUrl}/espace-client.html" style="display: inline-block; background: linear-gradient(135deg, ${COLORS.warning} 0%, #f97316 100%); color: white; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; margin: 8px;">
              📊 Mon compte
            </a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 2px solid #e5e7eb;">
          <p style="margin: 0 0 8px; font-size: 12px; color: #666; font-weight: bold;">On attend vos colis! 📦</p>
          <p style="margin: 0; font-size: 11px; color: #999;">
            <a href="https://wa.me/596696191509" style="color: #25d366; text-decoration: none; font-weight: bold;">WhatsApp ${supportWhatsApp}</a>
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}
