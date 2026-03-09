import { requirePageAuth } from '../../lib/ssrAuth';
import NavBar from '../../components/NavBar';

export default function Page(){
 return <main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-12"><h1 className="text-3xl font-bold capitalize">team</h1><p className="mt-3 text-slate-300">team module foundation route.</p></section></main>
}


export const getServerSideProps = requirePageAuth();
