import { PaymentScenario, FeeBreakdown } from './types';

const BASE_FEES = {
  processor_percent: 0.029,
  fixed: 0.30,
  interchange: 0.018,
  network: 0.0013,
};

export function calculateFees(scenario: PaymentScenario): FeeBreakdown {
  const { amount } = scenario;

  // Processor fee (e.g. Stripe): 2.9% + $0.30
  let processorFee = amount * BASE_FEES.processor_percent + BASE_FEES.fixed;

  // Interchange: 1.8% baseline, premium cards cost more
  let interchangeRate = BASE_FEES.interchange;
  if (scenario.isPremiumCard) interchangeRate += 0.005;
  if (scenario.isSubscription) interchangeRate -= 0.002;
  if (scenario.isCardPresent) interchangeRate -= 0.004;
  const interchangeFee = amount * Math.max(interchangeRate, 0.01);

  // Network fee
  const networkFee = amount * BASE_FEES.network;

  // Cross-border fee
  let crossBorderFee = 0;
  if (!scenario.isDomestic) {
    crossBorderFee = amount * 0.015; // 1.5% cross-border + FX
    processorFee += amount * 0.01; // additional processor surcharge
  }

  // Platform fee
  const platformFee = scenario.platformTakeRate
    ? amount * scenario.platformTakeRate
    : 0;

  const totalFees = processorFee + interchangeFee + networkFee + crossBorderFee + platformFee;
  const netToMerchant = amount - totalFees;

  // Settlement timing
  let settlementDays: [number, number] = [1, 3];
  if (!scenario.isDomestic) settlementDays = [2, 5];

  // Payout timing
  let payoutDays: [number, number] = [2, 7];
  if (scenario.isFasterPayout) payoutDays = [0, 1];
  if (!scenario.isDomestic) payoutDays = [payoutDays[0] + 1, payoutDays[1] + 2];

  // Retry impact
  let retryImpact = 'No retry configured';
  if (scenario.retryEnabled) {
    retryImpact = 'Automatic retry on soft decline — ~15% recovery rate on failed payments';
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
  retryEnabled: true,
  platformTakeRate: null,
};
