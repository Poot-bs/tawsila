'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { HeroVideoSection } from '@/components/shared/HeroVideoSection';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

/* ─── Animation Presets ─── */
const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.4 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/* ─── Feature Icons (inline SVG for zero-dependency) ─── */
const FEATURE_ICONS: Record<string, React.ReactNode> = {
  smartMatch: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /><path d="m11 8v6" /><path d="m8 11h6" />
    </svg>
  ),
  securePayment: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" /><path d="M2 10h20" />
    </svg>
  ),
  realTimeChat: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  ratings: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  instantBooking: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  mapPreview: (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" /><line x1="9" x2="9" y1="3" y2="18" /><line x1="15" x2="15" y1="6" y2="21" />
    </svg>
  ),
};

const FEATURE_KEYS = ['smartMatch', 'securePayment', 'realTimeChat', 'ratings', 'instantBooking', 'mapPreview'] as const;

/* ─── Step icons for How It Works ─── */
const STEP_ICONS = [
  <svg key="s" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>,
  <svg key="b" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="M12 5v14" /></svg>,
  <svg key="g" className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M15 18H9" /><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" /><circle cx="17" cy="18" r="2" /><circle cx="7" cy="18" r="2" /></svg>,
];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function LandingPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <Header />

      {/* ═══════════════ HERO ═══════════════ */}
      <HeroVideoSection>
        <motion.div
          className="max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-semibold text-accent tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#BFDBF7] animate-pulse" />
              {t('hero.badge')}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg"
            variants={fadeUp}
          >
            {t('hero.title')}{' '}
            <br className="hidden sm:block" />
            <span className="text-accent drop-shadow-md">{t('hero.titleHighlight')}</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-lg sm:text-xl md:text-2xl text-[#E1E5F2] mb-10 drop-shadow max-w-2xl mx-auto leading-relaxed"
            variants={fadeUp}
          >
            {t('hero.subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            variants={fadeUp}
          >
            <Link href="/trips" className="w-full sm:w-auto" id="hero-cta-find">
              <button
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-full transition-all duration-300 shadow-xl shadow-primary/40 flex items-center justify-center gap-2 group"
                aria-label={t('hero.ctaPrimary')}
              >
                {t('hero.ctaPrimary')}
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </Link>

            <Link href="/trips/create" className="w-full sm:w-auto" id="hero-cta-offer">
              <button
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-lg rounded-full backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 shadow-lg"
                aria-label={t('hero.ctaSecondary')}
              >
                {t('hero.ctaSecondary')}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </Link>
          </motion.div>

          {/* Trust badge */}
          <motion.p
            variants={fadeUp}
            className="mt-10 text-sm text-white/50 font-medium tracking-wide"
          >
            {t('hero.trustedBy')}
          </motion.p>
        </motion.div>
      </HeroVideoSection>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features" className="py-24 sm:py-32 bg-[var(--surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)]"
              variants={fadeUp}
            >
              {t('features.sectionTitle')}
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-[var(--text-muted)] max-w-2xl mx-auto"
              variants={fadeUp}
            >
              {t('features.sectionSubtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {FEATURE_KEYS.map((key) => (
              <motion.div
                key={key}
                variants={scaleIn}
                className="group relative p-8 rounded-2xl bg-[var(--bg)] border border-[var(--border)] hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  {FEATURE_ICONS[key]}
                </div>
                <h3 className="text-xl font-bold text-[var(--text)] mb-3">
                  {t(`features.${key}.title`)}
                </h3>
                <p className="text-[var(--text-muted)] leading-relaxed">
                  {t(`features.${key}.description`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how-it-works" className="py-24 sm:py-32 bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)]"
              variants={fadeUp}
            >
              {t('howItWorks.sectionTitle')}
            </motion.h2>
            <motion.p
              className="mt-4 text-lg text-[var(--text-muted)]"
              variants={fadeUp}
            >
              {t('howItWorks.sectionSubtitle')}
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {[1, 2, 3].map((step, i) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number circle */}
                <div className="relative mb-6">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary border-2 border-primary/20">
                    {STEP_ICONS[i]}
                  </div>
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-extrabold shadow-lg shadow-primary/30">
                    {step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[var(--text)] mb-3">
                  {t(`howItWorks.step${step}.title`)}
                </h3>
                <p className="text-[var(--text-muted)] leading-relaxed max-w-xs">
                  {t(`howItWorks.step${step}.description`)}
                </p>

                {/* Connector line (not on last) */}
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+60px)] w-[calc(100%-120px)] h-0.5 bg-gradient-to-r from-primary/30 to-primary/10" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SOCIAL PROOF / STATS ═══════════════ */}
      <section className="py-20 sm:py-28 bg-secondary text-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
          >
            <motion.h2
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              variants={fadeUp}
            >
              {t('socialProof.sectionTitle')}
            </motion.h2>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {[1, 2, 3, 4].map((n) => (
              <motion.div
                key={n}
                variants={scaleIn}
                className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <p className="text-3xl sm:text-4xl font-extrabold text-accent mb-2">
                  {t(`socialProof.stat${n}Value`)}
                </p>
                <p className="text-sm font-semibold text-white/60 uppercase tracking-wider">
                  {t(`socialProof.stat${n}Label`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-24 sm:py-32 bg-[var(--surface)]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={stagger}
          >
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[var(--text)] mb-6"
              variants={fadeUp}
            >
              {t('cta.title')}
            </motion.h2>
            <motion.p
              className="text-lg text-[var(--text-muted)] mb-10 max-w-2xl mx-auto"
              variants={fadeUp}
            >
              {t('cta.subtitle')}
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/register" id="cta-register">
                <button className="px-10 py-4 bg-primary hover:bg-primary-dark text-white font-bold text-lg rounded-full transition-all duration-300 shadow-xl shadow-primary/30 hover:shadow-primary/50 hover:scale-105">
                  {t('cta.button')}
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
