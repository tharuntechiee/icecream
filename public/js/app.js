/* Front-end behaviour: quote cart (localStorage), product page pricing, event calculator, small UI bits. */
(function () {
  'use strict';
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var money = Pricing.money;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  // ---------- storage (fails safely in private mode) ----------
  function load(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } }

  // ---------- quote cart ----------
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
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.hidden = true; }, 250); }, 3800);
  }
  function addedToast(name) {
    toast('<span>✓ ' + esc(name) + ' added to your quote</span><a href="/quote">View quote (' + Cart.count() + ')</a>');
  }

  // Generic "Add to Quote" buttons (cards, calculator tips)
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add-to-quote]');
    if (!btn) return;
    var qty = Math.max(1, parseInt(btn.getAttribute('data-qty'), 10) || 1);
    Cart.add({ productId: btn.getAttribute('data-product'), sizeId: btn.getAttribute('data-size'), flavour: btn.getAttribute('data-flavour') || '', qty: qty });
    var card = btn.closest('.product-card');
    var name = btn.getAttribute('data-name') || (card && $('.card-title', card) ? $('.card-title', card).textContent.trim() : 'Item');
    addedToast(name);
  });

  // ---------- header menu ----------
  var toggle = $('.menu-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---------- catalogue filters ----------
  var filters = $('details.filters');
  if (filters && window.matchMedia('(min-width: 900px)').matches) filters.open = true;
  $$('form[data-autosubmit]').forEach(function (form) {
    form.addEventListener('change', function (e) { if (e.target.name !== 'q') form.submit(); });
  });

  // ---------- catalogue data embedded in the page ----------
  var catalogEl = $('#catalog');
  var catalog = catalogEl ? JSON.parse(catalogEl.textContent) : [];
  var byId = {};
  catalog.forEach(function (p) { byId[p.id] = p; });
  function findSize(p, id) { return p && p.sizes.filter(function (s) { return s.id === id; })[0]; }
  function plural(unit, n) { return n === 1 ? unit : unit + 's'; }

  function nextTierHint(size, qty) {
    var ranges = Pricing.tierRanges(size);
    for (var i = 0; i < ranges.length; i++) {
      if (ranges[i].min > qty) return 'Add ' + (ranges[i].min - qty) + ' more for ' + money(ranges[i].price) + '/' + size.unit;
    }
    return '';
  }

  // ---------- stepper ----------
  function bindStepper(root, onChange) {
    var input = $('[data-qty]', root) || $('input', root);
    $$('[data-step]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var min = parseInt(input.min, 10) || 1;
        var v = (parseInt(input.value, 10) || 0) + parseInt(b.getAttribute('data-step'), 10);
        input.value = Math.max(min, v);
        onChange();
      });
    });
    input.addEventListener('input', onChange);
    input.addEventListener('blur', function () {
      var min = parseInt(input.min, 10) || 1;
      if ((parseInt(input.value, 10) || 0) < min) { input.value = min; onChange(); }
    });
    return input;
  }

  // ---------- product detail page ----------
  var pdp = $('[data-pdp]');
  if (pdp) {
    var product = byId[pdp.getAttribute('data-product')];
    var qtyInput = bindStepper($('[data-stepper]', pdp), renderPdp);
    var flavourSel = $('[data-flavour]', pdp);

    $$('[data-thumb]', pdp).forEach(function (b) {
      b.addEventListener('click', function () {
        $('[data-main-img]', pdp).src = b.getAttribute('data-thumb');
        $$('[data-thumb]', pdp).forEach(function (x) { x.classList.toggle('active', x === b); });
      });
    });

    var currentSize = function () { var r = $('input[name="size"]:checked', pdp); return findSize(product, r ? r.value : product.sizes[0].id); };

    $$('input[name="size"]', pdp).forEach(function (r) {
      r.addEventListener('change', function () {
        var s = currentSize();
        qtyInput.min = s.moq;
        qtyInput.value = s.moq;
        $$('[data-unit]').forEach(function (el) { el.textContent = s.unit; });
        $('[data-moq-note]', pdp).textContent = 'Minimum order: ' + s.moq + ' ' + plural(s.unit, s.moq);
        $('[data-spec-contains]', pdp).textContent = s.contains;
        $('[data-spec-units]', pdp).textContent = s.unitsPerCarton;
        $('[data-spec-moq]', pdp).textContent = s.moq + ' ' + plural(s.unit, s.moq);
        renderPdp();
      });
    });

    function renderPdp() {
      var s = currentSize();
      var qty = Math.max(0, parseInt(qtyInput.value, 10) || 0);
      var tier = Pricing.tierFor(s.tiers, qty);
      $('[data-tier-table] tbody', pdp).innerHTML = Pricing.tierRanges(s).map(function (t) {
        var active = tier && t.min === tier.min && qty >= s.moq;
        return '<tr class="' + (active ? 'active' : '') + '"><td>' + t.label + ' ' + s.unit + 's</td><td>' + money(t.price) + '</td></tr>';
      }).join('');
      var total = Pricing.lineTotal(s, qty);
      $$('[data-estimate]').forEach(function (el) { el.textContent = money(total); });
      var hint = nextTierHint(s, qty);
      $('[data-estimate-note]', pdp).textContent = money(Pricing.unitPrice(s, qty)) + ' per ' + s.unit + (hint ? ' · ' + hint : '');
    }
    renderPdp();

    $$('[data-pdp-add]').forEach(function (b) {
      b.addEventListener('click', function () {
        var s = currentSize();
        var qty = Math.max(s.moq, parseInt(qtyInput.value, 10) || s.moq);
        Cart.add({ productId: product.id, sizeId: s.id, flavour: flavourSel ? flavourSel.value : '', qty: qty });
        addedToast(product.name + ' (' + s.label + ')');
      });
    });
  }

  // ---------- quote page ----------
  var quotePage = $('[data-quote-page]');
  if (quotePage) {
    var list = $('[data-quote-items]');
    var form = $('[data-quote-form]');
    var DETAILS_KEY = 'quoteDetails:v1';
    var LAST_KEY = 'lastOrder:v1';

    // Drop items whose product/size no longer exists.
    Cart.save(Cart.items().filter(function (i) { return findSize(byId[i.productId], i.sizeId); }));

    function renderQuote() {
      var items = Cart.items();
      $('[data-quote-empty]').hidden = items.length > 0;
      $('[data-summary]').hidden = items.length === 0;
      $('[data-item-count]').textContent = items.length ? '(' + items.length + ')' : '';
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
          '<img src="' + esc(p.art) + '" alt="" width="96" height="72">' +
          '<div class="qi-main"><a class="qi-name" href="/products/' + encodeURIComponent(p.id) + '">' + esc(p.name) + '</a>' +
            '<div class="qi-opts">' + sizes + flavours + '</div>' +
            '<p class="muted small">' + esc(s.contains) + ' · ' + money(unit) + '/' + esc(s.unit) + (hint ? ' · <span class="hint">' + esc(hint) + '</span>' : '') + '</p>' +
            (i.qty < s.moq ? '<p class="warn-text small">Minimum ' + s.moq + ' ' + plural(s.unit, s.moq) + '</p>' : '') +
          '</div>' +
          '<div class="qi-qty"><div class="stepper sm"><button type="button" data-q="-1" aria-label="Decrease">−</button><input type="number" min="1" inputmode="numeric" value="' + i.qty + '" data-field="qty" aria-label="Quantity"><button type="button" data-q="1" aria-label="Increase">+</button></div><span class="muted small">' + esc(plural(s.unit, i.qty)) + '</span></div>' +
          '<div class="qi-total"><strong>' + money(line) + '</strong><button type="button" class="btn-text small" data-remove>Remove</button></div>' +
        '</div>';
      }).join('');

      $('[data-subtotal]').textContent = money(subtotal);
      $('[data-mov-warning]').hidden = !items.length || subtotal >= (parseInt(quotePage.getAttribute('data-mov'), 10) || 0);
      $('[data-moq-warning]').hidden = !belowMoq;
    }

    function mutate(idx, fn) {
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
    }

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
      toast('<span>✓ Your last order has been added</span>');
    });

    // Prefill remembered contact details
    var saved = load(DETAILS_KEY, {});
    ['name', 'company', 'phone', 'email', 'gstin', 'address', 'area'].forEach(function (k) {
      if (saved[k] && form.elements[k] && !form.elements[k].value) form.elements[k].value = saved[k];
    });
    if (!form.elements.deliveryDate.value) form.elements.deliveryDate.value = quotePage.getAttribute('data-min-date');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var errBox = $('[data-form-errors]');
      var f = form.elements;
      var errors = [];
      var items = Cart.items();
      if (!items.length) errors.push('Your quote list is empty — add products first.');
      if (!f.name.value.trim()) errors.push('Please enter your name.');
      if (f.phone.value.replace(/\D/g, '').length < 10) errors.push('Please enter a valid phone number.');
      if (!f.deliveryDate.value) errors.push('Please choose a delivery date.');
      if (!f.timeSlot.value) errors.push('Please choose a delivery time slot.');
      if (!f.address.value.trim()) errors.push('Please enter the delivery address.');
      if (errors.length) return showErrors(errors);

      var btn = $('[data-submit]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      var payload = {
        items: items,
        customer: { name: f.name.value, company: f.company.value, phone: f.phone.value, email: f.email.value, gstin: f.gstin.value },
        eventType: f.eventType.value, deliveryDate: f.deliveryDate.value, timeSlot: f.timeSlot.value, area: f.area.value,
        address: f.address.value, guests: f.guests.value, notes: f.notes.value, website: f.website.value,
      };
      fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res.ok) throw res;
          store(LAST_KEY, items);
          store(DETAILS_KEY, { name: f.name.value, company: f.company.value, phone: f.phone.value, email: f.email.value, gstin: f.gstin.value, address: f.address.value, area: f.area.value });
          Cart.save([]);
          window.location.href = '/thanks?ref=' + encodeURIComponent(res.ref);
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.textContent = 'Send quote request';
          showErrors((err && err.errors) || ['Could not send right now. Please try again, or WhatsApp us your list.']);
        });

      function showErrors(list) {
        errBox.innerHTML = '<ul>' + list.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>';
        errBox.hidden = false;
        errBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });

    renderQuote();
  }

  // ---------- event guest calculator ----------
  var calc = $('[data-calculator]');
  if (calc) {
    var formats = JSON.parse($('#serving-formats').textContent);
    var el = function (n) { return $('[data-' + n + ']'); };
    var result = { item: null };

    function computeCalc() {
      var guests = Math.max(0, parseInt(el('c-guests').value, 10) || 0);
      var perGuest = parseFloat(el('c-servings').value) || 1;
      var buffer = parseFloat(el('c-buffer').value) || 0;
      var fmt = formats.filter(function (f) { return f.id === el('c-format').value; })[0];
      var p = byId[fmt.productId];
      var s = findSize(p, fmt.sizeId);
      var servings = Math.ceil(guests * perGuest * (1 + buffer));
      var units = Math.ceil(servings / fmt.perUnit);
      var needed = Math.ceil(units / s.unitsPerCarton);
      var cartons = Math.max(s.moq, needed);
      var cost = Pricing.lineTotal(s, cartons);

      el('r-servings').textContent = servings.toLocaleString('en-IN');
      el('r-product').innerHTML = '<a href="/products/' + p.id + '">' + esc(p.name) + '</a> · ' + esc(s.label);
      el('r-units').textContent = units.toLocaleString('en-IN') + (fmt.perUnit > 1 ? ' tubs' : ' pieces');
      el('r-cartons').textContent = cartons + ' ' + plural(s.unit, cartons) + ' (' + s.contains + ')' + (cartons > needed ? ' — minimum order' : '');
      el('r-cost').textContent = money(cost);
      el('r-perguest').textContent = guests ? money(cost / guests) : '—';
      result.item = { productId: p.id, sizeId: s.id, flavour: p.flavours.length > 1 ? 'Assorted' : (p.flavours[0] || ''), qty: cartons, name: p.name };

      var tips = [];
      var freezerSize = cartons <= 25 ? '200l' : cartons <= 40 ? '300l' : '500l';
      var freezers = Math.ceil(cartons / 65);
      if (freezers > 1) freezerSize = '500l';
      if (byId['chest-freezer-rental']) tips.push(tipHtml('No freezer at the venue? Rent ' + (freezers > 1 ? freezers + ' × ' : '') + freezerSize.toUpperCase().replace('L', ' L') + ' chest freezer', 'chest-freezer-rental', freezerSize, Math.max(1, freezers), 'Chest freezer'));
      if (el('c-outdoor').checked && byId['dry-ice']) {
        var kg = Math.ceil(cartons / 10) * 5;
        tips.push(tipHtml('Outdoors / no power: add ~' + kg + ' kg dry ice to hold for 6–8 h', 'dry-ice', '5kg', Math.max(2, kg / 5), 'Dry ice'));
      }
      if (servings >= 300 && byId['serving-counter']) tips.push(tipHtml('300+ servings: a staffed serving counter keeps queues moving', 'serving-counter', servings > 800 ? '2s' : '1s', 1, 'Serving counter'));
      if (fmt.id === 'tub4l' && byId['scoops-cups-kit']) tips.push(tipHtml('Serving from tubs: add ' + Math.ceil(servings / 100) + ' cups & spoons kits', 'scoops-cups-kit', 'kit', Math.ceil(servings / 100), 'Cups & spoons kit'));
      el('r-tips').innerHTML = tips.join('');
    }
    function tipHtml(text, pid, sid, qty, name) {
      return '<li>' + esc(text) + ' <button type="button" class="btn-text small" data-add-to-quote data-product="' + pid + '" data-size="' + sid + '" data-qty="' + qty + '" data-name="' + esc(name) + '">+ Add</button></li>';
    }

    calc.addEventListener('input', computeCalc);
    calc.addEventListener('change', computeCalc);
    el('r-add').addEventListener('click', function () {
      if (!result.item) return;
      var it = result.item;
      Cart.add({ productId: it.productId, sizeId: it.sizeId, flavour: it.flavour, qty: it.qty });
      store('quotePreset:v1', { eventType: el('c-event').value, guests: el('c-guests').value });
      toast('<span>✓ ' + it.qty + ' cartons of ' + esc(it.name) + ' added</span><a href="/quote?event=' + encodeURIComponent(el('c-event').value) + '&guests=' + encodeURIComponent(el('c-guests').value) + '">View quote</a>');
    });

    $$('[data-use-package]').forEach(function (b) {
      b.addEventListener('click', function () {
        el('c-format').value = b.getAttribute('data-format');
        el('c-servings').value = b.getAttribute('data-servings');
        var ev = b.getAttribute('data-event');
        $$('option', el('c-event')).forEach(function (o) { if (o.value === ev) el('c-event').value = ev; });
        computeCalc();
        $('#calculator').scrollIntoView({ behavior: 'smooth' });
        el('c-guests').focus({ preventScroll: true });
      });
    });
    computeCalc();
  }

  // Quote page: prefill event type/guests carried over from the calculator
  if (quotePage) {
    var preset = load('quotePreset:v1', null);
    var f2 = $('[data-quote-form]').elements;
    if (preset) {
      if (!f2.eventType.value && preset.eventType) f2.eventType.value = preset.eventType;
      if (!f2.guests.value && preset.guests) f2.guests.value = preset.guests;
    }
  }

  // ---------- delivery area checker ----------
  var areaInput = $('[data-area-search]');
  if (areaInput) {
    var out = $('[data-area-result]');
    areaInput.addEventListener('input', function () {
      var term = areaInput.value.trim().toLowerCase();
      var hit = null;
      $$('[data-area]').forEach(function (li) {
        var match = term && li.textContent.toLowerCase().indexOf(term) !== -1;
        li.classList.toggle('match', !!match);
        if (match && !hit) hit = li;
      });
      if (!term) { out.hidden = true; return; }
      out.hidden = false;
      if (hit) {
        var zone = hit.closest('[data-zone]');
        out.className = 'notice success small';
        out.innerHTML = '✓ We deliver to <strong>' + esc(hit.textContent) + '</strong> — ' + esc(zone.getAttribute('data-zone')) + '. ' + esc($('dd', zone).textContent) + '.';
      } else {
        out.className = 'notice small';
        out.innerHTML = 'Not on our list yet — we often still deliver for larger orders. <a href="/contact">Ask us</a>.';
      }
    });
  }

  // ---------- custom packaging: filter size options by product ----------
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

  // ---------- confirm dialogs ----------
  document.addEventListener('submit', function (e) {
    var msg = e.target.getAttribute && e.target.getAttribute('data-confirm');
    if (msg && !window.confirm(msg)) e.preventDefault();
  });
})();
