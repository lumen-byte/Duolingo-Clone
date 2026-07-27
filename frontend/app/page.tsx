'use client'
import { useEffect, useState, useCallback } from 'react'
import Sidebar, { MobileNav } from '@/components/duo/Sidebar'
import TopBar from '@/components/duo/TopBar'
import SkillTree from '@/components/duo/SkillTree'
import LessonPlayer from '@/components/duo/LessonPlayer'
import LessonComplete from '@/components/duo/LessonComplete'
import HeartsModal from '@/components/duo/HeartsModal'
import Leaderboard from '@/components/duo/Leaderboard'
import Profile from '@/components/duo/Profile'
import Shop from '@/components/duo/Shop'
import RightRail from '@/components/duo/RightRail'
import DuoMax from '@/components/duo/DuoMax'
import { Toaster, toast } from 'sonner'
import { useTheme } from 'next-themes'
import type { User, Course, Lesson, AnswerResult, LeaderboardData, Achievement } from '@/lib/types'

async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, { ...opts, headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || err.error || 'Request failed')
  }
  return res.json()
}

type View = 'learn' | 'leaderboard' | 'shop' | 'profile' | 'settings'
type Mode = 'lesson' | 'practice' | 'legendary'

export default function Home() {
  const [view, setView] = useState<View>('learn')
  const [user, setUser] = useState<User | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [activeMode, setActiveMode] = useState<Mode>('lesson')
  const [completeResult, setCompleteResult] = useState<any | null>(null)
  const [heartsOpen, setHeartsOpen] = useState(false)
  const [tutorOpen, setTutorOpen] = useState(false)
  const [tutorSession] = useState(`session-${Date.now()}`)
  const { theme, setTheme } = useTheme()

  const loadUser = useCallback(async () => setUser(await api<User>('/user')), [])
  const loadCourse = useCallback(async () => setCourse(await api<Course>('/course')), [])
  const loadLeaderboard = useCallback(async () => setLeaderboard(await api<LeaderboardData>('/leaderboard')), [])
  const loadAchievements = useCallback(async () => { const r = await api<{ achievements: Achievement[] }>('/achievements'); setAchievements(r.achievements) }, [])

  useEffect(() => { loadUser(); loadCourse(); loadAchievements() }, [loadUser, loadCourse, loadAchievements])
  useEffect(() => { if (view === 'leaderboard') loadLeaderboard() }, [view, loadLeaderboard])
  // Sync theme from user server preference on first load
  useEffect(() => { if (user?.theme && user.theme !== theme) setTheme(user.theme) }, [user?.theme])

  async function startLesson(lessonId: string, mode: Mode = 'lesson') {
    if (mode !== 'practice' && user!.hearts <= 0) { setHeartsOpen(true); return }
    const path = mode === 'legendary' ? `/lesson/${lessonId}/legendary` : `/lesson/${lessonId}`
    const lesson = await api<Lesson>(path)
    setActiveLesson(lesson); setActiveMode(mode)
  }

  async function answerExercise(exerciseId: string, answer: any): Promise<AnswerResult> {
    const res = await api<AnswerResult>('/answer', { method: 'POST', body: JSON.stringify({ exerciseId, answer }) })
    if (!res.correct && activeMode !== 'practice') setUser(u => u ? ({ ...u, hearts: res.hearts }) : u)
    return res
  }

  async function completeLesson(payload: { xpEarned: number; mistakes: number; timeSec: number; mode: string }) {
    if (!activeLesson) return
    const res = await api<any>('/lesson/complete', { method: 'POST', body: JSON.stringify({ lessonId: activeLesson.id, ...payload }) })
    setUser(res.user)
    setActiveLesson(null)
    setCompleteResult({ ...payload, xpEarned: res.xpEarned, newAchievements: res.newAchievements || [] })
    if ((res.newAchievements || []).length) toast.success(`\ud83c\udfc6 New achievement unlocked!`)
    loadCourse(); loadAchievements()
  }

  async function refillHearts(method: string) {
    try {
      const res = await api<any>('/hearts/refill', { method: 'POST', body: JSON.stringify({ method }) })
      setUser(res.user)
      toast.success(method === 'gems' ? 'Hearts refilled!' : '+1 heart')
      setHeartsOpen(false)
    } catch (e: any) { toast.error(e.message) }
  }

  async function updateUser(patch: any) {
    // Update theme locally too
    if (patch.theme) setTheme(patch.theme)
    const res = await api<User>('/user', { method: 'POST', body: JSON.stringify(patch) })
    setUser(res)
  }

  async function advanceDay() {
    await api('/dev/advance-day', { method: 'POST' })
    toast.success('Simulated next day \u2014 complete a lesson to grow streak')
    loadUser()
  }

  async function askExplain(params: { prompt: string; userAnswer: string; correctAnswer: string; exerciseType: string }) {
    const res = await api<{ reply: string }>('/tutor/explain', { method: 'POST', body: JSON.stringify({ sessionId: `explain-${Date.now()}`, ...params }) })
    return res.reply
  }

  async function tutorSend(message: string) {
    const res = await api<{ reply: string }>('/tutor/chat', { method: 'POST', body: JSON.stringify({ sessionId: tutorSession, message }) })
    return res.reply
  }

  return (
    <div className="min-h-screen surface">
      <Toaster position="top-center" richColors />
      <Sidebar view={view} setView={setView} onOpenTutor={() => setTutorOpen(true)} />
      <MobileNav view={view} setView={setView} onOpenTutor={() => setTutorOpen(true)} />

      <div className="md:pl-[260px]">
        <TopBar user={user} onHeartsClick={() => setHeartsOpen(true)} />
        <div className="flex">
          <main className="flex-1 px-4 md:px-8 py-8">
            {view === 'learn' && course && (
              <SkillTree course={course}
                onStartLesson={(id) => startLesson(id, 'lesson')}
                onStartPractice={(id) => startLesson(id, 'practice')}
                onStartLegendary={(id) => startLesson(id, 'legendary')} />
            )}
            {view === 'leaderboard' && leaderboard && (<Leaderboard data={leaderboard} user={user} />)}
            {view === 'profile' && user && (<Profile user={user} onUpdate={updateUser} achievements={achievements} />)}
            {view === 'shop' && user && (<Shop user={user} onRefill={refillHearts} />)}
            {view === 'settings' && (
              <div className="max-w-2xl mx-auto">
                <div className="text-3xl font-black mb-4 ink">More</div>
                <div className="space-y-3">
                  {['Speech practice','Friends','Schools','Help center','Privacy','Terms'].map(x => (
                    <div key={x} className="p-4 border-2 border-outline rounded-2xl font-bold ink-2">{x} <span className="text-xs ink-3 font-normal ml-2">Coming soon</span></div>
                  ))}
                </div>
              </div>
            )}
          </main>
          <RightRail user={user} onAdvanceDay={advanceDay} />
        </div>
      </div>

      {activeLesson && user && (
        <LessonPlayer lesson={activeLesson} user={user} mode={activeMode}
          onAnswer={answerExercise} onExplain={askExplain} onComplete={completeLesson}
          onQuit={() => setActiveLesson(null)} />
      )}
      {completeResult && (<LessonComplete result={completeResult} onContinue={() => setCompleteResult(null)} />)}
      <HeartsModal open={heartsOpen} user={user} onClose={() => setHeartsOpen(false)} onRefill={refillHearts} />
      <DuoMax open={tutorOpen} onClose={() => setTutorOpen(false)} sessionId={tutorSession} onSend={tutorSend} />

      {/* Floating Duo Max button (mobile-friendly reminder) */}
      {!activeLesson && !tutorOpen && (
        <button onClick={() => setTutorOpen(true)}
          className="hidden md:flex fixed bottom-6 right-6 z-30 items-center gap-2 duo-btn duo-btn-purple px-4 py-3 shadow-xl">
          <span>✨</span><span>Ask Duo Max</span>
        </button>
      )}
    </div>
  )
}
