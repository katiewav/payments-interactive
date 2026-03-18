import { PaymentScenario, ScenarioPreset } from './types';
import { DEFAULT_SCENARIO } from './paymentModel';

export interface ScenarioConfig {
  id: ScenarioPreset;
  label: string;
  description: string;
  scenario: PaymentScenario;
}

export const SCENARIO_PRESETS: ScenarioConfig[] = [
  {
    id: 'baseline',
    label: 'Baseline',
    description: 'Standard domestic online card payment, blended pricing',
    scenario: { ...DEFAULT_SCENARIO },
  },
  {
    id: 'cross-border',
    label: 'Cross-border',
    description: 'UK customer paying a US merchant — additional FX fees',
    scenario: {
      ...DEFAULT_SCENARIO,
      isDomestic: false,
      customerCountry: 'UK',
      merchantCountry: 'US',
    },
  },
  {
    id: 'failed-retry',
    label: 'Failed + Retried',
    description: 'Soft decline recovered by smart retry logic',
    scenario: {
      ...DEFAULT_SCENARIO,
      retryEnabled: true,
    },
  },
  {
    id: 'chargeback',
    label: 'Chargeback',
    description: 'Cardholder disputes — funds reverse through the chain',
    scenario: {
      ...DEFAULT_SCENARIO,
      retryEnabled: false,
    },
  },
  {
    id: 'subscription',
    label: 'Subscription',
    description: 'Recurring billing with retry and optimized interchange',
    scenario: {
      ...DEFAULT_SCENARIO,
      isSubscription: true,
      retryEnabled: true,
    },
  },
  {
    id: 'platform',
    label: 'Marketplace',
    description: 'Platform takes a cut before merchant payout',
    scenario: {
      ...DEFAULT_SCENARIO,
      platformTakeRate: 0.10,
    },
  },
];

export function getScenarioPreset(id: ScenarioPreset): ScenarioConfig {
  return SCENARIO_PRESETS.find((s) => s.id === id) ?? SCENARIO_PRESETS[0];
}
