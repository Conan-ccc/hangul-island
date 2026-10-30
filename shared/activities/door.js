// 따라 쓰기 문: trace the letter on the door to open it
import { createTracer } from '../trace.js';
import { jamoName } from '../hangul.js';
import { scene, el, cheer, buddy, wait, board, praise, progress } from './common.js';

export async function run(ctx, { keys, unitOf = {}, guideOpacity = 0.5 }) {
  scene(ctx, 'door');
  buddy(ctx);
  const results = [];
  const tick = progress(ctx, keys.length);
  for (const key of keys) {
    const isJamo = !/[가-힣]/.test(key);
    board(ctx, { big: key });
    ctx.boardLine = isJamo ? jamoName(key) : key;
    const pad = el('div', 'position:absolute;left:50%;top:60%;translate:-50% -50%;width:min(44vh,40vw);height:min(44vh,40vw);background:rgba(255,250,240,.93);border-radius:28px;box-shadow:0 10px 24px rgba(80,50,30,.25);z-index:3;transition:transform .8s, opacity .8s');
    ctx.stage.appendChild(pad);
    ctx.prompt = ctx.phrase('traceDoor');
    await ctx.speak(ctx.boardLine);
    ctx.speak(ctx.prompt);
    let tracer;
    await new Promise(done => { tracer = createTracer(pad, key, { guideOpacity, onComplete: done }); });
    cheer(ctx, pad); tick();
    if (unitOf[key]) { ctx.onSuccess(unitOf[key], 'trace'); results.push({ item: unitOf[key], type: 'trace' }); }
    await ctx.speak(ctx.boardLine);
    await praise(ctx);
    pad.style.transform = 'scale(.2) rotate(20deg)'; pad.style.opacity = '0';
    ctx.sfx('whoosh');
    await wait(800);
    tracer.destroy(); pad.remove();
  }
  return results;
}
