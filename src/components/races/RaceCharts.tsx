'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { AthleticResult } from '@/lib/types'
import { formatTime } from '@/lib/types'

interface RaceChartsProps {
  races: AthleticResult[]
}

const COLORS = ['#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6']

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-elevated border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="text-text-muted mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {formatTime(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function RaceCharts({ races }: RaceChartsProps) {
  const events = [...new Set(races.map(r => r.event))].slice(0, 6)
  const [selectedEvent, setSelectedEvent] = useState(events[0] || '')

  const eventRaces = races
    .filter(r => r.event === selectedEvent)
    .sort((a, b) => a.meet_date.localeCompare(b.meet_date))
    .map(r => ({
      date: new Date(r.meet_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }),
      time: r.result_seconds,
      meet: r.meet_name,
    }))

  const progressData = events.map(ev => {
    const evRaces = races.filter(r => r.event === ev).sort((a, b) => a.meet_date.localeCompare(b.meet_date))
    return evRaces.map(r => ({
      date: new Date(r.meet_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      [ev]: r.result_seconds,
    }))
  }).flat()

  const mergedDates = [...new Set(progressData.map(d => d.date))].sort()
  const chartData = mergedDates.map(date => {
    const row: Record<string, string | number> = { date }
    events.forEach(ev => {
      const match = progressData.find(d => d.date === date && ev in d)
      if (match) row[ev] = match[ev] as number
    })
    return row
  })

  return (
    <div className="space-y-6">
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <h3 className="text-sm font-semibold text-text-primary">Progress by Event</h3>
          <div className="flex flex-wrap gap-2">
            {events.map((ev, i) => (
              <button
                key={ev}
                onClick={() => setSelectedEvent(ev)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  selectedEvent === ev
                    ? 'text-white border-transparent'
                    : 'border-border text-text-muted hover:text-text-primary'
                }`}
                style={selectedEvent === ev ? { backgroundColor: COLORS[i % COLORS.length], borderColor: 'transparent' } : {}}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>
        {eventRaces.length < 2 ? (
          <p className="text-text-muted text-sm text-center py-8">Log at least 2 {selectedEvent} races to see progress.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={eventRaces} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => formatTime(v)}
                tick={{ fill: '#64748b', fontSize: 11 }}
                reversed
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="time"
                name={selectedEvent}
                stroke={COLORS[events.indexOf(selectedEvent) % COLORS.length]}
                strokeWidth={2}
                dot={{ fill: COLORS[events.indexOf(selectedEvent) % COLORS.length], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {events.length > 1 && chartData.length > 1 && (
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-5">All Events Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2433" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis
                tickFormatter={(v) => formatTime(v)}
                tick={{ fill: '#64748b', fontSize: 11 }}
                reversed
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
              {events.map((ev, i) => (
                <Line
                  key={ev}
                  type="monotone"
                  dataKey={ev}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
