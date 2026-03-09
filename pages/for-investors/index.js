import Head from 'next/head';
import NavBar from '../../components/NavBar';

export default function Page(){
  return (
    <>
      <Head><title>LandOS Atlas for Investors</title></Head>
      <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-20"><h1 className="text-4xl font-bold">For Investors</h1><p className="mt-4 text-slate-300">Evaluate project upside, downside, and execution risk with transparent assumptions, ranked scenarios, and AI-generated investment memos.</p></section></main>
    </>
  );
}
