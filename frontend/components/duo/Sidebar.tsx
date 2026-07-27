'use client'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { Home, Trophy, User, ShoppingBag, MoreHorizontal, Moon, Sun, Sparkles } from 'lucide-react'

type View = 'learn' | 'leaderboard' | 'shop' | 'profile' | 'settings'

const NAV: { id: View; label: string; icon: any; color: string; bg: string; border: string }[] = [
  { id: 'learn', label: 'Learn', icon: Home, color: 'text-duo-blue', bg: 'bg-duo-blue/10 dark:bg-duo-blue/20', border: 'border-duo-blue' },
  { id: 'leaderboard', label: 'Leaderboards', icon: Trophy, color: 'text-duo-yellow', bg: 'bg-duo-yellow/10 dark:bg-duo-yellow/20', border: 'border-duo-yellow' },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, color: 'text-duo-red', bg: 'bg-duo-red/10 dark:bg-duo-red/20', border: 'border-duo-red' },
  { id: 'profile', label: 'Profile', icon: User, color: 'text-duo-purple', bg: 'bg-duo-purple/10 dark:bg-duo-purple/20', border: 'border-duo-purple' },
  { id: 'settings', label: 'More', icon: MoreHorizontal, color: 'ink-3', bg: 'surface-2', border: 'border-outline' },
]

export default function Sidebar({ view, setView, onOpenTutor }: { view: View; setView: (v: View) => void; onOpenTutor: () => void }) {
  const { theme, setTheme } = useTheme()
  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] border-r-2 border-outline surface flex-col p-4 z-40">
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="text-4xl">🦉</div>
        <div className="text-3xl font-black text-duo-green tracking-tight">duolingo</div>
      </div>
      <nav className="flex flex-col gap-2">
        {NAV.map(item => {
          const Icon = item.icon
          const active = view === item.id
          return (
            <button key={item.id} onClick={() => setView(item.id)}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-2xl font-bold uppercase tracking-wide text-sm transition-all border-2',
                active ? `${item.bg} ${item.border} ${item.color}` : 'border-transparent ink-2 hover:surface-2'
              )}>
              <Icon className={cn('w-8 h-8', active ? item.color : 'ink-3')} strokeWidth={2.5} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Duo Max AI Tutor CTA */}
      <button onClick={onOpenTutor}
        className="mt-4 flex items-center gap-3 px-4 py-3 rounded-2xl font-bold uppercase tracking-wide text-sm border-2 border-duo-purple bg-gradient-to-br from-duo-purple/10 to-duo-blue/10 text-duo-purple hover:from-duo-purple/20 hover:to-duo-blue/20 transition-all">
        <Sparkles className="w-7 h-7" strokeWidth={2.5} />
        <span>Duo Max <span className="text-[10px] bg-duo-purple text-white px-1.5 py-0.5 rounded ml-1">AI</span></span>
      </button>

      <div className="mt-auto flex flex-col gap-2 px-3 py-4 border-t-2 border-outline">
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex items-center gap-2 text-sm font-bold ink-3 hover:ink transition">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="text-xs ink-3">Duolingo Clone • Scaler assignment</div>
      </div>
    </aside>
  )
}

export function MobileNav({ view, setView, onOpenTutor }: { view: View; setView: (v: View) => void; onOpenTutor: () => void }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t-2 border-outline surface z-40 flex justify-around py-2">
      {NAV.filter(n => n.id !== 'settings').map(item => {
        const Icon = item.icon
        const active = view === item.id
        return (
          <button key={item.id} onClick={() => setView(item.id)}
            className={cn('flex flex-col items-center px-3 py-2 rounded-xl border-2', active ? `${item.bg} ${item.border}` : 'border-transparent')}>
            <Icon className={cn('w-6 h-6', active ? item.color : 'ink-3')} strokeWidth={2.5} />
          </button>
        )
      })}
      <button onClick={onOpenTutor} className="flex flex-col items-center px-3 py-2 rounded-xl border-2 border-duo-purple">
        <Sparkles className="w-6 h-6 text-duo-purple" />
      </button>
    </nav>
  )
}
