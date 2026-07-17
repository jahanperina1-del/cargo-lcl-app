import { NextRequest, NextResponse } from 'next/server'

// Récupère l'URL du webhook Google Apps Script
const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK

export async function GET(request: NextRequest) {
  try {
    if (!GOOGLE_SHEET_WEBHOOK) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEET_WEBHOOK non configurée' },
        { status: 500 }
      )
    }

    // Appeller le doGet du Google Apps Script
    const response = await fetch(GOOGLE_SHEET_WEBHOOK, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur lecture container-tracking:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!GOOGLE_SHEET_WEBHOOK) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEET_WEBHOOK non configurée' },
        { status: 500 }
      )
    }

    const body = await request.json()

    // Envoyer le paiement au Google Apps Script
    const response = await fetch(GOOGLE_SHEET_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'payment',
        ...body,
      }),
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur update container-tracking:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
