'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AthleticResult } from '@/lib/types'
import Modal from '@/components/ui/Modal'

interface RaceFormProps {
  open: boolean
  onClose: () => void
  athleteName: string
  onSaved: (race: AthleticResult) => void
}

const EVENTS = [
  '1 Mile', '1600m', '3200m', '800m', '400m', '200m', '100m',
  '5K', '4K', '3K', '2 Mile', 'Cross Country 5K', 'Cross Country 3K',
]

const SPORTS = ['Track', 'Cross Country']

export default function RaceForm({ open, onClose, athleteName, onSaved }: RaceFormProps) {
  const [form, setForm] = useState({
    sport: 'Cross Country',
    event: '',
    custom_event: '',
    meet_name: '',
    meet_date: new Date().toISOString().split('T')[0],
    result_min: '',
    result_sec: '',
    placement: '',
    team: '',
    grade: '',
    season_year: new Date().getFullYear().toString(),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const event = form.event === '__custom__' ? form.custom_event : form.event
      if (!event) throw new Error('Please select or enter an event')
      const min = parseInt(form.result_min || '0')
      const sec = parseFloat(form.result_sec || '0')
      const totalSecs = min * 60 + sec
      const result = `${min}:${String(Math.floor(sec)).padStart(2, '0')}${sec % 1 !== 0 ? `.${String(Math.round((sec % 1) * 10))}` : ''}`

      const payload = {
        athlete_name: athleteName,
        sport: form.sport,
        event,
        meet_name: form.meet_name,
        meet_date: form.meet_date,
        result,
        result_seconds: totalSecs,
        placement: form.placement ? parseInt(form.placement) : null,
        team: form.team || null,
        grade: form.grade || null,
        season_year: form.season_year || null,
        source: 'manual',
      }

      const { data, error: saveErr } = await supabase.from('athletic_results').insert(payload).select().single()
      if (saveErr) throw saveErr
      onSaved(data as AthleticResult)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save race')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-brand-blue transition-colors'
  const labelCls = 'block text-xs font-medium text-text-muted mb-1'

  return (
    <Modal open={open} onClose={onClose} title="Log Race">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Sport *</label>
            <select className={inputCls} value={form.sport} onChange={e => set('sport', e.target.value)} required>
              {SPORTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Event *</label>
            <select className={inputCls} value={form.event} onChange={e => set('event', e.target.value)} required>
              <option value="">Select event…</option>
              {EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
              <option value="__custom__">Custom…</option>
            </select>
          </div>
        </div>

        {form.event === '__custom__' && (
          <div>
            <label className={labelCls}>Custom Event Name *</label>
            <input className={inputCls} value={form.custom_event} onChange={e => set('custom_event', e.target.value)} placeholder="e.g. 2 Mile XC" required />
          </div>
        )}

        <div>
          <label className={labelCls}>Meet Name *</label>
          <input className={inputCls} value={form.meet_name} onChange={e => set('meet_name', e.target.value)} placeholder="e.g. City Championships" required />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Meet Date *</label>
            <input type="date" className={inputCls} value={form.meet_date} onChange={e => set('meet_date', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Placement</label>
            <input type="number" min="1" className={inputCls} value={form.placement} onChange={e => set('placement', e.target.value)} placeholder="#" />
          </div>
        </div>

        <div>
          <label className={labelCls}>Finish Time *</label>
          <div className="flex gap-2 items-center">
            <input type="number" min="0" className={`${inputCls} flex-1`} value={form.result_min} onChange={e => set('result_min', e.target.value)} placeholder="min" required />
            <span className="text-text-muted font-bold">:</span>
            <input type="number" min="0" max="59.9" step="0.1" className={`${inputCls} flex-1`} value={form.result_sec} onChange={e => set('result_sec', e.target.value)} placeholder="sec" required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Team</label>
            <input className={inputCls} value={form.team} onChange={e => set('team', e.target.value)} placeholder="School" />
          </div>
          <div>
            <label className={labelCls}>Grade</label>
            <input className={inputCls} value={form.grade} onChange={e => set('grade', e.target.value)} placeholder="7th" />
          </div>
          <div>
            <label className={labelCls}>Season Year</label>
            <input type="number" min="2000" max="2100" className={inputCls} value={form.season_year} onChange={e => set('season_year', e.target.value)} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-green hover:bg-green-400 text-bg-base font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Race'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
