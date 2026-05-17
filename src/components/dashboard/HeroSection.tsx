'use client'

import { motion } from 'framer-motion'
import { MapPin, Calendar } from 'lucide-react'

interface HeroSectionProps {
  displayName: string
  athleteName: string
}

export default function HeroSection({ displayName, athleteName }: HeroSectionProps) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-blue/20 via-bg-elevated to-brand-green/10 border border-border p-6 md:p-8"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-brand-blue/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-brand-green/10 blur-3xl" />
      </div>
      <div className="relative">
        <p className="text-text-muted text-sm font-medium mb-1">{greeting},</p>
        <h1 className="text-3xl md:text-4xl font-black text-text-primary mb-1">
          {displayName || athleteName || 'Athlete'} 🏃
        </h1>
        <div className="flex flex-wrap items-center gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-text-muted text-sm">
            <MapPin className="w-3.5 h-3.5 text-brand-blue" />
            Chicago, IL
          </span>
          <span className="flex items-center gap-1.5 text-text-muted text-sm">
            <Calendar className="w-3.5 h-3.5 text-brand-green" />
            Cross Country & Track
          </span>
        </div>
      </div>
    </motion.div>
  )
}
