import { PaymentScenario, FeeBreakdown } from './types';

/**
 * Fee model uses BLENDED PRICING by default.
 *
 * The 2.9% + $0.30 is the all-in merchant-facing fee for a standard
 * domestic online card payment (Stripe-style blended pricing).
 * Interchange and network fees are the underlying economics
 * inside that blended rate — shown separately only in the
 * "system economics" educational layer, not added on top.
 *
 * Cross-border surcharges and platform fees ARE additive.
 */

const BLENDED_RATE = {
  percent: 0.029,
  fixed: 0.30,
};

// Underlying economics (educational — within the blended rate)
const SYSTEM_ECONOMICS = {
  interchange_percent: 0.018,
  network_percent: 0.0013,
  // Processor margin is the remainder of the blended rate
};

export function calculateFees(scenario: PaymentScenario): FeeBreakdown {
  const { amount } = scenario;

  // Blended processor fee: 2.9% + $0.30 (all-in merchant-facing fee)
  let processorFee = amount * BLENDED_RATE.percent + BLENDED_RATE.fixed;

  // Underlying economics within the blended rate (educational)
  let interchangeRate = SYSTEM_ECONOMICS.interchange_percent;
  if (scenario.isPremiumCard) interchangeRate += 0.005;
  if (scenario.isSubscription) interchangeRate -= 0.002;
  if (scenario.isCardPresent) interchangeRate -= 0.004;
  const interchangeFee = amount * Math.max(interchangeRate, 0.01);
  const networkFee = amount * SYSTEM_ECONOMICS.network_percent;

  // Cross-border fees ARE additive (separate from blended rate)
  // Stripe charges 3.1% + $0.30 for international cards (vs 2.9% domestic)
  // plus a 1.5% cross-border surcharge
  let crossBorderFee = 0;
  if (!scenario.isDomestic) {
    crossBorderFee = amount * 0.015;  // 1.5% cross-border surcharge
    processorFee += amount * 0.002;   // 0.2% uplift (3.1% vs 2.9% for intl cards)
  }

  // Platform fee IS additive
  const platformFee = scenario.platformTakeRate
    ? amount * scenario.platformTakeRate
    : 0;

  // Total merchant-facing fees: blended rate + any additive surcharges
  const totalFees = processorFee + crossBorderFee + platformFee;
  const netToMerchant = amount - totalFees;

  // Settlement timing
  let settlementDays: [number, number] = [1, 3];
  if (!scenario.isDomestic) settlementDays = [2, 5];

  // Payout timing (Stripe standard is T+2 for US card payments)
  let payoutDays: [number, number] = [2, 3];
  if (scenario.isFasterPayout) payoutDays = [0, 1];
  if (!scenario.isDomestic) payoutDays = [payoutDays[0] + 1, payoutDays[1] + 3];

  // Retry impact
  let retryImpact = '';
  if (scenario.retryEnabled) {
    retryImpact = 'Smart retry enabled — can recover ~15% of soft-declined payments';
  }

  return {
    grossAmount: amount,
    processorFee: round(processorFee),
    interchangeFee: round(interchangeFee),
    networkFee: round(networkFee),
    crossBorderFee: round(crossBorderFee),
    platformFee: round(platformFee),
    totalFees: round(totalFees),
    netToMerchant: round(netToMerchant),
    settlementDays,
    payoutDays,
    retryImpact,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n);
}

export function formatPercent(n: number, total: number): string {
  return ((n / total) * 100).toFixed(1) + '%';
}

export const DEFAULT_SCENARIO: PaymentScenario = {
  amount: 100,
  isDomestic: true,
  isCardPresent: false,
  isSubscription: false,
  isPremiumCard: false,
  merchantCountry: 'US',
  customerCountry: 'US',
  isFasterPayout: false,
  retryEnabled: false,
  platformTakeRate: null,
};
