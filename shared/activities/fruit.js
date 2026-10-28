// 글자 열매 따기: drag the named fruit into the basket
import { makeDraggable, lockAll } from '../drag.js';
import { SCENES, shuffle, card, at, el, glow, unglow, cheer, buddy, wait, ask } from './common.js';

const SPOTS = [[30, 22], [44, 14], [58, 22], [36, 40], [52, 38], [24, 36], [64, 36]];
const BASKET = '<svg viewBox="0 0 120 90" width="100%"><path d="M8 30 h104 l-12 56 h-80Z" fill="#E8B04A"/><path d="M14 40 h92 M18 56 h84 M22 72 h76" stroke="#C98A3A" stroke-width="4"/><path d="M30 30 q30 -40 60 0" stroke="#C98A3A" stroke-width="6" fill="none"/></svg>';

export async function run(ctx, { targets, distractors, rounds = 4 }) {
  ctx.stage.innerHTML = SCENES.tree;
  buddy(ctx);
  const basket = at(el('div', 'position:absolute;width:min(20vw,26vh)', BASKET, 'basket'), 82, 78);
  ctx.stage.appendChild(basket);
  const results = [];
  for (let r = 0; r < rounds && targets.length; r++) {
    const target = targets[r % targets.length];
    const opts = shuffle([target, ...shuffle(distractors, ctx.rng).filter(d => d !== target).slice(0, 4)], ctx.rng);
    const spots = shuffle(SPOTS, ctx.rng);
    const fruits = opts.map((t, i) => {
      const f = at(card(t, 'border-radius:50%;background:#FF8FA3;color:#fff;border-color:#fff;width:96px;height:96px;padding:0'), spots[i][0], spots[i][1]);
      if (t.length >= 2) { f.style.width = f.style.height = (t.length >= 3 ? 150 : 124) + 'px'; f.style.fontSize = '34px'; }
      ctx.stage.appendChild(f);
      f.addEventListener('pointerdown', () => ctx.speak(t));
      return f;
    });
    ask(ctx, ctx.phrase('pickFruit', { call: ctx.call, item: target }), fruits.find(x => x.dataset.text === target));
    let wrong = 0;
    await new Promise(done => {
      for (const f of fruits) {
        makeDraggable(f, {
          targets: () => [basket],
          onDrop: tg => {
            if (!tg) return false;
            if (f.dataset.text === target) {
              lockAll(fruits);
              f.style.transition = 'all .4s'; f.style.left = '82%'; f.style.top = '74%'; f.style.transform = 'scale(.6)';
              cheer(ctx, basket);
              ctx.onSuccess(target, 'fruit'); results.push({ item: target, type: 'fruit' });
              setTimeout(done, 500);
              return true;
            }
            wrong += 1;
            if (wrong >= 2) glow(fruits.find(x => x.dataset.text === target));
            ctx.speak(ctx.phrase('tryAgain'));
            return false;
          },
        });
      }
    });
    await ctx.speak(ctx.phrase('great'));
    unglow(ctx.stage);
    fruits.forEach(f => f.remove());
    await wait(200);
  }
  return results;
}
