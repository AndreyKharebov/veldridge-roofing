import { useLayoutEffect, useRef } from 'react';
import { motionConfig } from '../config/motion.js';

const DEFAULT_OPTIONS = Object.freeze({});

// Keep groups/options outside component render (or memoize them). Each group
// describes targets/direction/order, never durations. Dynamic galleries can
// supply idAttribute to remember revealed cards through filter remounts.
export const useMotionReveal = (groups, options = DEFAULT_OPTIONS) => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    const preference = window.matchMedia(motionConfig.reducedMotionQuery);
    if (!root || preference.matches || typeof window.IntersectionObserver !== 'function'
      || (options.dynamic && typeof window.MutationObserver !== 'function')) return;

    const { threshold, rootMargin } = motionConfig.reveal;
    const targets = new Map();
    const pending = new Set();
    const queued = new Set();
    const seen = new Set();
    let disposed = false;
    let disabled = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let viewportFrame = 0;

    const reveal = (element, immediate = false) => {
      if (disposed || !targets.has(element)) return;
      if (!pending.delete(element) && !immediate) return;
      queued.delete(element);
      element.dataset.motionState = immediate ? 'static' : 'visible';
      const identity = targets.get(element);
      if (identity) seen.add(identity);
      observer.unobserve(element);
      if (!pending.size) observer.disconnect();
    };
    const observer = new IntersectionObserver((entries) => {
      if (disposed) return;
      entries.forEach((entry) => {
        if (!root.contains(entry.target)) return;
        if (entry.isIntersecting && entry.intersectionRatio >= threshold) reveal(entry.target);
        else if (entry.boundingClientRect.bottom <= 0) reveal(entry.target, true);
      });
    }, { threshold: [0, threshold], rootMargin });

    // Fast viewport jumps can skip IntersectionObserver samples. Batch reads
    // before writes, and perform no geometry reads after pending becomes empty.
    // IO's normalized rootMargin uses viewport width for percentage offsets.
    const checkViewport = () => {
      viewportFrame = 0;
      if (disposed || disabled || !pending.size) return;
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      const [top, right, bottom, left] = observer.rootMargin.split(' ').map((part) =>
        Number.parseFloat(part) * (part.endsWith('%') ? width / 100 : 1),
      );
      const ready = [];
      pending.forEach((element) => {
        if (!root.contains(element)) return;
        const box = element.getBoundingClientRect();
        if (box.bottom <= 0) {
          ready.push([element, true]);
          return;
        }
        const area = box.width * box.height;
        const visibleWidth = Math.max(0, Math.min(box.right, width + right) - Math.max(box.left, -left));
        const visibleHeight = Math.max(0, Math.min(box.bottom, height + bottom) - Math.max(box.top, -top));
        if (area > 0 && visibleWidth > 0 && visibleHeight > 0
          && visibleWidth * visibleHeight / area >= threshold) ready.push([element, false]);
      });
      ready.forEach(([element, immediate]) => reveal(element, immediate));
    };
    const onViewportChange = () => {
      if (!disposed && !disabled && pending.size && !viewportFrame) {
        viewportFrame = window.requestAnimationFrame(checkViewport);
      }
    };
    const observeAfterPaint = () => {
      if (disposed || disabled || !queued.size || firstFrame || secondFrame) return;
      firstFrame = window.requestAnimationFrame(() => {
        firstFrame = 0;
        secondFrame = window.requestAnimationFrame(() => {
          secondFrame = 0;
          if (disposed || disabled) return;
          queued.forEach((element) => {
            if (pending.has(element) && root.contains(element)) observer.observe(element);
          });
          queued.clear();
          checkViewport();
        });
      });
    };
    const register = (element, group, index) => {
      const { direction = 'up', stagger = false, offset = 0, columns, tabletColumns, idAttribute } = group;
      const order = (stagger ? (columns ? index % columns : index) : 0) + offset;
      const tabletOrder = (stagger ? (tabletColumns ? index % tabletColumns : index) : 0) + offset;
      element.style.setProperty('--motion-order', String(order));
      element.style.setProperty('--motion-tablet-order', String(tabletOrder));
      if (targets.has(element)) return;
      const id = idAttribute ? element.getAttribute(idAttribute) : null;
      const identity = id ? `${idAttribute}:${id}` : null;
      targets.set(element, identity);
      element.dataset.motionReveal = direction;
      if (disabled || (identity && seen.has(identity))) {
        element.dataset.motionState = 'static';
      } else {
        element.dataset.motionState = 'pending';
        pending.add(element);
        queued.add(element);
      }
    };
    const syncTargets = () => {
      if (disposed) return;
      targets.forEach((_, element) => {
        if (!root.contains(element)) {
          observer.unobserve(element);
          targets.delete(element);
          pending.delete(element);
          queued.delete(element);
        }
      });
      groups.forEach((group) => {
        root.querySelectorAll(group.selector).forEach((element, index) => register(element, group, index));
      });
      observeAfterPaint();
    };
    const cancelFrames = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.cancelAnimationFrame(viewportFrame);
      firstFrame = secondFrame = viewportFrame = 0;
    };
    const revealAll = () => {
      disabled = true;
      cancelFrames();
      queued.clear();
      targets.forEach((_, element) => reveal(element, true));
      observer.disconnect();
    };
    const onPreferenceChange = (event) => { if (event.matches) revealAll(); };
    const onFocus = (event) => {
      if (!(event.target instanceof Element)) return;
      // Load More can focus a card before the child-list callback runs.
      if (options.dynamic) syncTargets();
      const anchor = options.anchorSelector && event.target.matches(options.anchorSelector);
      targets.forEach((_, element) => {
        if (element.contains(event.target) || (anchor && event.target.contains(element))) reveal(element, true);
      });
    };

    const mutations = options.dynamic ? new MutationObserver(syncTargets) : null;
    // Our own data/style changes never retrigger the observer.
    mutations?.observe(root, { childList: true, subtree: true });
    root.addEventListener('focusin', onFocus);
    preference.addEventListener('change', onPreferenceChange);
    window.addEventListener('beforeprint', revealAll);
    window.addEventListener('scroll', onViewportChange, { passive: true });
    window.addEventListener('resize', onViewportChange);
    syncTargets();
    onFocus({ target: document.activeElement });

    return () => {
      disposed = true;
      cancelFrames();
      observer.disconnect();
      mutations?.disconnect();
      root.removeEventListener('focusin', onFocus);
      preference.removeEventListener('change', onPreferenceChange);
      window.removeEventListener('beforeprint', revealAll);
      window.removeEventListener('scroll', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
      targets.forEach((_, element) => {
        delete element.dataset.motionReveal;
        delete element.dataset.motionState;
        element.style.removeProperty('--motion-order');
        element.style.removeProperty('--motion-tablet-order');
      });
      targets.clear();
      pending.clear();
      queued.clear();
      seen.clear();
    };
  }, [groups, options]);

  return pageRef;
};
