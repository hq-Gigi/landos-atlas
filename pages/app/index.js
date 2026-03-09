import { useState } from 'react';
import Link from 'next/link';
import PageShell from '../../components/design/PageShell';

export default function AppHome() {
  const [email, setEmail] = useState('demo@gigilabs.com');
  const [password, setPassword] = useState('Demo@12345');
  const [status, setStatus] = useState('');

  async function login(path) {
    const res = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name: 'Demo Owner', organizationName: 'GIGI Atlas Demo Org' }) });
    const data = await res.json();
    if (!res.ok) return setStatus(data.error || 'request failed');
    localStorage.setItem('atlas_token', data.token);
    if (data.organizationId) localStorage.setItem('atlas_org', data.organizationId);
    setStatus('Authenticated');
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-semibold">Application Workspace</h1>
        <p className="mt-2 text-[#b5cde6]">Authenticate to access persisted projects, collaboration, reports, billing, and marketplace records.</p>
        <div className="glass-panel mt-6 grid gap-3 p-4 md:grid-cols-4">
          <input className="rounded-lg bg-[#09111c] px-3 py-2" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded-lg bg-[#09111c] px-3 py-2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="btn-primary" onClick={() => login('/api/auth/login')}>Login</button>
          <button className="btn-secondary" onClick={() => login('/api/auth/signup')}>Signup</button>
        </div>
        {status && <p className="mt-3 text-sm text-cyan-200">{status}</p>}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {['portfolio', 'projects/new', 'marketplace', 'billing', 'investment', 'datasets'].map((route) => (
            <Link key={route} className="glass-panel p-4 transition hover:-translate-y-1" href={`/app/${route}`}>/app/{route}</Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
