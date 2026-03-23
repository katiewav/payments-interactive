'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { ChapterId } from '@/lib/chapters';
import { formatCurrency } from '@/lib/paymentModel';

interface Props {
  activeChapter: ChapterId;
  onFailureModeChange: (mode: 'none' | 'decline' | 'fraud' | 'chargeback') => void;
  failureMode: string;
  amount: number;
  onAmountChange: (n: number) => void;
}

const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -10 }, transition: { duration: 0.5 } };

const Eyebrow = ({ children }: { children: string }) => (
  <span className="block text-[10px] tracking-[0.25em] uppercase text-muted/60 mb-2">{children}</span>
);
const Title = ({ children }: { children: string }) => (
  <h2 className="text-2xl md:text-3xl font-light mb-6" style={{ fontFamily: 'var(--font-editorial)' }}>{children}</h2>
);
const P = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-muted text-[15px] leading-relaxed mb-4 ${className}`}>{children}</p>
);

const DETAIL_PILLS: Record<string, string> = {
  Gateway: 'Captures and securely transmits card data to the processor. Handles encryption (PCI-DSS compliance) and tokenization.',
  'Card Network': 'Visa and Mastercard don\u2019t hold funds. They route authorization messages between issuer and acquirer and set the rules all parties follow.',
  Issuer: 'The cardholder\u2019s bank. Approves or declines based on balance, fraud signals, and risk. Earns interchange revenue on every approved transaction.',
  Acquirer: 'The merchant\u2019s bank. Receives settlement funds from the network and deposits them into the merchant\u2019s account. Underwrites merchant risk.',
};

const WITHOUT_PSP = [
  'Direct acquiring bank relationship required',
  'Separate gateway integration',
  'Build or buy fraud screening',
  'PCI compliance on merchant',
  'Manual settlement reconciliation',
  'Per-country acquiring relationships for international',
];
const WITH_PSP = [
  'Single API integration',
  'Gateway, processing, acquiring bundled',
  'Integrated fraud and risk tooling',
  'PCI scope reduced via tokenization',
  'Automated reconciliation and reporting',
  'Multi-country coverage from one provider',
];

const FAILURE_TEXT: Record<string, string> = {
  decline: 'The issuing bank rejects the transaction. Possible reasons: insufficient funds, expired card, velocity limits, issuer suspicion. The flow stops before completion \u2014 no money moves, no settlement occurs.',
  fraud: 'Before forwarding to the network, the processor\u2019s risk engine flags the transaction for review. Fraud scoring evaluates device fingerprint, velocity, geolocation, and behavioral signals. The transaction may be blocked, flagged for manual review, or allowed with elevated monitoring.',
  chargeback: 'Even after successful settlement, the cardholder can dispute. The issuing bank initiates a forced reversal \u2014 funds flow backward through every intermediary. The merchant loses the payment amount plus a chargeback fee ($15\u2013$25 typical). Resolution takes 60\u2013120 days. The merchant can submit evidence, but the issuer decides.',
};

function RevealCard({ trigger, children }: { trigger: string; children: React.ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="my-3">
      <motion.button
        onClick={() => setRevealed(!revealed)}
        whileTap={{ scale: 0.97 }}
        className={`w-full text-left text-xs px-4 py-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 ${
          revealed ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-accent/20 bg-surface'
        }`}
      >
        <span className={revealed ? 'text-accent' : 'text-muted'}>{trigger}</span>
        <motion.span animate={{ rotate: revealed ? 180 : 0 }} className="text-muted/40 text-[10px]">▾</motion.span>
      </motion.button>
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 text-xs text-muted/80 leading-relaxed border-l-2 border-accent/20 ml-2 mt-1">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClickableBadge({ label, revealText }: { label: string; revealText: string }) {
  const [clicked, setClicked] = useState(false);
  return (
    <motion.button
      onClick={() => setClicked(!clicked)}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-1.5 cursor-pointer group"
    >
      <span className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
        clicked ? 'border-accent/40 bg-accent/10 text-accent' : 'border-success/30 bg-success/10 text-success hover:border-accent/30'
      }`}>
        {clicked ? revealText : label}
      </span>
    </motion.button>
  );
}

export default function ChapterNarrative({ activeChapter, onFailureModeChange, failureMode, amount, onAmountChange }: Props) {
  const [expandedPill, setExpandedPill] = useState<string | null>(null);
  const [timelineView, setTimelineView] = useState<'customer' | 'system'>('customer');
  const [expandedFee, setExpandedFee] = useState<string | null>(null);

  if (activeChapter === 'hero' || activeChapter === 'takeaway') return null;

  const interchange = amount * 0.018;
  const network = amount * 0.0013;
  const totalFee = amount * 0.029 + 0.30;
  const processorMargin = totalFee - interchange - network;
  const netToMerchant = amount - totalFee;

  return (
    <div className="max-w-lg">
      <AnimatePresence mode="wait">
        <motion.div key={activeChapter} {...fade}>

          {activeChapter === 'illusion' && (
            <>
              <Eyebrow>Chapter 1</Eyebrow>
              <Title>The illusion of simplicity</Title>
              <P>To the customer, a card payment is a single moment: tap, approved, done.</P>
              <P>The mental model is simple &mdash; money moves directly from you to the merchant. $100 in, $100 out.</P>
              <P>This is the version of reality the interface presents. It is not what actually happens.</P>
              <div className="mt-4 mb-2">
                <ClickableBadge label="Payment approved ✓" revealText="Not settled yet →" />
              </div>
              <RevealCard trigger="🔍 What the checkout screen hides">
                Behind &ldquo;payment approved&rdquo; are at least 5 institutions, 3 time horizons, and multiple points of failure. The customer sees none of this.
              </RevealCard>
              <p className="text-muted/50 text-sm italic mt-4">Scroll to see what&rsquo;s really underneath — or click nodes in the diagram to explore.</p>
            </>
          )}

          {activeChapter === 'stack' && (
            <>
              <Eyebrow>Chapter 2</Eyebrow>
              <Title>The hidden stack expands</Title>
              <P>A card payment touches at least five distinct institutions, each with its own role, risk, and revenue model.</P>
              <P>The gateway captures and encrypts the payment data. The processor routes the transaction and coordinates with the card network. The network &mdash; Visa, Mastercard &mdash; acts as the messaging rail between banks. The issuing bank (the customer&rsquo;s bank) decides whether to approve. The acquiring bank (the merchant&rsquo;s bank) receives the settled funds.</P>
              <P>If the diagram above abstracts any of these into a single node, that is a simplification. In practice, a modern PSP may bundle gateway, processor, and acquiring functions &mdash; but the underlying roles remain distinct.</P>
              <div className="flex flex-wrap gap-2 mt-4 mb-2">
                {Object.keys(DETAIL_PILLS).map((label) => (
                  <button key={label} onClick={() => setExpandedPill(expandedPill === label ? null : label)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${expandedPill === label ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted hover:border-accent/50'}`}>
                    {label}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {expandedPill && (
                  <motion.p key={expandedPill} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-sm text-muted/80 pl-2 border-l-2 border-accent/30 mt-2">
                    {DETAIL_PILLS[expandedPill]}
                  </motion.p>
                )}
              </AnimatePresence>
            </>
          )}

          {activeChapter === 'auth-vs-settlement' && (
            <>
              <Eyebrow>Chapter 3</Eyebrow>
              <Title>Approved does not mean settled</Title>
              <P>This is the most important distinction in payments.</P>
              <P>When you see &ldquo;Payment approved,&rdquo; no money has moved. The issuing bank has only confirmed that funds exist and placed a temporary hold.</P>
              <P>Actual money movement &mdash; settlement &mdash; happens in batch cycles, typically 1&ndash;3 business days later. The funds flow from issuing bank through the network to the acquiring bank, then to the merchant.</P>
              <P>The merchant&rsquo;s payout may take an additional 1&ndash;2 days after settlement.</P>
              <RevealCard trigger="⏱ Why does settlement take days?">
                Card networks process in batch cycles, not real-time. They aggregate the day&rsquo;s transactions, net out positions between thousands of banks, and execute wire transfers. This is closer to logistics than to instant messaging.
              </RevealCard>
              <div className="flex gap-2 mt-4 mb-4">
                {(['customer', 'system'] as const).map((v) => (
                  <button key={v} onClick={() => setTimelineView(v)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${timelineView === v ? 'border-accent text-accent bg-accent/10' : 'border-border text-muted hover:border-accent/50'}`}>
                    {v === 'customer' ? 'What the customer sees' : 'What the system sees'}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {timelineView === 'customer' ? (
                  <motion.div key="cust" {...fade} className="flex items-center gap-3 text-sm text-muted">
                    {['Tap', 'Approved \u2713', 'Done'].map((s, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="text-green-500">{s}</span>
                        {i < 2 && <span className="text-border">&rarr;</span>}
                      </span>
                    ))}
                  </motion.div>
                ) : (
                  <motion.ol key="sys" {...fade} className="text-sm text-muted space-y-1.5 list-decimal list-inside">
                    {[
                      ['Auth request', 'ms'], ['Hold placed', ''], ['Batch close', 'end of day'],
                      ['Clearing', 'T+1'], ['Settlement', 'T+1 to T+3'], ['Payout', 'T+2 to T+3'],
                      ['Dispute window open', 'up to 120 days'],
                    ].map(([step, time]) => (
                      <li key={step}>{step}{time && <span className="text-muted/50 ml-1.5 text-xs">({time})</span>}</li>
                    ))}
                  </motion.ol>
                )}
              </AnimatePresence>
            </>
          )}

          {activeChapter === 'fees' && (
            <>
              <Eyebrow>Chapter 4</Eyebrow>
              <Title>Where the money goes</Title>
              <P>With standard blended pricing, the merchant pays one visible fee &mdash; typically 2.9% + $0.30 per transaction.</P>
              <P>Inside that rate, revenue splits between the issuing bank (interchange), the card network (assessment fee), and the processor (margin).</P>
              <P>For a {formatCurrency(amount)} domestic online card payment, the merchant receives {formatCurrency(netToMerchant)}.</P>
              <label className="block text-xs text-muted/60 mt-4 mb-1">Transaction amount</label>
              <input type="range" min={10} max={1000} step={5} value={amount} onChange={(e) => onAmountChange(Number(e.target.value))}
                className="w-full accent-accent" />
              <span className="block text-right text-xs text-muted/60 mb-4">{formatCurrency(amount)}</span>
              <div className="space-y-1 text-sm">
                {[
                  { id: 'interchange', label: 'Interchange → issuing bank', value: interchange, pct: '1.8%', detail: 'The largest slice. Compensates the issuer for fronting the money and bearing fraud risk. Premium rewards cards = higher interchange = better points for you, higher cost for merchant.' },
                  { id: 'network', label: 'Network assessment', value: network, pct: '0.13%', detail: 'Visa/Mastercard\'s cut for routing the message between banks. Small per transaction, massive in aggregate across billions of payments.' },
                  { id: 'processor', label: 'Processor margin', value: processorMargin, pct: '~1%', detail: 'What the processor keeps after passing through interchange and network fees. This funds the API, fraud tools, retry logic, and payout coordination.' },
                ].map((r) => (
                  <motion.button
                    key={r.id}
                    onClick={() => setExpandedFee(expandedFee === r.id ? null : r.id)}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                      expandedFee === r.id ? 'border-accent/30 bg-accent/5' : 'border-transparent hover:bg-surface'
                    }`}
                  >
                    <div className="flex justify-between text-muted items-center">
                      <span className="flex items-center gap-2">
                        {r.label}
                        <span className="text-[10px] text-muted/40">{r.pct}</span>
                      </span>
                      <span className="font-mono">{formatCurrency(r.value)}</span>
                    </div>
                    <AnimatePresence>
                      {expandedFee === r.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-muted/60 leading-relaxed mt-2 pr-4"
                        >
                          {r.detail}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.button>
                ))}
                <div className="border-t border-border pt-2 mt-2 px-3 flex justify-between font-medium text-muted">
                  <span>Total fee</span><span className="font-mono">{formatCurrency(totalFee)}</span>
                </div>
                <div className="px-3 flex justify-between font-medium">
                  <span>Net to merchant</span><span className="font-mono">{formatCurrency(netToMerchant)}</span>
                </div>
              </div>
              <p className="text-muted/40 text-xs italic mt-4">Illustrative. Based on typical blended pricing (2.9% + $0.30). Actual rates vary by processor, card type, and merchant agreement.</p>
            </>
          )}

          {activeChapter === 'failure' && (
            <>
              <Eyebrow>Chapter 5</Eyebrow>
              <Title>What happens when things break</Title>
              <P>Payment success is probabilistic, not guaranteed. Click a failure mode to see how the system responds.</P>
              <div className="space-y-2 mt-3 mb-4">
                {([
                  ['decline', '✕ Decline', 'Issuer rejects', 'border-danger/30 bg-danger/8 text-danger'],
                  ['fraud', '⚠ Fraud flag', 'Risk engine intervenes', 'border-warning/30 bg-warning/8 text-warning'],
                  ['chargeback', '↩ Chargeback', 'Post-settlement reversal', 'border-[var(--color-chargeback)]/30 bg-[var(--color-chargeback)]/8 text-[var(--color-chargeback)]'],
                ] as const).map(([mode, label, sub, activeClasses]) => (
                  <motion.button
                    key={mode}
                    onClick={() => onFailureModeChange(mode)}
                    whileTap={{ scale: 0.97 }}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                      failureMode === mode ? activeClasses : 'border-border text-muted hover:border-accent/20 bg-surface'
                    }`}
                  >
                    <span className="text-sm font-medium block">{label}</span>
                    <span className="text-[11px] text-muted/60">{sub}</span>
                  </motion.button>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {failureMode !== 'none' && (
                  <motion.div key={failureMode} {...fade}>
                    <p className="text-muted text-[15px] leading-relaxed mb-3">
                      {FAILURE_TEXT[failureMode]}
                    </p>
                    {failureMode === 'chargeback' && (
                      <RevealCard trigger="💰 What does the merchant actually lose?">
                        The original payment ({formatCurrency(amount)}), plus a chargeback fee ($15–$25), plus the cost of goods already delivered. If chargeback rates exceed ~1%, acquirers may terminate the merchant account entirely.
                      </RevealCard>
                    )}
                    {failureMode === 'decline' && (
                      <RevealCard trigger="↻ Can the payment be retried?">
                        Soft declines (insufficient funds, network timeout) can often be retried. Hard declines (stolen card, closed account) cannot. Smart retry systems analyze decline codes and retry at optimal times — recovering ~15% of failed subscription payments.
                      </RevealCard>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {activeChapter === 'infrastructure' && (
            <>
              <Eyebrow>Chapter 6</Eyebrow>
              <Title>Why infrastructure companies exist</Title>
              <P>Now that you&rsquo;ve seen the full system &mdash; the fragmentation, the delays, the failure modes &mdash; the existence of modern payment service providers makes intuitive sense.</P>
              <P>Companies like Stripe, Adyen, and Square create value by compressing this operational complexity into a single integration.</P>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[{ title: 'Without a PSP', items: WITHOUT_PSP }, { title: 'With a modern PSP', items: WITH_PSP }].map((col) => (
                  <div key={col.title} className="bg-surface border border-border rounded-xl p-4">
                    <h4 className="text-xs font-medium mb-3 tracking-wide">{col.title}</h4>
                    <ul className="space-y-2 text-sm text-muted">
                      {col.items.map((item) => (
                        <li key={item} className="flex gap-2 items-start">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted/40 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="text-muted/40 text-xs italic mt-6">This is not endorsement of any specific provider. It is a structural observation about why these companies exist.</p>
            </>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
