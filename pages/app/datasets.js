import { requirePageAuth } from '../../lib/ssrAuth';
import { useState } from 'react';
import PageShell from '../../components/design/PageShell';
import { fetchWithAuth } from '../../lib/clientAuth';

export default function DatasetsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  async function run(method = 'GET') {
    setError('');
    try {
      const payload = await fetchWithAuth('/api/datasets/land-intelligence', { method });
      setData(payload);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-semibold">Datasets</h1>
        <p className="mt-2 text-[#b5cde6]">Retrieve and refresh land intelligence dataset snapshots.</p>
        <div className="mt-4 flex gap-2">
          <button className="btn-primary" onClick={() => run('GET')}>Load</button>
          <button className="btn-secondary" onClick={() => run('POST')}>Refresh snapshot</button>
        </div>
        {error && <p className="mt-3 text-red-300">{error}</p>}
        {data && <pre className="glass-panel mt-4 overflow-auto p-3 text-xs">{JSON.stringify(data, null, 2)}</pre>}
      </section>
    </PageShell>
  );
}


export const getServerSideProps = requirePageAuth();
