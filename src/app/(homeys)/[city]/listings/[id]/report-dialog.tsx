'use client'

import { useState } from 'react'
import { Flag, X, CheckCircle, Loader2 } from 'lucide-react'
import { insforge } from '@/lib/insforge'

const REASONS = [
  { value: 'spam', label: 'Spam or duplicate' },
  { value: 'scam', label: 'Suspected scam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'other', label: 'Other' },
] as const

interface ReportDialogProps {
  listingId: string
}

export function ReportDialog({ listingId }: ReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason) return

    setSubmitting(true)
    setError(null)

    const { error: err } = await insforge.database.from('listing_reports').insert([{
      listing_id: listingId,
      reason,
      reporter_email: email || null,
    }])

    setSubmitting(false)

    if (err) {
      setError('Something went wrong. Please try again.')
      return
    }

    setSubmitted(true)
    setTimeout(() => {
      setOpen(false)
      setSubmitted(false)
      setReason('')
      setEmail('')
    }, 2000)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-body text-muted-foreground hover:text-destructive transition-colors"
      >
        <Flag className="w-3 h-3" />
        Report this listing
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
            onClick={() => !submitting && setOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-background border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-destructive" />
                <h2 id="report-dialog-title" className="font-heading text-base font-semibold text-foreground">
                  Report Listing
                </h2>
              </div>
              <button
                onClick={() => !submitting && setOpen(false)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
              >
                <X className="w-3.5 h-3.5 text-foreground/60" />
              </button>
            </div>

            {submitted ? (
              <div className="px-6 py-10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <CheckCircle className="w-6 h-6 text-primary" />
                </div>
                <p className="font-heading text-base font-semibold text-foreground">
                  Report submitted
                </p>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Thanks for helping keep Homeys World safe.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                    Reason
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="w-full rounded-full bg-white/50 border border-border px-4 py-2 text-sm font-body text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                  >
                    <option value="">Select a reason...</option>
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1.5">
                    Your email <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="In case we need to follow up"
                    className="w-full rounded-full bg-white/50 border border-border px-4 py-2 text-sm font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {error && (
                  <p className="text-xs font-body text-destructive">{error}</p>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 rounded-full text-sm font-body text-foreground/70 hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !reason}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-destructive text-white text-sm font-body font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Report'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
