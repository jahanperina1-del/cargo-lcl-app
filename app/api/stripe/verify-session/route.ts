import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'

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
