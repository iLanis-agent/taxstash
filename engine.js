// TaxStash engine - freelance quarterly tax set-aside pacing (no DOM)
(function (root) {
  'use strict';

  // US federal estimated-tax periods (the quirky ones are real: Q2 spans 2 months, Q4 due next year).
  // month/day are 0-indexed months like Date.
  function quartersFor(year) {
    return [
      { label: 'Q1 ' + year, start: new Date(year, 0, 1),  end: new Date(year, 2, 31, 23, 59, 59), due: new Date(year, 3, 15) },
      { label: 'Q2 ' + year, start: new Date(year, 3, 1),  end: new Date(year, 4, 31, 23, 59, 59), due: new Date(year, 5, 15) },
      { label: 'Q3 ' + year, start: new Date(year, 5, 1),  end: new Date(year, 7, 31, 23, 59, 59), due: new Date(year, 8, 15) },
      { label: 'Q4 ' + year, start: new Date(year, 8, 1),  end: new Date(year, 11, 31, 23, 59, 59), due: new Date(year + 1, 0, 15) }
    ];
  }

  function dayOnly(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

  function isoLocal(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // Which period does a payment date fall in? Returns quarter object with its year.
  function quarterFor(date) {
    var d = new Date(date);
    var y = d.getFullYear();
    var qs = quartersFor(y);
    for (var i = 0; i < qs.length; i++) if (d >= qs[i].start && d <= qs[i].end) return qs[i];
    return null;
  }

  // payments: [{amount, at ISO}]  rate: 0..1 set-aside fraction
  // Returns per-quarter accrual: {label, income, setAside, due, dueISO}
  function accrue(payments, rate) {
    var byLabel = {};
    var order = [];
    payments.forEach(function (p) {
      var q = quarterFor(new Date(p.at));
      if (!q) return;
      if (!byLabel[q.label]) { byLabel[q.label] = { label: q.label, income: 0, setAside: 0, due: q.due }; order.push(q.label); }
      byLabel[q.label].income += Number(p.amount) || 0;
      byLabel[q.label].setAside += (Number(p.amount) || 0) * rate;
    });
    return order.sort().map(function (k) {
      var q = byLabel[k];
      return { label: q.label, income: Math.round(q.income * 100) / 100,
               setAside: Math.round(q.setAside * 100) / 100,
               dueISO: isoLocal(q.due) };
    });
  }

  // Next upcoming due date from `now` (checks this year and next).
  function nextDue(now) {
    var n = dayOnly(new Date(now));
    var qs = quartersFor(n.getFullYear() - 1).concat(quartersFor(n.getFullYear()), quartersFor(n.getFullYear() + 1));
    for (var i = 0; i < qs.length; i++) {
      if (dayOnly(qs[i].due) >= n) {
        return { label: 'payment for ' + qs[i].label, dueISO: isoLocal(qs[i].due),
                 daysLeft: Math.round((dayOnly(qs[i].due) - n) / 86400000) };
      }
    }
    return null;
  }

  // Safe to spend: income minus set-aside across everything, minus amounts already stashed away.
  // stashed: total the user confirms they moved to savings.
  function safeToSpend(payments, rate, stashed) {
    var income = 0;
    payments.forEach(function (p) { income += Number(p.amount) || 0; });
    var target = income * rate;
    var s = Number(stashed) || 0;
    return {
      income: Math.round(income * 100) / 100,
      setAsideTarget: Math.round(target * 100) / 100,
      stashed: Math.round(s * 100) / 100,
      stillToStash: Math.max(0, Math.round((target - s) * 100) / 100),
      spendable: Math.round((income - target) * 100) / 100
    };
  }

  function money(n) {
    var neg = n < 0 ? '-' : '';
    var v = Math.abs(Math.round(n * 100) / 100);
    var parts = v.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return neg + '$' + parts.join('.');
  }

  function suggestRate(annualIncome) {
    var inc = Number(annualIncome) || 0;
    if (inc < 40000) return 0.15;
    if (inc < 90000) return 0.22;
    if (inc < 180000) return 0.27;
    return 0.32;
  }

  var api = { quartersFor: quartersFor, quarterFor: quarterFor, accrue: accrue,
    nextDue: nextDue, isoLocal: isoLocal, safeToSpend: safeToSpend, money: money, suggestRate: suggestRate };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StashEngine = api;
})(typeof self !== 'undefined' ? self : this);
