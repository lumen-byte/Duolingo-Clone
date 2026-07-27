import './globals.css'
import { Providers } from './providers'
import { Nunito } from 'next/font/google'
import type { Metadata } from 'next'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400','500','600','700','800','900'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Duolingo — Learn Spanish for free',
  description: 'The free, fun, and effective way to learn a language!',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={nunito.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:'window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);'}} />
      </head>
      <body className={nunito.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
