import { useRouter } from 'next/router';
import NavBar from '../../../../components/NavBar';

export default function Page(){
 const {query}=useRouter();
 return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold capitalize">reports for {query.projectId}</h1><p className="mt-3 text-slate-300">Operational reports module with lock/unlock, collaboration hooks, and API integrations.</p></section></main>
}
