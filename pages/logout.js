import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    localStorage.removeItem('atlas_token');
    localStorage.removeItem('atlas_org');
    fetch('/api/auth/logout', { method: 'POST' }).finally(() => router.replace('/login'));
  }, [router]);

  return <main className="atlas-bg flex min-h-screen items-center justify-center text-cyan-100">Signing out…</main>;
}
