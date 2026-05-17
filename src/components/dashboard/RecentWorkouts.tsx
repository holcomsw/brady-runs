'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Dumbbell, ChevronRight, Route } from 'lucide-react'
import type { Workout } from '@/lib/types'
import { formatTime } from '@/lib/types'

interface RecentWorkoutsProps {
  workouts: Workout[]
}

const moodEmoji: Record<string, string> = {
  great: '🔥',
  good: '😊',
  okay: '😐',
  tired: '😴',
  bad: '😞',
}

export default function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="bg-bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-brand-blue" />
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Recent Workouts</h3>
        </div>
        <Link href="/dashboard/workouts" className="text-xs text-brand-blue hover:text-blue-400 flex items-center gap-0.5 transition-colors">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      {workouts.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">No workouts logged yet.</p>
      ) : (
        <div className="space-y-2">
          {workouts.map((w) => (
            <div key={w.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary truncate">{w.exercise_name}</span>
                  {w.mood && <span className="text-sm">{moodEmoji[w.mood] || ''}</span>}
                </div>
                <p className="text-xs text-text-muted">
                  {new Date(w.workout_date).toLocaleDateString()}
                  {w.running_distance_miles && ` · ${w.running_distance_miles}mi`}
                </p>
              </div>
              <div className="text-right shrink-0 ml-3">
                {w.running_time_seconds ? (
                  <p className="text-sm font-bold text-text-primary">{formatTime(w.running_time_seconds)}</p>
                ) : w.sets && w.reps ? (
                  <p className="text-sm font-bold text-text-primary">{w.sets}×{w.reps}</p>
                ) : null}
                {w.weight_lbs && <p className="text-xs text-text-muted">{w.weight_lbs} lbs</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
