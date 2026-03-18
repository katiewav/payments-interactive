export interface PaymentScenario {
  amount: number;
  isDomestic: boolean;
  isCardPresent: boolean;
  isSubscription: boolean;
  isPremiumCard: boolean;
  merchantCountry: string;
  customerCountry: string;
  isFasterPayout: boolean;
  retryEnabled: boolean;
  platformTakeRate: number | null;
}

export interface FeeBreakdown {
  grossAmount: number;
  processorFee: number;
  interchangeFee: number;
  networkFee: number;
  crossBorderFee: number;
  platformFee: number;
  totalFees: number;
  netToMerchant: number;
  settlementDays: [number, number];
  payoutDays: [number, number];
  retryImpact: string;
}

export interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  type: 'person' | 'entity' | 'processor';
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  amount?: number;
  animated?: boolean;
  dashed?: boolean;
}

export interface AnnotationCard {
  id: string;
  title: string;
  body: string;
  detail?: string;
}

export type ScenarioPreset = 'baseline' | 'cross-border' | 'failed-retry' | 'chargeback' | 'subscription' | 'platform';
