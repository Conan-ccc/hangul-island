// Sound effects synthesized with Web Audio, and small particle bursts
let ctx = null;
let master = null;
let vol = 0.8;

function ac() {
  if (ctx) return ctx;
  const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = vol * 0.5;
  master.connect(ctx.destination);
  return ctx;
}

export function unlockAudio() {
  const c = ac(); if (c && c.state === 'suspended') c.resume();
}

export function setVolume(v) {
  vol = Math.max(0, Math.min(1, Number(v)));
  if (master) master.gain.value = vol * 0.5;
}

function tone(freq, start, dur, type = 'sine', gain = 0.6, slideTo = null) {
  const c = ac(); if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + 0.05);
}

const SFX = {
  pop: () => tone(520, 0, 0.12, 'sine', 0.5, 900),
  boing: () => tone(300, 0, 0.35, 'triangle', 0.5, 140),
  sparkle: () => [1320, 1760, 2093].forEach((f, i) => tone(f, i * 0.06, 0.18, 'sine', 0.25)),
  whoosh: () => tone(200, 0, 0.4, 'sawtooth', 0.12, 900),
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.14, i === 3 ? 0.6 : 0.2, 'triangle', 0.4)),
  giggle: () => [880, 990, 880, 1046].forEach((f, i) => tone(f, i * 0.08, 0.09, 'sine', 0.3)),
};

export function playSfx(name) {
  try { if (SFX[name]) SFX[name](); } catch { /* audio is optional */ }
}

const HEART = '<svg viewBox="-10 -2 20 18" width="26" height="24"><path d="M0 4 C-6 -2 -12 2 -8 8 L0 15 L8 8 C12 2 6 -2 0 4Z" fill="#FF8FB1"/></svg>';
const STAR = '<svg viewBox="-12 -12 24 24" width="24" height="24"><path d="M0 -10 L3 -3 L10 -3 L4.5 1.5 L6.5 9 L0 4.5 L-6.5 9 L-4.5 1.5 L-10 -3 L-3 -3Z" fill="#FFD84D"/></svg>';

export function burst(x, y, kind = 'hearts') {
  const doc = globalThis.document; if (!doc) return;
  const n = 10;
  for (let i = 0; i < n; i++) {
    const el = doc.createElement('div');
    el.className = 'fx-particle';
    el.innerHTML = kind === 'stars' ? STAR : HEART;
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
    const d = 50 + Math.random() * 50;
    el.style.cssText = `position:fixed;left:${x - 12}px;top:${y - 12}px;pointer-events:none;z-index:9999;transition:transform .8s ease-out,opacity .8s ease-out;`;
    doc.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.transform = `translate(${Math.cos(a) * d}px,${Math.sin(a) * d - 30}px) scale(${0.6 + Math.random() * 0.6})`;
      el.style.opacity = '0';
    });
    setTimeout(() => el.remove(), 850);
  }
}
