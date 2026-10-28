// Helpers shared by activities
export const wait = ms => new Promise(r => setTimeout(r, ms));

export function shuffle(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function el(tag, style = '', html = '', cls = '') {
  const e = document.createElement(tag);
  if (style) e.style.cssText = style;
  if (html) e.innerHTML = html;
  if (cls) e.className = cls;
  return e;
}

export function card(text, extra = '') {
  const c = el('div', `position:absolute;${extra}`, '', 'card');
  c.textContent = text;
  c.dataset.text = text;
  if (text.length >= 3) c.style.fontSize = '34px';
  return c;
}

// Place element centered at percentage coordinates of its parent
export function at(e, xPct, yPct) {
  e.style.left = xPct + '%';
  e.style.top = yPct + '%';
  e.style.translate = '-50% -50%';
  return e;
}

export function glow(e) { e.classList.add('glow'); }
export function unglow(root) { root.querySelectorAll('.glow').forEach(x => x.classList.remove('glow')); }
export function wiggle(e) { e.classList.remove('wiggle'); void e.offsetWidth; e.classList.add('wiggle'); }
export function center(e) { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }

export function buddy(ctx, style = 'left:2%;bottom:2%;width:min(18vw,24vh)') {
  const b = el('div', `position:absolute;${style};pointer-events:none;z-index:3`, ctx.characterSvg, 'char buddy');
  ctx.stage.appendChild(b);
  return b;
}

export function cheer(ctx, e) {
  const [x, y] = center(e);
  ctx.burst(x, y, 'stars');
  ctx.sfx('sparkle');
}

export const SCENES = {
  tree: `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
    <rect width="1000" height="700" fill="#DDF4FF"/><rect y="560" width="1000" height="140" fill="#B8E986"/>
    <rect x="390" y="300" width="70" height="280" rx="20" fill="#C98A5A"/>
    <circle cx="425" cy="230" r="190" fill="#7ED47F"/><circle cx="300" cy="280" r="120" fill="#8EDC8C"/><circle cx="560" cy="270" r="130" fill="#8EDC8C"/></svg>`,
  river: `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
    <rect width="1000" height="700" fill="#B8E986"/><path d="M0 250 Q500 210 1000 250 V430 Q500 470 0 430Z" fill="#8ECDF5"/>
    <path d="M100 330 q30 -10 60 0 M600 300 q30 -10 60 0 M380 380 q30 -10 60 0" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/></svg>`,
  village: `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
    <rect width="1000" height="700" fill="#FFF3D6"/><rect y="520" width="1000" height="180" fill="#C8EBA0"/>
    <path d="M720 300 L840 210 L960 300 V520 H720Z" fill="#FFD3E8"/><rect x="810" y="420" width="60" height="100" rx="10" fill="#C98AA8"/></svg>`,
  door: `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
    <rect width="1000" height="700" fill="#E9DDFF"/><path d="M180 700 V260 Q500 20 820 260 V700Z" fill="#C9B8D6"/></svg>`,
  beach: `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
    <rect width="1000" height="700" fill="#FFE7B8"/><path d="M0 0 H1000 V140 Q750 190 500 150 Q250 110 0 160Z" fill="#8ECDF5"/>
    <path d="M0 160 Q250 110 500 150 Q750 190 1000 140" stroke="#fff" stroke-width="10" fill="none" opacity=".8"/></svg>`,
};
