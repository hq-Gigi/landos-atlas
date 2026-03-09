import { prisma } from '../../../lib/prisma';
import { enforceRateLimit, requireProjectAccess } from '../../../lib/apiGuard';
import { getProjectState, logActivity } from '../../../lib/platformStore';

function parseStructured(content) {
  try {
    const parsed = JSON.parse(content);
    if (parsed?.developerSummary && parsed?.investorMemo && parsed?.boardSummary && parsed?.projectInsights) return parsed;
  } catch (_) {
    return null;
  }
  return null;
}

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    })
  });
  if (!response.ok) return null;
  const json = await response.json();
  return parseStructured(json.choices?.[0]?.message?.content || '');
}

function fallbackPayload(topScenario) {
  if (!topScenario) {
    return {
      developerSummary: 'Create and score scenarios to unlock development strategy guidance.',
      investorMemo: 'No scenario outputs are available yet. Generate scenarios to produce investor-grade guidance.',
      boardSummary: 'Project has no scored scenarios yet; request a scenario generation run before investment approval.',
      projectInsights: 'Boundary and feasibility context exist, but scenario comparison is still pending.'
    };
  }

  return {
    developerSummary: `Execute ${topScenario.name} with phased infra rollout and quarterly value-capture checks.`,
    investorMemo: `Scenario ${topScenario.name} projects revenue ${topScenario.metrics.revenue} and margin ${topScenario.metrics.margin}; manage delivery risk at month ${topScenario.metrics.deliveryMonths}.`,
    boardSummary: `Approve ${topScenario.name} and mandate monthly KPI review against margin and timeline thresholds.`,
    projectInsights: `Top scoring scenario balances yield ${topScenario.metrics.yieldUnits}, road efficiency ${topScenario.layout.roadNetwork.efficiency}, and frontage ${topScenario.layout.frontageEfficiency}.`
  };
}

export default async function handler(req, res) {
  if (!enforceRateLimit(req, res, { prefix: 'ai-recommend', limit: 25, windowMs: 60_000 })) return;
  if (req.method !== 'POST') return res.status(405).end();

  req.query.projectId = req.body?.projectId;
  const access = await requireProjectAccess(req, res, req.body?.projectId);
  if (!access) return;

  const { projectId, audience = 'developer' } = req.body || {};
  if (!projectId || typeof projectId !== 'string') return res.status(400).json({ error: 'projectId required' });

  const state = await getProjectState(projectId);
  if (!state) return res.status(404).json({ error: 'project not found' });
  const top = [...(state.scenarios || [])].sort((a, b) => b.optimizationScore - a.optimizationScore)[0];

  const prompt = `You are LandOS Atlas strategy engine. Do NOT generate geometry. Use this data ${JSON.stringify({ project: state.project.name, audience, scenario: top || null })}. Return strict JSON with keys: developerSummary, investorMemo, boardSummary, projectInsights.`;
  const aiObject = top ? await callOpenAI(prompt) : null;
  const payload = aiObject || fallbackPayload(top);

  const recommendation = await prisma.aIRecommendation.create({
    data: { projectId, audience, provider: aiObject ? 'openai' : 'fallback', payload, fallbackUsed: !aiObject }
  });

  await logActivity(projectId, access.user.id, 'AI_RECOMMENDATION_GENERATED', { audience, provider: recommendation.provider, fallbackUsed: recommendation.fallbackUsed });
  return res.status(200).json({ projectId, audience, recommendation, schemaVersion: '2.2.0' });
}
