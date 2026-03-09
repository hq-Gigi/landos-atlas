export const FEASIBILITY_GOALS = ['MAXIMIZE_REVENUE', 'MAXIMIZE_MARGIN', 'BALANCED', 'PREMIUM_LAYOUT', 'FAST_DEVELOPMENT'];

export const defaultFeasibilityAssumptions = {
  landAcquisitionCost: 1500000,
  targetSalePricePerPlot: 95000,
  infrastructureCostPerM2: 45,
  professionalFeePercent: 6,
  contingencyPercent: 5,
  timelineMonths: 18,
  financingEnabled: true,
  debtRatio: 0.5,
  annualInterestRate: 14,
  marketingEnabled: true,
  marketingCostPercent: 2.5
};

const ratio = (value = 0) => Number(value || 0) / 100;
const n = (value = 0) => Number(value || 0);

export function normalizeFeasibilityAssumptions(input = {}) {
  return {
    ...defaultFeasibilityAssumptions,
    ...input,
    landAcquisitionCost: n(input.landAcquisitionCost ?? defaultFeasibilityAssumptions.landAcquisitionCost),
    targetSalePricePerPlot: n(input.targetSalePricePerPlot ?? defaultFeasibilityAssumptions.targetSalePricePerPlot),
    infrastructureCostPerM2: n(input.infrastructureCostPerM2 ?? defaultFeasibilityAssumptions.infrastructureCostPerM2),
    professionalFeePercent: n(input.professionalFeePercent ?? defaultFeasibilityAssumptions.professionalFeePercent),
    contingencyPercent: n(input.contingencyPercent ?? defaultFeasibilityAssumptions.contingencyPercent),
    timelineMonths: n(input.timelineMonths ?? defaultFeasibilityAssumptions.timelineMonths),
    financingEnabled: Boolean(input.financingEnabled ?? defaultFeasibilityAssumptions.financingEnabled),
    debtRatio: n(input.debtRatio ?? defaultFeasibilityAssumptions.debtRatio),
    annualInterestRate: n(input.annualInterestRate ?? defaultFeasibilityAssumptions.annualInterestRate),
    marketingEnabled: Boolean(input.marketingEnabled ?? defaultFeasibilityAssumptions.marketingEnabled),
    marketingCostPercent: n(input.marketingCostPercent ?? defaultFeasibilityAssumptions.marketingCostPercent)
  };
}

export function evaluateScenarioFeasibility({ scenario = {}, assumptions }) {
  const a = normalizeFeasibilityAssumptions(assumptions);
  const parcelArea = n(scenario?.layout?.parcelArea || scenario?.metrics?.parcelArea || 0);
  const roadArea = n(scenario?.layout?.roadArea || 0);
  const reserveArea = n(scenario?.layout?.reserveArea || parcelArea * 0.06);
  const totalPlotCount = n(scenario?.layout?.lotCount || scenario?.metrics?.lotCount || 0);
  const averagePlotSize = n(scenario?.layout?.averagePlotSize || scenario?.metrics?.averageLotSize || 0);
  const totalSellablePlotArea = Math.max(0, (totalPlotCount * averagePlotSize) - reserveArea);
  const grossDevelopmentValue = totalPlotCount * a.targetSalePricePerPlot;

  const baseDevelopmentCost = a.landAcquisitionCost;
  const infrastructureCost = roadArea * a.infrastructureCostPerM2;
  const professionalFees = (baseDevelopmentCost + infrastructureCost) * ratio(a.professionalFeePercent);
  const contingency = (baseDevelopmentCost + infrastructureCost + professionalFees) * ratio(a.contingencyPercent);
  const marketingSalesCost = a.marketingEnabled ? grossDevelopmentValue * ratio(a.marketingCostPercent) : 0;
  const financingCost = a.financingEnabled
    ? (baseDevelopmentCost + infrastructureCost + professionalFees + contingency) * a.debtRatio * ratio(a.annualInterestRate) * (Math.max(a.timelineMonths, 1) / 12)
    : 0;

  const totalCost = baseDevelopmentCost + infrastructureCost + professionalFees + contingency + marketingSalesCost + financingCost;
  const projectedProfit = grossDevelopmentValue - totalCost;
  const marginPercentage = grossDevelopmentValue ? (projectedProfit / grossDevelopmentValue) * 100 : 0;
  const roiProxy = totalCost ? (projectedProfit / totalCost) * 100 : 0;
  const efficiency = parcelArea ? (totalSellablePlotArea / parcelArea) * 100 : 0;

  const strengths = [];
  const weaknesses = [];
  if (marginPercentage >= 30) strengths.push('High projected margin profile with strong downside buffer.');
  else weaknesses.push('Margin is below premium threshold and may compress under market pressure.');
  if (roiProxy >= 25) strengths.push('ROI proxy suggests capital is recycled efficiently.');
  else weaknesses.push('ROI proxy is modest and sensitive to cost overruns.');
  if (efficiency >= 65) strengths.push('High land efficiency from strong sellable area ratio.');
  else weaknesses.push('Land efficiency is moderate due to infrastructure/reserve intensity.');

  return {
    totalPlotCount,
    totalSellablePlotArea,
    roadArea,
    reserveArea,
    estimatedGrossDevelopmentValue: grossDevelopmentValue,
    estimatedDevelopmentCost: baseDevelopmentCost,
    estimatedInfrastructureCost: infrastructureCost,
    estimatedProfessionalFees: professionalFees,
    estimatedContingency: contingency,
    estimatedMarketingSalesCost: marketingSalesCost,
    estimatedFinancingCost: financingCost,
    estimatedTotalCost: totalCost,
    projectedProfit,
    marginPercentage,
    basicRoiProxy: roiProxy,
    efficiency,
    investmentSummary: {
      attractive: strengths.join(' '),
      weaknesses: weaknesses.join(' '),
      positioning: marginPercentage >= 30 ? 'Best for margin focus.' : roiProxy >= 20 ? 'Best for balanced return profile.' : 'Best for strategic/premium positioning with cautious cost controls.'
    }
  };
}

function scoreForGoal(model, goal) {
  if (goal === 'MAXIMIZE_REVENUE') return model.estimatedGrossDevelopmentValue;
  if (goal === 'MAXIMIZE_MARGIN') return model.marginPercentage * 100000;
  if (goal === 'PREMIUM_LAYOUT') return (model.marginPercentage * 0.45) + (model.efficiency * 0.35) + ((model.totalPlotCount > 0 ? model.estimatedGrossDevelopmentValue / model.totalPlotCount : 0) * 0.2 / 1000);
  if (goal === 'FAST_DEVELOPMENT') return (model.basicRoiProxy * 0.5) + (model.marginPercentage * 0.2) + (100 - model.estimatedInfrastructureCost / Math.max(model.estimatedTotalCost, 1) * 100) * 0.3;
  return (model.basicRoiProxy * 0.34) + (model.marginPercentage * 0.33) + (model.efficiency * 0.33);
}

export function rankScenarioModels(models = [], goal = 'BALANCED') {
  const selectedGoal = FEASIBILITY_GOALS.includes(goal) ? goal : 'BALANCED';
  return [...models]
    .map((item) => ({ ...item, rankingScore: scoreForGoal(item.model, selectedGoal) }))
    .sort((a, b) => b.rankingScore - a.rankingScore)
    .map((item, idx) => ({ ...item, rank: idx + 1, goal: selectedGoal }));
}
