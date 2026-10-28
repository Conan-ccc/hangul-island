// 선 긋기 문: trace the shape on the door to open it
import { createTracer } from '../trace.js';
import { SCENES, el, cheer, buddy, wait } from './common.js';

export async function run(ctx, { keys = ['ㅡ', 'ㅣ', 'ㅇ'], guideOpacity = 0.5 }) {
  ctx.stage.innerHTML = SCENES.door;
  buddy(ctx);
  for (const key of keys) {
    const door = el('div', 'position:absolute;left:50%;top:54%;translate:-50% -50%;width:min(42vw,62vh);height:min(52vw,76vh);background:#C98A5A;border-radius:48% 48% 12px 12px;border:10px solid #A86E43;transition:transform .8s;transform-origin:left center;perspective:600px;z-index:2');
    const pad = el('div', 'position:absolute;left:10%;top:14%;width:80%;height:72%;background:#FFF8EE;border-radius:24px');
    door.appendChild(pad);
    ctx.stage.appendChild(door);
    ctx.speak(ctx.phrase('traceDoor'));
    let tracer;
    await new Promise(done => { tracer = createTracer(pad, key, { guideOpacity, onComplete: done }); });
    cheer(ctx, door);
    ctx.speak(ctx.phrase('great'));
    await wait(500);
    door.style.transform = 'rotateY(-75deg)';
    ctx.sfx('whoosh');
    await wait(1000);
    tracer.destroy();
    door.remove();
  }
  return [];
}
