import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const LandCommandMap = dynamic(() => import('./LandCommandMap'), { ssr: false });

const tabConfig = [
  { slug: 'overview', label: 'Overview' },
  { slug: 'map-boundary', label: 'Map & Boundary' },
  { slug: 'land-profile', label: 'Land Profile' },
  { slug: 'scenarios', label: 'Scenarios' },
  { slug: 'optimization', label: 'Optimization Scores' },
  { slug: 'feasibility', label: 'Feasibility' },
  { slug: 'reports', label: 'Reports & Exports' },
  { slug: 'collaboration', label: 'Collaboration' },
  { slug: 'activity', label: 'Activity' },
  { slug: 'billing', label: 'Billing' }
];

const sectionCardCopy = {
  overview: 'Cross-functional command view of parcel geometry, layout scenarios, financial outputs, and live project signals.',
  'map-boundary': 'Edit and persist parcel boundaries with deterministic geometry validation, area metrics, and frontage intelligence.',
  'land-profile': 'Land profile assumptions drive deterministic scenario generation, scoring logic, and feasibility calculations.',
  scenarios: 'Scenario outputs are generated deterministically from boundary and land profile inputs, then persisted for comparison.',
  optimization: 'Objective-aware ranking scores every scenario across yield, frontage, access, and delivery efficiency.',
  feasibility: 'Feasibility summaries run on editable assumptions and stay linked to each saved scenario option.',
  reports: 'Export packs draw directly from persisted project, scenario, score, financial, and recommendation records.',
  collaboration: 'Discussion threads and delivery tasks persist in one coordination fabric for dev, investor, and planning teams.',
  activity: 'Every key event is logged for investor governance, operational accountability, and audit traceability.',
  billing: 'Payment and subscription status gates premium exports and unlocks verified delivery workflows.'
};

function parseBoundaryInput(raw) {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(',').map((v) => Number(v.trim())))
    .filter((pair) => pair.length === 2 && Number.isFinite(pair[0]) && Number.isFinite(pair[1]))
    .map(([lng, lat]) => ({ lng, lat }));
}

function boundaryToInput(boundary) {
  if (!Array.isArray(boundary)) return '';
  return boundary
    .map((point) => {
      if (Array.isArray(point)) return `${point[0]}, ${point[1]}`;
      return `${point?.lng}, ${point?.lat}`;
    })
    .join('\n');
}



export default function ProjectWorkspace({ projectId, section }) {
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [boundaryInput, setBoundaryInput] = useState('');
  const [zoning, setZoning] = useState('');
  const [assumptionsInput, setAssumptionsInput] = useState('{\n  "salePricePerPlot": 110000\n}');
  const [commentBody, setCommentBody] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [selectedScenarioId, setSelectedScenarioId] = useState('');
  const [generatorConfig, setGeneratorConfig] = useState({ targetPlotSize: 500, roadWidth: 9, objective: 'BALANCED' });

  const loadState = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/state`, { credentials: 'same-origin' });
      const data = await response.json();
      setState(data);
      setError('');
      setBoundaryInput(boundaryToInput(data.boundary));
      setZoning(data?.project?.landProfile?.zoning || '');
      setAssumptionsInput(JSON.stringify(data?.project?.landProfile?.assumptions || { salePricePerPlot: 110000 }, null, 2));
      setGeneratorConfig({
        targetPlotSize: Number(data?.project?.landProfile?.assumptions?.targetPlotSize || 500),
        roadWidth: Number(data?.project?.landProfile?.assumptions?.roadWidth || 9),
        objective: data?.project?.objective || 'BALANCED'
      });
    } catch {
      setError('Unable to load project intelligence state.');
      setState(null);
    }
  };

  useEffect(() => {
    if (!projectId) return;
    loadState();
  }, [projectId]);

  const topScenario = useMemo(() => {
    const scenarios = state?.scenarios || [];
    return [...scenarios].sort((a, b) => b.optimizationScore - a.optimizationScore)[0];
  }, [state]);

  const selectedScenario = useMemo(() => {
    const scenarios = state?.scenarios || [];
    if (!scenarios.length) return null;
    return scenarios.find((scenario) => scenario.id === selectedScenarioId) || topScenario || scenarios[0];
  }, [state, selectedScenarioId, topScenario]);


  const boundaryMetrics = state?.project?.boundaries?.[0];
  const feasibilityCount = state?.project?.feasibilityReports?.length || 0;
  const exportCount = state?.project?.exports?.length || 0;
  const paidForExports = (state?.project?.payments || []).some((p) => p.status === 'SUCCESS');

  const saveBoundary = async () => {
    const boundary = parseBoundaryInput(boundaryInput);
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/projects/${projectId}/boundary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ boundary })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Boundary save failed');
      await loadState();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveLandProfile = async () => {
    setSaving(true);
    setError('');
    try {
      const assumptions = JSON.parse(assumptionsInput || '{}');
      const res = await fetch(`/api/projects/${projectId}/land-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ zoning, assumptions: { ...assumptions, objective: assumptions.objective || state?.project?.objective || 'BALANCED', goal: assumptions.goal || state?.project?.goal || 'BALANCED' }, constraints: {}, strategy: { objective: assumptions.objective || state?.project?.objective || 'BALANCED', goal: assumptions.goal || state?.project?.goal || 'BALANCED' } })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Land profile save failed');
      await loadState();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const postCollab = async (type) => {
    setSaving(true);
    setError('');
    try {
      const endpoint = type === 'task' ? 'tasks' : 'comments';
      const payload = type === 'task'
        ? { title: taskTitle, dueDate: taskDueDate || null }
        : { body: commentBody, scenarioId: topScenario?.id || null };
      const res = await fetch(`/api/projects/${projectId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Collaboration action failed');
      setCommentBody('');
      setTaskTitle('');
      setTaskDueDate('');
      await loadState();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateLayout = async () => {
    setSaving(true);
    setError('');
    try {
      const assumptions = JSON.parse(assumptionsInput || '{}');
      const payload = {
        objective: generatorConfig.objective,
        targetPlotSize: Number(generatorConfig.targetPlotSize) || 500,
        roadWidth: Number(generatorConfig.roadWidth) || 9,
        assumptions: { ...assumptions, targetPlotSize: Number(generatorConfig.targetPlotSize) || 500, roadWidth: Number(generatorConfig.roadWidth) || 9 }
      };
      const res = await fetch(`/api/projects/${projectId}/scenarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scenario generation failed');
      await loadState();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const generateExport = async (type) => {
    setExportStatus(`Generating ${type} export...`);
    try {
      const res = await fetch(`/api/projects/${projectId}/export/${type.toLowerCase()}`, {
        method: 'POST',
        credentials: 'same-origin'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Export failed');
      setExportStatus(`${type} ready: ${data.url}`);
      await loadState();
    } catch (err) {
      setExportStatus(err.message);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <p className="eyebrow">Land development command center</p>
      <h1 className="mt-4 text-3xl font-semibold lg:text-5xl">{state?.project?.name || `Project ${projectId}`} · Map intelligence workspace</h1>
      <p className="mt-3 max-w-4xl text-[#b5cde6]">{sectionCardCopy[section] || sectionCardCopy.overview}</p>
      {!!error && <p className="mt-4 rounded-xl border border-rose-300/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}

      <div className="mt-6 grid gap-3 rounded-2xl border border-cyan-300/25 bg-[#061523]/90 p-4 md:grid-cols-4">
        <div><p className="text-[11px] uppercase tracking-[0.15em] text-cyan-100/70">Boundary area</p><p className="mt-1 text-xl font-semibold text-cyan-200">{Math.round(boundaryMetrics?.area || 0).toLocaleString()} sqm</p></div>
        <div><p className="text-[11px] uppercase tracking-[0.15em] text-cyan-100/70">Frontage length</p><p className="mt-1 text-xl font-semibold text-cyan-200">{Math.round(boundaryMetrics?.frontage || 0).toLocaleString()} m</p></div>
        <div><p className="text-[11px] uppercase tracking-[0.15em] text-cyan-100/70">Top scenario</p><p className="mt-1 text-xl font-semibold text-cyan-200">{topScenario?.name || 'N/A'}</p></div>
        <div><p className="text-[11px] uppercase tracking-[0.15em] text-cyan-100/70">Feasibility reports</p><p className="mt-1 text-xl font-semibold text-cyan-200">{feasibilityCount}</p></div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabConfig.map((tab) => (
          <Link
            key={tab.slug}
            className={`glass-panel px-3 py-2 text-sm ${section === tab.slug ? 'ring-1 ring-cyan-300/50' : ''}`}
            href={tab.slug === 'overview' ? `/app/projects/${projectId}` : `/app/projects/${projectId}/${tab.slug}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-3">
          <div className="glass-panel p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Project controls</p>
            <p className="mt-2 text-sm text-[#b5cde6]">Projects, parcel layers, generator objectives, and feasibility assumptions feed the central land engine.</p>
            <div className="mt-3 space-y-2 text-sm text-[#d5e8fa]">
              <p>• Parcel layers active: {state?.project?.boundaries?.length || 0}</p>
              <p>• Scenario objective: {state?.project?.objective || 'BALANCED'}</p>
              <p>• Assumption profile: {state?.project?.landProfile?.zoning || 'Not set'}</p>
            </div>
          </div>
          <div className="glass-panel p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Boundary geometry</p>
            <p className="mt-2 text-sm text-[#b5cde6]">Area {Math.round(boundaryMetrics?.area || 0).toLocaleString()} sqm · Perimeter {Math.round(boundaryMetrics?.perimeter || 0).toLocaleString()} m · Frontage {Math.round(boundaryMetrics?.frontage || 0).toLocaleString()} m</p>
          </div>
        </aside>

        <div className="glass-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.18em] text-cyan-100/80">
            <span>Land engine map workspace</span>
            <span>search · draw · edit · overlay</span>
          </div>
          <LandCommandMap
            className="h-[560px] w-full lg:h-[720px]"
            boundary={state?.boundary || []}
            scenario={selectedScenario}
            onBoundaryChange={(next) => {
              setBoundaryInput(boundaryToInput(next));
              setState((current) => (current ? { ...current, boundary: next } : current));
            }}
          />
        </div>

        <aside className="space-y-3">
          <div className="glass-panel p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Decision intelligence</p>
            <p className="mt-2 text-sm text-[#b5cde6]">Plot count {(topScenario?.layout?.parcelCount || 0).toLocaleString()} · Yield {(topScenario?.metrics?.yieldUnits || 0).toLocaleString()}</p>
            <p className="mt-1 text-sm text-[#b5cde6]">Revenue {(topScenario?.metrics?.revenue || 0).toLocaleString()} · Cost {(topScenario?.metrics?.cost || 0).toLocaleString()}</p>
            <p className="mt-1 text-sm text-[#b5cde6]">Margin {topScenario?.metrics?.margin || '0%'} · Optimization {topScenario?.optimizationScore || 0}</p>
            <p className="mt-3 text-xs text-cyan-100/80">AI recommendation: {topScenario ? `Prioritize ${topScenario.name} for highest ranked feasibility envelope.` : 'Generate scenarios to receive recommendation.'}</p>
          </div>
        </aside>
      </div>

      <div className="mt-4 glass-panel p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Scenario comparison engine</h3>
          <span className="text-xs text-[#9abbd8]">Scenario A · B · C</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {(state?.scenarios || []).slice(0, 3).map((scenario, index) => (
            <div key={scenario.id} className="rounded-xl border border-cyan-200/20 bg-[#061824] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-100/70">Scenario {String.fromCharCode(65 + index)}</p>
              <p className="mt-1 font-semibold">{scenario.name}</p>
              <p className="mt-1 text-sm text-[#b5cde6]">Yield {scenario.metrics.yieldUnits} · Revenue {scenario.metrics.revenue.toLocaleString()}</p>
              <p className="text-sm text-[#b5cde6]">Cost {scenario.metrics.cost.toLocaleString()} · Margin {scenario.metrics.margin}</p>
            </div>
          ))}
        </div>
      </div>

      {section === 'map-boundary' && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Boundary coordinate editor</h3>
            <p className="mt-2 text-sm text-[#b5cde6]">Enter one coordinate pair per line: <code className="text-cyan-200">x, y</code>. Saved geometry updates project metrics and scenario model inputs.</p>
            <textarea className="mt-3 min-h-[180px] w-full rounded-xl border border-white/10 bg-[#061320] p-3 text-sm text-[#d3e8fa]" value={boundaryInput} onChange={(e) => setBoundaryInput(e.target.value)} />
            <button className="btn-primary mt-3" disabled={saving} onClick={saveBoundary}>{saving ? 'Saving...' : 'Save boundary geometry'}</button>
          </div>
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Geometry validation + frontage intelligence</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#c7dff5]">
              <li>• Polygon must contain at least 3 valid points.</li>
              <li>• Perimeter and area are recomputed from persisted coordinates.</li>
              <li>• Frontage is derived from boundary edges for layout suitability.</li>
            </ul>
            </div>
        </div>
      )}

      {section === 'land-profile' && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Land profile assumptions</h3>
            <label className="mt-3 block text-xs uppercase tracking-[0.16em] text-cyan-100/70">Zoning profile</label>
            <input className="mt-2 w-full rounded-lg border border-white/15 bg-[#071523] px-3 py-2" value={zoning} onChange={(e) => setZoning(e.target.value)} placeholder="Residential mixed-use" />
            <label className="mt-3 block text-xs uppercase tracking-[0.16em] text-cyan-100/70">Assumptions JSON</label>
            <textarea className="mt-2 min-h-[170px] w-full rounded-xl border border-white/10 bg-[#061320] p-3 text-sm text-[#d3e8fa]" value={assumptionsInput} onChange={(e) => setAssumptionsInput(e.target.value)} />
            <button className="btn-primary mt-3" disabled={saving} onClick={saveLandProfile}>{saving ? 'Saving...' : 'Save land profile'}</button>
          </div>
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Current profile influence</h3>
            <p className="mt-2 text-sm text-[#b5cde6]">These assumptions directly influence scenario viability, score ranking, and feasibility confidence.</p>
            <pre className="mt-4 rounded-xl border border-cyan-200/20 bg-[#071827] p-3 text-xs text-cyan-100/90">{JSON.stringify(state?.project?.landProfile || {}, null, 2)}</pre>
          </div>
        </div>
      )}

      {(section === 'scenarios' || section === 'optimization' || section === 'feasibility') && (
        <div className="mt-8 space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Land Subdivision Engine</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-4">
              <label className="text-xs">Scenario Objective
                <select className="mt-1 w-full rounded-lg border border-white/15 bg-[#071523] px-2 py-2" value={generatorConfig.objective} onChange={(e) => setGeneratorConfig((prev) => ({ ...prev, objective: e.target.value }))}>
                  <option value="MAX_YIELD">MAX_YIELD</option>
                  <option value="BALANCED">BALANCED</option>
                  <option value="PREMIUM">PREMIUM</option>
                  <option value="FAST_DEVELOPMENT">FAST_DEVELOPMENT</option>
                </select>
              </label>
              <label className="text-xs">Plot Size Selector (m²)
                <input className="mt-1 w-full rounded-lg border border-white/15 bg-[#071523] px-2 py-2" type="number" min="120" value={generatorConfig.targetPlotSize} onChange={(e) => setGeneratorConfig((prev) => ({ ...prev, targetPlotSize: Number(e.target.value) }))} />
              </label>
              <label className="text-xs">Road Width Selector (m)
                <input className="mt-1 w-full rounded-lg border border-white/15 bg-[#071523] px-2 py-2" type="number" min="4" value={generatorConfig.roadWidth} onChange={(e) => setGeneratorConfig((prev) => ({ ...prev, roadWidth: Number(e.target.value) }))} />
              </label>
              <div className="flex items-end">
                <button className="btn-primary w-full" disabled={saving} onClick={generateLayout}>{saving ? 'Generating...' : 'Generate Layout'}</button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {(state?.scenarios || []).slice(0, 3).map((scenario) => (
              <div key={scenario.id} className={`glass-panel p-4 ${selectedScenario?.id === scenario.id ? 'ring-1 ring-cyan-300/50' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{scenario.name}</h3>
                  <button className="text-xs text-cyan-100" onClick={() => setSelectedScenarioId(scenario.id)}>View</button>
                </div>
                <p className="mt-2 text-sm text-[#b5cde6]">{scenario.layout.plotCount || scenario.layout.parcelCount} plots · avg {Math.round(scenario.layout.averagePlotSize || scenario.metrics.averagePlotSize || 0).toLocaleString()} m²</p>
                <p className="mt-1 text-xs text-cyan-100/80">land utilization {Math.round((scenario.metrics.landUtilization || 0) * 100)}% · road coverage {Math.round((scenario.metrics.roadCoverage || 0) * 100)}%</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-cyan-100/70">layout efficiency {scenario.metrics.layoutEfficiency || 0} · margin {scenario.metrics.margin}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === 'collaboration' && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Project discussion</h3>
            <textarea className="mt-3 min-h-[120px] w-full rounded-xl border border-white/10 bg-[#061320] p-3 text-sm" value={commentBody} onChange={(e) => setCommentBody(e.target.value)} placeholder="Add a scenario-specific developer/investor comment..." />
            <button className="btn-primary mt-3" disabled={saving || !commentBody.trim()} onClick={() => postCollab('comment')}>Post comment</button>
            <div className="mt-4 space-y-2">
              {(state?.project?.comments || []).slice(0, 6).map((comment) => <div key={comment.id} className="rounded-lg border border-cyan-200/15 bg-[#071827] p-3 text-sm">{comment.body}</div>)}
            </div>
          </div>
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Delivery tasks</h3>
            <input className="mt-3 w-full rounded-lg border border-white/15 bg-[#071523] px-3 py-2" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Task title" />
            <input type="date" className="mt-2 w-full rounded-lg border border-white/15 bg-[#071523] px-3 py-2" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} />
            <button className="btn-primary mt-3" disabled={saving || !taskTitle.trim()} onClick={() => postCollab('task')}>Create task</button>
            <div className="mt-4 space-y-2">
              {(state?.project?.tasks || []).slice(0, 6).map((task) => <div key={task.id} className="rounded-lg border border-cyan-200/15 bg-[#071827] p-3 text-sm">{task.title} · {task.status}</div>)}
            </div>
          </div>
        </div>
      )}

      {section === 'activity' && (
        <div className="mt-8 glass-panel p-4">
          <h3 className="text-lg font-semibold">Project activity feed</h3>
          <div className="mt-4 space-y-2">
            {(state?.project?.activityLogs || []).slice(0, 12).map((item) => (
              <div key={item.id} className="rounded-lg border border-cyan-200/15 bg-[#071827] p-3 text-sm text-[#d2e7fa]">{new Date(item.createdAt).toLocaleString()} · {item.action}</div>
            ))}
          </div>
        </div>
      )}

      {section === 'reports' && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Export generation</h3>
            <p className="mt-2 text-sm text-[#b5cde6]">{paidForExports ? 'Payment verified. Generate project exports.' : 'Exports are locked until project billing is verified.'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="btn-secondary" disabled={!paidForExports} onClick={() => generateExport('PDF')}>Generate PDF report</button>
              <button className="btn-secondary" disabled={!paidForExports} onClick={() => generateExport('PNG')}>Generate PNG layout</button>
              <button className="btn-secondary" disabled={!paidForExports} onClick={() => generateExport('SCR')}>Generate AutoCAD SCR</button>
            </div>
            {!!exportStatus && <p className="mt-3 text-sm text-cyan-100">{exportStatus}</p>}
          </div>
          <div className="glass-panel p-4">
            <h3 className="text-lg font-semibold">Recent exports</h3>
            <div className="mt-3 space-y-2">
              {(state?.project?.exports || []).slice(0, 8).map((item) => (
                <a key={item.id} href={item.url} className="block rounded-lg border border-cyan-200/15 bg-[#071827] p-3 text-sm text-cyan-100" target="_blank" rel="noreferrer">{item.type} · {item.status} · {new Date(item.createdAt).toLocaleString()}</a>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
