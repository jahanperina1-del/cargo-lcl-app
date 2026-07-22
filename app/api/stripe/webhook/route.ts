import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import { createClient } from '@supabase/supabase-js'
import { markExpeditionsPaid } from '@/lib/mark-expeditions-paid'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

/**
 * Webhook pour les événements Stripe
 * POST /api/stripe/webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    // Vérifier la signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Erreur signature webhook:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Traiter les événements pertinents
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log(`✓ Session complétée: ${session.id}`)

        // Récupérer les infos du paiement
        if (session.payment_status === 'paid' && session.metadata) {
          const clientNumber = session.metadata.clientNumber
          const clientName = session.metadata.clientName
          const cbm = session.metadata.cbm
          const amount = (session.amount_total || 0) / 100

          try {
            // Créer un enregistrement de paiement
            const { data: orderData } = await supabase
              .from('orders')
              .insert({
                client_number: clientNumber,
                client_name: clientName,
                client_email: session.customer_email,
                cbm: parseFloat(cbm),
                amount_eur: amount,
                stripe_session_id: session.id,
                invoice_number: session.id,
                status: 'paid',
                payment_date: new Date().toISOString(),
              })
              .select()

            console.log(`✓ Paiement enregistré pour client ${clientNumber}`)
          } catch (err: any) {
            console.error('Erreur enregistrement paiement:', err.message)
          }

          // Marquer les colis reçus comme "Payé" dans Google Sheets
          await markExpeditionsPaid(clientNumber)
        }
        break
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`✓ Souscription créée: ${subscription.id}`)
        // Marquer l'utilisateur comme Premium
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log(`✗ Souscription supprimée: ${subscription.id}`)
        // Rétrograder l'utilisateur vers Free
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error(`⚠️ Paiement échoué: ${invoice.id}`)
        // Notifier l'utilisateur
        break
      }

      default:
        console.log(`Événement ignoré: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erreur webhook:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
