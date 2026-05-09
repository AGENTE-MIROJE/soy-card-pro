'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Lead } from '@/lib/supabase/types'

const TAGS = ['nuevo','interesado','cliente','seguimiento','descartado']

export default function LeadsTable({ leads: initialLeads }: { leads: (Lead & { profiles?: { display_name: string; slug: string } | null })[] }) {
  const [leads, setLeads] = useState(initialLeads)
  const [filter, setFilter] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)
  const [confirmBulk, setConfirmBulk] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const updateTag = async (id: string, tag: string) => {
    await supabase.from('leads').update({ tag: tag as any }).eq('id', id)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, tag: tag as any } : l))
  }

  const deleteLead = async (id: string) => {
    await supabase.from('leads').delete().eq('id', id)
    setLeads(prev => prev.filter(l => l.id !== id))
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  const deleteSelected = async () => {
    setDeleting(true)
    const ids = [...selected]
    await supabase.from('leads').delete().in('id', ids)
    setLeads(prev => prev.filter(l => !selected.has(l.id)))
    setSelected(new Set())
    setConfirmBulk(false)
    setDeleting(false)
    router.refresh()
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

  const allFilteredSelected = filtered.length > 0 && filtered.every(l => selected.has(l.id))

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(l => n.delete(l.id)); return n })
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(l => n.add(l.id)); return n })
    }
  }

  const toggleOne = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--black-border)' }}>
        <input className="input-gold flex-1 min-w-0" placeholder="Buscar leads..." value={filter}
          onChange={e => setFilter(e.target.value)} />
        <div className="flex gap-2 flex-shrink-0">
          {selected.size > 0 && (
            <button onClick={() => setConfirmBulk(true)}
              className="text-xs py-2 px-4 rounded-xl font-semibold transition-colors"
              style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b' }}>
              🗑 Eliminar {selected.size}
            </button>
          )}
          <button onClick={exportCSV} className="btn-ghost-gold text-xs py-2 px-4">
            ↓ Exportar CSV
          </button>
        </div>
      </div>

      {!filtered.length ? (
        <div className="p-12 text-center">
          <p className="text-subtle text-sm">No hay leads{filter ? ' que coincidan' : ' aún'}.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table-premium">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={allFilteredSelected} onChange={toggleAll}
                    style={{ accentColor: 'var(--gold-matte)', cursor: 'pointer' }} />
                </th>
                <th>Nombre</th><th>Contacto</th><th>Empresa</th><th>Perfil</th><th>Tag</th><th>Fecha</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} style={{ background: selected.has(lead.id) ? 'var(--gold-glass)' : undefined }}>
                  <td>
                    <input type="checkbox" checked={selected.has(lead.id)} onChange={() => toggleOne(lead.id)}
                      style={{ accentColor: 'var(--gold-matte)', cursor: 'pointer' }} />
                  </td>
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
                      className="text-xs font-bold uppercase tracking-widest rounded-full px-2 py-1 border cursor-pointer"
                      style={{ background: 'var(--black-surface)', color: 'var(--gold-matte)', borderColor: 'var(--gold-border)' }}>
                      {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="text-subtle text-xs">{new Date(lead.created_at).toLocaleDateString('es-CO')}</td>
                  <td>
                    <button onClick={() => deleteLead(lead.id)}
                      className="text-red-400 hover:text-red-300 transition-colors px-2"
                      title="Eliminar lead">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirm bulk delete */}
      {confirmBulk && (
        <>
          <div className="fixed inset-0 z-50 bg-black/70" onClick={() => setConfirmBulk(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm p-6 rounded-2xl flex flex-col gap-4"
              style={{ background: 'var(--black-card)', border: '1px solid var(--gold-border)' }}>
              <h3 className="text-pearl font-bold text-lg">¿Eliminar {selected.size} leads?</h3>
              <p className="text-muted text-sm">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button onClick={deleteSelected} disabled={deleting}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #991b1b' }}>
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button onClick={() => setConfirmBulk(false)} className="flex-1 btn-ghost-gold py-3">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
