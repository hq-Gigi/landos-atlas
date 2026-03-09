import Head from 'next/head';
import Link from 'next/link';
import PageShell from './PageShell';
import { MotionCard, Reveal, StaggerGrid } from './MotionSystem';

export default function AudiencePage({ title, copy, bullets }) {
  return (
    <>
      <Head><title>{title} | LandOS Atlas</title></Head>
      <PageShell>
        <section className="mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">LANDOS ATLAS PLATFORM</p>
            <h1 className="mt-4 text-5xl font-semibold leading-tight">{title}</h1>
            <p className="mt-5 max-w-3xl text-lg text-[#b5cde6]">{copy}</p>
          </Reveal>
          <StaggerGrid className="mt-10 grid gap-5 md:grid-cols-2">
            {bullets.map((item) => (
              <MotionCard key={item.title} className="p-6">
                <h2 className="text-xl font-semibold">{item.title}</h2>
                <p className="mt-3 text-sm text-[#b5cde6]">{item.copy}</p>
              </MotionCard>
            ))}
          </StaggerGrid>
          <Reveal className="mt-10 flex gap-4">
            <Link href="/experience" className="btn-primary">See product walkthrough</Link>
            <Link href="/app" className="btn-secondary">Enter live platform</Link>
          </Reveal>
        </section>
      </PageShell>
    </>
  );
}
