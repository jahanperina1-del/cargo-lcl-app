import { NextRequest, NextResponse } from 'next/server'
import { registerClient } from '@/lib/auth'
import { sendToGoogleSheet } from '@/lib/google-sheets'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const { firstName, lastName, email, phone, password, destination } = data

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 })
    }

    const result = await registerClient({ firstName, lastName, email, phone, password, destination })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Sync Google Sheets
    await sendToGoogleSheet({ type: 'client', ...result.client })

    // Send welcome email
    await sendWelcomeEmail({
      firstName,
      lastName,
      email,
      clientNumber: result.client!.clientNumber,
    })

    return NextResponse.json({ success: true, client: result.client })
  } catch (error) {
    console.error('Erreur inscription:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
