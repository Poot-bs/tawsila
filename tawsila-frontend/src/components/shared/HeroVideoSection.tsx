'use client';

import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useVideoOptimization } from '@/hooks/useVideoOptimization';
import { VIDEO_CONFIG } from '@/lib/video.config';

/* ─── Types ─── */
interface HeroVideoProps {
  /** Override desktop MP4 source */
  desktopVideoSrc?: string;
  /** Override mobile MP4 source */
  mobileVideoSrc?: string;
  /** Override desktop poster */
  posterImage?: string;
  /** Override mobile poster */
  mobilePosterImage?: string;
  /** Override fallback gradient */
  fallbackBackgroundGradient?: string;
  /** Content overlay (heading, CTA buttons, etc.) */
  children?: ReactNode;
  /** Additional class for the outer section */
  className?: string;
}

type LoadState = 'idle' | 'loading' | 'playing' | 'poster' | 'fallback';

/* ─── Analytics helpers (no-op stubs — wire to your analytics provider) ─── */
function trackVideoEvent(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.debug(`[HeroVideo] ${event}`, data);
  }
}

/* ─── Component ─── */
export function HeroVideoSection({
  desktopVideoSrc = VIDEO_CONFIG.desktop.mp4,
  mobileVideoSrc = VIDEO_CONFIG.mobile.mp4,
  posterImage = VIDEO_CONFIG.desktop.poster,
  mobilePosterImage = VIDEO_CONFIG.mobile.poster,
  fallbackBackgroundGradient = VIDEO_CONFIG.fallbackGradient,
  children,
  className,
}: HeroVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const { shouldLoadVideo, isMobile } = useVideoOptimization();

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [isInView, setIsInView] = useState(false);

  /* ─── Intersection Observer for lazy loading ─── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: VIDEO_CONFIG.lazyLoad.rootMargin,
        threshold: VIDEO_CONFIG.lazyLoad.threshold,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ─── Load timeout: if video hasn't played in N seconds, fall back ─── */
  useEffect(() => {
    if (loadState === 'loading') {
      timeoutRef.current = setTimeout(() => {
        setLoadState('poster');
        trackVideoEvent('timeout', { ms: VIDEO_CONFIG.loadTimeoutMs });
      }, VIDEO_CONFIG.loadTimeoutMs);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [loadState]);

  /* ─── Determine effective state ─── */
  useEffect(() => {
    if (!isInView) return;

    if (shouldReduceMotion || !shouldLoadVideo) {
      setLoadState('poster');
      trackVideoEvent('poster-mode', {
        reason: shouldReduceMotion ? 'reduced-motion' : 'slow-network',
      });
    } else {
      setLoadState('loading');
    }
  }, [isInView, shouldReduceMotion, shouldLoadVideo]);

  /* ─── Video event handlers ─── */
  const handleCanPlay = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoadState('playing');
    trackVideoEvent('playing');
  }, []);

  const handleError = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLoadState('poster');
    trackVideoEvent('error');
  }, []);

  /* ─── Pause / resume based on reduced-motion toggle ─── */
  useEffect(() => {
    const activeRef = isMobile ? mobileVideoRef : desktopVideoRef;
    const vid = activeRef.current;
    if (!vid) return;

    if (shouldReduceMotion) {
      vid.pause();
    } else if (loadState === 'playing') {
      vid.play().catch(() => {});
    }
  }, [shouldReduceMotion, loadState, isMobile]);

  const shouldRenderVideo = isInView && shouldLoadVideo && !shouldReduceMotion;
  const isPlaying = loadState === 'playing';
  const showPoster = !isPlaying && loadState !== 'fallback';
  const showFallbackGradient = loadState === 'fallback';

  return (
    <section
      ref={containerRef}
      className={`relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-secondary ${className ?? ''}`}
      aria-label="Hero section with background video"
      role="banner"
    >
      {/* ─── Screen-reader-only description ─── */}
      <p className="sr-only">
        Tawsila university carpooling platform — cinematic background showing
        connected mobility paths across a campus landscape.
      </p>

      {/* ─── Video Layer (Desktop) ─── */}
      {shouldRenderVideo && !isMobile && (
        <video
          ref={desktopVideoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            loadState === 'playing' ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onCanPlay={handleCanPlay}
          onError={handleError}
          aria-hidden="true"
          tabIndex={-1}
          style={{ aspectRatio: VIDEO_CONFIG.desktop.aspectRatio }}
        >
          <source src={desktopVideoSrc} type="video/mp4" />
        </video>
      )}

      {/* ─── Video Layer (Mobile) ─── */}
      {shouldRenderVideo && isMobile && (
        <video
          ref={mobileVideoRef}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            loadState === 'playing' ? 'opacity-100' : 'opacity-0'
          }`}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          onCanPlay={handleCanPlay}
          onError={handleError}
          aria-hidden="true"
          tabIndex={-1}
          style={{ aspectRatio: VIDEO_CONFIG.mobile.aspectRatio }}
        >
          <source src={mobileVideoSrc} type="video/mp4" />
        </video>
      )}

      {/* ─── Poster / Static Fallback ─── */}
      {showPoster && (
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-700"
          style={{
            backgroundImage: `url(${isMobile ? mobilePosterImage : posterImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isPlaying ? 0 : 1,
          }}
          aria-hidden="true"
        />
      )}

      {/* ─── Gradient fallback (when everything fails) ─── */}
      {showFallbackGradient && (
        <div
          className="absolute inset-0 w-full h-full animate-gradient"
          style={{
            background: fallbackBackgroundGradient,
            backgroundSize: '400% 400%',
          }}
          aria-hidden="true"
        />
      )}

      {/* ─── Static background for poster/fallback states ─── */}
      {(showPoster || showFallbackGradient) && !shouldRenderVideo && (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ background: fallbackBackgroundGradient }}
          aria-hidden="true"
        />
      )}

      {/* ─── Gradient Overlay for text contrast (WCAG AA ≥ 4.5:1) ─── */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(2,43,58,0.55) 0%, rgba(2,43,58,0.25) 40%, rgba(2,43,58,0.35) 60%, rgba(2,43,58,0.85) 100%)',
        }}
        aria-hidden="true"
      />
      {/* Teal tint overlay */}
      <div
        className="absolute inset-0 bg-primary/10 mix-blend-overlay pointer-events-none z-[1]"
        aria-hidden="true"
      />

      {/* ─── Reduced-motion subtle CSS animation (parallax fade) ─── */}
      {shouldReduceMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[1]"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(31,122,140,0.15) 0%, transparent 70%)',
          }}
          aria-hidden="true"
        />
      )}

      {/* ─── Content Overlay ─── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {children}
      </div>

      {/* ─── Loading shimmer while video loads ─── */}
      {loadState === 'loading' && (
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-secondary animate-pulse opacity-30" />
        </div>
      )}
    </section>
  );
}

export default HeroVideoSection;
