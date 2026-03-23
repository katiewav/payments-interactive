'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PersistentDiagram from '@/components/PersistentDiagram';
import ChapterNarrative from '@/components/ChapterNarrative';
import ThemeToggle from '@/components/ThemeToggle';
import MethodologyNote from '@/components/MethodologyNote';
import { CHAPTERS, type ChapterId } from '@/lib/chapters';

export default function Home() {
  const [activeChapter, setActiveChapter] = useState<ChapterId>('hero');
  const [failureMode, setFailureMode] = useState<'none' | 'decline' | 'fraud' | 'chargeback'>('none');
  const [amount, setAmount] = useState(100);
  const chapterRefs = useRef<Map<ChapterId, HTMLElement>>(new Map());
  const narrativeStartRef = useRef<HTMLDivElement>(null);

  // Intersection observer to detect which chapter is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const chapterIds: ChapterId[] = CHAPTERS.map(c => c.id);

    chapterIds.forEach((id) => {
      const el = chapterRefs.current.get(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveChapter(id);
              // Reset failure mode when leaving the failure chapter
              if (id !== 'failure') {
                setFailureMode('none');
              } else if (failureMode === 'none') {
                setFailureMode('decline');
              }
            }
          });
        },
        { threshold: 0.5, rootMargin: '-10% 0px -40% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [failureMode]);

  const scrollToStart = useCallback(() => {
    narrativeStartRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const setChapterRef = useCallback((id: ChapterId, el: HTMLElement | null) => {
    if (el) chapterRefs.current.set(id, el);
  }, []);

  // Progress indicator
  const chapterIndex = CHAPTERS.findIndex(c => c.id === activeChapter);
  const totalChapters = CHAPTERS.filter(c => c.number !== null).length;
  const currentNumber = CHAPTERS.find(c => c.id === activeChapter)?.number;

  return (
    <main className="relative">
      <ThemeToggle />

      {/* Progress indicator — fixed */}
      <AnimatePresence>
        {activeChapter !== 'hero' && activeChapter !== 'takeaway' && currentNumber && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-2"
          >
            {CHAPTERS.filter(c => c.number !== null).map((ch) => (
              <button
                key={ch.id}
                onClick={() => chapterRefs.current.get(ch.id)?.scrollIntoView({ behavior: 'smooth' })}
                className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  ch.id === activeChapter
                    ? 'bg-accent scale-125'
                    : ch.number! <= (currentNumber ?? 0)
                    ? 'bg-accent/40'
                    : 'bg-border'
                }`}
                aria-label={`Go to chapter ${ch.number}`}
              />
            ))}
            <span className="text-[9px] text-muted/40 font-mono mt-1">{currentNumber}/{totalChapters}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section
        ref={(el) => setChapterRef('hero', el)}
        className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      >
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="relative z-10 max-w-3xl text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-[10px] tracking-[0.3em] uppercase text-muted/50 mb-6"
          >
            An interactive explainer
          </motion.p>

          <h1
            className="text-4xl sm:text-5xl md:text-7xl font-light leading-[1.1] mb-8"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            The invisible supply chain{' '}
            <span className="text-accent">behind every tap.</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12"
          >
            A card payment feels instantaneous. It isn&apos;t. Beneath a single tap is a chain of
            intermediaries coordinating data, risk, and money across different time horizons.
          </motion.p>

          {/* Mini teaser diagram */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="flex items-center justify-center gap-4 mb-12"
          >
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full border border-accent/40 flex items-center justify-center">
                <span className="text-accent text-sm font-mono">$100</span>
              </div>
              <span className="text-[10px] text-muted">Customer</span>
            </div>
            <div className="flex items-center gap-1">
              <motion.div
                className="h-px bg-accent/30"
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="text-accent text-xs"
              >?</motion.span>
              <motion.div
                className="h-px bg-accent/30"
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ delay: 1.8, duration: 0.8 }}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center">
                <span className="text-muted text-xs font-mono">?</span>
              </div>
              <span className="text-[10px] text-muted">Merchant</span>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            onClick={scrollToStart}
            className="group inline-flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors cursor-pointer"
          >
            <span>What actually happens?</span>
            <motion.span
              animate={{ y: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-accent"
            >
              ↓
            </motion.span>
          </motion.button>
        </motion.div>
      </section>

      {/* ═══════════════════ SCROLLYTELLING CHAPTERS ═══════════════════ */}
      <div ref={narrativeStartRef} />

      {CHAPTERS.filter(c => c.id !== 'hero' && c.id !== 'takeaway').map((chapter) => (
        <section
          key={chapter.id}
          ref={(el) => setChapterRef(chapter.id, el)}
          className="min-h-screen px-6 py-16 md:py-24"
        >
          <div className="max-w-7xl mx-auto">
            {/* Two-column layout: narrative left, diagram right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              {/* Narrative panel */}
              <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">
                <ChapterNarrative
                  activeChapter={chapter.id}
                  onFailureModeChange={setFailureMode}
                  failureMode={failureMode}
                  amount={amount}
                  onAmountChange={setAmount}
                />
              </div>

              {/* Persistent diagram panel */}
              <div className="lg:col-span-7">
                <div className="lg:sticky lg:top-16 bg-surface border border-border rounded-2xl p-4 md:p-6">
                  <PersistentDiagram
                    activeChapter={chapter.id}
                    failureMode={chapter.id === 'failure' ? failureMode : 'none'}
                    amount={amount}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ═══════════════════ FINAL TAKEAWAY ═══════════════════ */}
      <section
        ref={(el) => setChapterRef('takeaway', el)}
        className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 relative"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl text-center"
        >
          <div className="w-16 h-px bg-accent mx-auto mb-10" />

          <h2
            className="text-3xl md:text-5xl font-light leading-tight mb-8"
            style={{ fontFamily: 'var(--font-editorial)' }}
          >
            A payment is not a straight line.
          </h2>

          <p className="text-muted text-lg leading-relaxed mb-10">
            It is a temporary coordination between institutions with different
            incentives, timeframes, and risk models.
          </p>

          {/* Three sticky takeaways */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { accent: '01', text: 'Approval is not settlement' },
              { accent: '02', text: 'Simplicity is mostly interface' },
              { accent: '03', text: 'Infrastructure is complexity compression' },
            ].map((item) => (
              <motion.div
                key={item.accent}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: parseInt(item.accent) * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                className="bg-surface border border-border rounded-xl p-4"
              >
                <span className="text-accent font-mono text-xs block mb-2">{item.accent}</span>
                <p className="text-sm text-foreground">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <p className="text-muted/40 text-sm italic mb-6">
            &ldquo;The interface suggests finality. The infrastructure does not.&rdquo;
          </p>

          <div className="h-px bg-border mb-8" />

          {/* Footer */}
          <div className="space-y-3">
            <p className="text-muted/50 text-xs">
              Built as an independent interactive explainer of how digital payments work.
            </p>
            <p className="text-muted/40 text-xs">
              Made by{' '}
              <a
                href="https://twitter.com/katiewav"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent/60 hover:text-accent transition-colors"
              >
                @katiewav
              </a>
            </p>
            <MethodologyNote />
          </div>
        </motion.div>
      </section>
    </main>
  );
}
