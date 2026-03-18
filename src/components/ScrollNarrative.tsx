'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/lib/hooks';
import AnnotationCard from './AnnotationCard';
import ScaleCallout from './ScaleCallout';
import { annotations } from '@/lib/annotationData';

function Scene({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { ref, isInView } = useInView(0.15);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      className={`max-w-3xl mx-auto ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SceneLabel({ label }: { label: string }) {
  return (
    <span className="text-[10px] tracking-[0.25em] uppercase text-muted/60 block mb-4" aria-hidden="true">
      {label}
    </span>
  );
}

function FlowChain({ nodes, highlighted }: { nodes: { name: string; sub?: string }[]; highlighted?: string[] }) {
  return (
    <div className="flex items-center gap-0 flex-wrap justify-center my-8" role="list" aria-label="Payment chain">
      {nodes.map((node, i) => {
        const isHighlighted = highlighted?.includes(node.name);
        return (
          <div key={node.name} className="flex items-center" role="listitem">
            <div
              className={`px-4 py-2 rounded-lg border text-sm transition-all text-center ${
                isHighlighted
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-surface border-border text-muted'
              }`}
            >
              <span className="block">{node.name}</span>
              {node.sub && <span className="text-[9px] text-muted/60 block">{node.sub}</span>}
            </div>
            {i < nodes.length - 1 && (
              <div className="mx-1 text-muted/30" aria-hidden="true">→</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FeeLayer({
  label,
  amount,
  color,
  annotation,
}: {
  label: string;
  amount: string;
  color: string;
  annotation?: (typeof annotations)[number];
}) {
  const inner = (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
      <span className="text-sm text-muted flex-1">{label}</span>
      <span className="text-sm font-mono text-foreground">{amount}</span>
    </div>
  );

  if (annotation) {
    return (
      <AnnotationCard annotation={annotation} position="left" block>
        {inner}
      </AnnotationCard>
    );
  }
  return inner;
}

const getAnnotation = (id: string) => annotations.find((a) => a.id === id)!;

export default function ScrollNarrative() {
  return (
    <section className="relative py-32 px-6" aria-label="Payment system explainer">
      <div className="space-y-40">
        {/* Scene A: The Simple Version */}
        <Scene>
          <SceneLabel label="The Simple Version" />
          <h2
            className="text-3xl md:text-4xl font-light leading-tight mb-4"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            You pay. They get paid.
          </h2>
          <p className="text-muted text-lg leading-relaxed mb-8">
            The mental model most people carry: money moves directly from customer
            to merchant. $100 in, $100 out. Instant.
          </p>

          <div className="flex items-center justify-center gap-8 my-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                <span className="text-xl" aria-hidden="true">👤</span>
              </div>
              <span className="text-xs text-muted">Cardholder</span>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
              className="h-px w-40 bg-gradient-to-r from-accent/60 to-accent/20 origin-left"
              aria-hidden="true"
            />

            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-surface-elevated border border-border flex items-center justify-center">
                <span className="text-xl" aria-hidden="true">🏪</span>
              </div>
              <span className="text-xs text-muted">Merchant</span>
            </div>
          </div>

          <p className="text-center text-muted/60 text-sm italic">
            This is the illusion.
          </p>
        </Scene>

        {/* Scene B: The Actual Route */}
        <Scene>
          <SceneLabel label="The Actual Route" />
          <h2
            className="text-3xl md:text-4xl font-light leading-tight mb-4"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            Behind the tap.
          </h2>
          <p className="text-muted text-lg leading-relaxed mb-2">
            The classic card model has four parties: cardholder, issuing bank,
            card network, and acquiring bank. On top of that sits a processor layer
            that most merchants interact with instead of the banks directly.
          </p>
          <p className="text-muted text-lg leading-relaxed mb-4">
            Each intermediary has a role, a cost, and a delay.
          </p>

          <FlowChain
            nodes={[
              { name: 'Cardholder' },
              { name: 'Issuer', sub: "Cardholder's Bank" },
              { name: 'Network', sub: 'Visa / MC' },
              { name: 'Acquirer', sub: "Merchant's Bank" },
              { name: 'Processor' },
              { name: 'Merchant' },
            ]}
            highlighted={['Issuer', 'Network', 'Acquirer', 'Processor']}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8" role="list" aria-label="Payment participants">
            {[
              { annotation: getAnnotation('issuer'), label: 'Issuing Bank' },
              { annotation: getAnnotation('network'), label: 'Card Network' },
              { annotation: getAnnotation('acquirer'), label: 'Acquiring Bank' },
              { annotation: getAnnotation('processor'), label: 'Processor' },
            ].map(({ annotation, label }) => (
              <AnnotationCard key={label} annotation={annotation} position="bottom">
                <div className="p-3 bg-surface rounded-lg border border-border hover:border-accent/30 transition-colors text-center cursor-pointer w-full" role="listitem">
                  <span className="text-xs text-accent block mb-1" aria-hidden="true">ⓘ</span>
                  <span className="text-sm text-foreground">{label}</span>
                </div>
              </AnnotationCard>
            ))}
          </div>

          <ScaleCallout
            stat="791 billion"
            text="Globally, card networks handled roughly 791 billion transactions in 2024. Every one passed through a chain like this."
          />
        </Scene>

        {/* Scene C: Fees */}
        <Scene>
          <SceneLabel label="The Fees" />
          <h2
            className="text-3xl md:text-4xl font-light leading-tight mb-4"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            Your $100 does not arrive intact.
          </h2>
          <p className="text-muted text-lg leading-relaxed mb-8">
            With blended pricing, the merchant sees one fee — typically 2.9% + $0.30
            for a domestic online card payment. Inside that rate, revenue is split
            between the issuing bank, the network, and the processor.
          </p>

          {/* Visual fee breakdown — blended model */}
          <div className="relative my-10">
            {/* Gross amount bar */}
            <div className="h-12 bg-accent/20 rounded-lg relative overflow-hidden mb-1">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.3 }}
                viewport={{ once: true }}
                className="h-full bg-accent/10 rounded-lg"
              />
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <span className="text-sm text-foreground font-mono">$100.00</span>
                <span className="text-xs text-muted">Gross Payment</span>
              </div>
            </div>

            {/* Fee layer — single blended rate */}
            <div className="pl-4 border-l border-border ml-6 mt-4 space-y-1">
              <FeeLayer
                label="Blended processor fee (2.9% + $0.30)"
                amount="-$3.20"
                color="var(--color-fee-processor)"
                annotation={getAnnotation('processor')}
              />
            </div>

            {/* Net amount */}
            <div className="mt-6">
              <div className="h-12 bg-success/15 rounded-lg relative overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '96.8%' }}
                  transition={{ duration: 1.5, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="h-full bg-success/10 rounded-lg"
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <span className="text-sm text-success font-mono font-medium">
                    $96.80
                  </span>
                  <span className="text-xs text-muted">Net to Merchant</span>
                </div>
              </div>
            </div>

            {/* Educational note */}
            <p className="text-xs text-muted/50 mt-4 pl-10 italic">
              Inside that $3.20: roughly $1.80 goes to the issuing bank (interchange),
              $0.13 to the card network, and the remainder to the processor.
            </p>
          </div>
        </Scene>

        {/* Scene D: Time */}
        <Scene>
          <SceneLabel label="The Time" />
          <h2
            className="text-3xl md:text-4xl font-light leading-tight mb-4"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            Time delays accumulate.
          </h2>
          <p className="text-muted text-lg leading-relaxed mb-8">
            Authorization is fast. Everything else takes days.
          </p>

          <div className="space-y-6 my-10">
            {[
              {
                label: 'Authorization',
                time: '~1–3 seconds',
                width: '2%',
                color: 'var(--color-accent)',
                annotation: getAnnotation('authorization'),
              },
              {
                label: 'Settlement',
                time: '1–3 business days',
                width: '40%',
                color: 'var(--color-warning)',
                annotation: getAnnotation('settlement'),
              },
              {
                label: 'Payout',
                time: '2–7 business days',
                width: '85%',
                color: 'var(--color-fee-processor)',
                annotation: getAnnotation('payout'),
              },
            ].map((item) => (
              <AnnotationCard key={item.label} annotation={item.annotation} position="bottom" block>
                <div className="cursor-pointer group w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground group-hover:text-accent transition-colors">
                      {item.label}
                    </span>
                    <span className="text-xs font-mono text-muted">{item.time}</span>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: item.width }}
                      transition={{ duration: 1.2, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="h-full rounded-full"
                      style={{ background: item.color }}
                    />
                  </div>
                </div>
              </AnnotationCard>
            ))}
          </div>

          <p className="text-sm text-muted/60 text-center italic">
            The money is &ldquo;in motion&rdquo; — authorized but not yet landed.
          </p>
        </Scene>

        {/* Scene E: Failure / Retry */}
        <Scene>
          <SceneLabel label="The Failure Path" />
          <h2
            className="text-3xl md:text-4xl font-light leading-tight mb-4"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            Some payments fail. Some recover.
          </h2>
          <p className="text-muted text-lg leading-relaxed mb-8">
            Payment success is probabilistic, not guaranteed. Soft declines
            from temporary issues — insufficient funds, network timeouts, issuer
            throttling — can sometimes be recovered with retry logic.
          </p>

          <AnnotationCard annotation={getAnnotation('retry')} position="bottom" block>
            <div className="bg-surface border border-border rounded-xl p-6 my-8 cursor-pointer hover:border-accent/30 transition-colors w-full">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center shrink-0">
                    <span className="text-danger text-xs" aria-hidden="true">✕</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground">Attempt 1</div>
                    <div className="text-xs text-muted">Insufficient funds — soft decline</div>
                  </div>
                  <span className="text-xs font-mono text-danger">Failed</span>
                </div>
                <div className="flex items-center gap-4 pl-3">
                  <div className="w-px h-6 bg-border ml-[14px]" aria-hidden="true" />
                  <span className="text-xs text-muted">Retry after 4 hours</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0">
                    <span className="text-success text-xs" aria-hidden="true">✓</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground">Attempt 2</div>
                    <div className="text-xs text-muted">Approved — funds available</div>
                  </div>
                  <span className="text-xs font-mono text-success">Success</span>
                </div>
              </div>
            </div>
          </AnnotationCard>
        </Scene>

        {/* Scene F: Chargeback */}
        <Scene>
          <SceneLabel label="The Dispute" />
          <h2
            className="text-3xl md:text-4xl font-light leading-tight mb-4"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            Chargebacks reverse the flow.
          </h2>
          <p className="text-muted text-lg leading-relaxed mb-4">
            When a cardholder disputes a transaction, the entire payment
            reverses — through every intermediary, back to the customer.
            The merchant loses the payment, pays a fee, and may lose the goods already delivered.
          </p>

          <ScaleCallout
            stat="324 million annually"
            text="Chargebacks are not edge cases. Global chargeback volume is projected to reach 324 million transactions per year by 2028."
          />

          <AnnotationCard annotation={getAnnotation('chargeback')} position="bottom" block>
            <div className="bg-surface border border-border rounded-xl p-6 my-8 cursor-pointer hover:border-[var(--color-chargeback)]/30 transition-colors w-full">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-chargeback)]/20 flex items-center justify-center shrink-0">
                    <span className="text-[var(--color-chargeback)] text-xs" aria-hidden="true">⟲</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground">Cardholder files dispute</div>
                    <div className="text-xs text-muted">Issuing bank initiates chargeback</div>
                  </div>
                  <span className="text-xs font-mono text-[var(--color-chargeback)]">Day 0</span>
                </div>
                <div className="flex items-center gap-4 pl-3">
                  <div className="w-px h-6 bg-border ml-[14px]" aria-hidden="true" />
                  <span className="text-xs text-muted">Funds pulled back: Issuer → Network → Acquirer → Processor → Merchant</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-chargeback)]/20 flex items-center justify-center shrink-0">
                    <span className="text-[var(--color-chargeback)] text-xs" aria-hidden="true">$</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-foreground">Merchant debited + chargeback fee</div>
                    <div className="text-xs text-muted">$100 + ~$15 fee. Can submit evidence to dispute.</div>
                  </div>
                  <span className="text-xs font-mono text-[var(--color-chargeback)]">60–120 days</span>
                </div>
              </div>
            </div>
          </AnnotationCard>
        </Scene>

        {/* Scene G: What the Processor Actually Does */}
        <Scene>
          <SceneLabel label="The Coordination Layer" />
          <h2
            className="text-3xl md:text-4xl font-light leading-tight mb-4"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            What does the processor actually do?
          </h2>
          <p className="text-muted text-lg leading-relaxed mb-4">
            Without a processor, a merchant would typically need to negotiate directly with
            an acquiring bank, integrate with card networks, build fraud screening,
            handle PCI compliance, and reconcile transactions manually.
          </p>
          <p className="text-muted text-lg leading-relaxed mb-10">
            The processor sits between the merchant and the acquiring layer.
            Depending on configuration, it can coordinate much of the payment
            lifecycle on the merchant&apos;s behalf.
          </p>

          {/* Detailed breakdown */}
          <div className="space-y-4 my-8">
            {[
              {
                icon: '⟨⟩',
                title: 'Unified API layer',
                body: 'A single integration can replace direct bank relationships for many merchants. Some processors can route transactions to different acquirers based on card type or geography.',
              },
              {
                icon: '⊘',
                title: 'Fraud and risk screening',
                body: 'Before forwarding to the acquirer, the processor can evaluate fraud signals — velocity checks, device fingerprinting, address verification — and decide whether to block, flag, or allow the transaction.',
              },
              {
                icon: '⇄',
                title: 'Network routing',
                body: 'In some configurations, transactions can be routed through multiple networks. The processor may select the path with a better combination of cost and approval rate.',
              },
              {
                icon: '↻',
                title: 'Decline recovery',
                body: 'When a payment fails with a soft decline, the processor can retry at a later time. For recurring billing, this can help recover a portion of otherwise-lost revenue.',
              },
              {
                icon: '≡',
                title: 'Settlement reconciliation',
                body: 'The processor tracks transactions through clearing and settlement, matching authorizations against actual settled amounts and flagging discrepancies.',
              },
              {
                icon: '→',
                title: 'Payout coordination',
                body: 'After settlement, the processor calculates the net amount, holds reserves if needed, and initiates the payout to the merchant on the agreed schedule.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex gap-4 p-4 bg-surface border border-border rounded-xl"
              >
                <span className="text-lg text-accent font-mono mt-0.5 shrink-0 w-8 text-center" aria-hidden="true">
                  {item.icon}
                </span>
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">{item.title}</h4>
                  <p className="text-xs text-muted leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-muted/60 text-center italic mt-4">
            The processor abstracts complexity. It does not remove it.
          </p>
        </Scene>
      </div>
    </section>
  );
}
