'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
import type { Workout } from '@/lib/types'
import { formatTime } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface WorkoutTableProps {
  workouts: Workout[]
  onDelete: (id: string) => void
}

type SortKey = 'workout_date' | 'exercise_name' | 'weight_lbs' | 'running_distance_miles'

const moodEmoji: Record<string, string> = {
  great: '🔥', good: '😊', okay: '😐', tired: '😴', bad: '😞',
}

export default function WorkoutTable({ workouts, onDelete }: WorkoutTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('workout_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...workouts].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this workout?')) return
    await supabase.from('workouts').delete().eq('id', id)
    onDelete(id)
  }

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
    : <ChevronDown className="w-3 h-3 opacity-30" />

  const thCls = 'px-3 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer select-none hover:text-text-primary transition-colors'

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={thCls} onClick={() => handleSort('workout_date')}>
                <span className="flex items-center gap-1">Date <SortIcon k="workout_date" /></span>
              </th>
              <th className={thCls} onClick={() => handleSort('exercise_name')}>
                <span className="flex items-center gap-1">Workout <SortIcon k="exercise_name" /></span>
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Duration</th>
              <th className={thCls} onClick={() => handleSort('running_distance_miles')}>
                <span className="flex items-center gap-1">Distance <SortIcon k="running_distance_miles" /></span>
              </th>
              <th className={thCls} onClick={() => handleSort('weight_lbs')}>
                <span className="flex items-center gap-1">Weight <SortIcon k="weight_lbs" /></span>
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Mood</th>
              <th className="px-3 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted text-sm">
                  No workouts yet. Log your first workout!
                </td>
              </tr>
            ) : (
              sorted.map((w, i) => (
                <motion.tr
                  key={w.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors"
                >
                  <td className="px-3 py-3 text-sm text-text-muted whitespace-nowrap">
                    {new Date(w.workout_date).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-sm font-medium text-text-primary">{w.exercise_name}</p>
                    {w.notes && <p className="text-xs text-text-muted truncate max-w-[180px]">{w.notes}</p>}
                  </td>
                  <td className="px-3 py-3 text-sm text-text-primary whitespace-nowrap">
                    {w.running_time_seconds ? formatTime(w.running_time_seconds) : (w.sets && w.reps ? `${w.sets}×${w.reps}` : '—')}
                  </td>
                  <td className="px-3 py-3 text-sm text-text-primary whitespace-nowrap">
                    {w.running_distance_miles ? `${w.running_distance_miles} mi` : '—'}
                  </td>
                  <td className="px-3 py-3 text-sm text-text-primary whitespace-nowrap">
                    {w.weight_lbs ? `${w.weight_lbs} lbs` : '—'}
                  </td>
                  <td className="px-3 py-3 text-lg">
                    {w.mood ? (moodEmoji[w.mood] || w.mood) : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="text-text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
