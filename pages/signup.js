import { useState } from 'react';
import { useRouter } from 'next/router';
import PageShell from '../components/design/PageShell';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: 'Demo Owner', organizationName: 'GIGI Atlas Demo Org', email: '', password: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Unable to signup');
    localStorage.setItem('atlas_token', data.token);
    localStorage.setItem('atlas_org', data.organizationId);
    router.push('/app');
  }

  return <PageShell><form onSubmit={submit} className="mx-auto mt-20 max-w-xl glass-panel p-8"><h1 className="text-3xl font-semibold">Sign up</h1><input placeholder="Name" className="mt-4 w-full rounded bg-[#09111c] p-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})}/><input placeholder="Organization" className="mt-3 w-full rounded bg-[#09111c] p-2" value={form.organizationName} onChange={(e)=>setForm({...form,organizationName:e.target.value})}/><input placeholder="Email" className="mt-3 w-full rounded bg-[#09111c] p-2" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/><input type="password" placeholder="Password" className="mt-3 w-full rounded bg-[#09111c] p-2" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/><button className="btn-primary mt-4" type="submit">Create account</button>{error && <p className="mt-2 text-red-300">{error}</p>}</form></PageShell>;
}
