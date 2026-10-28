// Evolution scene: shake -> white flash -> new stage -> stars
import { drawCharacter } from './characters.js';
import { playSfx, burst } from './fx.js';

const wait = ms => new Promise(r => setTimeout(r, ms));

export async function playEvolution(container, id, from, to) {
  const ov = document.createElement('div');
  ov.className = 'overlay evolve';
  ov.style.cssText = 'display:flex;align-items:center;justify-content:center;background:radial-gradient(circle,#FFF8D6 0%,#FFE3F0 60%,#E9DDFF 100%)';
  const box = document.createElement('div');
  box.className = 'char';
  box.style.cssText = 'width:min(60vw,60vh);transition:filter .6s, transform .6s';
  box.innerHTML = drawCharacter(id, from);
  ov.appendChild(box);
  (container || document.body).appendChild(ov);
  playSfx('whoosh');
  box.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-6deg)' }, { transform: 'rotate(6deg)' }, { transform: 'rotate(0)' }], { duration: 300, iterations: 4 });
  await wait(1200);
  box.style.filter = 'brightness(4) saturate(0)';
  box.style.transform = 'scale(1.15)';
  playSfx('sparkle');
  await wait(700);
  box.innerHTML = drawCharacter(id, to);
  box.style.filter = 'none';
  box.style.transform = 'scale(1)';
  const r = box.getBoundingClientRect();
  burst(r.left + r.width / 2, r.top + r.height / 2, 'stars');
  playSfx('fanfare');
  await wait(400);
  burst(r.left + r.width * 0.3, r.top + r.height * 0.4, 'hearts');
  await wait(1700);
  ov.style.transition = 'opacity .4s';
  ov.style.opacity = '0';
  await wait(400);
  ov.remove();
}
