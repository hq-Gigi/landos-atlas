import { requirePageAuth } from '../../lib/ssrAuth';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth, getClientOrgId } from '../../lib/clientAuth';

const LandCommandMap = dynamic(() => import('../../components/design/LandCommandMap'), { ssr: false });

function projectStatus(project) {
  if ((project.payments || []).some((entry) => entry.status === 'SUCCESS')) return 'Funded';
  if ((project.scenarios || []).length > 0) return 'Analyzing';
  return 'Draft';
}

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

  const mapProjects = useMemo(() => projects.map((project) => ({
    ...project,
    center: project.boundaries?.[0]?.geometry?.[0] || null,
    status: projectStatus(project)
  })), [projects]);

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-4xl font-semibold">Global Portfolio View</h1>
        <p className="mt-2 text-[#b5cde6]">Track every project footprint with parcel overlays, status markers, and map-first operational visibility.</p>
        {error && <p className="mt-3 text-red-300">{error}</p>}

        <div className="glass-panel mt-6 h-[430px] overflow-hidden rounded-2xl">
          <LandCommandMap className="h-full w-full" projects={mapProjects} showProjectMarkers />
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {projects.map((project) => (
            <Link key={project.id} href={`/app/projects/${project.id}`} className="glass-panel p-4 transition hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{project.name}</h2>
                <span className="rounded-full border border-cyan-300/30 px-2 py-1 text-xs text-cyan-100">{projectStatus(project)}</span>
              </div>
              <p className="mt-2 text-sm text-[#b5cde6]">Objective: {project.objective}</p>
              <p className="mt-1 text-xs text-[#9fc0dc]">{project.boundaries?.[0]?.geometry?.length || 0} parcel points · {(project.scenarios || []).length} scenarios</p>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export const getServerSideProps = requirePageAuth();
