import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'
import { sendPaymentConfirmationEmail } from '@/lib/email'

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
      // Send confirmation email
      if (session.customer_email && session.metadata) {
        const cbm = parseFloat(session.metadata.cbm || '0')
        const clientNumber = session.metadata.clientNumber || 'N/A'
        const clientName = session.metadata.clientName || 'Client'
        const amount = (session.amount_total || 0) / 100

        await sendPaymentConfirmationEmail(
          {
            firstName: clientName.split(' ')[0],
            lastName: clientName.split(' ').slice(1).join(' ') || '',
            email: session.customer_email,
            clientNumber,
          },
          cbm,
          amount,
          sessionId
        ).catch(err => console.error('Email sending failed:', err))
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
