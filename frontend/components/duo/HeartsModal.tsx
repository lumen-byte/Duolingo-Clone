'use client'
import { Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { User } from '@/lib/types'

export default function HeartsModal({ open, user, onClose, onRefill }: {
  open: boolean; user: User | null; onClose: () => void; onRefill: (m: string) => void;
}) {
  if (!open || !user) return null
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
        <motion.div initial={{ scale: 0.9, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="surface rounded-3xl max-w-md w-full overflow-hidden border-2 border-outline">
          <div className="bg-duo-red/10 dark:bg-duo-red/20 p-6 text-center">
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: user.maxHearts }).map((_, i) => (
                <Heart key={i} className={i < user.hearts ? 'w-9 h-9 fill-duo-red text-duo-red' : 'w-9 h-9 text-duo-gray fill-duo-gray'} />
              ))}
            </div>
            <div className="text-2xl font-black text-duo-red">You have {user.hearts} hearts</div>
            <div className="text-duo-red-dark dark:text-duo-red font-bold text-sm mt-1">Get more to keep learning</div>
          </div>
          <div className="p-5 space-y-3">
            <button disabled={user.hearts >= user.maxHearts || user.gems < 350} onClick={() => onRefill('gems')}
              className="w-full flex items-center justify-between p-4 border-2 border-outline rounded-2xl hover:surface-2 transition disabled:opacity-50 disabled:cursor-not-allowed">
              <div className="flex items-center gap-3">
                <div className="text-3xl">❤️</div>
                <div className="text-left">
                  <div className="font-black ink">Refill hearts</div>
                  <div className="text-sm ink-3">Get all 5 hearts back</div>
                </div>
              </div>
              <div className="flex items-center gap-1 font-black text-duo-blue">
                <span>💎</span><span>350</span>
              </div>
            </button>
            <div className="w-full flex items-center justify-between p-4 border-2 border-outline rounded-2xl opacity-70">
              <div className="flex items-center gap-3">
                <div className="text-3xl">💪</div>
                <div className="text-left">
                  <div className="font-black ink">Practice a skill</div>
                  <div className="text-sm ink-3">Complete a practice for +1 heart</div>
                </div>
              </div>
              <div className="font-bold ink-3 text-xs uppercase">Go to learn tab</div>
            </div>
            <div className="w-full flex items-center justify-between p-4 border-2 border-outline rounded-2xl opacity-60">
              <div className="flex items-center gap-3">
                <div className="text-3xl">♾️</div>
                <div className="text-left">
                  <div className="font-black ink">Unlimited hearts</div>
                  <div className="text-sm ink-3">Super Duolingo</div>
                </div>
              </div>
              <div className="font-bold ink-3 text-sm">Coming soon</div>
            </div>
          </div>
          <div className="p-4 border-t-2 border-outline">
            <button onClick={onClose} className="w-full duo-btn duo-btn-white py-3">No thanks</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
