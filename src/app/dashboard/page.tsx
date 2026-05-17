'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AthleticResult, Profile, Workout, Achievement } from '@/lib/types'
import HeroSection from '@/components/dashboard/HeroSection'
import StatGrid from '@/components/dashboard/StatGrid'
import AthleteCard from '@/components/dashboard/AthleteCard'
import RecentRaces from '@/components/dashboard/RecentRaces'
import RecentWorkouts from '@/components/dashboard/RecentWorkouts'
import PRSummary from '@/components/dashboard/PRSummary'
import Achievements from '@/components/dashboard/Achievements'
import Toast from '@/components/ui/Toast'
import type { ToastData } from '@/components/ui/Toast'

function buildPRMap(races: AthleticResult[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const race of races) {
    if (!map[race.event] || race.result_seconds < map[race.event]) {
      map[race.event] = race.result_seconds
    }
  }
  return map
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [races, setRaces] = useState<AthleticResult[]>([])
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [loading, setLoading] = useState(true)

  const addToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(t => t.filter(x => x.id !== id))
  }, [])

  const checkAndGrantAchievements = useCallback(async (
    userId: string,
    existingAchievements: Achievement[],
    allWorkouts: Workout[],
  ) => {
    const existing = new Set(existingAchievements.map(a => a.type))
    const toGrant: Omit<Achievement, 'id' | 'user_id' | 'unlocked_at'>[] = []

    if (!existing.has('first_workout') && allWorkouts.length >= 1) {
      toGrant.push({ type: 'first_workout', title: 'First Step', description: 'Logged your first workout!', icon: '🏋️' })
    }

    const totalMiles = allWorkouts.reduce((s, w) => s + (w.running_distance_miles || 0), 0)
    if (!existing.has('distance_milestone') && totalMiles >= 10) {
      toGrant.push({ type: 'distance_milestone', title: '10 Mile Club', description: 'Logged 10 miles of running!', icon: '🛤️' })
    }

    const liftPRMap: Record<string, number> = {}
    for (const w of allWorkouts) {
      if (w.weight_lbs && w.exercise_name) {
        if (!liftPRMap[w.exercise_name] || w.weight_lbs > liftPRMap[w.exercise_name]) {
          liftPRMap[w.exercise_name] = w.weight_lbs
        }
      }
    }
    if (!existing.has('lift_pr') && Object.keys(liftPRMap).length > 0) {
      toGrant.push({ type: 'lift_pr', title: 'Iron Will', description: 'Set a new lifting PR!', icon: '💪' })
    }

    const heavy = allWorkouts.some(w => (w.weight_lbs || 0) >= 200)
    if (!existing.has('heavy_lifter') && heavy) {
      toGrant.push({ type: 'heavy_lifter', title: 'Heavy Hitter', description: 'Lifted 200+ lbs in a single set!', icon: '🏆' })
    }

    if (toGrant.length === 0) return

    const { data } = await supabase
      .from('achievements')
      .insert(toGrant.map(a => ({ ...a, user_id: userId })))
      .select()

    if (data) {
      setAchievements(prev => [...prev, ...data as Achievement[]])
      for (const a of data as Achievement[]) {
        addToast({ type: 'achievement', title: `Achievement Unlocked: ${a.title}`, message: a.description })
      }
    }
  }, [addToast])

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const userId = session.user.id

      const [profileRes, workoutsRes, achievementsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('workouts').select('*').eq('user_id', userId).order('workout_date', { ascending: false }),
        supabase.from('achievements').select('*').eq('user_id', userId),
      ])

      const prof = profileRes.data as Profile | null
      setProfile(prof)

      const ws = (workoutsRes.data || []) as Workout[]
      setWorkouts(ws)

      const ach = (achievementsRes.data || []) as Achievement[]
      setAchievements(ach)

      if (prof?.athlete_name) {
        const { data: racesData } = await supabase
          .from('athletic_results')
          .select('*')
          .eq('athlete_name', prof.athlete_name)
          .order('meet_date', { ascending: false })
        setRaces((racesData || []) as AthleticResult[])
      }

      await checkAndGrantAchievements(userId, ach, ws)
      setLoading(false)
    }
    load()
  }, [checkAndGrantAchievements])

  const prMap = buildPRMap(races)
  const totalMiles = workouts.reduce((s, w) => s + (w.running_distance_miles || 0), 0)
  const prCount = Object.keys(prMap).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <HeroSection
        displayName={profile?.display_name || ''}
        athleteName={profile?.athlete_name || ''}
      />

      <StatGrid
        totalWorkouts={workouts.length}
        totalRaces={races.length}
        totalMiles={totalMiles}
        totalPRs={prCount}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <AthleteCard
            profile={profile}
            onUpdate={(p) => setProfile(p)}
          />
          <PRSummary races={races} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <RecentRaces races={races.slice(0, 5)} prMap={prMap} />
          <RecentWorkouts workouts={workouts.slice(0, 5)} />
          <Achievements achievements={achievements} />
        </div>
      </div>

      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
