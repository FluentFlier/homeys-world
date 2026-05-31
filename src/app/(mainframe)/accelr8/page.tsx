'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { confirmAccelr8Housing, lookupApplicant } from '@/lib/accelr8'

const INPUT_CLASS =
  'w-full bg-slab border border-wire/60 rounded-lg px-4 py-3.5 text-chalk text-sm placeholder:text-fog/40 focus:outline-none focus:border-lime/40 transition-all duration-300'
const LABEL_CLASS =
  'block font-mono text-[11px] tracking-[0.15em] uppercase text-fog mb-2.5'

type HouseName = 'Hacker Hotel' | 'Epik Startup Residency'

interface HouseOption {
  name: HouseName
  address: string
  rooms: string[]
  notes: string
}

const HOUSES: HouseOption[] = [
  {
    name: 'Hacker Hotel',
    address: '1412 Market St',
    rooms: ['Standard Twin · $1,700/mo', 'Queen · $2,200/mo', 'Corner Suite · $3,200/mo'],
    notes: '2-month minimum · 3 months saves $200/mo · Deposit $995–$1,195',
  },
  {
    name: 'Epik Startup Residency',
    address: '706 Polk St',
    rooms: ['Queen w/ private bath · $2,000/mo (2mo) / $1,800/mo (3mo)'],
    notes: 'Deposit $1,000 (or waive for $200) · Includes breakfast, coffee, cleaning',
  },
]

const ROOM_OPTIONS: Record<HouseName, string[]> = {
  'Hacker Hotel': [
    'Standard Twin — $1,700/mo',
    'Queen — $2,200/mo',
    'Corner Suite — $3,200/mo',
  ],
  'Epik Startup Residency': ['Queen w/ private bath — $2,000/mo (2mo) / $1,800/mo (3mo)'],
}

const MOVE_IN_OPTIONS = [
  'ASAP',
  'Early June 2026',
  'Mid June 2026',
  'July 2026',
  'August 2026',
  'Flexible',
]

const LENGTH_OPTIONS = ['1 month', '2 months', '3 months', '3+ months']

export default function Accelr8Page() {
  const [step, setStep] = useState<1 | 2>(1)
  const [done, setDone] = useState(false)

  // Step 1 state
  const [email, setEmail] = useState('')
  const [confirmedEmail, setConfirmedEmail] = useState('')
  const [firstName, setFirstName] = useState<string | null>(null)
  const [lookupError, setLookupError] = useState<'not_found' | 'generic' | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Step 2 state
  const [housePreference, setHousePreference] = useState<HouseName | ''>('')
  const [roomType, setRoomType] = useState('')
  const [moveInTiming, setMoveInTiming] = useState('')
  const [lengthOfStay, setLengthOfStay] = useState('')
  const [phone, setPhone] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState(false)

  // Shared
  const [loading, setLoading] = useState(false)

  async function runLookup(emailValue: string) {
    setLookupError(null)
    setLoading(true)
    try {
      const name = await lookupApplicant(emailValue)
      if (name !== null) {
        setConfirmedEmail(emailValue.trim())
        setFirstName(name)
        setStep(2)
      } else {
        setLookupError('not_found')
      }
    } catch {
      setLookupError('generic')
    } finally {
      setLoading(false)
    }
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault()
    await runLookup(email)
  }

  // Unified funnel: if arriving from the application with ?email=, auto-verify and skip step 1.
  useEffect(() => {
    const prefill = new URLSearchParams(window.location.search).get('email')
    if (prefill) {
      setEmail(prefill)
      void runLookup(prefill).finally(() => setInitializing(false))
    } else {
      setInitializing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSelectHouse(name: HouseName) {
    setHousePreference(name)
    setRoomType('') // reset dependent room type when house changes
  }

  async function handleCommit(commitment: 'confirmed' | 'needs_info') {
    setFormError(null)
    setSubmitError(false)

    if (!housePreference || !roomType || !moveInTiming || !lengthOfStay || !phone.trim()) {
      setFormError('Please complete all fields before continuing.')
      return
    }

    setLoading(true)
    try {
      await confirmAccelr8Housing({
        email: confirmedEmail,
        house_preference: housePreference,
        room_type: roomType,
        move_in_timing: moveInTiming,
        length_of_stay: lengthOfStay,
        phone,
        commitment_status: commitment,
      })
      setDone(true)
    } catch {
      setSubmitError(true)
    } finally {
      setLoading(false)
    }
  }

  // --- Initializing (auto-prefill from ?email=) ---
  if (initializing) {
    return (
      <main className="max-w-lg mx-auto px-6 py-20 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-lime" />
      </main>
    )
  }

  // --- Success state ---
  if (done) {
    return (
      <main className="max-w-lg mx-auto px-6 py-20">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-lime/40 bg-lime/10">
            <Check className="h-8 w-8 text-lime" strokeWidth={2.5} />
          </div>
          <h1 className="mt-8 font-display text-3xl text-chalk">
            You&apos;re confirmed. We&apos;ll reach out within 24 hours.
          </h1>
        </div>
      </main>
    )
  }

  // --- Step 1: email lookup ---
  if (step === 1) {
    return (
      <main className="max-w-lg mx-auto px-6 py-20">
        <p className={LABEL_CLASS}>Accelr8 Housing</p>
        <h1 className="font-display text-4xl text-chalk leading-tight">
          Confirm your housing
        </h1>
        <p className="mt-3 text-sm text-fog">
          Enter the email you applied with to continue.
        </p>

        <form onSubmit={handleLookup} className="mt-10 space-y-5">
          <div>
            <label htmlFor="email" className={LABEL_CLASS}>
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={INPUT_CLASS}
            />
          </div>

          {lookupError === 'not_found' && (
            <p className="text-sm text-chalk/80">
              We couldn&apos;t find an application with that email.{' '}
              <a href="/" className="text-lime underline underline-offset-2">
                Apply here
              </a>
            </p>
          )}
          {lookupError === 'generic' && (
            <p className="text-sm text-chalk/80">Something went wrong. Please try again.</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-lime px-4 py-3.5 font-mono text-[12px] tracking-[0.15em] uppercase text-void transition-all duration-300 hover:bg-lime/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      </main>
    )
  }

  // --- Step 2: housing confirmation ---
  return (
    <main className="max-w-lg mx-auto px-6 py-20">
      <p className={LABEL_CLASS}>Accelr8 Housing</p>
      <h1 className="font-display text-4xl text-chalk leading-tight">
        Pick your place
      </h1>
      {firstName && (
        <p className="mt-3 text-sm text-fog">
          Welcome back, <span className="text-chalk">{firstName}</span> — pick your house and lock it in.
        </p>
      )}

      <div className="mt-10 space-y-8">
        {/* 1. House preference cards */}
        <div>
          <label className={LABEL_CLASS}>House preference</label>
          <div className="grid gap-4">
            {HOUSES.map((house) => {
              const selected = housePreference === house.name
              return (
                <button
                  key={house.name}
                  type="button"
                  onClick={() => handleSelectHouse(house.name)}
                  className={`rounded-lg border bg-slab p-5 text-left transition-all duration-300 ${
                    selected
                      ? 'border-lime ring-1 ring-lime'
                      : 'border-wire/60 hover:border-wire'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-display text-xl text-chalk">{house.name}</span>
                    <span className="font-mono text-[11px] tracking-[0.1em] uppercase text-fog">
                      {house.address}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1">
                    {house.rooms.map((room) => (
                      <li key={room} className="text-sm text-bone/90">
                        {room}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-[12px] leading-relaxed text-fog">{house.notes}</p>
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-[12px] text-fog">
            Both include Frontier Tower membership + Accelr8 Founder Lounge.
          </p>
        </div>

        {/* 2. Room type (depends on house) */}
        <div>
          <label htmlFor="roomType" className={LABEL_CLASS}>
            Room type
          </label>
          <select
            id="roomType"
            value={roomType}
            disabled={!housePreference}
            onChange={(e) => setRoomType(e.target.value)}
            className={`${INPUT_CLASS} appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <option value="">
              {housePreference ? 'Select a room type' : 'Choose a house first'}
            </option>
            {housePreference &&
              ROOM_OPTIONS[housePreference].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
          </select>
        </div>

        {/* 3. Move-in timing */}
        <div>
          <label htmlFor="moveIn" className={LABEL_CLASS}>
            Move-in timing
          </label>
          <select
            id="moveIn"
            value={moveInTiming}
            onChange={(e) => setMoveInTiming(e.target.value)}
            className={`${INPUT_CLASS} appearance-none`}
          >
            <option value="">Select timing</option>
            {MOVE_IN_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Length of stay */}
        <div>
          <label className={LABEL_CLASS}>Length of stay</label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LENGTH_OPTIONS.map((opt) => {
              const selected = lengthOfStay === opt
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setLengthOfStay(opt)}
                  className={`rounded-lg border px-3 py-3 text-sm transition-all duration-300 ${
                    selected
                      ? 'border-lime bg-lime/10 text-chalk ring-1 ring-lime'
                      : 'border-wire/60 bg-slab text-bone/90 hover:border-wire'
                  }`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* 5. Phone */}
        <div>
          <label htmlFor="phone" className={LABEL_CLASS}>
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(415) 555-0123"
            className={INPUT_CLASS}
          />
        </div>

        {/* Errors */}
        {formError && <p className="text-sm text-chalk/80">{formError}</p>}
        {submitError && (
          <p className="text-sm text-chalk/80">Something went wrong. Please try again.</p>
        )}

        {/* 6. Commitment buttons (act as submit) */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleCommit('confirmed')}
            className="group flex w-full items-center justify-center gap-2 rounded-lg bg-lime px-4 py-3.5 font-mono text-[12px] tracking-[0.15em] uppercase text-void transition-all duration-300 hover:bg-lime/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Yes, I&apos;m 100% in
                <Check className="h-4 w-4" strokeWidth={2.5} />
              </>
            )}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleCommit('needs_info')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-wire/60 bg-slab px-4 py-3.5 font-mono text-[12px] tracking-[0.15em] uppercase text-bone transition-all duration-300 hover:border-wire disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'I need more info first'}
          </button>
        </div>
      </div>
    </main>
  )
}
