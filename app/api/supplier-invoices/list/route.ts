import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('supplier_invoices')
      .select('*')
      .order('uploaded_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Generate signed URLs (bucket is private) — valid 1 hour
    const invoices = await Promise.all(
      (data || []).map(async (inv) => {
        const { data: signed } = await supabase.storage
          .from('supplier-invoices')
          .createSignedUrl(inv.file_name, 3600)
        return { ...inv, file_url: signed?.signedUrl || inv.file_url }
      })
    )

    return NextResponse.json({ invoices })
  } catch (error: any) {
    console.error('Erreur récupération factures fournisseur:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
