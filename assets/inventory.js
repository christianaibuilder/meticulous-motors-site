/* Inventory search, filters and sort. The cards are already in the page (so the list works
   without JavaScript); this only shows, hides and re-orders them. */
(function () {
  'use strict';
  var grid = document.getElementById('car-grid');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.car-card'));
  var q = document.getElementById('f-q');
  var make = document.getElementById('f-make');
  var price = document.getElementById('f-price');
  var sort = document.getElementById('f-sort');
  var chips = document.querySelectorAll('.chip[data-body]');
  var count = document.getElementById('f-count');
  var empty = document.getElementById('f-empty');
  var clear = document.getElementById('f-clear');
  var state = { q: '', body: '', make: '', price: '', sort: 'newest' };

  // Read the URL (links from the home page, body-type and make tiles)
  var params = new URLSearchParams(window.location.search);
  ['q', 'body', 'make', 'price', 'sort'].forEach(function (k) { if (params.get(k)) state[k] = params.get(k); });
  if (q) q.value = state.q;
  if (make) make.value = state.make;
  if (price) price.value = state.price;
  if (sort) sort.value = state.sort;

  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim(); }

  function apply() {
    var words = norm(state.q).split(' ').filter(Boolean);
    var shown = [];
    cards.forEach(function (c) {
      var ok = true;
      if (state.body && c.dataset.body !== state.body) ok = false;
      if (ok && state.make && c.dataset.make !== state.make) ok = false;
      if (ok && state.price && Number(c.dataset.price) > Number(state.price)) ok = false;
      if (ok && words.length) {
        var hay = norm(c.dataset.text);
        ok = words.every(function (w) { return hay.indexOf(w) !== -1; });
      }
      c.hidden = !ok;
      if (ok) shown.push(c);
    });
    var key = state.sort;
    shown.sort(function (a, b) {
      if (key === 'price-asc') return a.dataset.price - b.dataset.price;
      if (key === 'price-desc') return b.dataset.price - a.dataset.price;
      if (key === 'miles') return a.dataset.miles - b.dataset.miles;
      if (key === 'year') return b.dataset.year - a.dataset.year;
      return b.dataset.id - a.dataset.id; // newest listing first
    });
    shown.forEach(function (c) { grid.appendChild(c); });
    chips.forEach(function (ch) { ch.classList.toggle('is-active', (ch.dataset.body || '') === state.body); });
    if (count) count.textContent = shown.length + (shown.length === 1 ? ' car' : ' cars');
    if (empty) empty.hidden = shown.length > 0;
    // keep the URL shareable
    var p = new URLSearchParams();
    Object.keys(state).forEach(function (k) { if (state[k] && !(k === 'sort' && state[k] === 'newest')) p.set(k, state[k]); });
    var url = window.location.pathname + (p.toString() ? '?' + p.toString() : '');
    window.history.replaceState(null, '', url);
  }

  var t;
  if (q) q.addEventListener('input', function () { window.clearTimeout(t); t = window.setTimeout(function () { state.q = q.value; apply(); }, 150); });
  if (make) make.addEventListener('change', function () { state.make = make.value; apply(); });
  if (price) price.addEventListener('change', function () { state.price = price.value; apply(); });
  if (sort) sort.addEventListener('change', function () { state.sort = sort.value; apply(); });
  chips.forEach(function (ch) { ch.addEventListener('click', function () { state.body = (state.body === ch.dataset.body) ? '' : ch.dataset.body; apply(); }); });
  if (clear) clear.addEventListener('click', function () {
    state = { q: '', body: '', make: '', price: '', sort: 'newest' };
    if (q) q.value = ''; if (make) make.value = ''; if (price) price.value = ''; if (sort) sort.value = 'newest';
    apply();
  });
  apply();
})();
