import { useEffect, useMemo, useState } from 'react';
import { requirePageAuth } from '../../lib/ssrAuth';
import PageShell from '../../components/design/PageShell';
import LandCommandMap from '../../components/design/LandCommandMap';
import { fetchWithAuth } from '../../lib/clientAuth';

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
}

export default function AppWorkspace() {
  const [me, setMe] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeOrgId, setActiveOrgId] = useState('');
  const [activeProjectId, setActiveProjectId] = useState('');
  const [state, setState] = useState(null);
  const [boundaryDraft, setBoundaryDraft] = useState([]);
  const [parcelMetrics, setParcelMetrics] = useState({ area: 0, perimeter: 0, frontage: 0 });
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadProjectState = async (projectId) => {
    if (!projectId) return;
    const payload = await fetchWithAuth(`/api/projects/${projectId}/state`);
    setState(payload);
    setBoundaryDraft(payload.boundary || []);
    const topScenario = payload.scenarios?.[0]?.id || '';
    setSelectedScenarioId((prev) => prev || topScenario);
  };

  const loadProjects = async (orgId) => {
    if (!orgId) return;
    setLoading(true);
    setError('');
    try {
      const list = await fetchWithAuth(`/api/projects?orgId=${orgId}`);
      setProjects(list);
      const nextProjectId = list[0]?.id || '';
      setActiveProjectId(nextProjectId);
      if (nextProjectId) await loadProjectState(nextProjectId);
      else setState(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithAuth('/api/auth/me').then((payload) => {
      setMe(payload);
      const firstOrg = payload.memberships?.[0]?.organizationId || '';
      setActiveOrgId(firstOrg);
      if (firstOrg) loadProjects(firstOrg);
    }).catch((err) => setError(err.message));
  }, []);

  const scenarios = state?.scenarios || [];
  const selectedScenario = scenarios.find((item) => item.id === selectedScenarioId) || scenarios[0] || null;

  const saveBoundary = async () => {
    if (!activeProjectId || boundaryDraft.length < 3) return;
    setLoading(true);
    setError('');
    try {
      await fetchWithAuth(`/api/projects/${activeProjectId}/boundary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ boundary: boundaryDraft })
      });
      await loadProjectState(activeProjectId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateScenarios = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    setError('');
    try {
      await fetchWithAuth(`/api/projects/${activeProjectId}/scenarios`, { method: 'POST' });
      await loadProjectState(activeProjectId);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async () => {
    const trimmed = newProjectName.trim();
    if (!trimmed || !activeOrgId) return;
    setLoading(true);
    setError('');
    try {
      const project = await fetchWithAuth('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId: activeOrgId, name: trimmed, goal: 'BALANCED', objective: 'BALANCED', boundary: boundaryDraft })
      });
      setNewProjectName('');
      await loadProjects(activeOrgId);
      setActiveProjectId(project.id);
      await loadProjectState(project.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const feasibilityByScenario = useMemo(() => {
    const reports = state?.project?.feasibilityReports || [];
    return reports.reduce((acc, report) => {
      const scenarioId = report.payload?.scenarioId;
      if (scenarioId) acc[scenarioId] = report.payload?.model || {};
      return acc;
    }, {});
  }, [state]);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1600px] px-4 pb-6 pt-4">
        <div className="glass-panel mb-3 flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-semibold">LANDOS ATLAS Workspace</h1>
            <p className="text-xs text-[#a9c9e8]">Map-first land intelligence for parcel design, scenarios, and feasibility.</p>
          </div>
          <div className="text-xs text-cyan-100">{me?.name || me?.email || 'Loading user...'}</div>
        </div>

        {error ? <p className="mb-2 rounded border border-rose-300/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{error}</p> : null}

        <div className="grid gap-3 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="glass-panel p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Projects</p>
            <select className="mt-2 w-full rounded border border-white/20 bg-[#071523] p-2 text-sm" value={activeOrgId} onChange={(e) => { setActiveOrgId(e.target.value); loadProjects(e.target.value); }}>
              {(me?.memberships || []).map((m) => <option key={m.organizationId} value={m.organizationId}>{m.organization?.name || m.organizationId}</option>)}
            </select>
            <div className="mt-2 flex gap-2">
              <input className="w-full rounded border border-white/20 bg-[#071523] px-2 py-1 text-sm" placeholder="New project" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
              <button className="btn-secondary text-xs" onClick={createProject} type="button">Create</button>
            </div>
            <div className="mt-3 space-y-1">
              {projects.map((project) => (
                <button key={project.id} className={`w-full rounded border px-2 py-2 text-left text-sm ${activeProjectId === project.id ? 'border-cyan-300 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`} onClick={() => { setActiveProjectId(project.id); loadProjectState(project.id); }} type="button">
                  {project.name}
                </button>
              ))}
            </div>
            <button className="btn-primary mt-3 w-full text-xs" onClick={saveBoundary} type="button" disabled={loading || boundaryDraft.length < 3}>Save Parcel Boundary</button>
            <button className="btn-primary mt-2 w-full text-xs" onClick={generateScenarios} type="button" disabled={loading || boundaryDraft.length < 3}>Generate Development Scenarios</button>
          </aside>

          <div className="glass-panel overflow-hidden">
            <LandCommandMap
              className="h-[620px]"
              boundary={boundaryDraft}
              onBoundaryChange={setBoundaryDraft}
              onParcelMetricsChange={setParcelMetrics}
              scenario={selectedScenario}
            />
          </div>

          <aside className="glass-panel p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Parcel analysis</p>
            <div className="mt-2 space-y-2 text-sm">
              <p>Area: <span className="text-cyan-200">{Math.round(parcelMetrics.area).toLocaleString()} sqm</span></p>
              <p>Perimeter: <span className="text-cyan-200">{Math.round(parcelMetrics.perimeter).toLocaleString()} m</span></p>
              <p>Frontage: <span className="text-cyan-200">{Math.round(parcelMetrics.frontage).toLocaleString()} m</span></p>
            </div>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-cyan-100/80">Scenario analysis</p>
            {selectedScenario ? (
              <div className="mt-2 space-y-1 text-sm">
                <p>Road efficiency: {Math.round((selectedScenario.layout?.roadNetwork?.efficiency || 0) * 100)}%</p>
                <p>Plot grids: {selectedScenario.layout?.plotGrid?.length || 0}</p>
                <p>Lot count: {selectedScenario.layout?.lotCount || 0}</p>
                <p>Avg lot size: {Math.round(selectedScenario.layout?.lotSizes?.average || 0)} sqm</p>
              </div>
            ) : <p className="mt-2 text-sm text-[#a7c4e0]">Generate scenarios to view metrics.</p>}
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-cyan-100/80">Feasibility</p>
            {selectedScenario ? (
              <div className="mt-2 space-y-1 text-sm">
                <p>Projected revenue: {currency(feasibilityByScenario[selectedScenario.id]?.revenue || selectedScenario.metrics?.revenue)}</p>
                <p>Development cost: {currency(feasibilityByScenario[selectedScenario.id]?.developmentCost || selectedScenario.metrics?.cost)}</p>
                <p>Profit margin: {Math.round((feasibilityByScenario[selectedScenario.id]?.margin || selectedScenario.metrics?.margin || 0) * 100)}%</p>
                <p>ROI: {Number(feasibilityByScenario[selectedScenario.id]?.roi || selectedScenario.metrics?.roi || 0).toFixed(2)}%</p>
              </div>
            ) : <p className="mt-2 text-sm text-[#a7c4e0]">No feasibility results yet.</p>}
          </aside>
        </div>

        <div className="glass-panel mt-3 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Scenario comparison</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {scenarios.map((scenario) => (
              <button key={scenario.id} className={`rounded border p-3 text-left ${selectedScenario?.id === scenario.id ? 'border-cyan-300 bg-cyan-500/10' : 'border-white/15 bg-white/5'}`} onClick={() => setSelectedScenarioId(scenario.id)} type="button">
                <p className="font-semibold">{scenario.name}</p>
                <p className="text-xs text-[#a9c9e8]">Lots: {scenario.layout?.lotCount || 0} · ROI: {Number(scenario.metrics?.roi || 0).toFixed(1)}%</p>
              </button>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export const getServerSideProps = requirePageAuth();
