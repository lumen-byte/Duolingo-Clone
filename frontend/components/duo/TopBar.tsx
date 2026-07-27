'use client'
import { Flame, Heart, Gem } from 'lucide-react'
import type { User } from '@/lib/types'

export default function TopBar({ user, onHeartsClick }: { user: User | null; onHeartsClick: () => void }) {
  if (!user) return null
  return (
    <div className="sticky top-0 z-30 surface border-b-2 border-outline">
      <div className="max-w-5xl mx-auto flex items-center justify-end gap-5 px-4 py-3">
        <button className="flex items-center gap-1.5" title="Language">
          <span className="text-2xl">🇪🇸</span>
        </button>
        <div className="flex items-center gap-1.5" title={`${user.streak} day streak`}>
          <Flame className={`w-6 h-6 ${user.streak > 0 ? 'fill-duo-orange text-duo-orange' : 'text-duo-gray fill-duo-gray'}`} />
          <span className={`font-black text-lg ${user.streak > 0 ? 'text-duo-orange' : 'text-duo-gray'}`}>{user.streak || 0}</span>
        </div>
        <div className="flex items-center gap-1.5" title="Gems">
          <Gem className="w-6 h-6 fill-duo-blue text-duo-blue-dark" />
          <span className="font-black text-lg text-duo-blue">{user.gems || 0}</span>
        </div>
        <button onClick={onHeartsClick} className="flex items-center gap-1.5" title="Hearts">
          <Heart className={`w-6 h-6 ${user.hearts > 0 ? 'fill-duo-red text-duo-red' : 'text-duo-gray fill-duo-gray'}`} />
          <span className={`font-black text-lg ${user.hearts > 0 ? 'text-duo-red' : 'text-duo-gray'}`}>{user.hearts}</span>
        </button>
      </div>
    </div>
  )
}
