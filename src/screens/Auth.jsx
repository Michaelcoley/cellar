import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { Button, Field, Input } from '../components/Field';

export function Auth() {
  const { signInWithPassword, signUp, signInWithMagicLink } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      if (mode === 'signin') {
        const { error } = await signInWithPassword(email, password);
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMsg('Check your email to confirm.');
      } else {
        const { error } = await signInWithMagicLink(email);
        if (error) throw error;
        setMsg('Magic link sent. Check your email.');
      }
    } catch (err) {
      setMsg(err.message ?? 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="mb-8 text-center">
          <h1 className="font-display text-5xl tracking-tight text-amber">Cellar</h1>
          <p className="mt-2 text-sm text-bone/60">A premium spirits inventory, in your pocket.</p>
        </div>

        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-ink-800 bg-ink-900 p-5 shadow-card">
          <Field label="Email">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="off"
              autoCorrect="off"
            />
          </Field>
          {mode !== 'magic' && (
            <Field label="Password">
              <Input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </Field>
          )}
          {msg && <p className="text-xs text-bone/70">{msg}</p>}
          <Button type="submit" disabled={busy} className="w-full">
            {busy ? '…' : mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Send magic link'}
          </Button>
        </form>

        <div className="mt-4 flex justify-center gap-4 text-xs text-bone/60">
          <button onClick={() => setMode('signin')} className={mode === 'signin' ? 'text-amber' : ''}>Sign in</button>
          <button onClick={() => setMode('signup')} className={mode === 'signup' ? 'text-amber' : ''}>Create account</button>
          <button onClick={() => setMode('magic')} className={mode === 'magic' ? 'text-amber' : ''}>Magic link</button>
        </div>
      </motion.div>
    </div>
  );
}
