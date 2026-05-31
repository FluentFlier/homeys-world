import type { Metadata } from 'next'
import { Fraunces, Nunito } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['SOFT', 'opsz'] })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })

export const metadata: Metadata = {
  title: {
    default: 'Mainframe — A community of builders in San Francisco',
    template: '%s | Mainframe',
  },
  description:
    'A community of builders in San Francisco. Live together. Build together. Launch together. Now partnering with Accelr8 for Summer 2026 housing.',
  openGraph: {
    title: 'Mainframe — A community of builders in San Francisco',
    description: 'Live together. Build together. Launch together. Summer 2026, San Francisco.',
    type: 'website',
    siteName: 'Mainframe',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  )
}
