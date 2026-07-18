import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { clientNumber } = await request.json()

    if (!clientNumber) {
      return NextResponse.json({ error: 'Client number requis' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('expeditions')
      .select('*')
      .eq('client_number', clientNumber)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ expeditions: data || [] })
  } catch (error: any) {
    console.error('Erreur récupération expéditions:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
