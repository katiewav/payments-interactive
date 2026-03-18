/**
 * Scale statistics drawn from public industry sources.
 * Used for editorial context throughout the experience.
 */

export const STATS = {
  globalTransactions: {
    annual: '791 billion',
    daily: '2.17 billion',
    perSecond: '25,091',
    year: '2024',
  },
  visa: {
    transactions: '257.5 billion',
    volume: '$14.2 trillion',
    period: 'fiscal 2025',
  },
  chargebacks: {
    annual: '324 million',
    projection: '2028',
  },
  stablecoins: {
    dailyVolume: '$20B–$30B',
    shareOfGlobal: 'less than 1%',
  },
} as const;

export const SOURCES_NOTE =
  'Scale figures are drawn from public industry reports (Nilson Report, Visa fiscal filings, Mastercard data, Juniper Research). Fee structures and timing estimates are simplified models for educational purposes, not exact quotes from any processor.';
