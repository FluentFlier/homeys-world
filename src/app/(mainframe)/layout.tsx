import type { Metadata } from 'next'
import '@/styles/mainframe.css'

export const metadata: Metadata = {
  title: {
    default: 'Mainframe — Summer 2026',
    template: '%s | Mainframe',
  },
  description: 'A community of builders in San Francisco. Live together. Build together. Launch together.',
}

export default function MainframeLayout({ children }: { children: React.ReactNode }) {
  return <div className="mainframe-root noise scanline min-h-screen">{children}</div>
}
