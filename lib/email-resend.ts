import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailClient {
  firstName: string
  lastName: string
  email: string
  clientNumber: string
}

// ============================================================
// EMAIL 1: WELCOME EMAIL (Après inscription)
// ============================================================
export async function sendWelcomeEmail(client: EmailClient) {
  try {
    await resend.emails.send({
      from: 'Caribbean Supply <noreply@caribbeansupply.net>',
      to: client.email,
      subject: `🎉 Bienvenue chez Caribbean Supply - Votre numéro client: ${client.clientNumber}`,
      template: 'welcome-email', // Template ID dans Resend
      props: {
        firstName: client.firstName,
        lastName: client.lastName,
        clientNumber: client.clientNumber,
      },
    })
    console.log(`✅ Welcome email envoyé à ${client.email}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur envoi welcome email:', error)
    return { success: false }
  }
}

// ============================================================
// EMAIL 2: PAYMENT CONFIRMATION (Après Stripe)
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
      template: 'payment-confirmation', // Template ID dans Resend
      props: {
        firstName: client.firstName,
        clientNumber: client.clientNumber,
        cbm: cbm.toFixed(2),
        amount: amount.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        ttcAmount: ttcAmount.toFixed(2),
        invoiceNumber: invoiceNumber,
        paymentDate: new Date().toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      },
    })
    console.log(`✅ Payment confirmation envoyée à ${client.email}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur envoi payment email:', error)
    return { success: false }
  }
}

// ============================================================
// EMAIL 3: 3-DAY REMINDER (3 jours après inscription)
// ============================================================
export async function sendReminderEmail(client: EmailClient) {
  try {
    await resend.emails.send({
      from: 'Caribbean Supply <noreply@caribbeansupply.net>',
      to: client.email,
      subject: `📦 ${client.firstName}, vos colis sont prêts? (${client.clientNumber})`,
      template: 'reminder-email', // Template ID dans Resend
      props: {
        firstName: client.firstName,
        clientNumber: client.clientNumber,
      },
    })
    console.log(`✅ Reminder email envoyé à ${client.email}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Erreur envoi reminder email:', error)
    return { success: false }
  }
}

// ============================================================
// UTILITY: Send reminder email after 3 days
// ============================================================
export async function scheduleReminderEmail(
  client: EmailClient,
  delayMinutes: number = 4320 // 3 jours par défaut
) {
  // Note: Ceci est une fonction helper
  // Pour 3 jours automatiques, tu auras besoin d'un job scheduler
  // (Bull, node-cron, ou une API externe comme AWS Lambda)

  setTimeout(() => {
    sendReminderEmail(client)
  }, delayMinutes * 60 * 1000)

  return { scheduled: true, delayMinutes }
}
