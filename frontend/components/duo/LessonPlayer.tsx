'use client'
import { useState, useEffect, useMemo } from 'react'
import { X, Heart, Volume2, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import DuoOwl from './DuoOwl'
import type { AnswerResult, Lesson, ExerciseBase } from '@/lib/types'

// ---------- TTS helper (Web Speech API — free, no key) ----------
function speak(text: string, lang = 'es-ES') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = lang; u.rate = 0.9
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
  } catch {}
}

function SpeakerBtn({ text, lang = 'es-ES', large }: { text: string; lang?: string; large?: boolean }) {
  return (
    <button onClick={() => speak(text, lang)} title="Play audio"
      className={cn('inline-flex items-center justify-center rounded-xl text-white bg-duo-blue hover:bg-duo-blue-dark transition', large ? 'w-10 h-10' : 'w-8 h-8')}>
      <Volume2 className={large ? 'w-5 h-5' : 'w-4 h-4'} />
    </button>
  )
}

// ---------- Exercise Renderers ----------
function MultipleChoice({ exercise, selected, setSelected, disabled }: any) {
  return (
    <div>
      <h2 className="text-2xl font-black mb-6 ink">{exercise.prompt}</h2>
      <div className="grid grid-cols-3 gap-3">
        {exercise.options.map((opt: any, i: number) => (
          <button key={i} disabled={disabled} onClick={() => setSelected(opt.text)}
            className={cn('option-card flex flex-col items-center py-6 text-center', selected === opt.text && 'selected')}>
            <div className="text-6xl mb-3">{opt.img}</div>
            <div className="flex items-center gap-2">
              <span>{opt.text}</span>
              <span onClick={(e) => { e.stopPropagation(); speak(opt.text) }} className="opacity-60 hover:opacity-100">
                <Volume2 className="w-4 h-4" />
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function TranslateWordBank({ exercise, answer, setAnswer, disabled }: any) {
  const placed = answer.placed, used = answer.used
  const addWord = (word: string, srcIdx: number) => { if (disabled) return; setAnswer({ placed: [...placed, { word, srcIdx }], used: [...used, srcIdx] }) }
  const removeWord = (idx: number) => {
    if (disabled) return
    const removed = placed[idx]
    setAnswer({ placed: placed.filter((_: any, i: number) => i !== idx), used: used.filter((u: number) => u !== removed.srcIdx) })
  }
  return (
    <div>
      <h2 className="text-2xl font-black mb-4 ink">Translate this sentence</h2>
      <div className="flex items-center gap-4 mb-8 surface-2 p-4 rounded-2xl">
        <div className="text-5xl"><DuoOwl size={80} emotion="idle" /></div>
        <div className="surface rounded-2xl p-3 flex-1 font-bold text-lg border-2 border-outline ink flex items-center justify-between gap-2">
          <span>{exercise.prompt}</span>
          <SpeakerBtn text={exercise.prompt} lang="en-US" />
        </div>
      </div>
      <div className="border-b-2 border-outline min-h-[52px] mb-8 pb-2 flex flex-wrap gap-2">
        {placed.map((p: any, i: number) => (<button key={i} onClick={() => removeWord(i)} className="word-chip placed">{p.word}</button>))}
      </div>
      <div className="flex flex-wrap gap-2">
        {exercise.wordBank.map((w: string, i: number) => (
          <button key={i} onClick={() => addWord(w, i)} disabled={disabled || used.includes(i)}
            className={cn('word-chip', used.includes(i) && 'used')}>{w}</button>
        ))}
      </div>
    </div>
  )
}

function FillBlank({ exercise, selected, setSelected, disabled }: any) {
  const parts = exercise.sentence.split('___')
  return (
    <div>
      <h2 className="text-2xl font-black mb-6 ink flex items-center gap-2">Fill in the blank <SpeakerBtn text={exercise.sentence.replace('___', selected || '____')} /></h2>
      <div className="text-2xl font-bold mb-2 flex flex-wrap items-center gap-2 ink">
        <span>{parts[0]}</span>
        <span className={cn('inline-block min-w-[100px] border-b-4 pb-1 text-center', selected ? 'border-duo-blue text-duo-blue' : 'border-outline text-transparent')}>
          {selected || 'blank'}
        </span>
        <span>{parts[1]}</span>
      </div>
      {exercise.translation && <div className="ink-3 text-sm mb-6 italic">{exercise.translation}</div>}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {exercise.options.map((o: string, i: number) => (
          <button key={i} onClick={() => setSelected(o)} disabled={disabled} className={cn('option-card py-4', selected === o && 'selected')}>{o}</button>
        ))}
      </div>
    </div>
  )
}

function TypeAnswer({ exercise, answer, setAnswer, disabled }: any) {
  return (
    <div>
      <h2 className="text-2xl font-black mb-4 ink">{exercise.prompt}</h2>
      {exercise.hint && <div className="ink-3 text-sm mb-4 italic">Hint: {exercise.hint}</div>}
      <input value={answer} onChange={(e) => setAnswer(e.target.value)} disabled={disabled} placeholder="Type your answer…"
        className="w-full text-xl font-bold border-2 border-outline surface ink rounded-2xl px-4 py-4 focus:outline-none focus:border-duo-blue" autoFocus />
    </div>
  )
}

function MatchPairs({ exercise, matches, setMatches, disabled }: any) {
  const [pickedLeft, setPickedLeft] = useState<string | null>(null)
  const [pickedRight, setPickedRight] = useState<string | null>(null)
  const [correctSet, setCorrectSet] = useState<any[]>([])

  useEffect(() => {
    if (pickedLeft && pickedRight) {
      const newMatches = [...matches, { left: pickedLeft, right: pickedRight }]
      setMatches(newMatches)
      setCorrectSet(cs => [...cs, { left: pickedLeft, right: pickedRight }])
      setPickedLeft(null); setPickedRight(null)
    }
  }, [pickedLeft, pickedRight])

  const isUsedLeft = (l: string) => correctSet.find(c => c.left === l)
  const isUsedRight = (r: string) => correctSet.find(c => c.right === r)

  return (
    <div>
      <h2 className="text-2xl font-black mb-6 ink">Tap the matching pairs</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          {exercise.lefts.map((l: string) => (
            <button key={l} disabled={disabled || !!isUsedLeft(l)} onClick={() => { setPickedLeft(l); speak(l) }}
              className={cn('option-card py-4', pickedLeft === l && 'selected', isUsedLeft(l) && 'correct disabled')}>{l}</button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {exercise.rights.map((r: string) => (
            <button key={r} disabled={disabled || !!isUsedRight(r)} onClick={() => setPickedRight(r)}
              className={cn('option-card py-4', pickedRight === r && 'selected', isUsedRight(r) && 'correct disabled')}>{r}</button>
          ))}
        </div>
      </div>
      <div className="text-sm ink-3 mt-4 text-center">Matched {correctSet.length} / {exercise.pairsCount}</div>
    </div>
  )
}

// ---------- Feedback Bar with Explain button ----------
function FeedbackBar({ result, exercise, onContinue, onExplain, explaining, explanation, mode }: any) {
  if (!result) return null
  const correct = result.correct
  return (
    <motion.div initial={{ y: 100 }} animate={{ y: 0 }}
      className={cn('fixed left-0 right-0 bottom-0 z-40', correct ? 'bg-duo-green/20 dark:bg-duo-green/10' : 'bg-duo-red/20 dark:bg-duo-red/10', 'border-t-2', correct ? 'border-duo-green' : 'border-duo-red')}>
      <div className="max-w-3xl mx-auto p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn('w-14 h-14 rounded-full flex items-center justify-center text-4xl bg-white')}>
              {correct ? '✅' : '❌'}
            </div>
            <div>
              <div className={cn('text-2xl font-black', correct ? 'text-duo-green-dark dark:text-duo-green' : 'text-duo-red-dark dark:text-duo-red')}>
                {correct ? 'Excellent!' : 'Correct answer:'}
              </div>
              {!correct && (
                <div className="font-bold text-duo-red-dark dark:text-duo-red">
                  {Array.isArray(result.correctAnswer)
                    ? result.correctAnswer.map((p: any) => `${p.left} → ${p.right}`).join(', ')
                    : result.correctAnswer}
                </div>
              )}
              {correct && exercise?.translation && (
                <div className="text-duo-green-dark dark:text-duo-green font-bold text-sm italic">{exercise.translation}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!correct && !explanation && (
              <button onClick={onExplain} disabled={explaining}
                className="duo-btn duo-btn-purple px-4 py-3 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> {explaining ? 'Thinking…' : 'Ask Duo Max'}
              </button>
            )}
            <button onClick={onContinue} className={cn('duo-btn text-white px-8 py-3', correct ? 'duo-btn-green' : 'duo-btn-red')}>Continue</button>
          </div>
        </div>
        {explanation && (
          <div className="mt-3 flex items-start gap-3 surface rounded-2xl p-4 border-2 border-duo-purple">
            <DuoOwl size={60} emotion="thinking" />
            <div className="text-sm font-bold ink whitespace-pre-wrap">{explanation}</div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ---------- Main Player ----------
export default function LessonPlayer({ lesson, user, mode = 'lesson', onAnswer, onExplain, onComplete, onQuit }: {
  lesson: Lesson; user: any; mode?: 'lesson' | 'practice' | 'legendary';
  onAnswer: (exerciseId: string, answer: any) => Promise<AnswerResult>;
  onExplain: (params: { prompt: string; userAnswer: string; correctAnswer: string; exerciseType: string }) => Promise<string>;
  onComplete: (payload: { xpEarned: number; mistakes: number; timeSec: number; mode: string }) => void;
  onQuit: () => void;
}) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<any>(null)
  const [typed, setTyped] = useState('')
  const [wbAnswer, setWbAnswer] = useState<any>({ placed: [], used: [] })
  const [matches, setMatches] = useState<any[]>([])
  const [result, setResult] = useState<AnswerResult | null>(null)
  const [hearts, setHearts] = useState(user?.hearts ?? 5)
  const [mistakes, setMistakes] = useState(0)
  const [outOfHearts, setOutOfHearts] = useState(false)
  const [startedAt] = useState(Date.now())
  const [duoEmotion, setDuoEmotion] = useState<'idle' | 'happy' | 'sad' | 'cheer'>('idle')
  const [explaining, setExplaining] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  // Legendary mode: 60s per exercise timer
  const [timeLeft, setTimeLeft] = useState<number>(mode === 'legendary' ? 60 : 0)

  const total = lesson.exercises.length
  const exercise = lesson.exercises[index]

  useEffect(() => {
    setSelected(null); setTyped(''); setWbAnswer({ placed: [], used: [] }); setMatches([])
    setResult(null); setExplanation(null); setDuoEmotion('idle')
    if (mode === 'legendary') setTimeLeft(60)
    if (exercise?.type === 'translate_wordbank' && exercise.prompt) speak(exercise.prompt, 'en-US')
  }, [index])

  // Legendary countdown
  useEffect(() => {
    if (mode !== 'legendary' || result) return
    if (timeLeft <= 0) { handleCheck(true) as any; return }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, result, mode])

  const canCheck = useMemo(() => {
    if (!exercise) return false
    if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') return !!selected
    if (exercise.type === 'type_answer') return typed.trim().length > 0
    if (exercise.type === 'translate_wordbank') return wbAnswer.placed.length > 0
    if (exercise.type === 'match_pairs') return matches.length === (exercise.pairsCount || 0)
    return false
  }, [exercise, selected, typed, wbAnswer, matches])

  async function handleCheck(auto = false) {
    let answer: any = null
    if (exercise.type === 'multiple_choice' || exercise.type === 'fill_blank') answer = selected
    else if (exercise.type === 'type_answer') answer = typed
    else if (exercise.type === 'translate_wordbank') answer = wbAnswer.placed.map((p: any) => p.word)
    else if (exercise.type === 'match_pairs') answer = matches
    if (auto && (answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0))) answer = ''

    const res = await onAnswer(exercise.id, answer)
    setResult(res)
    if (res.correct) { setDuoEmotion('cheer'); setTimeout(() => setDuoEmotion('happy'), 700) }
    else {
      setDuoEmotion('sad'); setMistakes(m => m + 1); setHearts(res.hearts)
      if (mode === 'practice') return // practice never ends on hearts
      if (res.hearts <= 0) setTimeout(() => setOutOfHearts(true), 1200)
    }
  }

  async function handleExplain() {
    if (!result || result.correct) return
    setExplaining(true)
    try {
      const userAnswer = Array.isArray(wbAnswer.placed) && exercise.type === 'translate_wordbank'
        ? wbAnswer.placed.map((p: any) => p.word).join(' ')
        : (selected || typed || JSON.stringify(matches))
      const correctAnswer = Array.isArray(result.correctAnswer)
        ? result.correctAnswer.map((p: any) => `${p.left} → ${p.right}`).join(', ')
        : String(result.correctAnswer)
      const text = await onExplain({
        prompt: exercise.prompt || exercise.sentence || 'Match the pairs',
        userAnswer: String(userAnswer),
        correctAnswer,
        exerciseType: exercise.type,
      })
      setExplanation(text)
    } catch (e: any) {
      setExplanation('Duo Max is having trouble right now. Try again later!')
    } finally {
      setExplaining(false)
    }
  }

  function handleContinue() {
    if (index + 1 >= total) {
      const baseXp = mode === 'legendary' ? 40 : (mode === 'practice' ? 5 : 15)
      const xpEarned = Math.max(5, baseXp - mistakes * 2)
      onComplete({ xpEarned, mistakes, timeSec: Math.round((Date.now() - startedAt) / 1000), mode })
    } else {
      setIndex(i => i + 1)
    }
  }

  const progress = ((index + (result?.correct ? 1 : 0)) / total) * 100

  return (
    <div className="fixed inset-0 z-50 surface flex flex-col">
      <div className="flex items-center gap-4 px-4 md:px-8 py-4">
        <button onClick={onQuit} className="ink-3 hover:ink"><X className="w-7 h-7" strokeWidth={3} /></button>
        <div className="flex-1 h-4 bg-outline rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: mode === 'legendary' ? 'linear-gradient(180deg,#ce82ff,#a560e8)' : 'linear-gradient(180deg,#61e002 0%,#58cc02 100%)' }}>
            <div className="h-1/3 bg-white/40 rounded-full mx-1" />
          </div>
        </div>
        {mode === 'legendary' && (
          <div className={cn('font-black text-lg px-2 py-1 rounded', timeLeft <= 10 ? 'bg-duo-red text-white animate-pulse' : 'text-duo-purple')}>{timeLeft}s</div>
        )}
        {mode !== 'practice' && (
          <div className="flex items-center gap-1">
            <Heart className="w-6 h-6 fill-duo-red text-duo-red" />
            <span className="font-black text-lg text-duo-red">{hearts}</span>
          </div>
        )}
        {mode === 'practice' && <div className="text-xs font-black uppercase text-duo-green px-2 py-1 rounded bg-duo-green/10">Practice</div>}
        {mode === 'legendary' && <div className="text-xs font-black uppercase text-duo-purple px-2 py-1 rounded bg-duo-purple/10">Legendary</div>}
      </div>

      {/* Mascot */}
      <div className="hidden md:block fixed bottom-24 right-8 z-40">
        <DuoOwl size={100} emotion={duoEmotion} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 md:p-8 pb-40">
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {exercise.type === 'multiple_choice' && <MultipleChoice exercise={exercise} selected={selected} setSelected={setSelected} disabled={!!result} />}
              {exercise.type === 'translate_wordbank' && <TranslateWordBank exercise={exercise} answer={wbAnswer} setAnswer={setWbAnswer} disabled={!!result} />}
              {exercise.type === 'fill_blank' && <FillBlank exercise={exercise} selected={selected} setSelected={setSelected} disabled={!!result} />}
              {exercise.type === 'type_answer' && <TypeAnswer exercise={exercise} answer={typed} setAnswer={setTyped} disabled={!!result} />}
              {exercise.type === 'match_pairs' && <MatchPairs exercise={exercise} matches={matches} setMatches={setMatches} disabled={!!result} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {!result && (
        <div className="border-t-2 border-outline p-4 md:p-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <button onClick={onQuit} className="duo-btn duo-btn-white px-6 py-3 text-sm">Skip</button>
            <button onClick={() => handleCheck()} disabled={!canCheck} className={cn('duo-btn px-8 py-3', canCheck ? 'duo-btn-green' : 'duo-btn-white')}>Check</button>
          </div>
        </div>
      )}
      <FeedbackBar result={result} exercise={exercise} onContinue={handleContinue} onExplain={handleExplain} explaining={explaining} explanation={explanation} mode={mode} />

      <AnimatePresence>
        {outOfHearts && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="surface rounded-3xl max-w-md w-full p-6 text-center border-2 border-outline">
              <div className="text-7xl mb-4">💔</div>
              <div className="text-2xl font-black text-duo-red mb-2">You ran out of hearts!</div>
              <div className="ink-3 font-bold mb-6">Practice to earn a heart, or refill with gems.</div>
              <button onClick={onQuit} className="duo-btn duo-btn-white w-full py-3 mb-2">Exit lesson</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
