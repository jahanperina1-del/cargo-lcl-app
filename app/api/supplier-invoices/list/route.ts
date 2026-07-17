import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    return NextResponse.json({ invoices: data || [] })
  } catch (error: any) {
    console.error('Erreur récupération factures fournisseur:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
