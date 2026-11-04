'use strict';
/* =========================================================
   touch.js — 手機／平板虛擬搖桿＋射擊＋衝刺（v0.7）
   ---------------------------------------------------------
   載入順序：… → main.js → touch.js（index.html 的 tag 由 C 加）
   只在 (pointer: coarse) 或裝置有觸控時啟用；桌機不建立任何 DOM。
   對外：
     window.TOUCH = { enabled, setEnabled(bool), state }
       state = { enabled, pointer, stick:{x,y,dx,dy,active}, fire, sprint }
   輸入介面（沿用 main.js 既有全域）：
     左半虛擬搖桿 → window.KEYS['w'/'a'/'s'/'d']
     右下射擊鈕   → window.MOUSE.down = true，並每幀把 MOUSE.x/y 指向最近敵人螢幕座標
     衝刺鈕       → window.KEYS['shift']
   面板（#modal.show）開啟時自動釋放所有輸入並忽略按壓。
   DOM：#touch-ui（z-index 8, pointer-events none）
        #touch-stick（左半透明觸控區，pointer-events auto）
        #touch-fire / #touch-sprint（右下圓鈕，pointer-events auto）
   ========================================================= */

(function () {
  'use strict';

  var STICK_R = 60;        /* 搖桿盤半徑（px） */
  var KNOB_R = 26;
  var DEAD = 0.30;         /* 軸向死區（0..1） */

  var enabled = false;
  var state = {
    enabled: false,
    pointer: 'fine',
    stick: { x: 0, y: 0, dx: 0, dy: 0, active: false },
    fire: false,
    sprint: false
  };

  var ui = null, stickZone = null, stickBase = null, stickKnob = null;
  var fireBtn = null, sprintBtn = null;
  var stickId = null, fireId = null, sprintId = null;
  var rafId = 0;

  /* ---------------- 0. 能力偵測 ---------------- */
  function coarsePointer() {
    try { return !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches); } catch (e) { return false; }
  }
  function touchCapable() {
    return ('ontouchstart' in window) || ((navigator.maxTouchPoints || 0) > 0);
  }
  function autoShouldEnable() { return coarsePointer() || touchCapable(); }

  function keys() { return window.KEYS || (window.KEYS = {}); }
  function mouse() { return window.MOUSE || (window.MOUSE = { x: 0, y: 0, down: false, inside: false }); }
  function modalOpen() {
    var m = document.getElementById('modal');
    return !!(m && m.classList.contains('show'));
  }
  function blocked() {
    if (modalOpen()) return true;
    if (typeof game !== 'undefined' && game && game.paused) return true;
    var screen = document.getElementById('title');
    if (screen && !screen.hidden) return true;   /* 標題畫面不吃觸控輸入 */
    return false;
  }

  /* ---------------- 1. DOM ---------------- */
  function el(tag, css, text) {
    var d = document.createElement(tag);
    if (css) d.style.cssText = css;
    if (text) d.textContent = text;
    return d;
  }

  function buildUi() {
    if (ui) return;
    var safeB = 'env(safe-area-inset-bottom, 0px)';
    var safeR = 'env(safe-area-inset-right, 0px)';

    ui = el('div', [
      'position:fixed', 'inset:0', 'z-index:8', 'pointer-events:none',
      'touch-action:none', 'user-select:none', '-webkit-user-select:none',
      "-webkit-tap-highlight-color:transparent", 'transition:opacity .15s ease'
    ].join(';'));
    ui.id = 'touch-ui';

    /* 左半觸控區（透明） */
    stickZone = el('div', [
      'position:absolute', 'left:0', 'top:0', 'width:52%', 'height:100%',
      'pointer-events:auto', 'touch-action:none', 'background:transparent'
    ].join(';'));
    stickZone.id = 'touch-stick';
    ui.appendChild(stickZone);

    /* 搖桿盤（按下才顯示） */
    stickBase = el('div', [
      'position:fixed', 'display:none', 'pointer-events:none',
      'width:' + (STICK_R * 2) + 'px', 'height:' + (STICK_R * 2) + 'px', 'margin-left:-' + STICK_R + 'px',
      'margin-top:-' + STICK_R + 'px', 'border-radius:50%',
      'border:2px solid rgba(150,235,255,.45)',
      'background:radial-gradient(circle,rgba(10,40,52,.42),rgba(10,40,52,.18))',
      'box-shadow:0 0 18px rgba(120,230,255,.18)'
    ].join(';'));
    stickBase.id = 'touch-stick-base';
    ui.appendChild(stickBase);

    stickKnob = el('div', [
      'position:fixed', 'display:none', 'pointer-events:none',
      'width:' + (KNOB_R * 2) + 'px', 'height:' + (KNOB_R * 2) + 'px',
      'margin-left:-' + KNOB_R + 'px', 'margin-top:-' + KNOB_R + 'px', 'border-radius:50%',
      'background:radial-gradient(circle at 35% 30%,rgba(220,250,255,.95),rgba(90,200,230,.85))',
      'box-shadow:0 0 14px rgba(140,240,255,.55)'
    ].join(';'));
    stickKnob.id = 'touch-stick-knob';
    ui.appendChild(stickKnob);

    /* 射擊鈕（右下） */
    fireBtn = el('div', [
      'position:fixed', 'right:calc(20px + ' + safeR + ')', 'bottom:calc(24px + ' + safeB + ')',
      'width:76px', 'height:76px', 'border-radius:50%', 'pointer-events:auto', 'touch-action:none',
      'display:flex', 'align-items:center', 'justify-content:center',
      'z-index:9', 'font:700 13px/1 "Microsoft JhengHei",system-ui', 'color:#e8fbff',
      'border:2px solid rgba(255,140,160,.65)',
      'background:radial-gradient(circle,rgba(90,24,38,.72),rgba(40,10,18,.62))',
      'box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,200,210,.18)'
    ].join(';'), '射擊');
    fireBtn.id = 'touch-fire';
    ui.appendChild(fireBtn);

    /* 衝刺鈕（射擊左側） */
    sprintBtn = el('div', [
      'position:fixed', 'right:calc(112px + ' + safeR + ')', 'bottom:calc(30px + ' + safeB + ')',
      'width:64px', 'height:64px', 'border-radius:50%', 'pointer-events:auto', 'touch-action:none',
      'display:flex', 'align-items:center', 'justify-content:center',
      'z-index:9', 'font:700 12px/1 "Microsoft JhengHei",system-ui', 'color:#dff6ff',
      'border:2px solid rgba(120,230,255,.55)',
      'background:radial-gradient(circle,rgba(16,54,68,.72),rgba(8,26,34,.62))',
      'box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(200,250,255,.16)'
    ].join(';'), '衝刺');
    sprintBtn.id = 'touch-sprint';
    ui.appendChild(sprintBtn);

    document.body.appendChild(ui);
    bindPointer();

    try {
      document.body.classList.add('touch-ui');
      document.documentElement.dataset.touch = 'on';
    } catch (e) { }
  }

  function removeUi() {
    if (ui && ui.parentNode) ui.parentNode.removeChild(ui);
    ui = stickZone = stickBase = stickKnob = fireBtn = sprintBtn = null;
    stickId = fireId = sprintId = null;
    try {
      document.body.classList.remove('touch-ui');
      delete document.documentElement.dataset.touch;
    } catch (e) { }
  }

  /* ---------------- 2. 輸入寫入 ---------------- */
  function setMove(dx, dy) {
    var K = keys();
    K['a'] = dx < -DEAD;
    K['d'] = dx > DEAD;
    K['w'] = dy < -DEAD;
    K['s'] = dy > DEAD;
  }
  function releaseMove() {
    state.stick.active = false;
    state.stick.dx = state.stick.dy = 0;
    setMove(0, 0);
    hideStick();
  }
  function showStick(x, y) {
    stickBase.style.display = 'block';
    stickBase.style.left = x + 'px';
    stickBase.style.top = y + 'px';
    stickKnob.style.display = 'block';
    moveKnob(x, y);
  }
  function moveKnob(x, y) {
    stickKnob.style.left = x + 'px';
    stickKnob.style.top = y + 'px';
  }
  function hideStick() {
    if (stickBase) stickBase.style.display = 'none';
    if (stickKnob) stickKnob.style.display = 'none';
  }

  /* ---------------- 3. 最近敵人 → 螢幕座標 ---------------- */
  function nearestScreenAim() {
    var scene = (typeof game !== 'undefined' && game) ? game.scene : '';
    if (typeof sea === 'undefined' || !sea.player) return null;
    var best = null, bd = 1e9;
    if (scene === 'sea') {
      var P = sea.player;
      function consider(x, y) {
        var d = Math.hypot(x - P.x, y - P.y);
        if (d < bd) { bd = d; best = { x: x, y: y }; }
      }
      if (Array.isArray(sea.hazards)) for (var i = 0; i < sea.hazards.length; i++) {
        var h = sea.hazards[i]; if (h && h.alive) consider(h.x, h.y);
      }
      if (window.LEVIATHANS && Array.isArray(LEVIATHANS.list)) for (var j = 0; j < LEVIATHANS.list.length; j++) {
        var l = LEVIATHANS.list[j]; if (l && l.alive) consider(l.x, l.y);
      }
      if (best) return { x: best.x - sea.cam.x, y: best.y - sea.cam.y };
      /* 沒有敵人：朝目前面向 */
      var ang = (P.ang === undefined) ? 0 : P.ang;
      return { x: P.x + Math.cos(ang) * 220 - sea.cam.x, y: P.y + Math.sin(ang) * 220 - sea.cam.y };
    }
    if (scene === 'moon' && typeof moon !== 'undefined' && moon.p && typeof moonView === 'function') {
      var v = moonView();
      function considerM(x, y) {
        var d = Math.hypot(x - moon.p.x, y - moon.p.y);
        if (d < bd) { bd = d; best = { x: x, y: y }; }
      }
      if (Array.isArray(moon.aliens)) for (var k = 0; k < moon.aliens.length; k++) {
        var a = moon.aliens[k]; if (a && !a.dead) considerM(a.x, a.y);
      }
      if (moon.boss) considerM(moon.boss.x, moon.boss.y);
      if (best) return { x: v.ox + best.x * v.s, y: v.oy + best.y * v.s };
    }
    return null;
  }

  /* ---------------- 4. 每幀：瞄準／modal 停用 ---------------- */
  function loop() {
    rafId = 0;
    if (!enabled) return;
    var M = mouse();
    if (blocked()) {
      if (state.fire || state.sprint || state.stick.active) releaseAll();
      if (ui) ui.style.opacity = '0.35';
    } else {
      if (ui && ui.style.opacity !== '1') ui.style.opacity = '1';
      if (state.fire) {
        var t = nearestScreenAim();
        if (t) { M.x = t.x; M.y = t.y; }
        M.down = true;
      } else if (M.down) {
        M.down = false;      /* 手指放開（含被 modal 打斷） */
      }
      keys()['shift'] = !!state.sprint;
    }
    rafId = requestAnimationFrame(loop);
  }

  function releaseAll() {
    state.fire = false;
    state.sprint = false;
    releaseMove();
    var M = mouse(), K = keys();
    M.down = false;
    K['shift'] = false;
    K['w'] = K['a'] = K['s'] = K['d'] = false;
  }

  /* ---------------- 5. Pointer 事件 ---------------- */
  function bindPointer() {
    /* 搖桿 */
    stickZone.addEventListener('pointerdown', function (e) {
      if (!enabled || blocked()) return;
      e.preventDefault();
      stickId = e.pointerId;
      try { stickZone.setPointerCapture(stickId); } catch (err) { }
      state.stick.active = true;
      state.stick.x = e.clientX;
      state.stick.y = e.clientY;
      state.stick.dx = 0; state.stick.dy = 0;
      showStick(e.clientX, e.clientY);
      setMove(0, 0);
    });
    stickZone.addEventListener('pointermove', function (e) {
      if (!enabled || stickId === null || e.pointerId !== stickId) return;
      e.preventDefault();
      var dx = e.clientX - state.stick.x;
      var dy = e.clientY - state.stick.y;
      var d = Math.hypot(dx, dy);
      if (d > STICK_R) { dx = dx / d * STICK_R; dy = dy / d * STICK_R; d = STICK_R; }
      state.stick.dx = dx / STICK_R;
      state.stick.dy = dy / STICK_R;
      moveKnob(state.stick.x + dx, state.stick.y + dy);
      setMove(state.stick.dx, state.stick.dy);
    });
    function stickEnd(e) {
      if (stickId === null || e.pointerId !== stickId) return;
      stickId = null;
      releaseMove();
    }
    stickZone.addEventListener('pointerup', stickEnd);
    stickZone.addEventListener('pointercancel', stickEnd);
    stickZone.addEventListener('lostpointercapture', stickEnd);

    /* 射擊 */
    fireBtn.addEventListener('pointerdown', function (e) {
      if (!enabled || blocked()) return;
      e.preventDefault();
      fireId = e.pointerId;
      try { fireBtn.setPointerCapture(fireId); } catch (err) { }
      state.fire = true;
      mouse().down = true;
      fireBtn.style.transform = 'scale(.94)';
    });
    function fireEnd(e) {
      if (fireId !== null && e.pointerId !== fireId) return;
      fireId = null;
      state.fire = false;
      mouse().down = false;
      fireBtn.style.transform = '';
    }
    fireBtn.addEventListener('pointerup', fireEnd);
    fireBtn.addEventListener('pointercancel', fireEnd);
    fireBtn.addEventListener('lostpointercapture', fireEnd);

    /* 衝刺 */
    sprintBtn.addEventListener('pointerdown', function (e) {
      if (!enabled || blocked()) return;
      e.preventDefault();
      sprintId = e.pointerId;
      try { sprintBtn.setPointerCapture(sprintId); } catch (err) { }
      state.sprint = true;
      keys()['shift'] = true;
      sprintBtn.style.transform = 'scale(.94)';
    });
    function sprintEnd(e) {
      if (sprintId !== null && e.pointerId !== sprintId) return;
      sprintId = null;
      state.sprint = false;
      keys()['shift'] = false;
      sprintBtn.style.transform = '';
    }
    sprintBtn.addEventListener('pointerup', sprintEnd);
    sprintBtn.addEventListener('pointercancel', sprintEnd);
    sprintBtn.addEventListener('lostpointercapture', sprintEnd);

    /* 失焦一律放開 */
    window.addEventListener('blur', releaseAll);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) releaseAll();
    });
  }

  /* ---------------- 6. 對外控制 ---------------- */
  function setEnabled(on) {
    on = !!on;
    state.enabled = on;
    state.pointer = coarsePointer() ? 'coarse' : 'fine';
    if (on === enabled) {
      if (on) { buildUi(); if (!rafId) rafId = requestAnimationFrame(loop); }
      return;
    }
    enabled = on;
    if (on) {
      buildUi();
      if (!rafId) rafId = requestAnimationFrame(loop);
    } else {
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
      releaseAll();
      removeUi();
    }
  }

  var api = {};
  Object.defineProperty(api, 'enabled', {
    enumerable: true,
    get: function () { return enabled; }
  });
  api.setEnabled = setEnabled;
  api.state = state;
  window.TOUCH = api;

  /* ---------------- 7. 啟動 ---------------- */
  function boot() {
    state.pointer = coarsePointer() ? 'coarse' : 'fine';
    if (autoShouldEnable()) setEnabled(true);
    try {
      var mq = window.matchMedia('(pointer: coarse)');
      if (mq && mq.addEventListener) {
        mq.addEventListener('change', function (e) {
          if (e.matches) setEnabled(true);
        });
      }
    } catch (e) { }
    /* 第一次觸碰（有些瀏覽器 pointer:coarse 判斷較慢） */
    window.addEventListener('touchstart', function once() {
      window.removeEventListener('touchstart', once);
      if (!enabled && autoShouldEnable()) setEnabled(true);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
