import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getClientById } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
  }

  const client = await getClientById(decoded.id)
  if (!client) {
    return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
  }

  return NextResponse.json({ client })
}
