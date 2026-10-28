// 이름 바닷가: tap every card that shows the target name
import { SCENES, shuffle, card, at, glow, unglow, wiggle, buddy, wait, center, ask } from './common.js';

export async function run(ctx, { target, decoys, count = 6 }) {
  ctx.stage.innerHTML = SCENES.beach;
  buddy(ctx);
  const total = Math.max(count + 2, Math.min(10, count + decoys.length * 2));
  const texts = shuffle([...Array(count).fill(target), ...Array.from({ length: total - count }, (_, i) => decoys[i % decoys.length])], ctx.rng);
  const cols = 5, rows = Math.ceil(texts.length / cols);
  const cards = texts.map((t, i) => {
    const cx = 18 + (i % cols) * 16 + (ctx.rng() - 0.5) * 6;
    const cy = 34 + Math.floor(i / cols) * (50 / rows) + (ctx.rng() - 0.5) * 6;
    const c = at(card(t, 'background:#fff;cursor:pointer;transition:all .5s'), cx, cy);
    c.style.rotate = ((ctx.rng() - 0.5) * 16).toFixed(1) + 'deg';
    ctx.stage.appendChild(c);
    return c;
  });
  ask(ctx, ctx.phrase('findName', { item: target }), cards.find(x => x.dataset.text === target));
  const results = [];
  let left = count, wrong = 0;
  await new Promise(done => {
    for (const c of cards) c.addEventListener('click', () => {
      if (c.dataset.found) return;
      if (c.dataset.text === target) {
        c.dataset.found = '1';
        const [x, y] = center(c);
        ctx.burst(x, y, 'stars'); ctx.sfx('sparkle');
        c.style.transform = 'translateY(-60px) scale(.6)'; c.style.opacity = '0';
        ctx.onSuccess(target, 'find'); results.push({ item: target, type: 'find' });
        left -= 1; wrong = 0; unglow(ctx.stage);
        if (left === 0) setTimeout(done, 500);
      } else {
        wiggle(c); ctx.sfx('boing');
        wrong += 1;
        if (wrong >= 2) { const rem = cards.find(x => x.dataset.text === target && !x.dataset.found); if (rem) glow(rem); }
      }
    });
  });
  await ctx.speak(ctx.phrase('great'));
  await wait(200);
  return results;
}
