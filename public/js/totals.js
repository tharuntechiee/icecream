// Order totals shared by the browser (window.Totals) and the server (require): which delivery zone
// an order falls in, its delivery charge, 18% GST and the grand total.
(function (root) {
  var GST_RATE = 0.18;

  function km(a, b) {
    var R = 6371, r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // zones: [{ name, areas[], ring?, points?, charge, freeAbove, minOrder }], centre: { lat, lng }
  // A listed area wins; otherwise a map pin decides (Hyderabad rings, then the nearest route town within reach).
  function zoneFor(zones, centre, where) {
    where = where || {};
    if (where.area) {
      for (var i = 0; i < zones.length; i++) if ((zones[i].areas || []).indexOf(where.area) !== -1) return zones[i];
    }
    var lat = Number(where.lat), lng = Number(where.lng);
    if (!where.lat || !where.lng || !isFinite(lat) || !isFinite(lng)) return null;
    var ll = [lat, lng], dc = km([centre.lat, centre.lng], ll);
    var rings = zones.filter(function (z) { return z.ring; }).sort(function (a, b) { return a.ring - b.ring; });
    for (var j = 0; j < rings.length; j++) if (dc <= rings[j].ring) return rings[j];
    var best = null, bestD = Infinity;
    zones.forEach(function (z) {
      if (!z.points) return;
      Object.keys(z.points).forEach(function (n) { var d = km(z.points[n], ll); if (d < bestD) { bestD = d; best = z; } });
    });
    var inStates = lng >= 76.7 && lng <= 84.8 && lat >= 12.6 && lat <= 19.95;
    return best && (bestD <= 35 || (inStates && bestD <= 90)) ? best : null;
  }

  function compute(subtotal, zone) {
    var delivery = zone ? (subtotal >= zone.freeAbove ? 0 : zone.charge) : null;
    var taxable = subtotal + (delivery || 0);
    var gst = Math.round(taxable * GST_RATE);
    return {
      subtotal: subtotal, delivery: delivery, gst: gst, total: taxable + gst,
      zone: zone ? zone.name : null, minOrder: zone ? zone.minOrder : null,
      belowMin: zone ? subtotal < zone.minOrder : false,
      freeAbove: zone ? zone.freeAbove : null,
    };
  }

  var api = { GST_RATE: GST_RATE, km: km, zoneFor: zoneFor, compute: compute };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Totals = api;
})(this);
