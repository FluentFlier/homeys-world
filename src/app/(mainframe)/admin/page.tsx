'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, LogOut, X, ChevronRight, ExternalLink } from 'lucide-react';
import { insforge } from '@/lib/insforge';

type Application = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  linkedin: string | null;
  twitter: string | null;
  github: string | null;
  building: string;
  stage: string;
  skills: string;
  portfolio_url: string | null;
  helping_others: string;
  preferred_start: string | null;
  preferred_end: string | null;
  status: string;
  budget_per_month: number | null;
  room_preference: string | null;
  num_people: number;
  assigned_room: string | null;
  wants_to_lead: boolean;
  admin_notes: string | null;
  house_preference: string | null;
  room_type: string | null;
  move_in_timing: string | null;
  length_of_stay: string | null;
  phone: string | null;
  commitment_status: string | null;
  confirmation_submitted_at: string | null;
};

const statuses = ['new', 'reviewing', 'accepted', 'waitlisted', 'rejected'] as const;
const statusColors: Record<string, string> = {
  new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  reviewing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  accepted: 'bg-green-500/10 text-green-400 border-green-500/20',
  waitlisted: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function Admin() {
  const [apps, setApps] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchApps();
  }, []);

  async function checkAuth() {
    const { data } = await insforge.auth.getCurrentUser();
    if (!data?.user) router.push('/login');
  }

  async function fetchApps() {
    const { data, error } = await insforge.database
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setApps(data as Application[]);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await insforge.database.from('applications').update({ status }).eq('id', id);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    if (selected?.id === id) setSelected({ ...selected, status });
  }

  async function updateNotes(id: string, admin_notes: string) {
    await insforge.database.from('applications').update({ admin_notes }).eq('id', id);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, admin_notes } : a)));
  }

  async function handleLogout() {
    await insforge.auth.signOut();
    router.push('/login');
  }

  const filtered =
    filter === 'all'
      ? apps
      : filter === 'Confirmed'
        ? apps.filter((a) => a.confirmation_submitted_at)
        : filter === 'Pending'
          ? apps.filter((a) => !a.confirmation_submitted_at)
          : apps.filter((a) => a.status === filter);
  const counts = statuses.reduce(
    (acc, s) => ({ ...acc, [s]: apps.filter((a) => a.status === s).length }),
    {} as Record<string, number>
  );
  const confirmedCount = apps.filter((a) => a.confirmation_submitted_at).length;
  const pendingCount = apps.filter((a) => !a.confirmation_submitted_at).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="font-mono text-fog">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      <header className="border-b border-wire px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal size={20} className="text-lime" />
          <span className="font-semibold text-lg">Mainframe</span>
          <span className="font-mono text-xs text-fog bg-slab px-2 py-1 rounded">admin</span>
        </div>
        <button onClick={handleLogout} className="text-fog hover:text-white transition flex items-center gap-2 text-sm">
          <LogOut size={16} /> Sign out
        </button>
      </header>

      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Stats */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`font-mono text-xs px-4 py-2 rounded-lg border transition ${
              filter === 'all' ? 'border-lime text-lime bg-lime/5' : 'border-wire text-fog hover:text-white'
            }`}
          >
            All {apps.length}
          </button>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`font-mono text-xs px-4 py-2 rounded-lg border transition ${
                filter === s ? 'border-lime text-lime bg-lime/5' : 'border-wire text-fog hover:text-white'
              }`}
            >
              {s} {counts[s]}
            </button>
          ))}
          <button
            onClick={() => setFilter('Confirmed')}
            className={`font-mono text-xs px-4 py-2 rounded-lg border transition ${
              filter === 'Confirmed' ? 'border-lime text-lime bg-lime/5' : 'border-wire text-fog hover:text-white'
            }`}
          >
            Confirmed {confirmedCount}
          </button>
          <button
            onClick={() => setFilter('Pending')}
            className={`font-mono text-xs px-4 py-2 rounded-lg border transition ${
              filter === 'Pending' ? 'border-lime text-lime bg-lime/5' : 'border-wire text-fog hover:text-white'
            }`}
          >
            Pending {pendingCount}
          </button>
        </div>

        {/* Application list */}
        <div className="space-y-2">
          {filtered.map((app) => (
            <motion.div
              key={app.id}
              layout
              onClick={() => setSelected(app)}
              className="bg-slab border border-wire rounded-xl px-5 py-4 cursor-pointer hover:border-lime/20 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="min-w-0">
                  <div className="font-medium truncate">{app.name}</div>
                  <div className="text-sm text-fog truncate">{app.building}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {app.budget_per_month && (
                  <span className="font-mono text-xs text-fog">${app.budget_per_month}</span>
                )}
                {app.assigned_room && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
                    {app.assigned_room}
                  </span>
                )}
                {app.confirmation_submitted_at ? (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-lime/10 text-lime border border-lime/20">
                    Accelr8 ✓
                  </span>
                ) : (
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full border border-wire text-fog">
                    Pending
                  </span>
                )}
                <span className={`font-mono text-xs px-3 py-1 rounded-full border ${statusColors[app.status]}`}>
                  {app.status}
                </span>
                <span className="font-mono text-xs text-fog">{app.stage}</span>
                <ChevronRight size={16} className="text-fog group-hover:text-lime transition" />
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center text-fog py-20">No applications {filter !== 'all' ? `with status "${filter}"` : 'yet'}.</div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-xl bg-void border-l border-wire h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-void/90 backdrop-blur border-b border-wire px-6 py-4 flex items-center justify-between z-10">
                <h2 className="font-semibold text-lg">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-fog hover:text-white transition">
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-6">
                {/* Status */}
                <div>
                  <label className="block text-xs text-fog mb-2 font-mono uppercase tracking-wider">Status</label>
                  <div className="flex gap-2 flex-wrap">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(selected.id, s)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                          selected.status === s
                            ? statusColors[s]
                            : 'border-wire text-fog hover:text-white'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-xs text-fog mb-2 font-mono uppercase tracking-wider">Contact</label>
                  <div className="space-y-1 text-sm">
                    <div>{selected.email}</div>
                    {selected.linkedin && (
                      <a href={selected.linkedin} target="_blank" rel="noreferrer" className="text-lime hover:underline flex items-center gap-1">
                        LinkedIn <ExternalLink size={12} />
                      </a>
                    )}
                    {selected.twitter && <div className="text-fog">@{selected.twitter.replace('@', '')}</div>}
                    {selected.github && (
                      <a href={selected.github} target="_blank" rel="noreferrer" className="text-lime hover:underline flex items-center gap-1">
                        GitHub <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>

                <Field label="Building" value={selected.building} />
                <Field label="Stage" value={selected.stage} mono />
                <Field label="Skills" value={selected.skills} />
                {selected.portfolio_url && (
                  <div>
                    <label className="block text-xs text-fog mb-2 font-mono uppercase tracking-wider">Portfolio</label>
                    <a href={selected.portfolio_url} target="_blank" rel="noreferrer" className="text-lime hover:underline text-sm flex items-center gap-1">
                      {selected.portfolio_url} <ExternalLink size={12} />
                    </a>
                  </div>
                )}
                <Field label="Helping Others" value={selected.helping_others} />

                {/* Housing details */}
                <div className="border-t border-wire pt-6">
                  <label className="block text-xs text-fog mb-3 font-mono uppercase tracking-wider">Housing Details</label>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-fog text-xs">Budget</span>
                      <div className="font-mono text-lime">{selected.budget_per_month ? `$${selected.budget_per_month}/mo` : 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-fog text-xs">Room pref</span>
                      <div>{selected.room_preference || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-fog text-xs">People</span>
                      <div>{selected.num_people}</div>
                    </div>
                  </div>
                </div>

                {/* Accelr8 Confirmation */}
                <div className="border-t border-wire pt-6">
                  <label className="block text-xs text-fog mb-3 font-mono uppercase tracking-wider">Accelr8 Confirmation</label>
                  {selected.confirmation_submitted_at ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-fog text-xs">House</span>
                        <div>{selected.house_preference || '—'}</div>
                      </div>
                      <div>
                        <span className="text-fog text-xs">Room type</span>
                        <div>{selected.room_type || '—'}</div>
                      </div>
                      <div>
                        <span className="text-fog text-xs">Move-in</span>
                        <div>{selected.move_in_timing || '—'}</div>
                      </div>
                      <div>
                        <span className="text-fog text-xs">Length of stay</span>
                        <div>{selected.length_of_stay || '—'}</div>
                      </div>
                      <div>
                        <span className="text-fog text-xs">Phone</span>
                        <div>{selected.phone || '—'}</div>
                      </div>
                      <div>
                        <span className="text-fog text-xs">Commitment</span>
                        <div>{selected.commitment_status || '—'}</div>
                      </div>
                      <div>
                        <span className="text-fog text-xs">Confirmed at</span>
                        <div className="font-mono text-lime">
                          {new Date(selected.confirmation_submitted_at).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-fog">Not yet submitted</div>
                  )}
                </div>

                {/* Room assignment */}
                <div>
                  <label className="block text-xs text-fog mb-2 font-mono uppercase tracking-wider">Room Assignment</label>
                  <input
                    defaultValue={selected.assigned_room || ''}
                    onBlur={(e) => {
                      insforge.database.from('applications').update({ assigned_room: e.target.value || null }).eq('id', selected.id);
                      setApps((prev) => prev.map((a) => (a.id === selected.id ? { ...a, assigned_room: e.target.value || null } : a)));
                    }}
                    placeholder="e.g. Room A, Room 3, Shared..."
                    className="w-full bg-slab border border-wire rounded-xl px-4 py-3 text-white text-sm placeholder:text-fog/50 focus:outline-none focus:border-lime/50 transition-all"
                  />
                </div>

                {selected.wants_to_lead && (
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-sm text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full font-mono">
                      Wants to lead a house
                    </span>
                  </div>
                )}

                {(selected.preferred_start || selected.preferred_end) && (
                  <div>
                    <label className="block text-xs text-fog mb-2 font-mono uppercase tracking-wider">Dates</label>
                    <div className="text-sm">
                      {selected.preferred_start} &rarr; {selected.preferred_end}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs text-fog mb-2 font-mono uppercase tracking-wider">Applied</label>
                  <div className="text-sm text-fog">
                    {new Date(selected.created_at).toLocaleDateString('en-US', {
                      month: 'long', day: 'numeric', year: 'numeric',
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs text-fog mb-2 font-mono uppercase tracking-wider">Admin Notes</label>
                  <textarea
                    defaultValue={selected.admin_notes || ''}
                    onBlur={(e) => updateNotes(selected.id, e.target.value)}
                    rows={4}
                    placeholder="Add private notes..."
                    className="w-full bg-slab border border-wire rounded-xl px-4 py-3 text-white text-sm placeholder:text-fog/50 focus:outline-none focus:border-lime/50 transition-all"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, value, mono: isMono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-fog mb-2 font-mono uppercase tracking-wider">{label}</label>
      <div className={`text-sm leading-relaxed ${isMono ? 'font-mono text-lime' : ''}`}>{value}</div>
    </div>
  );
}
