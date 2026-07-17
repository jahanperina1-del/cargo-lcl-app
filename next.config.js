/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return {
      // beforeFiles: prioritaire sur les pages Next.js — le design statique
      // (public/*.html) est le site principal, app/ ne garde que les APIs + /douanes
      beforeFiles: [
        { source: '/', destination: '/index.html' },
        { source: '/simulateur', destination: '/simulateur.html' },
        { source: '/espace-client', destination: '/espace-client.html' },
        { source: '/sourcing', destination: '/sourcing.html' },
        { source: '/contact', destination: '/contact.html' },
        { source: '/comment-ca-marche', destination: '/comment-ca-marche.html' },
        { source: '/payment-success', destination: '/payment-success.html' },
        { source: '/suivi-conteneurs', destination: '/suivi-conteneurs.html' },
        { source: '/suivi-paiements', destination: '/suivi-paiements.html' },
        { source: '/clients-dashboard', destination: '/clients-dashboard.html' },
        { source: '/admin-login', destination: '/admin-login.html' },
        { source: '/admin', destination: '/admin.html' },
      ],
    }
  },
}

module.exports = nextConfig
