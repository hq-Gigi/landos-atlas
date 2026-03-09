import { useState } from 'react';
import { useRouter } from 'next/router';
import PageShell from '../components/design/PageShell';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: 'demo@gigilabs.com', password: 'Demo@12345' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Unable to login');
    localStorage.setItem('atlas_token', data.token);
    localStorage.setItem('atlas_org', data.organizationId);
    router.push('/app');
  }

  return <PageShell><form onSubmit={submit} className="mx-auto mt-20 max-w-xl glass-panel p-8"><h1 className="text-3xl font-semibold">Login</h1><input className="mt-4 w-full rounded bg-[#09111c] p-2" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/><input type="password" className="mt-3 w-full rounded bg-[#09111c] p-2" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/><button className="btn-primary mt-4" type="submit">Sign in</button>{error && <p className="mt-2 text-red-300">{error}</p>}</form></PageShell>;
}
