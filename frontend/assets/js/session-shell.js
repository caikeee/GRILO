/* ============================================================
 *  Session Shell — helpers do casco comum das práticas
 *  ============================================================
 *  Usado por lessons-4p.js, shadowing.js e dictation.js. Par de
 *  assets/css/session-shell.css. Expõe window.GriloShell:
 *
 *    icon(name)                    SVG inline (traço 2px, currentColor)
 *    progHtml(fracs) / setProg()   barra segmentada da topbar
 *    openSheet(session, opts)      feedback que sobe do dock
 *    closeSheet(session)
 *    toast(session, text)          selo rápido de fase (substitui as telas de ponte)
 *    tone(score, goal)             'good' | 'warn' | 'neutral' — nunca vermelho
 *    resultRing(score, goal)       anel de resultado já com o tom certo
 *    hubRing(el, done, total)      atualiza o anel pequeno dos hubs
 *    fitViewport(overlay)          sessão acompanha o visualViewport (teclado)
 *    lockScroll(on)                trava o scroll da página por trás da sessão
 * ============================================================ */
(function () {
  'use strict';

  const ICONS = {
    x: '<path d="M6 6l12 12M18 6L6 18" stroke-width="2.2"/>',
    back: '<path d="M15 5l-7 7 7 7" stroke-width="2.2"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor" stroke="none"/>',
    sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" stroke="none"/><path d="M5.5 11a6.5 6.5 0 0013 0M12 17.5V21"/>',
    micoff: '<path d="M9 9V6a3 3 0 016 0v5M15 13.5A3 3 0 019 11M5.5 11a6.5 6.5 0 0010.3 5.3M18.5 11a6.4 6.4 0 01-.6 2.7M12 17.5V21M4 4l16 16"/>',
    replay: '<path d="M4.5 12a7.5 7.5 0 107.5-7.5H8" stroke-width="2.2"/><path d="M10 1.5L7 4.5l3 3" stroke-width="2.2"/>',
    next: '<path d="M6 5.5v13l9-6.5z" fill="currentColor" stroke="none"/><path d="M17 5h2.5v14H17z" fill="currentColor" stroke="none"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.8"/>',
    cross: '<path d="M7 7l10 10M17 7L7 17" stroke-width="2.8"/>',
    bang: '<path d="M12 6v8" stroke-width="2.8"/><circle cx="12" cy="18.5" r="1.7" fill="currentColor" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><circle cx="12" cy="7.5" r="1.3" fill="currentColor" stroke="none"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" stroke="none"/><path d="M8 10.5V8a4 4 0 018 0v2.5" stroke-width="2.2"/>',
    down: '<path d="M6 9l6 6 6-6" stroke-width="2.2"/>',
    flag: '<path d="M6 21V4" stroke-width="2.2"/><path d="M6 4.5h11l-2.5 4 2.5 4H6z" fill="currentColor" stroke="none"/>',
    headphones: '<path d="M4 15v-3a8 8 0 0116 0v3" stroke-width="2.2"/><rect x="3" y="14" width="5" height="7" rx="2" fill="currentColor" stroke="none"/><rect x="16" y="14" width="5" height="7" rx="2" fill="currentColor" stroke="none"/>',
    reset: '<path d="M19.5 12a7.5 7.5 0 11-2.2-5.3" stroke-width="2.2"/><path d="M19.5 3.5v4h-4" stroke-width="2.2"/>',
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ─── Barra de progresso segmentada ───────────────────────────
  // fracs: uma fração 0..1 por segmento (ex.: 5 fases das aulas).
  function pct(f) { return Math.round(Math.max(0, Math.min(1, f || 0)) * 100); }

  function progHtml(fracs) {
    return fracs.map(f => `<i><b style="width:${pct(f)}%"></b></i>`).join('');
  }

  function setProg(el, fracs) {
    if (!el) return;
    if (el.children.length !== fracs.length) { el.innerHTML = progHtml(fracs); return; }
    fracs.forEach((f, i) => { el.children[i].firstElementChild.style.width = pct(f) + '%'; });
  }

  // ─── Sheet de feedback ───────────────────────────────────────
  // opts: { tone: 'good'|'warn'|'bad'|'plain', title, icon, pts, html,
  //         again: { label, onClick }, actions: [{ label, kind, icon, onClick, id }],
  //         center, stack, scrim, ariaLive }
  const TONE_ICON = { good: 'check', warn: 'bang', bad: 'cross' };

  function closeSheet(session) {
    if (!session) return;
    session.querySelectorAll(':scope > .gs-sheet, :scope > .gs-scrim').forEach(n => n.remove());
    session.classList.remove('has-sheet');
    session.style.removeProperty('--gs-sheet-h');
  }

  function openSheet(session, opts) {
    closeSheet(session);
    const o = opts || {};
    const tone = o.tone || 'plain';
    const ico = o.icon === undefined ? TONE_ICON[tone] : o.icon;

    if (o.scrim) {
      const scrim = document.createElement('div');
      scrim.className = 'gs-scrim';
      session.appendChild(scrim);
    }

    const sheet = document.createElement('div');
    sheet.className = `gs-sheet is-${tone}${o.center ? ' is-center' : ''}`;
    sheet.setAttribute('role', 'status');
    sheet.setAttribute('aria-live', 'polite');
    sheet.innerHTML = `
      ${o.top || ''}
      ${o.title ? `<div class="gs-sheet-title">${ico ? `<span class="gs-sheet-ico">${icon(ico)}</span>` : ''}<span>${o.title}</span>${o.pts != null ? `<span class="gs-sheet-pts">${escapeHtml(o.pts)}</span>` : ''}</div>` : ''}
      ${o.html || ''}
      ${o.again ? `<button class="gs-sheet-again" type="button" data-sheet-again>${icon('sound')}${escapeHtml(o.again.label || 'ouvir de novo')}</button>` : ''}
      <div class="gs-dock${o.stack ? ' is-stack' : ''}">
        ${(o.actions || []).map((a, i) => `
          <button class="gs-btn is-${a.kind || 'pri'}" type="button" data-sheet-act="${i}"${a.id ? ` id="${a.id}"` : ''}>${a.icon ? icon(a.icon) : ''}${escapeHtml(a.label)}</button>`).join('')}
      </div>`;
    session.appendChild(sheet);
    session.classList.add('has-sheet');
    session.style.setProperty('--gs-sheet-h', sheet.offsetHeight + 'px');

    if (o.again && o.again.onClick) {
      sheet.querySelector('[data-sheet-again]').addEventListener('click', o.again.onClick);
    }
    (o.actions || []).forEach((a, i) => {
      const btn = sheet.querySelector(`[data-sheet-act="${i}"]`);
      if (btn && a.onClick) btn.addEventListener('click', a.onClick);
    });
    const first = sheet.querySelector('.gs-btn.is-pri') || sheet.querySelector('.gs-btn');
    if (first) first.focus({ preventScroll: true });
    return sheet;
  }

  // ─── Toast de fase ───────────────────────────────────────────
  function toast(session, text) {
    if (!session) return;
    session.querySelectorAll(':scope > .gs-toast').forEach(n => n.remove());
    const t = document.createElement('div');
    t.className = 'gs-toast';
    t.setAttribute('role', 'status');
    t.textContent = text;
    session.appendChild(t);
    setTimeout(() => t.remove(), 1950);
  }

  // ─── Resultado: tom do anel ──────────────────────────────────
  // ≥ meta: verde · ≥ 40% da meta: âmbar · abaixo: neutro (primeira volta).
  function tone(score, goal) {
    if (score >= goal) return 'good';
    if (score >= goal * 0.4) return 'warn';
    return 'neutral';
  }

  function resultRing(score, goal, label) {
    const R = 64, C = 2 * Math.PI * R;
    const frac = Math.max(0, Math.min(1, score / 100));
    return `
      <div class="gs-rring is-${tone(score, goal)}" role="img" aria-label="${score} pontos${goal ? ` de meta ${goal}` : ''}">
        <svg viewBox="0 0 150 150" aria-hidden="true">
          <circle class="gs-rring-track" cx="75" cy="75" r="${R}"/>
          <circle class="gs-rring-fill" cx="75" cy="75" r="${R}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${(C * (1 - frac)).toFixed(1)}"/>
        </svg>
        <b>${score}${label !== '' ? `<small>${escapeHtml(label || (goal ? `meta ${goal}` : 'pontos'))}</small>` : ''}</b>
      </div>`;
  }

  function hubRing(el, done, total) {
    if (!el) return;
    const fill = el.querySelector('.gs-ring-fill');
    const num = el.querySelector('[data-ring-num]');
    const tot = el.querySelector('[data-ring-total]');
    const C = 2 * Math.PI * 24;
    if (fill) {
      fill.setAttribute('stroke-dasharray', C.toFixed(1));
      fill.setAttribute('stroke-dashoffset', (C * (1 - (total ? done / total : 0))).toFixed(1));
    }
    if (num) num.textContent = String(done);
    if (tot) tot.textContent = `de ${total}`;
  }

  // ─── Viewport / teclado ──────────────────────────────────────
  // No celular a sessão ocupa a tela; com o teclado aberto o iOS não
  // encolhe o layout viewport, então a sessão segue o visualViewport
  // (altura + deslocamento). Assim o dock fica colado no teclado.
  function fitViewport(overlay) {
    const vv = window.visualViewport;
    if (!overlay || !vv) return function () {};
    function apply() {
      if (window.innerWidth >= 720) {
        overlay.style.removeProperty('--gs-vh');
        overlay.style.removeProperty('--gs-vt');
        return;
      }
      overlay.style.setProperty('--gs-vh', vv.height + 'px');
      overlay.style.setProperty('--gs-vt', vv.offsetTop + 'px');
    }
    apply();
    vv.addEventListener('resize', apply);
    vv.addEventListener('scroll', apply);
    return function () {
      vv.removeEventListener('resize', apply);
      vv.removeEventListener('scroll', apply);
      overlay.style.removeProperty('--gs-vh');
      overlay.style.removeProperty('--gs-vt');
    };
  }

  function lockScroll(on) {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    document.body.style.overflow = on ? 'hidden' : '';
  }

  window.GriloShell = {
    icon, escapeHtml, progHtml, setProg,
    openSheet, closeSheet, toast,
    tone, resultRing, hubRing,
    fitViewport, lockScroll,
  };
})();
