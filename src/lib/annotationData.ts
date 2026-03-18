import { AnnotationCard } from './types';

export const annotations: AnnotationCard[] = [
  {
    id: 'authorization',
    title: 'Authorization is approval, not settlement',
    body: 'When you tap your card, the issuing bank checks your balance and places a hold. No money has moved yet — this is just a promise that the funds exist.',
    detail: 'Authorization typically takes 1–3 seconds and involves real-time communication between the merchant, acquirer, network, and issuer. The hold may last days before clearing.',
  },
  {
    id: 'issuer',
    title: 'Issuing bank — the cardholder\'s bank',
    body: 'The issuing bank (your bank) decides whether to approve or decline. It checks balance, fraud signals, and cardholder risk in milliseconds.',
    detail: 'Issuers earn interchange revenue on every approved transaction. They bear the fraud liability in most card-not-present scenarios. Examples: Chase, Citi, Barclays.',
  },
  {
    id: 'network',
    title: 'Card network routes messages',
    body: 'Card networks like Visa and Mastercard don\'t hold funds. They route authorization messages between issuer and acquirer and set the rules all parties follow.',
    detail: 'Networks charge assessment fees (typically 0.13–0.15%) and set interchange rate tables. They also manage dispute and chargeback protocols between banks.',
  },
  {
    id: 'acquirer',
    title: 'Acquiring bank — the merchant\'s bank',
    body: 'The acquiring bank is the merchant\'s bank. It receives settlement funds from the network and deposits them into the merchant\'s account.',
    detail: 'Acquirers underwrite merchant risk and can freeze payouts if fraud patterns emerge. Payment processors like Stripe, Square, or Adyen often act as intermediaries between merchants and acquirers.',
  },
  {
    id: 'processor',
    title: 'Processor coordinates the flow',
    body: 'Payment processors (Stripe, Square, Adyen, etc.) abstract the acquiring relationship, handle retries, manage fraud detection, and coordinate settlement and payouts.',
    detail: 'Processors act as payment facilitators (payfacs). Merchants don\'t need their own direct acquiring relationship — the processor aggregates them under its master merchant account.',
  },
  {
    id: 'interchange',
    title: 'Interchange goes to the issuing bank',
    body: 'The largest fee component goes to the cardholder\'s bank. It compensates the issuer for fronting the money and bearing fraud risk.',
    detail: 'Interchange rates vary by card type, merchant category, and transaction method. Premium rewards cards have higher interchange because the issuer funds those rewards.',
  },
  {
    id: 'settlement',
    title: 'Settlement is delayed',
    body: 'After authorization, actual money movement takes 1–3 business days. The funds move from issuing bank to network to acquiring bank in a batch process.',
    detail: 'Settlement happens in batch cycles, not real-time. Networks aggregate transactions and net out amounts between banks daily.',
  },
  {
    id: 'payout',
    title: 'Payout ≠ settlement',
    body: 'Settlement is when the acquiring bank receives funds. Payout is when the merchant actually gets their money. These are separate events with separate timing.',
    detail: 'Standard payouts take 2–7 business days after the transaction. Instant payouts are available but cost an additional fee (typically 1%).',
  },
  {
    id: 'retry',
    title: 'Retries can recover payments',
    body: 'Not all declines are permanent. Soft declines from temporary issues — insufficient funds, network timeouts — can often be recovered with intelligent retry logic.',
    detail: 'Smart retry systems analyze decline codes and retry at optimal times. This can recover ~15% of failed subscription payments.',
  },
  {
    id: 'chargeback',
    title: 'Chargebacks reverse the flow',
    body: 'A chargeback is a forced reversal initiated by the cardholder\'s bank. The merchant loses the payment amount, pays a chargeback fee, and may lose the goods or service already delivered.',
    detail: 'Chargebacks typically take 60–120 days to resolve. The merchant can dispute with evidence, but the issuing bank makes the final decision. High chargeback rates can lead to account termination by the acquirer.',
  },
];

export function getAnnotation(id: string): AnnotationCard | undefined {
  return annotations.find((a) => a.id === id);
}
