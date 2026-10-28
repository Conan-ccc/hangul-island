// Stroke data (0..100 box) and stroke matching (pure)
const circlePts = (() => {
  const n = 24, pts = [];
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 - (2 * Math.PI * i) / n; // start at top, counter-clockwise
    pts.push([+(50 + 32 * Math.cos(a)).toFixed(2), +(50 + 32 * Math.sin(a)).toFixed(2)]);
  }
  return pts;
})();

export const STROKES = {
  'ㅡ': [[[15, 50], [85, 50]]],
  'ㅣ': [[[50, 15], [50, 85]]],
  'ㅇ': [circlePts],
};

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
