'use client';

import { useState, useEffect, useCallback } from 'react';

interface VideoOptimization {
  /** Whether to load video at all (false on slow networks or reduced-motion) */
  shouldLoadVideo: boolean;
  /** Whether to show the poster image (true while video loads, or as fallback) */
  shouldShowPoster: boolean;
  /** Whether user prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Detected effective connection type */
  connectionType: string | null;
  /** Whether the device is mobile */
  isMobile: boolean;
}

/**
 * Hook that detects network speed, reduced-motion preference, and device type
 * to determine optimal video loading strategy.
 *
 * - Slow connections (2g, slow-2g, 3g) → poster only, no video download
 * - prefers-reduced-motion → poster only, no autoplay
 * - Fast connection + no motion preference → load and autoplay video
 */
export function useVideoOptimization(): VideoOptimization {
  const [state, setState] = useState<VideoOptimization>({
    shouldLoadVideo: false,
    shouldShowPoster: true,
    prefersReducedMotion: false,
    connectionType: null,
    isMobile: false,
  });

  const evaluate = useCallback(() => {
    if (typeof window === 'undefined') return;

    // 1. Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersReducedMotion = motionQuery.matches;

    // 2. Network speed via Navigator.connection API
    const conn = (navigator as any).connection;
    const effectiveType: string | null = conn?.effectiveType ?? null;
    const isSlowNetwork = effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g';

    // 3. Device type
    const isMobile = window.innerWidth < 640;

    // Determine strategy
    const shouldLoadVideo = !prefersReducedMotion && !isSlowNetwork;

    setState({
      shouldLoadVideo,
      shouldShowPoster: !shouldLoadVideo,
      prefersReducedMotion,
      connectionType: effectiveType,
      isMobile,
    });
  }, []);

  useEffect(() => {
    evaluate();

    // Re-evaluate on resize (mobile ↔ desktop switch)
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      setState((prev) => ({ ...prev, isMobile }));
    };

    // Re-evaluate on connection change
    const conn = (navigator as any).connection;
    conn?.addEventListener?.('change', evaluate);
    window.addEventListener('resize', handleResize);

    // Listen for reduced-motion changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', evaluate);

    return () => {
      conn?.removeEventListener?.('change', evaluate);
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', evaluate);
    };
  }, [evaluate]);

  return state;
}
