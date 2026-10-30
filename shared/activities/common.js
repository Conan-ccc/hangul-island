// Helpers shared by v2 activities
const ASSETS = (() => { try { return new URL('../../assets/', import.meta.url).href; } catch { return 'assets/'; } })();
export const asset = p => ASSETS + p;
export const picUrl = name => asset(`pic/${name}.webp`);
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
export function at(e, xPct, yPct) { e.style.left = xPct + '%'; e.style.top = yPct + '%'; e.style.translate = '-50% -50%'; return e; }
export function glow(e) { if (e) e.classList.add('glow'); }
export function unglow(root) { root.querySelectorAll('.glow').forEach(x => x.classList.remove('glow')); }
export function wiggle(e) { e.classList.remove('wiggle'); void e.offsetWidth; e.classList.add('wiggle'); }
export function center(e) { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }
export const isVowelJamo = j => /[ㅏ-ㅣ]/.test(j);

// Scene background (illustration) with a slow drift
export function scene(ctx, name) {
  ctx.stage.innerHTML = '';
  const bg = ctx.skin?.bg ? asset(ctx.skin.bg) : asset('bg/act-' + name + '.jpg');
  ctx.stage.appendChild(el('div', `background-image:url(${bg})`, '', 'scene-bg'));
}

// Round progress: a row of dots at the top right that fill as rounds finish (the child sees how much is left)
export function progress(ctx, total) {
  ctx.stage.querySelector('.rounds')?.remove();
  const box = el('div', 'position:absolute;top:18px;right:18px;display:flex;gap:10px;z-index:8;background:rgba(255,255,255,.75);padding:8px 12px;border-radius:20px', '', 'rounds');
  const dots = Array.from({ length: total }, () => { const d = el('div', 'width:26px;height:26px;border-radius:50%;background:#E9DDF0;box-shadow:inset 0 2px 0 rgba(0,0,0,.08);transition:all .4s'); box.appendChild(d); return d; });
  ctx.stage.appendChild(box);
  let i = 0;
  return () => { const d = dots[i++]; if (d) { d.style.background = 'radial-gradient(circle at 35% 30%,#FFF3A8,#FFC93C)'; d.style.transform = 'scale(1.25)'; setTimeout(() => { d.style.transform = 'scale(1)'; }, 300); } };
}

// The child's character in the corner. Tapping it repeats the current prompt.
export function buddy(ctx, style = 'left:1%;bottom:1%;width:min(17vw,24vh)') {
  const b = el('div', `position:absolute;${style};z-index:5;cursor:pointer`, ctx.characterHtml, 'buddy');
  b.addEventListener('click', () => { wiggle(b); if (ctx.prompt) ask(ctx, ctx.prompt, ctx.promptTarget); });
  ctx.stage.appendChild(b);
  return b;
}

// Top letter board: picture + word with the target highlighted, or just a big letter
export function board(ctx, { pic, word, target, big }) {
  ctx.stage.querySelector('.board')?.remove();
  let inner = '';
  if (pic) inner += `<img src="${picUrl(pic)}" alt="">`;
  if (word) {
    const t = target || '';
    const i = t ? word.indexOf(t) : -1;
    inner += `<div class="bword">${i >= 0 ? word.slice(0, i) + '<b>' + t + '</b>' + word.slice(i + t.length) : '<b>' + word + '</b>'}</div>`;
  } else if (big || target) inner += `<div class="bbig">${big || target}</div>`;
  const b = el('div', '', inner, 'board');
  b.addEventListener('click', () => { if (ctx.boardLine) ctx.speak(ctx.boardLine); });
  ctx.stage.appendChild(b);
  return b;
}

// Say a prompt; if speech is unavailable or fails, show the answer right away instead.
export function ask(ctx, text, target) {
  ctx.prompt = text;
  ctx.promptTarget = target;
  return Promise.resolve(ctx.speak(text)).then(ok => { if (ok === false && target && target.isConnected) glow(target); return ok; });
}

export function cheer(ctx, e) { const [x, y] = center(e); ctx.burst(x, y, 'stars'); ctx.sfx('sparkle'); }
const PRAISE = ['와, 잘했어!', '최고야!', '멋지다!'];
export function praise(ctx) { return ctx.speak(PRAISE[Math.floor(ctx.rng() * PRAISE.length)]); }

// A letter block (jamo or syllable) styled by kind
export function jblock(text, size = 110) {
  const kind = text.length > 1 || /[가-힣]/.test(text) ? 's' : (isVowelJamo(text) ? 'v' : '');
  const b = el('div', `position:absolute;left:0;top:0;width:${size}px;height:${size}px;font-size:${Math.round(size * (text.length > 1 ? 0.42 : 0.62))}px`, '', 'jblock ' + kind);
  b.textContent = text; b.dataset.text = text;
  return b;
}
