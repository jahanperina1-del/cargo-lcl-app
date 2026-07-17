'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Calculation {
  id: string
  date: string
  territory: string
  category: string
  fob_value: number
  total_taxes: number
  total_delivered_price: number
}

export default function DouanesDashboard() {
  const [calculations, setCalculations] = useState<Calculation[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Charger l'historique depuis le localStorage ou l'API
    const stored = localStorage.getItem('douanes_history')
    if (stored) {
      setCalculations(JSON.parse(stored))
    }
    setLoading(false)
  }, [])

  const freeCalculationsRemaining = 5 - (calculations.length % 5)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                📊 Mon historique
              </h1>
              <p className="mt-2 text-slate-600">
                Tous tes calculs de douanes sauvegardés
              </p>
            </div>
            <Link
              href="/douanes"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
            >
              + Nouveau calcul
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Plan info */}
        <div className={`rounded-xl p-6 mb-8 ${
          isPremium
            ? 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200'
            : 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700 uppercase tracking-wide mb-1">
                {isPremium ? '⭐ PREMIUM' : '🆓 GRATUIT'}
              </p>
              <p className="text-lg font-bold text-slate-900">
                {isPremium
                  ? 'Accès illimité'
                  : `${freeCalculationsRemaining} calculs gratuits restants ce mois`}
              </p>
            </div>
            {!isPremium && (
              <button className="rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700">
                Passer au Premium (9€/mois)
              </button>
            )}
          </div>
        </div>

        {/* Tableau historique */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Chargement...</p>
          </div>
        ) : calculations.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
            <p className="text-slate-500 mb-4">
              Aucun calcul sauvegardé pour le moment
            </p>
            <Link
              href="/douanes"
              className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white font-semibold hover:bg-blue-700"
            >
              Créer mon premier calcul
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                    FOB
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                    Taxes
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {calculations.map((calc) => (
                  <tr key={calc.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm text-slate-700">
                      {new Date(calc.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-slate-900">
                      {calc.territory}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-700">
                      {calc.category}
                    </td>
                    <td className="px-6 py-3 text-right text-sm text-slate-900">
                      {calc.fob_value.toFixed(2)}€
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-orange-600">
                      {calc.total_taxes.toFixed(2)}€
                    </td>
                    <td className="px-6 py-3 text-right text-sm font-bold text-slate-900">
                      {calc.total_delivered_price.toFixed(2)}€
                    </td>
                    <td className="px-6 py-3 text-right text-sm">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        📥 PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Stats */}
        {calculations.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-600 mb-2">Total calculs</p>
              <p className="text-3xl font-bold text-slate-900">
                {calculations.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-600 mb-2">Total FOB</p>
              <p className="text-3xl font-bold text-slate-900">
                {calculations
                  .reduce((sum, c) => sum + c.fob_value, 0)
                  .toFixed(0)}
                €
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
              <p className="text-sm text-slate-600 mb-2">Total taxes payées</p>
              <p className="text-3xl font-bold text-orange-600">
                {calculations
                  .reduce((sum, c) => sum + c.total_taxes, 0)
                  .toFixed(0)}
                €
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
