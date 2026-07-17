import { NextRequest, NextResponse } from 'next/server'
import { sendToGoogleSheet } from '@/lib/google-sheets'

// Trace chaque devis du simulateur dans le Google Sheet (fire-and-forget côté client).
// Le simulateur n'a pas de champs identité: on trace le canal (WhatsApp/Email) et le contenu.
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Envoyer au Google Sheet avec destination pour les onglets
    await sendToGoogleSheet({
      type: 'devis',
      name: `Simulateur (${data.channel || 'inconnu'})`,
      email: '',
      phone: '',
      productType: data.productType || '',
      description: data.parcels || '',
      weight: data.totalWeight ?? '',
      length: '',
      width: '',
      height: '',
      cbm: data.billedCbm ?? data.totalCbm ?? '',
      destination: data.destination || 'Martinique',
      value: data.value ?? '',
      totalPrice: data.price ?? '',
      channel: data.channel || 'unknown',
    })

    // Updater les stats de remplissage du conteneur
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/container-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: data.destination || 'MTQ',
          cbm: data.billedCbm ?? data.totalCbm ?? 0,
        }),
      })
    } catch (e) {
      // Non bloquant
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur track-quote:', error)
    // Jamais bloquant pour l'utilisateur
    return NextResponse.json({ success: false })
  }
}
