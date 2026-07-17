import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const JWT_SECRET = process.env.JWT_SECRET || 'cargo-lcl-secret-2026'
const WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SECRET = process.env.SUPABASE_SECRET_KEY

// Supabase client
const supabase = SUPABASE_URL && SUPABASE_SECRET
  ? createClient(SUPABASE_URL, SUPABASE_SECRET)
  : null

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

// Génère le numéro client: ex MTQ-A4F-001, GLP-K2M-002, GUY-B7X-003
function generateClientNumber(destCode: string): string {
  const island = ['MTQ', 'GLP', 'GUY'].includes(destCode) ? destCode : 'MTQ'
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)]
  const next = Math.floor(Math.random() * 1000)
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
  if (!supabase) {
    return { success: false, error: 'Base de données non configurée' }
  }

  // Check if email exists
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('email', data.email)
    .single()

  if (existing) {
    return { success: false, error: 'Cet email est déjà utilisé' }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Generate client number
  const clientNumber = generateClientNumber(data.destination)

  const id = Date.now().toString()
  const client: Client = {
    id,
    clientNumber,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    password: hashedPassword,
    destination: data.destination,
    createdAt: new Date().toISOString(),
  }

  // Insert into Supabase
  const { error: insertError } = await supabase
    .from('clients')
    .insert({
      id,
      email: data.email,
      password: hashedPassword,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      client_number: clientNumber,
      destination: data.destination,
      created_at: new Date().toISOString(),
    })

  if (insertError) {
    return { success: false, error: 'Erreur lors de l\'inscription' }
  }

  // Send to Google Sheets (for tracking)
  try {
    if (WEBHOOK) {
      await fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'client', ...client })
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
  if (!supabase) {
    return { success: false, error: 'Base de données non configurée' }
  }

  // Get client from Supabase
  const { data: clientData, error } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !clientData) {
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  // Verify password
  const isValid = await bcrypt.compare(password, clientData.password)
  if (!isValid) {
    return { success: false, error: 'Email ou mot de passe incorrect' }
  }

  // Generate token
  const token = jwt.sign({ id: clientData.id, email: clientData.email }, JWT_SECRET, { expiresIn: '7d' })

  const client = {
    id: clientData.id,
    clientNumber: clientData.client_number,
    firstName: clientData.first_name,
    lastName: clientData.last_name,
    email: clientData.email,
    phone: clientData.phone,
    destination: clientData.destination,
    createdAt: clientData.created_at,
  }

  return { success: true, token, client }
}

export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; email: string }
  } catch {
    return null
  }
}

export async function getClientById(id: string): Promise<Omit<Client, 'password'> | null> {
  if (!supabase) return null

  const { data: clientData } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (!clientData) return null

  return {
    id: clientData.id,
    clientNumber: clientData.client_number,
    firstName: clientData.first_name,
    lastName: clientData.last_name,
    email: clientData.email,
    phone: clientData.phone,
    destination: clientData.destination,
    createdAt: clientData.created_at,
  }
}
