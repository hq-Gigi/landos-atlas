import { useEffect, useMemo, useState } from 'react';
import { requirePageAuth } from '../../lib/ssrAuth';
import PageShell from '../../components/design/PageShell';
import LandCommandMap from '../../components/design/LandCommandMap';
import { fetchWithAuth } from '../../lib/clientAuth';

const GOALS = ['MAXIMIZE_REVENUE', 'MAXIMIZE_MARGIN', 'BALANCED', 'PREMIUM', 'FAST_DEVELOPMENT'];

const ASSUMPTION_FIELDS = [
  ['landAcquisitionCost', 'Land acquisition cost'],
  ['targetSalePricePerPlot', 'Target sale price / plot'],
  ['infrastructureCostPerM2', 'Infrastructure cost / m²'],
  ['professionalFeePercent', 'Professional fee %'],
  ['contingencyPercent', 'Contingency %'],
  ['timelineMonths', 'Timeline months'],
  ['debtRatio', 'Debt ratio'],
  ['annualInterestRate', 'Annual interest rate %'],
  ['marketingCostPercent', 'Marketing/sales cost %']
];

function currency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function pct(value, decimals = 1) {
  return `${Number(value || 0).toFixed(decimals)}%`;
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
  const [rankingGoal, setRankingGoal] = useState('BALANCED');
  const [assumptions, setAssumptions] = useState({});

  const loadProjectState = async (projectId) => {
    if (!projectId) return;
    const payload = await fetchWithAuth(`/api/projects/${projectId}/state`);
    setState(payload);
    setBoundaryDraft(payload.boundary || []);
    setAssumptions(payload?.project?.feasibilityAssumptions?.[0]?.payload || {});
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
    } catch (err) { setError(err.message); } finally { setLoading(false); }
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
    try {
      await fetchWithAuth(`/api/projects/${activeProjectId}/boundary`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boundary: boundaryDraft }) });
      await fetchWithAuth(`/api/projects/${activeProjectId}/scenarios`, { method: 'POST' });
      await fetchWithAuth(`/api/projects/${activeProjectId}/feasibility`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assumptions, goal: rankingGoal }) });
      await loadProjectState(activeProjectId);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const generateScenarios = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      await fetchWithAuth(`/api/projects/${activeProjectId}/scenarios`, { method: 'POST' });
      await fetchWithAuth(`/api/projects/${activeProjectId}/feasibility`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assumptions, goal: rankingGoal }) });
      await loadProjectState(activeProjectId);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const recalculateFeasibility = async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      await fetchWithAuth(`/api/projects/${activeProjectId}/feasibility`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assumptions, goal: rankingGoal }) });
      await loadProjectState(activeProjectId);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const createProject = async () => {
    const trimmed = newProjectName.trim();
    if (!trimmed || !activeOrgId) return;
    setLoading(true);
    try {
      const project = await fetchWithAuth('/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orgId: activeOrgId, name: trimmed, goal: 'BALANCED', objective: 'BALANCED', boundary: boundaryDraft }) });
      setNewProjectName('');
      await loadProjects(activeOrgId);
      setActiveProjectId(project.id);
      await loadProjectState(project.id);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  const feasibilityRows = useMemo(() => {
    const reports = state?.project?.feasibilityReports || [];
    return reports.map((report) => {
      const scenario = scenarios.find((s) => s.id === report.payload?.scenarioId);
      return { scenarioId: report.payload?.scenarioId, name: scenario?.name || report.payload?.scenarioName, model: report.payload?.model || {} };
    }).sort((a, b) => (b.model.projectedProfit || 0) - (a.model.projectedProfit || 0));
  }, [state, scenarios]);

  const rankedRows = useMemo(() => {
    const rows = [...feasibilityRows];
    if (rankingGoal === 'MAXIMIZE_REVENUE') return rows.sort((a, b) => (b.model.estimatedGrossDevelopmentValue || 0) - (a.model.estimatedGrossDevelopmentValue || 0));
    if (rankingGoal === 'MAXIMIZE_MARGIN') return rows.sort((a, b) => (b.model.marginPercentage || 0) - (a.model.marginPercentage || 0));
    if (rankingGoal === 'FAST_DEVELOPMENT') return rows.sort((a, b) => (b.model.basicRoiProxy || 0) - (a.model.basicRoiProxy || 0));
    return rows.sort((a, b) => (b.model.projectedProfit || 0) - (a.model.projectedProfit || 0));
  }, [feasibilityRows, rankingGoal]);

  const recommended = rankedRows[0];
  const selectedFeasibility = rankedRows.find((row) => row.scenarioId === selectedScenario?.id)?.model || {};

  const comparisonRows = useMemo(() => scenarios.map((scenario) => {
    const row = rankedRows.find((item) => item.scenarioId === scenario.id);
    const model = row?.model || {};
    const estimatedRevenue = model.estimatedGrossDevelopmentValue || scenario.metrics?.revenue || 0;
    const estimatedMargin = Number(model.marginPercentage ?? ((scenario.metrics?.margin || 0) * 100));
    const plotCount = scenario.layout?.plotCount || model.totalPlotCount || 0;
    const avgLotSize = scenario.layout?.averagePlotSize || model.averagePlotSize || scenario.metrics?.averageLotSize || 0;
    const landUtilization = Number((scenario.metrics?.landUtilization || 0) * 100);
    return {
      id: scenario.id,
      name: scenario.name,
      plotCount,
      avgLotSize,
      landUtilization,
      estimatedRevenue,
      estimatedMargin
    };
  }), [scenarios, rankedRows]);

  return (
    <PageShell>
      <section className="mx-auto max-w-[1650px] px-4 pb-6 pt-4">
        <div className="glass-panel mb-3 flex items-center justify-between px-4 py-3"><div><h1 className="text-xl font-semibold">LANDOS ATLAS Workspace</h1><p className="text-xs text-[#a9c9e8]">Parcel → Layout → Feasibility → Investment intelligence.</p></div><div className="text-xs text-cyan-100">{me?.name || me?.email || 'Loading user...'}</div></div>
        {error ? <p className="mb-2 rounded border border-rose-300/35 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">{error}</p> : null}

        <div className="grid gap-3 xl:grid-cols-[260px_minmax(0,1fr)_380px]">
          <aside className="glass-panel p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Projects</p>
            <select className="mt-2 w-full rounded border border-white/20 bg-[#071523] p-2 text-sm" value={activeOrgId} onChange={(e) => { setActiveOrgId(e.target.value); loadProjects(e.target.value); }}>{(me?.memberships || []).map((m) => <option key={m.organizationId} value={m.organizationId}>{m.organization?.name || m.organizationId}</option>)}</select>
            <div className="mt-2 flex gap-2"><input className="w-full rounded border border-white/20 bg-[#071523] px-2 py-1 text-sm" placeholder="New project" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} /><button className="btn-secondary text-xs" onClick={createProject} type="button">Create</button></div>
            <div className="mt-3 space-y-1">{projects.map((project) => <button key={project.id} className={`w-full rounded border px-2 py-2 text-left text-sm ${activeProjectId === project.id ? 'border-cyan-300 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`} onClick={() => { setActiveProjectId(project.id); loadProjectState(project.id); }} type="button">{project.name}</button>)}</div>
            <button className="btn-primary mt-3 w-full text-xs" onClick={saveBoundary} type="button" disabled={loading || boundaryDraft.length < 3}>Analyze Parcel + Generate Scenarios</button>
            <button className="btn-primary mt-2 w-full text-xs" onClick={generateScenarios} type="button" disabled={loading || boundaryDraft.length < 3}>Rebuild Scenario Time Machine</button>
          </aside>

          <div className="glass-panel overflow-hidden">
            <div className="flex flex-wrap gap-2 border-b border-white/10 px-3 py-2">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedScenarioId(scenario.id)}
                  className={`rounded px-3 py-1 text-xs ${selectedScenario?.id === scenario.id ? 'bg-cyan-300 text-slate-900' : 'bg-slate-800 text-cyan-100'}`}
                >
                  {scenario.name}
                </button>
              ))}
            </div>
            <LandCommandMap className="h-[620px]" boundary={boundaryDraft} onBoundaryChange={setBoundaryDraft} onParcelMetricsChange={setParcelMetrics} scenario={selectedScenario} />
          </div>

          <aside className="glass-panel p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Feasibility workspace</p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">{ASSUMPTION_FIELDS.map(([key, label]) => <label key={key}>{label}<input className="mt-1 w-full rounded border border-white/15 bg-[#071523] px-2 py-1" value={assumptions[key] ?? ''} onChange={(e) => setAssumptions((prev) => ({ ...prev, [key]: Number(e.target.value) }))} /></label>)}</div>
            <div className="mt-2 flex items-center gap-2 text-xs"><label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(assumptions.financingEnabled)} onChange={(e) => setAssumptions((p) => ({ ...p, financingEnabled: e.target.checked }))} />Financing</label><label className="flex items-center gap-1"><input type="checkbox" checked={Boolean(assumptions.marketingEnabled)} onChange={(e) => setAssumptions((p) => ({ ...p, marketingEnabled: e.target.checked }))} />Marketing</label></div>
            <div className="mt-2 flex gap-2"><select className="w-full rounded border border-white/20 bg-[#071523] p-2 text-xs" value={rankingGoal} onChange={(e) => setRankingGoal(e.target.value)}>{GOALS.map((goal) => <option key={goal} value={goal}>{goal}</option>)}</select><button className="btn-primary text-xs" type="button" onClick={recalculateFeasibility}>Recalculate</button></div>

            {recommended ? <div className="mt-3 rounded border border-emerald-300/40 bg-emerald-500/10 p-2 text-xs"><p className="font-semibold">Recommended scenario: {recommended.name}</p><p>Revenue {currency(recommended.model.estimatedGrossDevelopmentValue)} · Cost {currency(recommended.model.estimatedTotalCost)} · Profit {currency(recommended.model.projectedProfit)} · Margin {Number(recommended.model.marginPercentage || 0).toFixed(1)}%</p></div> : null}
            {selectedScenario ? <div className="mt-3 rounded border border-cyan-300/30 bg-cyan-500/10 p-2 text-xs"><p className="font-semibold">Selected scenario overlay: {selectedScenario.name}</p><p>Plots {selectedScenario.layout?.plotCount || 0} · Avg lot {Math.round(selectedScenario.layout?.averagePlotSize || 0).toLocaleString()} m² · Utilization {Math.round((selectedScenario.metrics?.landUtilization || 0) * 100)}%</p><p>Est. revenue {currency(selectedFeasibility.estimatedGrossDevelopmentValue || selectedScenario.metrics?.revenue)} · Profit margin {Number(selectedFeasibility.marginPercentage ?? (selectedScenario.metrics?.margin || 0) * 100).toFixed(1)}%</p></div> : null}
            <div className="mt-3 space-y-2 text-xs"><p>Parcel area: {Math.round(parcelMetrics.area).toLocaleString()} sqm</p><p>Perimeter: {Math.round(parcelMetrics.perimeter).toLocaleString()} m</p><p>Frontage: {Math.round(parcelMetrics.frontage).toLocaleString()} m</p></div>
          </aside>
        </div>


        {selectedScenario ? <div className="glass-panel mt-3 p-3 text-xs">
          <p className="uppercase tracking-[0.18em] text-cyan-100/80">Scenario decision snapshot · {selectedScenario.name}</p>
          <div className="mt-2 grid gap-2 md:grid-cols-5">
            <div className="rounded border border-white/10 bg-white/5 p-2">Plots<br /><span className="text-sm font-semibold">{selectedScenario.layout?.plotCount || 0}</span></div>
            <div className="rounded border border-white/10 bg-white/5 p-2">Avg lot size<br /><span className="text-sm font-semibold">{Math.round(selectedScenario.layout?.averagePlotSize || 0).toLocaleString()} m²</span></div>
            <div className="rounded border border-white/10 bg-white/5 p-2">Land utilization<br /><span className="text-sm font-semibold">{Math.round((selectedScenario.metrics?.landUtilization || 0) * 100)}%</span></div>
            <div className="rounded border border-white/10 bg-white/5 p-2">Estimated revenue<br /><span className="text-sm font-semibold">{currency(selectedFeasibility.estimatedGrossDevelopmentValue || selectedScenario.metrics?.revenue)}</span></div>
            <div className="rounded border border-white/10 bg-white/5 p-2">Profit margin<br /><span className="text-sm font-semibold">{pct(selectedFeasibility.marginPercentage ?? ((selectedScenario.metrics?.margin || 0) * 100))}</span></div>
          </div>
        </div> : null}

        <div className="glass-panel mt-3 p-3">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Scenario feasibility cards</p>
          <div className="mt-2 grid gap-2 md:grid-cols-3">{rankedRows.map((row) => <button key={row.scenarioId} type="button" onClick={() => setSelectedScenarioId(row.scenarioId)} className={`rounded border p-3 text-left ${selectedScenarioId === row.scenarioId ? 'border-cyan-300 bg-cyan-500/10' : 'border-white/10 bg-white/5'}`}><p className="font-semibold">{row.name}</p><p className="text-xs">Plots: {row.model.totalPlotCount || 0} · Efficiency: {Number(row.model.efficiency || 0).toFixed(1)}%</p><p className="text-xs">Revenue {currency(row.model.estimatedGrossDevelopmentValue)}</p><p className="text-xs">Profit {currency(row.model.projectedProfit)} · Margin {Number(row.model.marginPercentage || 0).toFixed(1)}%</p><p className="mt-1 text-[11px] text-[#9dc7e8]">{row.model.investmentSummary?.positioning}</p></button>)}</div>
        </div>

        <div className="glass-panel mt-3 p-3 overflow-x-auto">
          <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/80">Scenario time machine comparison metrics</p>
          <table className="mt-2 min-w-full text-left text-xs"><thead><tr className="border-b border-white/10"><th className="p-2">Scenario</th><th>Plot count</th><th>Avg lot size</th><th>Land utilization</th><th>Estimated revenue</th><th>Estimated profit margin</th><th>Revenue vs Balanced</th></tr></thead><tbody>{comparisonRows.map((row) => { const baseline = comparisonRows.find((item) => item.name === 'BALANCED') || comparisonRows[0] || { estimatedRevenue: 0 }; const delta = row.estimatedRevenue - (baseline.estimatedRevenue || 0); return <tr key={row.id} className="border-b border-white/5 cursor-pointer" onClick={() => setSelectedScenarioId(row.id)}><td className="p-2">{row.name}</td><td>{row.plotCount}</td><td>{Math.round(row.avgLotSize).toLocaleString()} m²</td><td>{Math.round(row.landUtilization)}%</td><td>{currency(row.estimatedRevenue)}</td><td>{pct(row.estimatedMargin)}</td><td className={delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}>{delta >= 0 ? '+' : ''}{currency(delta)}</td></tr>; })}</tbody></table>
        </div>
      </section>
    </PageShell>
  );
}

export const getServerSideProps = requirePageAuth();
