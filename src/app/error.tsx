'use client'

import { useEffect } from 'react'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-3">
          Something went wrong
        </h1>
        <p className="font-body text-muted-foreground mb-8">
          An unexpected error occurred. We have been notified and are looking into it.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground font-body font-semibold px-6 py-2.5 rounded-full transition-all hover:bg-primary/90"
          >
            <RotateCcw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-secondary text-secondary-foreground font-body font-semibold px-6 py-2.5 rounded-full transition-all hover:bg-secondary/90"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
