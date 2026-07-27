'use client'
import { Trophy, Medal } from 'lucide-react'
import type { LeaderboardData, User } from '@/lib/types'

export default function Leaderboard({ data, user }: { data: LeaderboardData; user: User | null }) {
  if (!data) return null
  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="text-center mb-8">
        <div className="text-8xl mb-2">🏆</div>
        <div className="text-3xl font-black ink">{data.league} League</div>
        <div className="ink-3 font-bold">Top 3 advance next week</div>
      </div>
      <div className="surface rounded-2xl border-2 border-outline overflow-hidden">
        {data.users.map((u, i) => {
          const rank = i + 1
          const isMe = u.id === user?.id || u.isMe
          return (
            <div key={u.id} className={`flex items-center gap-4 p-3 border-b border-outline last:border-0 ${isMe ? 'bg-duo-blue/10' : ''}`}>
              <div className={`w-10 flex justify-center font-black ${rank === 1 ? 'text-duo-yellow' : rank === 2 ? 'ink-3' : rank === 3 ? 'text-orange-500' : 'ink-3'}`}>
                {rank <= 3 ? <Medal className="w-7 h-7" /> : rank}
              </div>
              <div className="text-3xl">{u.avatar}</div>
              <div className="flex-1 font-black ink">
                {u.name}{isMe && <span className="text-duo-blue ml-2 text-xs">YOU</span>}
              </div>
              <div className="font-black ink-2">{u.xp} XP</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
