// Korean speech via the browser's built-in voice (no audio files)
import { compose, isConsonant, isVowel, jamoName } from './hangul.js';

// Filled after checking pronunciation on the real iPad (tools/voice-check.html)
export const SPEECH_OVERRIDES = {};

export const PHRASES = {
  hello: '{call}, 안녕!',
  pickFruit: '{call}, {item} 열매를 따볼까?',
  buildBridge: '{item}, 다리를 만들어 줘!',
  giveGift: '{role} 이름을 찾아줄래?',
  traceDoor: '반짝이는 선을 따라 그려볼까?',
  findName: '{item}, 모두 찾아볼까?',
  great: '와, 잘했어!',
  tryAgain: '다시 해볼까?',
  locked: '아직 갈 수 없어',
  soon: '곧 열려!',
  cleared: '섬을 다 깼어! 우리 친구가 자란대!',
};

export function phrase(key, vars = {}) {
  const t = PHRASES[key] || '';
  return t.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
}

export function spokenForm(token) {
  const t = String(token ?? '');
  if (SPEECH_OVERRIDES[t]) return SPEECH_OVERRIDES[t];
  if (t.length === 1 && isConsonant(t)) {
    try { return jamoName(t) + ', ' + compose(t, 'ㅏ'); } catch { return jamoName(t); }
  }
  if (t.length === 1 && isVowel(t)) return jamoName(t) + ', ' + compose('ㅇ', t);
  return t;
}

let voice = null;
let volume = 0.8;
export function setSpeechVolume(v) { volume = Math.max(0, Math.min(1, Number(v))); }

function synth() { return globalThis.speechSynthesis || null; }

function pickVoice() {
  const s = synth(); if (!s || !s.getVoices) return null;
  const vs = s.getVoices().filter(v => /^ko/i.test(v.lang));
  return vs.find(v => v.default) || vs.find(v => v.localService) || vs[0] || null;
}

export function unlockSpeech() {
  const s = synth(); if (!s || typeof SpeechSynthesisUtterance === 'undefined') return;
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0; u.lang = 'ko-KR';
    s.speak(u);
    voice = pickVoice();
    if (s.addEventListener) s.addEventListener('voiceschanged', () => { voice = pickVoice(); });
  } catch { /* ignore */ }
}

// Resolves true when the utterance finished, false when there is no voice, it errored or it timed out.
export function speak(text, opts = {}) {
  const s = synth();
  if (!s || typeof SpeechSynthesisUtterance === 'undefined' || !text) return Promise.resolve(false);
  return new Promise(resolve => {
    let done = false;
    const finish = ok => { if (!done) { done = true; clearTimeout(timer); resolve(ok); } };
    const timer = setTimeout(() => finish(false), Math.max(3000, String(text).length * 400));
    try {
      s.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'ko-KR';
      u.rate = opts.rate ?? 0.85;
      u.pitch = opts.pitch ?? 1.1;
      u.volume = volume;
      if (!voice) voice = pickVoice();
      if (voice) u.voice = voice;
      u.onend = () => finish(true); u.onerror = () => finish(false);
      s.speak(u);
    } catch { finish(false); }
  });
}
