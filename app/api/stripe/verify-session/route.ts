import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
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

        await resend.emails.send({
          from: 'Caribbean Supply <contact@caribbeansupply.net>',
          to: session.customer_email,
          template: { id: 'payment-confirmation' },
          variables: {
            firstName: clientName.split(' ')[0],
            clientNumber: clientNumber,
            cbm: cbm.toFixed(2),
            amount: amount.toFixed(2),
            invoiceNumber: sessionId,
          },
        } as any).catch(err => console.error('Email error:', err))
      }

      return NextResponse.json({
        success: true,
        status: 'paid',
        customer_email: session.customer_email,
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
