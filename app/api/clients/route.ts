import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK

export async function GET(request: NextRequest) {
  try {
    if (!GOOGLE_SHEET_WEBHOOK) {
      return NextResponse.json(
        { error: 'GOOGLE_SHEET_WEBHOOK non configurée' },
        { status: 500 }
      )
    }

    // Appeller le doGet du Google Apps Script pour récupérer le suivi des conteneurs
    // qui contient les clients payés
    const response = await fetch(GOOGLE_SHEET_WEBHOOK, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      return NextResponse.json({ clients: [], totalClients: 0, totalAmount: 0, byDestination: {} })
    }

    const text = await response.text()
    let containerTracking
    try {
      containerTracking = JSON.parse(text)
    } catch {
      return NextResponse.json({ clients: [], totalClients: 0, totalAmount: 0, byDestination: {} })
    }

    // Transformer les données pour afficher tous les clients
    const clients: any[] = []
    const clientMap = new Map()

    // Extraire les clients des conteneurs
    containerTracking.containers?.forEach((container: any) => {
      container.paidClients?.forEach((client: any) => {
        if (!clientMap.has(client.clientId)) {
          clientMap.set(client.clientId, {
            id: client.clientId,
            name: client.name,
            cbm: client.cbm,
            amount: client.amount,
            paymentDate: client.paymentDate,
            destination: container.destination,
            position: client.position,
            containerId: container.id,
            status: 'Payé',
          })
        }
      })
    })

    // Convertir la map en array
    clientMap.forEach((value) => {
      clients.push(value)
    })

    return NextResponse.json({
      clients,
      totalClients: clients.length,
      totalAmount: clients.reduce((sum, c) => sum + c.amount, 0),
      byDestination: {
        martinique: clients.filter((c) => c.destination === 'Martinique'),
        guadeloupe: clients.filter((c) => c.destination === 'Guadeloupe'),
        guyane: clients.filter((c) => c.destination === 'Guyane'),
      },
    })
  } catch (error) {
    console.error('Erreur lecture clients:', error)
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}
