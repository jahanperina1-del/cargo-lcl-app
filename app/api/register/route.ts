import { NextRequest, NextResponse } from 'next/server'
import { registerClient } from '@/lib/auth'
import { sendToGoogleSheet } from '@/lib/google-sheets'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Send welcome email with Resend template
    await resend.emails.send({
      from: 'Caribbean Supply <contact@caribbeansupply.net>',
      to: email,
      template: { id: 'welcome-email' },
      variables: {
        firstName: result.client!.firstName,
        lastName: result.client!.lastName,
        clientNumber: result.client!.clientNumber,
      },
    } as any).catch(err => console.error('Email error:', err))

    return NextResponse.json({ success: true, client: result.client })
  } catch (error) {
    console.error('Erreur inscription:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
