export interface AthleticResult {
  id: string
  athlete_name: string
  sport: string
  event: string
  meet_name: string
  meet_date: string
  result: string
  result_seconds: number
  placement: number | null
  team: string | null
  grade: string | null
  season_year: string | null
  source: string | null
}

export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  athlete_name: string | null
}

export interface Workout {
  id: string
  user_id: string
  exercise_name: string
  workout_date: string
  sets: number | null
  reps: number | null
  weight_lbs: number | null
  running_distance_miles: number | null
  running_time_seconds: number | null
  calories_burned: number | null
  notes: string | null
  mood: string | null
  energy_level: number | null
}

export interface Achievement {
  id: string
  user_id: string
  type: string
  title: string
  description: string
  icon: string
  unlocked_at: string
}

export function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '--'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatPace(seconds: number, miles: number): string {
  if (!seconds || !miles || miles <= 0) return '--'
  const paceSeconds = seconds / miles
  const m = Math.floor(paceSeconds / 60)
  const s = Math.round(paceSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}/mi`
}
