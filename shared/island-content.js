// Builds activity parameters for any island and mechanic (pure; rng injected)
import { ISLANDS, WORDS, LOOKALIKE, earlierKeys, unitLine } from './curriculum.js';
import { decompose, syllables } from './hangul.js';
import { buildIsland1Content as buildFamilyContent } from './island1-content.js';
import { isMastered, MASTERY_COUNT } from './mastery.js';
import { themeOf, MECH_TYPE } from './themes.js';
import { strokesFor } from './strokes.js';

const EXTRA_CONS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅈ', 'ㅎ'];
const EXTRA_VOW = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ'];
const uniq = a => [...new Set(a)];
function shuffle(a, rng) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Units that this activity type would help most come first: missing this type, then too few successes, then review
export function pickFor(island, keys, n, rng, type) {
  const m = k => island.mastery[k] || { count: 0, types: [] };
  const need = k => !isMastered(island, k) && (!m(k).types.includes(type) ? 2 : m(k).count < MASTERY_COUNT ? 1 : 0.5);
  const groups = [2, 1, 0.5, false].map(g => shuffle(keys.filter(k => need(k) === g), rng));
  return uniq(groups.flat()).slice(0, n);
}

export function partsOf(ch) { const d = decompose(ch); return d ? [d.cho, d.jung, d.jong].filter(Boolean) : []; }

function decoysFor(key, pool, rng, n) {
  const look = (LOOKALIKE[key] || []).filter(x => x !== key);
  const rest = shuffle(pool.filter(x => x !== key && !look.includes(x)), rng);
  return uniq([...look, ...rest]).filter(x => x !== key).slice(0, n);
}

export function islandUnits(n, profile) {
  if (ISLANDS[n]?.kind === 'family') return buildFamilyContent(profile).items;
  return ISLANDS[n].units.map(u => u.key);
}

export function unitsInWord(n, word) {
  const isl = ISLANDS[n]; if (!isl?.units) return [];
  const syl = syllables(word);
  return isl.units.filter(u => u.key === word || (u.key.length === 1 && syl.includes(u.key))).map(u => u.key);
}

// Which units a mechanic can give credit to on this island (for the "where to go next" markers)
export function creditable(n, mech, profile) {
  const isl = ISLANDS[n];
  if (isl?.kind === 'family') {
    const c = buildFamilyContent(profile);
    const famNames = c.family.map(f => f.name);
    if (mech === 'fruit' || mech === 'rise') return c.fruitTargets;
    if (mech === 'find' || mech === 'pairs') return c.findTargets;
    if (mech === 'gift') return famNames.length ? famNames : [c.full];
    if (mech === 'door') return traceKeys(c.given);
    if (mech === 'bridge') return uniq(c.bridgeWords.flatMap(w => [w.join(''), ...w]));
    return c.items;
  }
  const units = islandUnits(n, profile);
  if (mech === 'gift' || mech === 'pairs') return uniq(isl.words.flatMap(w => unitsInWord(n, w)));
  if (mech === 'door') return uniq(isl.trace.map(t => units.find(k => k === t || (isl.kind === 'jamo' ? isl.units.find(u => u.key === k)?.jamo === t : syllables(k).includes(t)))).filter(Boolean));
  return units;
}

// Syllables of a name that the tracer can draw (compound vowels / double consonants have no stroke data)
export function traceKeys(name) { return syllables(name).filter(s => strokesFor(s)).slice(0, 3); }

export function buildMechs(n, profile, island, rng = Math.random) {
  const isl = ISLANDS[n];
  if (isl.kind === 'family') return familyMechs(profile, island, rng);
  const units = isl.units, keys = units.map(u => u.key);
  const byKey = Object.fromEntries(units.map(u => [u.key, u]));
  const pool = uniq([...keys, ...earlierKeys(n)]);
  const wordsWithPic = isl.words.filter(w => WORDS[w]);
  const T = MECH_TYPE;
  // words that help the units still needing this type
  const wordsFor = (type, k) => {
    const want = pickFor(island, keys, keys.length, rng, type);
    const scored = wordsWithPic.map(w => ({ w, s: Math.min(...unitsInWord(n, w).map(u => want.indexOf(u)).filter(i => i >= 0).concat(99)) }));
    return shuffle(scored, rng).sort((a, b) => a.s - b.s).slice(0, k).map(x => x.w);
  };

  return {
    fruit: () => ({ rounds: pickFor(island, keys, 4, rng, T.fruit).map(k => ({
      target: k, word: byKey[k].word, pic: byKey[k].pic, line: unitLine(byKey[k]), options: shuffle([k, ...decoysFor(k, pool, rng, 3)], rng) })) }),
    bridge: () => {
      if (isl.kind === 'jamo' || n === 7) {
        return { mode: 'build', rounds: pickFor(island, keys, n === 7 ? 2 : 3, rng, T.bridge).map(k => {
          const parts = partsOf(k);
          const extra = [shuffle(EXTRA_CONS.filter(c => !parts.includes(c)), rng)[0], shuffle(EXTRA_VOW.filter(v => !parts.includes(v)), rng)[0]];
          return { target: k, parts, extra, word: byKey[k].word, pic: byKey[k].pic, line: unitLine(byKey[k]) };
        }) };
      }
      return { mode: 'words', rounds: pickFor(island, keys, 2, rng, T.bridge).map(w => ({ word: w, pic: WORDS[w], blocks: syllables(w), extra: shuffle(pool.filter(x => x.length === 1 && !syllables(w).includes(x)), rng).slice(0, 1) })) };
    },
    gift: () => ({ rounds: wordsFor(T.gift, 3).map(w => ({
      answer: w, pic: WORDS[w], credit: unitsInWord(n, w), options: shuffle([w, ...shuffle(wordsWithPic.filter(x => x !== w), rng).slice(0, 2)], rng) })) }),
    door: () => {
      const unitOf = {};
      for (const t of isl.trace) { const u = units.find(x => x.jamo === t || x.key === t || (isl.kind !== 'jamo' && syllables(x.key).includes(t))); if (u) unitOf[t] = u.key; }
      const wantUnits = pickFor(island, keys, keys.length, rng, T.door);
      const keysT = [...isl.trace].sort((a, b) => wantUnits.indexOf(unitOf[a] ?? '') - wantUnits.indexOf(unitOf[b] ?? '')).slice(0, 3);
      return { keys: keysT, unitOf, guideOpacity: Math.max(0.25, 0.6 - (n - 1) * 0.05) };
    },
    find: () => { const t = pickFor(island, keys, 1, rng, T.find)[0]; return { target: t, decoys: decoysFor(t, pool, rng, 3), count: 5, word: byKey[t].word, pic: byKey[t].pic }; },
    rise: () => ({ rounds: pickFor(island, keys, 2, rng, T.rise).map(k => ({ target: k, word: byKey[k].word, pic: byKey[k].pic, line: unitLine(byKey[k]), decoys: decoysFor(k, pool, rng, 3), need: 4 })) }),
    pairs: () => ({ pairs: wordsFor(T.pairs, 4).map(w => ({ word: w, pic: WORDS[w], credit: unitsInWord(n, w) })) }),
  };
}

function familyMechs(profile, island, rng) {
  const c = buildFamilyContent(profile);
  const T = MECH_TYPE;
  return {
    fruit: () => ({ rounds: pickFor(island, c.fruitTargets, 4, rng, T.fruit).map(k => ({ target: k, word: null, pic: null, line: k + '!', options: shuffle([k, ...shuffle(c.fruitDistractors, rng).slice(0, 3)], rng) })) }),
    bridge: () => ({ mode: 'words', rounds: c.bridgeWords.map(w => ({ word: w.join(''), pic: null, blocks: w, extra: shuffle(c.fruitDistractors, rng).slice(0, 1) })) }),
    gift: () => ({ rounds: shuffle(c.giftRequests, rng).slice(0, 3).map(r => ({ answer: r.answer, pic: null, role: r.role, options: r.options, credit: [] })) }),
    door: () => { const ks = traceKeys(c.given); const keys = ks.length ? ks : ['ㅇ']; return { keys, unitOf: Object.fromEntries(ks.map(s => [s, s])), guideOpacity: 0.35 }; },
    find: () => { const t = pickFor(island, c.findTargets, 1, rng, T.find)[0] || c.given; return { target: t, decoys: c.findDecoysFor(t), count: 4, word: null, pic: null }; },
    rise: () => ({ rounds: pickFor(island, c.fruitTargets, 2, rng, T.rise).map(k => ({ target: k, word: null, pic: null, line: k + '!', decoys: c.fruitDistractors.slice(0, 3), need: 3 })) }),
    pairs: () => ({ pairs: c.findTargets.slice(0, 4).map(w => ({ word: w, pic: null, credit: [w] })) }),
  };
}

// Places of an island with their params builder (theme decides which mechanic each place runs)
export function buildPlaces(n, profile, island, rng = Math.random) {
  const mechs = buildMechs(n, profile, island, rng);
  return Object.fromEntries(themeOf(n).places.map(p => [p.id, () => mechs[p.mech]()]));
}
export const PLACE_IDS = ['tree', 'bridge', 'animals', 'door', 'beach'];
