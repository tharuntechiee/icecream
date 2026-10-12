/* Rapido-style location picker on free map services (no API key):
   - OpenStreetMap standard tiles (re-tinted for dark mode in CSS)
   - Photon (komoot) for search-as-you-type and reverse geocoding
   - OSRM demo server for the road route from the cold store (straight-line fallback)
   Usage: LocPicker.mount(el, { data, mode: 'check' | 'pick', onConfirm(place) }). Needs Leaflet. */
(function () {
  'use strict';
  var root = document.documentElement;
  var BBOX = [76.7, 12.6, 84.8, 19.95]; // Telangana + Andhra Pradesh, lon/lat
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = function (n) { return '₹' + Math.round(n).toLocaleString('en-IN'); };
  var css = function (n) { return getComputedStyle(root).getPropertyValue(n).trim(); };
  var km = function (a, b) {
    var R = 6371, r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(h));
  };
  var ICON = {
    search: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    locate: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="7.5"/></svg>',
    pin: '<svg viewBox="0 0 32 44" aria-hidden="true"><path d="M16 1C7.7 1 1 7.6 1 15.8 1 27 16 43 16 43s15-16 15-27.2C31 7.6 24.3 1 16 1z"/><circle cx="16" cy="15.5" r="5.5"/></svg>',
  };

  // Which delivery zone serves a coordinate: Hyderabad rings first, then the nearest regional town.
  function classify(data, ll) {
    var c = [data.centre.lat, data.centre.lng];
    var dc = km(c, ll);
    var rings = data.zones.filter(function (z) { return z.ring; }).sort(function (a, b) { return a.ring - b.ring; });
    for (var i = 0; i < rings.length; i++) if (dc <= rings[i].ring) return { zone: rings[i], place: 'Hyderabad', near: 0 };
    var best = null;
    data.zones.forEach(function (z) {
      if (!z.points) return;
      Object.keys(z.points).forEach(function (n) {
        var d = km(z.points[n], ll);
        if (!best || d < best.near) best = { zone: z, place: n, near: d };
      });
    });
    var inStates = ll[1] >= BBOX[0] && ll[1] <= BBOX[2] && ll[0] >= BBOX[1] && ll[0] <= BBOX[3];
    if (best && (best.near <= 35 || (inStates && best.near <= 90))) return best;
    return null;
  }

  function label(p) {
    var a = p.properties || {};
    var line1 = [a.name, [a.housenumber, a.street].filter(Boolean).join(' ')].filter(Boolean).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join(', ');
    var line2 = [a.district || a.locality, a.city || a.county, a.state, a.postcode].filter(Boolean).filter(function (v, i, arr) { return arr.indexOf(v) === i; }).join(', ');
    return { line1: line1 || line2.split(', ')[0] || 'Dropped pin', line2: line2 };
  }

  function mount(el, opts) {
    var data = opts.data, mode = opts.mode || 'check';
    el.classList.add('lp');
    el.innerHTML =
      '<div class="lp-stage">' +
        '<div class="lp-map"></div>' +
        '<div class="lp-pin' + (mode === 'pick' ? '' : ' lp-pin-idle') + '" aria-hidden="true">' + ICON.pin + '</div>' +
        '<div class="lp-search">' + ICON.search +
          '<input type="search" placeholder="Search a venue, street or town" aria-label="Search a place" autocomplete="off">' +
          '<ul class="lp-results" role="listbox" hidden></ul></div>' +
        '<button type="button" class="lp-locate" aria-label="Use my current location">' + ICON.locate + '</button>' +
      '</div>' +
      '<div class="lp-card" aria-live="polite"><p class="lp-hint">Move the map to place the pin, search a place, or use your location.</p></div>';
    var mapEl = el.querySelector('.lp-map'), input = el.querySelector('.lp-search input'), list = el.querySelector('.lp-results'),
      card = el.querySelector('.lp-card'), pinEl = el.querySelector('.lp-pin');

    var map = L.map(mapEl, { zoomControl: false, scrollWheelZoom: mode === 'pick', attributionControl: true }).setView([16.6, 79.6], 6);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    // Standard OpenStreetMap tiles need no key; dark mode re-tints them with a CSS filter (styles.css).
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · search <a href="https://photon.komoot.io">Photon</a> · routes <a href="https://project-osrm.org">OSRM</a>',
    }).addTo(map);
    if (mode === 'check') { map.on('click focus', function () { map.scrollWheelZoom.enable(); }); mapEl.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); }); }

    // Coverage layers: Hyderabad rings, regional towns, the cold store.
    var rings = [], dots = [], byZone = {};
    data.zones.forEach(function (z) {
      byZone[z.name] = [];
      if (z.ring) {
        var r = L.circle([data.centre.lat, data.centre.lng], { radius: z.ring * 1000, weight: 1.5, fillOpacity: 0.04, dashArray: z.ring > 20 ? '4 6' : null, interactive: false }).addTo(map);
        rings.push(r); byZone[z.name].push(r);
      }
      if (z.points) Object.keys(z.points).forEach(function (n) {
        var d = L.circleMarker(z.points[n], { radius: 4.5, weight: 2, fillOpacity: 1 }).bindTooltip(n + ' · ' + z.eta).addTo(map);
        d.on('click', function () { map.flyTo(z.points[n], 12, { duration: 0.8 }); });
        dots.push(d); byZone[z.name].push(d);
      });
    });
    var storeLL = [data.store.lat, data.store.lng];
    L.marker(storeLL, { icon: L.divIcon({ className: 'map-store', iconSize: [14, 14] }), keyboard: false }).bindTooltip(data.store.name).addTo(map);
    var routeLine = null;
    var paint = function () {
      var foil = css('--foil'), raise = css('--board-raise'), verm = css('--verm');
      rings.forEach(function (r) { r.setStyle({ color: foil, fillColor: foil }); });
      dots.forEach(function (d) { d.setStyle({ color: foil, fillColor: raise }); });
      if (routeLine) routeLine.setStyle({ color: verm });
    };
    paint();
    new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    map.fitBounds(L.featureGroup(dots.concat(rings)).getBounds(), { padding: [20, 20] });

    // ----- the picked spot -----
    var picked = null, seq = 0, routeSeq = 0, revTimer, routeTimer;
    var engaged = mode === 'pick'; // the delivery page shows coverage until the visitor picks something
    var renderCard = function () {
      if (!picked) return;
      var m = picked.match;
      var head = '<p class="lp-addr"><strong>' + esc(picked.line1) + '</strong>' + (picked.line2 ? '<span>' + esc(picked.line2) + '</span>' : '') + '</p>';
      var body;
      if (m) {
        var via = m.place === 'Hyderabad' ? '' : (m.near > 35 ? ' · nearest route town ' + esc(m.place) + ' (' + Math.round(m.near) + ' km)' : '');
        body = '<p class="lp-ok"><span class="lp-dot"></span>We deliver here: <strong>' + esc(m.zone.name) + '</strong>' + via + '</p>' +
          '<dl class="lp-facts"><div><dt>Delivery</dt><dd>' + esc(m.zone.eta) + '</dd></div><div><dt>Minimum</dt><dd>' + money(m.zone.minOrder) + '</dd></div>' +
          '<div><dt>From cold store</dt><dd data-lp-route>' + (picked.route ? picked.route : '…') + '</dd></div></dl>';
      } else {
        body = '<p class="lp-no">This spot is outside our regular routes. Large orders can still be arranged: <a href="/contact">ask us</a>.</p>';
      }
      var act = mode === 'pick' && m ? '<button type="button" class="btn btn-verm btn-block lp-confirm">Deliver here</button>' : '';
      card.innerHTML = head + body + act;
      var b = card.querySelector('.lp-confirm');
      if (b) b.addEventListener('click', function () { opts.onConfirm && opts.onConfirm(picked); });
    };

    var evaluate = function (ll, known) {
      var my = ++seq;
      picked = { lat: ll[0], lng: ll[1], match: classify(data, ll), line1: known ? known.line1 : 'Locating address…', line2: known ? known.line2 : '', route: '' };
      renderCard();
      // Road route from the cold store (OSRM demo), straight line if it fails.
      clearTimeout(routeTimer);
      routeTimer = setTimeout(function () {
        var rs = ++routeSeq;
        if (routeLine) { map.removeLayer(routeLine); routeLine = null; }
        if (!picked.match) return;
        fetch('https://router.project-osrm.org/route/v1/driving/' + storeLL[1] + ',' + storeLL[0] + ';' + ll[1] + ',' + ll[0] + '?overview=simplified&geometries=geojson')
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (rs !== routeSeq || !j.routes || !j.routes[0]) throw new Error('no route');
            var rt = j.routes[0];
            routeLine = L.geoJSON(rt.geometry, { style: { weight: 4, opacity: 0.85 }, interactive: false }).addTo(map);
            var h = rt.duration / 3600;
            picked.route = Math.round(rt.distance / 1000) + ' km by road · ~' + (h < 1 ? Math.round(h * 60) + ' min' : (Math.round(h * 2) / 2) + ' h');
          })
          .catch(function () {
            if (rs !== routeSeq) return;
            routeLine = L.polyline([storeLL, ll], { weight: 2, dashArray: '6 8', interactive: false }).addTo(map);
            picked.route = '≈ ' + Math.round(km(storeLL, ll)) + ' km straight line';
          })
          .then(function () { if (rs === routeSeq) { paint(); var el2 = card.querySelector('[data-lp-route]'); if (el2) el2.textContent = picked.route; } });
      }, 500);
      if (known) return;
      clearTimeout(revTimer);
      revTimer = setTimeout(function () {
        fetch('https://photon.komoot.io/reverse?lat=' + ll[0] + '&lon=' + ll[1] + '&lang=en')
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (my !== seq) return;
            var f = j.features && j.features[0];
            var l = f ? label(f) : { line1: 'Dropped pin', line2: ll[0].toFixed(5) + ', ' + ll[1].toFixed(5) };
            picked.line1 = l.line1; picked.line2 = l.line2; renderCard();
          })
          .catch(function () { if (my === seq) { picked.line1 = 'Dropped pin'; picked.line2 = ll[0].toFixed(5) + ', ' + ll[1].toFixed(5); renderCard(); } });
      }, 450);
    };

    var suppress = false;
    map.on('movestart', function () { if (engaged) pinEl.classList.add('lp-lift'); });
    map.on('moveend', function () {
      pinEl.classList.remove('lp-lift');
      if (suppress) { suppress = false; return; }
      if (!engaged) return;
      var c = map.getCenter();
      evaluate([c.lat, c.lng]);
    });
    var engage = function () { if (!engaged) { engaged = true; pinEl.classList.remove('lp-pin-idle'); } };
    map.on('dragstart', engage);
    var go = function (ll, zoom, known) {
      engage();
      suppress = !!known;
      if (suppress) setTimeout(function () { suppress = false; }, 1500); // in case the map doesn't move at all
      map.flyTo(ll, zoom || 16, { duration: 0.8 });
      evaluate(ll, known);
    };

    // ----- search as you type (Photon) -----
    var qTimer, qSeq = 0, items = [], active = -1;
    var close = function () { list.hidden = true; active = -1; };
    var show = function () {
      list.innerHTML = items.map(function (it, i) {
        return '<li role="option" id="lp-o-' + i + '" data-i="' + i + '"' + (i === active ? ' aria-selected="true"' : '') + '><strong>' + esc(it.l.line1) + '</strong><span>' + esc(it.l.line2) + '</span></li>';
      }).join('') || '<li class="lp-empty">No matches in Telangana or Andhra Pradesh</li>';
      list.hidden = false;
    };
    input.addEventListener('input', function () {
      var q = input.value.trim();
      clearTimeout(qTimer);
      if (q.length < 3) { close(); return; }
      qTimer = setTimeout(function () {
        var my = ++qSeq, c = map.getCenter();
        fetch('https://photon.komoot.io/api/?q=' + encodeURIComponent(q) + '&limit=7&lang=en&lat=' + c.lat + '&lon=' + c.lng + '&bbox=' + BBOX.join(','))
          .then(function (r) { return r.json(); })
          .then(function (j) {
            if (my !== qSeq) return;
            items = (j.features || []).filter(function (f) { var s = (f.properties || {}).state; return !s || s === 'Telangana' || s === 'Andhra Pradesh'; })
              .map(function (f) { return { ll: [f.geometry.coordinates[1], f.geometry.coordinates[0]], l: label(f), type: (f.properties || {}).type }; });
            active = -1; show();
          })
          .catch(function () { if (my === qSeq) { items = []; list.innerHTML = '<li class="lp-empty">Search is unavailable right now; move the map instead.</li>'; list.hidden = false; } });
      }, 300);
    });
    var choose = function (i) {
      var it = items[i]; if (!it) return;
      input.value = it.l.line1; close();
      go(it.ll, /city|county|state|district/.test(it.type || '') ? 12 : 16, it.l);
    };
    list.addEventListener('mousedown', function (e) { var li = e.target.closest('[data-i]'); if (li) { e.preventDefault(); choose(+li.getAttribute('data-i')); } });
    input.addEventListener('keydown', function (e) {
      if (list.hidden || !items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); active = (active + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length; show(); input.setAttribute('aria-activedescendant', 'lp-o-' + active); }
      if (e.key === 'Enter') { e.preventDefault(); choose(active < 0 ? 0 : active); }
      if (e.key === 'Escape') close();
    });
    input.addEventListener('blur', function () { setTimeout(close, 150); });

    // ----- use my location -----
    el.querySelector('.lp-locate').addEventListener('click', function () {
      var btn = this;
      if (!navigator.geolocation) { card.innerHTML = '<p class="lp-no">Your browser can’t share its location. Search instead.</p>'; return; }
      btn.classList.add('lp-busy');
      navigator.geolocation.getCurrentPosition(function (pos) {
        btn.classList.remove('lp-busy');
        go([pos.coords.latitude, pos.coords.longitude], 16);
      }, function () {
        btn.classList.remove('lp-busy');
        card.innerHTML = '<p class="lp-no">Location permission was denied. Search for the place or move the map instead.</p>';
      }, { enableHighAccuracy: true, timeout: 10000 });
    });

    setTimeout(function () { map.invalidateSize(); }, 50);
    return {
      map: map,
      focusZone: function (name) {
        var g = L.featureGroup(byZone[name] || []);
        if (g.getLayers().length) map.flyToBounds(g.getBounds(), { padding: [40, 40], maxZoom: 11, duration: 0.8 });
      },
      refresh: function () { map.invalidateSize(); },
    };
  }

  window.LocPicker = { mount: mount, classify: classify };
})();
