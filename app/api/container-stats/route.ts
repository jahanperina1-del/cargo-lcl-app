import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({
    mtq: 0,
    glp: 0,
    guy: 0,
    lastUpdated: new Date().toISOString(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
