import { useState } from 'react';
import PageShell from '../../../../components/design/PageShell';
import { fetchWithAuth } from '../../../../lib/clientAuth';
import { requirePageAuth } from '../../../../lib/ssrAuth';

export default function ProjectBillingPage({ projectId }) {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');

  async function init() {
    try {
      const data = await fetchWithAuth('/api/billing/initialize', {
        method: 'POST',
        body: JSON.stringify({ projectId, amount: 50000, callbackUrl: typeof window !== 'undefined' ? window.location.href : '' })
      });
      setResponse(data);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  return <PageShell><section className="mx-auto max-w-4xl px-6 py-12"><h1 className="text-3xl font-bold">Project billing</h1><button className="btn-primary mt-4" onClick={init}>Initialize payment</button>{error && <p className="mt-3 text-red-300">{error}</p>}{response && <pre className="glass-panel mt-4 p-3 text-xs">{JSON.stringify(response, null, 2)}</pre>}</section></PageShell>;
}

export const getServerSideProps = requirePageAuth(({ params }) => ({ projectId: params.projectId }));
