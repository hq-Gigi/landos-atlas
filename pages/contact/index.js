import Head from 'next/head';
import PageShell from '../../components/design/PageShell';
import { Reveal } from '../../components/design/MotionSystem';

export default function ContactPage() {
  return (
    <>
      <Head><title>Contact | LandOS Atlas</title></Head>
      <PageShell>
        <section className="mx-auto max-w-4xl px-6 py-20">
          <Reveal>
            <p className="eyebrow">CONNECT WITH GIGI LABS</p>
            <h1 className="mt-4 text-5xl font-semibold">Bring LandOS Atlas into your development command stack</h1>
            <p className="mt-5 text-lg text-[#b5cde6]">Email <span className="text-cyan-200">hello@gigilabs.dev</span> to start a product walkthrough, enterprise onboarding, or integration planning session.</p>
          </Reveal>
        </section>
      </PageShell>
    </>
  );
}
