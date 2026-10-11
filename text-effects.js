'use strict';
/* Progressive enhancement: lightweight reveal matching a contemporary SaaS site.
   No third-party tracking, no 3D/parallax or scrolling hijack. */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealSelectors = [
    '.highlights-lead', '.benefit-grid article',
    '.showcase .section-head', '.showcase-controls', '.preview-panel', '.real-work',
    '.system>div:first-child', '.system .dashboard-demo',
    '.packages .section-head', '.package-grid article',
    '.faq>div:first-child', '.faq-list',
    '.contact-grid>div:first-child', '.contact form'
  ];
  if (reduced || !('IntersectionObserver' in window)) {
    return;
  }
  const items = [...document.querySelectorAll(revealSelectors.join(','))];
  if (!items.length) return;
  // Enable transitions only after observer is installed, retaining a non-JS fallback.
  const observer = new IntersectionObserver((entries, active) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      active.unobserve(entry.target);
    }
  }, { rootMargin:'0px 0px -8% 0px', threshold: .06 });
  for (const el of items) { el.classList.add('text-reveal'); observer.observe(el); }
  document.documentElement.classList.add('js-effects');
})();
