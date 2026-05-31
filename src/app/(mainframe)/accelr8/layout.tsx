import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirm your Accelr8 housing',
  robots: { index: false, follow: false },
}

export default function Accelr8Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
