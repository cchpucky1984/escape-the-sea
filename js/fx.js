'use strict';
/* =========================================================
   fx.js — 粒子 / 打擊感 / 螢幕特效 / 漸層快取（v0.4）
   ---------------------------------------------------------
   載入順序：core.js → fx.js → base.js → sea.js → space.js → main.js
   （index.html 的 script tag 由 C 加；?v= 由 Lead 統一）

   對外介面（凍結）：
     window.fx = {
       update(dt) -> dt,          // 回傳「世界時間」：頓幀 0、慢動作 dt*scale
       drawWorld(ctx),            // 世界座標特效；呼叫者在相機 transform 內呼叫
       drawScreen(ctx),           // 螢幕座標特效（閃光／暗角，會跟著震動偏移）
       burst(x,y,opts), spark(x,y,opts), trail(x,y,opts),
       ring(x,y,opts), text(x,y,str,opts), beam(x1,y1,x2,y2,opts),
       shake(px,ms), shakeOffset(), flash(color,ms),
       hitstop(ms), slowmo(scale,ms),
       grad: { lin(key,fn), rad(key,fn), clear() },
       clear(), stats(), setTier(n)
     };
     window.FX = window.fx（別名，AUDIT §4.8 的寫法）

   設計：
   - 固定長度物件池（part 900 / ring 40 / text 48 / beam 24），游標覆寫回收，
     每幀不 new、不 push、不 filter。
   - 顏色預算：8 色 × 16 級 alpha 字串表；光暈用 init 預渲染 sprite，不用 shadowBlur。
   - 沒有 AudioContext 也能跑：音效只在 sfx() 被呼叫時 lazy 檢查，update/draw 不碰音訊。
   - main.js 有掛 update 時不會重複推進；沒有掛鉤時（例如本檔案先落地）會自我推進，
     不會讓特效卡住。
   ========================================================= */

(function () {
  'use strict';

  /* ---------------- 0. 環境相容層 ---------------- */
  var CLAMP = function (v, a, b) { return v < a ? a : (v > b ? b : v); };
  var RND = function (a, b) { if (b === undefined) { b = a; a = 0; } return a + Math.random() * (b - a); };
  var FONT = '"Microsoft JhengHei",system-ui,sans-serif';

  function ctxW(ctx) {
    if (typeof VW === 'number' && VW) return VW;
    return (ctx.canvas.width) / (typeof DPR === 'number' && DPR ? DPR : 1);
  }
  function ctxH(ctx) {
    if (typeof VH === 'number' && VH) return VH;
    return (ctx.canvas.height) / (typeof DPR === 'number' && DPR ? DPR : 1);
  }
  function hasAudio() {
    return typeof AC !== 'undefined' && AC && typeof tone === 'function';
  }

  /* ---------------- 1. 色票與預算 alpha 字串 ---------------- */
  var COLORS = {
    white: [255, 255, 255], cyan: [159, 232, 255], gold: [255, 209, 102],
    red: [255, 143, 143], violet: [201, 166, 255], green: [142, 230, 164],
    orange: [255, 179, 107], blue: [127, 212, 255]
  };
  var LV = 16;
  var RGBA = Object.create(null), CSS = Object.create(null), SPR = Object.create(null);
  (function buildPalette() {
    for (var k in COLORS) {
      var c = COLORS[k];
      CSS[k] = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
      var arr = new Array(LV);
      for (var i = 0; i < LV; i++) {
        arr[i] = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + ((i + 1) / LV).toFixed(3) + ')';
      }
      RGBA[k] = arr;
      SPR[k] = makeGlowSprite(c);
    }
  })();
  function rgbaAt(k, a) {
    a = a <= 0 ? 0 : (a >= 1 ? LV - 1 : (a * LV) | 0);
    var t = RGBA[k] || RGBA.white;
    return t[a];
  }
  function cssOf(col) {
    if (!col) return CSS.white;
    if (CSS[col]) return CSS[col];
    return col;              /* 允許直接傳 '#rrggbb' 或 'rgba(...)' */
  }
  function makeGlowSprite(c) {
    var S = 64, cn = document.createElement('canvas');
    cn.width = cn.height = S;
    var g2 = cn.getContext('2d');
    var g = g2.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',1)');
    g.addColorStop(0.26, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.74)');
    g.addColorStop(0.60, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0.18)');
    g.addColorStop(1, 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',0)');
    g2.fillStyle = g; g2.fillRect(0, 0, S, S);
    return cn;
  }

  /* ---------------- 2. 固定長度物件池 ---------------- */
  var MAX = { part: 900, ring: 40, text: 48, beam: 24 };
  var parts = new Array(MAX.part), rings = new Array(MAX.ring);
  var texts = new Array(MAX.text), beams = new Array(MAX.beam);
  (function allocPools() {
    for (var i = 0; i < MAX.part; i++) parts[i] = {
      x: 0, y: 0, vx: 0, vy: 0, tvx: 0, tvy: 0, life: 0, life0: 1,
      size: 2, size1: 2, drag: 3, grav: 0, a0: 1, col: 'cyan', streak: 0
    };
    for (var j = 0; j < MAX.ring; j++) rings[j] = {
      x: 0, y: 0, r0: 0, r1: 0, life: 0, life0: 1, w: 2, fill: 0, css: CSS.white
    };
    for (var k = 0; k < MAX.text; k++) texts[k] = {
      x: 0, y: 0, vy: 0, life: 0, life0: 1, size: 15, font: '', text: '', css: CSS.white
    };
    for (var m = 0; m < MAX.beam; m++) beams[m] = {
      x1: 0, y1: 0, x2: 0, y2: 0, life: 0, life0: 1, w: 40, t: 0, seed: 0, css: CSS.blue
    };
  })();
  var pCur = 0, rCur = 0, tCur = 0, bCur = 0;
  var livePart = 0, liveRing = 0, liveText = 0, liveBeam = 0;

  /* ---------------- 3. 品質分級（手機降級） ---------------- */
  var CAP_TIER = { 1: 900, 2: 500, 3: 400 };   /* ROADMAP：手機粒子池 400 */
  var MUL_TIER = { 1: 1, 2: 0.65, 3: 0.45 };
  var tier = 1, pCap = CAP_TIER[1], mul = 1;

  function detectTier() {
    var small = (typeof innerWidth === 'number' && (innerWidth < 700 || innerHeight < 700));
    var dpr = (typeof devicePixelRatio === 'number') ? devicePixelRatio : 1;
    return (small || dpr > 2) ? 2 : 1;
  }
  function setTier(n) {
    tier = CLAMP(n | 0, 1, 3);
    pCap = CAP_TIER[tier];
    mul = MUL_TIER[tier];
    if (pCur >= pCap) pCur = 0;
    api.cap = pCap;
  }

  /* ---------------- 4. 螢幕效果狀態 ---------------- */
  var shakeAmp = 0, shakeK = 4.6 / 0.16;
  var OFF = { x: 0, y: 0 };
  var flashCSS = CSS.white, flashA = 0, flashK = 0, flashDur = 0.15, flashT = 0;
  var stopT = 0, stopBudget = 0.35;
  var slowScale = 1, slowT = 0;
  var sfxFrame = 0;
  var updCount = 0, seenUpd = 0, stall = 0, autoAt = 0;
  var drawToken = 0, drawnToken = -1;
  var lastUpdAt = 0;

  /* ---------------- 5. 發射 API ---------------- */
  function emit(x, y, vx, vy, life, size, size1, drag, grav, col, a0, tvx, tvy) {
    var p = parts[pCur];
    pCur = (pCur + 1) % pCap;
    p.x = x; p.y = y; p.vx = vx; p.vy = vy;
    p.life = life; p.life0 = life;
    p.size = size; p.size1 = size1;
    p.drag = drag; p.grav = grav;
    p.col = col; p.a0 = a0;
    p.tvx = tvx; p.tvy = tvy;
    p.streak = (tvx !== 0 || tvy !== 0) ? 1 : 0;
  }

  /* burst(x, y, opts) 或舊式 burst(x, y, n, opts) */
  function burst(x, y, a, b) {
    var n0, o;
    if (typeof a === 'number') { n0 = a; o = b || {}; }
    else { o = a || {}; n0 = o.n || 8; }
    var n = Math.max(1, Math.round(n0 * mul));
    var spd = o.spd || [50, 180], life = o.life || [0.22, 0.5], size = o.size || [1, 2.6];
    var dir = o.dir === undefined ? 0 : o.dir;
    var spread = o.spread === undefined ? Math.PI * 2 : o.spread;
    var drag = o.drag === undefined ? 3.2 : o.drag;
    var grav = o.grav || 0, col = o.col || 'cyan', a0 = (o.a === undefined ? 1 : o.a);
    for (var i = 0; i < n; i++) {
      var ang = dir + (Math.random() - 0.5) * spread;
      var s = RND(spd[0], spd[1]);
      emit(x + RND(-2, 2), y + RND(-2, 2), Math.cos(ang) * s, Math.sin(ang) * s,
        RND(life[0], life[1]), RND(size[0], size[1]), RND(size[0], size[1]),
        drag, grav, col, a0, 0, 0);
    }
  }

  function spark(x, y, o) {
    o = o || {};
    var n = Math.max(1, Math.round((o.n || 6) * mul));
    var spd = o.spd || [160, 420], life = o.life || [0.06, 0.18], size = o.size || [1.1, 2.2];
    var dir = o.dir === undefined ? 0 : o.dir;
    var spread = o.spread === undefined ? Math.PI * 2 : o.spread;
    var col = o.col || 'white', tail = (o.tail === undefined ? 0.035 : o.tail);
    for (var i = 0; i < n; i++) {
      var ang = dir + (Math.random() - 0.5) * spread;
      var s = RND(spd[0], spd[1]);
      var vx = Math.cos(ang) * s, vy = Math.sin(ang) * s;
      emit(x, y, vx, vy, RND(life[0], life[1]), RND(size[0], size[1]), RND(size[0], size[1]),
        4.2, o.grav || 0, col, 1, vx * tail, vy * tail);
    }
  }

  function trail(x, y, o) {
    o = o || {};
    emit(x, y, o.vx || 0, o.vy || 0, o.life || 0.16, o.size || 2.2, o.size || 2.2,
      (o.drag === undefined ? 1.6 : o.drag), 0, o.col || 'cyan',
      (o.a === undefined ? 0.8 : o.a), o.tx || 0, o.ty || 0);
  }

  function ring(x, y, o) {
    o = o || {};
    var p = rings[rCur]; rCur = (rCur + 1) % MAX.ring;
    p.x = x; p.y = y;
    p.r0 = (o.r0 === undefined ? 4 : o.r0);
    p.r1 = (o.r1 === undefined ? 40 : o.r1);
    p.life = p.life0 = (o.life || 0.26);
    p.w = (o.w === undefined ? 2 : o.w);
    p.fill = o.fill ? 1 : 0;
    p.css = cssOf(o.col || 'white');
  }

  function text(x, y, str, o) {
    o = o || {};
    var p = texts[tCur]; tCur = (tCur + 1) % MAX.text;
    p.x = x; p.y = y;
    p.vy = -(o.rise === undefined ? 26 : o.rise);
    p.life = p.life0 = (o.life || 0.75);
    p.size = o.size || 15;
    p.css = cssOf(o.col || 'white');
    p.font = (o.bold === false ? '600 ' : '900 ') + p.size + 'px ' + FONT;
    p.text = String(str);
  }

  function beam(x1, y1, x2, y2, o) {
    o = o || {};
    var p = beams[bCur]; bCur = (bCur + 1) % MAX.beam;
    p.x1 = x1; p.y1 = y1; p.x2 = x2; p.y2 = y2;
    p.life = p.life0 = (o.life || 0.5);
    p.w = (o.w === undefined ? 48 : o.w);
    p.css = cssOf(o.col || 'blue');
    p.t = 0; p.seed = Math.random() * 6.28;
  }

  /* ---------------- 6. 螢幕效果 ---------------- */
  function shake(px, ms) {
    px = Math.min(26, px || 0);
    shakeAmp = Math.max(shakeAmp, px);
    if (ms) shakeK = 4.6 / Math.max(0.04, ms / 1000);
  }
  function shakeOffset() { return OFF; }

  function flash(color, ms) {
    color = color || '#ffffff';
    var a = 0.4;
    var m = /rgba?\(([^)]+)\)/.exec(color);
    if (m) {
      var p = m[1].split(',');
      if (p.length >= 4) {
        var av = parseFloat(p[3]);
        if (!isNaN(av)) a = CLAMP(av, 0, 1);
        color = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
      }
    }
    flashA = Math.max(flashA, a);
    flashCSS = color;
    flashDur = (ms || 150) / 1000;
    flashT = flashDur;
    flashK = flashA;
  }

  function hitstop(ms) {
    var sec = Math.min(0.22, Math.max(0, (ms || 0) / 1000));
    if (sec <= 0) return;
    var spend = Math.min(sec, stopBudget);
    if (spend <= 0) return;
    stopBudget -= spend;
    stopT = Math.max(stopT, spend);
  }
  function slowmo(scale, ms) {
    slowScale = CLAMP(scale || 1, 0.05, 1);
    slowT = (ms || 200) / 1000;
  }

  /* ---------------- 7. 音效（9 個新事件，全部即時合成） ---------------- */
  function toneF(f0, dur, type, vol, f1, lp) {
    if (!hasAudio() || (typeof muted !== 'undefined' && muted)) return;
    try {
      var t0 = AC.currentTime;
      var o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(f0, t0);
      if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
      var tail = o;
      if (lp) {
        var bq = AC.createBiquadFilter();
        bq.type = 'lowpass'; bq.frequency.value = lp; bq.Q.value = 0.9;
        o.connect(bq); tail = bq;
      }
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.2, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      tail.connect(g); g.connect(master);
      o.start(t0); o.stop(t0 + dur + 0.03);
    } catch (e) { /* 音效失敗不影響畫面 */ }
  }
  var SFX = {
    hit: function () { tone(250, 0.045, 'square', 0.055, 110); noiseHit(0.05, 0.09, 2800); },
    crit: function () { tone(900, 0.045, 'triangle', 0.055, 1500); setTimeout(function () { tone(1350, 0.04, 'sine', 0.035, 2100); }, 16); },
    kill: function () { noiseHit(0.16, 0.15, 1500); tone(320, 0.14, 'triangle', 0.07, 80); },
    heavy: function () { tone(72, 0.3, 'sine', 0.2, 34); toneF(160, 0.22, 'sawtooth', 0.08, 50, 420); noiseHit(0.2, 0.2, 520); },
    core: function () { tone(620, 0.06, 'square', 0.075, 300); tone(95, 0.2, 'sine', 0.13, 62); },
    crack: function () { noiseHit(0.12, 0.16, 4200); tone(1800, 0.09, 'triangle', 0.07, 420); },
    charge: function () { toneF(110, 1.0, 'sawtooth', 0.06, 760, 1400); tone(55, 1.0, 'sine', 0.1, 58); },
    beam: function () { toneF(1900, 0.65, 'sawtooth', 0.13, 90, 2600); noiseHit(0.75, 0.28, 1100); tone(45, 1.1, 'sine', 0.22); },
    ignite: function () { noiseHit(1.1, 0.2, 360); toneF(62, 1.0, 'sawtooth', 0.09, 28, 220); }
  };
  var lastPlay = Object.create(null);
  function sfx(name) {
    var fn = SFX[name];
    if (!fn || !hasAudio()) return;
    var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (lastPlay[name] && now - lastPlay[name] < 35) return;   /* 同名 35ms 去重 */
    if (sfxFrame >= 3) return;                                 /* 每幀最多 3 個新音源 */
    lastPlay[name] = now; sfxFrame++;
    try { fn(); } catch (e) { }
  }

  /* ---------------- 8. 漸層快取 ---------------- */
  var gradLin = new Map(), gradRad = new Map(), GRAD_MAX = 256;
  function gradGet(map, key, fn) {
    var g = map.get(key);
    if (g) return g;
    if (map.size >= GRAD_MAX) map.clear();
    try { g = fn(); } catch (e) { return null; }
    if (!g) return null;
    map.set(key, g);
    return g;
  }
  var grad = {
    /* lin('key', () => ctx.createLinearGradient(...)) */
    lin: function (key, fn) { return gradGet(gradLin, key, fn); },
    rad: function (key, fn) { return gradGet(gradRad, key, fn); },
    clear: function () { gradLin.clear(); gradRad.clear(); }
  };

  /* ---------------- 9. 更新 ---------------- */
  function update(raw) {
    raw = +raw || 0;
    if (raw <= 0) raw = 1 / 60;
    if (raw > 0.05) raw = 0.05;
    lastUpdAt = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    updCount++;
    drawToken++;
    sfxFrame = 0;
    if (stopBudget < 0.35) stopBudget = Math.min(0.35, stopBudget + raw);

    /* 螢幕層：一律用真實時間 */
    if (flashT > 0) {
      flashT = Math.max(0, flashT - raw);
      flashK = flashA * (flashT / flashDur);
    }
    if (shakeAmp > 0) {
      shakeAmp *= Math.exp(-shakeK * raw);
      if (shakeAmp < 0.04) shakeAmp = 0;
      OFF.x = RND(-shakeAmp, shakeAmp);
      OFF.y = RND(-shakeAmp, shakeAmp);
    } else { OFF.x = 0; OFF.y = 0; }

    /* 世界層：頓幀 → dt 0；慢動作 → dt*scale */
    var dt = raw;
    if (stopT > 0) {
      stopT = Math.max(0, stopT - raw);
      dt = 0;
      updParts(raw * 0.35);
    } else {
      if (slowT > 0) { slowT = Math.max(0, slowT - raw); dt *= slowScale; }
      updParts(dt);
    }
    updRings(dt); updTexts(dt); updBeams(dt);
    return dt;
  }

  function updParts(dt) {
    livePart = 0;
    for (var i = 0; i < pCap; i++) {
      var p = parts[i];
      if (p.life <= 0) continue;
      if (dt <= 0) { livePart++; continue; }
      p.life -= dt;
      if (p.life <= 0) { p.life = 0; continue; }
      livePart++;
      var f = 1 / (1 + p.drag * dt);
      p.vx *= f; p.vy *= f;
      p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
    }
  }
  function updRings(dt) {
    liveRing = 0;
    for (var i = 0; i < MAX.ring; i++) {
      var p = rings[i];
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.life = 0; continue; }
      liveRing++;
    }
  }
  function updTexts(dt) {
    liveText = 0;
    for (var i = 0; i < MAX.text; i++) {
      var p = texts[i];
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.life = 0; continue; }
      liveText++;
      p.y += p.vy * dt;
      p.vy *= 1 / (1 + 1.8 * dt);
    }
  }
  function updBeams(dt) {
    liveBeam = 0;
    for (var i = 0; i < MAX.beam; i++) {
      var p = beams[i];
      if (p.life <= 0) continue;
      p.life -= dt; p.t += dt;
      if (p.life <= 0) { p.life = 0; continue; }
      liveBeam++;
    }
  }

  /* 沒有外部 update 時自我推進（有 main.js 掛鉤時永不觸發） */
  function ensureSelfDrive() {
    if (updCount !== seenUpd) { seenUpd = updCount; stall = 0; return; }
    stall++;
    if (stall < 3) return;
    var now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
    if (autoAt === 0) autoAt = now;
    var dt = (now - autoAt) / 1000;
    autoAt = now;
    if (dt > 0.001) {
      update(CLAMP(dt, 0.001, 0.05));
      seenUpd = updCount;
    }
  }

  /* ---------------- 10. 繪製 ---------------- */
  function drawWorld(ctx) {
    if (!ctx) return;
    ensureSelfDrive();
    if (drawnToken === drawToken) return;   /* 同一幀多個呼叫端只畫一次 */
    drawnToken = drawToken;

    /* 光束 */
    if (liveBeam) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < MAX.beam; i++) {
        var b = beams[i]; if (b.life <= 0) continue;
        var k = b.life / b.life0;
        var dx = b.x2 - b.x1, dy = b.y2 - b.y1;
        var len = Math.hypot(dx, dy) || 1;
        var nx = -dy / len, ny = dx / len;
        var w0 = b.w * (0.55 + 0.45 * (1 - k)), w1 = b.w * 0.30;
        ctx.globalAlpha = Math.min(1, k * 1.7);
        ctx.fillStyle = b.css;
        ctx.beginPath();
        ctx.moveTo(b.x1 + nx * w0, b.y1 + ny * w0);
        ctx.lineTo(b.x1 - nx * w0, b.y1 - ny * w0);
        ctx.lineTo(b.x2 - nx * w1, b.y2 - ny * w1);
        ctx.lineTo(b.x2 + nx * w1, b.y2 + ny * w1);
        ctx.closePath(); ctx.fill();
        /* 白光核心 */
        ctx.globalAlpha = Math.min(1, k) * 0.85;
        ctx.fillStyle = cssOf('white');
        ctx.strokeStyle = cssOf('white');
        ctx.lineWidth = Math.max(1, b.w * 0.16);
        ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
        /* 邊緣電弧 */
        ctx.globalAlpha = k * 0.5;
        ctx.strokeStyle = cssOf('cyan');
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (var j = 0; j <= 8; j++) {
          var s = j / 8;
          var wob = Math.sin(b.seed + b.t * 34 + j * 1.7) * b.w * 0.22;
          var px = b.x1 + dx * s + nx * wob, py = b.y1 + dy * s + ny * wob;
          if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    /* 粒子 */
    if (livePart) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var a = 0; a < pCap; a++) {
        var p = parts[a]; if (p.life <= 0) continue;
        var kk = p.life / p.life0;
        ctx.globalAlpha = kk * p.a0;
        if (p.streak) {
          ctx.strokeStyle = CSS[p.col] || CSS.cyan;
          ctx.lineWidth = p.size * (0.35 + kk * 0.95);
          ctx.beginPath(); ctx.moveTo(p.x - p.tvx, p.y - p.tvy); ctx.lineTo(p.x, p.y); ctx.stroke();
        } else {
          var sz = (p.size + (p.size1 - p.size) * (1 - kk)) * 5;
          ctx.drawImage(SPR[p.col] || SPR.cyan, p.x - sz / 2, p.y - sz / 2, sz, sz);
        }
      }
      ctx.restore();
    }

    /* 衝擊環 */
    if (liveRing) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var r = 0; r < MAX.ring; r++) {
        var q = rings[r]; if (q.life <= 0) continue;
        var kq = 1 - q.life / q.life0;
        var e = 1 - Math.pow(1 - kq, 2.2);
        var rad = q.r0 + (q.r1 - q.r0) * e;
        if (q.fill) {
          ctx.globalAlpha = (1 - kq) * 0.16;
          ctx.fillStyle = q.css;
          ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, 6.2832); ctx.fill();
        }
        ctx.globalAlpha = (1 - kq) * 0.95;
        ctx.strokeStyle = q.css;
        ctx.lineWidth = Math.max(0.6, q.w * (1 - kq * 0.85));
        ctx.beginPath(); ctx.arc(q.x, q.y, rad, 0, 6.2832); ctx.stroke();
      }
      ctx.restore();
    }

    /* 飄字 */
    if (liveText) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.globalCompositeOperation = 'source-over';
      for (var t = 0; t < MAX.text; t++) {
        var f = texts[t]; if (f.life <= 0) continue;
        var kf = f.life / f.life0;
        ctx.globalAlpha = Math.min(1, kf * 2.4);
        ctx.font = f.font;
        ctx.fillStyle = 'rgba(0,0,0,.62)';
        ctx.fillText(f.text, f.x + 1.5, f.y + 1.5);
        ctx.fillStyle = f.css;
        ctx.fillText(f.text, f.x, f.y);
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  var VIGNETTE = null;
  function buildVignette() {
    var W = 320, H = 200, cn = document.createElement('canvas');
    cn.width = W; cn.height = H;
    var g2 = cn.getContext('2d');
    var g = g2.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.30, W / 2, H / 2, Math.max(W, H) * 0.72);
    g.addColorStop(0, 'rgba(0,8,14,0)');
    g.addColorStop(1, 'rgba(0,8,14,.62)');
    g2.fillStyle = g; g2.fillRect(0, 0, W, H);
    VIGNETTE = cn;
  }

  /* 螢幕層：閃光（+ 選用暗角）。預設不畫暗角，避免改到 title／launch／moon 既有畫面 */
  var screenVignette = false;
  function drawScreen(ctx) {
    if (!ctx) return;
    ensureSelfDrive();
    if (flashK <= 0.002 && !screenVignette) return;
    var W = ctxW(ctx), H = ctxH(ctx);
    ctx.save();
    /* 螢幕層跟著震動偏移（世界層由場景用 fx.shakeOffset() 自己套） */
    ctx.translate(OFF.x, OFF.y);
    if (flashK > 0.002) {
      ctx.globalAlpha = Math.min(1, flashK);
      ctx.fillStyle = flashCSS;
      ctx.fillRect(-40, -40, W + 80, H + 80);
      ctx.globalAlpha = 1;
    }
    if (screenVignette) {
      if (!VIGNETTE) buildVignette();
      if (VIGNETTE) {
        ctx.globalAlpha = 0.85;
        ctx.drawImage(VIGNETTE, 0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();
  }

  /* ---------------- 11. 清理與統計 ---------------- */
  function clear() {
    for (var i = 0; i < MAX.part; i++) parts[i].life = 0;
    for (var j = 0; j < MAX.ring; j++) rings[j].life = 0;
    for (var k = 0; k < MAX.text; k++) texts[k].life = 0;
    for (var m = 0; m < MAX.beam; m++) beams[m].life = 0;
    livePart = liveRing = liveText = liveBeam = 0;
    shakeAmp = 0; OFF.x = 0; OFF.y = 0;
    flashK = 0; flashA = 0; flashT = 0;
    stopT = 0; slowT = 0; slowScale = 1;
  }

  function stats() {
    return {
      tier: tier, cap: pCap, mul: mul,
      parts: livePart, rings: liveRing, texts: liveText, beams: liveBeam,
      shake: +shakeAmp.toFixed(2), stop: +stopT.toFixed(3),
      slow: slowT > 0 ? slowScale : 1,
      grad: gradLin.size + gradRad.size,
      updates: updCount
    };
  }

  /* ---------------- 12. 對外 ---------------- */
  var api = {
    update: update,
    drawWorld: drawWorld,
    drawScreen: drawScreen,
    burst: burst,
    spark: spark,
    trail: trail,
    ring: ring,
    text: text,
    beam: beam,
    shake: shake,
    shakeOffset: shakeOffset,
    flash: flash,
    hitstop: hitstop,
    slowmo: slowmo,
    sfx: sfx,
    grad: grad,
    clear: clear,
    stats: stats,
    setTier: setTier,
    init: function () { setTier(detectTier()); return tier; },
    cap: pCap
  };
  api.damageText = text;          /* AUDIT §4.8 相容命名 */
  api.tier = function () { return tier; };

  setTier(detectTier());
  window.fx = api;
  window.FX = api;
})();
