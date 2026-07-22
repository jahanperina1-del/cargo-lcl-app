'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface PaymentData {
  success: boolean
  status: string
  customer_email: string
  customer_name: string
  client_number: string
  cbm: string
  amount_total: number
  invoice_number: string
  payment_date: number
}

function StripeSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)

  useEffect(() => {
    if (sessionId) {
      // Vérifier le statut de la session
      verifySession(sessionId)
    }
  }, [sessionId])

  const verifySession = async (id: string) => {
    try {
      // Appeler une API pour vérifier la session Stripe
      const response = await fetch('/api/stripe/verify-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id }),
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentData(data)
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch (err) {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'success' ? (
          <>
            <div className="mb-6 text-6xl">✅</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Paiement reçu!
            </h1>
            <p className="text-slate-600 mb-8">
              Merci pour ton achat. Voici tes informations:
            </p>

            {/* Facture Section */}
            <div className="bg-white border-2 border-slate-200 rounded-lg p-6 mb-8 text-left">
              <div className="mb-6 pb-6 border-b-2 border-slate-200">
                <p className="text-sm text-slate-600"><strong>Facture N°:</strong> {paymentData?.invoice_number?.slice(-8)}</p>
                <p className="text-sm text-slate-600">
                  <strong>Date:</strong> {paymentData?.payment_date ? new Date(paymentData.payment_date * 1000).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>

              {/* Client Info */}
              <div className="mb-6">
                <p className="text-sm text-slate-500 uppercase tracking-wide mb-2"><strong>Client</strong></p>
                <p className="text-base font-semibold text-slate-900">{paymentData?.customer_name || 'N/A'}</p>
                <p className="text-sm text-slate-600">Email: {paymentData?.customer_email || 'N/A'}</p>
                <p className="text-sm text-slate-600">N° Client: {paymentData?.client_number || 'N/A'}</p>
              </div>

              {/* Details */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-3 pb-3 border-b border-slate-200">
                  <span className="text-sm font-semibold text-slate-900">Description</span>
                  <span className="text-sm font-semibold text-slate-900">Montant</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-sm text-slate-700">Calcul de douanes (CBM: {paymentData?.cbm})</span>
                  <span className="text-sm font-semibold text-slate-900">{paymentData?.amount_total?.toFixed(2)}€</span>
                </div>
                <div className="pt-3 border-t-2 border-slate-300 flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="font-bold text-blue-600 text-lg">{paymentData?.amount_total?.toFixed(2)}€</span>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Un reçu détaillé a été envoyé à {paymentData?.customer_email}
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/douanes"
                className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Retour à l'accueil →
              </Link>
            </div>

            <p className="text-xs text-slate-500 mt-8">
              Merci pour ton soutien! 🙏
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <div className="mb-6 text-6xl">❌</div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Erreur de paiement
            </h1>
            <p className="text-slate-600 mb-8">
              Désolé, il y a eu un problème avec ton paiement. Essaie à nouveau ou contacte le support.
            </p>
            <div className="space-y-3">
              <Link
                href="/douanes"
                className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Réessayer
              </Link>
              <Link
                href="https://wa.me/596696191509"
                className="block w-full border-2 border-blue-600 text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
              >
                Contacter le support (WhatsApp)
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mb-6 animate-spin text-4xl">⏳</div>
            <h1 className="text-2xl font-bold text-slate-900 mb-4">
              Vérification...
            </h1>
            <p className="text-slate-600">
              Nous vérifions ton paiement. Cela ne devrait prendre que quelques secondes.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default function StripeSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <StripeSuccessContent />
    </Suspense>
  )
}
