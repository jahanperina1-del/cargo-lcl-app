import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

const CATEGORY_LABELS: Record<string, string> = {
  sourcing: 'Sourcing',
  cargo: 'Cargo',
  accompagnement: 'Accompagnement en Chine',
  fournisseurs: 'Fournisseurs',
  autre: 'Autre demande',
}

export async function POST(request: NextRequest) {
  try {
    const { category, contact, contactType, source, details } = await request.json()

    if (!category || !contact) {
      return NextResponse.json({ error: 'Catégorie et contact requis' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        category,
        contact,
        contact_type: contactType || 'email',
        source: source || 'direct',
        details: details || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur insertion lead:', error)
      return NextResponse.json({ error: 'Erreur enregistrement' }, { status: 500 })
    }

    const categoryLabel = CATEGORY_LABELS[category] || category
    const message = details?.message || '(aucun détail fourni)'

    // Notification admin — ne bloque jamais la réponse si l'email échoue
    try {
      await resend.emails.send({
        from: 'Caribbean Supply <contact@caribbeansupply.net>',
        to: 'contact@caribbeansupply.net',
        subject: `🆕 Nouveau prospect — ${categoryLabel}`,
        html: `
          <h2>Nouveau prospect</h2>
          <p><strong>Catégorie :</strong> ${categoryLabel}</p>
          <p><strong>Contact :</strong> ${contact} (${contactType})</p>
          <p><strong>Source :</strong> ${source}</p>
          <p><strong>Message :</strong> ${message}</p>
        `,
      })
    } catch (emailErr) {
      console.error('Erreur email notification admin:', emailErr)
    }

    // Confirmation au prospect si c'est un email
    if (contactType === 'email') {
      try {
        await resend.emails.send({
          from: 'Caribbean Supply <contact@caribbeansupply.net>',
          to: contact,
          subject: 'Votre demande a bien été reçue — Caribbean Supply',
          html: `
            <h2>Merci pour votre demande !</h2>
            <p>On a bien reçu votre demande de type <strong>${categoryLabel}</strong>.</p>
            <p>On revient vers vous sous 24-48h.</p>
            <p>Besoin de nous parler tout de suite ? <a href="https://wa.me/8619700268583">Écrivez-nous sur WhatsApp</a>.</p>
          `,
        })
      } catch (emailErr) {
        console.error('Erreur email confirmation prospect:', emailErr)
      }
    }

    return NextResponse.json({ success: true, leadId: data.id })
  } catch (error: any) {
    console.error('Erreur création lead:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
