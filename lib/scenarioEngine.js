export const objectives = {
  MAX_YIELD: { yieldWeight: 0.4, revenueWeight: 0.18, marginWeight: 0.18, deliveryWeight: 0.08, roadWeight: 0.08, frontageWeight: 0.08 },
  PREMIUM_LAYOUT: { yieldWeight: 0.12, revenueWeight: 0.25, marginWeight: 0.25, deliveryWeight: 0.1, roadWeight: 0.1, frontageWeight: 0.18 },
  BALANCED: { yieldWeight: 0.24, revenueWeight: 0.2, marginWeight: 0.2, deliveryWeight: 0.12, roadWeight: 0.12, frontageWeight: 0.12 },
  FAST_DEVELOPMENT: { yieldWeight: 0.1, revenueWeight: 0.15, marginWeight: 0.15, deliveryWeight: 0.3, roadWeight: 0.2, frontageWeight: 0.1 },
  PREMIUM: { yieldWeight: 0.12, revenueWeight: 0.25, marginWeight: 0.25, deliveryWeight: 0.1, roadWeight: 0.1, frontageWeight: 0.18 },
  FAST_DELIVERY: { yieldWeight: 0.1, revenueWeight: 0.15, marginWeight: 0.15, deliveryWeight: 0.3, roadWeight: 0.2, frontageWeight: 0.1 }
};

import { buildScenarioGeometry } from '../packages/geometry-engine/src';
import { scoreScenario } from '../packages/scoring-engine/src';
import { evaluateFeasibility } from '../packages/feasibility-engine/src';

const stableHash = (input = '') => [...input].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 1000003, 17);

function normalizePoint(point) {
  if (Array.isArray(point)) return { lng: Number(point[0]), lat: Number(point[1]) };
  return { lng: Number(point?.lng), lat: Number(point?.lat) };
}

export function boundaryMetrics(points = []) {
  if (!Array.isArray(points) || points.length < 3) return { area: 0, perimeter: 0, frontage: 0 };
  const normalized = points.map(normalizePoint).filter((point) => Number.isFinite(point.lng) && Number.isFinite(point.lat));
  if (normalized.length < 3) return { area: 0, perimeter: 0, frontage: 0 };

  let area = 0;
  let perimeter = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    const p1 = normalized[i];
    const p2 = normalized[(i + 1) % normalized.length];
    area += p1.lng * p2.lat - p2.lng * p1.lat;
    perimeter += Math.hypot(p2.lat - p1.lat, p2.lng - p1.lng);
  }
  const frontage = Math.max(...normalized.map((p, index) => {
    const next = normalized[(index + 1) % normalized.length];
    return Math.hypot(next.lat - p.lat, next.lng - p.lng);
  }));
  return { area: Math.abs(area / 2), perimeter, frontage };
}

function objectiveFactor(objective = 'BALANCED') {
  if (objective === 'MAX_YIELD') return 1.2;
  if (objective === 'PREMIUM_LAYOUT' || objective === 'PREMIUM') return 0.92;
  if (objective === 'FAST_DEVELOPMENT' || objective === 'FAST_DELIVERY') return 0.82;
  return 1;
}

export function generateScenarios({ projectId, boundary = [], objective = 'BALANCED', goal = 'BALANCED_PRACTICAL', assumptions = {}, targetPlotSize = 500, roadWidth = 9 }) {
  const weights = objectives[objective] || objectives.BALANCED;
  const metrics = boundaryMetrics(boundary);
  const constructionCostPerM2 = Number(assumptions.constructionCostPerM2 || assumptions.constructionCostPerUnit || 55000);
  const infrastructureCost = Number(assumptions.infrastructureCost || 4_500_000);
  const salePricePerPlot = Number(assumptions.salePricePerPlot || assumptions.salePricePerUnit || 90000);
  const timelineBase = Number(assumptions.timelineBaseMonths || 14);

  const seed = stableHash(`${projectId}:${objective}:${goal}:${metrics.area.toFixed(8)}:${metrics.perimeter.toFixed(8)}:${metrics.frontage.toFixed(8)}`);

  return Array.from({ length: 3 }).map((_, i) => {
    const drift = 1 + ((seed + i * 97) % 15) / 100;
    const geometry = buildScenarioGeometry(boundary, { variant: i, objective, targetPlotSize, roadWidth, minFrontage: assumptions.minFrontage || 12 });
    const frontageEfficiency = Number((Math.min(1, (metrics.frontage * 120) + 0.35 + i * 0.08)).toFixed(2));
    const deliveryMonths = Math.max(6, timelineBase + ((seed + i * 11) % 12) - Math.round((objective === 'FAST_DELIVERY' || objective === 'FAST_DEVELOPMENT') ? 3 : 0));

    const lotCount = geometry.plots;
    const avgLotSize = geometry.averagePlotSize;
    const saleablePlots = Math.max(1, Math.round(lotCount * 0.94));
    const revenue = Math.round(saleablePlots * salePricePerPlot * drift * objectiveFactor(objective));
    const hardCost = Math.round(lotCount * avgLotSize * constructionCostPerM2 * (0.88 + (i * 0.05)));
    const totalCost = hardCost + infrastructureCost;
    const margin = revenue ? (revenue - totalCost) / revenue : 0;

    const feasibility = evaluateFeasibility({
      units: saleablePlots,
      salePrice: Math.round(revenue / saleablePlots),
      hardCost: Math.max(1, Math.round(hardCost / saleablePlots)),
      infraRate: 0.1,
      feeRate: 0.04,
      contingencyRate: 0.05
    });

    const weighted = scoreScenario({
      plots: geometry.plots / 100,
      avgArea: metrics.area,
      efficiency: geometry.roadNetwork.efficiency,
      reserve: geometry.reserves / Math.max(geometry.plots, 1),
      road: geometry.roadNetwork.efficiency,
      access: geometry.roadNetwork.efficiency,
      corner: 0.55 + i * 0.05,
      frontage: frontageEfficiency,
      simplicity: (objective === 'FAST_DELIVERY' || objective === 'FAST_DEVELOPMENT') ? 0.88 : 0.7,
      phasing: (objective === 'FAST_DELIVERY' || objective === 'FAST_DEVELOPMENT') ? 0.9 : 0.72,
      sales: (objective === 'PREMIUM' || objective === 'PREMIUM_LAYOUT') ? 0.82 : 0.68,
      revenue: Math.min(1, revenue / 1_000_000_000),
      margin: Math.max(0, margin)
    });

    const baseScore =
      lotCount * weights.yieldWeight * 0.03 +
      (revenue / 1_000_000) * weights.revenueWeight +
      margin * 100 * weights.marginWeight +
      (36 - deliveryMonths) * weights.deliveryWeight +
      geometry.roadNetwork.efficiency * 100 * weights.roadWeight +
      frontageEfficiency * 100 * weights.frontageWeight;

    const score = (baseScore + weighted.overall) / 2;

    return {
      id: `${projectId}-scenario-${i + 1}`,
      name: `${objective.replace('_', ' ')} Option ${i + 1}`,
      objective,
      goal,
      layout: {
        roadNetwork: geometry.roadNetwork,
        roadLines: geometry.roadLines,
        roads: geometry.roadLines,
        plotGrid: geometry.plotGrid,
        plots: geometry.plotGrid,
        parcelCount: lotCount,
        lotCount,
        plotCount: lotCount,
        averagePlotSize: avgLotSize,
        layoutEfficiency: Number((geometry.utilization * geometry.roadNetwork.efficiency).toFixed(3)),
        roadCoverage: Number(geometry.roadCoverage.toFixed(3)),
        landUtilization: Number(geometry.utilization.toFixed(3)),
        lotSizes: {
          average: avgLotSize,
          min: geometry.minLotArea,
          max: geometry.maxLotArea
        },
        frontageEfficiency,
        parcelArea: geometry.area,
        roadArea: geometry.roadArea,
        reserveArea: Math.max(0, geometry.area * 0.06)
      },
      metrics: {
        yieldUnits: saleablePlots,
        lotCount,
        averageLotSize: avgLotSize,
        averagePlotSize: avgLotSize,
        layoutEfficiency: Number((geometry.utilization * geometry.roadNetwork.efficiency).toFixed(3)),
        roadCoverage: Number(geometry.roadCoverage.toFixed(3)),
        landUtilization: Number(geometry.utilization.toFixed(3)),
        revenue,
        cost: totalCost,
        margin: Number(margin.toFixed(3)),
        roi: totalCost ? Number((((revenue - totalCost) / totalCost) * 100).toFixed(2)) : 0,
        deliveryMonths,
        parcelArea: geometry.area,
        roadArea: geometry.roadArea,
        reserveArea: Math.max(0, geometry.area * 0.06),
        ...feasibility
      },
      optimizationScore: Number(score.toFixed(2)),
      explainability: weighted.reasoning,
      feasibility: score > 85 ? 'HIGH' : score > 60 ? 'MEDIUM' : 'LOW'
    };
  });
}
