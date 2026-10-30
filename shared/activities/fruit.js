// 글자 열매 따기: the board shows the letter + picture; drag the matching fruit into the basket
import { makeDraggable, lockAll } from '../drag.js';
import { scene, shuffle, at, el, glow, unglow, cheer, buddy, wait, ask, board, picUrl, praise } from './common.js';

const SPOTS = [[24, 40], [38, 30], [52, 38], [33, 52], [47, 55], [60, 47]];

export async function run(ctx, { rounds }) {
  scene(ctx, 'tree');
  buddy(ctx);
  const basket = at(el('div', 'position:absolute;width:min(20vw,27vh);z-index:3', `<img class="picimg" src="${picUrl('basket')}" alt="">`, 'basket'), 82, 76);
  ctx.stage.appendChild(basket);
  const results = [];
  for (const r of rounds) {
    board(ctx, { pic: r.pic, word: r.word, target: r.target });
    ctx.boardLine = r.line;
    const spots = shuffle(SPOTS, ctx.rng);
    const fruits = r.options.map((t, i) => {
      const size = t.length >= 3 ? 150 : t.length === 2 ? 128 : 108;
      const f = at(el('div', `position:absolute;width:${size}px;height:${size}px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:${t.length >= 2 ? 40 : 58}px;font-weight:800;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.15);background:radial-gradient(circle at 35% 30%,#FFC1CC 0,#FF7F96 55%,#E85A75 100%);box-shadow:inset 0 -8px 0 rgba(0,0,0,.1),0 8px 14px rgba(120,40,60,.3);z-index:3`, '', 'fruit'), spots[i][0], spots[i][1] + 4);
      f.textContent = t; f.dataset.text = t;
      f.insertAdjacentHTML('beforeend', '<span style="position:absolute;top:-10px;left:50%;width:16px;height:22px;background:#5DBB6A;border-radius:0 80% 0 80%;transform:translateX(-50%) rotate(-20deg)"></span>');
      ctx.stage.appendChild(f);
      f.addEventListener('pointerdown', () => ctx.speak(t));
      return f;
    });
    ask(ctx, ctx.phrase('pickFruit', { item: r.target }), fruits.find(x => x.dataset.text === r.target));
    let wrong = 0;
    await new Promise(done => {
      for (const f of fruits) makeDraggable(f, {
        targets: () => [basket],
        onDrop: tg => {
          if (!tg) return false;
          if (f.dataset.text === r.target) {
            lockAll(fruits);
            f.style.transition = 'left .4s, top .4s, transform .4s'; f.style.left = '82%'; f.style.top = '72%'; f.style.transform = 'scale(.5)';
            cheer(ctx, basket);
            ctx.onSuccess(r.target, 'fruit'); results.push({ item: r.target, type: 'fruit' });
            setTimeout(done, 500);
            return true;
          }
          wrong += 1;
          if (wrong >= 2) glow(fruits.find(x => x.dataset.text === r.target));
          ctx.speak(ctx.phrase('tryAgain'));
          return false;
        },
      });
    });
    await ctx.speak(r.line);
    await praise(ctx);
    unglow(ctx.stage);
    fruits.forEach(f => f.remove());
    await wait(150);
  }
  return results;
}
