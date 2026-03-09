const objectives = {
  MAX_YIELD: { yieldWeight: 0.5, revenueWeight: 0.25, marginWeight: 0.15, deliveryWeight: 0.1 },
  PREMIUM: { yieldWeight: 0.15, revenueWeight: 0.4, marginWeight: 0.25, deliveryWeight: 0.2 },
  BALANCED: { yieldWeight: 0.25, revenueWeight: 0.25, marginWeight: 0.25, deliveryWeight: 0.25 },
  MAX_SIMPLICITY: { yieldWeight: 0.1, revenueWeight: 0.2, marginWeight: 0.2, deliveryWeight: 0.5 },
  FRONTAGE_FAVORING: { yieldWeight: 0.2, revenueWeight: 0.3, marginWeight: 0.15, deliveryWeight: 0.35 }
};

export const goals = ['MAXIMIZE_YIELD', 'MAXIMIZE_REVENUE', 'MAXIMIZE_MARGIN', 'PREMIUM_ESTATE', 'BALANCED_PRACTICAL', 'FAST_DELIVERY'];

const stableHash = (input = '') => [...input].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000003, 17);

export function boundaryMetrics(points = []) {
  if (points.length < 3) return { area: 0, perimeter: 0, frontage: 0 };
  let area = 0;
  let perimeter = 0;
  for (let i = 0; i < points.length; i += 1) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += (p1.lng * p2.lat) - (p2.lng * p1.lat);
    perimeter += Math.hypot(p2.lat - p1.lat, p2.lng - p1.lng);
  }
  const frontage = Math.max(...points.map((p, index) => {
    const next = points[(index + 1) % points.length];
    return Math.hypot(next.lat - p.lat, next.lng - p.lng);
  }));
  return { area: Math.abs(area / 2), perimeter, frontage };
}

export function generateScenarios({ projectId, boundary, objective = 'BALANCED', goal = 'BALANCED_PRACTICAL' }) {
  const weights = objectives[objective] || objectives.BALANCED;
  const metrics = boundaryMetrics(boundary);
  const seed = stableHash(`${projectId}:${objective}:${goal}:${metrics.area.toFixed(2)}`);
  return Array.from({ length: 3 }).map((_, i) => {
    const multiplier = 1 + ((seed + i * 97) % 15) / 100;
    const baseYield = Math.max(20, metrics.area * 180 * multiplier);
    const revenue = baseYield * (280 + ((seed + i * 53) % 90));
    const margin = 0.18 + (((seed + i * 13) % 17) / 100);
    const delivery = 12 + ((seed + i * 11) % 20);
    const score = (baseYield * weights.yieldWeight) + (revenue / 1000 * weights.revenueWeight) + (margin * 100 * weights.marginWeight) + ((48 - delivery) * weights.deliveryWeight);
    return {
      id: `${projectId}-scenario-${i + 1}`,
      name: `${objective.replace('_', ' ')} Option ${i + 1}`,
      objective,
      goal,
      metrics: { yieldUnits: Math.round(baseYield), revenue: Math.round(revenue), margin: Number(margin.toFixed(2)), deliveryMonths: delivery },
      optimizationScore: Number(score.toFixed(2)),
      feasibility: score > 120 ? 'HIGH' : score > 90 ? 'MEDIUM' : 'LOW'
    };
  });
}
