import { NextRequest, NextResponse } from 'next/server'

interface QuoteRequest {
  destination: string
  parcels: Array<{
    length: number
    width: number
    height: number
    weight: number
  }>
  productType: string
  productValue: number
  images?: string[]
}

export async function POST(request: NextRequest) {
  try {
    const data: QuoteRequest = await request.json()

    // 1. Calculer CBM total
    let totalCBM = 0
    let totalWeight = 0

    for (const parcel of data.parcels) {
      const cbm = (parcel.length * parcel.width * parcel.height) / 1000000
      totalCBM += cbm
      totalWeight += parcel.weight
    }

    // 2. Calculer prix (380€/CBM)
    const billedCBM = Math.max(totalCBM, totalWeight / 1000) // Min 1000kg = 1 CBM
    const transportPrice = billedCBM * 380
    const insurance = (data.productValue * 1.5) / 100

    const quote = {
      destination: data.destination,
      totalCBM,
      totalWeight,
      billedCBM,
      transportPrice,
      insurance,
      productValue: data.productValue,
      productType: data.productType,
      totalPrice: transportPrice + insurance,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      quote,
    })
  } catch (error: any) {
    console.error('Erreur calcul devis:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
