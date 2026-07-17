'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TERRITORIES,
  PRODUCT_CATEGORIES,
  type Territory,
  type CalculationResult,
  calculate,
  formatPrice,
} from '@/lib/douanes-data'

export default function DoguanesCalculator() {
  const [territory, setTerritory] = useState<Territory>('martinique')
  const [categoryId, setCategoryId] = useState('electromenager')
  const [fobValue, setFobValue] = useState(5000)
  const [cbm, setCbm] = useState(2)
  const [weight, setWeight] = useState(100)
  const [insurancePercent, setInsurancePercent] = useState(1)
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [error, setError] = useState('')

  const handleCalculate = () => {
    try {
      setError('')
      const calc = calculate({
        territory,
        category_id: categoryId,
        fob_value: fobValue,
        cbm,
        weight,
        insurance_percent: insurancePercent,
      })
      setResult(calc)
    } catch (e: any) {
      setError(e.message)
    }
  }

  const currentTerritory = TERRITORIES[territory]
  const currentCategory = PRODUCT_CATEGORIES[categoryId]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                📦 Calculateur Douanes & TVA
              </h1>
              <p className="mt-2 text-slate-600">
                Calcul précis des droits de douane pour les territoires français d'outre-mer
              </p>
            </div>
            <Link
              href="/espace-client"
              className="rounded-lg bg-orange-500 px-4 py-2 text-white font-medium hover:bg-orange-600"
            >
              Mon Compte
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* === FORMULAIRE === */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              Configuration du calcul
            </h2>

            {/* Territoire */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Destination 🌍
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {Object.values(TERRITORIES).map((t) => (
                  <button
                    key={t.territory}
                    onClick={() => setTerritory(t.territory)}
                    className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                      territory === t.territory
                        ? 'bg-blue-100 border-2 border-blue-500 text-blue-900'
                        : 'border border-slate-300 text-slate-700 hover:border-blue-300'
                    }`}
                  >
                    {t.flag} {t.name.split(' ')[0]}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Port: {currentTerritory?.port} • Délai: {currentTerritory?.avg_shipping_days}j
              </p>
            </div>

            {/* Catégorie produit */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-3">
                Catégorie de produit 📂
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {Object.values(PRODUCT_CATEGORIES).map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (OM: {(cat.om_rate * 100).toFixed(0)}%, TVA: {(cat.tva_rate * 100).toFixed(1)}%)
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-500">
                {currentCategory?.description}
              </p>
            </div>

            {/* Valeur FOB */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Valeur FOB (€) 💰
              </label>
              <input
                type="number"
                value={fobValue}
                onChange={(e) => setFobValue(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                min="100"
                step="100"
              />
              <p className="mt-1 text-xs text-slate-500">
                Prix sans frais de transport
              </p>
            </div>

            {/* Volume & Poids */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Volume (CBM) 📏
                </label>
                <input
                  type="number"
                  value={cbm}
                  onChange={(e) => setCbm(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  min="0.1"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Poids (kg) ⚖️
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  min="0"
                  step="10"
                />
              </div>
            </div>

            {/* Assurance */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Assurance transport (%) 🛡️
              </label>
              <input
                type="number"
                value={insurancePercent}
                onChange={(e) => setInsurancePercent(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                min="0"
                max="5"
                step="0.1"
              />
              <p className="mt-1 text-xs text-slate-500">
                Défaut: 1% (fortement recommandé)
              </p>
            </div>

            {/* Bouton calcul */}
            <button
              onClick={handleCalculate}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white font-semibold hover:from-blue-700 hover:to-blue-800 transition"
            >
              Calculer les taxes ⚡
            </button>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* === RÉSULTATS === */}
          <div>
            {result ? (
              <div className="space-y-4">
                {/* Résumé principal */}
                <div className="rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 p-8">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-2">
                      Prix livré final
                    </p>
                    <p className="text-5xl font-bold text-orange-900">
                      {formatPrice(result.total_delivered_price)}
                    </p>
                    <p className="mt-3 text-sm text-orange-700">
                      pour {currentTerritory?.name}
                    </p>
                  </div>
                </div>

                {/* Détails des calculs */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Détails du calcul</h3>

                  <div className="space-y-3">
                    <CalculationRow
                      label="Valeur FOB"
                      value={result.fob_value}
                      description="Prix d'usine"
                    />
                    <CalculationRow
                      label="+ Fret maritime"
                      value={result.freight_cost}
                      description="Transport maritime LCL"
                    />
                    <CalculationRow
                      label="+ Assurance"
                      value={result.insurance_cost}
                      description={`${insurancePercent}% du FOB`}
                    />

                    <div className="border-t-2 border-slate-200 pt-3">
                      <CalculationRow
                        label="= CIF (base taxable)"
                        value={result.cif_value}
                        bold={true}
                        description="FOB + Fret + Assurance"
                      />
                    </div>

                    <div className="border-t-2 border-orange-200 pt-3 space-y-2">
                      <CalculationRow
                        label="Octroi de mer"
                        value={result.octroi_de_mer}
                        percentage={`${(currentCategory?.om_rate ?? 0) * 100}%`}
                      />
                      <CalculationRow
                        label="TVA"
                        value={result.tva}
                        percentage={`${(currentCategory?.tva_rate ?? 0) * 100}%`}
                      />

                      <div className="mt-2 rounded-lg bg-red-50 p-3">
                        <CalculationRow
                          label="= Total taxes"
                          value={result.total_taxes}
                          bold={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Infos pratiques */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Infos pratiques</h4>
                  <ul className="space-y-2 text-sm text-slate-700">
                    <li>
                      <strong>Délai de livraison:</strong> ~{result.shipping_days} jours
                    </li>
                    <li>
                      <strong>Douane à payer:</strong> {formatPrice(result.total_taxes)}
                    </li>
                    <li>
                      <strong>Coût total au débarquement:</strong>{' '}
                      {formatPrice(result.total_delivered_price)}
                    </li>
                  </ul>
                </div>

                {/* Bouton export */}
                <button className="w-full rounded-lg border-2 border-blue-500 px-6 py-3 text-blue-600 font-semibold hover:bg-blue-50 transition">
                  📥 Exporter en PDF / Google Drive
                </button>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
                <p className="text-slate-500">
                  Remplis le formulaire et clique sur "Calculer les taxes" pour voir les résultats
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 rounded-lg bg-blue-50 p-6 border border-blue-200">
          <p className="text-sm text-blue-900">
            <strong>⚠️ Informations légales:</strong> Ce calculateur fournit une estimation basée
            sur les taux officiels 2026. Les frais réels peuvent varier selon la classification
            douanière exacte de votre marchandise. Consultez la douane pour des valuations
            officielles.
          </p>
        </div>
      </div>
    </div>
  )
}

function CalculationRow({
  label,
  value,
  bold = false,
  description = '',
  percentage = '',
}: {
  label: string
  value: number
  bold?: boolean
  description?: string
  percentage?: string
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className={`text-sm ${bold ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
          {label}
        </p>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-semibold ${
            bold ? 'text-slate-900 text-base' : 'text-slate-900'
          }`}
        >
          {value.toFixed(2)}€
        </p>
        {percentage && <p className="text-xs text-slate-500">{percentage}</p>}
      </div>
    </div>
  )
}
