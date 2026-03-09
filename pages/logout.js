import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { clearClientSession } from '../lib/clientAuth';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    clearClientSession();
    fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' }).finally(() => router.replace('/login'));
  }, [router]);

  return <main className="atlas-bg flex min-h-screen items-center justify-center text-cyan-100">Signing out…</main>;
}
