// Generated SVG product illustrations. These stand in for product photography until real
// photos are uploaded, and keep the catalogue photo-first without shipping image files.
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function shade(hex, amt) {
  const n = parseInt(hex.replace('#', ''), 16);
  const clamp = (v) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amt), g = clamp(((n >> 8) & 255) + amt), b = clamp((n & 255) + amt);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

const FLAVOUR_COLORS = {
  vanilla: '#F5E6B8', chocolate: '#7A4A2A', strawberry: '#F4A3B4', butterscotch: '#E3A857',
  mango: '#FFB627', pista: '#A9C77F', kesar: '#F2A65A', 'black currant': '#7B3F7A',
  malai: '#FFF3D1', coconut: '#F4EFE6', sitaphal: '#E9DFC4', orange: '#FF9A3C',
  'tender coconut': '#EFEADF', 'alphonso mango': '#FFA62B', 'chocolate fudge': '#5C3317',
  'cookies & cream': '#D9D3CA', 'kesar pista': '#F2B66D', 'rose': '#F7B2C4', 'paan': '#8DBF6A',
  assorted: '#F4A3B4', ice: '#CFEFFF',
};
const flavourColor = (f) => FLAVOUR_COLORS[String(f || '').toLowerCase()] || '#F4A3B4';

const shadow = (cx = 200, cy = 262, rx = 120) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="12" fill="#000" opacity=".07"/>`;

const shapes = {
  tub({ color, label }) {
    const d = shade(color, -40);
    return `${shadow()}
      <path d="M112 128h176l-16 120q-72 14-144 0z" fill="#fff" stroke="#e6e6e6" stroke-width="2"/>
      <path d="M118 168h164l-5 44H123z" fill="${color}" opacity=".9"/>
      <path d="M108 126q6-58 92-60q86 2 92 60z" fill="${color}"/>
      <path d="M128 122q8 18 18 0q10 20 22 0q10 18 22 0q12 20 24 0q10 18 22 0q10 16 18 0" fill="none" stroke="${d}" stroke-width="5" stroke-linecap="round" opacity=".35"/>
      <rect x="104" y="120" width="192" height="14" rx="7" fill="${d}"/>
      <text x="200" y="197" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="22" fill="${shade(color, -110)}">${esc(label || '')}</text>`;
  },
  cup({ color, label }) {
    const d = shade(color, -40);
    const one = (x, s) => `<g transform="translate(${x} ${s ? 20 : 0})">
      <path d="M-46 130h92l-10 92q-36 8-72 0z" fill="#fff" stroke="#e6e6e6" stroke-width="2"/>
      <path d="M-42 160h84l-4 34h-76z" fill="${color}"/>
      <ellipse cx="0" cy="130" rx="50" ry="12" fill="${d}"/>
      <ellipse cx="0" cy="127" rx="44" ry="8" fill="${color}"/></g>`;
    return `${shadow(200, 252, 140)}${one(130, true)}${one(270, true)}${one(200, false)}
      <rect x="226" y="86" width="10" height="56" rx="5" transform="rotate(25 231 114)" fill="#d9c7a7"/>
      <text x="200" y="185" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="16" fill="${shade(color, -110)}">${esc(label || '')}</text>`;
  },
  cone({ color }) {
    const d = shade(color, -35);
    const one = (x, y, c) => `<g transform="translate(${x} ${y})">
      <path d="M-36 0L0 120L36 0z" fill="#D9A25F"/>
      <path d="M-30 12l52 70M-18 4l46 62M-6 0l36 48M30 12l-52 70M18 4l-46 62M6 0l-36 48" stroke="#B9813F" stroke-width="3"/>
      <circle cx="0" cy="-14" r="40" fill="${c}"/><path d="M-40 -6q10 14 20 0q10 14 20 0q10 14 20 0q10 14 20 0" fill="${c}"/>
      <circle cx="-12" cy="-28" r="8" fill="#fff" opacity=".35"/></g>`;
    return `${shadow(200, 262, 110)}${one(150, 120, color)}${one(250, 120, d)}`;
  },
  stick({ color }) {
    const d = shade(color, -45);
    const one = (x, r, c) => `<g transform="translate(${x} 150) rotate(${r})">
      <rect x="-9" y="40" width="18" height="80" rx="9" fill="#E8D3A8"/>
      <rect x="-42" y="-90" width="84" height="140" rx="38" fill="${c}"/>
      <path d="M-42 -40q42 22 84 0" stroke="#fff" stroke-width="5" opacity=".25" fill="none"/>
      <circle cx="30" cy="-84" r="16" fill="#FDEFF2"/></g>`;
    return `${shadow(200, 268, 120)}${one(150, -10, d)}${one(250, 10, color)}`;
  },
  kulfi({ color }) {
    const one = (x, r) => `<g transform="translate(${x} 150) rotate(${r})">
      <rect x="-7" y="40" width="14" height="80" rx="7" fill="#E8D3A8"/>
      <path d="M-34 -90q34-24 68 0l-10 136q-24 10-48 0z" fill="${color}"/>
      <circle cx="-10" cy="-50" r="4" fill="#7FB04F"/><circle cx="12" cy="-28" r="4" fill="#7FB04F"/><circle cx="-6" cy="0" r="4" fill="#7FB04F"/>
      <circle cx="10" cy="-70" r="3" fill="#E07A2E"/><circle cx="-14" cy="-14" r="3" fill="#E07A2E"/></g>`;
    return `${shadow(200, 268, 110)}${one(160, -12)}${one(240, 12)}`;
  },
  matka({ color }) {
    return `${shadow(200, 258, 110)}
      <path d="M120 140q-12 90 80 110q92-20 80-110z" fill="#B5643A"/>
      <path d="M128 168q72 18 144 0" stroke="#8E4B29" stroke-width="5" fill="none"/>
      <ellipse cx="200" cy="138" rx="86" ry="20" fill="#9C5530"/>
      <ellipse cx="200" cy="136" rx="74" ry="14" fill="${color}"/>
      <circle cx="180" cy="134" r="4" fill="#7FB04F"/><circle cx="210" cy="138" r="4" fill="#7FB04F"/><circle cx="226" cy="132" r="3" fill="#E07A2E"/>`;
  },
  sundae({ color }) {
    const d = shade(color, -40);
    return `${shadow(200, 262, 90)}
      <path d="M130 150h140q-6 60-70 70q-64-10-70-70z" fill="#EAF6FF" stroke="#cfe3f2" stroke-width="3"/>
      <rect x="192" y="218" width="16" height="30" fill="#EAF6FF" stroke="#cfe3f2" stroke-width="3"/>
      <ellipse cx="200" cy="252" rx="46" ry="8" fill="#EAF6FF" stroke="#cfe3f2" stroke-width="3"/>
      <circle cx="166" cy="140" r="32" fill="${color}"/><circle cx="234" cy="140" r="32" fill="#F5E6B8"/><circle cx="200" cy="112" r="34" fill="${d}"/>
      <path d="M170 98q30 30 60 0q-4 30-30 34q-26-4-30-34z" fill="#5C3317" opacity=".85"/>
      <circle cx="204" cy="72" r="12" fill="#E3263B"/><path d="M204 60q6-18 20-22" stroke="#4E8B2C" stroke-width="3" fill="none"/>`;
  },
  familyPack({ color, label }) {
    const d = shade(color, -40);
    return `${shadow(200, 262, 130)}
      <path d="M90 120l110-40l110 40v110l-110 32l-110-32z" fill="#fff" stroke="#e6e6e6" stroke-width="2"/>
      <path d="M90 120l110 34l110-34" fill="none" stroke="#e6e6e6" stroke-width="2"/>
      <path d="M200 154v108" stroke="#e6e6e6" stroke-width="2"/>
      <path d="M90 150l110 34v40l-110-32z" fill="${color}"/>
      <path d="M200 184l110-34v40l-110 34z" fill="${d}"/>
      <circle cx="142" cy="210" r="18" fill="#fff" opacity=".6"/>
      <text x="255" y="140" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="700" font-size="16" fill="#555" transform="rotate(-17 255 140)">${esc(label || 'FAMILY PACK')}</text>`;
  },
  branded({ color, label }) {
    return `${shadow(200, 256, 120)}
      <path d="M130 100h140l-16 146q-54 12-108 0z" fill="#fff" stroke="#e2e2e2" stroke-width="2"/>
      <ellipse cx="200" cy="100" rx="74" ry="16" fill="${shade(color, -30)}"/>
      <circle cx="200" cy="172" r="40" fill="none" stroke="${shade(color, -60)}" stroke-width="3" stroke-dasharray="7 6"/>
      <text x="200" y="168" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="13" fill="${shade(color, -90)}">${esc(label || 'YOUR')}</text>
      <text x="200" y="186" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="13" fill="${shade(color, -90)}">LOGO</text>
      <path d="M136 132h128" stroke="${color}" stroke-width="10"/><path d="M140 222h120" stroke="${color}" stroke-width="10"/>`;
  },
  giftBox({ color }) {
    const d = shade(color, -50);
    return `${shadow(200, 262, 120)}
      <rect x="110" y="130" width="180" height="120" rx="10" fill="${color}"/>
      <rect x="100" y="108" width="200" height="34" rx="8" fill="${d}"/>
      <rect x="188" y="108" width="24" height="142" fill="#fff" opacity=".85"/>
      <path d="M200 108q-40-50-60-20q10 22 60 20zM200 108q40-50 60-20q-10 22-60 20z" fill="#fff" opacity=".9"/>`;
  },
  block() {
    return `${shadow(200, 262, 130)}
      <path d="M90 110l110-44l110 44l-110 44z" fill="#E9F8FF"/>
      <path d="M90 110v110l110 44V154z" fill="#BFE7FA"/>
      <path d="M310 110v110l-110 44V154z" fill="#9AD6F2"/>
      <path d="M112 134l30 12M118 170l40 16M236 180l40-16M250 214l30-12" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
      <path d="M150 96l50-20l50 20" stroke="#fff" stroke-width="4" fill="none" opacity=".9"/>`;
  },
  cubes() {
    const cube = (x, y, r) => `<rect x="${x}" y="${y}" width="40" height="40" rx="8" transform="rotate(${r} ${x + 20} ${y + 20})" fill="#D6F1FF" stroke="#A9DDF5" stroke-width="2"/>`;
    return `${shadow(200, 262, 110)}
      <path d="M120 90h160l12 150q-92 22-184 0z" fill="#fff" opacity=".55" stroke="#BFE3F3" stroke-width="3"/>
      ${cube(140, 170, 10)}${cube(186, 180, -8)}${cube(230, 168, 14)}${cube(160, 130, -14)}${cube(210, 128, 6)}${cube(184, 92, 18)}
      <rect x="150" y="74" width="100" height="22" rx="6" fill="#4BA3D9"/>
      <text x="200" y="90" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="12" fill="#fff">ICE CUBES</text>`;
  },
  crushed() {
    let s = '';
    const pts = [[130, 230], [160, 210], [190, 196], [220, 204], [250, 218], [275, 232], [150, 240], [205, 228], [240, 240], [180, 222], [210, 182], [170, 190], [235, 196]];
    pts.forEach(([x, y], i) => { s += `<path d="M${x} ${y}l${14 + (i % 3) * 4} -${10 + (i % 4) * 3}l${10 + (i % 2) * 6} ${16}z" fill="${i % 2 ? '#D6F1FF' : '#BFE7FA'}" stroke="#9AD6F2" stroke-width="1.5"/>`; });
    return `${shadow(200, 256, 120)}<path d="M100 250q100-120 200 0z" fill="#E9F8FF"/>${s}`;
  },
  dryIce() {
    return `${shadow(200, 262, 120)}
      <rect x="110" y="140" width="180" height="110" rx="8" fill="#fff" stroke="#e2e2e2" stroke-width="2"/>
      <rect x="104" y="128" width="192" height="22" rx="6" fill="#f2f2f2" stroke="#e2e2e2" stroke-width="2"/>
      <path d="M130 120q-20-30 10-40q0-30 34-24q20-24 46 0q34-6 34 24q30 10 10 40" fill="#fff" stroke="#E3EEF5" stroke-width="3"/>
      <rect x="150" y="180" width="100" height="26" rx="6" fill="#222"/>
      <text x="200" y="198" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="12" fill="#fff">DRY ICE −78°C</text>`;
  },
  freezer() {
    return `${shadow(200, 262, 140)}
      <rect x="80" y="130" width="240" height="120" rx="12" fill="#fff" stroke="#e2e2e2" stroke-width="2"/>
      <rect x="74" y="112" width="252" height="28" rx="8" fill="#f2f2f2" stroke="#e2e2e2" stroke-width="2"/>
      <rect x="170" y="122" width="60" height="8" rx="4" fill="#bbb"/>
      <rect x="100" y="160" width="40" height="12" rx="4" fill="#9AD6F2"/>
      <circle cx="292" cy="166" r="6" fill="#4CAF50"/>
      <path d="M200 176v52M178 189l44 26M222 189l-44 26" stroke="#BFE7FA" stroke-width="6" stroke-linecap="round"/>`;
  },
  counter({ color }) {
    return `${shadow(200, 262, 130)}
      <path d="M110 70h180l-20 40H130z" fill="${color}"/>
      <path d="M130 110h20l-10 16zM170 110h20l-10 16zM210 110h20l-10 16zM250 110h20l-10 16z" fill="${shade(color, -40)}"/>
      <rect x="196" y="110" width="8" height="40" fill="#bbb"/>
      <rect x="100" y="150" width="200" height="100" rx="10" fill="#fff" stroke="#e2e2e2" stroke-width="2"/>
      <rect x="100" y="150" width="200" height="24" rx="10" fill="${shade(color, -20)}"/>
      <circle cx="150" cy="210" r="18" fill="#F5E6B8"/><circle cx="200" cy="210" r="18" fill="#7A4A2A"/><circle cx="250" cy="210" r="18" fill="#F4A3B4"/>`;
  },
  scoops({ color }) {
    return `${shadow(200, 262, 120)}
      <rect x="120" y="150" width="14" height="96" rx="7" transform="rotate(-30 127 198)" fill="#9aa4ad"/>
      <circle cx="160" cy="118" r="30" fill="#c9d1d8"/><circle cx="160" cy="112" r="24" fill="${color}"/>
      <g fill="#fff" stroke="#e2e2e2" stroke-width="2"><path d="M220 120h70l-8 40h-54z"/><path d="M220 145h70l-8 40h-54z"/><path d="M220 170h70l-8 40h-54z"/><path d="M220 195h70l-8 40h-54z"/></g>
      <ellipse cx="255" cy="120" rx="36" ry="7" fill="${shade(color, -30)}"/>`;
  },
  van() {
    return `${shadow(200, 252, 150)}
      <rect x="70" y="110" width="170" height="110" rx="10" fill="#fff" stroke="#e2e2e2" stroke-width="2"/>
      <path d="M240 140h50l40 40v40H240z" fill="#d63b1f"/>
      <path d="M252 150h34l26 28h-60z" fill="#DFF3FF"/>
      <circle cx="120" cy="226" r="22" fill="#222"/><circle cx="120" cy="226" r="9" fill="#bbb"/>
      <circle cx="280" cy="226" r="22" fill="#222"/><circle cx="280" cy="226" r="9" fill="#bbb"/>
      <path d="M155 136v60M130 151l50 30M180 151l-50 30" stroke="#9AD6F2" stroke-width="7" stroke-linecap="round"/>
      <text x="155" y="214" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="11" fill="#999">−18°C REEFER</text>`;
  },
  facility({ color }) {
    let racks = '';
    for (let i = 0; i < 3; i++) {
      const x = 90 + i * 80;
      racks += `<rect x="${x}" y="80" width="60" height="170" fill="none" stroke="#9aa4ad" stroke-width="4"/>`;
      for (let j = 0; j < 4; j++) racks += `<rect x="${x + 6}" y="${88 + j * 40}" width="48" height="28" rx="3" fill="${j % 2 ? '#fff' : color}" stroke="#e2e2e2"/>`;
    }
    return `<rect x="60" y="60" width="280" height="200" fill="#EAF6FF"/>${racks}
      <text x="320" y="84" text-anchor="end" font-family="Inter,Arial,sans-serif" font-weight="800" font-size="14" fill="#4BA3D9">−22°C</text>`;
  },
};

const BG = {
  tub: '#FFF4EC', cup: '#FDF0F4', cone: '#FFF7E6', stick: '#F3F0FF', kulfi: '#FFF6E8', matka: '#FFF1E6',
  sundae: '#FDF0F4', familyPack: '#F3F8EE', branded: '#F4F4F4', giftBox: '#FFF0F3', block: '#EAF6FF',
  cubes: '#EEF8FF', crushed: '#EEF8FF', dryIce: '#F2F4F7', freezer: '#F2F7FB', counter: '#FFF6EE',
  scoops: '#F7F7F7', van: '#F2F7FB', facility: '#F2F7FB',
};

// Render a 4:3 illustration. variant shifts the background so detail-page thumbnails differ;
// plain drops the background entirely so the object sits on the page's own board or card stock.
function render(shape, opts = {}) {
  const fn = shapes[shape] || shapes.tub;
  const color = opts.color || '#F4A3B4';
  const bg = opts.bg || BG[shape] || '#F7F7F7';
  const v = Number(opts.variant || 0);
  const bgFill = v === 1 ? shade(bg, -10) : v === 2 ? '#ffffff' : bg;
  const deco = v === 2
    ? '<g opacity=".5"><circle cx="40" cy="40" r="6" fill="#d63b1f"/><circle cx="360" cy="60" r="4" fill="#d63b1f"/><circle cx="350" cy="260" r="7" fill="#caa24a"/></g>'
    : '<g opacity=".45"><circle cx="54" cy="56" r="26" fill="#fff"/><circle cx="350" cy="250" r="34" fill="#fff"/></g>';
  if (opts.plain) {
    // Monoline foil drawing: every shape becomes a gold hairline on a transparent ground, and the
    // lettering and floor shadow are dropped, so it reads on indigo board and ivory card alike.
    const ink = '#c39a3e';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${esc(opts.title || shape)}">
  <style>*{fill:none!important;stroke:${ink}!important;stroke-width:2.4px!important;stroke-linejoin:round;stroke-linecap:round}text,ellipse[opacity]{display:none}</style>
  ${fn({ color, label: '' }).replace(/<text[^>]*>[^<]*<\/text>/g, '')}</svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="${esc(opts.title || shape)}">
  <rect width="400" height="300" fill="${bgFill}"/>${deco}${fn({ color, label: opts.label })}</svg>`;
}

module.exports = { render, flavourColor, shade, shapes: Object.keys(shapes) };
