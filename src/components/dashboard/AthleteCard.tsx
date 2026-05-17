'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

interface AthleteCardProps {
  profile: Profile | null
  onUpdate: (profile: Profile) => void
}

export default function AthleteCard({ profile, onUpdate }: AthleteCardProps) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${profile.id}/avatar.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id)
      if (updateErr) throw updateErr
      onUpdate({ ...profile, avatar_url: publicUrl })
    } catch (err) {
      console.error('Avatar upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-card border border-border rounded-xl p-5"
    >
      <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Athlete Profile</h3>
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-bg-elevated border-2 border-border flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-text-muted" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center border-2 border-bg-card hover:bg-blue-500 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-3 h-3 text-white animate-spin" />
            ) : (
              <Camera className="w-3 h-3 text-white" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarUpload}
          />
        </div>
        <div>
          <p className="font-semibold text-text-primary">{profile?.display_name || 'Athlete'}</p>
          {profile?.athlete_name && profile.athlete_name !== profile.display_name && (
            <p className="text-xs text-text-muted">{profile.athlete_name}</p>
          )}
          {profile?.bio && <p className="text-xs text-text-muted mt-1 line-clamp-2">{profile.bio}</p>}
          <div className="flex gap-2 mt-1.5">
            <span className="text-xs bg-brand-blue/10 text-brand-blue px-2 py-0.5 rounded-full">Cross Country</span>
            <span className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full">Track</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
