// Hangul syllable utilities (pure, no DOM)
const CHO = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const JONG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const BASE = 0xAC00, LAST = 0xD7A3;
const NAMES = {
  'ㄱ':'기역','ㄴ':'니은','ㄷ':'디귿','ㄹ':'리을','ㅁ':'미음','ㅂ':'비읍','ㅅ':'시옷','ㅇ':'이응','ㅈ':'지읒','ㅊ':'치읓','ㅋ':'키읔','ㅌ':'티읕','ㅍ':'피읖','ㅎ':'히읗',
  'ㄲ':'쌍기역','ㄸ':'쌍디귿','ㅃ':'쌍비읍','ㅆ':'쌍시옷','ㅉ':'쌍지읒'
};
export const CONSONANTS = CHO;
export const VOWELS = JUNG;
export function isSyllable(ch) { if (typeof ch !== 'string' || ch.length !== 1) return false; const c = ch.charCodeAt(0); return c >= BASE && c <= LAST; }
export function isConsonant(j) { return CHO.includes(j); }
export function isVowel(j) { return JUNG.includes(j); }
export function decompose(ch) {
  if (!isSyllable(ch)) return null;
  const i = ch.charCodeAt(0) - BASE;
  return { cho: CHO[Math.floor(i / 588)], jung: JUNG[Math.floor((i % 588) / 28)], jong: JONG[i % 28] };
}
export function compose(cho, jung, jong = '') {
  const a = CHO.indexOf(cho), b = JUNG.indexOf(jung), c = JONG.indexOf(jong || '');
  if (a < 0 || b < 0 || c < 0) throw new Error('bad-jamo');
  return String.fromCharCode(BASE + (a * 21 + b) * 28 + c);
}
export function hasBatchim(ch) { const d = decompose(ch); return !!(d && d.jong); }
export function syllables(word) { return Array.from(String(word ?? '')).filter(isSyllable); }
export function jamoName(j) {
  if (NAMES[j]) return NAMES[j];
  if (isVowel(j)) return compose('ㅇ', j);
  return j;
}
export function givenName(fullName) {
  const s = syllables(fullName);
  return (s.length >= 3 ? s.slice(1) : s).join('');
}
export function callName(fullName) {
  const g = givenName(fullName);
  if (!g) return '';
  return g + (hasBatchim(g[g.length - 1]) ? '아' : '야');
}
