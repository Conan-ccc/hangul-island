// Island themes: map art, music, and which play (mechanic) each place runs with which skin.
// Mechanics: fruit (drag the matching item to a target), bridge (build syllable/word from blocks),
// gift (give the word card for a friend's picture), door (trace), find (tap all matching),
// rise (tap the matching items while they float/fall), pairs (memory: picture <-> word).
export const MECH_TYPE = { fruit: 'fruit', bridge: 'bridge', gift: 'gift', door: 'trace', find: 'find', rise: 'rise', pairs: 'pairs' };

const GENERIC_PLACES = [
  { id: 'tree', mech: 'fruit', icon: 'tree' },
  { id: 'bridge', mech: 'bridge', icon: 'bridge' },
  { id: 'animals', mech: 'gift', icon: 'animals' },
  { id: 'door', mech: 'door', icon: 'door' },
  { id: 'beach', mech: 'find', icon: 'beach' },
];

const generic = (n, name) => ({
  n, name, music: `music/island${n}.mp3`, map: `bg/island${n}.jpg`, spots: `bg/island${n}.json`,
  places: GENERIC_PLACES.map(p => ({ ...p, skin: {} })),
});

export const THEMES = {
  1: generic(1, '농장 동물 섬'),
  2: generic(2, '곤충 섬'),
  3: generic(3, '바다 섬'),
  4: generic(4, '과일 섬'),
  5: {
    n: 5, name: '공룡 섬', music: 'music/island5.mp3', map: 'theme/5/map.jpg', spots: 'theme/5/map.json',
    places: [
      { id: 'nest', mech: 'find', skin: { bg: 'theme/5/act-nest.jpg', item: 'theme/5/egg.webp', open: 'theme/5/egg-crack.webp', reveal: ['theme/5/baby-1.webp', 'theme/5/baby-2.webp', 'theme/5/baby-3.webp'] } },
      { id: 'tree', mech: 'rise', skin: { bg: 'theme/5/act-tree.jpg', item: 'theme/5/leaf.webp', dir: 'fall' } },
      { id: 'lake', mech: 'bridge', skin: { bg: 'theme/5/act-lake.jpg' } },
      { id: 'cave', mech: 'door', skin: { bg: 'theme/5/act-cave.jpg' } },
      { id: 'meadow', mech: 'gift', skin: { bg: 'theme/5/act-meadow.jpg', friends: ['theme/5/dino-friend-1.webp', 'theme/5/dino-friend-2.webp', 'theme/5/dino-friend-3.webp'] } },
      { id: 'fossil', mech: 'pairs', skin: { bg: 'theme/5/act-fossil.jpg', back: 'theme/5/fossil-card.webp' } },
    ],
  },
  6: generic(6, '탈것 섬'),
  7: generic(7, '밤하늘 별 섬'),
  8: generic(8, '무지개 성'),
};

export const HOME_MUSIC = 'music/home.mp3';
export function themeOf(n) { return THEMES[n] || generic(n, ''); }
