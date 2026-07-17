'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function StripeSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'success' | 'error' | 'loading'>('loading')

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
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Bienvenue au Premium!
            </h1>
            <p className="text-slate-600 mb-8">
              Ton abonnement est activé. Tu as maintenant accès <strong>illimité</strong> à tous
              les calculs de douanes.
            </p>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 mb-8 border border-purple-200">
              <p className="text-sm text-purple-700 mb-3">
                <strong>Ton accès Premium inclut:</strong>
              </p>
              <ul className="text-sm text-purple-700 text-left space-y-2">
                <li>✓ Calculs illimités</li>
                <li>✓ Export PDF + Excel</li>
                <li>✓ Historique illimité</li>
                <li>✓ API access</li>
                <li>✓ Support prioritaire</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                href="/douanes"
                className="block w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
              >
                Commencer les calculs →
              </Link>
              <Link
                href="/douanes/dashboard"
                className="block w-full border-2 border-blue-600 text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
              >
                Voir mon historique
              </Link>
            </div>

            <p className="text-xs text-slate-500 mt-8">
              Un reçu a été envoyé à ton email. Merci pour ton soutien! 🙏
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
