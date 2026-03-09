import { useState } from 'react';
import { useRouter } from 'next/router';
import PageShell from '../components/design/PageShell';
import { saveSession } from '../lib/clientAuth';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to sign in');
      saveSession({ organizationId: data.organizationId });
      fetch('/api/analytics/experiments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ experiment: 'home_hero_v1', variant: 'n/a', eventType: 'login_success' }) }).catch(() => null);
      router.push('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <form onSubmit={submit} className="mx-auto mt-20 max-w-xl glass-panel p-8">
        <h1 className="text-3xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-[#b5cde6]">Access your workspace and project systems.</p>
        <input
          className="mt-4 w-full rounded bg-[#09111c] p-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          className="mt-3 w-full rounded bg-[#09111c] p-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn-primary mt-4 w-full" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        {error && <p className="mt-2 text-red-300">{error}</p>}
      </form>
    </PageShell>
  );
}
