'use client'

import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import type { Achievement } from '@/lib/types'

interface AchievementsProps {
  achievements: Achievement[]
}

const iconMap: Record<string, string> = {
  first_workout: '🏋️',
  lift_pr: '💪',
  heavy_lifter: '🏆',
  distance_milestone: '🛤️',
  race_pr: '⚡',
  default: '🎖️',
}

export default function Achievements({ achievements }: AchievementsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Award className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Achievements</h3>
        {achievements.length > 0 && (
          <span className="ml-auto text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
            {achievements.length}
          </span>
        )}
      </div>
      {achievements.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">Complete workouts to unlock achievements!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((a) => (
            <div key={a.id} className="flex flex-col items-center text-center p-3 bg-bg-elevated rounded-lg border border-border">
              <span className="text-2xl mb-1">{iconMap[a.type] || a.icon || iconMap.default}</span>
              <p className="text-xs font-semibold text-text-primary">{a.title}</p>
              <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{a.description}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
