import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Caribbean Supply <contact@caribbeansupply.net>',
            to: session.customer_email,
            template_id: 'payment-confirmation',
            variables: {
              firstName: clientName.split(' ')[0],
              clientNumber: clientNumber,
              cbm: cbm.toFixed(2),
              amount: amount.toFixed(2),
              invoiceNumber: sessionId,
            },
          }),
        }).catch(err => console.error('Email API error:', err))
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
