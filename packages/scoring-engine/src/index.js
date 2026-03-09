export function scoreScenario(input) {
  const weights = { plots: 0.12, avgArea: 0.08, efficiency: 0.12, reserve: 0.06, road: 0.08, access: 0.08, corner: 0.08, frontage: 0.1, simplicity: 0.08, phasing: 0.06, sales: 0.06, revenue: 0.1, margin: 0.08 };
  const score = Object.entries(weights).reduce((acc, [k, w]) => acc + (Number(input[k] || 0) * 100 * w), 0);
  return { overall: Number(score.toFixed(2)), subScores: weights, reasoning: 'Weighted deterministic model prioritizes efficiency, feasibility and marketability.' };
}
