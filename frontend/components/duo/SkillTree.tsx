'use client'
import { useState } from 'react'
import { Star, Lock, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import type { Course, SkillNodeData } from '@/lib/types'

const OFFSETS = [0, 60, 90, 60, 0, -60, -90, -60, 0]

function SkillIconByName({ name }: { name: string }) {
  const map: Record<string, string> = { star: '⭐', plane: '✈️', family: '👪', apple: '🍎', paw: '🐾', palette: '🎨', hash: '🔢' }
  return <span className="text-4xl">{map[name] || '⭐'}</span>
}

function SkillNode({ skill, unitColor, unitColorDark, index, isCurrent, onClick }: {
  skill: SkillNodeData; unitColor: string; unitColorDark: string; index: number; isCurrent: boolean; onClick: (s: SkillNodeData) => void;
}) {
  const offset = OFFSETS[index % OFFSETS.length]
  const state = skill.finished ? 'done' : (skill.unlocked ? 'active' : 'locked')
  const bg = state === 'locked' ? '#e5e5e5' : (state === 'done' ? '#ffc800' : unitColor)
  const bgDark = state === 'locked' ? '#b0b0b0' : (state === 'done' ? '#e6b400' : unitColorDark)
  const progressPct = skill.totalLessons > 0 ? (skill.lessonsCompleted / skill.totalLessons) * 100 : 0

  return (
    <div className="relative flex flex-col items-center" style={{ transform: `translateX(${offset}px)` }}>
      {isCurrent && !skill.finished && skill.unlocked && (
        <div className="absolute -top-10 z-10 animate-bounce">
          <div className="surface text-duo-green font-black uppercase text-xs px-3 py-1.5 rounded-xl border-2 border-outline" style={{ boxShadow: '0 2px 0 var(--shadow-outline)' }}>
            Start
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 surface border-b-2 border-r-2 border-outline" />
          </div>
        </div>
      )}
      <div className="relative">
        {state !== 'locked' && skill.totalLessons > 1 && (
          <svg className="absolute -inset-2 -rotate-90" width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="51" fill="none" stroke="var(--outline)" strokeWidth="5" />
            <circle cx="55" cy="55" r="51" fill="none" stroke={state === 'done' ? '#ffc800' : unitColor} strokeWidth="5"
              strokeDasharray={2 * Math.PI * 51} strokeDashoffset={2 * Math.PI * 51 * (1 - progressPct / 100)}
              strokeLinecap="round" className="transition-all duration-500" />
          </svg>
        )}
        <button onClick={() => onClick(skill)} disabled={state === 'locked'}
          className={cn('skill-node w-24 h-24', state === 'locked' && 'locked')}
          style={{ background: bg, boxShadow: `0 6px 0 0 ${bgDark}` }}>
          {state === 'locked' ? <Lock className="w-10 h-10 text-duo-gray-dark" strokeWidth={3} />
            : state === 'done' ? <Star className="w-12 h-12 text-white fill-white" strokeWidth={2.5} />
            : <SkillIconByName name={skill.icon} />}
        </button>
      </div>
      <div className="mt-3 text-center">
        <div className={cn('font-black text-sm uppercase tracking-wide', state === 'locked' ? 'ink-3' : 'ink')}>{skill.title}</div>
        {skill.crowns > 0 && (
          <div className="flex items-center justify-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < skill.crowns ? 'text-duo-yellow text-xs' : 'text-duo-gray text-xs opacity-40'}>👑</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function UnitBanner({ unit }: { unit: any }) {
  return (
    <div className="rounded-2xl px-5 py-4 flex items-center justify-between mb-8 mx-2" style={{ background: unit.color, boxShadow: `0 4px 0 0 ${unit.colorDark}` }}>
      <div className="text-white">
        <div className="text-sm font-bold opacity-90">{unit.title}</div>
        <div className="text-xl font-black">{unit.subtitle}</div>
      </div>
    </div>
  )
}

function SkillPopover({ skill, unitColor, unitColorDark, onStart, onPractice, onLegendary }: {
  skill: SkillNodeData; unitColor: string; unitColorDark: string;
  onStart: (id: string) => void; onPractice: (id: string) => void; onLegendary: (id: string) => void;
}) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        className="absolute z-20 top-28 left-1/2 -translate-x-1/2 w-80">
        <div className="rounded-2xl p-5 text-white text-center relative" style={{ background: unitColor, boxShadow: `0 4px 0 0 ${unitColorDark}` }}>
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45" style={{ background: unitColor }} />
          <div className="text-xl font-black mb-1">{skill.title}</div>
          <div className="text-sm opacity-90 mb-3">
            {skill.finished ? 'All lessons done! Practice or go legendary' : `Lesson ${Math.min(skill.lessonsCompleted + 1, skill.totalLessons)} of ${skill.totalLessons}`}
          </div>
          {!skill.finished && skill.activeLessonId && (
            <button onClick={() => onStart(skill.activeLessonId!)} className="duo-btn duo-btn-white w-full py-3 text-base mb-2">
              {skill.lessonsCompleted > 0 ? 'Continue' : 'Start'} +15 XP
            </button>
          )}
          {skill.finished && skill.lessons[0] && (
            <>
              <button onClick={() => onPractice(skill.lessons[0].id)}
                className="duo-btn duo-btn-white w-full py-3 text-base mb-2 flex items-center justify-center gap-2">
                <span>💔❌❤️</span> Practice • +1 heart, +5 XP
              </button>
              <button onClick={() => onLegendary(skill.lessons[0].id)}
                className="w-full py-3 text-base rounded-2xl font-bold uppercase tracking-wider bg-gradient-to-r from-duo-purple to-duo-blue text-white flex items-center justify-center gap-2" style={{ boxShadow: '0 4px 0 #6b3ecf' }}>
                <span>💎</span> Legendary • +40 XP
              </button>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function SkillTree({ course, onStartLesson, onStartPractice, onStartLegendary }: {
  course: Course;
  onStartLesson: (id: string) => void;
  onStartPractice: (id: string) => void;
  onStartLegendary: (id: string) => void;
}) {
  const [openSkillId, setOpenSkillId] = useState<string | null>(null)

  let currentSkillId: string | null = null
  for (const u of course.units) for (const s of u.skills) if (s.unlocked && !s.finished && !currentSkillId) currentSkillId = s.id

  return (
    <div className="max-w-2xl mx-auto pb-24">
      {course.units.map(unit => (
        <div key={unit.id} className="mb-16">
          <UnitBanner unit={unit} />
          <div className="flex flex-col items-center gap-10 relative">
            {unit.skills.map((s, idx) => (
              <div key={s.id} className="relative w-full flex justify-center">
                <SkillNode skill={s} unitColor={unit.color} unitColorDark={unit.colorDark} index={idx}
                  isCurrent={s.id === currentSkillId}
                  onClick={(sk) => sk.unlocked && setOpenSkillId(openSkillId === sk.id ? null : sk.id)} />
                {openSkillId === s.id && (
                  <SkillPopover skill={s} unitColor={unit.color} unitColorDark={unit.colorDark}
                    onStart={(lid) => { setOpenSkillId(null); onStartLesson(lid) }}
                    onPractice={(lid) => { setOpenSkillId(null); onStartPractice(lid) }}
                    onLegendary={(lid) => { setOpenSkillId(null); onStartLegendary(lid) }} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="text-center ink-3 py-10 font-bold">
        <Zap className="w-8 h-8 mx-auto mb-2" /> More units coming soon!
      </div>
    </div>
  )
}
