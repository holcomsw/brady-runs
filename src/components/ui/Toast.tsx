'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, X, Trophy, Zap } from 'lucide-react'

export interface ToastData {
  id: string
  type: 'success' | 'achievement' | 'error'
  title: string
  message?: string
}

interface ToastProps {
  toasts: ToastData[]
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: { toast: ToastData; onRemove: (id: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000)
    return () => clearTimeout(t)
  }, [toast.id, onRemove])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-brand-green" />,
    achievement: <Trophy className="w-5 h-5 text-yellow-400" />,
    error: <Zap className="w-5 h-5 text-red-400" />,
  }

  const borders = {
    success: 'border-brand-green/30',
    achievement: 'border-yellow-400/30',
    error: 'border-red-400/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      className={`flex items-start gap-3 p-4 bg-bg-elevated border ${borders[toast.type]} rounded-xl shadow-2xl max-w-sm w-full`}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary">{toast.title}</p>
        {toast.message && <p className="text-xs text-text-muted mt-0.5">{toast.message}</p>}
      </div>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 text-text-muted hover:text-text-primary">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}
