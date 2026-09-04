export interface PriceCalculation {
  materialCost: number;
  laborHours: number;
  hourlyRate: number;
  labourCost: number;
  otherCost: number;
  baseCost: number;
  minimumPrice: number;
  recommendedPrice: number;
  premiumPrice: number;
  profitMarginAmount: number;
  marginPercent: number;
  explanation: string;
  disclaimer: string;
}

export const REQUIRED_PRICING_DISCLAIMER =
  'Price recommendations are estimates based on the information provided. The artisan should review the final selling price.';

export function calculatePriceRecommendation(
  materialCost: number,
  laborHours: number,
  hourlyRate: number = 140,
  otherCost: number = 80
): PriceCalculation {
  const safeMaterial = Math.max(0, Number(materialCost) || 0);
  const safeHours = Math.max(0.5, Number(laborHours) || 1);
  const safeRate = Math.max(100, Number(hourlyRate) || 140);
  const safeOther = Math.max(0, Number(otherCost) || 0);

  const labourCost = Math.round(safeHours * safeRate);
  const baseCost = safeMaterial + labourCost + safeOther;

  // Fair trade margins
  // Minimum: Base Cost + 15% buffer
  const minimumPrice = Math.round((baseCost * 1.15) / 10) * 10;
  // Recommended: Base Cost + 32% margin
  const recommendedPrice = Math.round((baseCost * 1.32) / 10) * 10;
  // Premium: Base Cost + 55% margin
  const premiumPrice = Math.round((baseCost * 1.55) / 10) * 10;

  const profitMarginAmount = recommendedPrice - baseCost;
  const marginPercent = Math.round((profitMarginAmount / recommendedPrice) * 100);

  const explanation =
    'Price recommendation benchmarks fair rural artisan hourly wages (₹' +
    safeRate +
    '/hr for ' +
    safeHours +
    ' hours), raw material costs, and protective packaging to prevent underselling.';

  return {
    materialCost: safeMaterial,
    laborHours: safeHours,
    hourlyRate: safeRate,
    labourCost,
    otherCost: safeOther,
    baseCost,
    minimumPrice,
    recommendedPrice,
    premiumPrice,
    profitMarginAmount,
    marginPercent,
    explanation,
    disclaimer: REQUIRED_PRICING_DISCLAIMER
  };
}
