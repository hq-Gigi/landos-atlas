import Head from 'next/head';
import Link from 'next/link';
import PageShell from '../../components/design/PageShell';
import { MotionCard, Reveal, StaggerGrid } from '../../components/design/MotionSystem';

const pillars = [
  ['Parcel Intelligence', 'Boundary analytics, geometry metrics, and land profile persistence.'],
  ['Scenario Engine', 'Deterministic development options with auditable scoring logic.'],
  ['Feasibility Core', 'Cost, revenue, margin, and timeline models per scenario.'],
  ['Boardroom AI', 'Recommendation narratives for stakeholder decisions.'],
  ['Billing & Unlocks', 'Verified payment gates for premium exports.'],
  ['Collaboration Fabric', 'Comments, tasks, and activity records per project workspace.']
];

export default function PlatformPage(){
  return (
    <>
      <Head><title>LandOS Atlas Platform</title></Head>
      <PageShell>
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">PLATFORM OVERVIEW</p>
            <h1 className="mt-4 text-5xl font-semibold">Enterprise operating system from parcel to portfolio</h1>
            <p className="mt-4 max-w-3xl text-[#b5cde6]">LandOS Atlas combines geospatial intelligence, deterministic optimization, financial feasibility, and collaboration into one operational system.</p>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-4 md:grid-cols-2">
            {pillars.map(([title, copy]) => (
              <MotionCard key={title} className="p-5">
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-[#b5cde6]">{copy}</p>
              </MotionCard>
            ))}
          </StaggerGrid>
          <Reveal className="mt-8 flex gap-3">
            <Link href="/experience" className="btn-primary">View platform walkthrough</Link>
            <Link href="/app" className="btn-secondary">Open application workspace</Link>
          </Reveal>
        </section>
      </PageShell>
    </>
  );
}
