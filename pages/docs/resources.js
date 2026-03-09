import Head from 'next/head';
import NavBar from '../../components/NavBar';

const docs = [
  'Land Os Gigi Labs Master Blueprint (2).pdf',
  'Land Os Atlas Cinematic Experience System.pdf',
  'Land Os Atlas Cinematic Implementation Pack.pdf',
  'Land Os Atlas Operational Build Pack.pdf',
  'Land Os Atlas Continuation From 28 (1).pdf'
];

export default function Resources() {
  return (
    <>
      <Head><title>LandOS Atlas Resources</title></Head>
      <main className="min-h-screen bg-slate-950 text-white">
        <NavBar />
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h1 className="text-3xl font-bold">Documentation & Resources</h1>
          <ul className="mt-8 space-y-3 text-slate-200">
            {docs.map((doc) => <li key={doc} className="rounded-lg border border-white/10 p-4">{doc}</li>)}
          </ul>
        </section>
      </main>
    </>
  );
}
