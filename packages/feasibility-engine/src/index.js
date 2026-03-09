export function evaluateFeasibility({ units = 0, salePrice = 0, hardCost = 0, infraRate = 0.12, feeRate = 0.06, contingencyRate = 0.05 }) {
  const grossDevelopmentValue = units * salePrice;
  const costEstimate = units * hardCost;
  const infrastructureEstimate = costEstimate * infraRate;
  const feeAllowance = costEstimate * feeRate;
  const contingencyAllowance = costEstimate * contingencyRate;
  const totalCost = costEstimate + infrastructureEstimate + feeAllowance + contingencyAllowance;
  const projectedProfit = grossDevelopmentValue - totalCost;
  const marginPercentage = grossDevelopmentValue ? (projectedProfit / grossDevelopmentValue) * 100 : 0;
  return { grossDevelopmentValue, costEstimate, infrastructureEstimate, feeAllowance, contingencyAllowance, projectedProfit, marginPercentage };
}
