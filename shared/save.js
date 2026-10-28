// Save state (pure; storage is injected so tests can use a fake)
export const SAVE_KEY = 'hangul-island-save';
export const SAVE_VERSION = 1;

export function newIsland() {
  return { cleared: false, visited: [], days: [], mastery: {} };
}

export function defaultState() {
  return {
    version: SAVE_VERSION,
    profile: {
      childName: '',
      family: [
        { name: '', role: '엄마' },
        { name: '', role: '아빠' },
        { name: '', role: '할머니' },
        { name: '', role: '할아버지' },
        { name: '', role: '기타' },
      ],
    },
    settings: { volume: 0.8 },
    usedCharacters: [],
    subjects: {
      hangul: { characterId: null, stage: 0, decorations: [], wearing: null, lastRewardDay: null, islands: {} },
    },
    friends: [],
    saveError: false,
  };
}

const isObj = v => v !== null && typeof v === 'object' && !Array.isArray(v);

function merge(base, raw) {
  if (!isObj(raw)) return base;
  const out = { ...base };
  for (const k of Object.keys(raw)) {
    if (isObj(base[k]) && isObj(raw[k])) out[k] = merge(base[k], raw[k]);
    else if (raw[k] !== undefined) out[k] = raw[k];
  }
  return out;
}

export function migrate(raw) {
  if (!isObj(raw)) throw new Error('bad-save');
  const v = Number(raw.version || 0);
  if (v > SAVE_VERSION) throw new Error('newer-save');
  const st = merge(defaultState(), raw);
  st.version = SAVE_VERSION;
  for (const [n, isl] of Object.entries(st.subjects.hangul.islands || {})) {
    st.subjects.hangul.islands[n] = merge(newIsland(), isl);
  }
  return st;
}

function defaultStorage() {
  try { return globalThis.localStorage || null; } catch { return null; }
}

export function loadState(storage) {
  if (storage === undefined) storage = defaultStorage();
  let txt = null;
  try { txt = storage ? storage.getItem(SAVE_KEY) : null; } catch { txt = null; }
  if (!txt) return defaultState();
  try {
    return migrate(JSON.parse(txt));
  } catch (e) {
    try { storage.setItem(SAVE_KEY + '-corrupt-' + Date.now(), txt); } catch { /* ignore */ }
    return defaultState();
  }
}

export function saveState(state, storage) {
  if (storage === undefined) storage = defaultStorage();
  try {
    const { saveError, ...rest } = state;
    storage.setItem(SAVE_KEY, JSON.stringify({ ...rest, saveError: false }));
    state.saveError = false;
    return true;
  } catch {
    state.saveError = true;
    return false;
  }
}

function toB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}
function fromB64(b64) {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export function exportCode(state) {
  const { saveError, ...rest } = state;
  return 'HG1:' + toB64(JSON.stringify(rest));
}

export function importCode(code) {
  const c = String(code ?? '').trim();
  if (!c.startsWith('HG1:')) throw new Error('bad-code');
  let obj;
  try { obj = JSON.parse(fromB64(c.slice(4).replace(/\s+/g, ''))); } catch { throw new Error('bad-code'); }
  try { return migrate(obj); } catch (e) { if (e.message === 'newer-save') throw e; throw new Error('bad-code'); }
}
