// 다리 놓기: drag syllable blocks into the bridge slots, left to right
import { makeDraggable, settle } from '../drag.js';
import { SCENES, shuffle, card, el, glow, unglow, cheer, buddy, wait } from './common.js';

const EXTRA = ['바', '다', '마', '소', '오', '리', '무'];

export async function run(ctx, { words }) {
  ctx.stage.innerHTML = SCENES.river;
  const pal = buddy(ctx, 'left:3%;top:18%;width:min(14vw,20vh);transition:left 2.2s ease-in-out');
  const results = [];
  for (const word of words) {
    if (!word.length) continue;
    const row = el('div', 'position:absolute;left:50%;top:48%;translate:-50% -50%;display:flex;gap:10px;z-index:2');
    const slots = word.map(() => {
      const s = el('div', 'width:100px;height:100px;border-radius:16px;background:rgba(201,138,90,.35);border:4px dashed #C98A5A;display:flex;align-items:center;justify-content:center', '', 'slot');
      row.appendChild(s); return s;
    });
    ctx.stage.appendChild(row);
    const extra = shuffle(EXTRA.filter(x => !word.includes(x)), ctx.rng)[0];
    const pieces = shuffle([...word, extra], ctx.rng);
    const tray = el('div', 'position:absolute;left:50%;bottom:6%;translate:-50% 0;display:flex;gap:22px;z-index:3');
    ctx.stage.appendChild(tray);
    const blocks = pieces.map(t => {
      const holder = el('div', 'position:relative;width:100px;height:100px');
      const b = card(t, 'left:0;top:0;width:100px;height:100px;background:#FFE7B8;border-color:#C98A5A');
      holder.appendChild(b); tray.appendChild(holder);
      b.addEventListener('pointerdown', () => ctx.speak(t));
      return b;
    });
    ctx.speak(ctx.phrase('buildBridge', { item: word.join('') }));
    let next = 0, wrong = 0;
    await new Promise(done => {
      for (const b of blocks) {
        makeDraggable(b, {
          targets: () => (next < slots.length ? [slots[next]] : []),
          onDrop: tg => {
            if (!tg) return false;
            if (b.dataset.text === word[next]) {
              settle(b); b.dataset.locked = '1'; b.style.position = 'static';
              tg.style.border = 'none'; tg.appendChild(b);
              ctx.sfx('pop');
              ctx.onSuccess(word[next], 'bridge'); results.push({ item: word[next], type: 'bridge' });
              next += 1; wrong = 0; unglow(ctx.stage);
              if (next >= word.length) setTimeout(done, 300);
              return true;
            }
            wrong += 1;
            if (wrong >= 2) glow(blocks.find(x => x.dataset.locked !== '1' && x.dataset.text === word[next]));
            return false;
          },
        });
      }
    });
    const w = word.join('');
    ctx.onSuccess(w, 'bridge'); results.push({ item: w, type: 'bridge' });
    cheer(ctx, row);
    ctx.speak(w + '! ' + ctx.phrase('great'));
    pal.style.left = '80%';
    await wait(2400);
    row.remove(); tray.remove();
    pal.style.transition = 'none'; pal.style.left = '3%'; void pal.offsetWidth; pal.style.transition = 'left 2.2s ease-in-out';
  }
  return results;
}
