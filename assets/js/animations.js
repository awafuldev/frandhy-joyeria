/**
 * Frandhy Joyería — Cinematic animation layer
 * GSAP + ScrollTrigger + Lenis (smooth scroll)
 *
 * Progressive enhancement: if any library fails to load, or the user has
 * requested reduced motion, every `.animate-on-scroll` element is revealed
 * immediately with no animation — content is never stuck invisible.
 */
'use strict';

(function () {
  const revealInstantly = () => {
    document.querySelectorAll('.animate-on-scroll').forEach((el) => el.classList.add('animated'));
  };

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    revealInstantly();
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealInstantly();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const EASE = 'power3.out';

  // ── Smooth scroll (Lenis), synced to GSAP's ticker so ScrollTrigger
  //    stays perfectly in sync with the eased scroll position ──────────
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Let Lenis handle in-page anchor links smoothly too
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1 && document.querySelector(id)) {
          e.preventDefault();
          lenis.scrollTo(id, { offset: -80 });
        }
      });
    });
  }

  // ── Hero entrance timeline ────────────────────────────────────────────
  const hero = document.querySelector('.section-hero');
  if (hero) {
    const subtitle = hero.querySelector('.hero-subtitle');
    const title = hero.querySelector('.hero-title');
    const text = hero.querySelector('.hero-text');
    const actions = hero.querySelector('.hero-actions');
    const scrollInd = hero.querySelector('.scroll-indicator');
    const pieces = [subtitle, title, text, actions].filter(Boolean);

    if (pieces.length) {
      gsap.set(pieces, { opacity: 0, y: 34 });
      if (scrollInd) gsap.set(scrollInd, { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease: EASE } });
      pieces.forEach((el, i) => {
        tl.to(el, { opacity: 1, y: 0, duration: 0.9 }, 0.15 + i * 0.15);
      });
      if (scrollInd) tl.to(scrollInd, { opacity: 1, duration: 0.6 }, '+=0.2');
    }

    // Subtle parallax drift on the hero background image
    gsap.to(hero, {
      backgroundPosition: '50% 32%',
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
  }

  // ── Section header reveals (eyebrow + title) ──────────────────────────
  document.querySelectorAll('.section-header').forEach((el) => {
    const pieces = [el.querySelector('.section-subtitle'), el.querySelector('.section-title')].filter(Boolean);
    if (!pieces.length) return;
    gsap.fromTo(
      pieces,
      { opacity: 0, y: 26 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });

  // ── Staggered grid reveals (product cards, feature cards, etc.) ───────
  document.querySelectorAll('.grid').forEach((grid) => {
    const items = Array.from(grid.children);
    if (!items.length) return;
    gsap.fromTo(
      items,
      { opacity: 0, y: 46 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: EASE, stagger: 0.1,
        scrollTrigger: { trigger: grid, start: 'top 88%' },
      }
    );
  });

  // ── Generic section reveal for anything still marked .animate-on-scroll
  //    that ISN'T already covered by a nested grid/section-header above ──
  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    if (el.querySelector('.grid')) {
      // Its children already stagger in — just mark it visible, no extra
      // whole-section fade (avoids a parent-opacity/child-opacity fight).
      el.classList.add('animated');
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 0.9, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 85%' },
        onStart: () => el.classList.add('animated'),
      }
    );
  });

  // ── FAQ accordion items: quick individual rise-in ─────────────────────
  gsap.utils.toArray('.faq-item').forEach((item, i) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.6, ease: EASE, delay: Math.min(i * 0.04, 0.3),
        scrollTrigger: { trigger: item, start: 'top 92%' },
      }
    );
  });

  // ── Cinematic single-image reveals (hero-style standalone photos) ─────
  gsap.utils.toArray('.product-gallery-main, .about-photo img').forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, scale: 0.96 },
      {
        opacity: 1, scale: 1, duration: 0.9, ease: EASE,
        scrollTrigger: { trigger: el, start: 'top 90%' },
      }
    );
  });

  // Header remains stable while scrolling; navigation is intentionally not animated.

  // ── Refresh ScrollTrigger once all images have loaded (layout can
  //    shift once product photos come in, which would otherwise throw
  //    off trigger start/end positions) ──────────────────────────────────
  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
