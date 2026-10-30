// v2 island engine: illustrated map, tap-to-walk, five places, activities, mastery, rewards, clear
import { loadState, saveState, newIsland } from './save.js';
import { recordSuccess, markVisit, islandProgress, isMastered } from './mastery.js';
import { charHtml, DECORATIONS } from './characters.js';
import { speak, phrase, unlockSpeech, setSpeechVolume, stopSpeech, preloadSpeech } from './speech.js';
import { playSfx, burst, unlockAudio, setVolume, setMusic, playMusic, preloadSfx } from './fx.js';
import { attachPetting } from './pet.js';
import { LINES } from './voice-keys.js';
import { ISLANDS } from './curriculum.js';
import { buildPlaces, islandUnits, PLACE_IDS } from './island-content.js';
import { el, wait, asset } from './activities/common.js';
import * as fruit from './activities/fruit.js';
import * as bridge from './activities/bridge.js';
import * as gift from './activities/gift.js';
import * as door from './activities/door.js';
import * as find from './activities/find.js';

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const RUNNERS = { tree: fruit, bridge, animals: gift, door, beach: find };
const DEFAULT_SPOTS = { tree: [22, 25], bridge: [50, 15], animals: [82, 32], door: [80, 72], beach: [30, 70], start: [52, 48] };
const HOME_ICON = '<svg viewBox="0 0 60 60" width="48" height="48"><path d="M8 30 L30 10 L52 30 V52 H8Z" fill="#DCEBFF" stroke="#8EC5FF" stroke-width="3"/><rect x="24" y="36" width="12" height="16" fill="#8EC5FF"/></svg>';
const BACK_ICON = '<svg viewBox="0 0 60 60" width="52" height="52"><circle cx="30" cy="30" r="26" fill="#fff"/><path d="M34 18 L20 30 L34 42" stroke="#C98AA8" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const FOOT = '<svg viewBox="0 0 40 40" width="40" height="40"><ellipse cx="14" cy="24" rx="6" ry="9" fill="#fff" opacity=".9"/><ellipse cx="28" cy="16" rx="6" ry="9" fill="#fff" opacity=".9"/></svg>';

export async function startIsland(n) {
  const state = loadState();
  const H = state.subjects.hangul;
  if (!H.characterId || !/[가-힣]/.test(state.profile.childName)) { location.href = '../index.html'; return; }
  const key = String(n);
  if (!H.islands[key]) H.islands[key] = newIsland();
  const island = H.islands[key];
  if (!H.today || H.today.day !== today()) H.today = { day: today(), places: [] };
  saveState(state);
  setVolume(state.settings.volume); setSpeechVolume(state.settings.volume); setMusic(state.settings.music !== false);
  const app = document.getElementById('app');
  let spots = DEFAULT_SPOTS;
  try { spots = { ...DEFAULT_SPOTS, ...(await (await fetch(asset(`bg/island${n}.json`))).json()) }; } catch { /* defaults */ }
  const items = islandUnits(n, state.profile);
  const places = buildPlaces(n, state.profile, island);
  let busy = false, unlocked = false;
  preloadSfx();
  preloadSpeech(Object.values(LINES));

  const ensureUnlocked = () => {
    if (unlocked) return;
    unlocked = true; unlockSpeech(); unlockAudio(); playMusic('happy');
    speak(LINES.welcome);
  };

  function recommended() {
    const notToday = PLACE_IDS.filter(p => !H.today.places.includes(p));
    return notToday.sort((a, b) => (island.visited.includes(a) ? 1 : 0) - (island.visited.includes(b) ? 1 : 0)).slice(0, 2);
  }

  function renderMap() {
    const rec = recommended();
    app.innerHTML = `<div class="imap" style="position:absolute;left:50%;top:50%;width:max(100vw,160vh);height:max(62.5vw,100vh);translate:-50% -50%;overflow:hidden">
        <div class="scene-bg" style="background-image:url(${asset(`bg/island${n}.jpg`)});animation-duration:40s"></div>
        <div class="cloudshade" style="top:6%"></div><div class="cloudshade" style="top:50%;animation-delay:-15s;animation-duration:40s"></div>
        ${PLACE_IDS.map(id => `<div class="place" data-id="${id}" style="position:absolute;left:${spots[id][0]}%;top:${spots[id][1]}%;width:16%;aspect-ratio:1;translate:-50% -50%;border-radius:50%;cursor:pointer">
            ${rec.includes(id) ? `<div class="tw" style="position:absolute;left:50%;bottom:-6%;translate:-50% 0">${FOOT}</div>` : ''}
            ${rec.includes(id) || !island.visited.includes(id) ? '<div class="ring"></div>' : ''}</div>`).join('')}
        <div class="walker" style="position:absolute;width:9%;left:${spots.start[0]}%;top:${spots.start[1]}%;translate:-50% -88%;z-index:5;transition:left 1s linear, top 1s linear">${charHtml(H.characterId, H.stage, { decoration: H.wearing })}</div>
      </div>
      <button class="btn-pic home-btn" style="position:absolute;top:14px;left:14px;z-index:6" aria-label="집">${HOME_ICON}</button>`;
    const map = app.querySelector('.imap'), walker = app.querySelector('.walker');
    for (let i = 0; i < 14; i++) { const g = el('div', `left:${Math.random() * 100}%;top:${Math.random() < .5 ? Math.random() * 18 : 78 + Math.random() * 20}%;animation-delay:${-Math.random() * 2.4}s`, '', 'glint'); map.appendChild(g); }
    attachPetting(walker, {
      onTap: () => { ensureUnlocked(); walker.classList.remove('boing'); void walker.offsetWidth; walker.classList.add('boing'); playSfx('giggle'); },
      onRub: p => { burst(p.x, p.y, 'hearts'); playSfx('sparkle'); },
      onHold: () => { walker.classList.add('hug'); playSfx('giggle'); speak(LINES.love); setTimeout(() => walker.classList.remove('hug'), 900); },
    });
    app.querySelector('.home-btn').addEventListener('click', () => { location.href = '../index.html'; });
    map.addEventListener('click', async e => {
      ensureUnlocked();
      if (busy || walker.contains(e.target)) return;
      const r = map.getBoundingClientRect();
      const g = e.target.closest('.place');
      const tx = g ? spots[g.dataset.id][0] : ((e.clientX - r.left) / r.width) * 100;
      const ty = g ? spots[g.dataset.id][1] + 4 : ((e.clientY - r.top) / r.height) * 100;
      const cx = parseFloat(walker.style.left), cy = parseFloat(walker.style.top);
      const ms = Math.max(350, Math.hypot((tx - cx) * r.width / 100, (ty - cy) * r.height / 100) * 4);
      busy = true;
      walker.style.transition = `left ${ms}ms linear, top ${ms}ms linear`;
      walker.style.left = tx + '%'; walker.style.top = ty + '%';
      walker.classList.add('walking'); playSfx('pop');
      await wait(ms);
      walker.classList.remove('walking');
      busy = false;
      if (g) openPlace(g.dataset.id);
    });
  }

  function onSuccess(item, type) {
    const newly = recordSuccess(island, item, type);
    saveState(state);
    if (newly) playSfx('fanfare');
  }

  async function giveReward() {
    if (H.lastRewardDay === today()) return;
    const left = DECORATIONS.filter(d => !H.decorations.includes(d.id));
    H.lastRewardDay = today();
    if (!left.length) { saveState(state); return; }
    const d = left[Math.floor(Math.random() * left.length)];
    H.decorations.push(d.id); H.wearing = d.id;
    saveState(state);
    const ov = el('div', 'background:radial-gradient(circle,#FFF8D6,#FFE3F0);display:flex;align-items:center;justify-content:center', `<div style="width:min(36vw,52vh)">${charHtml(H.characterId, H.stage, { decoration: d.id })}</div>`, 'overlay reward');
    document.body.appendChild(ov);
    const r = ov.firstElementChild.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 3, 'stars'); playSfx('fanfare');
    await speak(LINES.present);
    await wait(1200);
    ov.remove();
  }

  async function openPlace(id) {
    if (!RUNNERS[id]) return;
    markVisit(island, id, today());
    if (!H.today.places.includes(id)) H.today.places.push(id);
    saveState(state);
    const stage = el('div', 'background:#fff;overflow:hidden', '', 'overlay stage');
    document.body.appendChild(stage);
    const inner = el('div', 'position:absolute;inset:0');
    stage.appendChild(inner);
    const back = el('button', 'position:absolute;top:14px;left:14px;z-index:20;background:none;box-shadow:none', BACK_ICON, 'btn-pic back-btn');
    stage.appendChild(back);
    let closed = false;
    const closedP = new Promise(res => back.addEventListener('click', () => { closed = true; res('closed'); }));
    const ctx = {
      stage: inner, phrase, sfx: playSfx, burst, rng: Math.random, speakLines: LINES,
      speak: t => (closed ? Promise.resolve(true) : speak(t)),
      characterHtml: charHtml(H.characterId, H.stage, { decoration: H.wearing }), onSuccess,
    };
    const outcome = await Promise.race([RUNNERS[id].run(ctx, places[id]()).then(() => 'done').catch(err => { console.error(err); return 'error'; }), closedP]);
    stopSpeech();
    stage.remove();
    if (outcome === 'done') await giveReward();
    const pr = islandProgress(island, items, PLACE_IDS);
    if (pr.cleared && !island.cleared) return clearIsland();
    renderMap();
  }

  async function clearIsland() {
    const from = H.stage, to = Math.min(H.stage + 1, 7);
    island.cleared = true; H.stage = to;
    if (n === 8 && !state.friends.some(f => f.characterId === H.characterId && f.subject === 'hangul')) state.friends.push({ characterId: H.characterId, subject: 'hangul', finishedAt: today() });
    saveState(state);
    playSfx('fanfare');
    await speak(phrase('cleared'));
    location.href = `../index.html?evolve=${from}-${to}`;
  }

  window.__island = { state, island, openPlace, items, title: ISLANDS[n].title };
  renderMap();
}

export function progressFor(n, state) {
  const isl = state.subjects.hangul.islands[String(n)];
  if (!isl) return null;
  const items = islandUnits(n, state.profile);
  return { ...islandProgress(isl, items, PLACE_IDS), left: items.filter(it => !isMastered(isl, it)) };
}
