import Head from 'next/head';
import NavBar from '../../components/NavBar';

export default function Page(){
  return (
    <>
      <Head><title>LandOS Atlas for Developers</title></Head>
      <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-20"><h1 className="text-4xl font-bold">For Developers</h1><p className="mt-4 text-slate-300">Run land studies, compare deterministic scenarios, manage feasibility assumptions, and generate execution-ready reports without fragmented tooling.</p></section></main>
    </>
  );
}
