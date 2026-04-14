export const BASE_FEE = 75;
export const MAX_TRANSACTION = 10000;
export const DISCUSS_BELOW_AMOUNT = 750;

export type CommissionBandLabel =
  | "Discuss before purchase"
  | "10% total payout"
  | "10% to 8% total payout"
  | "8% to 5% total payout"
  | "5% total payout";

export type CommissionResult = {
  baseFee: number;
  totalTargetPayout: number;
  commissionAmount: number;
  impliedCommissionRate: number;
  payoutPercentOfSale: number;
  label: CommissionBandLabel | null;
  canProceed: boolean;
};

function interpolate(
  value: number,
  minValue: number,
  maxValue: number,
  startPercent: number,
  endPercent: number
) {
  if (maxValue === minValue) return endPercent;

  const progress = (value - minValue) / (maxValue - minValue);
  return startPercent + (endPercent - startPercent) * progress;
}

export function calculateCommission(amount: number): CommissionResult {
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_TRANSACTION) {
    return {
      baseFee: BASE_FEE,
      totalTargetPayout: 0,
      commissionAmount: 0,
      impliedCommissionRate: 0,
      payoutPercentOfSale: 0,
      label: null,
      canProceed: false,
    };
  }

  if (amount <= DISCUSS_BELOW_AMOUNT) {
    return {
      baseFee: BASE_FEE,
      totalTargetPayout: BASE_FEE,
      commissionAmount: 0,
      impliedCommissionRate: 0,
      payoutPercentOfSale: (BASE_FEE / amount) * 100,
      label: "Discuss before purchase",
      canProceed: false,
    };
  }

  let payoutPercent = 0;
  let label: CommissionBandLabel = "5% total payout";

  if (amount <= 1500) {
    payoutPercent = 0.1;
    label = "10% total payout";
  } else if (amount <= 3000) {
    payoutPercent = interpolate(amount, 1501, 3000, 0.1, 0.08);
    label = "10% to 8% total payout";
  } else if (amount <= 5000) {
    payoutPercent = interpolate(amount, 3001, 5000, 0.08, 0.05);
    label = "8% to 5% total payout";
  } else {
    payoutPercent = 0.05;
    label = "5% total payout";
  }

  const totalTargetPayout = amount * payoutPercent;
  const commissionAmount = Math.max(totalTargetPayout - BASE_FEE, 0);
  const impliedCommissionRate = amount > 0 ? commissionAmount / amount : 0;

  return {
    baseFee: BASE_FEE,
    totalTargetPayout,
    commissionAmount,
    impliedCommissionRate,
    payoutPercentOfSale: payoutPercent * 100,
    label,
    canProceed: true,
  };
}