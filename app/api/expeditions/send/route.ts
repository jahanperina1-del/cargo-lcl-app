import { NextRequest, NextResponse } from 'next/server'
import { sendToGoogleSheet } from '@/lib/google-sheets'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { clientNumber, name, email, destination, description, weight, cbm } = data

    if (!clientNumber || !cbm) {
      return NextResponse.json({ error: 'Numéro client et CBM requis' }, { status: 400 })
    }

    // Sauvegarde persistante dans Supabase (survit même si le Sheet est indisponible)
    try {
      await supabase.from('expeditions').insert({
        client_number: clientNumber,
        client_email: email || '',
        client_name: name || '',
        description: description || '',
        weight: weight || 0,
        cbm: cbm,
        destination: destination || 'Martinique',
        status: 'annonce',
      })
    } catch (dbErr) {
      console.error('Supabase expedition error:', dbErr)
    }

    const ok = await sendToGoogleSheet({
      type: 'expedition',
      clientNumber,
      name: name || '',
      email: email || '',
      destination: destination || 'Martinique',
      description: description || '',
      weight: weight || 0,
      cbm: cbm,
    })

    if (!ok) {
      return NextResponse.json({ error: 'Erreur envoi au fichier de suivi' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erreur expédition:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
