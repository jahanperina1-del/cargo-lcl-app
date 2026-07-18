import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK || ''

export async function POST(request: NextRequest) {
  try {
    const { clientNumber, destCode } = await request.json()

    if (!clientNumber) {
      return NextResponse.json({ error: 'Client number requis' }, { status: 400 })
    }

    if (!WEBHOOK_URL) {
      return NextResponse.json({ expeditions: [] })
    }

    const url = `${WEBHOOK_URL}?action=expeditions&clientNumber=${encodeURIComponent(clientNumber)}&destination=${encodeURIComponent(destCode || 'MTQ')}`
    const response = await fetch(url)
    const result = await response.json()

    return NextResponse.json({ expeditions: result.expeditions || [] })
  } catch (error: any) {
    console.error('Erreur récupération expéditions:', error)
    return NextResponse.json({ expeditions: [] })
  }
}
