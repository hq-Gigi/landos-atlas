import { useState } from 'react';
import { useRouter } from 'next/router';
import PageShell from '../components/design/PageShell';
import { saveSession } from '../lib/clientAuth';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', organizationName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const text = await res.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error('Signup failed due to a server error. Please try again shortly.');
        }
      }
      if (!res.ok) throw new Error(data.error || 'Unable to create account');
      saveSession({ organizationId: data.organizationId });
      fetch('/api/analytics/experiments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ experiment: 'home_hero_v1', variant: 'n/a', eventType: 'signup_success' }) }).catch(() => null);
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
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-[#b5cde6]">Set up your organization and start running projects.</p>
        <input placeholder="Your full name" className="mt-4 w-full rounded bg-[#09111c] p-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Organization" className="mt-3 w-full rounded bg-[#09111c] p-2" value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} />
        <input placeholder="Email" className="mt-3 w-full rounded bg-[#09111c] p-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" placeholder="Password" className="mt-3 w-full rounded bg-[#09111c] p-2" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn-primary mt-4 w-full" type="submit" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button>
        {error && <p className="mt-2 text-red-300">{error}</p>}
      </form>
    </PageShell>
  );
}
