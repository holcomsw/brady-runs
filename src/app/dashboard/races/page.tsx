'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trophy, Zap, Calendar, Medal } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { AthleticResult, Profile } from '@/lib/types'
import { formatTime } from '@/lib/types'
import RaceTable from '@/components/races/RaceTable'
import RaceForm from '@/components/races/RaceForm'
import RaceCharts from '@/components/races/RaceCharts'
import Toast from '@/components/ui/Toast'
import type { ToastData } from '@/components/ui/Toast'

function buildPRMap(races: AthleticResult[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const r of races) {
    if (!map[r.event] || r.result_seconds < map[r.event]) {
      map[r.event] = r.result_seconds
    }
  }
  return map
}

export default function RacesPage() {
  const [races, setRaces] = useState<AthleticResult[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'table' | 'charts'>('table')

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const [profRes, racesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase
          .from('athletic_results')
          .select('*')
          .order('meet_date', { ascending: false }),
      ])

      setProfile(profRes.data as Profile | null)
      setRaces((racesRes.data || []) as AthleticResult[])
      setLoading(false)
    }
    load()
  }, [])

  const handleSaved = useCallback((race: AthleticResult) => {
    const updated = [race, ...races]
    setRaces(updated)
    const prMap = buildPRMap(updated)
    if (prMap[race.event] === race.result_seconds) {
      addToast({ type: 'achievement', title: `New PR in ${race.event}!`, message: formatTime(race.result_seconds) })
    } else {
      addToast({ type: 'success', title: 'Race logged!', message: `${race.event} · ${formatTime(race.result_seconds)}` })
    }
  }, [races, addToast])

  const handleDelete = useCallback((id: string) => {
    setRaces(prev => prev.filter(r => r.id !== id))
  }, [])

  const prMap = buildPRMap(races)
  const prCount = Object.keys(prMap).length
  const bestPR = Object.entries(prMap).sort((a, b) => a[1] - b[1])[0]
  const recentRace = races[0]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Races</h1>
          <p className="text-text-muted text-sm mt-0.5">
            {profile?.athlete_name ? `${profile.athlete_name} · ` : ''}{races.length} results
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-green hover:bg-green-400 text-bg-base font-semibold rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Race
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Races', value: races.length, icon: Trophy, color: 'text-brand-green', bg: 'bg-brand-green/10' },
          { label: 'Personal Records', value: prCount, icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          {
            label: 'Best Event',
            value: bestPR ? bestPR[0] : '—',
            sub: bestPR ? formatTime(bestPR[1]) : '',
            icon: Medal,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
          },
          {
            label: 'Last Race',
            value: recentRace ? new Date(recentRace.meet_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
            sub: recentRace?.event || '',
            icon: Calendar,
            color: 'text-brand-blue',
            bg: 'bg-brand-blue/10',
          },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-bg-card border border-border rounded-xl p-4">
            <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-text-primary truncate">{s.value}</p>
            {'sub' in s && s.sub && <p className="text-xs text-text-muted">{s.sub}</p>}
            <p className="text-xs text-text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex border-b border-border gap-1">
        {(['table', 'charts'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors capitalize border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-brand-blue text-brand-blue'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'table' ? (
        <RaceTable races={races} prMap={prMap} onDelete={handleDelete} />
      ) : (
        <RaceCharts races={races} />
      )}

      <RaceForm
        open={showForm}
        onClose={() => setShowForm(false)}
        athleteName={profile?.athlete_name || races[0]?.athlete_name || 'Brady Holcomb'}
        onSaved={handleSaved}
      />

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
