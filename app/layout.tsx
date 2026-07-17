import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Cargo LCL - Devis en Direct',
  description: 'Simulateur de devis pour cargo LCL Chine vers Martinique, Guadeloupe et Guyane',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
