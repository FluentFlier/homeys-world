'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MessageSquare, 
  Search, 
  Inbox, 
  Loader2,
  Clock,
  User
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import { Blob } from '@/components/blob'

export default function MessagesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    async function checkAuth() {
      const { data } = await insforge.auth.getCurrentUser()
      if (!data?.user) {
        router.push('/sign-in?next=/messages')
        return
      }
      setLoading(false)
      // In a real app, we would fetch conversations here
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pb-20">
      <Blob className="w-[500px] h-[500px] -top-40 -left-40" color="primary" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-32">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Messages</h1>
            <p className="font-body text-sm text-muted-foreground">Your conversations on Homeys World</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[600px]">
          {/* Conversation List */}
          <div className="lg:col-span-1 bg-white/60 backdrop-blur-sm border border-border rounded-[2.5rem] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search messages..."
                  className="w-full bg-muted/50 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Inbox className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-heading text-sm font-bold">No messages yet</p>
              <p className="font-body text-xs text-muted-foreground mt-1 px-4">When you contact a listing or someone messages you, it will appear here.</p>
            </div>
          </div>

          {/* Chat Window */}
          <div className="hidden lg:flex lg:col-span-2 bg-white/40 backdrop-blur-sm border border-border rounded-[2.5rem] items-center justify-center text-center">
            <div>
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-10 h-10 text-primary/20" />
              </div>
              <h2 className="font-heading text-xl font-bold text-foreground/40">Select a conversation</h2>
              <p className="font-body text-sm text-muted-foreground max-w-xs mx-auto mt-2">Pick someone from the left to start chatting.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
