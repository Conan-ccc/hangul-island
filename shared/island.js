// Island engine: map, tap-to-walk, places, activity runner, mastery, rewards, clear
import { loadState, saveState, newIsland } from './save.js';
import { recordSuccess, markVisit, islandProgress, isMastered } from './mastery.js';
import { drawCharacter, DECORATIONS } from './characters.js';
import { speak, phrase, unlockSpeech, setSpeechVolume } from './speech.js';
import { playSfx, burst, unlockAudio, setVolume } from './fx.js';
import { attachPetting } from './pet.js';
import { callName } from './hangul.js';
import { el, wait } from './activities/common.js';

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const HOME_ICON = '<svg viewBox="0 0 60 60" width="48" height="48"><path d="M8 30 L30 10 L52 30 V52 H8Z" fill="#DCEBFF" stroke="#8EC5FF" stroke-width="3"/><rect x="24" y="36" width="12" height="16" fill="#8EC5FF"/></svg>';
const BACK_ICON = '<svg viewBox="0 0 60 60" width="48" height="48"><circle cx="30" cy="30" r="26" fill="#fff"/><path d="M34 18 L20 30 L34 42" stroke="#C98AA8" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FOOT = '<svg viewBox="0 0 40 40" width="34" height="34"><ellipse cx="14" cy="24" rx="6" ry="9" fill="#C98AA8"/><ellipse cx="28" cy="16" rx="6" ry="9" fill="#C98AA8"/></svg>';

export const PLACE_ICONS = {
  tree: '<circle cx="0" cy="-40" r="50" fill="#7ED47F"/><rect x="-10" y="-5" width="20" height="45" rx="6" fill="#C98A5A"/><circle cx="-20" cy="-50" r="9" fill="#FF8FA3"/><circle cx="18" cy="-36" r="9" fill="#FF8FA3"/><circle cx="2" cy="-66" r="9" fill="#FF8FA3"/>',
  bridge: '<path d="M-70 20 Q0 -40 70 20" stroke="#C98A5A" stroke-width="14" fill="none"/><path d="M-70 20 Q0 -40 70 20" stroke="#E8B04A" stroke-width="6" fill="none" stroke-dasharray="10 8"/><path d="M-80 34 h160" stroke="#8ECDF5" stroke-width="12" stroke-linecap="round"/>',
  animals: '<path d="M-50 10 L0 -40 L50 10 V40 H-50Z" fill="#FFD3E8" stroke="#F58FB4" stroke-width="3"/><rect x="-12" y="14" width="24" height="26" fill="#C98AA8"/><ellipse cx="60" cy="20" rx="7" ry="16" fill="#fff" stroke="#ddd"/><circle cx="60" cy="40" r="14" fill="#fff" stroke="#ddd"/>',
  door: '<path d="M-45 40 V-20 Q0 -70 45 -20 V40Z" fill="#C9B8D6"/><path d="M-26 40 V-10 Q0 -40 26 -10 V40Z" fill="#C98A5A"/><circle cx="14" cy="12" r="4" fill="#FFD84D"/>',
  beach: '<ellipse cx="0" cy="20" rx="70" ry="26" fill="#FFE7B8"/><path d="M-30 10 q10 -20 20 0Z" fill="#FFB8D9"/><path d="M14 18 l8 -18 l8 18Z" fill="#FFD3E8"/><rect x="-6" y="-14" width="34" height="24" rx="6" fill="#fff" stroke="#FFC2D9" stroke-width="3"/>',
};

export function startIsland({ n, places, items, placeItems = {}, greeting }) {
  const state = loadState();
  const H = state.subjects.hangul;
  if (!H.characterId || !/[가-힣]/.test(state.profile.childName)) { location.href = '../index.html'; return; }
  const key = String(n);
  if (!H.islands[key]) H.islands[key] = newIsland();
  const island = H.islands[key];
  if (!H.today || H.today.day !== today()) H.today = { day: today(), places: [] };
  saveState(state);
  setVolume(state.settings.volume); setSpeechVolume(state.settings.volume);
  const call = callName(state.profile.childName);
  const app = document.getElementById('app');
  let busy = false, unlocked = false;

  const ensureUnlocked = () => {
    if (unlocked) return;
    unlocked = true; unlockSpeech(); unlockAudio();
    speak(greeting || call + ', 섬에 왔어! 가고 싶은 곳을 눌러볼까?');
  };

  function recommended() {
    const notToday = places.filter(p => !H.today.places.includes(p.id));
    const score = p => {
      const its = placeItems[p.id] || [];
      const open = its.filter(it => !isMastered(island, it)).length;
      return open + (island.visited.includes(p.id) ? 0 : 5);
    };
    return notToday.sort((a, b) => score(b) - score(a)).slice(0, 2).map(p => p.id);
  }

  function renderMap() {
    const rec = recommended();
    app.innerHTML = `<svg class="imap" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%">
        <rect width="1000" height="700" fill="#BDE7FF"/>
        <path d="M120 360 C100 160 360 70 560 90 C820 110 940 260 900 420 C870 580 640 660 440 640 C230 620 140 520 120 360Z" fill="#FFE7B8"/>
        <path d="M190 360 C180 220 380 140 560 160 C760 180 850 290 820 410 C790 540 610 590 450 575 C290 560 200 480 190 360Z" fill="#C8EBA0"/>
        ${places.map(p => `<g class="place" data-id="${p.id}" transform="translate(${p.x} ${p.y})" style="cursor:pointer">
            <circle r="78" fill="#fff" opacity=".001"/>${PLACE_ICONS[p.icon] || ''}
            ${rec.includes(p.id) ? `<g class="tw" transform="translate(-20 50)">${FOOT.replace('<svg', '<svg x="0" y="0"')}</g>` : ''}</g>`).join('')}
      </svg>
      <div class="walker char" style="position:absolute;width:min(14vw,20vh);left:50%;top:55%;translate:-50% -85%;z-index:5;transition:left 1s linear, top 1s linear">${drawCharacter(H.characterId, H.stage, { decoration: H.wearing })}</div>
      <button class="btn-pic home-btn" style="position:absolute;top:14px;left:14px;z-index:6" aria-label="집">${HOME_ICON}</button>`;
    const walker = app.querySelector('.walker');
    attachPetting(walker, {
      onTap: () => { ensureUnlocked(); walker.classList.remove('boing'); void walker.offsetWidth; walker.classList.add('boing'); playSfx('giggle'); },
      onRub: p => { burst(p.x, p.y, 'hearts'); playSfx('sparkle'); },
    });
    app.querySelector('.home-btn').addEventListener('click', () => { location.href = '../index.html'; });
    const svg = app.querySelector('.imap');
    svg.addEventListener('click', async e => {
      ensureUnlocked();
      if (busy) return;
      const g = e.target.closest('.place');
      const r = app.getBoundingClientRect();
      let tx = e.clientX - r.left, ty = e.clientY - r.top;
      if (g) { const b = g.getBoundingClientRect(); tx = b.left + b.width / 2 - r.left; ty = b.top + b.height * 0.75 - r.top; }
      const wr = walker.getBoundingClientRect();
      const cx = wr.left + wr.width / 2 - r.left, cy = wr.top + wr.height * 0.85 - r.top;
      const dist = Math.hypot(tx - cx, ty - cy);
      const ms = Math.max(300, dist * 6);
      busy = true;
      walker.style.transition = `left ${ms}ms linear, top ${ms}ms linear`;
      walker.style.left = tx + 'px'; walker.style.top = ty + 'px';
      const bob = walker.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)' }, { transform: 'translateY(0)' }], { duration: 300, iterations: Math.ceil(ms / 300) });
      await wait(ms);
      bob.cancel();
      busy = false;
      if (g) openPlace(places.find(p => p.id === g.dataset.id));
    });
  }

  function onSuccess(item, type) {
    const newly = recordSuccess(island, item, type);
    saveState(state);
    if (newly) { playSfx('fanfare'); }
  }

  async function giveReward() {
    if (H.lastRewardDay === today()) return;
    const left = DECORATIONS.filter(d => !H.decorations.includes(d.id));
    H.lastRewardDay = today();
    if (!left.length) { saveState(state); return; }
    const d = left[Math.floor(Math.random() * left.length)];
    H.decorations.push(d.id);
    H.wearing = d.id;
    saveState(state);
    const ov = el('div', 'background:radial-gradient(circle,#FFF8D6,#FFE3F0);display:flex;align-items:center;justify-content:center', `<div class="char" style="width:min(40vw,50vh)">${drawCharacter(H.characterId, H.stage, { decoration: d.id })}</div>`, 'overlay reward');
    document.body.appendChild(ov);
    const r = ov.firstElementChild.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 3, 'stars'); playSfx('fanfare');
    await speak('선물이야! ' + d.name + '!');
    await wait(1200);
    ov.remove();
  }

  async function openPlace(place) {
    if (!place) return;
    markVisit(island, place.id, today());
    if (!H.today.places.includes(place.id)) H.today.places.push(place.id);
    saveState(state);
    const stage = el('div', 'background:#fff;overflow:hidden', '', 'overlay stage');
    document.body.appendChild(stage);
    const inner = el('div', 'position:absolute;inset:0');
    stage.appendChild(inner);
    const back = el('button', 'position:absolute;top:14px;left:14px;z-index:20;background:none;box-shadow:none', BACK_ICON, 'btn-pic back-btn');
    stage.appendChild(back);
    const closed = new Promise(res => back.addEventListener('click', () => res('closed')));
    const ctx = {
      stage: inner, speak, phrase, sfx: playSfx, burst, rng: Math.random, call,
      characterSvg: drawCharacter(H.characterId, H.stage, { decoration: H.wearing }), onSuccess,
    };
    const outcome = await Promise.race([place.run(ctx, place.params()).then(() => 'done').catch(err => { console.error(err); return 'error'; }), closed]);
    stage.remove();
    if (outcome === 'done') await giveReward();
    const pr = islandProgress(island, items, places.map(p => p.id));
    if (pr.cleared && !island.cleared) return clearIsland();
    renderMap();
  }

  async function clearIsland() {
    const from = H.stage, to = Math.min(H.stage + 1, 7);
    island.cleared = true;
    H.stage = to;
    saveState(state);
    playSfx('fanfare');
    await speak(phrase('cleared'));
    location.href = `../index.html?evolve=${from}-${to}`;
  }

  window.__island = { state, island, openPlace: id => openPlace(places.find(p => p.id === id)), places };
  renderMap();
}
