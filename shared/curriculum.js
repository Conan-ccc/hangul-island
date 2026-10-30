// v2 curriculum: what each island teaches (pure data + helpers)
// unit.key = the syllable/word the child masters; jamo = the letter taught; word/pic = picture word
export const WORDS = {
  아기: 'agi', 오리: 'ori', 우유: 'uyu', 오이: 'oi', 아이: 'ai',
  가지: 'gaji', 나비: 'nabi', 나무: 'namu', 다리: 'dari', 모자: 'moja', 라디오: 'radio',
  바다: 'bada', 바지: 'baji', 사자: 'saja', 소: 'so', 지도: 'jido', 주스: 'juseu',
  치마: 'chima', 기차: 'gicha', 코: 'ko', 토마토: 'tomato', 포도: 'podo', 하마: 'hama', 피아노: 'piano',
  여우: 'yeou', 요요: 'yoyo', 배: 'bae', 게: 'ge', 새: 'sae', 개: 'gae',
  고구마: 'goguma', 바나나: 'banana', 비누: 'binu', 구두: 'gudu', 거미: 'geomi',
  모기: 'mogi', 소라: 'sora', 조개: 'jogae', 오징어: 'ojingeo', 새우: 'saeu', 고래: 'gorae',
  치즈: 'chijeu', 키위: 'kiwi', 호두: 'hodu', 체리: 'cheri', 버스: 'beoseu', 보트: 'boteu', 오토바이: 'otobai',
  곰: 'gom', 문: 'mun', 공: 'gong', 달: 'dal', 별: 'byeol', 눈: 'nun', 책: 'chaek', 물: 'mul', 산: 'san',
};

const U = (key, jamo, word) => ({ key, jamo, word, pic: word ? WORDS[word] : null });

export const ISLANDS = {
  1: { title: '모음 섬', kind: 'jamo',
    units: [U('아', 'ㅏ', '아기'), U('어', 'ㅓ', null), U('오', 'ㅗ', '오리'), U('우', 'ㅜ', '우유'), U('으', 'ㅡ', null), U('이', 'ㅣ', '오이')],
    words: ['오리', '우유', '소', '아기', '오이', '아이'], trace: ['ㅏ', 'ㅓ', 'ㅗ', 'ㅜ', 'ㅡ', 'ㅣ'] },
  2: { title: '자음 섬 하나', kind: 'jamo',
    units: [U('거', 'ㄱ', '거미'), U('나', 'ㄴ', '나비'), U('다', 'ㄷ', '다리'), U('라', 'ㄹ', '라디오'), U('모', 'ㅁ', '모기')],
    words: ['거미', '나비', '모기', '다리', '나무', '라디오'], trace: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ'] },
  3: { title: '자음 섬 둘', kind: 'jamo',
    units: [U('바', 'ㅂ', '바다'), U('소', 'ㅅ', '소라'), U('오', 'ㅇ', '오징어'), U('조', 'ㅈ', '조개')],
    words: ['바다', '소라', '조개', '오징어', '새우', '고래'], trace: ['ㅂ', 'ㅅ', 'ㅇ', 'ㅈ'] },
  4: { title: '자음 섬 셋', kind: 'jamo',
    units: [U('치', 'ㅊ', '치즈'), U('키', 'ㅋ', '키위'), U('토', 'ㅌ', '토마토'), U('포', 'ㅍ', '포도'), U('호', 'ㅎ', '호두')],
    words: ['치즈', '키위', '토마토', '포도', '호두', '체리'], trace: ['ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'] },
  5: { title: '반짝 모음 섬', kind: 'jamo',
    units: [U('여', 'ㅕ', '여우'), U('요', 'ㅛ', '요요'), U('유', 'ㅠ', '우유'), U('배', 'ㅐ', '배'), U('게', 'ㅔ', '게'), U('야', 'ㅑ', null)],
    words: ['여우', '요요', '우유', '배', '게', '새', '개'], trace: ['ㅑ', 'ㅕ', 'ㅛ', 'ㅠ', 'ㅐ', 'ㅔ'] },
  6: { title: '낱말 섬', kind: 'word',
    units: ['기차', '버스', '보트', '오토바이', '바나나', '고구마', '구두', '모자'].map(w => U(w, null, w)),
    words: ['기차', '버스', '보트', '오토바이', '배', '바나나', '고구마', '구두', '모자'], trace: ['기', '차', '버', '스'] },
  7: { title: '받침 섬', kind: 'word',
    units: ['곰', '문', '공', '달', '별', '눈', '산'].map(w => U(w, null, w)),
    words: ['곰', '문', '공', '달', '별', '눈', '책', '물', '산'], trace: ['곰', '문', '달', '산'] },
  8: { title: '가족 섬', kind: 'family' },
};

// Letters that look alike, used as tricky decoys on the beach
export const LOOKALIKE = { 아: ['어', '야'], 어: ['아', '여'], 오: ['우', '요'], 우: ['오', '유'], 으: ['이', '우'], 이: ['으', '아'],
  가: ['기', '나'], 키: ['기', '치'], 호: ['오', '후'], 거: ['고', '너'], 소: ['수', '조'], 조: ['소', '초'], 나: ['다', '가'], 다: ['나', '라'], 라: ['다', '마'], 모: ['무', '보'], 바: ['마', '파'], 사: ['자', '차'],
  지: ['치', '시'], 치: ['지', '키'], 코: ['고', '포'], 토: ['도', '포'], 포: ['보', '토'], 하: ['아', '마'],
  여: ['야', '어'], 요: ['오', '유'], 유: ['우', '요'], 배: ['베', '바'], 게: ['개', '거'], 야: ['아', '여'] };

export function islandItems(n) {
  const isl = ISLANDS[n];
  return isl && isl.units ? isl.units.map(u => u.key) : [];
}

// Units of all earlier islands (for review decoys)
export function earlierKeys(n) {
  const out = [];
  for (let i = 1; i < n; i++) if (ISLANDS[i].units) out.push(...ISLANDS[i].units.map(u => u.key));
  return [...new Set(out)];
}

// Sentence that introduces a unit, e.g. "나! 나비의 나!"
export function unitLine(u) {
  if (u.word && u.word !== u.key) return `${u.key}! ${u.word}의 ${u.key}!`;
  return `${u.key}!`;
}
