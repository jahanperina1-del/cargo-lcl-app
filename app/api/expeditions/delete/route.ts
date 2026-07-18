import { NextRequest, NextResponse } from 'next/server'
import { sendToGoogleSheet } from '@/lib/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const { clientNumber, id, destCode } = await request.json()

    if (!clientNumber || !id) {
      return NextResponse.json({ error: 'Numéro client et ID requis' }, { status: 400 })
    }

    const ok = await sendToGoogleSheet({
      type: 'expedition_delete',
      clientNumber,
      id,
      destination: destCode || 'MTQ',
    })

    if (!ok) {
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erreur suppression expédition:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
