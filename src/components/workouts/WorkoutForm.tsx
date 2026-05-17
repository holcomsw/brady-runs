'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Workout } from '@/lib/types'
import Modal from '@/components/ui/Modal'

interface WorkoutFormProps {
  open: boolean
  onClose: () => void
  userId: string
  onSaved: (workout: Workout) => void
}

const MOODS = ['great', 'good', 'okay', 'tired', 'bad']
const moodEmoji: Record<string, string> = {
  great: '🔥', good: '😊', okay: '😐', tired: '😴', bad: '😞',
}

export default function WorkoutForm({ open, onClose, userId, onSaved }: WorkoutFormProps) {
  const [form, setForm] = useState({
    exercise_name: '',
    workout_date: new Date().toISOString().split('T')[0],
    sets: '',
    reps: '',
    weight_lbs: '',
    running_distance_miles: '',
    running_time_seconds: '',
    running_time_min: '',
    running_time_sec: '',
    calories_burned: '',
    notes: '',
    mood: '',
    energy_level: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const runSecs = form.running_time_min || form.running_time_sec
        ? (parseInt(form.running_time_min || '0') * 60) + parseInt(form.running_time_sec || '0')
        : null

      const payload = {
        user_id: userId,
        exercise_name: form.exercise_name,
        workout_date: form.workout_date,
        sets: form.sets ? parseInt(form.sets) : null,
        reps: form.reps ? parseInt(form.reps) : null,
        weight_lbs: form.weight_lbs ? parseFloat(form.weight_lbs) : null,
        running_distance_miles: form.running_distance_miles ? parseFloat(form.running_distance_miles) : null,
        running_time_seconds: runSecs,
        calories_burned: form.calories_burned ? parseInt(form.calories_burned) : null,
        notes: form.notes || null,
        mood: form.mood || null,
        energy_level: form.energy_level ? parseInt(form.energy_level) : null,
      }

      const { data, error: saveErr } = await supabase.from('workouts').insert(payload).select().single()
      if (saveErr) throw saveErr
      onSaved(data as Workout)
      onClose()
      setForm({
        exercise_name: '', workout_date: new Date().toISOString().split('T')[0],
        sets: '', reps: '', weight_lbs: '', running_distance_miles: '',
        running_time_seconds: '', running_time_min: '', running_time_sec: '',
        calories_burned: '', notes: '', mood: '', energy_level: '',
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save workout')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-brand-blue transition-colors'
  const labelCls = 'block text-xs font-medium text-text-muted mb-1'

  return (
    <Modal open={open} onClose={onClose} title="Log Workout">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelCls}>Exercise / Workout Name *</label>
            <input className={inputCls} value={form.exercise_name} onChange={e => set('exercise_name', e.target.value)} placeholder="e.g. Easy Run, Squat, Intervals" required />
          </div>
          <div>
            <label className={labelCls}>Date *</label>
            <input type="date" className={inputCls} value={form.workout_date} onChange={e => set('workout_date', e.target.value)} required />
          </div>
          <div>
            <label className={labelCls}>Calories Burned</label>
            <input type="number" min="0" className={inputCls} value={form.calories_burned} onChange={e => set('calories_burned', e.target.value)} placeholder="kcal" />
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Running (optional)</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Distance (mi)</label>
              <input type="number" min="0" step="0.01" className={inputCls} value={form.running_distance_miles} onChange={e => set('running_distance_miles', e.target.value)} placeholder="0.0" />
            </div>
            <div>
              <label className={labelCls}>Time (min)</label>
              <input type="number" min="0" className={inputCls} value={form.running_time_min} onChange={e => set('running_time_min', e.target.value)} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Time (sec)</label>
              <input type="number" min="0" max="59" className={inputCls} value={form.running_time_sec} onChange={e => set('running_time_sec', e.target.value)} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Lifting (optional)</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Sets</label>
              <input type="number" min="0" className={inputCls} value={form.sets} onChange={e => set('sets', e.target.value)} placeholder="3" />
            </div>
            <div>
              <label className={labelCls}>Reps</label>
              <input type="number" min="0" className={inputCls} value={form.reps} onChange={e => set('reps', e.target.value)} placeholder="10" />
            </div>
            <div>
              <label className={labelCls}>Weight (lbs)</label>
              <input type="number" min="0" step="0.5" className={inputCls} value={form.weight_lbs} onChange={e => set('weight_lbs', e.target.value)} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">How did it feel?</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Mood</label>
              <div className="flex gap-2 flex-wrap">
                {MOODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set('mood', form.mood === m ? '' : m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                      form.mood === m
                        ? 'bg-brand-blue/20 border-brand-blue text-brand-blue'
                        : 'bg-bg-elevated border-border text-text-muted hover:border-brand-blue/50'
                    }`}
                  >
                    {moodEmoji[m]} {m}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelCls}>Energy Level (1–10)</label>
              <input type="number" min="1" max="10" className={inputCls} value={form.energy_level} onChange={e => set('energy_level', e.target.value)} placeholder="7" />
            </div>
          </div>
        </div>

        <div>
          <label className={labelCls}>Notes</label>
          <textarea className={inputCls} rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="How did it go?" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-text-muted hover:text-text-primary transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-brand-blue hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Workout'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
