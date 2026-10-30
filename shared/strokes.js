// Stroke data (0..100 box) and stroke matching (pure)
const circlePts = (() => {
  const n = 24, pts = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 - (2 * Math.PI * i) / n; // start at top, counter-clockwise
    pts.push([+(50 + 32 * Math.cos(a)).toFixed(2), +(50 + 32 * Math.sin(a)).toFixed(2)]);
  }
  return pts;
})();

const circle = (cx, cy, r, n = 24) => {
  const pts = [];
  for (let i = 0; i <= n; i++) { const a = -Math.PI / 2 - (2 * Math.PI * i) / n; pts.push([+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)]); }
  return pts;
};

// Standard stroke order, 0..100 box, each stroke drawn in its writing direction
export const STROKES = {
  'ㄱ': [[[15, 20], [80, 20], [80, 85]]],
  'ㄴ': [[[20, 15], [20, 80], [85, 80]]],
  'ㄷ': [[[18, 20], [82, 20]], [[18, 20], [18, 80], [85, 80]]],
  'ㄹ': [[[18, 15], [80, 15], [80, 48]], [[20, 48], [80, 48]], [[20, 48], [20, 85], [85, 85]]],
  'ㅁ': [[[20, 18], [20, 82]], [[20, 18], [80, 18], [80, 82]], [[20, 82], [80, 82]]],
  'ㅂ': [[[22, 12], [22, 85]], [[78, 12], [78, 85]], [[22, 45], [78, 45]], [[22, 85], [78, 85]]],
  'ㅅ': [[[50, 12], [45, 45], [15, 88]], [[47, 42], [85, 88]]],
  'ㅇ': [circlePts],
  'ㅈ': [[[18, 15], [80, 15], [45, 50], [15, 88]], [[47, 48], [85, 88]]],
  'ㅊ': [[[50, 4], [50, 17]], [[18, 25], [80, 25], [45, 55], [15, 90]], [[47, 53], [85, 90]]],
  'ㅋ': [[[15, 20], [80, 20], [80, 85]], [[18, 52], [80, 52]]],
  'ㅌ': [[[20, 15], [80, 15]], [[20, 48], [80, 48]], [[20, 15], [20, 85], [85, 85]]],
  'ㅍ': [[[15, 18], [85, 18]], [[35, 18], [35, 82]], [[65, 18], [65, 82]], [[12, 82], [88, 82]]],
  'ㅎ': [[[50, 4], [50, 16]], [[20, 26], [80, 26]], circle(50, 64, 22)],
  'ㅏ': [[[40, 10], [40, 90]], [[40, 50], [75, 50]]],
  'ㅑ': [[[40, 10], [40, 90]], [[40, 35], [75, 35]], [[40, 65], [75, 65]]],
  'ㅓ': [[[25, 50], [60, 50]], [[60, 10], [60, 90]]],
  'ㅕ': [[[25, 35], [60, 35]], [[25, 65], [60, 65]], [[60, 10], [60, 90]]],
  'ㅗ': [[[50, 35], [50, 65]], [[10, 65], [90, 65]]],
  'ㅛ': [[[35, 35], [35, 65]], [[65, 35], [65, 65]], [[10, 65], [90, 65]]],
  'ㅜ': [[[10, 35], [90, 35]], [[50, 35], [50, 75]]],
  'ㅠ': [[[10, 35], [90, 35]], [[35, 35], [35, 75]], [[65, 35], [65, 75]]],
  'ㅡ': [[[15, 50], [85, 50]]],
  'ㅣ': [[[50, 15], [50, 85]]],
  'ㅐ': [[[30, 10], [30, 90]], [[30, 50], [55, 50]], [[70, 10], [70, 90]]],
  'ㅔ': [[[15, 50], [45, 50]], [[45, 10], [45, 90]], [[70, 10], [70, 90]]],
};

const VERTICAL = new Set(['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅣ', 'ㅐ', 'ㅔ']);
const place = (strokes, [x0, y0, x1, y1]) => strokes.map(st => st.map(([x, y]) => [+(x0 + (x / 100) * (x1 - x0)).toFixed(2), +(y0 + (y / 100) * (y1 - y0)).toFixed(2)]));

// Strokes for a whole syllable block (consonant, vowel, optional batchim), or null if not a syllable
export function syllableStrokes(ch) {
  if (typeof ch !== 'string' || ch.length !== 1) return null;
  const c = ch.charCodeAt(0) - 0xAC00;
  if (c < 0 || c > 11171) return null;
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ', JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const cho = CHO[Math.floor(c / 588)], jung = JUNG[Math.floor((c % 588) / 28)], jong = JONG[c % 28];
  if (!STROKES[cho] || !STROKES[jung] || (jong && !STROKES[jong])) return null;
  const b = !!jong, v = VERTICAL.has(jung);
  const boxes = v
    ? { c: b ? [4, 4, 52, 58] : [4, 10, 52, 90], v: b ? [48, 2, 96, 62] : [48, 4, 96, 96] }
    : { c: b ? [20, 2, 80, 40] : [20, 2, 80, 50], v: b ? [5, 32, 95, 66] : [5, 40, 95, 85] };
  const out = [...place(STROKES[cho], boxes.c), ...place(STROKES[jung], boxes.v)];
  if (b) out.push(...place(STROKES[jong], [15, 66, 85, 98]));
  return out;
}

// Strokes for any trace key: a single jamo or a syllable
export function strokesFor(key) { return STROKES[key] || syllableStrokes(key); }

export const RESAMPLE_N = 32;

function len(pts) {
  let d = 0;
  for (let i = 1; i < pts.length; i++) d += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return d;
}

export function resample(pts, n = RESAMPLE_N) {
  if (pts.length === 0) return [];
  if (pts.length === 1) return Array.from({ length: n }, () => [...pts[0]]);
  const total = len(pts);
  if (total === 0) return Array.from({ length: n }, () => [...pts[0]]);
  const step = total / (n - 1);
  const out = [[...pts[0]]];
  let acc = 0;
  for (let i = 1; i < pts.length && out.length < n; i++) {
    let [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    let seg = Math.hypot(x1 - x0, y1 - y0);
    while (acc + seg >= step && out.length < n) {
      const t = (step - acc) / seg;
      x0 = x0 + (x1 - x0) * t; y0 = y0 + (y1 - y0) * t;
      out.push([x0, y0]);
      seg = Math.hypot(x1 - x0, y1 - y0);
      acc = 0;
    }
    acc += seg;
  }
  while (out.length < n) out.push([...pts[pts.length - 1]]);
  return out;
}

function distToSeg(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const l2 = dx * dx + dy * dy;
  let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}
function distToPolyline(p, line) {
  let m = Infinity;
  for (let i = 1; i < line.length; i++) m = Math.min(m, distToSeg(p, line[i - 1], line[i]));
  return line.length === 1 ? Math.hypot(p[0] - line[0][0], p[1] - line[0][1]) : m;
}

export function matchStroke(user, expected, tol = 14) {
  if (!user || user.length < 2) return { ok: false, reason: 'too-short' };
  const s = user[0], e0 = expected[0];
  if (Math.hypot(s[0] - e0[0], s[1] - e0[1]) > tol * 1.5) return { ok: false, reason: 'wrong-start' };
  if (len(user) < len(expected) * 0.6) return { ok: false, reason: 'too-short' };
  const u = resample(user), x = resample(expected);
  const meanPath = u.reduce((a, p) => a + distToPolyline(p, expected), 0) / u.length;
  if (meanPath > tol) return { ok: false, reason: 'off-path' };
  // ordered correspondence catches wrong direction on closed shapes (e.g. clockwise ㅇ)
  const meanOrdered = u.reduce((a, p, i) => a + Math.hypot(p[0] - x[i][0], p[1] - x[i][1]), 0) / u.length;
  if (meanOrdered > tol * 2) return { ok: false, reason: 'off-path' };
  return { ok: true, reason: 'ok' };
}
