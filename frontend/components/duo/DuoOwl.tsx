'use client'
import { motion } from 'framer-motion'

type Emotion = 'happy' | 'sad' | 'cheer' | 'idle' | 'thinking' | 'sleep'

export default function DuoOwl({ emotion = 'idle', size = 96 }: { emotion?: Emotion; size?: number }) {
  // Simple, expressive owl built from SVG shapes so it renders instantly with no external assets.
  const eyeShape = (() => {
    switch (emotion) {
      case 'happy': return <path d="M -6 0 Q 0 8 6 0" fill="none" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" />
      case 'cheer': return <circle r="3.5" fill="#3c3c3c" />
      case 'sad': return <path d="M -5 2 Q 0 -3 5 2" fill="none" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" />
      case 'thinking': return <ellipse rx="3.5" ry="4" fill="#3c3c3c" />
      case 'sleep': return <path d="M -6 0 L 6 0" stroke="#3c3c3c" strokeWidth="3" strokeLinecap="round" />
      default: return <circle r="4" fill="#3c3c3c" />
    }
  })()

  const mouth = (() => {
    switch (emotion) {
      case 'happy':
      case 'cheer': return <path d="M 42 68 Q 50 78 58 68" stroke="#ff9600" strokeWidth="3" fill="#ff9600" />
      case 'sad': return <path d="M 42 74 Q 50 66 58 74" stroke="#ff9600" strokeWidth="3" fill="none" />
      case 'thinking': return <ellipse cx="50" cy="70" rx="3" ry="2" fill="#ff9600" />
      default: return <path d="M 44 70 Q 50 74 56 70" stroke="#ff9600" strokeWidth="3" fill="#ff9600" />
    }
  })()

  const wiggle = emotion === 'cheer' ? { rotate: [-6, 6, -6, 6, 0] } : { rotate: 0 }

  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 100 100"
      animate={wiggle}
      transition={{ duration: emotion === 'cheer' ? 0.6 : 0.3, repeat: emotion === 'cheer' ? 1 : 0 }}
    >
      {/* Body */}
      <ellipse cx="50" cy="58" rx="36" ry="38" fill="#58cc02" />
      <ellipse cx="50" cy="62" rx="26" ry="28" fill="#89e219" />
      {/* Ears */}
      <path d="M 20 30 L 26 12 L 34 26 Z" fill="#58cc02" />
      <path d="M 80 30 L 74 12 L 66 26 Z" fill="#58cc02" />
      {/* Eye whites */}
      <ellipse cx="36" cy="46" rx="12" ry="14" fill="white" />
      <ellipse cx="64" cy="46" rx="12" ry="14" fill="white" />
      {/* Pupils / eye expression */}
      <g transform="translate(36 47)">{eyeShape}</g>
      <g transform="translate(64 47)">{eyeShape}</g>
      {/* Beak */}
      <path d="M 46 60 L 54 60 L 50 68 Z" fill="#ff9600" />
      {mouth}
      {/* Tummy patch */}
      <ellipse cx="50" cy="78" rx="12" ry="6" fill="#d7ffb8" opacity="0.5" />
    </motion.svg>
  )
}
