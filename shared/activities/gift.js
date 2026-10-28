// 동물 친구 선물: an animal asks for a family member's name card
import { makeDraggable } from '../drag.js';
import { SCENES, shuffle, card, at, el, glow, unglow, cheer, buddy, wait } from './common.js';

const ANIMALS = [
  '<svg viewBox="0 0 120 140" width="100%"><ellipse cx="44" cy="30" rx="11" ry="28" fill="#fff" stroke="#eee"/><ellipse cx="76" cy="30" rx="11" ry="28" fill="#fff" stroke="#eee"/><circle cx="60" cy="74" r="36" fill="#fff" stroke="#eee"/><circle cx="48" cy="72" r="5" fill="#3B2A35"/><circle cx="72" cy="72" r="5" fill="#3B2A35"/><path d="M55 86 q5 5 10 0" stroke="#3B2A35" stroke-width="2.5" fill="none"/><ellipse cx="60" cy="125" rx="30" ry="14" fill="#fff" stroke="#eee"/></svg>',
  '<svg viewBox="0 0 120 140" width="100%"><circle cx="30" cy="40" r="14" fill="#C98A5A"/><circle cx="90" cy="40" r="14" fill="#C98A5A"/><circle cx="60" cy="72" r="38" fill="#C98A5A"/><ellipse cx="60" cy="86" rx="16" ry="12" fill="#F6DDBF"/><circle cx="46" cy="68" r="5" fill="#3B2A35"/><circle cx="74" cy="68" r="5" fill="#3B2A35"/><circle cx="60" cy="82" r="4" fill="#3B2A35"/><ellipse cx="60" cy="126" rx="32" ry="14" fill="#C98A5A"/></svg>',
  '<svg viewBox="0 0 120 140" width="100%"><ellipse cx="60" cy="80" rx="40" ry="44" fill="#8EC5FF"/><path d="M98 76 l18 -6 l-18 14Z" fill="#FFB347"/><circle cx="76" cy="62" r="6" fill="#3B2A35"/><path d="M30 80 q-20 10 -6 30" fill="#6FAEEF"/><ellipse cx="60" cy="96" rx="22" ry="20" fill="#DDF4FF"/></svg>',
];

export async function run(ctx, { requests, rounds = 3 }) {
  ctx.stage.innerHTML = SCENES.village;
  buddy(ctx);
  const results = [];
  const list = shuffle(requests, ctx.rng).slice(0, rounds);
  for (let i = 0; i < list.length; i++) {
    const req = list[i];
    const animal = at(el('div', 'position:absolute;width:min(22vw,30vh)', ANIMALS[i % ANIMALS.length], 'animal'), 70, 58);
    const bubble = at(el('div', 'position:absolute;background:#fff;border-radius:24px;padding:10px 18px;font-size:40px', '<svg viewBox="-10 -2 20 18" width="44" height="40"><path d="M0 4 C-6 -2 -12 2 -8 8 L0 15 L8 8 C12 2 6 -2 0 4Z" fill="#FF8FB1"/></svg>'), 70, 24);
    ctx.stage.append(animal, bubble);
    const opts = shuffle(req.options, ctx.rng);
    const cards = opts.map((t, k) => {
      const c = at(card(t, 'background:#fff;min-width:150px'), 28, 25 + k * 22);
      ctx.stage.appendChild(c);
      c.addEventListener('pointerdown', () => ctx.speak(t));
      return c;
    });
    const ask = req.role === '나' ? ctx.call + ', 네 이름을 찾아줄래?' : ctx.phrase('giveGift', { role: req.role });
    ctx.speak(ask);
    bubble.addEventListener('click', () => ctx.speak(ask));
    let wrong = 0;
    await new Promise(done => {
      for (const c of cards) makeDraggable(c, {
        targets: () => [animal],
        onDrop: tg => {
          if (!tg) return false;
          if (c.dataset.text === req.answer) {
            c.dataset.locked = '1'; c.style.transition = 'all .4s'; c.style.left = '70%'; c.style.top = '58%'; c.style.transform = 'scale(.3)'; c.style.opacity = '0';
            animal.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-30px)' }, { transform: 'translateY(0)' }], { duration: 500, iterations: 2 });
            cheer(ctx, animal);
            ctx.onSuccess(req.answer, 'gift'); results.push({ item: req.answer, type: 'gift' });
            setTimeout(done, 900);
            return true;
          }
          wrong += 1;
          if (wrong >= 2) glow(cards.find(x => x.dataset.text === req.answer));
          ctx.speak(ctx.phrase('tryAgain'));
          return false;
        },
      });
    });
    await ctx.speak(req.answer + '! ' + ctx.phrase('great'));
    unglow(ctx.stage);
    [animal, bubble, ...cards].forEach(x => x.remove());
    await wait(200);
  }
  return results;
}
