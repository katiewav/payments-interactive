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
    description: 'A standard $100 domestic online card payment',
    scenario: { ...DEFAULT_SCENARIO },
  },
  {
    id: 'cross-border',
    label: 'Cross-border',
    description: 'Payment from a customer in the UK to a US merchant',
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
    description: 'Initial decline followed by a successful retry',
    scenario: {
      ...DEFAULT_SCENARIO,
      retryEnabled: true,
    },
  },
  {
    id: 'chargeback',
    label: 'Chargeback',
    description: 'Customer disputes — funds reverse back through the chain',
    scenario: {
      ...DEFAULT_SCENARIO,
      retryEnabled: false,
    },
  },
  {
    id: 'subscription',
    label: 'Subscription',
    description: 'Recurring subscription payment with optimized interchange',
    scenario: {
      ...DEFAULT_SCENARIO,
      isSubscription: true,
      retryEnabled: true,
    },
  },
  {
    id: 'platform',
    label: 'Platform / Marketplace',
    description: 'Payment through a marketplace with a platform take rate',
    scenario: {
      ...DEFAULT_SCENARIO,
      platformTakeRate: 0.10,
    },
  },
];

export function getScenarioPreset(id: ScenarioPreset): ScenarioConfig {
  return SCENARIO_PRESETS.find((s) => s.id === id) ?? SCENARIO_PRESETS[0];
}
