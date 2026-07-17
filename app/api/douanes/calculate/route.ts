import { NextRequest, NextResponse } from 'next/server'
import { calculate, type CalculationInput } from '@/lib/douanes-data'
import { saveCalculationToDrive } from '@/lib/google-drive'

export async function POST(request: NextRequest) {
  try {
    const data: CalculationInput = await request.json()

    // Valider les données
    if (!data.territory || !data.category_id || !data.fob_value) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Calculer
    const result = calculate(data)

    // Sauvegarder dans Google Drive (optionnel, si authentifié)
    const userId = request.headers.get('x-user-id')
    if (userId) {
      try {
        await saveCalculationToDrive(userId, result)
      } catch (err) {
        console.error('Erreur sauvegarde Google Drive:', err)
        // Ne pas bloquer la réponse si Drive échoue
      }
    }

    return NextResponse.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Erreur calcul:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
