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
  1: {
    n: 1, name: '농장 동물 섬', music: 'music/island1.mp3', map: 'theme/1/map.jpg', spots: 'theme/1/map.json',
    places: [
      { id: 'henhouse', mech: 'fruit', skin: { bg: 'theme/1/act-henhouse.jpg', item: 'theme/1/egg.webp', target: 'theme/1/basket.webp' } },
      { id: 'pond', mech: 'rise', skin: { bg: 'theme/1/act-pond.jpg', dir: 'rise' } },
      { id: 'barn', mech: 'gift', skin: { bg: 'theme/1/act-barn.jpg', friends: ['theme/1/friend-cow.webp', 'theme/1/friend-pig.webp', 'theme/1/friend-lamb.webp'] } },
      { id: 'field', mech: 'find', skin: { bg: 'theme/1/act-field.jpg', item: 'theme/1/sprout.webp', open: 'theme/1/carrot.webp' } },
      { id: 'gate', mech: 'door', skin: { bg: 'theme/1/act-gate.jpg' } },
      { id: 'windmill', mech: 'bridge', skin: { bg: 'theme/1/act-windmill.jpg' } },
    ],
  },
  2: {
    n: 2, name: '곤충 섬', music: 'music/island2.mp3', map: 'theme/2/map.jpg', spots: 'theme/2/map.json',
    places: [
      { id: 'flowers', mech: 'rise', skin: { bg: 'theme/2/act-flowers.jpg', item: 'theme/2/butterfly.webp', dir: 'rise' } },
      { id: 'bud', mech: 'find', skin: { bg: 'theme/2/act-bud.jpg', item: 'theme/2/bud.webp', open: 'theme/2/bloom.webp', reveal: ['theme/2/ladybug.webp', 'theme/2/bee.webp', 'theme/2/caterpillar.webp'] } },
      { id: 'hive', mech: 'fruit', skin: { bg: 'theme/2/act-hive.jpg', item: 'theme/2/honey.webp', target: 'theme/2/honeypot.webp' } },
      { id: 'web', mech: 'pairs', skin: { bg: 'theme/2/act-web.jpg', back: 'theme/2/leaf-card.webp' } },
      { id: 'log', mech: 'door', skin: { bg: 'theme/2/act-log.jpg' } },
      { id: 'pond', mech: 'bridge', skin: { bg: 'theme/2/act-pond.jpg' } },
    ],
  },
  3: {
    n: 3, name: '바다 섬', music: 'music/island3.mp3', map: 'theme/3/map.jpg', spots: 'theme/3/map.json',
    places: [
      { id: 'shore', mech: 'fruit', skin: { bg: 'theme/3/act-shore.jpg', item: 'theme/3/shell.webp', target: 'theme/3/bucket.webp' } },
      { id: 'reef', mech: 'rise', skin: { bg: 'theme/3/act-reef.jpg', dir: 'rise' } },
      { id: 'clams', mech: 'find', skin: { bg: 'theme/3/act-clams.jpg', item: 'theme/3/clam.webp', open: 'theme/3/clam-open.webp' } },
      { id: 'dock', mech: 'gift', skin: { bg: 'theme/3/act-dock.jpg', friends: ['theme/3/friend-crab.webp', 'theme/3/friend-octopus.webp', 'theme/3/friend-turtle.webp'] } },
      { id: 'lighthouse', mech: 'door', skin: { bg: 'theme/3/act-lighthouse.jpg' } },
      { id: 'boat', mech: 'bridge', skin: { bg: 'theme/3/act-boat.jpg' } },
    ],
  },
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
