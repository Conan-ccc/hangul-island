// Speech: prepared free AI voice clips (assets/voice/<hash>.mp3) through Web Audio,
// falling back to the iPad's built-in Korean voice for anything without a clip (e.g. family names).
import { compose, isConsonant, isVowel, jamoName } from './hangul.js';
import { voiceHash, SUFFIXES } from './voice-keys.js';
import { VOICE_FILES } from './voice-index.js';
import { audioContext, outputNode } from './fx.js';

export const SPEECH_OVERRIDES = {};

export const PHRASES = {
  hello: '안녕! 오늘은 어디로 가볼까?',
  pickFruit: '{item} 열매를 따볼까?',
  buildBridge: '{item} 다리를 만들어 줘!',
  buildSyllable: '{item} 만들어 볼까?',
  giveGift: '{item} 카드를 줄래?',
  giveName: '{role} 이름을 찾아줄래?',
  traceDoor: '반짝이는 선을 따라 그려볼까?',
  findName: '{item} 모두 찾아볼까?',
  great: '와, 잘했어!',
  tryAgain: '다시 해볼까?',
  locked: '아직 갈 수 없어',
  soon: '곧 열려!',
  cleared: '섬을 다 깼어! 우리 친구가 자란대!',
};

export function phrase(key, vars = {}) {
  const t = PHRASES[key] || '';
  return t.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '')).trim();
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

let volume = 0.8;
export function setSpeechVolume(v) { volume = Math.max(0, Math.min(1, Number(v))); }

const base = (() => { try { return new URL('../assets/voice/', import.meta.url).href; } catch { return 'assets/voice/'; } })();
export const hasClip = text => VOICE_FILES.has(voiceHash(text));

// Split a sentence into clip-able parts: exact clip, or "<item> <suffix>"
export function clipParts(text) {
  const t = String(text ?? '').trim();
  if (!t) return [];
  if (hasClip(t)) return [t];
  for (const s of SUFFIXES) {
    if (t.endsWith(s)) {
      const head = t.slice(0, t.length - s.length).replace(/[\s,]+$/, '');
      if (head && hasClip(head)) return [head, s];
    }
  }
  return null;
}

const buffers = new Map();
function loadClip(text) {
  const h = voiceHash(text);
  if (!buffers.has(h)) {
    const ctx = audioContext();
    const p = ctx ? fetch(base + h + '.mp3').then(r => { if (!r.ok) throw new Error('nofile'); return r.arrayBuffer(); }).then(b => ctx.decodeAudioData(b)) : Promise.reject(new Error('noaudio'));
    buffers.set(h, p);
    p.catch(() => buffers.delete(h));
  }
  return buffers.get(h);
}
export function preloadSpeech(texts) { for (const t of texts) { const p = clipParts(t); if (p) p.forEach(x => loadClip(x).catch(() => {})); } }

let current = null;
let token = 0;
function stopCurrent() {
  token++;
  if (current) { try { current.stop(); } catch { /* ignore */ } current = null; }
  try { globalThis.speechSynthesis?.cancel(); } catch { /* ignore */ }
}
export function stopSpeech() { stopCurrent(); }

async function playClips(parts, my) {
  const ctx = audioContext();
  if (!ctx) return false;
  if (ctx.state === 'suspended') { try { await ctx.resume(); } catch { /* ignore */ } }
  for (let i = 0; i < parts.length; i++) {
    let buf;
    try { buf = await loadClip(parts[i]); } catch { return false; }
    if (my !== token) return true;
    await new Promise(res => {
      const src = ctx.createBufferSource(); const g = ctx.createGain();
      g.gain.value = Math.max(0.0001, volume * 1.25);
      src.buffer = buf; src.connect(g); g.connect(outputNode() || ctx.destination);
      src.onended = res; current = src; src.start();
      setTimeout(res, buf.duration * 1000 + 400);
    });
    if (my !== token) return true;
    if (i < parts.length - 1) await new Promise(r => setTimeout(r, 90));
  }
  return true;
}

function synth() { return globalThis.speechSynthesis || null; }
let voice = null;
function pickVoice() {
  const s = synth(); if (!s || !s.getVoices) return null;
  const vs = s.getVoices().filter(v => /^ko/i.test(v.lang));
  return vs.find(v => /enhanced|premium|고품질/i.test(v.name)) || vs.find(v => v.default) || vs.find(v => v.localService) || vs[0] || null;
}
export function unlockSpeech() {
  const s = synth(); if (!s || typeof SpeechSynthesisUtterance === 'undefined') return;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'ko-KR'; s.speak(u); voice = pickVoice(); s.addEventListener?.('voiceschanged', () => { voice = pickVoice(); }); } catch { /* ignore */ }
}
function tts(text, opts, my) {
  const s = synth();
  if (!s || typeof SpeechSynthesisUtterance === 'undefined') return Promise.resolve(false);
  return new Promise(resolve => {
    let done = false;
    const finish = ok => { if (!done) { done = true; clearTimeout(timer); resolve(ok); } };
    const timer = setTimeout(() => finish(false), Math.max(3000, String(text).length * 400));
    try {
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = 'ko-KR'; u.rate = opts.rate ?? 0.85; u.pitch = opts.pitch ?? 1.1; u.volume = volume;
      if (!voice) voice = pickVoice(); if (voice) u.voice = voice;
      u.onend = () => finish(my === token); u.onerror = () => finish(false);
      s.speak(u);
    } catch { finish(false); }
  });
}

// Resolves true when something was spoken, false when nothing could be played.
export async function speak(text, opts = {}) {
  const t = String(text ?? '').trim();
  if (!t) return false;
  stopCurrent();
  const my = token;
  const parts = clipParts(t);
  if (parts && parts.length && await playClips(parts, my)) return true;
  if (my !== token) return true;
  return tts(t, opts, my);
}
