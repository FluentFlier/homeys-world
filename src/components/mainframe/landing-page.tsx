'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { insforge } from '@/lib/insforge';

/* ─── Animated Grid Background ─── */
function GridField() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Perspective grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(181,255,77,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(181,255,77,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)',
        }}
      />
      {/* Radial glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-lime/[0.03] blur-[150px]" />
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-lime/[0.06] blur-[100px]" />
    </div>
  );
}

/* ─── Section reveal wrapper ─── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Navigation ─── */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-void/80 backdrop-blur-xl border-b border-wire/50' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          <span className="font-mono text-sm tracking-wider text-chalk/80">MAINFRAME</span>
        </div>
        <a
          href="#apply"
          className="font-mono text-xs tracking-widest text-lime/70 hover:text-lime transition-colors uppercase"
        >
          Apply
        </a>
      </div>
    </motion.nav>
  );
}

/* ─── HERO ─── */
function Hero() {
  const { scrollY } = useScroll();
  const titleY = useTransform(scrollY, [0, 600], [0, 150]);
  const titleOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden">
      <GridField />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-void to-transparent z-10" />

      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative z-20 text-center px-6 max-w-5xl mx-auto"
      >
        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10"
        >
          <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] uppercase text-fog border border-wire/60 px-4 py-2 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
            San Francisco &middot; Summer 2026
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display text-[clamp(4rem,12vw,10rem)] leading-[0.9] tracking-[-0.03em] mb-8"
        >
          <span className="text-chalk">Main</span>
          <span className="italic text-lime">frame</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-lg md:text-xl text-fog max-w-xl mx-auto mb-12 leading-relaxed"
        >
          A community of builders in San Francisco.
          <br />
          <span className="text-bone/60">Live together. Build together. Launch together.</span>
          <br />
          <span className="text-lime/70">Now partnering with Accelr8 for Summer 2026 housing.</span>
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <a
            href="#apply"
            className="group inline-flex items-center gap-3 bg-lime text-void font-mono text-sm font-bold tracking-wider uppercase px-8 py-4 rounded-full transition-all duration-300 hover:shadow-[0_0_40px_rgba(181,255,77,0.3)] hover:scale-[1.02]"
          >
            Apply for Summer '26
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── MANIFESTO ─── */
function Manifesto() {
  return (
    <section className="relative py-32 md:py-48 px-6">
      <div className="max-w-4xl mx-auto">
        <Reveal>
          <p className="font-display text-3xl md:text-5xl lg:text-6xl leading-[1.15] tracking-[-0.02em] text-bone">
            We believe the best things are built
            <span className="text-lime italic"> together</span>.
            Mainframe is a community in San Francisco where
            <span className="text-fog"> builders, engineers, designers,</span> and
            <span className="text-fog"> AI hackers</span> live under one roof,
            pushing each other to
            <span className="text-lime italic"> ship faster</span> and
            <span className="text-lime italic"> think bigger</span>.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-16 flex items-center gap-4">
            <div className="h-px flex-1 bg-wire" />
            <span className="font-mono text-[11px] text-fog tracking-[0.3em] uppercase">Est. 2026</span>
            <div className="h-px flex-1 bg-wire" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── PILLARS ─── */
const pillars = [
  {
    num: '01',
    title: 'Build',
    body: 'Cowork with people who are actually shipping. Not talking about building. Building. Every day, under the same roof.',
  },
  {
    num: '02',
    title: 'Connect',
    body: 'Your next collaborator or best friend might be in the next room. The network compounds.',
  },
  {
    num: '03',
    title: 'Grow',
    body: 'Weekly demos, honest feedback, shared wins. An environment that holds you to a higher bar, with kindness.',
  },
  {
    num: '04',
    title: 'Belong',
    body: 'Inclusive by design. We celebrate different backgrounds, skill sets, and perspectives. Your win is our win.',
  },
];

function Pillars() {
  return (
    <section className="relative py-32 px-6">
      {/* Section line accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-wire" />

      <div className="max-w-6xl mx-auto">
        <Reveal>
          <div className="mb-20">
            <span className="font-mono text-[11px] tracking-[0.3em] text-lime uppercase">The Pillars</span>
            <h2 className="font-display text-5xl md:text-7xl mt-4 tracking-[-0.02em]">
              More than a roof.
            </h2>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-px bg-wire/30 rounded-2xl overflow-hidden">
          {pillars.map((p, i) => (
            <Reveal key={p.num} delay={i * 0.1}>
              <div className="bg-slab p-10 md:p-12 h-full group hover:bg-edge/50 transition-colors duration-500">
                <span className="font-mono text-xs text-lime/40 tracking-widest">{p.num}</span>
                <h3 className="font-display text-3xl md:text-4xl mt-3 mb-4 italic group-hover:text-lime transition-colors duration-500">
                  {p.title}
                </h3>
                <p className="text-fog leading-relaxed text-[15px]">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PROCESS ─── */
function Process() {
  const steps = [
    { label: 'Apply', detail: 'Tell us who you are and what you\'re building. Five minutes.' },
    { label: 'Get selected', detail: 'We review every application by hand. We look for agency, not resumes.' },
    { label: 'Move in', detail: 'Get matched with your housemates and move in together.' },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="relative max-w-5xl mx-auto">
        <Reveal>
          <span className="font-mono text-[11px] tracking-[0.3em] text-lime uppercase">Process</span>
          <h2 className="font-display text-5xl md:text-7xl mt-4 mb-20 tracking-[-0.02em]">
            Three steps.
          </h2>
        </Reveal>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 0.15}>
              <div className="border-t border-wire/40 py-10 md:py-14 flex flex-col md:flex-row md:items-start gap-4 md:gap-16 group">
                <span className="font-mono text-lime/30 text-sm tracking-wider shrink-0 w-24 pt-1">
                  0{i + 1}
                </span>
                <h3 className="font-display text-3xl md:text-5xl italic group-hover:text-lime transition-colors duration-300 shrink-0 w-64">
                  {step.label}
                </h3>
                <p className="text-fog text-[15px] leading-relaxed pt-2 md:pt-3 max-w-md">
                  {step.detail}
                </p>
              </div>
            </Reveal>
          ))}
          <div className="border-t border-wire/40" />
        </div>
      </div>
    </section>
  );
}

/* ─── APPLICATION FORM ─── */
function ApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get('name') as string,
      email: form.get('email') as string,
      linkedin: (form.get('linkedin') as string) || null,
      twitter: (form.get('twitter') as string) || null,
      github: (form.get('github') as string) || null,
      building: form.get('building') as string,
      stage: form.get('stage') as string,
      skills: form.get('skills') as string,
      portfolio_url: (form.get('portfolio_url') as string) || null,
      helping_others: form.get('helping_others') as string,
      preferred_start: (form.get('preferred_start') as string) || null,
      preferred_end: (form.get('preferred_end') as string) || null,
      budget_per_month: form.get('budget_per_month') ? Number(form.get('budget_per_month')) : null,
      room_preference: (form.get('room_preference') as string) || null,
      num_people: form.get('num_people') ? Number(form.get('num_people')) : 1,
      wants_to_lead: form.get('wants_to_lead') === 'on',
    };

    const { error: dbError } = await insforge.database.from('applications').insert([payload]);
    if (dbError) {
      setError('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }
    // Unified funnel: send the new applicant straight to housing with their email prefilled.
    window.location.href = `/accelr8?email=${encodeURIComponent(payload.email)}`;
  }

  const input = "w-full bg-slab border border-wire/60 rounded-lg px-4 py-3.5 text-chalk text-sm placeholder:text-fog/40 focus:outline-none focus:border-lime/40 focus:shadow-[0_0_20px_rgba(181,255,77,0.05)] transition-all duration-300";
  const label = "block font-mono text-[11px] tracking-[0.15em] uppercase text-fog mb-2.5";

  return (
    <section id="apply" className="relative py-32 md:py-40 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-wire" />

      <div className="max-w-2xl mx-auto">
        <Reveal>
          <div className="mb-16">
            <span className="font-mono text-[11px] tracking-[0.3em] text-lime uppercase">Apply</span>
            <h2 className="font-display text-5xl md:text-7xl mt-4 tracking-[-0.02em]">
              Join the <span className="italic text-lime">cohort</span>.
            </h2>
            <p className="text-fog mt-4 text-[15px]">Limited spots. Tell us what you're building.</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={label}>Name *</label>
                <input name="name" required placeholder="Your name" className={input} />
              </div>
              <div>
                <label className={label}>Email *</label>
                <input name="email" type="email" required placeholder="you@email.com" className={input} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className={label}>LinkedIn</label>
                <input name="linkedin" placeholder="URL" className={input} />
              </div>
              <div>
                <label className={label}>Twitter</label>
                <input name="twitter" placeholder="@handle" className={input} />
              </div>
              <div>
                <label className={label}>GitHub</label>
                <input name="github" placeholder="URL" className={input} />
              </div>
            </div>

            <div>
              <label className={label}>What are you building? *</label>
              <textarea name="building" required rows={3} placeholder="Tell us about your project..." className={input} />
            </div>

            <div>
              <label className={label}>Stage *</label>
              <select name="stage" required className={input}>
                <option value="">Select</option>
                <option value="idea">Idea</option>
                <option value="mvp">Building MVP</option>
                <option value="launched">Launched</option>
                <option value="funded">Funded</option>
              </select>
            </div>

            <div>
              <label className={label}>Skills &amp; strengths *</label>
              <textarea name="skills" required rows={2} placeholder="Full-stack, ML/AI, design, growth..." className={input} />
            </div>

            <div>
              <label className={label}>Link to something you've built</label>
              <input name="portfolio_url" type="url" placeholder="https://..." className={input} />
            </div>

            <div>
              <label className={label}>How do you help others? *</label>
              <textarea name="helping_others" required rows={2} placeholder="Code reviews, intros, design feedback..." className={input} />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className={label}>Start date</label>
                <input name="preferred_start" type="date" className={input} />
              </div>
              <div>
                <label className={label}>End date</label>
                <input name="preferred_end" type="date" className={input} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              <div>
                <label className={label}>Monthly budget ($/person)</label>
                <input name="budget_per_month" type="number" placeholder="e.g. 1500" className={input} />
              </div>
              <div>
                <label className={label}>Room preference</label>
                <select name="room_preference" className={input}>
                  <option value="">Select</option>
                  <option value="private">Private room</option>
                  <option value="shared">Shared room (cheaper)</option>
                  <option value="either">Either works</option>
                </select>
              </div>
              <div>
                <label className={label}>How many people?</label>
                <select name="num_people" className={input}>
                  <option value="1">Just me</option>
                  <option value="2">Me + 1 (pair)</option>
                  <option value="3">Group of 3</option>
                </select>
              </div>
            </div>

            <div className="border border-wire/40 rounded-lg p-5 bg-slab/50">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  name="wants_to_lead"
                  type="checkbox"
                  className="mt-1 w-4 h-4 rounded border-wire bg-slab accent-lime"
                />
                <div>
                  <span className="text-sm text-chalk font-medium group-hover:text-lime transition-colors">
                    I'd be interested in leading a Mainframe house
                  </span>
                  <p className="text-[13px] text-fog mt-1">
                    We're exploring running multiple houses. If you'd want to help organize or lead one, check this box.
                  </p>
                </div>
              </label>
            </div>

            {error && <p className="text-red-400 text-sm font-mono">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lime text-void font-mono text-sm font-bold tracking-wider uppercase py-4 rounded-lg transition-all duration-300 hover:shadow-[0_0_40px_rgba(181,255,77,0.2)] disabled:opacity-40"
            >
              {loading ? 'Sending...' : 'Submit Application'}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── FOOTER ─── */
function Footer() {
  return (
    <footer className="border-t border-wire/30 py-10 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-lime" />
          <span className="font-mono text-xs tracking-[0.2em] text-fog uppercase">Mainframe</span>
        </div>
        <p className="font-mono text-[11px] text-fog/50 tracking-wider">
          San Francisco, CA &middot; 2026
        </p>
      </div>
    </footer>
  );
}

/* ─── PAGE ─── */
export default function LandingPage() {
  return (
    <main>
      <Nav />
      <Hero />
      <Manifesto />
      <Pillars />
      <Process />
      <ApplicationForm />
      <Footer />
    </main>
  );
}
