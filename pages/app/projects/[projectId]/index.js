import { useRouter } from 'next/router';
import Link from 'next/link';
import NavBar from '../../../../components/NavBar';

const tabs = ['scenarios', 'feasibility', 'reports', 'collaboration'];

export default function ProjectWorkspace() {
  const { query } = useRouter();
  return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-6xl px-6 py-12"><h1 className="text-3xl font-bold">Project {query.projectId}</h1><p className="mt-3 text-slate-300">Overview · Map & Boundary · Land Profile · Scenario Options · Optimization Scores · Feasibility · Reports & Exports · Collaboration · Activity · Billing</p><div className="mt-6 flex gap-3">{tabs.map((t)=><Link key={t} className="rounded border border-white/10 px-3 py-2" href={`/app/projects/${query.projectId}/${t}`}>{t}</Link>)}</div></section></main>;
}
