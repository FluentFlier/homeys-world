'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Mail,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Home,
} from 'lucide-react'
import { insforge } from '@/lib/insforge'
import { Blob } from '@/components/blob'

type Mode = 'sign-in' | 'sign-up' | 'verify-email' | 'forgot-password' | 'reset-code'

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/'

  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  // Check if already logged in
  useEffect(() => {
    insforge.auth.getCurrentUser().then(({ data }) => {
      if (data?.user) router.replace(next)
    })
  }, [next, router])

  // Handle InsForge OAuth callback params
  useEffect(() => {
    const insforgeStatus = searchParams.get('insforge_status')
    const insforgeType = searchParams.get('insforge_type')
    const insforgeError = searchParams.get('insforge_error')

    if (insforgeStatus === 'success' && insforgeType === 'verify_email') {
      setMessage('Email verified! Please sign in.')
      setStatus('success')
      setMode('sign-in')
    } else if (insforgeStatus === 'error') {
      setMessage(insforgeError ?? 'Something went wrong.')
      setStatus('error')
    }
  }, [searchParams])

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { data, error } = await insforge.auth.signInWithPassword({ email, password })

    if (error) {
      setStatus('error')
      setMessage(error.message ?? 'Invalid email or password.')
      return
    }

    if (data?.user) {
      router.replace(next)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name: name || undefined,
      redirectTo: `${window.location.origin}/sign-in`,
    })

    if (error) {
      setStatus('error')
      setMessage(error.message ?? 'Could not create account.')
      return
    }

    if (data?.requireEmailVerification) {
      setMode('verify-email')
      setStatus('idle')
      setMessage('')
    } else if (data?.accessToken) {
      router.replace(next)
    }
  }

  async function handleVerifyEmail(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { data, error } = await insforge.auth.verifyEmail({ email, otp })

    if (error) {
      setStatus('error')
      setMessage(error.message ?? 'Invalid code. Please try again.')
      return
    }

    if (data?.accessToken) {
      router.replace(next)
    }
  }

  async function handleResendCode() {
    setStatus('loading')
    const { error } = await insforge.auth.resendVerificationEmail({
      email,
      redirectTo: `${window.location.origin}/sign-in`,
    })
    if (error) {
      setStatus('error')
      setMessage(error.message ?? 'Could not resend code.')
    } else {
      setStatus('success')
      setMessage('Verification code resent! Check your inbox.')
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { error } = await insforge.auth.sendResetPasswordEmail({
      email,
      redirectTo: `${window.location.origin}/sign-in`,
    })

    if (error) {
      setStatus('error')
      setMessage(error.message ?? 'Could not send reset email.')
      return
    }

    setMode('reset-code')
    setStatus('idle')
  }

  async function handleResetCode(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { data, error } = await insforge.auth.exchangeResetPasswordToken({ email, code: otp })

    if (error) {
      setStatus('error')
      setMessage(error.message ?? 'Invalid code.')
      return
    }

    if (data?.token) {
      const { error: resetError } = await insforge.auth.resetPassword({
        newPassword: password,
        otp: data.token,
      })

      if (resetError) {
        setStatus('error')
        setMessage(resetError.message ?? 'Could not reset password.')
        return
      }

      setStatus('success')
      setMessage('Password reset! Please sign in with your new password.')
      setMode('sign-in')
      setPassword('')
      setOtp('')
    }
  }

  async function handleOAuth(provider: 'google' | 'github') {
    await insforge.auth.signInWithOAuth({
      provider,
      redirectTo: `${window.location.origin}${next}`,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-12">
      <Blob className="w-[500px] h-[500px] -top-40 -left-40 opacity-40" color="primary" />
      <Blob className="w-[400px] h-[400px] bottom-0 right-0 opacity-30" color="secondary" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Home className="w-5 h-5 text-primary" />
          <span className="font-heading text-xl font-semibold text-foreground">homeys.world</span>
        </Link>

        <div className="bg-white/80 backdrop-blur-sm border border-border rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="font-heading text-2xl font-bold text-foreground">
              {mode === 'sign-in' && 'Welcome back'}
              {mode === 'sign-up' && 'Create an account'}
              {mode === 'verify-email' && 'Verify your email'}
              {mode === 'forgot-password' && 'Reset password'}
              {mode === 'reset-code' && 'Enter reset code'}
            </h1>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {mode === 'sign-in' && 'Sign in to post listings and manage your places.'}
              {mode === 'sign-up' && 'Join Homeys World to start posting.'}
              {mode === 'verify-email' && `We sent a 6-digit code to ${email}`}
              {mode === 'forgot-password' && 'Enter your email to receive a reset code.'}
              {mode === 'reset-code' && `Enter the code sent to ${email} and your new password.`}
            </p>
          </div>

          {/* Status messages */}
          {status === 'success' && message && (
            <div className="flex items-start gap-2 font-body text-sm text-primary bg-primary/10 rounded-xl px-4 py-3 mb-4">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}
          {status === 'error' && message && (
            <div className="flex items-start gap-2 font-body text-sm text-destructive bg-destructive/5 rounded-xl px-4 py-3 mb-4">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* OAuth buttons */}
          {(mode === 'sign-in' || mode === 'sign-up') && (
            <>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button
                  onClick={() => handleOAuth('google')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-border bg-white hover:bg-muted/50 font-body text-sm text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleOAuth('github')}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-border bg-white hover:bg-muted/50 font-body text-sm text-foreground transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-border" />
                <span className="font-body text-xs text-muted-foreground">or continue with email</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {/* Sign In Form */}
          {mode === 'sign-in' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Your password"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgot-password'); setStatus('idle'); setMessage('') }}
                  className="font-body text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-6 py-3 transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center font-body text-sm text-muted-foreground">
                No account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('sign-up'); setStatus('idle'); setMessage('') }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'sign-up' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-6 py-3 transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center font-body text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('sign-in'); setStatus('idle'); setMessage('') }}
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {/* Verify Email Form */}
          {mode === 'verify-email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">Verification code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="123456"
                  maxLength={6}
                  className="w-full font-body text-lg tracking-[0.3em] text-center bg-white/50 border border-border rounded-full px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || otp.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-6 py-3 transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  'Verify email'
                )}
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={status === 'loading'}
                className="w-full text-center font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Resend code
              </button>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                    className="w-full font-body text-sm bg-white/50 border border-border rounded-full pl-10 pr-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-6 py-3 transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  'Send reset code'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('sign-in'); setStatus('idle'); setMessage('') }}
                className="w-full text-center font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to sign in
              </button>
            </form>
          )}

          {/* Reset Code Form */}
          {mode === 'reset-code' && (
            <form onSubmit={handleResetCode} className="space-y-4">
              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">Reset code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  placeholder="123456"
                  maxLength={6}
                  className="w-full font-body text-lg tracking-[0.3em] text-center bg-white/50 border border-border rounded-full px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>

              <div>
                <label className="block font-body text-xs font-medium text-foreground mb-1.5">New password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full font-body text-sm bg-white/50 border border-border rounded-full px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading' || otp.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 font-body text-sm font-semibold bg-primary text-primary-foreground rounded-full px-6 py-3 transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {status === 'loading' ? (
                  <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  'Reset password'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('sign-in'); setStatus('idle'); setMessage('') }}
                className="w-full text-center font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
