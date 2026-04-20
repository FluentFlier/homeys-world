import type { Metadata } from 'next'
import { Fraunces, Nunito } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['SOFT', 'opsz'] })
const nunito = Nunito({ subsets: ['latin'], variable: '--font-nunito' })

export const metadata: Metadata = {
  title: {
    default: 'Homeys World — Find your next place',
    template: '%s | Homeys World',
  },
  description:
    'A free housing board for finding roommates, rooms, apartments, and crash pads in cities around the world. No fees, no middleman.',
  openGraph: {
    title: 'Homeys World — Find your next place. Find your people.',
    description:
      'Browse listings, find roommates, or crash somewhere new. A free, open-source housing board for cities around the world.',
    type: 'website',
    siteName: 'Homeys World',
    url: 'https://homeys.world',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Homeys World — Find your next place',
    description:
      'Browse listings, find roommates, or crash somewhere new. Free housing board for cities around the world.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${nunito.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <div className="bg-red-600 text-white text-[10px] py-1 text-center font-bold">
          VERSION 2.0 - NEW FEATURES ENABLED
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hash === '#cities') {
                window.location.href = '/cities';
              }
            `,
          }}
        />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
