import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const orderSessionId = formData.get('sessionId') as string
    const clientNumber = formData.get('clientNumber') as string

    if (!file || !orderSessionId || !clientNumber) {
      return NextResponse.json(
        { error: 'Fichier, sessionId et clientNumber requis' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const fileName = `${clientNumber}_${orderSessionId}.pdf`
    const buffer = await file.arrayBuffer()

    const { data, error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('invoices')
      .getPublicUrl(fileName)

    // Update order with invoice URL
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        invoice_url: publicUrl.publicUrl,
        status: 'invoiced',
      })
      .eq('stripe_session_id', orderSessionId)

    if (updateError) {
      console.error('Erreur mise à jour order:', updateError)
    }

    return NextResponse.json({
      success: true,
      fileName: fileName,
      url: publicUrl.publicUrl,
    })
  } catch (error: any) {
    console.error('Erreur upload facture:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
