'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Dumbbell, Route, Flame, TrendingUp } from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import type { Workout, Achievement } from '@/lib/types'
import { formatTime } from '@/lib/types'
import WorkoutTable from '@/components/workouts/WorkoutTable'
import WorkoutForm from '@/components/workouts/WorkoutForm'
import Toast from '@/components/ui/Toast'
import type { ToastData } from '@/components/ui/Toast'

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userId, setUserId] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [loading, setLoading] = useState(true)

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
      const uid = session.user.id
      setUserId(uid)
      const [wRes, aRes] = await Promise.all([
        supabase.from('workouts').select('*').eq('user_id', uid).order('workout_date', { ascending: false }),
        supabase.from('achievements').select('*').eq('user_id', uid),
      ])
      setWorkouts((wRes.data || []) as Workout[])
      setAchievements((aRes.data || []) as Achievement[])
      setLoading(false)
    }
    load()
  }, [])

  const checkAchievements = useCallback(async (allWorkouts: Workout[]) => {
    if (!userId) return
    const existing = new Set(achievements.map(a => a.type))
    const toGrant: Omit<Achievement, 'id' | 'user_id' | 'unlocked_at'>[] = []

    if (!existing.has('first_workout') && allWorkouts.length >= 1) {
      toGrant.push({ type: 'first_workout', title: 'First Step', description: 'Logged your first workout!', icon: '🏋️' })
    }
    const totalMiles = allWorkouts.reduce((s, w) => s + (w.running_distance_miles || 0), 0)
    if (!existing.has('distance_milestone') && totalMiles >= 10) {
      toGrant.push({ type: 'distance_milestone', title: '10 Mile Club', description: 'Logged 10 miles of running!', icon: '🛤️' })
    }
    const liftNames = Array.from(new Set(allWorkouts.filter(w => w.weight_lbs).map(w => w.exercise_name)))
    if (!existing.has('lift_pr') && liftNames.length > 0) {
      toGrant.push({ type: 'lift_pr', title: 'Iron Will', description: 'Set a new lifting PR!', icon: '💪' })
    }
    const heavy = allWorkouts.some(w => (w.weight_lbs || 0) >= 200)
    if (!existing.has('heavy_lifter') && heavy) {
      toGrant.push({ type: 'heavy_lifter', title: 'Heavy Hitter', description: 'Lifted 200+ lbs!', icon: '🏆' })
    }

    if (toGrant.length === 0) return
    const { data } = await supabase.from('achievements').insert(toGrant.map(a => ({ ...a, user_id: userId }))).select()
    if (data) {
      setAchievements(prev => [...prev, ...data as Achievement[]])
      for (const a of data as Achievement[]) {
        addToast({ type: 'achievement', title: `Achievement Unlocked: ${a.title}`, message: a.description })
      }
    }
  }, [userId, achievements, addToast])

  const handleSaved = useCallback(async (workout: Workout) => {
    const updated = [workout, ...workouts]
    setWorkouts(updated)
    addToast({ type: 'success', title: 'Workout logged!', message: workout.exercise_name })
    await checkAchievements(updated)
  }, [workouts, addToast, checkAchievements])

  const handleDelete = useCallback((id: string) => {
    setWorkouts(prev => prev.filter(w => w.id !== id))
  }, [])

  const totalMiles = workouts.reduce((s, w) => s + (w.running_distance_miles || 0), 0)
  const totalCals = workouts.reduce((s, w) => s + (w.calories_burned || 0), 0)
  const avgEnergy = workouts.filter(w => w.energy_level).length > 0
    ? (workouts.reduce((s, w) => s + (w.energy_level || 0), 0) / workouts.filter(w => w.energy_level).length).toFixed(1)
    : '—'

  const weeklyMiles = (() => {
    const map: Record<string, number> = {}
    for (const w of workouts) {
      const d = new Date(w.workout_date)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      map[key] = (map[key] || 0) + (w.running_distance_miles || 0)
    }
    return Object.entries(map).slice(-8).map(([week, miles]) => ({ week, miles: +miles.toFixed(2) }))
  })()

  const exerciseCounts = (() => {
    const map: Record<string, number> = {}
    for (const w of workouts) {
      map[w.exercise_name] = (map[w.exercise_name] || 0) + 1
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([name, count]) => ({ name, count }))
  })()

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
          <h1 className="text-2xl font-bold text-text-primary">Workouts</h1>
          <p className="text-text-muted text-sm mt-0.5">{workouts.length} sessions logged</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-blue-500 text-white font-semibold rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log Workout
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Workouts', value: workouts.length, icon: Dumbbell, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
          { label: 'Miles Logged', value: `${totalMiles.toFixed(1)} mi`, icon: Route, color: 'text-brand-green', bg: 'bg-brand-green/10' },
          { label: 'Calories Burned', value: totalCals > 0 ? totalCals.toLocaleString() : '—', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { label: 'Avg Energy', value: avgEnergy, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-bg-card border border-border rounded-xl p-4">
            <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-2`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-xl font-bold text-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {weeklyMiles.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Weekly Mileage</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyMiles} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
                <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#131720', border: '1px solid #1e2433', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="miles" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {exerciseCounts.length > 1 && (
            <div className="bg-bg-card border border-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Top Exercises</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={exerciseCounts} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ background: '#131720', border: '1px solid #1e2433', borderRadius: '8px', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <WorkoutTable workouts={workouts} onDelete={handleDelete} />

      {userId && (
        <WorkoutForm
          open={showForm}
          onClose={() => setShowForm(false)}
          userId={userId}
          onSaved={handleSaved}
        />
      )}

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
