/**
 * Video configuration for the Tawsila landing page hero section.
 *
 * Video B — Abstract Mobility (desktop/tablet):
 *   Glowing path lines, node connections, particle movement.
 *   Central safe zone for text overlay. ~3.8 MB MP4.
 *
 * Video C — Mobile Hero:
 *   Portrait, university commuting theme. Loopable vertical display.
 *   Falls back to Video B if not available.
 */

export const VIDEO_CONFIG = {
  desktop: {
    /** Aerial drone shot - Main landing page hero */
    mp4: '/videos/001_An_aerial_drone_shot_glides_smoothly_down_a_wide_4f_Thmw4.mp4',
    poster: '/videos/poster-desktop.svg',
    aspectRatio: '16 / 9',
    width: 1920,
    height: 1080,
  },
  mobile: {
    /** Same drone shot cropped for portrait display */
    mp4: '/videos/001_An_aerial_drone_shot_glides_smoothly_down_a_wide_4f_Thmw4.mp4',
    poster: '/videos/poster-mobile.svg',
    aspectRatio: '4 / 5',
    width: 1080,
    height: 1350,
  },
  auth: {
    /** Abstract Mobility – landscape, digital network style used in Login/Register pages */
    mp4: '/videos/University_Carpool_UI_In_a_digital_network_style_thin_blue_lines_with_A9WAjDA9.mp4',
  },
  /** IntersectionObserver options for lazy loading */
  lazyLoad: {
    rootMargin: '200px 0px',
    threshold: 0.01,
  },
  /** Fallback gradient when all video/poster loading fails */
  fallbackGradient:
    'linear-gradient(135deg, #022B3A 0%, #044359 30%, #1F7A8C 70%, #022B3A 100%)',
  /** Performance budget: max seconds to wait for video before showing poster */
  loadTimeoutMs: 8000,
} as const;
