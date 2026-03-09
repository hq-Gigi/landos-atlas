import { requirePageAuth } from '../../lib/ssrAuth';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth, getClientOrgId } from '../../lib/clientAuth';

export default function PortfolioPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const orgId = getClientOrgId();
    if (!orgId) {
      setError('No organization selected. Please sign in again.');
      return;
    }
    fetchWithAuth(`/api/projects?orgId=${orgId}`).then(setProjects).catch((err) => setError(err.message));
  }, []);

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-semibold">Portfolio</h1>
        {error && <p className="mt-3 text-red-300">{error}</p>}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/app/projects/${project.id}`} className="glass-panel p-4 transition hover:-translate-y-1">
              <h2 className="text-lg font-semibold">{project.name}</h2>
              <p className="mt-2 text-sm text-[#b5cde6]">Objective: {project.objective}</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}


export const getServerSideProps = requirePageAuth();
