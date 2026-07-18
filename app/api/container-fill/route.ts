import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const WEBHOOK_URL = process.env.GOOGLE_SHEET_WEBHOOK || ''

export async function GET(request: NextRequest) {
  try {
    if (!WEBHOOK_URL) {
      return NextResponse.json({ containers: [] })
    }

    const response = await fetch(`${WEBHOOK_URL}?action=containerFill`)
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erreur container-fill:', error)
    return NextResponse.json({ containers: [] })
  }
}
