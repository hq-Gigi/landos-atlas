import NavBar from '../../components/NavBar';
import { db } from '../../lib/db';
import Link from 'next/link';

export default function Portfolio() {
  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-6xl px-6 py-12"><h1 className="text-3xl font-bold">Portfolio</h1><ul className="mt-6 space-y-3">{db.projects.map((p)=><li key={p.id}><Link className="rounded border border-white/10 p-3 inline-block" href={`/app/projects/${p.id}`}>{p.name}</Link></li>)}</ul></section></main>;
}
