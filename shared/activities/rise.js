// 둥실둥실 잡기: items with letters float up (balloons, bubbles) or fall down (leaves); tap the ones that match the board
import { scene, shuffle, el, buddy, wait, ask, board, praise, progress, asset, center, wiggle, glow } from './common.js';

export async function run(ctx, { rounds }) {
  scene(ctx, 'tree');
  buddy(ctx);
  const skin = ctx.skin || {};
  const fall = skin.dir === 'fall';
  const results = [];
  const total = rounds.reduce((a, r) => a + r.need, 0);
  const tick = progress(ctx, total);
  for (const r of rounds) {
    board(ctx, { pic: r.pic, word: r.word, target: r.target });
    ctx.boardLine = r.line;
    const field = el('div', 'position:absolute;inset:0;overflow:hidden;z-index:3');
    ctx.stage.appendChild(field);
    let got = 0, misses = 0, alive = true, lastTarget = null;
    ask(ctx, ctx.phrase('findName', { item: r.target }), null);
    const spawn = () => {
      if (!alive) return;
      const isTarget = ctx.rng() < 0.45;
      const text = isTarget ? r.target : shuffle(r.decoys, ctx.rng)[0];
      const size = 120;
      const x = 8 + ctx.rng() * 78;
      const dur = 9000 + ctx.rng() * 3000;
      const art = skin.item ? `background:url(${asset(skin.item)}) center/contain no-repeat;` : `background:radial-gradient(circle at 35% 30%,#fff 0,${['#FFB8D9', '#B8E0FF', '#FFE7A8', '#CFF2C4'][Math.floor(ctx.rng() * 4)]} 45%,rgba(255,255,255,.4) 100%);border-radius:50%;box-shadow:inset -8px -10px 0 rgba(0,0,0,.06);`;
      const it = el('div', `position:absolute;left:${x}%;${fall ? 'top:-150px' : 'bottom:-150px'};width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;${art}font-size:${text.length >= 4 ? 24 : text.length === 3 ? 30 : text.length === 2 ? 36 : 50}px;font-weight:800;color:#4A3A48;text-shadow:0 0 6px #fff,0 0 12px #fff;cursor:pointer;filter:drop-shadow(0 8px 8px rgba(0,0,0,.18))`, '', 'floater');
      it.textContent = text; it.dataset.text = text;
      field.appendChild(it);
      const sway = (ctx.rng() - 0.5) * 120;
      const anim = it.animate([
        { transform: `translate(0, 0) rotate(${fall ? -10 : 0}deg)` },
        { transform: `translate(${sway}px, ${fall ? '' : '-'}${(window.innerHeight + 300) / 2}px) rotate(${fall ? 12 : 4}deg)` },
        { transform: `translate(${-sway / 2}px, ${fall ? '' : '-'}${window.innerHeight + 300}px) rotate(${fall ? -8 : 0}deg)` },
      ], { duration: dur, easing: 'linear' });
      anim.onfinish = () => it.remove();
      if (isTarget) lastTarget = it;
      it.addEventListener('pointerdown', () => {
        if (it.dataset.done) return;
        if (it.dataset.text === r.target) {
          it.dataset.done = '1'; anim.pause();
          const [cx, cy] = center(it); ctx.burst(cx, cy, 'stars'); ctx.sfx('sparkle');
          it.style.transition = 'transform .35s, opacity .35s'; it.style.transform += ' scale(1.4)'; it.style.opacity = '0';
          setTimeout(() => it.remove(), 400);
          ctx.onSuccess(r.target, 'rise'); results.push({ item: r.target, type: 'rise' }); tick();
          got += 1; misses = 0;
        } else {
          wiggle(it); ctx.sfx('boing'); ctx.speak(it.dataset.text);
          misses += 1;
          if (misses >= 2 && lastTarget?.isConnected) glow(lastTarget);
        }
      });
    };
    spawn();
    const timer = setInterval(spawn, 1300);
    while (got < r.need && ctx.stage.isConnected) await wait(200);
    alive = false; clearInterval(timer);
    await ctx.speak(r.line);
    await praise(ctx);
    field.remove();
  }
  return results;
}
