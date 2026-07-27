'use client'
import { Flame, Trophy } from 'lucide-react'
import type { User } from '@/lib/types'

export default function RightRail({ user, onAdvanceDay }: { user: User | null; onAdvanceDay: () => void }) {
  if (!user) return null
  const goal = user.dailyGoal || 30
  const progress = Math.min(100, ((user.dailyXp || 0) / goal) * 100)
  return (
    <aside className="hidden lg:flex flex-col gap-5 w-[320px] py-6 pl-8 pr-4 sticky top-16">
      <div className="border-2 border-outline rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black ink text-lg">Daily Quests</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-3xl">⚡</div>
          <div className="flex-1">
            <div className="h-4 bg-outline rounded-full overflow-hidden">
              <div className="h-full bg-duo-yellow" style={{ width: `${progress}%` }} />
            </div>
            <div className="text-xs font-bold ink-3 mt-1">Earn {goal} XP • {user.dailyXp || 0}/{goal}</div>
          </div>
        </div>
      </div>

      <div className="border-2 border-outline rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-3">
          <Flame className={`w-8 h-8 ${user.streak > 0 ? 'fill-duo-orange text-duo-orange' : 'text-duo-gray fill-duo-gray'}`} />
          <div>
            <div className="text-2xl font-black ink">{user.streak || 0} day streak!</div>
            <div className="text-sm ink-3 font-bold">Keep learning to grow it</div>
          </div>
        </div>
        <button onClick={onAdvanceDay} className="text-xs text-duo-blue font-black uppercase hover:underline">⏩ Simulate next day (dev)</button>
      </div>

      <div className="border-2 border-outline rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-duo-yellow fill-duo-yellow" />
          <div>
            <div className="font-black ink">Bronze League</div>
            <div className="text-sm ink-3 font-bold">Compete to reach Silver</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
