/* Shared behaviour: header, mobile menu, reveal-on-scroll, hero drift, lazy video, FAQ. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header shadow once the page has scrolled
  var header = document.querySelector('.header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    drift();
  }

  // Hero photo drifts a little as you scroll (one plane only: it is a single photo)
  var heroImg = document.querySelector('.hero__photo img');
  function drift() {
    if (!heroImg || reduce) return;
    var y = Math.min(window.scrollY, 600) * 0.08;
    heroImg.style.setProperty('--drift', y.toFixed(1) + 'px');
  }
  window.addEventListener('scroll', function () { window.requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();

  // Mobile menu
  var panel = document.getElementById('menu-panel');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');
  function setMenu(open) {
    if (!panel) return;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var first = panel.querySelector('a, button'); if (first) first.focus(); }
    else if (openBtn) openBtn.focus();
  }
  if (openBtn) openBtn.addEventListener('click', function () { setMenu(true); });
  if (closeBtn) closeBtn.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel && panel.classList.contains('is-open')) setMenu(false); });

  // Reveal blocks when they are about a quarter of the screen up from the bottom
  var targets = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('revealed'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('revealed'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -22% 0px', threshold: 0.05 });
    targets.forEach(function (el) { io.observe(el); });
    // At the very bottom of a page nothing can travel further up the screen, so reveal what is left
    window.addEventListener('scroll', function () {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) targets.forEach(function (el) { el.classList.add('revealed'); });
    }, { passive: true });
    // Anything already high on the page shows at once
    window.setTimeout(function () {
      targets.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * 0.78) el.classList.add('revealed'); });
    }, 60);
  }

  // Video testimonials: load YouTube only when tapped
  document.querySelectorAll('[data-youtube]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-youtube');
      var wrap = btn.parentNode;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      iframe.title = btn.getAttribute('aria-label') || 'Customer video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      wrap.replaceChild(iframe, btn);
    });
  });

  // Home search form -> inventory page with query parameters
  var hs = document.getElementById('home-search');
  if (hs) {
    hs.addEventListener('submit', function (e) {
      e.preventDefault();
      var p = new URLSearchParams();
      ['make', 'body', 'price'].forEach(function (k) { var v = hs.elements[k] && hs.elements[k].value; if (v) p.set(k, v); });
      var q = p.toString();
      window.location.href = hs.getAttribute('action') + (q ? '?' + q : '');
    });
  }
})();
