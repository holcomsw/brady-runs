'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, Zap, Trash2 } from 'lucide-react'
import type { AthleticResult } from '@/lib/types'
import { formatTime } from '@/lib/types'
import { supabase } from '@/lib/supabase'

interface RaceTableProps {
  races: AthleticResult[]
  prMap: Record<string, number>
  onDelete: (id: string) => void
}

type SortKey = 'meet_date' | 'event' | 'result_seconds' | 'placement' | 'meet_name'

export default function RaceTable({ races, prMap, onDelete }: RaceTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('meet_date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter] = useState('')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const filtered = races.filter(r =>
    !filter ||
    r.event.toLowerCase().includes(filter.toLowerCase()) ||
    r.meet_name.toLowerCase().includes(filter.toLowerCase())
  )

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey] ?? ''
    const bv = b[sortKey] ?? ''
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this race result?')) return
    await supabase.from('athletic_results').delete().eq('id', id)
    onDelete(id)
  }

  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k
    ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
    : <ChevronDown className="w-3 h-3 opacity-30" />

  const thCls = 'px-3 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider cursor-pointer select-none hover:text-text-primary transition-colors'

  return (
    <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter by event or meet…"
          className="w-full max-w-sm px-3 py-2 bg-bg-elevated border border-border rounded-lg text-text-primary text-sm placeholder-text-muted focus:outline-none focus:border-brand-blue transition-colors"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className={thCls} onClick={() => handleSort('meet_date')}>
                <span className="flex items-center gap-1">Date <SortIcon k="meet_date" /></span>
              </th>
              <th className={thCls} onClick={() => handleSort('event')}>
                <span className="flex items-center gap-1">Event <SortIcon k="event" /></span>
              </th>
              <th className={thCls} onClick={() => handleSort('meet_name')}>
                <span className="flex items-center gap-1">Meet <SortIcon k="meet_name" /></span>
              </th>
              <th className={thCls} onClick={() => handleSort('result_seconds')}>
                <span className="flex items-center gap-1">Time <SortIcon k="result_seconds" /></span>
              </th>
              <th className={thCls} onClick={() => handleSort('placement')}>
                <span className="flex items-center gap-1">Place <SortIcon k="placement" /></span>
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Sport</th>
              <th className="px-3 py-2.5 w-10" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-text-muted text-sm">
                  {filter ? 'No results match your filter.' : 'No races yet — log your first race!'}
                </td>
              </tr>
            ) : (
              sorted.map((race, i) => {
                const isPR = prMap[race.event] === race.result_seconds
                return (
                  <motion.tr
                    key={race.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-bg-elevated/50 transition-colors"
                  >
                    <td className="px-3 py-3 text-sm text-text-muted whitespace-nowrap">
                      {new Date(race.meet_date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary">{race.event}</span>
                        {isPR && (
                          <span className="flex items-center gap-0.5 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                            <Zap className="w-2.5 h-2.5" /> PR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-sm text-text-muted max-w-[160px] truncate">{race.meet_name}</td>
                    <td className="px-3 py-3 text-sm font-bold text-text-primary whitespace-nowrap">
                      {formatTime(race.result_seconds)}
                    </td>
                    <td className="px-3 py-3 text-sm text-text-muted">
                      {race.placement ? `#${race.placement}` : '—'}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        race.sport === 'Track'
                          ? 'bg-brand-blue/10 text-brand-blue'
                          : 'bg-brand-green/10 text-brand-green'
                      }`}>
                        {race.sport}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleDelete(race.id)}
                        className="text-text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
