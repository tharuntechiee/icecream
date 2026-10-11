// Tier-pricing helpers shared by the browser (window.Pricing) and the server (require).
(function (root) {
  // tiers: [{ min, price }] sorted ascending by min. A tier applies from its min up to the next tier's min - 1.
  function sortTiers(tiers) {
    return (tiers || []).slice().sort(function (a, b) { return a.min - b.min; });
  }

  function tierFor(tiers, qty) {
    var t = sortTiers(tiers);
    if (!t.length) return null;
    var match = t[0];
    for (var i = 0; i < t.length; i++) if (qty >= t[i].min) match = t[i];
    return match;
  }

  function unitPrice(size, qty) {
    var tier = tierFor(size.tiers, qty);
    return tier ? tier.price : 0;
  }

  function lineTotal(size, qty) {
    return unitPrice(size, qty) * qty;
  }

  function fromPrice(size) {
    var t = sortTiers(size.tiers);
    return t.length ? t[t.length - 1].price : 0;
  }

  function tierRanges(size) {
    var t = sortTiers(size.tiers);
    return t.map(function (tier, i) {
      var next = t[i + 1];
      return {
        min: tier.min,
        max: next ? next.min - 1 : null,
        price: tier.price,
        label: next ? tier.min + '–' + (next.min - 1) : tier.min + '+',
      };
    });
  }

  function money(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  var api = { tierFor: tierFor, unitPrice: unitPrice, lineTotal: lineTotal, fromPrice: fromPrice, tierRanges: tierRanges, money: money, sortTiers: sortTiers };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Pricing = api;
})(this);
