/**
 * Frandhy Joyería — Main JavaScript
 * Vanilla ES6+, no dependencies
 */

'use strict';

// ── Navbar: stable header ───────────────────────────────────
// The header remains stable; no hide/show or scroll animation.
const navbar = document.getElementById('navbar');
if (navbar) navbar.classList.remove('scrolled');


// ── Header scroll progress ───────────────────────────────────
const scrollProgressBar = document.getElementById('header-scroll-progress-bar');
if (scrollProgressBar) {
  let progressTicking = false;
  const updateScrollProgress = () => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
    scrollProgressBar.style.width = progress + '%';
    progressTicking = false;
  };
  const requestProgressUpdate = () => {
    if (!progressTicking) {
      progressTicking = true;
      window.requestAnimationFrame(updateScrollProgress);
    }
  };
  window.addEventListener('scroll', requestProgressUpdate, {passive:true});
  window.addEventListener('resize', requestProgressUpdate, {passive:true});
  updateScrollProgress();
}

// ── Mobile menu ───────────────────────────────────────────────
const menuToggle  = document.getElementById('menu-toggle');
const mobileMenu  = document.getElementById('mobile-menu');
const menuOverlay = document.getElementById('mobile-menu-overlay');

function openMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.add('is-open');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  menuToggle?.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('is-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  menuToggle?.setAttribute('aria-expanded', 'false');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = mobileMenu?.classList.contains('is-open');
  isOpen ? closeMenu() : openMenu();
});
menuOverlay?.addEventListener('click', closeMenu);
document.querySelectorAll('#mobile-menu .mobile-nav-links a').forEach(link => link.addEventListener('click', closeMenu));

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMenu();
});

// ── Scroll animations (Intersection Observer) ─────────────────
const animElements = document.querySelectorAll('.animate-on-scroll');
if (animElements.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animElements.forEach(el => observer.observe(el));
}

// ── FAQ Accordion ─────────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const trigger = item.querySelector('.faq-question');
  const content = item.querySelector('.faq-answer');
  if (!trigger || !content) return;

  trigger.addEventListener('click', () => {
    const isOpen = item.classList.contains('active');
    // Close all
    document.querySelectorAll('.faq-item.active').forEach(openItem => {
      openItem.classList.remove('active');
      const ans = openItem.querySelector('.faq-answer');
      if (ans) ans.style.maxHeight = null;
    });
    // Open clicked
    if (!isOpen) {
      item.classList.add('active');
      content.style.maxHeight = content.scrollHeight + 'px';
    }
  });
});

// ── FAQ Search (FAQ page) ─────────────────────────────────────
const faqSearch = document.getElementById('faq-search');
if (faqSearch) {
  faqSearch.addEventListener('input', function () {
    const query = this.value.toLowerCase().trim();
    document.querySelectorAll('.faq-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.style.display = !query || text.includes(query) ? '' : 'none';
    });
  });
}

// ── Catalog: Instant search (debounced) ───────────────────────
const catalogSearch = document.getElementById('catalog-search');
let searchTimeout;
if (catalogSearch) {
  catalogSearch.addEventListener('input', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const form = this.closest('form') || document.getElementById('catalog-filter-form');
      if (form) form.submit();
    }, 500);
  });
}

// ── Catalog: Sort change auto-submit ──────────────────────────
const sortSelect = document.getElementById('sort-select');
if (sortSelect) {
  sortSelect.addEventListener('change', function () {
    const form = this.closest('form') || document.getElementById('catalog-filter-form');
    if (form) form.submit();
  });
}

// ── Catalog: Mobile filter drawer ────────────────────────────
const filterToggle  = document.getElementById('filter-toggle');
const filterDrawer  = document.getElementById('filter-drawer');
const filterOverlay = document.getElementById('filter-overlay');
const filterClose   = document.getElementById('filter-close');

function openFilters() {
  filterDrawer?.classList.add('open');
  filterOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeFilters() {
  filterDrawer?.classList.remove('open');
  filterOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

filterToggle?.addEventListener('click', openFilters);
filterClose?.addEventListener('click', closeFilters);
filterOverlay?.addEventListener('click', closeFilters);

// ── Product gallery: thumbnail click ─────────────────────────
const mainImage = document.getElementById('main-image');
document.querySelectorAll('.gallery-thumb').forEach(thumb => {
  thumb.addEventListener('click', function () {
    if (!mainImage) return;
    mainImage.src = this.dataset.full || this.src;
    mainImage.alt = this.alt;
    document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// ── Product lightbox ─────────────────────────────────────────
let lightboxImages = [];
let lightboxIndex  = 0;

const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');

function openLightbox(index) {
  if (!lightbox || !lightboxImages.length) return;
  lightboxIndex = index;
  lightboxImg.src = lightboxImages[lightboxIndex];
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox?.classList.remove('active');
  document.body.style.overflow = '';
}

function lightboxNav(direction) {
  lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
  lightboxImg.src = lightboxImages[lightboxIndex];
}

// Collect gallery images
document.querySelectorAll('[data-lightbox]').forEach((el, i) => {
  lightboxImages.push(el.dataset.lightbox || el.src);
  el.addEventListener('click', () => openLightbox(i));
  el.style.cursor = 'zoom-in';
});

lightboxClose?.addEventListener('click', closeLightbox);
lightboxPrev?.addEventListener('click', () => lightboxNav(-1));
lightboxNext?.addEventListener('click', () => lightboxNav(1));
lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', (e) => {
  if (!lightbox?.classList.contains('active')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
});

// ── Product page: Tabs ───────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    const target = this.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + target)?.classList.add('active');
  });
});

// ── Copy link button ─────────────────────────────────────────
const copyLinkBtn = document.getElementById('copy-link');
if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', async function () {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const orig = this.textContent;
      this.textContent = '¡Copiado!';
      setTimeout(() => { this.textContent = orig; }, 2000);
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = window.location.href;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  });
}

// ── Auto-dismiss flash messages ───────────────────────────────
document.querySelectorAll('.flash-message').forEach(msg => {
  setTimeout(() => {
    msg.style.opacity = '0';
    msg.style.transform = 'translateY(-10px)';
    setTimeout(() => msg.remove(), 400);
  }, 5000);

  msg.querySelector('.flash-close')?.addEventListener('click', () => {
    msg.style.opacity = '0';
    setTimeout(() => msg.remove(), 300);
  });
});

// ── Smooth scroll for anchor links ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Testimonials slider ───────────────────────────────────────
const slider = document.querySelector('.testimonials-track');
const dots   = document.querySelectorAll('.testimonial-dot');
let currentSlide = 0;

function goToSlide(n) {
  if (!slider) return;
  currentSlide = n;
  slider.style.transform = `translateX(-${n * 100}%)`;
  dots.forEach((d, i) => d.classList.toggle('active', i === n));
}

dots.forEach((dot, i) => dot.addEventListener('click', () => goToSlide(i)));

// Auto-advance testimonials
if (slider) {
  setInterval(() => {
    const total = dots.length || 3;
    goToSlide((currentSlide + 1) % total);
  }, 6000);
}

// ── Featured products carousel (mobile) ──────────────────────
const carousel = document.querySelector('.products-carousel');
if (carousel) {
  let isDragging = false, startX, scrollStart;

  carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.pageX - carousel.offsetLeft;
    scrollStart = carousel.scrollLeft;
    carousel.style.cursor = 'grabbing';
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.pageX - carousel.offsetLeft;
    carousel.scrollLeft = scrollStart - (x - startX);
  });

  ['mouseup', 'mouseleave'].forEach(ev => {
    carousel.addEventListener(ev, () => {
      isDragging = false;
      carousel.style.cursor = 'grab';
    });
  });
}

// ── WhatsApp floating button tooltip ─────────────────────────
const waFloat = document.querySelector('.whatsapp-float');
if (waFloat) {
  // Tooltip is shown via CSS :hover; nothing extra needed
  // Add slight bounce on page load after 3s
  setTimeout(() => waFloat.classList.add('bounce'), 3000);
}

// ── Number animation for stats ────────────────────────────────
function animateNumber(el) {
  const target = parseInt(el.dataset.count || '0', 10);
  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + (el.dataset.suffix || '');
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const statNumbers = document.querySelectorAll('[data-count]');
if (statNumbers.length && 'IntersectionObserver' in window) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.animated) {
        entry.target.dataset.animated = '1';
        animateNumber(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statsObserver.observe(el));
}

// ── Category page: filter pills ──────────────────────────────
document.querySelectorAll('.pill-category').forEach(pill => {
  pill.addEventListener('click', function (e) {
    // Allow normal navigation; just add a visual ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (e.offsetX - 10) + 'px';
    ripple.style.top  = (e.offsetY - 10) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ── Lazy load images ─────────────────────────────────────────
if ('loading' in HTMLImageElement.prototype) {
  // Native lazy loading supported — already set via HTML
} else if ('IntersectionObserver' in window) {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        lazyObserver.unobserve(img);
      }
    });
  });
  lazyImages.forEach(img => lazyObserver.observe(img));
}
