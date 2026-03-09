import { requirePageAuth } from '../../lib/ssrAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth } from '../../lib/clientAuth';

const routes = [
  ['Portfolio', '/app/portfolio', 'Track all active projects and performance.'],
  ['Create project', '/app/projects/new', 'Start new land development projects with boundary and assumptions.'],
  ['Marketplace', '/app/marketplace', 'Review listings and opportunities from connected teams.'],
  ['Billing', '/app/billing', 'Manage payments and export access per project.'],
  ['Investment', '/app/investment', 'Generate investor summaries and decision packs.'],
  ['Datasets', '/app/datasets', 'Inspect available land intelligence datasets.']
];

export default function AppHome() {
  const [me, setMe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWithAuth('/api/auth/me')
      .then(setMe)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-semibold">Workspace</h1>
        <p className="mt-2 text-[#b5cde6]">Run projects, feasibility, billing, collaboration, and exports from one place.</p>

        {me && (
          <div className="glass-panel mt-6 p-4">
            <p className="text-sm text-cyan-200">Signed in as {me.name || me.email}</p>
            <p className="mt-1 text-xs text-[#93b6d7]">{me.memberships?.length || 0} organization memberships detected.</p>
          </div>
        )}

        {error && (
          <div className="glass-panel mt-6 p-4 text-red-300">
            <p>{error}</p>
            <Link href="/login" className="mt-2 inline-block text-cyan-200">Go to login →</Link>
          </div>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {routes.map(([label, href, copy]) => (
            <Link key={href} className="glass-panel p-4 transition hover:-translate-y-1" href={href}>
              <h2 className="text-lg font-semibold">{label}</h2>
              <p className="mt-2 text-sm text-[#b5cde6]">{copy}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}


export const getServerSideProps = requirePageAuth();
