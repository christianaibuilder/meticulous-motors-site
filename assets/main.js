/* Shared behaviour: header, menus, reveal-on-scroll, hero drift, lazy video. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Header shadow once the page has scrolled
  var header = document.querySelector('.header');
  var frame = document.querySelector('.hero__photo');
  var heroImg = frame ? frame.querySelector('img') : null;
  var SCALE = 1.12;                       // must match the CSS scale on .hero__photo img

  // Hero photo drifts down a little as you scroll. It never moves further than the extra photo the
  // scale leaves above the frame, so the frame's background can't show through at the top.
  function drift() {
    if (!heroImg || reduce) return;
    var room = frame.clientHeight * (SCALE - 1) / 2 - 1;
    var y = Math.max(0, Math.min(window.scrollY * 0.06, room));
    heroImg.style.setProperty('--drift', y.toFixed(1) + 'px');
  }
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    drift();
  }
  window.addEventListener('scroll', function () { window.requestAnimationFrame(onScroll); }, { passive: true });
  window.addEventListener('resize', drift);
  onScroll();

  // Mobile menu
  var panel = document.getElementById('menu-panel');
  var openBtn = document.getElementById('menu-open');
  var closeBtn = document.getElementById('menu-close');
  function setMenu(open, byKeyboard) {
    if (!panel) return;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('menu-open', open);
    if (openBtn) openBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    // Move focus into the menu only for keyboard users; a finger tap shouldn't leave a focus ring behind
    if (open && byKeyboard) { var first = panel.querySelector('nav a'); if (first) first.focus(); }
    else if (!open && byKeyboard && openBtn) openBtn.focus();
  }
  if (openBtn) openBtn.addEventListener('click', function (e) { setMenu(true, e.detail === 0); });
  if (closeBtn) closeBtn.addEventListener('click', function (e) { setMenu(false, e.detail === 0); });

  // Desktop "Financing" dropdown: opens on hover and focus (CSS) and on click or tap (here)
  var toggles = document.querySelectorAll('.nav__toggle');
  function closeAll(except) {
    toggles.forEach(function (t) { if (t !== except) { t.setAttribute('aria-expanded', 'false'); t.parentNode.classList.remove('is-open'); } });
  }
  toggles.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = t.getAttribute('aria-expanded') !== 'true';
      closeAll(t);
      t.setAttribute('aria-expanded', open ? 'true' : 'false');
      t.parentNode.classList.toggle('is-open', open);
    });
  });
  document.addEventListener('click', function () { closeAll(null); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeAll(null);
    if (panel && panel.classList.contains('is-open')) setMenu(false, true);
  });

  // Reveal blocks when they are about a fifth of the screen up from the bottom
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

  // Video testimonials: load YouTube only when tapped, and play right here on the page
  document.querySelectorAll('[data-youtube]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-youtube');
      var wrap = btn.parentNode;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1';
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
