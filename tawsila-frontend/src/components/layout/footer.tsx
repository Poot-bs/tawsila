'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { systemApi } from '@/lib/api';
import type { SystemHealth } from '@/types';

export function Footer() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    let cancelled = false;
    systemApi
      .health()
      .then((h) => {
        if (!cancelled) setHealth(h);
      })
      .catch(() => {
        if (!cancelled) setHealth(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-bg">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="17" cy="18" r="2" />
                  <circle cx="7" cy="18" r="2" />
                </svg>
              </div>
              <span className="text-xl font-extrabold tracking-tight">Tawsila</span>
            </div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              {t('tagline')}
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              {t('platform')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/trips" className="text-sm text-[var(--text)] hover:text-primary transition-colors">
                  {t('searchTrips')}
                </Link>
              </li>
              <li>
                <Link href="/trips/create" className="text-sm text-[var(--text)] hover:text-primary transition-colors">
                  {t('proposeTrip')}
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-sm text-[var(--text)] hover:text-primary transition-colors">
                  {t('howItWorks')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              {t('legal')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-[var(--text)] hover:text-primary transition-colors">
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--text)] hover:text-primary transition-colors">
                  {t('privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">
              {t('contact')}
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-sm text-[var(--text)] hover:text-primary transition-colors">
                  {t('contactUs')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-[var(--text)] hover:text-primary transition-colors">
                  {t('support')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] flex flex-col items-center gap-2">
          {health && (
            <p className="text-xs font-mono text-[var(--text-muted)]">
              API {health.status} · {health.persistenceMode} · {health.application}
            </p>
          )}
          <p className="text-center text-sm text-[var(--text-muted)]">
            {t('copyright', { year: String(year) })}
          </p>
        </div>
      </div>
    </footer>
  );
}
