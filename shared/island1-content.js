// Island 1 (name island) content, built from the profile entered on the iPad (pure)
import { syllables, givenName } from './hangul.js';

const FALLBACK_SYL = ['바', '다', '하', '마', '소', '나', '무', '오', '리'];
const FALLBACK_WORDS = ['바다', '나무', '오리'];
const clean = s => syllables(s).join('');
const uniq = a => [...new Set(a)];

export function buildIsland1Content(profile) {
  const full = clean(profile.childName);
  const given = givenName(full);
  const givenSyl = uniq(syllables(given));
  const fullSyl = syllables(full);

  const seen = new Set([full]);
  const family = [];
  for (const f of profile.family || []) {
    const name = clean(f.name);
    if (!name || seen.has(name)) continue;
    seen.add(name);
    family.push({ name, role: f.role || '기타' });
  }
  const famNames = family.map(f => f.name);

  const items = uniq([...givenSyl, given, full, ...famNames]);
  const fruitTargets = uniq([...givenSyl, given]);
  let fruitDistractors = uniq(famNames.flatMap(n => syllables(n))).filter(s => !givenSyl.includes(s));
  for (const s of FALLBACK_SYL) { if (fruitDistractors.length >= 3) break; if (!givenSyl.includes(s) && !fruitDistractors.includes(s)) fruitDistractors.push(s); }

  const bridgeWords = full === given ? [givenSyl.length ? syllables(given) : []] : [syllables(given), fullSyl];

  const fallbackNames = FALLBACK_WORDS.filter(w => w !== given && w !== full);
  const giftRequests = family.length
    ? family.map((f, i) => {
        const others = famNames.filter(n => n !== f.name);
        const pool = others.length ? others : [full, ...fallbackNames];
        const options = uniq([f.name, ...pool.slice(i % Math.max(1, pool.length)), ...pool]).slice(0, 3);
        return { role: f.role, answer: f.name, options };
      })
    : [{ role: '나', answer: full, options: uniq([full, ...fallbackNames]).slice(0, 3) }];

  const findDecoys = famNames.length >= 2 ? famNames : uniq([...famNames, ...fallbackNames]).slice(0, Math.max(2, famNames.length));

  return {
    items, given, givenSyl, full, family,
    fruitTargets, fruitDistractors, bridgeWords, giftRequests,
    findTarget: given, findDecoys,
    placeIds: ['tree', 'bridge', 'animals', 'door', 'beach'],
  };
}
