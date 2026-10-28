// Home: start, first-run setup, character birth, island map, decorations, friend room
import { AVAILABLE_ISLANDS, ISLAND_COUNT } from './config.js';
import { loadState, saveState } from './save.js';
import { drawCharacter, pickCharacter, DECORATIONS } from './characters.js';
import { unlockSpeech, speak, phrase, setSpeechVolume } from './speech.js';
import { playSfx, burst, unlockAudio, setVolume } from './fx.js';
import { attachPetting } from './pet.js';
import { installParentGate, openParentPanel } from './parent.js';
import { playEvolution } from './evolve.js';
import { callName } from './hangul.js';

const state = loadState();
const app = document.getElementById('app');
const H = () => state.subjects.hangul;
const save = () => saveState(state);
const wait = ms => new Promise(r => setTimeout(r, ms));
const call = () => callName(state.profile.childName);
const applyVolume = () => { setVolume(state.settings.volume); setSpeechVolume(state.settings.volume); };
applyVolume();

const ISLANDS = [[400, 590], [560, 450], [410, 290], [570, 140], [770, 200], [700, 400], [830, 520], [920, 330]];
const ISLAND_TINT = ['#FFE7B8', '#FFD9E6', '#E3F4C9', '#DCEBFF', '#F3E1FF', '#FFF0C2', '#FFDCCB', '#FCE3F5'];

function islandOpen(n) {
  if (n === 1) return true;
  const prev = H().islands[String(n - 1)];
  return !!(prev && prev.cleared);
}

const PLAY_ICON = '<svg viewBox="0 0 100 100" width="150" height="150"><circle cx="50" cy="50" r="46" fill="#FF9EC4"/><circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="4"/><path d="M40 30 L72 50 L40 70Z" fill="#fff"/></svg>';
const BAG_ICON = '<svg viewBox="0 0 60 60" width="52" height="52"><path d="M14 22 h32 l4 30 h-40Z" fill="#FFB8D9" stroke="#F58FB4" stroke-width="2"/><path d="M22 22 q0-12 8-12 q8 0 8 12" fill="none" stroke="#F58FB4" stroke-width="3"/><circle cx="30" cy="36" r="5" fill="#FFE27A"/></svg>';
const ROOM_ICON = '<svg viewBox="0 0 60 60" width="52" height="52"><path d="M8 28 L30 10 L52 28 V52 H8Z" fill="#FFE7B8" stroke="#E8B04A" stroke-width="2"/><path d="M24 52 V38 h12 v14" fill="#FFB27A"/><path d="M30 24 c-3-4-9-1-6 4 l6 5 l6-5 c3-5-3-8-6-4Z" fill="#FF6FA5"/></svg>';
const CLOSE_ICON = '<svg viewBox="0 0 40 40" width="40" height="40"><circle cx="20" cy="20" r="18" fill="#fff"/><path d="M13 13 L27 27 M27 13 L13 27" stroke="#C98AA8" stroke-width="4" stroke-linecap="round"/></svg>';
const GIFT = '<svg viewBox="0 0 120 120" width="100%"><rect x="20" y="50" width="80" height="60" rx="8" fill="#FF9EC4"/><rect x="14" y="36" width="92" height="20" rx="6" fill="#FFB8D9"/><rect x="54" y="36" width="12" height="74" fill="#FFE27A"/><path d="M60 36 C40 10 26 30 44 36 M60 36 C80 10 94 30 76 36" stroke="#FFE27A" stroke-width="8" fill="none" stroke-linecap="round"/></svg>';

function islandSvg() {
  const parts = [];
  // path dots between islands
  for (let i = 0; i < ISLANDS.length - 1; i++) {
    const [x1, y1] = ISLANDS[i], [x2, y2] = ISLANDS[i + 1];
    for (let t = 0.2; t < 0.85; t += 0.15) parts.push(`<circle cx="${x1 + (x2 - x1) * t}" cy="${y1 + (y2 - y1) * t}" r="5" fill="#fff" opacity=".7"/>`);
  }
  ISLANDS.slice(0, ISLAND_COUNT).forEach(([x, y], i) => {
    const n = i + 1;
    const open = islandOpen(n);
    const cleared = !!H().islands[String(n)]?.cleared;
    parts.push(`<g class="island" data-n="${n}" style="cursor:pointer">
      <ellipse cx="${x}" cy="${y + 18}" rx="82" ry="30" fill="#9ED8F5" opacity=".6"/>
      <ellipse cx="${x}" cy="${y + 8}" rx="74" ry="34" fill="${ISLAND_TINT[i]}"/>
      <ellipse cx="${x - 8}" cy="${y - 4}" rx="44" ry="22" fill="#B8E986"/>
      <path d="M${x + 22} ${y - 2} q2 -30 -4 -44" stroke="#B5651D" stroke-width="5" fill="none"/>
      <path d="M${x + 18} ${y - 46} q-22 -6 -30 8 M${x + 18} ${y - 46} q22 -8 30 6 M${x + 18} ${y - 46} q-8 -20 -24 -18 M${x + 18} ${y - 46} q10 -18 24 -14" stroke="#5DBB6A" stroke-width="6" fill="none" stroke-linecap="round"/>
      ${[...Array(n)].map((_, k) => `<circle cx="${x - 40 + k * 11}" cy="${y + 26}" r="4" fill="#fff"/>`).join('')}
      ${cleared ? `<path d="M${x - 30} ${y - 6} v-40" stroke="#8a6" stroke-width="3"/><path d="M${x - 30} ${y - 46} l26 8 l-26 8Z" fill="#FF6FA5"/>` : ''}
      ${!open ? `<g opacity=".9"><rect x="${x - 16}" y="${y - 14}" width="32" height="26" rx="6" fill="#C9B8D6"/><path d="M${x - 9} ${y - 14} v-8 a9 9 0 0 1 18 0 v8" stroke="#C9B8D6" stroke-width="5" fill="none"/></g>` : ''}
      ${open && !cleared ? `<circle cx="${x}" cy="${y - 60}" r="7" fill="#FFD84D" class="tw"/>` : ''}
    </g>`);
  });
  return `<svg class="map" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
    <rect width="1000" height="700" fill="#BDE7FF"/>
    ${[...Array(14)].map((_, i) => `<path d="M${(i * 137) % 1000} ${(i * 251) % 700} q10 -6 20 0 q10 6 20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`).join('')}
    ${parts.join('')}</svg>`;
}

function charHtml() { return drawCharacter(H().characterId, H().stage, { decoration: H().wearing }); }

function renderHome() {
  app.innerHTML = `${islandSvg()}
    <div class="home-char char" style="position:absolute;left:2%;bottom:2%;width:min(28vw,36vh);z-index:5">${charHtml()}</div>
    <div style="position:absolute;right:16px;bottom:16px;display:flex;gap:14px;z-index:6">
      <button class="btn-pic bag-btn" aria-label="장식">${BAG_ICON}</button>
      <button class="btn-pic room-btn" aria-label="친구 방">${ROOM_ICON}</button>
    </div>`;
  const ch = app.querySelector('.home-char');
  const bounce = cls => { ch.classList.remove('boing', 'hug', 'wiggle'); void ch.offsetWidth; ch.classList.add(cls); };
  attachPetting(ch, {
    onTap: () => { bounce('boing'); playSfx('giggle'); },
    onRub: p => { burst(p.x, p.y, 'hearts'); playSfx('sparkle'); },
    onHold: () => { bounce('hug'); playSfx('giggle'); speak(call() + ', 사랑해!'); },
  });
  app.querySelectorAll('.island').forEach(g => g.addEventListener('click', () => {
    const n = Number(g.dataset.n);
    if (!islandOpen(n)) { bounce('wiggle'); playSfx('boing'); speak(phrase('locked')); return; }
    if (!AVAILABLE_ISLANDS.includes(n)) { bounce('wiggle'); speak(phrase('soon')); return; }
    playSfx('whoosh');
    location.href = `hangul/island${n}.html`;
  }));
  app.querySelector('.bag-btn').addEventListener('click', openBag);
  app.querySelector('.room-btn').addEventListener('click', openRoom);
}

function overlay(inner, bg = 'rgba(255,245,250,.96)') {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.style.cssText = `background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px`;
  ov.innerHTML = `<button class="btn-pic ov-close" style="position:absolute;top:16px;left:16px;background:none;box-shadow:none">${CLOSE_ICON}</button>${inner}`;
  ov.querySelector('.ov-close').addEventListener('click', () => { ov.remove(); renderHome(); });
  document.body.appendChild(ov);
  return ov;
}

function openBag() {
  playSfx('pop');
  const owned = H().decorations;
  const items = owned.length ? owned.map(id => `<button class="btn-pic deco" data-id="${id}" style="width:130px;height:150px;${H().wearing === id ? 'outline:4px solid #FFD84D' : ''}"><div class="char" style="width:110px">${drawCharacter(H().characterId, H().stage, { decoration: id })}</div></button>`).join('')
    : '<div class="char" style="width:200px;opacity:.5">' + charHtml() + '</div>';
  const ov = overlay(`<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;max-width:90vw">${items}</div>`);
  if (!owned.length) speak('놀이를 하면 선물을 받을 수 있어!');
  ov.addEventListener('click', e => {
    const b = e.target.closest('.deco'); if (!b) return;
    H().wearing = H().wearing === b.dataset.id ? null : b.dataset.id;
    save(); playSfx('sparkle');
    ov.querySelectorAll('.deco').forEach(x => { x.style.outline = H().wearing === x.dataset.id ? '4px solid #FFD84D' : 'none'; });
  });
}

function openRoom() {
  playSfx('pop');
  const fr = state.friends;
  const cushion = inner => `<div style="width:170px;text-align:center"><div class="char room-friend" style="width:150px;margin:0 auto;min-height:150px">${inner}</div><svg viewBox="0 0 160 40" width="170"><ellipse cx="80" cy="20" rx="76" ry="16" fill="#FFB8D9"/><ellipse cx="80" cy="16" rx="66" ry="10" fill="#FFD3E8"/></svg></div>`;
  const list = fr.length ? fr.map(f => cushion(drawCharacter(f.characterId, 7))).join('') : cushion('') + cushion('') + cushion('');
  const ov = overlay(`<div style="display:flex;flex-wrap:wrap;gap:20px;justify-content:center;align-items:end">${list}</div>`, 'linear-gradient(#FFF0F7,#FFE3F0)');
  if (!fr.length) speak('다 자란 친구들이 여기서 쉬어요');
  ov.querySelectorAll('.room-friend').forEach(el => { if (el.innerHTML) attachPetting(el, { onTap: () => { el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); playSfx('giggle'); } }); });
}

async function birth() {
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.style.cssText = 'background:radial-gradient(circle,#FFF8D6,#FFE3F0);display:flex;align-items:center;justify-content:center';
  ov.innerHTML = `<div class="gift" style="width:min(40vw,40vh);cursor:pointer">${GIFT}</div>`;
  document.body.appendChild(ov);
  speak(call() + ', 선물상자를 톡톡 눌러볼까?');
  const gift = ov.querySelector('.gift');
  let taps = 0;
  await new Promise(res => gift.addEventListener('click', () => {
    taps += 1; playSfx('pop');
    gift.classList.remove('wiggle'); void gift.offsetWidth; gift.classList.add('wiggle');
    if (taps >= 3) res();
  }));
  const id = pickCharacter(state.usedCharacters);
  H().characterId = id; H().stage = 0;
  if (!state.usedCharacters.includes(id)) state.usedCharacters.push(id);
  save();
  gift.style.transition = 'transform .5s, opacity .5s'; gift.style.transform = 'scale(1.4)'; gift.style.opacity = '0';
  playSfx('sparkle');
  await wait(500);
  ov.innerHTML = `<div class="char born" style="width:min(40vw,40vh)">${drawCharacter(id, 0)}</div>`;
  const r = ov.firstElementChild.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 'stars'); playSfx('fanfare');
  await speak(phrase('hello', { call: call() }));
  await wait(800);
  ov.remove();
}

function needsSetup() { return !/[가-힣]/.test(state.profile.childName); }

function setup() {
  return new Promise(res => {
    const open = () => openParentPanel(state, st => { save(); applyVolume(); if (needsSetup()) open(); else res(); }, { firstRun: true });
    open();
  });
}

async function afterStart() {
  if (needsSetup()) await setup();
  if (!H().characterId) await birth();
  renderHome();
  const m = /evolve=(\d)-(\d)/.exec(location.search);
  if (m) {
    history.replaceState(null, '', location.pathname);
    await playEvolution(document.body, H().characterId, Number(m[1]), Number(m[2]));
    renderHome();
  }
}

function start() {
  app.innerHTML = `<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;background:linear-gradient(#DCEBFF,#FFE3F0)">
    ${H().characterId ? `<div class="char" style="width:min(30vw,30vh)">${charHtml()}</div>` : ''}
    <button class="start-btn" style="border:none;background:none;padding:0" aria-label="시작">${PLAY_ICON}</button></div>`;
  app.querySelector('.start-btn').animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 1400, iterations: Infinity });
  app.querySelector('.start-btn').addEventListener('click', () => {
    unlockSpeech(); unlockAudio(); playSfx('pop');
    navigator.storage?.persist?.().catch(() => {});
    if (window.__swUpdateReady) { location.reload(); return; }
    afterStart();
  }, { once: true });
}

installParentGate(() => openParentPanel(state, st => { save(); applyVolume(); renderHome(); }));
start();
