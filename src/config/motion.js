// JavaScript scheduling only. Visual durations/delays live in
// src/styles/motion/_settings.sass. All time values below are milliseconds.
export const motionConfig = {
  reveal: {
    threshold: 0.15,
    rootMargin: '0px',
  },
  carousel: {
    intervalMs: 5000,
    heroInitialDelayMs: 3300,
  },
  reducedMotionQuery: '(prefers-reduced-motion: reduce)',
};
