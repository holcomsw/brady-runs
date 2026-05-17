'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import type { AthleticResult } from '@/lib/types'
import { formatTime } from '@/lib/types'

interface PRSummaryProps {
  races: AthleticResult[]
}

export default function PRSummary({ races }: PRSummaryProps) {
  const prByEvent: Record<string, AthleticResult> = {}
  for (const race of races) {
    if (!prByEvent[race.event] || race.result_seconds < prByEvent[race.event].result_seconds) {
      prByEvent[race.event] = race
    }
  }
  const prs = Object.values(prByEvent).sort((a, b) => a.event.localeCompare(b.event))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Personal Records</h3>
      </div>
      {prs.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">No races yet — go set some PRs!</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {prs.map((pr) => (
            <div key={pr.event} className="bg-bg-elevated rounded-lg p-3 border border-yellow-400/20">
              <p className="text-xs text-text-muted mb-1">{pr.event}</p>
              <p className="text-xl font-black text-yellow-400">{formatTime(pr.result_seconds)}</p>
              <p className="text-xs text-text-muted mt-0.5 truncate">{pr.meet_name}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
