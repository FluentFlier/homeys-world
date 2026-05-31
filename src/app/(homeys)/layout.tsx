import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'

export default function HomeysLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
