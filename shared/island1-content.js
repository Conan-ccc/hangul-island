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

  const seen = new Set([full, given]);
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

  const bridgeWords = full === given ? [syllables(given)] : [syllables(given), fullSyl];

  const fallbackNames = FALLBACK_WORDS.filter(w => w !== given && w !== full);
  const giftRequests = family.length
    ? family.map((f, i) => {
        // never offer another person with the same role: a correct-looking card would be rejected as wrong
        const others = family.filter(o => o.name !== f.name && o.role !== f.role).map(o => o.name);
        const pool = others.length ? others : [full, ...fallbackNames];
        const k = i % pool.length;
        const options = uniq([f.name, ...pool.slice(k), ...pool.slice(0, k)]).slice(0, 3);
        return { role: f.role, answer: f.name, options };
      })
    : [{ role: '나', answer: full, options: uniq([full, ...fallbackNames]).slice(0, 3) }];

  // the beach rotates over every name word so each name gets a second activity type
  const findTargets = uniq([given, full, ...famNames]);
  const findDecoysFor = target => {
    // skip words that contain each other (하늘 / 김하늘): too confusing as decoys for a 4-year-old
    const d = findTargets.filter(w => !w.includes(target) && !target.includes(w));
    for (const w of fallbackNames) { if (d.length >= 2) break; if (w !== target && !d.includes(w)) d.push(w); }
    return d;
  };

  return {
    items, given, givenSyl, full, family,
    fruitTargets, fruitDistractors, bridgeWords, giftRequests,
    findTarget: given, findDecoys: findDecoysFor(given), findTargets, findDecoysFor,
    placeIds: ['tree', 'bridge', 'animals', 'door', 'beach'],
  };
}

// Which activity types can record each item (proves every item is masterable)
export function itemCoverage(c) {
  const cov = {};
  const add = (it, t) => { (cov[it] ||= []); if (!cov[it].includes(t)) cov[it].push(t); };
  for (const t of c.fruitTargets) add(t, 'fruit');
  for (const w of c.bridgeWords) { add(w.join(''), 'bridge'); for (const s of w) add(s, 'bridge'); }
  for (const r of c.giftRequests) add(r.answer, 'gift');
  for (const t of c.findTargets) add(t, 'find');
  return cov;
}
