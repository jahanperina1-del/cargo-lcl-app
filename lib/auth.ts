import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'cargo-lcl-secret-2026'
const WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK

interface Client {
  id: string
  clientNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  destination: string
  createdAt: string
}

// In-memory cache for the session (not persistent across requests)
let clientCache: Client[] = []
let lastNumbersCache: Record<string, number> = {}

// Génère le numéro client: ex MTQ-A4F-001, GLP-K2M-002, GUY-B7X-003
// Format: île de livraison + code aléatoire + compteur global unique
function generateClientNumber(destCode: string, cache: { clients: Client[], lastNumbers: Record<string, number> }): string {
  const island = ['MTQ', 'GLP', 'GUY'].includes(destCode) ? destCode : 'MTQ'

  // Code aléatoire 3 caractères (sans lettres/chiffres ambigus)
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)]

  // Compteur global unique pour tous les clients
  const next = (cache.lastNumbers['GLOBAL'] || 0) + 1
  cache.lastNumbers['GLOBAL'] = next

  return `${island}-${code}-${String(next).padStart(3, '0')}`
}

export async function registerClient(data: {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  destination: string
}): Promise<{ success: boolean; error?: string; client?: Omit<Client, 'password'> }> {
  // Check if email already exists in cache
  const existing = clientCache.find(c => c.email === data.email)
  if (existing) {
    return { success: false, error: 'Cet email est déjà utilisé' }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Generate client number
  const clientNumber = generateClientNumber(data.destination, { clients: clientCache, lastNumbers: lastNumbersCache })

  const client: Client = {
    id: Date.now().toString(),
    clientNumber,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    password: hashedPassword,
    destination: data.destination,
    createdAt: new Date().toISOString(),
  }

  clientCache.push(client)

  // Send to Google Sheets
  try {
    if (WEBHOOK) {
      await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'client', ...client, destination: data.destination })
      }).catch(() => {})
    }
  } catch (e) {}

  const { password: _, ...clientWithoutPassword } = client
  return { success: true, client: clientWithoutPassword }
}

export async function loginClient(email: string, password: string): Promise<{
  success: boolean
  error?: string
  token?: string
  client?: Omit<Client, 'password'>
}> {
  // Chercher d'abord dans le cache
  let client = clientCache.find(c => c.email === email)

  // Si pas en cache, charger depuis Google Sheets
  if (!client && WEBHOOK) {
    try {
      const response = await fetch(WEBHOOK, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        if (data?.clients && Array.isArray(data.clients)) {
          clientCache = data.clients
          client = clientCache.find(c => c.email === email)
        }
      }
    } catch (e) {
      console.error('Erreur chargement clients:', e)
    }
  }

  if (!client) {
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  const isValid = await bcrypt.compare(password, client.password)
  if (!isValid) {
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  const token = jwt.sign({ id: client.id, email: client.email }, JWT_SECRET, { expiresIn: '7d' })

  const { password: _, ...clientWithoutPassword } = client
  return { success: true, token, client: clientWithoutPassword }
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string }
  } catch {
    return null
  }
}

export async function getClientById(id: string): Promise<Omit<Client, 'password'> | null> {
  let client = clientCache.find(c => c.id === id)

  // Si pas en cache, charger depuis Google Sheets
  if (!client && WEBHOOK) {
    try {
      const response = await fetch(WEBHOOK, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      })

      if (response.ok) {
        const data = await response.json()
        if (data?.clients && Array.isArray(data.clients)) {
          clientCache = data.clients
          client = clientCache.find(c => c.id === id)
        }
      }
    } catch (e) {
      console.error('Erreur chargement client:', e)
    }
  }

  if (!client) return null
  const { password: _, ...clientWithoutPassword } = client
  return clientWithoutPassword
}
