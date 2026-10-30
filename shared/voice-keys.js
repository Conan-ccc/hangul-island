// Shared between the game and tools/voice-list.mjs: which sentences have prepared voice files.
// FNV-1a 32-bit over UTF-8 bytes; the python generator uses the same function.
export function voiceHash(text) {
  const bytes = new TextEncoder().encode(String(text).trim());
  let h = 0x811c9dc5;
  for (const b of bytes) { h ^= b; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

// Fixed sentences (full clips)
export const LINES = {
  hello: '안녕! 오늘은 어디로 가볼까?',
  great: '와, 잘했어!', great2: '최고야!', great3: '멋지다!',
  tryAgain: '다시 해볼까?', showWay: '이렇게 해볼까?', traceDoor: '반짝이는 선을 따라 그려볼까?',
  locked: '아직 갈 수 없어', soon: '곧 열려!', cleared: '섬을 다 깼어! 우리 친구가 자란대!',
  giftBox: '선물상자를 톡톡 눌러볼까?', present: '선물이야!', love: '사랑해!',
  bagEmpty: '놀이를 하면 선물을 받을 수 있어!', roomEmpty: '다 자란 친구들이 여기서 쉬어요',
  findMyName: '내 이름을 찾아줄래?', thisName: '이 이름을 찾아줄래?', welcome: '섬에 왔어! 가고 싶은 곳을 눌러볼까?',
};

// Endings spoken after an item clip: "나" + "열매를 따볼까?"
export const SUFFIXES = ['열매를 따볼까?', '모두 찾아볼까?', '다리를 만들어 줘!', '만들어 볼까?', '카드를 줄래?', '이름을 찾아줄래?'];

export const ROLES = ['엄마', '아빠', '할머니', '할아버지', '외할머니', '외할아버지', '이모', '삼촌', '고모', '언니', '오빠', '누나', '형', '동생'];
