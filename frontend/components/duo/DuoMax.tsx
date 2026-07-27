'use client'
import { useEffect, useRef, useState } from 'react'
import { X, Send, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import DuoOwl from './DuoOwl'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function DuoMax({ open, onClose, sessionId, onSend }: {
  open: boolean; onClose: () => void; sessionId: string;
  onSend: (message: string) => Promise<string>;
}) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Hola! 👋 I\'m Duo Max, your Spanish tutor. Ask me anything about Spanish grammar, or say a sentence and I\'ll help you improve. ✨' }])
    }
  }, [open])

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [messages])

  async function send(overrideText?: string) {
    const text = (overrideText ?? input).trim()
    if (!text || busy) return
    setMessages(m => [...m, { role: 'user', content: text }])
    setInput(''); setBusy(true)
    try {
      const reply = await onSend(text)
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } catch (e: any) {
      setMessages(m => [...m, { role: 'assistant', content: 'Oops, I had trouble. Try again in a moment.' }])
    } finally { setBusy(false) }
  }

  const suggestions = [
    'Explain "ser" vs "estar"',
    'How do I say "I am learning Spanish"?',
    'Give me 3 common Spanish greetings',
  ]

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
          <motion.div initial={{ y: 40 }} animate={{ y: 0 }} exit={{ y: 40 }} onClick={e => e.stopPropagation()}
            className="surface rounded-t-3xl md:rounded-3xl w-full max-w-2xl h-[80vh] md:h-[70vh] flex flex-col overflow-hidden border-2 border-outline">
            {/* Header */}
            <div className="px-5 py-4 border-b-2 border-outline flex items-center gap-3 bg-gradient-to-r from-duo-purple to-duo-blue text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-black text-lg">Duo Max</div>
                <div className="text-xs opacity-90 font-bold">AI Spanish tutor • Powered by Gemini</div>
              </div>
              <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl"><X className="w-6 h-6" /></button>
            </div>
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 surface-2">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'items-start gap-2'}`}>
                  {m.role === 'assistant' && <div className="flex-shrink-0"><DuoOwl size={40} emotion="happy" /></div>}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 font-bold whitespace-pre-wrap ${m.role === 'user' ? 'bg-duo-blue text-white' : 'surface border-2 border-outline ink'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {busy && (
                <div className="flex items-start gap-2">
                  <DuoOwl size={40} emotion="thinking" />
                  <div className="surface border-2 border-outline rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-duo-gray animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-duo-gray animate-bounce" style={{ animationDelay: '.15s' }} />
                      <span className="w-2 h-2 rounded-full bg-duo-gray animate-bounce" style={{ animationDelay: '.3s' }} />
                    </div>
                  </div>
                </div>
              )}
              {messages.length <= 1 && !busy && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {suggestions.map(s => (
                    <button key={s} onClick={() => send(s)}
                      className="text-xs font-bold px-3 py-2 rounded-xl border-2 border-duo-purple text-duo-purple hover:bg-duo-purple/10">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Input */}
            <div className="p-4 border-t-2 border-outline surface">
              <div className="flex gap-2">
                <input value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') send() }}
                  placeholder="Ask Duo Max anything about Spanish…" disabled={busy}
                  className="flex-1 border-2 border-outline surface ink rounded-2xl px-4 py-3 font-bold focus:outline-none focus:border-duo-purple" />
                <button onClick={send} disabled={busy || !input.trim()}
                  className="duo-btn duo-btn-purple px-5"><Send className="w-5 h-5" /></button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
