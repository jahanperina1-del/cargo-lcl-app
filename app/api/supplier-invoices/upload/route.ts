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
    const clientNumber = formData.get('clientNumber') as string
    const clientEmail = formData.get('clientEmail') as string
    const clientName = formData.get('clientName') as string

    if (!file || !clientNumber) {
      return NextResponse.json(
        { error: 'Fichier et clientNumber requis' },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const timestamp = Date.now()
    const fileName = `${clientNumber}_${timestamp}_${file.name}`
    const buffer = await file.arrayBuffer()

    const { data, error: uploadError } = await supabase.storage
      .from('supplier-invoices')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from('supplier-invoices')
      .getPublicUrl(fileName)

    // Save to database
    try {
      await supabase
        .from('supplier_invoices')
        .insert({
          client_number: clientNumber,
          client_email: clientEmail,
          client_name: clientName,
          file_name: fileName,
          original_name: file.name,
          file_url: publicUrl.publicUrl,
          uploaded_at: new Date().toISOString(),
        })
    } catch (dbErr) {
      console.error('DB error:', dbErr)
    }

    return NextResponse.json({
      success: true,
      fileName: fileName,
      url: publicUrl.publicUrl,
    })
  } catch (error: any) {
    console.error('Erreur upload facture fournisseur:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
