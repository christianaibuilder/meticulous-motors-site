/* Book a service. Mirrors their booking plugin (service, day, time, first/last name, email, phone).
   PREVIEW: nothing is sent anywhere. On the live site the same form posts to their existing booking
   plugin, which returns the real openings for the chosen day. */
(function () {
  'use strict';
  var S = window.SERVICES || {};
  var form = document.getElementById('book-form');
  if (!form) return;
  var sel = document.getElementById('b-svc');
  var summary = document.getElementById('b-summary');
  var date = document.getElementById('b-date');
  var dateMsg = document.getElementById('b-date-msg');
  var slots = document.getElementById('b-slots');
  var slotNote = document.getElementById('b-slot-note');
  var err = document.getElementById('b-error');
  var done = document.getElementById('b-done');
  var chosen = '';

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // earliest day = today (local)
  var now = new Date();
  date.min = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());

  var p = new URLSearchParams(window.location.search).get('svc');
  if (p && S[p]) sel.value = p;

  function showSummary() {
    var s = S[sel.value];
    if (!s) { summary.hidden = true; return; }
    var h = '<div class="book__meta"><span>' + esc('Usually takes about ' + s.duration) + '</span>' + (s.price ? '<strong>$' + s.price + '</strong>' : '') + '</div>';
    if (s.includes && s.includes.length) h += '<ul class="svc__list">' + s.includes.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>';
    else if (s.text) h += '<p>' + esc(s.text) + '</p>';
    summary.innerHTML = h;
    summary.hidden = false;
  }

  function fmtTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12 === 0 ? 12 : h % 12;
    return hh + ':' + pad(m) + ' ' + ap;
  }

  var shownFor = null;
  function showSlots() {
    // Safari fires "change" again when the date box loses focus; rebuilding then would swallow the tap on a time
    if (date.value === shownFor) return;
    shownFor = date.value;
    slots.innerHTML = ''; chosen = ''; slotNote.hidden = true; dateMsg.textContent = '';
    if (!date.value) return;
    var d = new Date(date.value + 'T12:00:00');
    var day = d.getDay();
    if (day === 0) { dateMsg.textContent = "We're closed on Sundays. Please pick another day."; return; }
    var open = day === 6 ? 10 * 60 : 9 * 60;
    var close = day === 6 ? 15 * 60 : 18 * 60;
    var last = close - 60;                              // drop-offs up to an hour before closing
    var html = '';
    for (var t = open; t <= last; t += 30) {
      html += '<button type="button" class="slot" role="radio" aria-checked="false" data-t="' + t + '">' + fmtTime(t) + '</button>';
    }
    slots.innerHTML = html;
    slotNote.hidden = false;
  }

  slots.addEventListener('click', function (e) {
    var b = e.target.closest('.slot');
    if (!b) return;
    Array.prototype.forEach.call(slots.querySelectorAll('.slot'), function (x) { x.classList.remove('is-active'); x.setAttribute('aria-checked', 'false'); });
    b.classList.add('is-active'); b.setAttribute('aria-checked', 'true');
    chosen = b.textContent;
  });

  sel.addEventListener('change', showSummary);
  date.addEventListener('change', showSlots);
  date.addEventListener('input', showSlots);
  showSummary();

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, problems = [];
    if (!S[sel.value]) problems.push('choose a service');
    if (!date.value || new Date(date.value + 'T12:00:00').getDay() === 0) problems.push('pick a day we are open');
    if (!chosen) problems.push('pick a time');
    if (!f.first.value.trim()) problems.push('add your first name');
    if (!f.phone.value.trim() || f.phone.value.replace(/\D/g, '').length < 10) problems.push('add a phone number we can reach you at');
    if (f.email.value.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.value.trim())) problems.push('check your email address');
    if (problems.length) {
      err.textContent = 'Almost there: please ' + problems.join(', ') + '.';
      return;
    }
    err.textContent = '';
    var s = S[sel.value];
    var d = new Date(date.value + 'T12:00:00');
    var dayText = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    done.innerHTML = '<h2>This is where you\'d be booked</h2>' +
      '<p><strong>' + esc(s.name) + '</strong> on ' + esc(dayText) + ' at ' + esc(chosen) + '.</p>' +
      '<p>This page is a preview, so nothing was sent and nothing was saved. On the live site this goes straight into the ' +
      'Meticulous Motors booking schedule. To book it today, call <a href="tel:+17275442956">727-544-2956</a>.</p>';
    done.hidden = false;
    // clear personal details: the preview keeps nothing
    f.first.value = ''; f.last.value = ''; f.phone.value = ''; f.email.value = '';
    done.focus();
  });
})();
