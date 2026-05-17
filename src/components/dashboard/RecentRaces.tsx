'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trophy, ChevronRight, Zap } from 'lucide-react'
import type { AthleticResult } from '@/lib/types'
import { formatTime } from '@/lib/types'

interface RecentRacesProps {
  races: AthleticResult[]
  prMap: Record<string, number>
}

export default function RecentRaces({ races, prMap }: RecentRacesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-brand-green" />
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Recent Races</h3>
        </div>
        <Link href="/dashboard/races" className="text-xs text-brand-blue hover:text-blue-400 flex items-center gap-0.5 transition-colors">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      {races.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">No races logged yet.</p>
      ) : (
        <div className="space-y-2">
          {races.map((race) => {
            const isPR = prMap[race.event] === race.result_seconds
            return (
              <div key={race.id} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary truncate">{race.event}</span>
                    {isPR && (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-400 font-bold bg-yellow-400/10 px-1.5 py-0.5 rounded-full shrink-0">
                        <Zap className="w-2.5 h-2.5" /> PR
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted truncate">{race.meet_name} · {new Date(race.meet_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-bold text-text-primary">{formatTime(race.result_seconds)}</p>
                  {race.placement && (
                    <p className="text-xs text-text-muted">#{race.placement}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
