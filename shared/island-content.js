// Builds the activity parameters for any island from the curriculum (pure, rng injected)
import { ISLANDS, WORDS, LOOKALIKE, earlierKeys, unitLine } from './curriculum.js';
import { decompose, syllables, compose } from './hangul.js';
import { buildIsland1Content as buildFamilyContent } from './island1-content.js';
import { isMastered } from './mastery.js';

export const PLACE_IDS = ['tree', 'bridge', 'animals', 'door', 'beach'];
const EXTRA_CONS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅈ', 'ㅎ'];
const EXTRA_VOW = ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅣ', 'ㅡ'];
const uniq = a => [...new Set(a)];
function shuffle(a, rng) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// Unmastered first, then review; never more than n
function pick(island, keys, n, rng) {
  const fresh = shuffle(keys.filter(k => !isMastered(island, k)), rng);
  const old = shuffle(keys.filter(k => isMastered(island, k)), rng);
  return [...fresh, ...old].slice(0, n);
}

// Parts (jamo) of a syllable for the build activity
export function partsOf(ch) { const d = decompose(ch); return d ? [d.cho, d.jung, d.jong].filter(Boolean) : []; }

function decoysFor(key, pool, rng, n) {
  const look = (LOOKALIKE[key] || []).filter(x => x !== key);
  const rest = shuffle(pool.filter(x => x !== key && !look.includes(x)), rng);
  return uniq([...look, ...rest]).filter(x => x !== key).slice(0, n);
}

export function islandUnits(n, profile) {
  if (ISLANDS[n]?.kind === 'family') {
    const c = buildFamilyContent(profile);
    return c.items;
  }
  return ISLANDS[n].units.map(u => u.key);
}

// Which unit keys a word contains (credit for reading the word)
export function unitsInWord(n, word) {
  const isl = ISLANDS[n]; if (!isl?.units) return [];
  const syl = syllables(word);
  return isl.units.filter(u => u.key === word || (u.key.length === 1 && syl.includes(u.key))).map(u => u.key);
}

export function buildPlaces(n, profile, island, rng = Math.random) {
  const isl = ISLANDS[n];
  if (isl.kind === 'family') return familyPlaces(profile, island, rng);
  const units = isl.units, keys = units.map(u => u.key);
  const byKey = Object.fromEntries(units.map(u => [u.key, u]));
  const pool = uniq([...keys, ...earlierKeys(n)]);
  const wordsWithPic = isl.words.filter(w => WORDS[w]);

  const fruit = () => ({
    rounds: pick(island, keys, 4, rng).map(k => ({
      target: k, word: byKey[k].word, pic: byKey[k].pic, line: unitLine(byKey[k]),
      options: shuffle([k, ...decoysFor(k, pool, rng, 3)], rng),
    })),
  });

  const bridge = () => {
    if (isl.kind === 'jamo') {
      return { mode: 'build', rounds: pick(island, keys, 3, rng).map(k => {
        const parts = partsOf(k);
        const extra = shuffle(parts.length && EXTRA_CONS.includes(parts[0]) || parts[0] === 'ㅇ' ? [...EXTRA_CONS.filter(c => c !== parts[0])].slice(0, 4) : [], rng).slice(0, 1)
          .concat(shuffle(EXTRA_VOW.filter(v => v !== parts[1]), rng).slice(0, 1));
        return { target: k, parts, extra, word: byKey[k].word, pic: byKey[k].pic, line: unitLine(byKey[k]) };
      }) };
    }
    // word islands: assemble the word from syllable blocks; batchim island builds the syllable from jamo
    const ws = pick(island, keys, 2, rng);
    if (n === 7) return { mode: 'build', rounds: ws.map(w => ({ target: w, parts: partsOf(w), extra: shuffle(EXTRA_CONS.filter(c => !partsOf(w).includes(c)), rng).slice(0, 2), word: w, pic: WORDS[w], line: w + '!' })) };
    return { mode: 'words', rounds: ws.map(w => ({ word: w, pic: WORDS[w], blocks: syllables(w), extra: shuffle(pool.filter(x => x.length === 1 && !syllables(w).includes(x)), rng).slice(0, 1) })) };
  };

  const animals = () => ({
    rounds: shuffle(wordsWithPic, rng).slice(0, 3).map(w => ({
      answer: w, pic: WORDS[w], credit: unitsInWord(n, w),
      options: shuffle([w, ...shuffle(wordsWithPic.filter(x => x !== w), rng).slice(0, 2)], rng),
    })),
  });

  const door = () => {
    const tkeys = shuffle(isl.trace, rng).slice(0, 3);
    const unitOf = {};
    for (const t of isl.trace) { const u = units.find(x => x.jamo === t || x.key === t || partsOf(x.key).includes(t) && isl.kind !== 'jamo'); if (u) unitOf[t] = u.key; }
    return { keys: tkeys, unitOf, guideOpacity: Math.max(0.25, 0.6 - (n - 1) * 0.05) };
  };

  const beach = () => {
    const target = pick(island, keys, 1, rng)[0];
    return { target, decoys: decoysFor(target, pool, rng, 3), count: 5, word: byKey[target].word, pic: byKey[target].pic };
  };

  return { tree: fruit, bridge, animals, door, beach };
}

function familyPlaces(profile, island, rng) {
  const c = buildFamilyContent(profile);
  const fruit = () => ({
    rounds: pick(island, c.fruitTargets, 4, rng).map(k => ({ target: k, word: k.length > 1 ? null : c.given, pic: null, line: k + '!', options: shuffle([k, ...shuffle(c.fruitDistractors, rng).slice(0, 3)], rng) })),
  });
  const bridge = () => ({ mode: 'words', rounds: c.bridgeWords.map(w => ({ word: w.join(''), pic: null, blocks: w, extra: shuffle(c.fruitDistractors, rng).slice(0, 1) })) });
  const animals = () => ({ rounds: shuffle(c.giftRequests, rng).slice(0, 3).map(r => ({ answer: r.answer, pic: null, role: r.role, options: r.options, credit: [] })) });
  const door = () => ({ keys: syllables(c.given).slice(0, 3), unitOf: Object.fromEntries(syllables(c.given).map(s => [s, s])), guideOpacity: 0.35 });
  const beach = () => { const t = pick(island, c.findTargets, 1, rng)[0] || c.given; return { target: t, decoys: c.findDecoysFor(t), count: 4, word: null, pic: null }; };
  return { tree: fruit, bridge, animals, door, beach };
}
