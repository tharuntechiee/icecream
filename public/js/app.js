/* Front-end behaviour: theme, order cart (localStorage), invitation estimate, product tiers,
   event menu card, catalogue filters, location picker. Depends on /js/pricing.js. */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var money = Pricing.money;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var IRREGULAR = { box: 'boxes' };
  function plural(unit, n) { return n === 1 ? unit : (IRREGULAR[unit] || unit + 's'); }

  // ---------- storage (fails safely in private mode) ----------
  function load(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } }

  // ---------- theme: dark (indigo board) by default, light (ivory card) on request ----------
  var root = document.documentElement;
  $$('[data-theme-toggle]').forEach(function (b) {
    var sync = function () { b.setAttribute('aria-label', root.dataset.theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'); };
    sync();
    b.addEventListener('click', function () {
      root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
      store('siteTheme', root.dataset.theme);
      sync();
    });
  });

  // ---------- order cart ----------
  var CART_KEY = 'quoteCart:v1';
  var Cart = {
    items: function () { return load(CART_KEY, []); },
    save: function (items) { store(CART_KEY, items); updateBadges(); },
    key: function (i) { return i.productId + '|' + i.sizeId + '|' + (i.flavour || ''); },
    add: function (item) {
      var items = Cart.items();
      var k = Cart.key(item);
      var existing = items.filter(function (i) { return Cart.key(i) === k; })[0];
      if (existing) existing.qty += item.qty; else items.push(item);
      Cart.save(items);
    },
    count: function () { return Cart.items().length; },
  };
  window.QuoteCart = Cart;

  function updateBadges() {
    var n = Cart.count();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
  }
  updateBadges();
  window.addEventListener('storage', function (e) { if (e.key === CART_KEY) updateBadges(); });

  // ---------- toast ----------
  var toastTimer;
  function toast(html) {
    var t = $('.toast');
    if (!t) return;
    t.innerHTML = html;
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.hidden = true; }, 250); }, 4000);
  }
  function addedToast(name) {
    toast('<span>' + esc(name) + ' added to your cart</span><a href="/cart">View cart (' + Cart.count() + ')</a>');
  }

  // Quick "Add to cart" buttons (place cards, menu-card extras)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add-to-quote]');
    if (!btn) return;
    var qty = Math.max(1, parseInt(btn.getAttribute('data-qty'), 10) || 1);
    Cart.add({ productId: btn.getAttribute('data-product'), sizeId: btn.getAttribute('data-size'), flavour: btn.getAttribute('data-flavour') || '', qty: qty });
    addedToast(btn.getAttribute('data-name') || 'Item');
  });

  // ---------- header menu ----------
  var menuBtn = $('.menu-btn');
  if (menuBtn) menuBtn.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // ---------- catalogue filters submit as you change them ----------
  $$('form[data-autosubmit]').forEach(function (form) {
    form.addEventListener('change', function (e) { if (e.target.name !== 'q') form.submit(); });
  });

  // ---------- catalogue data embedded in the page ----------
  var catalogEl = $('#catalog');
  var catalog = catalogEl ? JSON.parse(catalogEl.textContent) : [];
  var byId = {};
  catalog.forEach(function (p) { byId[p.id] = p; });
  function findSize(p, id) { return p && p.sizes.filter(function (s) { return s.id === id; })[0]; }
  var formatsEl = $('#serving-formats');
  var servingFormats = formatsEl ? JSON.parse(formatsEl.textContent) : [];

  function nextTierHint(size, qty) {
    var ranges = Pricing.tierRanges(size);
    for (var i = 0; i < ranges.length; i++) {
      if (ranges[i].min > qty) return (ranges[i].min - qty) + ' more for ' + money(ranges[i].price) + ' each';
    }
    return '';
  }

  // Figures settle (a short blur-in) when their value changes.
  function setFig(el, text) {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    el.classList.remove('settle'); void el.offsetWidth; el.classList.add('settle');
  }

  // Guests → servings → cartons, shared by the invitation and the menu card.
  function sizeEvent(guests, perGuest, buffer, fmtId) {
    var fmt = servingFormats.filter(function (f) { return f.id === fmtId; })[0];
    var p = fmt && byId[fmt.productId], s = p && findSize(p, fmt.sizeId);
    if (!s) return null;
    var servings = Math.ceil(Math.round(guests * perGuest * (1 + buffer) * 1000) / 1000);
    var units = Math.ceil(servings / fmt.perUnit);
    var need = Math.ceil(units / s.unitsPerCarton);
    var cartons = Math.max(s.moq, need);
    return { p: p, s: s, fmt: fmt, servings: servings, units: units, cartons: cartons, atMoq: cartons > need, cost: Pricing.lineTotal(s, cartons) };
  }

  // ---------- home: the invitation card starts the order ----------
  var SERVINGS = { 'Wedding': 1.5, 'Birthday / private party': 1, 'Corporate event': 1, 'Festival / puja': 1.5 };
  var inv = $('[data-invite]');
  if (inv) {
    requestAnimationFrame(function () { inv.classList.add('drawn'); });
    var ev = $('[name=event]', inv), date = $('[name=date]', inv), venue = $('[name=venue]', inv), guests = $('[name=guests]', inv);
    date.value = new Date(Date.now() + 86400000 * 10).toISOString().slice(0, 10);
    date.min = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    var face = $('[data-date-face]', inv);
    var writeDate = function () {
      var v = date.value ? new Date(date.value + 'T00:00:00') : null;
      face.textContent = v && !isNaN(v) ? v.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Choose a date';
    };
    date.addEventListener('change', writeDate);
    date.addEventListener('click', function () { try { date.showPicker(); } catch (e) { /* older browsers open on focus */ } });
    writeDate();

    var renderInvite = function () {
      var g = Math.max(0, parseInt(guests.value, 10) || 0);
      var per = SERVINGS[ev.value];
      if (!per) {
        setFig($('[data-est-big]'), 'Restock by the carton');
        $('[data-est-line]').innerHTML = 'Tubs, cups, kulfi and ice at tier prices. <a href="/products">Open the catalogue</a>.';
        return;
      }
      if (!g) { setFig($('[data-est-big]'), 'Add your guest count'); $('[data-est-line]').textContent = 'We size the order for you.'; return; }
      var r = sizeEvent(g, per, 0.1, 'cup100');
      if (!r) return;
      setFig($('[data-est-big]'), '≈ ' + money(r.cost));
      $('[data-est-line]').textContent = r.cartons + ' cartons of 100ml cups (' + r.servings.toLocaleString('en-IN') + ' servings) for ' + g.toLocaleString('en-IN') + ' guests · before GST' + (r.servings >= 300 ? ' · freezer and counter suggested' : '');
    };
    inv.addEventListener('input', renderInvite);
    inv.addEventListener('change', renderInvite);
    inv.addEventListener('submit', function (e) {
      e.preventDefault();
      var g = Math.max(0, parseInt(guests.value, 10) || 0), per = SERVINGS[ev.value];
      if (per && g) { var r = sizeEvent(g, per, 0.1, 'cup100'); if (r) Cart.add({ productId: r.p.id, sizeId: r.s.id, flavour: 'Assorted', qty: r.cartons }); }
      store('quotePreset:v1', { eventType: ev.value, guests: guests.value, date: date.value, area: venue.value });
      location.href = '/cart?event=' + encodeURIComponent(ev.value) + '&guests=' + encodeURIComponent(guests.value);
    });
    var waBtn = $('[data-wa-card]');
    if (waBtn) waBtn.addEventListener('click', function () {
      var base = waBtn.href.split('?')[0];
      waBtn.href = base + '?text=' + encodeURIComponent('Hi! ' + ev.value + ' on ' + face.textContent + ' at ' + venue.value + ' for ' + guests.value + ' guests. I would like to order.');
    });
    renderInvite();
  }

  // ---------- product detail ----------
  var pdp = $('[data-pdp]');
  if (pdp) {
    var product = byId[pdp.getAttribute('data-product')];
    var qtyInput = $('[data-qty]', pdp);
    var flavourSel = $('[data-flavour]', pdp);
    var currentSize = function () { var r = $('input[name="size"]:checked', pdp); return findSize(product, r ? r.value : product.sizes[0].id); };

    var renderPdp = function (reset) {
      var s = currentSize();
      if (reset) { qtyInput.min = s.moq; qtyInput.value = s.moq; }
      var qty = Math.max(0, parseInt(qtyInput.value, 10) || 0);
      var tier = Pricing.tierFor(s.tiers, qty);
      $('[data-tier-table] tbody', pdp).innerHTML = Pricing.tierRanges(s).map(function (t) {
        var on = tier && t.min === tier.min && qty >= s.moq;
        return '<tr class="' + (on ? 'on' : '') + '"><td>' + t.label + ' ' + esc(plural(s.unit, 2)) + '</td><td>' + money(t.price) + '</td></tr>';
      }).join('');
      $$('[data-unit]', pdp).forEach(function (el) { el.textContent = plural(s.unit, 2); });
      $$('[data-unit-one]', pdp).forEach(function (el) { el.textContent = s.unit; });
      setFig($('[data-estimate]', pdp), money(Pricing.lineTotal(s, qty)));
      var hint = nextTierHint(s, qty);
      $('[data-estimate-note]', pdp).innerHTML = money(Pricing.unitPrice(s, qty)) + ' per ' + esc(s.unit) + (hint ? ' · <span class="hint">' + esc(hint) + '</span>' : '');
      $('[data-moq-note]', pdp).textContent = qty < s.moq ? 'Minimum order is ' + s.moq + ' ' + plural(s.unit, s.moq) + '.' : '';
      $('[data-spec-contains]', pdp).textContent = s.contains;
      $('[data-spec-units]', pdp).textContent = s.unitsPerCarton;
      $('[data-spec-moq]', pdp).textContent = s.moq + ' ' + plural(s.unit, s.moq);
    };
    pdp.addEventListener('change', function (e) { if (e.target.name === 'size') renderPdp(true); });
    qtyInput.addEventListener('input', function () { renderPdp(false); });
    qtyInput.addEventListener('blur', function () { var s = currentSize(); if ((parseInt(qtyInput.value, 10) || 0) < s.moq) { qtyInput.value = s.moq; renderPdp(false); } });
    $$('[data-step]', pdp).forEach(function (b) {
      b.addEventListener('click', function () {
        qtyInput.value = Math.max(currentSize().moq, (parseInt(qtyInput.value, 10) || 0) + parseInt(b.getAttribute('data-step'), 10));
        renderPdp(false);
      });
    });
    $('[data-pdp-add]', pdp).addEventListener('click', function () {
      var s = currentSize();
      var qty = Math.max(s.moq, parseInt(qtyInput.value, 10) || s.moq);
      Cart.add({ productId: product.id, sizeId: s.id, flavour: flavourSel ? flavourSel.value : '', qty: qty });
      addedToast(product.name + ' (' + s.label + ')');
    });
    renderPdp(false);
  }

  // ---------- cart page ----------
  var quotePage = $('[data-quote-page]');
  if (quotePage) {
    var list = $('[data-quote-items]');
    var form = $('[data-quote-form]');
    var DETAILS_KEY = 'quoteDetails:v1';
    var LAST_KEY = 'lastOrder:v1';

    // Drop items whose product/size no longer exists.
    Cart.save(Cart.items().filter(function (i) { return findSize(byId[i.productId], i.sizeId); }));

    // Firm totals: subtotal + the zone's delivery charge + 18% GST (same rules the server applies, public/js/totals.js).
    var zoneDataEl = $('#map-data');
    var zoneData = zoneDataEl ? JSON.parse(zoneDataEl.textContent) : null;
    var lastSubtotal = 0;
    var renderTotals = function () {
      var f = form.elements;
      var zone = window.Totals && zoneData ? Totals.zoneFor(zoneData.zones, zoneData.centre, { area: f.area.value, lat: f.lat.value, lng: f.lng.value }) : null;
      var t = window.Totals ? Totals.compute(lastSubtotal, zone) : { delivery: null, gst: 0, total: lastSubtotal };
      $('[data-subtotal]').textContent = money(lastSubtotal);
      var del = $('[data-delivery]');
      if (zone) {
        del.textContent = t.delivery === 0 ? 'Free' : money(t.delivery);
        del.classList.remove('pending');
        $('[data-zone-name]').textContent = '· ' + zone.name.replace(/^Hyderabad /, '');
      } else {
        del.textContent = 'Choose your area or drop a pin';
        del.classList.add('pending');
        $('[data-zone-name]').textContent = '';
      }
      $('[data-gst]').textContent = money(t.gst);
      $('[data-total]').textContent = money(t.total);
      $('[data-free-note]').textContent = zone && t.delivery > 0 && lastSubtotal < zone.freeAbove ? 'Free delivery above ' + money(zone.freeAbove) + ': add ' + money(zone.freeAbove - lastSubtotal) + ' more.' : '';
      var min = zone ? zone.minOrder : (parseInt(quotePage.getAttribute('data-mov'), 10) || 0);
      var mov = $('[data-mov-warning]');
      mov.hidden = !Cart.count() || lastSubtotal >= min;
      mov.textContent = 'The minimum order' + (zone ? ' for ' + zone.name : '') + ' is ' + money(min) + '. You can still place it and we will suggest options.';
      var st = $('[data-submit-total]');
      if (st) st.textContent = Cart.count() ? '· ' + money(t.total) : '';
    };
    form.addEventListener('change', function (e) { if (e.target.name === 'area') renderTotals(); });

    var renderQuote = function () {
      var items = Cart.items();
      $('[data-quote-empty]').hidden = items.length > 0;
      $('[data-summary]').hidden = items.length === 0;
      $('[data-item-count]').textContent = items.length ? '· ' + items.length + ' line' + (items.length === 1 ? '' : 's') : '';
      var last = load(LAST_KEY, null);
      $('[data-repeat-last]').hidden = !(last && last.length);

      var subtotal = 0, belowMoq = false;
      list.innerHTML = items.map(function (i, idx) {
        var p = byId[i.productId];
        var s = findSize(p, i.sizeId);
        var unit = Pricing.unitPrice(s, i.qty);
        var line = unit * i.qty;
        subtotal += line;
        if (i.qty < s.moq) belowMoq = true;
        var hint = nextTierHint(s, i.qty);
        var flavours = p.flavours.length
          ? '<select data-field="flavour" aria-label="Flavour">' + (p.flavours.length > 1 ? '<option value="Assorted"' + (i.flavour === 'Assorted' ? ' selected' : '') + '>Assorted / mixed</option>' : '') +
            p.flavours.map(function (f) { return '<option' + (f === i.flavour ? ' selected' : '') + '>' + esc(f) + '</option>'; }).join('') + '</select>'
          : '';
        var sizes = p.sizes.length > 1
          ? '<select data-field="size" aria-label="Pack size">' + p.sizes.map(function (x) { return '<option value="' + esc(x.id) + '"' + (x.id === s.id ? ' selected' : '') + '>' + esc(x.label) + '</option>'; }).join('') + '</select>'
          : '<span class="muted small">' + esc(s.label) + '</span>';
        return '<div class="qi" data-idx="' + idx + '">' +
          '<span class="line-art" aria-hidden="true" style="--art:url(&quot;' + esc(p.art) + '&quot;)"></span>' +
          '<div class="qi-main"><a class="qi-name" href="/products/' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a>' +
            '<div class="qi-opts">' + sizes + flavours + '</div>' +
            '<p class="muted small">' + esc(s.contains) + ' · ' + money(unit) + ' per ' + esc(s.unit) + (hint ? ' · <span class="hint">' + esc(hint) + '</span>' : '') + '</p>' +
            (i.qty < s.moq ? '<p class="warn-text small">Minimum ' + s.moq + ' ' + plural(s.unit, s.moq) + '</p>' : '') +
          '</div>' +
          '<div class="qi-qty"><div class="stepper sm"><button type="button" data-q="-1" aria-label="Fewer">−</button><input type="number" min="1" inputmode="numeric" value="' + i.qty + '" data-field="qty" aria-label="Quantity"><button type="button" data-q="1" aria-label="More">+</button></div><span class="muted small">' + esc(plural(s.unit, i.qty)) + '</span></div>' +
          '<div class="qi-total"><strong class="tabular">' + money(line) + '</strong><button type="button" class="btn-text small" data-remove>Remove</button></div>' +
        '</div>';
      }).join('');

      lastSubtotal = subtotal;
      $('[data-moq-warning]').hidden = !belowMoq;
      renderTotals();
    };

    var mutate = function (idx, fn) {
      var items = Cart.items();
      if (!items[idx]) return;
      fn(items[idx], items);
      // merge duplicates created by changing size/flavour
      var merged = [];
      items.forEach(function (it) {
        var m = merged.filter(function (x) { return Cart.key(x) === Cart.key(it); })[0];
        if (m) m.qty += it.qty; else merged.push(it);
      });
      Cart.save(merged);
      renderQuote();
    };

    list.addEventListener('click', function (e) {
      var row = e.target.closest('.qi');
      if (!row) return;
      var idx = +row.getAttribute('data-idx');
      if (e.target.closest('[data-remove]')) {
        var items = Cart.items(); items.splice(idx, 1); Cart.save(items); renderQuote(); return;
      }
      var step = e.target.closest('[data-q]');
      if (step) mutate(idx, function (it) { it.qty = Math.max(1, it.qty + parseInt(step.getAttribute('data-q'), 10)); });
    });
    list.addEventListener('change', function (e) {
      var row = e.target.closest('.qi');
      if (!row) return;
      var idx = +row.getAttribute('data-idx');
      var field = e.target.getAttribute('data-field');
      mutate(idx, function (it) {
        if (field === 'qty') it.qty = Math.max(1, parseInt(e.target.value, 10) || 1);
        if (field === 'flavour') it.flavour = e.target.value;
        if (field === 'size') {
          it.sizeId = e.target.value;
          var s = findSize(byId[it.productId], it.sizeId);
          it.qty = Math.max(it.qty, s.moq);
        }
      });
    });

    $('[data-repeat-last]').addEventListener('click', function () {
      load(LAST_KEY, []).forEach(function (i) { if (findSize(byId[i.productId], i.sizeId)) Cart.add(i); });
      renderQuote();
      toast('<span>Your last order has been added</span>');
    });

    // Prefill remembered contact details, and anything the invitation or menu card carried over.
    var f0 = form.elements;
    var saved = load(DETAILS_KEY, {});
    ['name', 'company', 'phone', 'email', 'gstin', 'address', 'area'].forEach(function (k) {
      if (saved[k] && f0[k] && !f0[k].value) f0[k].value = saved[k];
    });
    var preset = load('quotePreset:v1', null);
    if (preset) {
      if (!f0.eventType.value && preset.eventType) f0.eventType.value = preset.eventType;
      if (!f0.guests.value && preset.guests) f0.guests.value = preset.guests;
      if (preset.date && preset.date >= quotePage.getAttribute('data-min-date')) f0.deliveryDate.value = preset.date;
      if (preset.area && !f0.area.value) f0.area.value = preset.area;
    }
    if (!f0.deliveryDate.value) f0.deliveryDate.value = quotePage.getAttribute('data-min-date');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errBox = $('[data-form-errors]');
      var f = form.elements;
      var errors = [];
      var items = Cart.items();
      var showErrors = function (msgs) {
        errBox.innerHTML = '<ul>' + msgs.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
        errBox.hidden = false;
        errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      };
      if (!items.length) errors.push('The order is empty. Add products first.');
      if (!f.name.value.trim()) errors.push('Please enter your name.');
      if (f.phone.value.replace(/\D/g, '').length < 10) errors.push('Please enter a valid phone number.');
      if (!f.deliveryDate.value) errors.push('Please choose a delivery date.');
      if (!f.timeSlot.value) errors.push('Please choose a delivery time slot.');
      if (!f.address.value.trim()) errors.push('Please enter the delivery address.');
      if (!f.lat.value || !f.lng.value) errors.push('Choose your exact delivery spot on the map and press Deliver here.');
      if (errors.length) return showErrors(errors);

      var btn = $('[data-submit]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      var payload = {
        items: items,
        customer: { name: f.name.value, company: f.company.value, phone: f.phone.value, email: f.email.value, gstin: f.gstin.value },
        eventType: f.eventType.value, deliveryDate: f.deliveryDate.value, timeSlot: f.timeSlot.value, area: f.area.value,
        address: f.address.value, guests: f.guests.value, notes: f.notes.value, website: f.website.value,
        lat: f.lat.value, lng: f.lng.value,
      };
      fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.ok) throw res;
          store(LAST_KEY, items);
          store(DETAILS_KEY, { name: f.name.value, company: f.company.value, phone: f.phone.value, email: f.email.value, gstin: f.gstin.value, address: f.address.value, area: f.area.value });
          try { localStorage.removeItem('quotePreset:v1'); } catch (x) { /* ignore */ }
          Cart.save([]);
          window.location.href = '/thanks?ref=' + encodeURIComponent(res.ref);
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.innerHTML = 'Place order <span class="tabular" data-submit-total></span>'; renderTotals();
          showErrors((err && err.errors) || ['Could not send right now. Please try again, or WhatsApp us your list.']);
        });
    });

    renderQuote();
  }

  // ---------- events: guest list in, menu card out ----------
  var calc = $('[data-calc]');
  if (calc) {
    var g = $('[name=guests]', calc), per = $('[name=per]', calc), fmt = $('[name=fmt]', calc), buf = $('[name=buf]', calc), out = $('[name=outdoor]', calc), evt = $('[name=evt]', calc);
    var opts = {};
    var lastOrder = [];
    var line = function (key, name, detail, amt, optional) {
      var on = !optional || opts[key] !== false;
      return '<li class="' + (optional ? 'opt' + (on ? ' on' : '') : '') + '"><span>' + esc(name) + '</span><small>' + esc(detail) + '</small><span class="amt tabular">' + money(amt) + '</span>' +
        (optional ? '<button type="button" class="linkish small tog" data-tog="' + key + '" aria-pressed="' + on + '">' + (on ? 'Remove' : 'Add back') + '</button>' : '') + '</li>';
    };
    var renderCalc = function () {
      var guests = Math.max(0, parseInt(g.value, 10) || 0);
      var r = sizeEvent(guests || 1, parseFloat(per.value), parseFloat(buf.value), fmt.value);
      setFig($('[data-serv]'), (guests && r ? r.servings : 0).toLocaleString('en-IN'));
      var html = '', total = 0;
      lastOrder = [];
      if (guests && r) {
        html += line('main', r.p.name + ' · ' + r.s.label, r.cartons + ' ' + plural(r.s.unit, r.cartons) + ' (' + r.s.contains + ')' + (r.atMoq ? ' · minimum order' : ''), r.cost, false);
        total += r.cost;
        lastOrder.push({ productId: r.p.id, sizeId: r.s.id, flavour: r.p.flavours.length > 1 ? 'Assorted' : (r.p.flavours[0] || ''), qty: r.cartons });
        var extras = [];
        var fr = byId['chest-freezer-rental'];
        if (fr) {
          var frN = Math.max(1, Math.ceil(r.cartons / 65));
          var frSize = frN > 1 ? '500l' : r.cartons <= 25 ? '200l' : r.cartons <= 40 ? '300l' : '500l';
          extras.push(['freezer', fr, findSize(fr, frSize), frN, 'Pre-cooled at the venue, collected after']);
        }
        if (out.checked && byId['dry-ice']) { var kg = Math.ceil(r.cartons / 10) * 5; extras.push(['dry', byId['dry-ice'], findSize(byId['dry-ice'], '5kg'), Math.max(2, kg / 5), kg + ' kg holds 6–8 hours without power']); }
        if (r.servings >= 300 && byId['serving-counter']) extras.push(['counter', byId['serving-counter'], findSize(byId['serving-counter'], r.servings > 800 ? '2s' : '1s'), 1, 'Uniformed servers keep the queue moving']);
        if (fmt.value === 'tub4l' && byId['scoops-cups-kit']) extras.push(['kit', byId['scoops-cups-kit'], findSize(byId['scoops-cups-kit'], 'kit'), Math.ceil(r.servings / 100), 'Cups, spoons and scoops']);
        extras.forEach(function (x) {
          if (!x[2]) return;
          var amt = Pricing.lineTotal(x[2], x[3]);
          html += line(x[0], x[1].name + ' · ' + x[2].label + (x[3] > 1 ? ' × ' + x[3] : ''), x[4], amt, true);
          if (opts[x[0]] !== false) { total += amt; lastOrder.push({ productId: x[1].id, sizeId: x[2].id, flavour: '', qty: x[3] }); }
        });
      }
      $('[data-lines]').innerHTML = html || '<li><span class="soft">Enter the guest count to set the menu card.</span></li>';
      setFig($('[data-total]'), money(total));
      $('[data-perguest]').textContent = guests ? money(total / guests) + ' per guest, before GST and delivery' : '';
      $('[data-send]').disabled = !guests;
    };
    calc.addEventListener('input', renderCalc);
    calc.addEventListener('change', renderCalc);
    $('[data-lines]').addEventListener('click', function (e) {
      var t = e.target.closest('[data-tog]'); if (!t) return;
      opts[t.dataset.tog] = t.getAttribute('aria-pressed') !== 'true';
      renderCalc();
    });
    $('[data-send]').addEventListener('click', function () {
      lastOrder.forEach(function (i) { Cart.add(i); });
      store('quotePreset:v1', { eventType: evt.value, guests: g.value });
      location.href = '/cart?event=' + encodeURIComponent(evt.value) + '&guests=' + encodeURIComponent(g.value);
    });
    $$('[data-pkg]').forEach(function (b) {
      b.addEventListener('click', function () {
        fmt.value = b.dataset.fmt; per.value = b.dataset.per; evt.value = b.dataset.pkg;
        renderCalc();
        $('#calculator').scrollIntoView({ behavior: 'smooth' });
        g.focus({ preventScroll: true });
      });
    });
    renderCalc();
  }

  // ---------- Rapido-style location picker: choose the exact delivery spot ----------
  // The spot chosen on the delivery page is saved and reopens in the cart, where it is required to order.
  var SPOT_KEY = 'deliverySpot:v1';
  var mapDataEl = $('#map-data');
  var mapData = mapDataEl ? JSON.parse(mapDataEl.textContent) : null;
  if (mapData && window.LocPicker && window.L) {
    $$('[data-locpicker]').forEach(function (el) {
      var mode = el.getAttribute('data-mode') || 'check';
      var saved = load(SPOT_KEY, null);
      if (mode === 'check') {
        var picker = LocPicker.mount(el, {
          data: mapData, mode: 'check',
          onConfirm: function (p) {
            store(SPOT_KEY, { lat: p.lat, lng: p.lng, line1: p.line1, line2: p.line2 });
            location.href = '/cart';
          },
        });
        $$('[data-zone-focus]').forEach(function (b) {
          b.addEventListener('click', function () { picker.focusZone(b.getAttribute('data-zone-focus')); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
        });
        return;
      }
      // Cart: the spot is required. Confirming it fills the address and prices delivery for its zone.
      var form = el.closest('form'), note = $('[data-pin-note]');
      var applySpot = function (p) {
        var f = form.elements;
        var addr = [p.line1, p.line2].filter(Boolean).join(', ');
        if (!f.address.value || f.address.dataset.fromMap === f.address.value) { f.address.value = addr; f.address.dataset.fromMap = addr; }
        f.lat.value = p.lat.toFixed(6); f.lng.value = p.lng.toFixed(6);
        f.area.value = p.match && p.match.place !== 'Hyderabad' ? p.match.place : '';
        store(SPOT_KEY, { lat: p.lat, lng: p.lng, line1: p.line1, line2: p.line2 });
        note.classList.add('set');
        note.innerHTML = '<strong>Delivering to ' + esc(p.line1) + '</strong> · ' + esc(p.match ? p.match.zone.name : '') + (p.route ? ' · ' + esc(p.route) : '') + '. Move the pin and press Deliver here again to change it.';
        f.area.dispatchEvent(new Event('change', { bubbles: true })); // re-price delivery for this zone
      };
      LocPicker.mount(el, { data: mapData, mode: 'pick', onConfirm: applySpot, initial: saved, confirmInitial: true });
    });
  }

  // ---------- custom packaging: show only the chosen pack's sizes ----------
  var cp = $('[data-custom-product]');
  if (cp) {
    var cs = $('[data-custom-size]');
    var syncSizes = function () {
      var first = null;
      $$('option', cs).forEach(function (o) {
        var show = o.getAttribute('data-for') === cp.value;
        o.hidden = !show; o.disabled = !show;
        if (show && !first) first = o;
      });
      if (cs.selectedOptions[0] && cs.selectedOptions[0].disabled && first) cs.value = first.value;
    };
    cp.addEventListener('change', syncSizes);
    syncSizes();
  }

  // ---------- form date fields are written out ("13 Oct 2026"); the native picker sits on top ----------
  $$('.field input[type=date]').forEach(function (input) {
    var wrap = document.createElement('span');
    wrap.className = 'datefield';
    var face = document.createElement('span');
    face.className = 'dateface';
    face.setAttribute('aria-hidden', 'true');
    input.parentNode.insertBefore(wrap, input);
    wrap.appendChild(face);
    wrap.appendChild(input);
    var write = function () {
      var v = input.value ? new Date(input.value + 'T00:00:00') : null;
      var ok = v && !isNaN(v);
      face.classList.toggle('empty', !ok);
      face.innerHTML = '<span>' + (ok ? v.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Choose a date') + '</span>' +
        '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M8 3v4M16 3v4"/></svg>';
    };
    input.addEventListener('change', write);
    input.addEventListener('input', write);
    input.addEventListener('click', function () { try { input.showPicker(); } catch (e) { /* opens on focus in older browsers */ } });
    write();
  });

  // ---------- confirm dialogs ----------
  document.addEventListener('submit', function (e) {
    var msg = e.target.getAttribute && e.target.getAttribute('data-confirm');
    if (msg && !window.confirm(msg)) e.preventDefault();
  });
})();
