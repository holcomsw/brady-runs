'use client'

import { motion } from 'framer-motion'
import { Dumbbell, Trophy, Route, Zap } from 'lucide-react'

interface StatGridProps {
  totalWorkouts: number
  totalRaces: number
  totalMiles: number
  totalPRs: number
}

const stats = (props: StatGridProps) => [
  {
    label: 'Workouts',
    value: props.totalWorkouts,
    icon: Dumbbell,
    color: 'text-brand-blue',
    bg: 'bg-brand-blue/10',
    suffix: '',
  },
  {
    label: 'Races',
    value: props.totalRaces,
    icon: Trophy,
    color: 'text-brand-green',
    bg: 'bg-brand-green/10',
    suffix: '',
  },
  {
    label: 'Miles Logged',
    value: props.totalMiles.toFixed(1),
    icon: Route,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    suffix: 'mi',
  },
  {
    label: 'Personal Records',
    value: props.totalPRs,
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    suffix: '',
  },
]

export default function StatGrid(props: StatGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats(props).map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-bg-card border border-border rounded-xl p-5"
        >
          <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {stat.value}
            {stat.suffix && <span className="text-sm font-normal text-text-muted ml-1">{stat.suffix}</span>}
          </p>
          <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  )
}
