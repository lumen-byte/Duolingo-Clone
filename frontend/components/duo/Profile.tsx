'use client'
import { Flame, Zap, Award, Target, Trophy } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { User, Achievement } from '@/lib/types'

export default function Profile({ user, onUpdate, achievements }: { user: User; onUpdate: (patch: any) => void; achievements: Achievement[] }) {
  const [name, setName] = useState(user?.name || 'Learner')
  useEffect(() => setName(user?.name || 'Learner'), [user?.name])
  const AVATARS = ['🦉','🐶','🐱','🦊','🐼','🐸','🐧','🦁','🐷','🐝']
  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center gap-5 mb-8">
        <div className="text-8xl">{user.avatar}</div>
        <div>
          <input value={name} onChange={e => setName(e.target.value)}
            onBlur={() => name !== user.name && onUpdate({ name })}
            className="text-3xl font-black ink bg-transparent focus:outline-none border-b-2 border-transparent focus:border-duo-blue" />
          <div className="ink-3 font-bold">Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        {AVATARS.map(a => (
          <button key={a} onClick={() => onUpdate({ avatar: a })}
            className={`text-3xl p-2 rounded-xl border-2 ${a === user.avatar ? 'border-duo-blue bg-duo-blue/10' : 'border-outline'} hover:surface-2`}>{a}</button>
        ))}
      </div>

      <div className="mb-8">
        <div className="text-xl font-black ink mb-3">Statistics</div>
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={Flame} value={user.streak || 0} label="Day streak" color="#ff9600" />
          <Stat icon={Zap} value={user.xp || 0} label="Total XP" color="#ffc800" />
          <Stat icon={Trophy} value="Bronze" label="Current league" color="#cd7f32" />
          <Stat icon={Target} value={`${user.dailyXp || 0}/${user.dailyGoal || 30}`} label="Daily goal" color="#58cc02" />
        </div>
      </div>

      <div>
        <div className="text-xl font-black ink mb-3">Achievements</div>
        <div className="space-y-3">
          {achievements.map(a => (
            <div key={a.id} className={`flex items-center gap-4 p-4 border-2 rounded-2xl ${a.unlocked ? 'border-outline surface' : 'border-outline surface-2 opacity-60'}`}>
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl" style={{ background: a.unlocked ? a.color + '22' : 'var(--outline)' }}>{a.icon}</div>
              <div className="flex-1">
                <div className="font-black ink">{a.title}</div>
                <div className="text-sm ink-3 font-bold">{a.description}</div>
              </div>
              {a.unlocked && <Award className="w-6 h-6 text-duo-yellow" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Stat({ icon: Icon, value, label, color }: any) {
  return (
    <div className="border-2 border-outline rounded-2xl p-4 flex items-center gap-3">
      <Icon className="w-8 h-8" style={{ color, fill: color }} />
      <div>
        <div className="text-2xl font-black ink">{value}</div>
        <div className="text-xs ink-3 font-bold uppercase">{label}</div>
      </div>
    </div>
  )
}
