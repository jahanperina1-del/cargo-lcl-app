import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-08-16',
})

/**
 * Crée une session de paiement Stripe pour l'abonnement Premium
 */
export async function createCheckoutSession(userId: string, email: string) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_premium_douanes',
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/douanes/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/douanes`,
      metadata: {
        userId,
      },
    })

    return session
  } catch (error) {
    console.error('Erreur création session Stripe:', error)
    throw error
  }
}

/**
 * Vérifie si un utilisateur a une souscription Premium active
 */
export async function hasActivePremium(customerId: string): Promise<boolean> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
    })

    return subscriptions.data.length > 0
  } catch (error) {
    console.error('Erreur vérification premium:', error)
    return false
  }
}

/**
 * Récupère les infos client Stripe
 */
export async function getStripeCustomer(customerId: string) {
  try {
    return await stripe.customers.retrieve(customerId)
  } catch (error) {
    console.error('Erreur récupération client:', error)
    return null
  }
}
