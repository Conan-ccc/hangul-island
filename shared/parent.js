// Parent gate and parent panel (text is fine here: adults only)
import { exportCode, importCode, defaultState, saveState } from './save.js';
import { isMastered, islandProgress } from './mastery.js';
import { CHARACTERS } from './characters.js';
import { buildIsland1Content } from './island1-content.js';

const ROLES = ['엄마', '아빠', '할머니', '할아버지', '외할머니', '외할아버지', '이모', '삼촌', '고모', '언니', '오빠', '누나', '형', '동생', '기타'];
// island number -> content summary, so the parent sees n / total and what is left
const ISLAND_CONTENT = { 1: p => { const c = buildIsland1Content(p); return { items: c.items, placeIds: c.placeIds }; } };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Long-press the top-right 64px zone for 2s, then answer a simple addition.
export function installParentGate(onPass) {
  const zone = document.createElement('div');
  zone.className = 'parent-zone';
  zone.style.cssText = 'position:fixed;top:0;right:0;width:64px;height:64px;z-index:90;touch-action:none';
  let timer = null;
  zone.addEventListener('pointerdown', () => { clearTimeout(timer); timer = setTimeout(() => openParentGate(onPass), 2000); });
  for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) zone.addEventListener(ev, () => clearTimeout(timer));
  document.body.appendChild(zone);
  return zone;
}

export function openParentGate(onPass) {
  const a = 2 + Math.floor(Math.random() * 8), b = 2 + Math.floor(Math.random() * 8);
  const ans = a + b;
  const opts = new Set([ans]);
  while (opts.size < 3) opts.add(ans + (Math.floor(Math.random() * 7) - 3) || ans + 4);
  const list = [...opts].sort(() => Math.random() - 0.5);
  const ov = document.createElement('div');
  ov.className = 'overlay parent-gate';
  ov.style.cssText = 'background:rgba(60,40,60,.55);display:flex;align-items:center;justify-content:center';
  ov.innerHTML = `<div style="background:#fff;border-radius:24px;padding:28px 32px;text-align:center;min-width:300px">
    <div style="font-size:15px;color:#888;margin-bottom:8px">보호자 확인</div>
    <div style="font-size:34px;font-weight:700;margin-bottom:18px">${a} + ${b} = ?</div>
    <div style="display:flex;gap:12px;justify-content:center">${list.map(n => `<button class="btn-pic gate-opt" data-n="${n}" style="font-size:26px;width:80px">${n}</button>`).join('')}</div>
    <button class="gate-close" style="margin-top:18px;border:none;background:none;color:#999;font-size:15px">닫기</button></div>`;
  ov.addEventListener('click', e => {
    const btn = e.target.closest('.gate-opt');
    if (btn) { ov.remove(); if (Number(btn.dataset.n) === ans) onPass(); return; }
    if (e.target.closest('.gate-close') || e.target === ov) ov.remove();
  });
  document.body.appendChild(ov);
  return ov;
}

function progressHtml(state) {
  const h = state.subjects.hangul;
  const ch = CHARACTERS.find(c => c.id === h.characterId);
  const rows = Object.entries(h.islands).sort((x, y) => Number(x[0]) - Number(y[0])).map(([n, isl]) => {
    const content = ISLAND_CONTENT[n] ? ISLAND_CONTENT[n](state.profile) : null;
    const items = content ? content.items : Object.keys(isl.mastery);
    const mastered = items.filter(it => isMastered(isl, it));
    const left = items.filter(it => !isMastered(isl, it)).map(it => {
      const m = isl.mastery[it] || { count: 0, types: [] };
      return `${esc(it)}(${m.count}회·놀이 ${m.types.length}종)`;
    });
    const pr = content ? islandProgress(isl, content.items, content.placeIds) : null;
    const btn = isl.cleared ? '' : `<button class="pp-clear" data-n="${Number(n)}" style="border:none;background:#f3eef3;border-radius:8px;padding:4px 8px;font-size:13px">완료로 처리</button>`;
    return `<tr><td>${Number(n)}섬</td><td>${isl.cleared ? '완료' : '진행 중'} ${btn}</td><td>${mastered.length}/${items.length} 익힘${left.length ? '<br><span style="color:#888;font-size:12px">남은 것: ' + left.join(', ') + '</span>' : ''}</td><td>${isl.days.length}일${pr && !pr.allVisited ? '<br><span style="color:#888;font-size:12px">안 간 장소 있음</span>' : ''}</td></tr>`;
  }).join('');
  return `<div>캐릭터: <b>${ch ? esc(ch.name) : '아직 없음'}</b> · ${h.stage + 1}단계 / 8단계</div>
    <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px"><tr style="color:#888"><td>섬</td><td>상태</td><td>익힌 글자</td><td>놀이한 날</td></tr>${rows || '<tr><td colspan="4">아직 기록 없음</td></tr>'}</table>`;
}

// onChange(newState) is called whenever the parent saves. firstRun hides reset/backup noise and requires a child name.
export function openParentPanel(state, onChange, { firstRun = false } = {}) {
  // saves mostly happen on island pages; try one now so the warning reflects reality
  saveState(state);
  const ov = document.createElement('div');
  ov.className = 'overlay parent-panel';
  ov.style.cssText = 'background:rgba(60,40,60,.55);overflow:auto;-webkit-overflow-scrolling:touch';
  const fam = state.profile.family.length ? state.profile.family : defaultState().profile.family;
  const famRow = (f, i) => `<div class="fam-row" style="display:flex;gap:8px;margin:6px 0">
      <select class="fam-role" style="padding:8px;border-radius:10px">${ROLES.map(r => `<option ${r === f.role ? 'selected' : ''}>${r}</option>`).join('')}</select>
      <input class="fam-name" value="${esc(f.name)}" placeholder="이름 (예: 홍길동)" style="flex:1;padding:8px 10px;border-radius:10px;border:1px solid #ddd;font-size:16px">
      <button class="fam-del" style="border:none;background:#f3eef3;border-radius:10px;padding:0 12px">삭제</button></div>`;
  ov.innerHTML = `<div style="background:#fff;max-width:640px;margin:32px auto;border-radius:24px;padding:24px 28px;font-size:16px;line-height:1.5">
    <div style="display:flex;justify-content:space-between;align-items:center"><h2 style="margin:0">${firstRun ? '처음 설정' : '보호자 공간'}</h2>
      ${firstRun ? '' : '<button class="pp-close btn-pic" style="font-size:15px">닫기</button>'}</div>
    ${state.saveError ? '<div class="pp-warn" style="background:#FFE3E3;color:#B00020;padding:10px;border-radius:12px;margin-top:12px">저장이 안 되고 있어요. 저장 공간을 확인하거나 백업 코드를 보관해 주세요.</div>' : ''}
    <h3>아이 이름</h3><input class="pp-child" value="${esc(state.profile.childName)}" placeholder="성까지 포함 (예: 홍길동)" style="width:100%;padding:10px;border-radius:10px;border:1px solid #ddd;font-size:18px">
    <div class="pp-child-err" style="color:#B00020;font-size:14px;display:none">아이 이름을 한글로 입력해 주세요.</div>
    <h3>가족 이름</h3><div style="font-size:13px;color:#888">게임에서 아이가 찾는 이름이에요. 이 아이패드 안에만 저장돼요.</div>
    <div class="fam-list">${fam.map(famRow).join('')}</div>
    <button class="fam-add" style="border:none;background:#f3eef3;border-radius:10px;padding:8px 14px;margin-top:4px">+ 가족 추가</button>
    <h3>소리 크기</h3><input class="pp-vol" type="range" min="0" max="1" step="0.1" value="${state.settings.volume}" style="width:100%">
    ${firstRun ? '' : `<h3>진행 상황</h3>${progressHtml(state)}
    <h3>백업</h3><div style="font-size:13px;color:#888">이 코드를 메모나 카톡에 보관해 두면, 아이패드를 바꾸거나 데이터가 지워져도 그대로 이어서 할 수 있어요.</div>
    <textarea class="pp-code" readonly style="width:100%;height:70px;font-size:12px;border-radius:10px;border:1px solid #ddd;padding:8px">${esc(exportCode(state))}</textarea>
    <button class="pp-copy" style="border:none;background:#FFC2D9;border-radius:10px;padding:8px 14px">코드 복사</button>`}
    <h3>${firstRun ? '백업 코드가 있으면 불러오기' : '백업 불러오기'}</h3>
    <textarea class="pp-restore" placeholder="HG1:로 시작하는 코드를 붙여넣기" style="width:100%;height:60px;font-size:12px;border-radius:10px;border:1px solid #ddd;padding:8px"></textarea>
    <button class="pp-restore-btn" style="border:none;background:#f3eef3;border-radius:10px;padding:8px 14px">불러오기</button>
    <span class="pp-restore-msg" style="font-size:14px;margin-left:8px"></span>
    ${firstRun ? '' : `<h3>처음부터 다시</h3><div style="font-size:13px;color:#888">캐릭터와 진행 상황이 모두 지워져요. 아래 칸에 <b>다시</b>를 입력하고 버튼을 누르세요.</div>
    <input class="pp-reset-word" style="padding:8px;border-radius:10px;border:1px solid #ddd;width:120px"> <button class="pp-reset" style="border:none;background:#FFE3E3;color:#B00020;border-radius:10px;padding:8px 14px">모두 지우기</button>`}
    <div style="margin-top:24px;text-align:right"><button class="pp-save btn-pic" style="font-size:18px;background:#FFC2D9;padding:10px 26px">저장</button></div>
  </div>`;
  const $ = s => ov.querySelector(s);
  const collect = () => {
    state.profile.childName = $('.pp-child').value.trim();
    state.profile.family = [...ov.querySelectorAll('.fam-row')].map(r => ({ role: r.querySelector('.fam-role').value, name: r.querySelector('.fam-name').value.trim() }));
    state.settings.volume = Number($('.pp-vol').value);
  };
  ov.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('.fam-del')) { t.closest('.fam-row').remove(); return; }
    if (t.closest('.fam-add')) { $('.fam-list').insertAdjacentHTML('beforeend', famRow({ name: '', role: '기타' })); return; }
    if (t.closest('.pp-copy')) { const c = $('.pp-code'); c.select(); navigator.clipboard?.writeText(c.value).catch(() => document.execCommand('copy')); t.textContent = '복사됨'; return; }
    if (t.closest('.pp-restore-btn')) {
      try {
        const st = importCode($('.pp-restore').value);
        Object.keys(state).forEach(k => delete state[k]); Object.assign(state, st);
        onChange(state); ov.remove();
      } catch { $('.pp-restore-msg').textContent = '코드가 올바르지 않아요.'; }
      return;
    }
    if (t.closest('.pp-reset')) {
      if ($('.pp-reset-word').value.trim() !== '다시') return;
      const keep = { profile: state.profile, settings: state.settings };
      const fresh = defaultState();
      Object.keys(state).forEach(k => delete state[k]); Object.assign(state, fresh, keep);
      onChange(state); ov.remove(); return;
    }
    if (t.closest('.pp-clear')) {
      const n = String(Number(t.closest('.pp-clear').dataset.n));
      if (!confirm(n + '섬을 완료로 처리할까요? 캐릭터가 한 단계 자라고 다음 섬이 열려요.')) return;
      const h = state.subjects.hangul;
      h.islands[n].cleared = true;
      h.stage = Math.min(7, Math.max(h.stage, Number(n)));
      onChange(state); ov.remove(); return;
    }
    if (t.closest('.pp-close')) { ov.remove(); return; }
    if (t.closest('.pp-save')) {
      collect();
      if (!/[가-힣]/.test(state.profile.childName)) { $('.pp-child-err').style.display = 'block'; return; }
      onChange(state); ov.remove();
    }
  });
  document.body.appendChild(ov);
  return ov;
}
