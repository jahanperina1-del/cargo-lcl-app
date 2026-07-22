import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const clientNumber = request.nextUrl.searchParams.get('clientNumber')

    if (!clientNumber) {
      return NextResponse.json(
        { error: 'clientNumber manquant' },
        { status: 400 }
      )
    }

    // Récupérer les paiements du client
    const { data: payments, error } = await supabase
      .from('orders')
      .select('*')
      .eq('client_number', clientNumber)
      .eq('status', 'paid')
      .order('payment_date', { ascending: false })

    if (error) {
      console.error('Erreur récupération paiements:', error)
      return NextResponse.json(
        { error: 'Erreur récupération paiements' },
        { status: 500 }
      )
    }

    // Calculer le CBM total payé
    const totalPaidCbm = (payments || []).reduce((sum, payment) => sum + (payment.cbm || 0), 0)

    return NextResponse.json({
      success: true,
      payments: payments || [],
      totalPaidCbm,
      hasPaid: (payments || []).length > 0,
    })
  } catch (error: any) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
