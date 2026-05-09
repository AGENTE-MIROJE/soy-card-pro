'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead } from '@/lib/supabase/types'

const TAGS = ['nuevo','interesado','cliente','seguimiento','descartado']
const TAG_COLORS: Record<string, string> = {
  nuevo: 'badge-nfc', interesado: 'badge-qr', cliente: 'badge-nfc',
  seguimiento: 'badge-qr', descartado: 'badge-link',
}

export default function LeadsTable({ leads: initialLeads }: { leads: (Lead & { profiles?: { display_name: string; slug: string } | null })[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [filter, setFilter] = useState('')
  const supabase = createClient()

  const updateTag = async (id: string, tag: string) => {
    await supabase.from('leads').update({ tag: tag as any }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, tag: tag as any } : l))
  }

  const exportCSV = () => {
    const rows = [['Nombre','Email','Teléfono','Empresa','Perfil','Tag','Fecha'],
      ...leads.map(l => [l.name??'',l.email??'',l.phone??'',l.company??'',
        (l.profiles as any)?.display_name??'', l.tag, new Date(l.created_at).toLocaleDateString('es-CO')])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a'); a.href = 'data:text/csv,' + encodeURIComponent(csv)
    a.download = 'leads_soycardpro.csv'; a.click()
  }

  const filtered = filter
    ? leads.filter(l => [l.name, l.email, l.phone, l.company].some(v => v?.toLowerCase().includes(filter.toLowerCase())))
    : leads

  return (
    <div>
      <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'var(--black-border)' }}>
        <input className="input-gold flex-1" placeholder="Buscar leads..." value={filter}
          onChange={e => setFilter(e.target.value)} />
        <button onClick={exportCSV} className="btn-ghost-gold text-xs py-2 px-4 flex-shrink-0">
          ↓ Exportar CSV
        </button>
      </div>

      {!filtered.length ? (
        <div className="p-12 text-center">
          <p className="text-subtle text-sm">No hay leads{filter ? ' que coincidan' : ' aún'}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr><th>Nombre</th><th>Contacto</th><th>Empresa</th><th>Perfil</th><th>Tag</th><th>Fecha</th></tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id}>
                  <td className="text-pearl font-medium">{lead.name ?? '—'}</td>
                  <td>
                    <div className="text-sm">{lead.email ?? ''}</div>
                    <div className="text-subtle text-xs">{lead.phone ?? ''}</div>
                  </td>
                  <td className="text-muted text-sm">{lead.company ?? '—'}</td>
                  <td className="text-gold-pearl text-sm">{(lead.profiles as any)?.display_name ?? '—'}</td>
                  <td>
                    <select value={lead.tag}
                      onChange={e => updateTag(lead.id, e.target.value)}
                      className={`text-xs font-bold uppercase tracking-widest rounded-full px-2 py-1 border cursor-pointer`}
                      style={{ background: 'var(--black-surface)', color: 'var(--gold-matte)', borderColor: 'var(--gold-border)' }}>
                      {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="text-subtle text-xs">{new Date(lead.created_at).toLocaleDateString('es-CO')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
