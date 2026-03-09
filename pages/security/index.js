import Head from 'next/head';
import NavBar from '../../components/NavBar';

export default function SecurityPage() {
  return <><Head><title>LandOS Atlas Security</title></Head><main className="min-h-screen bg-slate-950 text-white"><NavBar /><section className="mx-auto max-w-5xl px-6 py-20"><h1 className="text-4xl font-bold">Security & Trust</h1><ul className="mt-6 space-y-2 text-slate-300"><li>• Server-side key management for AI and payment providers.</li><li>• Verified Paystack webhooks before unlock state changes.</li><li>• Role-based project access enforcement for all protected APIs.</li><li>• Persisted activity logs for collaborative auditability.</li></ul></section></main></>;
}
