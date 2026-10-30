// 다리/공방: build a syllable from jamo blocks (mode 'build') or a word from syllable blocks (mode 'words')
import { makeDraggable, lockAll, settle } from '../drag.js';
import { compose, jamoName } from '../hangul.js';
import { scene, shuffle, el, glow, unglow, cheer, buddy, wait, ask, board, praise, jblock, center, progress } from './common.js';

export async function run(ctx, { mode, rounds }) {
  scene(ctx, mode === 'build' ? 'workshop' : 'river');
  const pal = buddy(ctx);
  const results = [];
  const tick = progress(ctx, rounds.length);
  for (const r of rounds) {
    const pieces = mode === 'build' ? r.parts : r.blocks;
    const target = mode === 'build' ? r.target : r.word;
    board(ctx, { pic: r.pic, word: r.word, target: mode === 'build' ? r.target : null, big: target });
    ctx.boardLine = r.line || target;
    const S = Math.min(130, Math.floor(window.innerWidth * 0.11));
    const row = el('div', `position:absolute;left:50%;top:56%;translate:-50% -50%;display:flex;gap:12px;z-index:3`);
    const slots = pieces.map(() => { const s = el('div', `width:${S}px;height:${S}px`, '', 'slot2'); row.appendChild(s); return s; });
    ctx.stage.appendChild(row);
    const tray = el('div', 'position:absolute;left:50%;bottom:4%;translate:-50% 0;display:flex;gap:22px;z-index:4');
    ctx.stage.appendChild(tray);
    const blocks = shuffle([...pieces, ...(r.extra || [])], ctx.rng).map(t => {
      const hold = el('div', `position:relative;width:${S}px;height:${S}px`);
      const b = jblock(t, S); hold.appendChild(b); tray.appendChild(hold);
      b.addEventListener('pointerdown', () => ctx.speak(t.length === 1 && !/[가-힣]/.test(t) ? jamoName(t) : t));
      return b;
    });
    const line = mode === 'build' ? ctx.phrase('buildSyllable', { item: target }) : ctx.phrase('buildBridge', { item: target });
    let next = 0, wrong = 0;
    const markNext = () => slots.forEach((s, i) => s.classList.toggle('next', i === next));
    markNext();
    ask(ctx, line, blocks.find(x => x.dataset.text === pieces[0]));
    await new Promise(done => {
      for (const b of blocks) makeDraggable(b, {
        targets: () => slots.filter(s => !s.firstChild),
        onDrop: tg => {
          if (!tg) return false;
          const i = slots.indexOf(tg);
          if (i === next && b.dataset.text === pieces[next]) {
            settle(b); b.dataset.locked = '1'; b.style.position = 'static'; tg.appendChild(b);
            ctx.sfx('snap');
            if (mode !== 'build') { ctx.onSuccess(pieces[next], 'bridge'); results.push({ item: pieces[next], type: 'bridge' }); }
            ctx.speak(mode === 'build' && !/[가-힣]/.test(b.dataset.text) ? jamoName(b.dataset.text) : b.dataset.text);
            next += 1; wrong = 0; unglow(ctx.stage); markNext();
            if (next >= pieces.length) { lockAll(blocks); setTimeout(done, 500); }
            return true;
          }
          wrong += 1;
          if (wrong >= 2) glow(blocks.find(x => x.dataset.locked !== '1' && x.dataset.text === pieces[next]));
          return false;
        },
      });
    });
    // merge into one syllable/word card
    await wait(500);
    const merged = el('div', `position:absolute;left:50%;top:56%;translate:-50% -50%;font-size:${Math.round(S * 1.3)}px;font-weight:800;color:#FF6FA5;text-shadow:0 6px 0 #fff,0 10px 18px rgba(255,111,165,.45);z-index:6;transform:scale(.3);opacity:0;transition:all .5s cubic-bezier(.3,1.6,.5,1)`);
    merged.textContent = mode === 'build' ? compose(pieces[0], pieces[1], pieces[2] || '') : target;
    ctx.stage.appendChild(merged);
    row.style.transition = 'opacity .3s'; row.style.opacity = '0';
    requestAnimationFrame(() => { merged.style.transform = 'scale(1)'; merged.style.opacity = '1'; });
    ctx.sfx('success');
    const [x, y] = center(row); ctx.burst(x, y, 'stars');
    ctx.onSuccess(target, 'bridge'); results.push({ item: target, type: 'bridge' }); tick();
    await ctx.speak(r.line || target);
    if (mode !== 'build') { pal.style.transition = 'left 2s ease-in-out'; pal.style.left = '78%'; await wait(1200); }
    await praise(ctx);
    row.remove(); tray.remove(); merged.remove();
    pal.style.transition = 'none'; pal.style.left = '1%';
  }
  return results;
}
