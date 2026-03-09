import Head from 'next/head';
import Link from 'next/link';
import NavBar from '../components/NavBar';
import Hero from '../components/Hero';
import { audiences, productName, tagline } from '../lib/brand';

export default function Home() {
  return (
    <>
      <Head>
        <title>{productName}</title>
        <meta name="description" content={tagline} />
      </Head>
      <main className="min-h-screen bg-slate-950 text-white">
        <NavBar />
        <Hero />
        <section className="mx-auto max-w-7xl px-6 pb-20">
          <h2 className="text-2xl font-semibold">Built for every land intelligence stakeholder</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {audiences.map((a) => (
              <Link key={a.href} href={a.href} className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-cyan-300/60 hover:bg-white/10">
                <h3 className="font-semibold">{a.title}</h3>
                <p className="mt-3 text-sm text-slate-300">{a.copy}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
