import Head from 'next/head';
import PageShell from '../../components/design/PageShell';
import { MotionCard, Reveal, StaggerGrid } from '../../components/design/MotionSystem';

const controls = ['Token-based auth sessions', 'Scoped organization access', 'Payment verification audit trail', 'Project activity records and provenance', 'Operational API health and monitoring'];

export default function SecurityPage() {
  return (
    <>
      <Head><title>Security | LandOS Atlas</title></Head>
      <PageShell>
        <section className="mx-auto max-w-5xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">ENTERPRISE TRUST LAYER</p>
            <h1 className="mt-4 text-5xl font-semibold">Security built for serious project intelligence operations</h1>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-4">
            {controls.map((control) => (
              <MotionCard key={control} className="p-5 text-lg">✓ {control}</MotionCard>
            ))}
          </StaggerGrid>
        </section>
      </PageShell>
    </>
  );
}
