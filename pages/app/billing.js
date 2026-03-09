import { requirePageAuth } from '../../lib/ssrAuth';
import { useState } from 'react';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth } from '../../lib/clientAuth';

export default function Billing() {
  const [projectId, setProjectId] = useState('');
  const [amount, setAmount] = useState('50000');
  const [payment, setPayment] = useState(null);
  const [projectState, setProjectState] = useState(null);
  const [error, setError] = useState('');

  async function start() {
    setError('');
    try {
      const data = await fetchWithAuth('/api/billing/initialize', {
        method: 'POST',
        body: JSON.stringify({ projectId, amount: Number(amount), callbackUrl: typeof window !== 'undefined' ? window.location.href : '' })
      });
      setPayment(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function verify() {
    setError('');
    if (!payment?.reference) return;
    try {
      const res = await fetch(`/api/billing/verify?reference=${payment.reference}`);
      setPayment(await res.json());
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadProject() {
    setError('');
    try {
      const state = await fetchWithAuth(`/api/projects/${projectId}`);
      setProjectState(state);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-4xl font-semibold">Billing and access control</h1>
        <p className="mt-2 text-[#b5cde6]">Initialize payments, verify status, and confirm billing history for a project.</p>
        <div className="glass-panel mt-4 grid gap-3 p-4 md:grid-cols-2">
          <input className="rounded bg-[#09111c] px-3 py-2" placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
          <input className="rounded bg-[#09111c] px-3 py-2" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button className="btn-primary" onClick={start}>Initialize payment</button>
          <button className="btn-secondary" onClick={verify}>Verify payment</button>
          <button className="btn-secondary" onClick={loadProject}>Load billing history</button>
        </div>
        {error && <p className="mt-3 text-red-300">{error}</p>}
        {payment && <pre className="glass-panel mt-4 overflow-auto p-3 text-xs">{JSON.stringify(payment, null, 2)}</pre>}
        {projectState?.project?.payments?.length > 0 && <pre className="glass-panel mt-4 overflow-auto p-3 text-xs">{JSON.stringify(projectState.project.payments, null, 2)}</pre>}
      </section>
    </PageShell>
  );
}


export const getServerSideProps = requirePageAuth();
