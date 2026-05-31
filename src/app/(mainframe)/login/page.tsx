'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Terminal } from 'lucide-react';
import { insforge } from '@/lib/insforge';

type Mode = 'login' | 'signup' | 'verify' | 'forgot' | 'reset-code' | 'new-password';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>('login');
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'verify') {
      const { error: err } = await insforge.auth.verifyEmail({ email, otp: code });
      if (err) { setError(err.message || 'Invalid code'); setLoading(false); return; }
      setMode('login');
      setError('');
      setLoading(false);
      return;
    }

    if (mode === 'forgot') {
      const { error: err } = await insforge.auth.sendResetPasswordEmail({ email });
      if (err) { setError(err.message || 'Failed to send reset email'); setLoading(false); return; }
      setMode('reset-code');
      setLoading(false);
      return;
    }

    if (mode === 'reset-code') {
      const { data, error: err } = await insforge.auth.exchangeResetPasswordToken({ email, code });
      if (err || !data) { setError(err?.message || 'Invalid code'); setLoading(false); return; }
      setResetToken(data.token);
      setMode('new-password');
      setLoading(false);
      return;
    }

    if (mode === 'new-password') {
      const { error: err } = await insforge.auth.resetPassword({ newPassword: password, otp: resetToken });
      if (err) { setError(err.message || 'Failed to reset password'); setLoading(false); return; }
      setMode('login');
      setError('');
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const { data, error: err } = await insforge.auth.signUp({ email, password });
      if (err) { setError(err.message || 'Signup failed'); setLoading(false); return; }
      if (data?.requireEmailVerification) { setMode('verify'); setLoading(false); return; }
      router.push('/admin');
      return;
    }

    // login
    const { error: err } = await insforge.auth.signInWithPassword({ email, password });
    if (err) { setError('Invalid credentials'); setLoading(false); return; }
    router.push('/admin');
  }

  const inputClass = "w-full bg-slab border border-wire rounded-xl px-4 py-3 text-chalk placeholder:text-fog/50 focus:outline-none focus:border-lime/40 transition-all";
  const codeClass = "w-full bg-slab border border-wire rounded-xl px-4 py-3 text-chalk text-center text-2xl tracking-[0.3em] font-mono placeholder:text-fog/50 placeholder:text-base placeholder:tracking-normal focus:outline-none focus:border-lime/40 transition-all";

  const titles: Record<Mode, string> = {
    login: 'Sign in to manage applications',
    signup: 'Create your admin account',
    verify: 'Enter the verification code from your email',
    forgot: 'Enter your email to reset password',
    'reset-code': 'Enter the reset code from your email',
    'new-password': 'Set your new password',
  };

  const buttons: Record<Mode, string> = {
    login: 'Sign In',
    signup: 'Create Account',
    verify: 'Verify',
    forgot: 'Send Reset Code',
    'reset-code': 'Submit Code',
    'new-password': 'Set Password',
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Terminal size={32} className="text-lime mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-chalk">Mainframe Admin</h1>
          <p className="text-fog text-sm mt-1">{titles[mode]}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Email" required className={inputClass} />
          )}

          {(mode === 'login' || mode === 'signup' || mode === 'new-password') && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'new-password' ? 'New password' : 'Password'} required className={inputClass} />
          )}

          {(mode === 'verify' || mode === 'reset-code') && (
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code" required maxLength={6} className={codeClass} />
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full bg-lime text-void font-bold py-3 rounded-xl transition-all disabled:opacity-50">
            {loading ? 'Loading...' : buttons[mode]}
          </button>
        </form>

        <div className="space-y-2 mt-4">
          {mode === 'login' && (
            <>
              <button onClick={() => { setMode('signup'); setError(''); }}
                className="w-full text-center text-fog text-sm hover:text-chalk transition-colors">
                Need an account? Sign up
              </button>
              <button onClick={() => { setMode('forgot'); setError(''); }}
                className="w-full text-center text-fog text-sm hover:text-chalk transition-colors">
                Forgot password?
              </button>
            </>
          )}
          {mode === 'signup' && (
            <button onClick={() => { setMode('login'); setError(''); }}
              className="w-full text-center text-fog text-sm hover:text-chalk transition-colors">
              Already have an account? Sign in
            </button>
          )}
          {(mode === 'verify' || mode === 'reset-code' || mode === 'new-password' || mode === 'forgot') && (
            <button onClick={() => { setMode('login'); setError(''); }}
              className="w-full text-center text-fog text-sm hover:text-chalk transition-colors">
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
