import { prisma } from '../../../lib/prisma';
import { requireProjectAccess } from '../../../lib/apiGuard';
import { getProjectState } from '../../../lib/platformStore';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  req.query.projectId = req.body?.projectId;
  const access = await requireProjectAccess(req, res, req.body?.projectId);
  if (!access) return;

  const { projectId, audience = 'developer' } = req.body || {};
  const state = await getProjectState(projectId);
  const top = [...state.scenarios].sort((a, b) => b.optimizationScore - a.optimizationScore)[0];

  const prompt = `You are LandOS Atlas strategy engine. Do NOT generate geometry. Use this data ${JSON.stringify({ project: state.project.name, audience, scenario: top })}. Return strict JSON with keys: developerSummary, investorMemo, boardSummary, projectInsights.`;
  const aiObject = await callOpenAI(prompt);
  const payload = aiObject || {
    developerSummary: `Execute ${top.name} with phased infra rollout and quarterly value-capture checks.`,
    investorMemo: `Scenario ${top.name} projects revenue ${top.metrics.revenue} and margin ${top.metrics.margin}; manage delivery risk at month ${top.metrics.deliveryMonths}.`,
    boardSummary: `Approve ${top.name} and mandate monthly KPI review against margin and timeline thresholds.`,
    projectInsights: `Top scoring scenario balances yield ${top.metrics.yieldUnits}, road efficiency ${top.layout.roadNetwork.efficiency}, and frontage ${top.layout.frontageEfficiency}.`
  };

  const recommendation = await prisma.aIRecommendation.create({
    data: { projectId, audience, provider: aiObject ? 'openai' : 'fallback', payload, fallbackUsed: !aiObject }
  });

  return res.status(200).json({ projectId, audience, recommendation, schemaVersion: '2.1.0' });
}
