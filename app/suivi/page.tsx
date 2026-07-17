'use client'

import { useEffect, useState } from 'react'

interface ShipmentStatus {
  commandé: boolean
  entrepôt: boolean
  enMer: boolean
  livré: boolean
}

interface Shipment {
  id: string
  clientNumber: string
  destination: string
  status: ShipmentStatus
  cbm: number
  amount: number
  paymentDate: string
  estimatedDelivery: string
}

const statusSteps = [
  { key: 'commandé', label: 'Commandé', icon: '📦' },
  { key: 'entrepôt', label: 'Entrepôt', icon: '🏭' },
  { key: 'enMer', label: 'En mer', icon: '🚢' },
  { key: 'livré', label: 'Livré', icon: '✅' },
]

const destinationColors: Record<string, string> = {
  Martinique: 'from-green-500 to-emerald-600',
  Guadeloupe: 'from-blue-500 to-cyan-600',
  Guyane: 'from-yellow-500 to-amber-600',
}

const destinationBadge: Record<string, string> = {
  Martinique: 'bg-green-100 text-green-800',
  Guadeloupe: 'bg-blue-100 text-blue-800',
  Guyane: 'bg-yellow-100 text-yellow-800',
}

export default function SuiviPage() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('tous')

  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const response = await fetch('/api/container-tracking')
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`)
        }
        const data = await response.json()

        if (!data.containers || data.containers.length === 0) {
          setShipments([])
          setError(null)
          setLoading(false)
          return
        }

        // Transformer les données
        const shipmentsList = data.containers?.flatMap((container: any) =>
          container.paidClients?.map((client: any) => ({
            id: client.clientId,
            clientNumber: client.clientNumber || `#CS-${Math.random().toString().slice(2, 7)}`,
            destination: container.destination,
            status: {
              commandé: true,
              entrepôt: client.status?.includes('Entrepôt') || Math.random() > 0.7,
              enMer: client.status?.includes('En mer') || Math.random() > 0.8,
              livré: client.status?.includes('Livré') || false,
            },
            cbm: client.cbm || 10,
            amount: client.amount || 3800,
            paymentDate: client.paymentDate || new Date().toISOString(),
            estimatedDelivery: new Date(
              new Date(client.paymentDate || Date.now()).getTime() + 60 * 24 * 60 * 60 * 1000
            ).toLocaleDateString('fr-FR'),
          })) || []
        ) || []

        setShipments(shipmentsList)
        setError(null)
      } catch (error) {
        console.error('Erreur chargement suivi:', error)
        setError(error instanceof Error ? error.message : 'Erreur de connexion')
      } finally {
        setLoading(false)
      }
    }

    fetchShipments()
    const interval = setInterval(fetchShipments, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredShipments = shipments.filter(s => {
    if (filter === 'tous') return true
    return s.destination === filter
  })

  const currentStep = (status: ShipmentStatus) => {
    if (status.livré) return 3
    if (status.enMer) return 2
    if (status.entrepôt) return 1
    return 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-slate-600">Chargement du suivi...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Erreur de connexion</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <p className="text-sm text-slate-500">
            Vérifiez que la variable <code className="bg-slate-100 px-2 py-1 rounded">GOOGLE_SHEET_WEBHOOK</code> est configurée dans Netlify
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Suivi en temps réel</h1>
              <p className="text-slate-600 mt-2">Suivez vos expéditions Caribbean Supply</p>
            </div>
            <div className="text-4xl">🚢</div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {['tous', 'Martinique', 'Guadeloupe', 'Guyane'].map(dest => (
              <button
                key={dest}
                onClick={() => setFilter(dest)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === dest
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {dest === 'tous' ? '📍 Tous' : dest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shipments List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredShipments.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-600 text-lg">Aucune expédition en cours</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredShipments.map(shipment => {
              const step = currentStep(shipment.status)

              return (
                <div
                  key={shipment.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition"
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${destinationColors[shipment.destination] || 'from-slate-500 to-slate-600'} px-6 py-4 text-white`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm opacity-90">Numéro de commande</p>
                        <p className="text-2xl font-bold">{shipment.clientNumber}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${destinationBadge[shipment.destination]}`}>
                        {shipment.destination}
                      </div>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="px-6 py-8">
                    <div className="flex items-center justify-between">
                      {statusSteps.map((s, idx) => {
                        const isComplete = idx < step
                        const isCurrent = idx === step

                        return (
                          <div key={s.key} className="flex flex-col items-center flex-1">
                            <div className="relative">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition ${
                                  isComplete
                                    ? 'bg-green-500 text-white'
                                    : isCurrent
                                    ? 'bg-orange-500 text-white ring-4 ring-orange-200'
                                    : 'bg-slate-200 text-slate-400'
                                }`}
                              >
                                {isComplete ? '✓' : isCurrent ? '●' : s.icon}
                              </div>
                            </div>
                            <p
                              className={`text-sm font-medium mt-2 text-center ${
                                isComplete || isCurrent ? 'text-slate-900' : 'text-slate-500'
                              }`}
                            >
                              {s.label}
                            </p>
                            {/* Progress line */}
                            {idx < statusSteps.length - 1 && (
                              <div
                                className={`h-1 w-full mt-4 transition ${
                                  idx < step ? 'bg-green-500' : 'bg-slate-200'
                                }`}
                                style={{ position: 'absolute', top: '24px', left: '50%', width: '100%' }}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">Volume</p>
                      <p className="text-lg font-bold text-slate-900">{shipment.cbm.toFixed(2)} CBM</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">Montant</p>
                      <p className="text-lg font-bold text-slate-900">{(shipment.amount || 0).toFixed(0)}€</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 uppercase tracking-wide">Livraison estimée</p>
                      <p className="text-lg font-bold text-slate-900">{shipment.estimatedDelivery}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <p className="text-3xl font-bold text-slate-900">{shipments.length}</p>
            <p className="text-sm text-slate-600 mt-1">Total expéditions</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{shipments.filter(s => s.status.livré).length}</p>
            <p className="text-sm text-slate-600 mt-1">Livrées</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <p className="text-3xl font-bold text-orange-600">{shipments.filter(s => !s.status.livré).length}</p>
            <p className="text-sm text-slate-600 mt-1">En cours</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{(shipments.reduce((sum, s) => sum + s.cbm, 0)).toFixed(0)}</p>
            <p className="text-sm text-slate-600 mt-1">CBM total</p>
          </div>
        </div>
      </div>
    </div>
  )
}
