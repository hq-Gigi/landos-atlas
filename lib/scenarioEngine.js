export const objectives = {
  MAX_YIELD: { yieldWeight: 0.4, revenueWeight: 0.18, marginWeight: 0.18, deliveryWeight: 0.08, roadWeight: 0.08, frontageWeight: 0.08 },
  PREMIUM: { yieldWeight: 0.12, revenueWeight: 0.25, marginWeight: 0.25, deliveryWeight: 0.1, roadWeight: 0.1, frontageWeight: 0.18 },
  BALANCED: { yieldWeight: 0.24, revenueWeight: 0.2, marginWeight: 0.2, deliveryWeight: 0.12, roadWeight: 0.12, frontageWeight: 0.12 },
  MAX_SIMPLICITY: { yieldWeight: 0.1, revenueWeight: 0.15, marginWeight: 0.15, deliveryWeight: 0.3, roadWeight: 0.2, frontageWeight: 0.1 }
};

const stableHash = (input = '') => [...input].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000003, 17);

export function boundaryMetrics(points = []) {
  if (!Array.isArray(points) || points.length < 3) return { area: 0, perimeter: 0, frontage: 0 };
  let area = 0;
  let perimeter = 0;
  for (let i = 0; i < points.length; i += 1) {
    const p1 = points[i];
    const p2 = points[(i + 1) % points.length];
    area += p1.lng * p2.lat - p2.lng * p1.lat;
    perimeter += Math.hypot(p2.lat - p1.lat, p2.lng - p1.lng);
  }
  const frontage = Math.max(...points.map((p, index) => {
    const next = points[(index + 1) % points.length];
    return Math.hypot(next.lat - p.lat, next.lng - p.lng);
  }));
  return { area: Math.abs(area / 2), perimeter, frontage };
}

export function generateScenarios({ projectId, boundary = [], objective = 'BALANCED', goal = 'BALANCED_PRACTICAL', assumptions = {} }) {
  const weights = objectives[objective] || objectives.BALANCED;
  const metrics = boundaryMetrics(boundary);
  const constructionCostPerUnit = Number(assumptions.constructionCostPerUnit || 55000);
  const salePricePerUnit = Number(assumptions.salePricePerUnit || 90000);
  const timelineBase = Number(assumptions.timelineBaseMonths || 14);

  const seed = stableHash(`${projectId}:${objective}:${goal}:${metrics.area.toFixed(8)}:${metrics.perimeter.toFixed(8)}:${metrics.frontage.toFixed(8)}`);

  return Array.from({ length: 3 }).map((_, i) => {
    const drift = 1 + ((seed + i * 97) % 15) / 100;
    const parcelCount = Math.max(12, Math.round(metrics.area * 160000 * (0.8 + i * 0.12)));
    const yieldUnits = Math.max(20, Math.round(metrics.area * 220000 * drift));
    const roadEfficiency = Number((0.62 + ((seed + i * 47) % 30) / 100).toFixed(2));
    const frontageEfficiency = Number((Math.min(1, (metrics.frontage * 120) + 0.35 + i * 0.08)).toFixed(2));
    const revenue = yieldUnits * (salePricePerUnit + ((seed + i * 53) % 15000));
    const cost = yieldUnits * (constructionCostPerUnit + ((seed + i * 41) % 12000));
    const margin = (revenue - cost) / revenue;
    const deliveryMonths = timelineBase + ((seed + i * 11) % 12);

    const score =
      yieldUnits * weights.yieldWeight * 0.03 +
      (revenue / 1_000_000) * weights.revenueWeight +
      margin * 100 * weights.marginWeight +
      (36 - deliveryMonths) * weights.deliveryWeight +
      roadEfficiency * 100 * weights.roadWeight +
      frontageEfficiency * 100 * weights.frontageWeight;

    return {
      id: `${projectId}-scenario-${i + 1}`,
      name: `${objective.replace('_', ' ')} Option ${i + 1}`,
      objective,
      goal,
      layout: {
        roadNetwork: { pattern: i === 0 ? 'spine-grid' : i === 1 ? 'loop-cluster' : 'hybrid-grid', efficiency: roadEfficiency },
        parcelCount,
        frontageEfficiency
      },
      metrics: { yieldUnits, revenue, cost, margin: Number(margin.toFixed(3)), deliveryMonths },
      optimizationScore: Number(score.toFixed(2)),
      feasibility: score > 85 ? 'HIGH' : score > 60 ? 'MEDIUM' : 'LOW'
    };
  });
}
