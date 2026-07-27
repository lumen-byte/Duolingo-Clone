'use client'
import { Gem } from 'lucide-react'
import type { User } from '@/lib/types'

export default function Shop({ user, onRefill }: { user: User; onRefill: (m: string) => void }) {
  return (
    <div className="max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-3xl font-black ink">Shop</div>
          <div className="ink-3 font-bold">Spend your gems on power-ups</div>
        </div>
        <div className="flex items-center gap-2 bg-duo-blue/10 px-4 py-2 rounded-2xl">
          <Gem className="w-6 h-6 fill-duo-blue text-duo-blue-dark" />
          <span className="font-black text-lg text-duo-blue">{user.gems}</span>
        </div>
      </div>

      <div className="text-lg font-black uppercase ink-3 mb-2">Hearts</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <ShopCard emoji="♾️" title="Unlimited Hearts" desc="Never run out! Super Duolingo" price="Coming soon" locked />
        <ShopCard emoji="❤️" title="Refill Hearts" desc="Get 5 hearts back" price="350" onBuy={() => onRefill('gems')} disabled={user.hearts >= user.maxHearts || user.gems < 350} />
      </div>

      <div className="text-lg font-black uppercase ink-3 mb-2">Power-ups</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ShopCard emoji="⚡" title="Double XP for 15 min" desc="Boost your XP" price="200" locked />
        <ShopCard emoji="🔥" title="Streak Freeze" desc="Protects your streak for one day" price="200" locked />
        <ShopCard emoji="✨" title="Timed Practice" desc="Included in Legendary mode!" price="Free" locked />
        <ShopCard emoji="👕" title="Duo outfits" desc="Coming soon" price="250" locked />
      </div>
    </div>
  )
}

function ShopCard({ emoji, title, desc, price, onBuy, disabled, locked }: any) {
  return (
    <div className="border-2 border-outline rounded-2xl overflow-hidden">
      <div className="p-5 flex items-center gap-4">
        <div className="text-5xl">{emoji}</div>
        <div className="flex-1">
          <div className="font-black ink">{title}</div>
          <div className="text-sm ink-3 font-bold">{desc}</div>
        </div>
      </div>
      <div className="px-5 pb-4">
        <button disabled={disabled || locked} onClick={onBuy}
          className={`w-full duo-btn py-2 text-sm ${locked ? 'duo-btn-white' : disabled ? 'duo-btn-white' : 'duo-btn-green'}`}>
          {locked ? 'Locked' : (<span className="flex items-center justify-center gap-1"><span>💎</span> <span>{price}</span></span>)}
        </button>
      </div>
    </div>
  )
}
