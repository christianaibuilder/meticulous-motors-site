/* Loan calculator: same inputs as the live site (amount, down payment, APR, term). Estimate only. */
(function () {
  'use strict';
  var f = document.getElementById('calc-form');
  if (!f) return;
  var out = document.getElementById('calc-out');
  var detail = document.getElementById('calc-detail');
  var params = new URLSearchParams(window.location.search);
  if (params.get('price') && f.elements.price) f.elements.price.value = params.get('price');

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function calc() {
    var price = parseFloat(f.elements.price.value) || 0;
    var down = parseFloat(f.elements.down.value) || 0;
    var rate = parseFloat(f.elements.rate.value) || 0;
    var months = parseInt(f.elements.term.value, 10) || 60;
    var principal = Math.max(price - down, 0);
    var r = rate / 100 / 12;
    var pay = r > 0 ? principal * r / (1 - Math.pow(1 + r, -months)) : principal / months;
    if (!principal) { out.textContent = '$0'; detail.textContent = 'Enter a loan amount to see an estimate.'; return; }
    out.textContent = money(pay);
    detail.textContent = 'per month for ' + months + ' months on ' + money(principal) + ' financed' + (rate ? ' at ' + rate + '% APR' : '') + '. Total of payments about ' + money(pay * months) + '.';
  }
  f.addEventListener('input', calc);
  f.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
  calc();
})();
