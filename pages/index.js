import Head from 'next/head';
import Link from 'next/link';
import Hero from '../components/Hero';
import PageShell from '../components/design/PageShell';
import { MotionCard, Reveal, StaggerGrid } from '../components/design/MotionSystem';
import { audiences, productName, tagline } from '../lib/brand';

export default function Home() {
  return (
    <>
      <Head>
        <title>{productName}</title>
        <meta name="description" content={tagline} />
      </Head>
      <PageShell>
        <Hero />
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <Reveal>
            <h2 className="text-3xl font-semibold">Designed for every decision-maker in the land development graph</h2>
          </Reveal>
          <StaggerGrid className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {audiences.map((a) => (
              <MotionCard key={a.href} className="p-5">
                <h3 className="font-semibold">{a.title}</h3>
                <p className="mt-3 text-sm text-[#b5cde6]">{a.copy}</p>
                <Link href={a.href} className="mt-4 inline-block text-sm text-cyan-200">Open intelligence view →</Link>
              </MotionCard>
            ))}
          </StaggerGrid>
        </section>
      </PageShell>
    </>
  );
}
