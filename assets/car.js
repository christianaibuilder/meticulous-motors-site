/* Vehicle page: gallery with swipe, thumbnails, keyboard and a full-screen lightbox. */
(function () {
  'use strict';
  var photos = window.CAR_PHOTOS || [];
  var main = document.getElementById('g-main');
  if (!main || !photos.length) return;
  var img = main.querySelector('img');
  var countEl = document.getElementById('g-count');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('#g-thumbs button'));
  var lb = document.getElementById('lightbox');
  var lbImg = lb ? lb.querySelector('img') : null;
  var lbCount = document.getElementById('lb-count');
  var i = 0;

  function preload(n) { var p = photos[(n + photos.length) % photos.length]; if (p) { var im = new Image(); im.src = p.m; } }
  function show(n, fromLb) {
    i = (n + photos.length) % photos.length;
    var p = photos[i];
    img.src = p.m; img.srcset = p.s + ' 480w, ' + p.m + ' 1200w'; img.alt = p.alt;
    if (countEl) countEl.textContent = (i + 1) + ' / ' + photos.length;
    thumbs.forEach(function (b, k) {
      b.classList.toggle('is-active', k === i);
      if (k === i && !fromLb && b.parentNode && b.parentNode.scrollTo) {
        // scroll the strip sideways only; never move the page itself
        var strip = b.parentNode;
        strip.scrollTo({ left: b.offsetLeft - (strip.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' });
      }
    });
    if (lb && lb.classList.contains('is-open')) { lbImg.src = p.l || p.m; lbImg.alt = p.alt; if (lbCount) lbCount.textContent = (i + 1) + ' / ' + photos.length; }
    preload(i + 1); preload(i - 1);
  }

  document.getElementById('g-prev').addEventListener('click', function () { show(i - 1); });
  document.getElementById('g-next').addEventListener('click', function () { show(i + 1); });
  thumbs.forEach(function (b, k) { b.addEventListener('click', function () { show(k); }); });

  // Swipe on the main photo
  var x0 = null;
  main.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  main.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1);
  }, { passive: true });

  // Lightbox
  function openLb() {
    if (!lb) return;
    lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-open');
    show(i, true);
    lb.querySelector('.lightbox__close').focus();
  }
  function closeLb() {
    if (!lb) return;
    lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-open');
    img.focus && img.focus();
  }
  img.addEventListener('click', openLb);
  var expand = document.getElementById('g-expand'); if (expand) expand.addEventListener('click', openLb);
  if (lb) {
    lb.querySelector('.lightbox__close').addEventListener('click', closeLb);
    lb.querySelector('.gallery__btn--prev').addEventListener('click', function () { show(i - 1, true); });
    lb.querySelector('.gallery__btn--next').addEventListener('click', function () { show(i + 1, true); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    var lx = null;
    lb.addEventListener('touchstart', function (e) { lx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (lx === null) return; var dx = e.changedTouches[0].clientX - lx; lx = null;
      if (Math.abs(dx) > 40) show(dx < 0 ? i + 1 : i - 1, true);
    }, { passive: true });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') show(i + 1, lb && lb.classList.contains('is-open'));
    if (e.key === 'ArrowLeft') show(i - 1, lb && lb.classList.contains('is-open'));
    if (e.key === 'Escape') closeLb();
  });
  show(0);
})();
