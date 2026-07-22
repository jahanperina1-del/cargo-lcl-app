import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe-client'

interface CheckoutRequest {
  cbm: number
  amount: number
  clientName: string
  clientEmail: string
  clientNumber: string
}

export async function POST(request: NextRequest) {
  try {
    const data: CheckoutRequest = await request.json()

    if (!data.cbm || !data.amount || !data.clientEmail) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Créer une session Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: data.clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Fret Maritime - ${data.cbm.toFixed(2)} CBM`,
              description: `Transport cargo LCL - Client: ${data.clientNumber}`,
              metadata: {
                clientNumber: data.clientNumber,
                clientName: data.clientName,
              },
            },
            unit_amount: Math.round(data.amount * 100), // en centimes
          },
          quantity: 1,
        },
      ],
      metadata: {
        clientNumber: data.clientNumber,
        clientName: data.clientName,
        cbm: data.cbm.toString(),
      },
      success_url: `https://caribbeansupply.net/espace-client?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://caribbeansupply.net/espace-client?payment_cancelled=true`,
    })

    return NextResponse.json({
      success: true,
      url: session.url,
      sessionId: session.id,
    })
  } catch (error: any) {
    console.error('Erreur Stripe:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
