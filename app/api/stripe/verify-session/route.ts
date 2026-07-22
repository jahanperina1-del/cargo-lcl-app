import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import { createClient } from '@supabase/supabase-js'
import { markExpeditionsPaid } from '@/lib/mark-expeditions-paid'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      )
    }

    // Récupérer les infos de la session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      // Send confirmation email with Resend template
      if (session.customer_email && session.metadata) {
        const cbm = parseFloat(session.metadata.cbm || '0')
        const clientNumber = session.metadata.clientNumber || 'N/A'
        const clientName = session.metadata.clientName || 'Client'
        const amount = (session.amount_total || 0) / 100

        // Create order in Supabase
        try {
          await supabase.from('orders').insert({
            client_number: clientNumber,
            client_email: session.customer_email,
            cbm: cbm,
            amount_eur: amount,
            stripe_session_id: sessionId,
            invoice_number: sessionId,
            status: 'paid',
          })
        } catch (orderErr) {
          console.error('Supabase order error:', orderErr)
        }

        // Marquer les colis reçus comme "Payé" dans Google Sheets
        await markExpeditionsPaid(session.metadata.clientNumber)
      }

      return NextResponse.json({
        success: true,
        status: 'paid',
        customer_email: session.customer_email,
        customer_name: session.metadata?.clientName || 'Client',
        client_number: session.metadata?.clientNumber || 'N/A',
        cbm: session.metadata?.cbm || '0',
        amount_total: (session.amount_total || 0) / 100,
        invoice_number: sessionId,
        payment_date: session.created,
      })
    } else {
      return NextResponse.json(
        { error: 'Paiement non complété' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Erreur vérification session:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
