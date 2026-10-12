/* Shaadi Card mockups: theme, quote cart (shared with the live site's /quote), invitation estimate,
   catalogue, product detail and the event menu card. Depends on /js/pricing.js and data.js. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var money = Pricing.money;
  var D = window.MOCK;
  var byId = {}; D.products.forEach(function (p) { byId[p.id] = p; });
  var sizeOf = function (p, id) { return p && p.sizes.filter(function (s) { return s.id === id; })[0]; };
  var IRREGULAR = { box: 'boxes' };
  var plural = function (u, n) { return n === 1 ? u : (IRREGULAR[u] || u + 's'); };
  var WA = '919876543210';
  var wa = function (t) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(t); };

  function load(k, f) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } }
  function store(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } }

  // ---------- theme ----------
  var root = document.documentElement;
  $$('[data-theme-toggle]').forEach(function (b) {
    var sync = function () { b.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'); };
    sync();
    b.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      store('mockTheme', root.dataset.theme);
      sync();
    });
  });

  // ---------- nav ----------
  var menuBtn = $('.menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });

  // ---------- quote cart (same storage key as the live site) ----------
  var CART = 'quoteCart:v1';
  function cart() { return load(CART, []); }
  function badge() { var n = cart().length; $$('[data-count]').forEach(function (el) { el.textContent = n; }); }
  function add(item) {
    var items = cart();
    var key = function (i) { return i.productId + '|' + i.sizeId + '|' + (i.flavour || ''); };
    var hit = items.filter(function (i) { return key(i) === key(item); })[0];
    if (hit) hit.qty += item.qty; else items.push(item);
    store(CART, items); badge();
  }
  badge();

  var toastEl = $('.toast'), toastT;
  function toast(html) {
    if (!toastEl) return;
    toastEl.innerHTML = html; toastEl.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('show'); }, 4000);
  }
  function added(name) { toast('<span>' + esc(name) + ' added to your quote</span><a href="/quote">View quote (' + cart().length + ')</a>'); }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (!b) return;
    var p = byId[b.dataset.add], s = sizeOf(p, b.dataset.size) || p.sizes[0];
    add({ productId: p.id, sizeId: s.id, flavour: p.flavours.length > 1 ? 'Assorted' : (p.flavours[0] || ''), qty: s.moq });
    added(p.name);
  });

  // ---------- figures settle when they change ----------
  function setFig(el, text) {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    el.classList.remove('settle'); void el.offsetWidth; el.classList.add('settle');
  }

  // ---------- event sizing shared by the invitation and the menu card ----------
  var SERVINGS = { 'Wedding': 1.5, 'Birthday / private party': 1, 'Corporate event': 1, 'Festival / puja': 1.5 };
  function sizeEvent(guests, perGuest, buffer, fmtId) {
    var fmt = D.servingFormats.filter(function (f) { return f.id === fmtId; })[0];
    var p = byId[fmt.productId], s = sizeOf(p, fmt.sizeId);
    var servings = Math.ceil(Math.round(guests * perGuest * (1 + buffer) * 1000) / 1000);
    var units = Math.ceil(servings / fmt.perUnit);
    var need = Math.ceil(units / s.unitsPerCarton);
    var cartons = Math.max(s.moq, need);
    return { p: p, s: s, fmt: fmt, servings: servings, units: units, cartons: cartons, atMoq: cartons > need, cost: Pricing.lineTotal(s, cartons) };
  }

  // ---------- home: the invitation is the quote form ----------
  var inv = $('[data-invite]');
  if (inv) {
    requestAnimationFrame(function () { inv.classList.add('drawn'); });
    var ev = $('[name=event]', inv), date = $('[name=date]', inv), venue = $('[name=venue]', inv), guests = $('[name=guests]', inv);
    var d = new Date(Date.now() + 86400000 * 10); date.value = d.toISOString().slice(0, 10);
    date.min = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    // The date is written like an invitation ("22 Oct 2026"); the native input sits invisibly on top.
    var face = $('[data-date-face]', inv);
    function writeDate() {
      var v = date.value ? new Date(date.value + 'T00:00:00') : null;
      face.textContent = v && !isNaN(v) ? v.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Choose a date';
    }
    date.addEventListener('change', writeDate);
    date.addEventListener('click', function () { try { date.showPicker(); } catch (e) { /* older browsers open on focus */ } });
    writeDate();
    function renderInvite() {
      var g = Math.max(0, parseInt(guests.value, 10) || 0);
      var per = SERVINGS[ev.value];
      if (!per) {
        setFig($('[data-est-big]'), 'Restock by the carton');
        $('[data-est-line]').innerHTML = 'Tubs, cups, kulfi and ice at tier prices. <a href="catalogue.html">Open the catalogue</a>.';
        return;
      }
      if (!g) { setFig($('[data-est-big]'), 'Add your guest count'); $('[data-est-line]').textContent = 'We size the order for you.'; return; }
      var r = sizeEvent(g, per, 0.1, 'cup100');
      setFig($('[data-est-big]'), '≈ ' + money(r.cost));
      $('[data-est-line]').textContent = r.cartons + ' cartons of 100ml cups (' + r.servings.toLocaleString('en-IN') + ' servings) for ' + g.toLocaleString('en-IN') + ' guests · before GST' + (r.servings >= 300 ? ' · freezer & counter suggested' : '');
    }
    inv.addEventListener('input', renderInvite);
    inv.addEventListener('change', renderInvite);
    inv.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = Math.max(0, parseInt(guests.value, 10) || 0), per = SERVINGS[ev.value];
      if (per && g) { var r = sizeEvent(g, per, 0.1, 'cup100'); add({ productId: r.p.id, sizeId: r.s.id, flavour: 'Assorted', qty: r.cartons }); }
      store('quotePreset:v1', { eventType: ev.value, guests: guests.value });
      location.href = '/quote?event=' + encodeURIComponent(ev.value) + '&guests=' + encodeURIComponent(guests.value);
    });
    var waBtn = $('[data-wa-card]');
    if (waBtn) waBtn.addEventListener('click', function () {
      waBtn.href = wa('Hi ChillCrate! ' + ev.value + ' on ' + date.value + ' at ' + venue.value + ' for ' + guests.value + ' guests. Please quote.');
    });
    renderInvite();
  }

  // ---------- catalogue ----------
  var grid = $('[data-places]');
  if (grid) {
    var params = new URLSearchParams(location.search);
    var state = { cat: params.get('category') || '', q: '', flavour: '', size: '', diet: [] };
    var tabs = $('[data-tabs]');
    tabs.innerHTML = '<button class="tab" role="tab" data-cat="">All</button>' + D.categories.map(function (c) { return '<button class="tab" role="tab" data-cat="' + c.id + '">' + esc(c.name) + '</button>'; }).join('');
    function inCat() { return D.products.filter(function (p) { return !state.cat || p.category === state.cat; }); }
    function options() {
      var ps = inCat();
      var fl = []; ps.forEach(function (p) { p.flavours.forEach(function (x) { if (fl.indexOf(x) < 0) fl.push(x); }); });
      var sz = []; ps.forEach(function (p) { p.sizes.forEach(function (s) { if (sz.indexOf(s.packSize) < 0) sz.push(s.packSize); }); });
      $('[data-flavour]').innerHTML = '<option value="">All flavours</option>' + fl.sort().map(function (x) { return '<option' + (x === state.flavour ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
      $('[data-size]').innerHTML = '<option value="">All pack sizes</option>' + sz.map(function (x) { return '<option' + (x === state.size ? ' selected' : '') + '>' + esc(x) + '</option>'; }).join('');
      $('[data-flavour]').disabled = !fl.length;
      $('[data-diet]').hidden = !ps.some(function (p) { return p.dietary.length; });
    }
    function fromPrice(p) { return Math.min.apply(null, p.sizes.map(function (s) { return Pricing.fromPrice(s); })); }
    function card(p) {
      var s = p.sizes[0];
      var tag = p.category === 'custom' ? 'Made to order' : p.seasonal ? 'Seasonal' : p.featured ? 'Bestseller' : '';
      var diet = p.dietary.filter(function (x) { return x !== 'eggless'; }).map(function (x) { return x === 'vegan' ? 'Vegan' : 'Sugar-free'; }).join(' · ');
      return '<article class="place">' +
        (tag ? '<span class="seal">' + esc(tag) + '</span>' : '') +
        '<h3><a href="product.html?id=' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a></h3>' +
        (p.flavours.length ? '<div class="swatches" aria-label="Flavours: ' + esc(p.flavours.join(', ')) + '">' + p.swatches.map(function (c, i) { return '<span class="sw" style="background:' + c + '" title="' + esc(p.flavours[i]) + '"></span>'; }).join('') + '</div>' : '') +
        '<dl class="specs"><dt>Pack</dt><dd>' + esc(p.sizes.map(function (x) { return x.packSize; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(' · ')) + '</dd>' +
        '<dt>Per ' + esc(s.unit) + '</dt><dd>' + esc(s.contains) + '</dd><dt>Minimum</dt><dd>' + s.moq + ' ' + esc(plural(s.unit, s.moq)) + '</dd>' + (diet ? '<dt>Diet</dt><dd>' + esc(diet) + '</dd>' : '') + '</dl>' +
        '<div class="place-foot"><span class="price">' + money(fromPrice(p)) + ' <small>/ ' + esc(s.unit) + ', best tier</small></span>' +
        '<button class="btn btn-foil btn-sm" type="button" data-add="' + p.id + '" data-size="' + s.id + '">Add to quote</button></div></article>';
    }
    function render() {
      $$('.tab', tabs).forEach(function (t) { t.setAttribute('aria-selected', String(t.dataset.cat === state.cat)); });
      var q = state.q.toLowerCase();
      var list = inCat().filter(function (p) {
        return (!state.flavour || p.flavours.indexOf(state.flavour) >= 0) &&
          (!state.size || p.sizes.some(function (s) { return s.packSize === state.size; })) &&
          state.diet.every(function (d) { return p.dietary.indexOf(d) >= 0; }) &&
          (!q || (p.name + ' ' + p.description + ' ' + p.flavours.join(' ')).toLowerCase().indexOf(q) >= 0);
      });
      $('.count').textContent = list.length + ' product line' + (list.length === 1 ? '' : 's') + ' · prices per unit shown, before GST';
      grid.innerHTML = list.length ? list.map(card).join('') : '<div class="empty"><h3>Nothing matches those filters</h3><p class="soft">Clear a filter, or WhatsApp us what you need and we will source it.</p><button class="btn btn-foil btn-sm" type="button" data-clear>Clear filters</button></div>';
      var c = D.categories.filter(function (x) { return x.id === state.cat; })[0];
      $('[data-cat-title]').textContent = c ? c.name : 'The catalogue';
      $('[data-cat-blurb]').textContent = c ? c.blurb + '.' : 'Every line shows its pack size, units per carton, minimum order and tier price.';
    }
    tabs.addEventListener('click', function (e) {
      var t = e.target.closest('.tab'); if (!t) return;
      state.cat = t.dataset.cat; state.flavour = ''; state.size = '';
      history.replaceState(null, '', state.cat ? '?category=' + state.cat : location.pathname);
      options(); render();
    });
    $('[data-search]').addEventListener('input', function (e) { state.q = e.target.value; render(); });
    $('[data-flavour]').addEventListener('change', function (e) { state.flavour = e.target.value; render(); });
    $('[data-size]').addEventListener('change', function (e) { state.size = e.target.value; render(); });
    $$('[data-diet] .chip').forEach(function (ch) {
      ch.addEventListener('click', function () {
        var on = ch.getAttribute('aria-pressed') !== 'true';
        ch.setAttribute('aria-pressed', String(on));
        state.diet = $$('[data-diet] .chip[aria-pressed="true"]').map(function (x) { return x.dataset.v; });
        render();
      });
    });
    grid.addEventListener('click', function (e) {
      if (!e.target.closest('[data-clear]')) return;
      state = { cat: state.cat, q: '', flavour: '', size: '', diet: [] };
      $('[data-search]').value = ''; $$('[data-diet] .chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      options(); render();
    });
    options(); render();
  }

  // ---------- product detail ----------
  var pdp = $('[data-pdp]');
  if (pdp) {
    var p = byId[new URLSearchParams(location.search).get('id')] || byId['classic-tubs'];
    var cat = D.categories.filter(function (c) { return c.id === p.category; })[0];
    document.title = p.name + ' · ChillCrate mockup';
    $('[data-crumb]').innerHTML = '<a href="catalogue.html?category=' + p.category + '">' + esc(cat.name) + '</a> / ' + esc(p.name);
    $('[data-name]').textContent = p.name;
    $('[data-flav]').textContent = p.flavours.length ? p.flavours.join(' · ') : (cat.name);
    $('[data-sw]').innerHTML = p.swatches.map(function (c, i) { return '<span class="sw" style="background:' + c + '" title="' + esc(p.flavours[i]) + '"></span>'; }).join('');
    $('[data-desc]').textContent = p.description;
    $('[data-high]').innerHTML = (p.highlights || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('');
    $('[data-sizes]').innerHTML = '<legend class="label">Pack size</legend>' + p.sizes.map(function (s, i) {
      return '<label class="size-opt"><input type="radio" name="size" value="' + s.id + '"' + (i ? '' : ' checked') + '><span><b>' + esc(s.label) + '</b><small>' + esc(s.contains) + '</small></span></label>';
    }).join('');
    var fsel = $('[data-flavsel]');
    if (p.flavours.length) fsel.innerHTML = (p.flavours.length > 1 ? '<option value="Assorted">Assorted, split in notes</option>' : '') + p.flavours.map(function (x) { return '<option>' + esc(x) + '</option>'; }).join('');
    else fsel.closest('.field-row').hidden = true;
    var qty = $('[data-qty]');
    var cur = function () { return sizeOf(p, $('input[name=size]:checked', pdp).value); };
    function renderPdp(reset) {
      var s = cur();
      if (reset) { qty.min = s.moq; qty.value = s.moq; }
      var n = Math.max(0, parseInt(qty.value, 10) || 0);
      var tier = Pricing.tierFor(s.tiers, n);
      $('[data-rates]').innerHTML = Pricing.tierRanges(s).map(function (t) {
        return '<tr class="' + (tier && t.min === tier.min && n >= s.moq ? 'on' : '') + '"><td>' + t.label + ' ' + esc(s.unit) + 's</td><td>' + money(t.price) + '</td></tr>';
      }).join('');
      $$('[data-unit]').forEach(function (el) { el.textContent = plural(s.unit, 2); });
      setFig($('[data-total]'), money(Pricing.lineTotal(s, n)));
      var next = Pricing.tierRanges(s).filter(function (t) { return t.min > n; })[0];
      $('[data-each]').innerHTML = money(Pricing.unitPrice(s, n)) + ' per ' + esc(s.unit) + (next ? ' · <span class="hint">' + (next.min - n) + ' more for ' + money(next.price) + ' each</span>' : '');
      $('[data-moq]').textContent = n < s.moq ? 'Minimum order is ' + s.moq + ' ' + plural(s.unit, s.moq) + '.' : '';
      $('[data-specs]').innerHTML = [['Contents', s.contains], ['Minimum order', s.moq + ' ' + plural(s.unit, s.moq)], ['Shelf life', p.shelfLife], ['Storage', p.storageTemp], ['Lead time', p.leadTime]]
        .map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>'; }).join('');
    }
    pdp.addEventListener('change', function (e) { if (e.target.name === 'size') renderPdp(true); });
    qty.addEventListener('input', function () { renderPdp(false); });
    $$('[data-step]', pdp).forEach(function (b) { b.addEventListener('click', function () { qty.value = Math.max(cur().moq, (parseInt(qty.value, 10) || 0) + (+b.dataset.step)); renderPdp(false); }); });
    $('[data-pdp-add]').addEventListener('click', function () {
      var s = cur();
      add({ productId: p.id, sizeId: s.id, flavour: p.flavours.length ? fsel.value : '', qty: Math.max(s.moq, parseInt(qty.value, 10) || s.moq) });
      added(p.name + ' (' + s.label + ')');
    });
    renderPdp(true);
  }

  // ---------- events: guest list in, menu card out ----------
  var calc = $('[data-calc]');
  if (calc) {
    var g = $('[name=guests]', calc), per = $('[name=per]', calc), fmt = $('[name=fmt]', calc), buf = $('[name=buf]', calc), out = $('[name=outdoor]', calc), evt = $('[name=evt]', calc);
    fmt.innerHTML = D.servingFormats.map(function (x) { return '<option value="' + x.id + '">' + esc(x.label) + '</option>'; }).join('');
    var opts = {};
    function line(key, name, detail, amt, optional) {
      var on = !optional || opts[key] !== false;
      return '<li class="' + (optional ? 'opt' + (on ? ' on' : '') : '') + '"><span>' + esc(name) + '</span><small>' + esc(detail) + '</small><span class="amt">' + money(amt) + '</span>' +
        (optional ? '<button type="button" class="linkish small tog" data-tog="' + key + '" aria-pressed="' + on + '">' + (on ? 'Remove' : 'Add back') + '</button>' : '') + '</li>';
    }
    var lastOrder = [];
    function renderCalc() {
      var guests = Math.max(0, parseInt(g.value, 10) || 0);
      var r = sizeEvent(guests || 1, parseFloat(per.value), parseFloat(buf.value), fmt.value);
      setFig($('[data-serv]'), (guests ? r.servings : 0).toLocaleString('en-IN'));
      var html = '', total = 0;
      lastOrder = [];
      if (guests) {
        html += line('main', r.p.name + ' · ' + r.s.label, r.cartons + ' ' + plural(r.s.unit, r.cartons) + ' (' + r.s.contains + ')' + (r.atMoq ? ' · minimum order' : ''), r.cost, false);
        total += r.cost; lastOrder.push({ productId: r.p.id, sizeId: r.s.id, flavour: 'Assorted', qty: r.cartons });
        var extras = [];
        var fr = byId['chest-freezer-rental'], frSize = r.cartons <= 25 ? '200l' : r.cartons <= 40 ? '300l' : '500l', frN = Math.max(1, Math.ceil(r.cartons / 65));
        extras.push(['freezer', fr, sizeOf(fr, frSize), frN, 'Pre-cooled at the venue, collected after']);
        if (out.checked) { var kg = Math.ceil(r.cartons / 10) * 5; extras.push(['dry', byId['dry-ice'], sizeOf(byId['dry-ice'], '5kg'), Math.max(2, kg / 5), kg + ' kg holds 6–8 hours without power']); }
        if (r.servings >= 300) extras.push(['counter', byId['serving-counter'], sizeOf(byId['serving-counter'], r.servings > 800 ? '2s' : '1s'), 1, 'Uniformed servers keep the queue moving']);
        if (fmt.value === 'tub4l') extras.push(['kit', byId['scoops-cups-kit'], sizeOf(byId['scoops-cups-kit'], 'kit'), Math.ceil(r.servings / 100), 'Cups, spoons and scoops']);
        extras.forEach(function (x) {
          var amt = Pricing.lineTotal(x[2], x[3]);
          html += line(x[0], x[1].name + ' · ' + x[2].label + (x[3] > 1 ? ' × ' + x[3] : ''), x[4], amt, true);
          if (opts[x[0]] !== false) { total += amt; lastOrder.push({ productId: x[1].id, sizeId: x[2].id, flavour: '', qty: x[3] }); }
        });
      }
      $('[data-lines]').innerHTML = html || '<li><span class="soft">Enter your guest count to set the menu card.</span></li>';
      setFig($('[data-total]'), money(total));
      $('[data-perguest]').textContent = guests ? money(total / guests) + ' per guest, before GST and delivery' : '';
      $('[data-send]').disabled = !guests;
    }
    calc.addEventListener('input', renderCalc);
    calc.addEventListener('change', renderCalc);
    $('[data-lines]').addEventListener('click', function (e) {
      var t = e.target.closest('[data-tog]'); if (!t) return;
      opts[t.dataset.tog] = t.getAttribute('aria-pressed') !== 'true';
      renderCalc();
    });
    $('[data-send]').addEventListener('click', function () {
      lastOrder.forEach(add);
      store('quotePreset:v1', { eventType: evt.value, guests: g.value });
      location.href = '/quote?event=' + encodeURIComponent(evt.value) + '&guests=' + encodeURIComponent(g.value);
    });
    $$('[data-pkg]').forEach(function (b) {
      b.addEventListener('click', function () {
        fmt.value = b.dataset.fmt; per.value = b.dataset.per; evt.value = b.dataset.pkg;
        renderCalc();
        $('#calculator').scrollIntoView({ behavior: 'smooth' }); g.focus({ preventScroll: true });
      });
    });
    renderCalc();
  }
})();
