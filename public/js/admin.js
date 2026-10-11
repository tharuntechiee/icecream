/* Admin product editor: add/remove pack-size rows and live illustration preview. */
(function () {
  'use strict';
  var sizes = document.querySelector('[data-sizes]');
  var tpl = document.querySelector('[data-size-template]');
  var addBtn = document.querySelector('[data-add-size]');
  if (sizes && tpl && addBtn) {
    addBtn.addEventListener('click', function () {
      var html = tpl.innerHTML.replace(/__i__/g, String(Date.now()));
      sizes.insertAdjacentHTML('beforeend', html);
      sizes.lastElementChild.querySelector('input').focus();
    });
    sizes.addEventListener('click', function (e) {
      if (!e.target.closest('[data-remove-size]')) return;
      if (sizes.children.length <= 1) return alert('A product needs at least one pack size.');
      e.target.closest('.size-row').remove();
    });
  }

  var preview = document.querySelector('[data-art-preview]');
  if (preview) {
    var shape = document.querySelector('[data-art-shape]');
    var color = document.querySelector('[data-art-color]');
    var label = document.querySelector('[data-art-label]');
    var update = function () {
      var qs = new URLSearchParams({ c: color.value.replace('#', '') });
      if (label.value) qs.set('l', label.value);
      preview.src = '/art/s/' + encodeURIComponent(shape.value) + '.svg?' + qs.toString();
    };
    [shape, color, label].forEach(function (el) { el.addEventListener('input', update); el.addEventListener('change', update); });
  }
})();
