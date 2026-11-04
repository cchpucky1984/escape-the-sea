'use strict';
/* =========================================================
   leviathan.js — 深海巨獸（四角守衛 v1.0，GDD §3.3 / LEVELS §守衛）
   ---------------------------------------------------------
   載入順序：core.js → fx.js → base.js → sea.js → leviathan.js → space.js → main.js
   對外只暴露：
     window.LEVIATHANS = { reset(), update(dt), draw(ctx), spawn(), list }
   sea.js 由 B 加 3 行掛鉤（本檔不改別人的檔案）：
     initSea 尾端      if (window.LEVIATHANS) LEVIATHANS.reset();
     updateSea 內      if (window.LEVIATHANS) LEVIATHANS.update(dt);
     drawSea 世界層內  if (window.LEVIATHANS) LEVIATHANS.draw(ctx);
   本檔會把舊的 sea.bosses（hp 20 四角守衛）清空，由巨獸接手；
   擊殺走自己的掉落（不呼叫 killSeaBoss，避免 tech/掉落重複計算）。
   ========================================================= */

(function () {
  'use strict';

  /* ---------------- 0. 數值（GDD §3.3 定稿） ---------------- */
  var MAX_HP = 240;
  var BODY_MUL = 0.3;      /* 身體命中 ×0.3 */
  var CORE_MUL = 1.0;      /* 弱點核心 ×1.0 */
  var CORE_R = 22;
  var CORE_SWAY = 18;      /* 核心：x + cos(t*1.2)*18, y - 10 */
  var CONTACT = 4;
  var CONTACT_P3 = 6;
  var P2_AT = 0.66, P3_AT = 0.33;
  var SPOT_D = 2400;

  var SPOTS = [
    { id: 'nw', name: '深淵巨獸 · 西北', x: -SPOT_D, y: -SPOT_D },
    { id: 'ne', name: '深淵巨獸 · 東北', x: SPOT_D, y: -SPOT_D },
    { id: 'sw', name: '深淵巨獸 · 西南', x: -SPOT_D, y: SPOT_D },
    { id: 'se', name: '深淵巨獸 · 東南', x: SPOT_D, y: SPOT_D }
  ];

  /* 每階段色票（避免每幀組字串） */
  var PAL = {
    1: { body: '#3a2f66', dark: '#241c45', rim: '#c9a6ff', core: '#e2c8ff', glow: 'rgba(180,120,255,.10)', ring: 'rgba(200,160,255,.55)' },
    2: { body: '#5a3a2a', dark: '#3a2218', rim: '#ffb36b', core: '#ffd9a8', glow: 'rgba(255,150,60,.10)', ring: 'rgba(255,179,107,.55)' },
    3: { body: '#5e1f2a', dark: '#3a121a', rim: '#ff6f8a', core: '#ffd0da', glow: 'rgba(255,70,110,.12)', ring: 'rgba(255,111,138,.6)' }
  };

  /* ---------------- 1. 狀態 ---------------- */
  var list = [];
  var initialized = false;

  function rndf(a, b) { return a + Math.random() * (b - a); }
  function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
  function lerpA(a, b, t) {
    var d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
    return a + d * t;
  }
  function hasSea() { return (typeof sea !== 'undefined') && sea && sea.player; }
  function fxAPI() { return (typeof window !== 'undefined' && window.fx) ? window.fx : null; }
  function seaT() { return hasSea() ? sea.t : 0; }

  /* ---------------- 2. 建立 / 重置 ---------------- */
  function makeL(spot) {
    return {
      id: spot.id, name: spot.name,
      homeX: spot.x, homeY: spot.y,
      x: spot.x, y: spot.y,
      hp: MAX_HP, maxhp: MAX_HP, r: 60,
      alive: true, active: false,
      t: rndf(0, 6.3), ang: rndf(0, 6.3), hit: 0, coreHit: 0,
      phase: 1,
      fanT: rndf(1.2, 2.2), ringT: rndf(1.0, 1.8), summonT: 8,
      dashT: 0, dashCd: 4, dashAng: 0, contactCd: 0,
      aggroMul: 1, speedMul: 1      /* EV09 守衛甦醒用（events.js 設定，事件結束歸 1） */
    };
  }

  /* 舊的四角守衛（sea.js 的 sea.bosses）由巨獸接手；每幀清一次避免 initSea 又補回來 */
  function suppressOldBosses() {
    if (hasSea() && Array.isArray(sea.bosses) && sea.bosses.length) sea.bosses.length = 0;
  }

  function spotsLeft() {
    var killed = (typeof game !== 'undefined' && game && Array.isArray(game.bossesKilled)) ? game.bossesKilled : [];
    var out = [];
    for (var i = 0; i < SPOTS.length; i++) if (killed.indexOf(SPOTS[i].id) < 0) out.push(SPOTS[i]);
    return out;
  }

  function spawn() {
    initialized = true;
    list.length = 0;
    var left = spotsLeft();
    for (var i = 0; i < left.length; i++) list.push(makeL(left[i]));
    suppressOldBosses();
    return list;
  }

  function reset() {
    return spawn();
  }

  function ensureInit() {
    if (!initialized) spawn();
  }

  /* ---------------- 3. 更新 ---------------- */
  function update(dt) {
    if (!hasSea()) return;
    ensureInit();
    suppressOldBosses();
    if (!list.length) return;
    var P = sea.player;
    var safeR = (typeof baseRadius === 'function') ? baseRadius() : 170;
    var inSafe = Math.hypot(P.x, P.y) < safeR;
    for (var i = 0; i < list.length; i++) {
      var L = list[i];
      if (!L.alive) continue;
      updOne(L, dt, P, inSafe);
    }
  }

  function updOne(L, dt, P, inSafe) {
    L.t += dt;
    if (L.hit > 0) L.hit -= dt;
    if (L.coreHit > 0) L.coreHit -= dt;
    if (L.contactCd > 0) L.contactCd -= dt;

    var ratio = L.hp / L.maxhp;
    var nextPhase = ratio > P2_AT ? 1 : (ratio > P3_AT ? 2 : 3);
    if (nextPhase !== L.phase) {
      L.phase = nextPhase;
      phaseFx(L);
    }

    var dx = P.x - L.x, dy = P.y - L.y;
    var d = Math.hypot(dx, dy) || 1;
    var homeD = dist(L.x, L.y, L.homeX, L.homeY);
    /* EV09 守衛甦醒：aggroMul（1100→2400＝×2.18）、speedMul（×1.7）由 events.js 設定 */
    var engaged = !inSafe && d < 1150 * (L.aggroMul || 1) && homeD < 1500;
    var baseSp = (L.phase === 3 ? 46 * 1.35 : 46) * (L.speedMul || 1);

    if (engaged) {
      L.active = true;
      L.ang = lerpA(L.ang, Math.atan2(dy, dx), 1 - Math.exp(-3 * dt));

      /* P3：每 4 秒衝刺 1.8 秒（×2.6） */
      if (L.phase === 3) {
        L.dashCd -= dt;
        if (L.dashCd <= 0 && L.dashT <= 0) {
          L.dashT = 1.8; L.dashCd = 4; L.dashAng = Math.atan2(dy, dx);
          var F0 = fxAPI();
          if (F0) {
            F0.ring(L.x, L.y, { r0: 20, r1: 120, life: 0.35, w: 3, col: 'red' });
            F0.shake(2.5, 140);
            F0.sfx('charge');
          }
        }
        if (L.dashT > 0) { L.dashT -= dt; L.ang = lerpA(L.ang, L.dashAng, 1 - Math.exp(-8 * dt)); }
      }
      var sp = baseSp * (L.dashT > 0 ? 2.6 : 1);
      if (d > 150) {
        L.x += Math.cos(L.ang) * sp * dt;
        L.y += Math.sin(L.ang) * sp * dt;
      } else {
        L.x += Math.cos(L.ang + Math.PI / 2) * 18 * dt;
        L.y += Math.sin(L.ang + Math.PI / 2) * 18 * dt;
      }

      /* 階段攻擊 */
      if (L.phase === 1) {
        L.fanT -= dt;
        if (L.fanT <= 0 && d < 800) { L.fanT = 2.2; fanShot(L, Math.atan2(dy, dx)); }
      } else if (L.phase === 2) {
        L.ringT -= dt;
        if (L.ringT <= 0 && d < 800) { L.ringT = 1.8; ringShot(L, 5, 220); }
        L.summonT -= dt;
        if (L.summonT <= 0) { L.summonT = 8; summonDrones(L, 2); }
      } else {
        L.ringT -= dt;
        if (L.ringT <= 0 && d < 820) { L.ringT = 2.2; ringShot(L, 6, 240); }
      }

      /* 接觸傷害 */
      if (d < L.r + 20 && L.contactCd <= 0) {
        L.contactCd = 1.15;
        var dmg = L.phase === 3 ? CONTACT_P3 : CONTACT;
        if (typeof hurtPlayer === 'function') hurtPlayer(dmg);
        var F1 = fxAPI();
        if (F1) {
          F1.burst(P.x, P.y, { n: 8, spd: [60, 220], life: [0.2, 0.5], size: [1.2, 2.6], col: 'red', drag: 4 });
          F1.shake(4, 160);
          F1.sfx('hit');
        }
      }
    } else {
      L.active = false;
      L.dashT = 0;
      /* 脫戰飄回角落 */
      if (homeD > 60) {
        var ha = Math.atan2(L.homeY - L.y, L.homeX - L.x);
        L.ang = lerpA(L.ang, ha, 1 - Math.exp(-1.2 * dt));
        L.x += Math.cos(ha) * 26 * dt;
        L.y += Math.sin(ha) * 26 * dt;
      }
    }

    /* 玩家子彈（不管交戰與否都能打） */
    hitByBullets(L);
  }

  function fanShot(L, aim) {
    for (var i = -1; i <= 1; i++) {
      var a = aim + i * 0.32;
      pushEB(L, a, 240, 1);
    }
    var F = fxAPI();
    if (F) { F.ring(L.x, L.y, { r0: 24, r1: 56, life: 0.2, w: 2, col: 'violet' }); F.sfx('shoot'); }
    if (typeof tone === 'function') tone(150, 0.12, 'sawtooth', 0.06, 80);
  }

  function ringShot(L, n, spd) {
    var off = L.t * 0.6;
    for (var i = 0; i < n; i++) pushEB(L, off + i / n * Math.PI * 2, spd, 1);
    var F = fxAPI();
    if (F) { F.ring(L.x, L.y, { r0: 26, r1: 64, life: 0.22, w: 2.2, col: 'orange' }); F.sfx('crit'); }
    if (typeof tone === 'function') tone(120, 0.16, 'sawtooth', 0.07, 60);
  }

  function pushEB(L, ang, spd, dmg) {
    if (!hasSea() || !Array.isArray(sea.ebullets)) return;
    sea.ebullets.push({
      x: L.x + Math.cos(ang) * 30, y: L.y + Math.sin(ang) * 30,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      life: 4.5, r: 7, dmg: dmg, alive: true
    });
  }

  /* P2：召喚無人機（場上上限 4，透過 sea.hazards 走原本的 AI／繪製／掉落） */
  function summonDrones(L, n) {
    if (!hasSea() || !Array.isArray(sea.hazards)) return;
    var live = 0;
    for (var i = 0; i < sea.hazards.length; i++) if (sea.hazards[i].alive && sea.hazards[i].summons) live++;
    var can = Math.max(0, 4 - live);
    var cnt = Math.min(n, can);
    for (var k = 0; k < cnt; k++) {
      var a = rndf(0, Math.PI * 2), dd = rndf(60, 110);
      sea.hazards.push({
        type: 'drone',
        x: L.x + Math.cos(a) * dd, y: L.y + Math.sin(a) * dd,
        hp: 2, maxhp: 2, aggr: 1.1, dmgMul: 1,
        t: rndf(0, 6), cool: rndf(1, 2), ang: 0, r: 17,
        alive: true, hit: 0, flee: 0, summons: L.id
      });
    }
    var F = fxAPI();
    if (F) {
      F.ring(L.x, L.y, { r0: 30, r1: 110, life: 0.4, w: 2.4, col: 'orange' });
      F.sfx('wave');
    }
    if (cnt > 0 && typeof tone === 'function') tone(300, 0.25, 'square', 0.06, 180);
  }

  /* ---------------- 4. 子彈命中（核心 ×1.0、身體 ×0.3） ---------------- */
  function corePosX(L) { return L.x + Math.cos(L.t * 1.2) * CORE_SWAY; }
  function corePosY(L) { return L.y - 10; }

  function hitByBullets(L) {
    if (!hasSea() || !Array.isArray(sea.bullets)) return;
    var cx = corePosX(L), cy = corePosY(L);
    for (var i = 0; i < sea.bullets.length; i++) {
      var b = sea.bullets[i];
      if (!b || !b.alive) continue;
      var isCore = dist(cx, cy, b.x, b.y) < CORE_R + 6;
      var isBody = !isCore && dist(L.x, L.y, b.x, b.y) < L.r + 6;
      if (!isCore && !isBody) continue;
      b.alive = false;
      var dmg = Math.max(0.1, (b.dmg || 1) * (isCore ? CORE_MUL : BODY_MUL));
      L.hp -= dmg;
      L.hit = 0.16;
      if (isCore) L.coreHit = 0.22;
      hitFx(L, isCore, b, dmg);
      if (L.hp <= 0) { L.hp = 0; killL(L); return; }
    }
  }

  function hitFx(L, isCore, b, dmg) {
    var F = fxAPI();
    var cx = corePosX(L), cy = corePosY(L);
    var px = b ? b.x : cx, py = b ? b.y : cy;
    if (typeof float === 'function') {
      float(px + rndf(-6, 6), py - 12, (isCore ? '' : '') + Math.round(dmg * 10) / 10, isCore ? '#ffd166' : '#dff4ff');
    }
    if (!F) return;
    if (isCore) {
      F.spark(px, py, { n: 7, spd: [180, 420], life: [0.06, 0.18], size: [1.4, 2.6], col: 'gold' });
      F.ring(cx, cy, { r0: 8, r1: 40, life: 0.22, w: 2.4, col: 'gold' });
      F.shake(2.2, 90);
      F.sfx('crit');
    } else {
      F.spark(px, py, { n: 4, spd: [120, 320], life: [0.05, 0.14], size: [1, 2], col: 'white' });
      F.ring(L.x, L.y, { r0: 20, r1: 40, life: 0.16, w: 1.4, col: 'violet' });
      F.sfx('hit');
    }
  }

  function phaseFx(L) {
    var F = fxAPI();
    if (F) {
      F.ring(L.x, L.y, { r0: 40, r1: 190, life: 0.45, w: 3.4, col: L.phase === 3 ? 'red' : 'orange' });
      F.shake(5, 220);
      F.sfx('boss');
    }
    if (typeof toast === 'function') {
      toast(L.name + ' 進入第 ' + L.phase + ' 階段' + (L.phase === 3 ? ' — 牠開始衝刺了' : L.phase === 2 ? ' — 開始召喚無人機' : ''), 'gold');
    }
  }

  /* ---------------- 5. 擊殺與掉落（不呼叫 killSeaBoss，避免重複計算） ---------------- */
  function killL(L) {
    L.alive = false;
    L.hp = 0;
    var modGot = false;
    if (typeof game !== 'undefined' && game) {
      if (Array.isArray(game.bossesKilled) && game.bossesKilled.indexOf(L.id) < 0) game.bossesKilled.push(L.id);
      game.tech = Math.min(4, (game.tech || 0) + 1);
      if (typeof addRes === 'function') {
        addRes('alloy', 6);
        addRes('metal', 30);
        addRes('plastic', 20);
      }
      if (game.stats) {
        game.stats.bosses = (game.stats.bosses || 0) + 1;
        game.stats.kills = (game.stats.kills || 0) + 1;
        if (typeof game.stats.leviathanKills === 'number') game.stats.leviathanKills++;
      }
      if (typeof bountyOn === 'function') { try { bountyOn('leviathanKills', 1); } catch (e) { } }
    }
    /* 模組箱：B 實作 grantRandomMod()，存在才呼叫 */
    if (typeof grantRandomMod === 'function') {
      try { modGot = !!grantRandomMod(); } catch (e) { modGot = false; }
    }

    var F = fxAPI();
    if (F) {
      for (var i = 0; i < 3; i++) {
        F.burst(L.x + rndf(-60, 60), L.y + rndf(-60, 60), {
          n: 22, spd: [80, 380], life: [0.35, 0.9], size: [1.4, 3.6],
          col: i % 2 ? 'gold' : 'violet', drag: 2.4, grav: -30
        });
      }
      F.ring(L.x, L.y, { r0: 20, r1: 240, life: 0.6, w: 4, col: 'gold' });
      F.ring(L.x, L.y, { r0: 8, r1: 130, life: 0.4, w: 3, col: 'white' });
      F.flash('#ffffff', 0.45, 260);
      F.shake(14, 520);
      F.hitstop(80);
      F.slowmo(0.35, 240);
      F.sfx('kill');
      F.sfx('beam');
    }
    if (typeof sfx === 'function') { sfx('boom'); sfx('quest'); }
    if (typeof toast === 'function') {
      toast('擊敗' + L.name + ' — 科技碎片 ' + game.tech + '/4' + (modGot ? ' · 取得模組箱' : ''), 'gold');
      if (game && game.tech >= 4) {
        setTimeout(function () { if (typeof toast === 'function') toast('4 塊碎片齊集！到火箭研發中心研發「火箭護盾科技」', 'gold'); }, 1400);
      }
    }
    if (typeof saveGame === 'function') saveGame();
    if (typeof refreshHud === 'function') refreshHud();
  }

  /* ---------------- 6. 繪製（世界座標；呼叫者在相機 transform 內） ---------------- */
  function draw(ctx) {
    if (!ctx || !list.length) return;
    var cam = hasSea() ? sea.cam : null;
    var vw = (typeof VW === 'number') ? VW : 1280;
    var vh = (typeof VH === 'number') ? VH : 800;
    for (var i = 0; i < list.length; i++) {
      var L = list[i];
      if (!L.alive) continue;
      if (cam && (L.x < cam.x - 320 || L.x > cam.x + vw + 320 || L.y < cam.y - 320 || L.y > cam.y + vh + 320)) continue;
      drawOne(ctx, L);
    }
  }

  /* 外光暈：預渲染 sprite（比每幀 createRadialGradient + 大面積 fill 快很多） */
  var GLOW_SPR = (function () {
    var out = {};
    for (var p = 1; p <= 3; p++) {
      var rgb = p === 1 ? '180,120,255' : (p === 2 ? '255,150,60' : '255,70,110');
      var c = document.createElement('canvas');
      c.width = c.height = 128;
      var g = c.getContext('2d');
      var rg = g.createRadialGradient(64, 64, 8, 64, 64, 64);
      rg.addColorStop(0, 'rgba(' + rgb + ',.24)');
      rg.addColorStop(0.55, 'rgba(' + rgb + ',.08)');
      rg.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = rg; g.fillRect(0, 0, 128, 128);
      out[p] = c;
    }
    return out;
  })();

  function drawOne(ctx, L) {
    var P = PAL[L.phase] || PAL[1];
    var t = L.t;
    var hf = L.hit > 0 ? Math.min(1, L.hit / 0.16) : 0;
    var dash = L.dashT > 0;
    var F = fxAPI();

    /* 外光暈（drawImage 快取 sprite） */
    var spr = GLOW_SPR[L.phase] || GLOW_SPR[1];
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(spr, L.x - 120, L.y - 120, 240, 240);
    ctx.restore();

    ctx.save();
    ctx.translate(L.x, L.y);
    ctx.rotate(L.ang);
    ctx.scale(1.12, 1.12);

    /* 衝刺尾流 */
    if (dash) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,120,150,.16)';
      for (var s = 0; s < 4; s++) {
        ctx.beginPath();
        ctx.ellipse(-70 - s * 28, Math.sin(t * 14 + s) * 9, 32 - s * 5, 13 - s * 2, 0, 0, 6.2832);
        ctx.fill();
      }
      ctx.restore();
    }

    /* 觸手（5 條，圓頭、由粗到細） */
    ctx.lineCap = 'round';
    for (var k = 0; k < 5; k++) {
      var base = (k - 2) * 0.26;
      var len = 88 + (k % 2) * 22;
      var wav = Math.sin(t * 3 + k * 1.7) * 22;
      ctx.strokeStyle = k % 2 ? P.rim : P.dark;
      ctx.lineWidth = 8.5 - Math.abs(k - 2) * 1.2;
      ctx.beginPath();
      ctx.moveTo(-40, base * 30);
      ctx.bezierCurveTo(-40 - len * 0.35, base * 60 + wav * 0.6,
        -40 - len * 0.75, base * 90 - wav, -40 - len, base * 110 + wav * 1.4);
      ctx.stroke();
    }

    /* 尾鰭 */
    ctx.fillStyle = P.rim;
    ctx.beginPath();
    ctx.moveTo(-60, 0); ctx.lineTo(-96, -26); ctx.lineTo(-88, 0); ctx.lineTo(-96, 26);
    ctx.closePath(); ctx.fill();

    /* 身體（前後兩段＋背脊） */
    ctx.fillStyle = hf > 0.5 ? '#ffffff' : P.dark;
    ctx.beginPath(); ctx.ellipse(-30, 0, 40, 30, 0, 0, 6.2832); ctx.fill();
    ctx.fillStyle = hf > 0.5 ? '#ffffff' : P.body;
    ctx.beginPath(); ctx.ellipse(8, 0, 62, 38, 0, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = P.rim; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.ellipse(8, 0, 62, 38, 0, 0, 6.2832); ctx.stroke();
    /* 背脊高光 */
    ctx.strokeStyle = 'rgba(255,255,255,.20)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(6, -6, 44, 24, 0, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();

    /* 背鰭（兩片，矮而寬） */
    ctx.fillStyle = P.rim;
    ctx.beginPath();
    ctx.moveTo(-16, -34); ctx.quadraticCurveTo(4, -62, 22, -32);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-46, -28); ctx.quadraticCurveTo(-32, -50, -18, -26);
    ctx.closePath(); ctx.fill();

    /* 背部發光節點（階段色） */
    ctx.fillStyle = P.core;
    for (var s2 = 0; s2 < 3; s2++) {
      ctx.beginPath(); ctx.arc(-20 + s2 * 24, -22, 2.6, 0, 6.2832); ctx.fill();
    }

    /* 頭／顎 */
    ctx.fillStyle = hf > 0.5 ? '#ffffff' : P.dark;
    ctx.beginPath(); ctx.ellipse(70, 0, 30, 23, 0, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = P.rim; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(70, 0, 30, 23, 0, 0, 6.2832); ctx.stroke();
    ctx.fillStyle = '#120a18';
    ctx.beginPath(); ctx.ellipse(84, 0, 14, 9, 0, 0, 6.2832); ctx.fill();
    /* 牙齒（讓嘴部好辨識） */
    ctx.fillStyle = '#e8eef5';
    for (var th = 0; th < 4; th++) {
      var tx = 76 + th * 5;
      ctx.beginPath();
      ctx.moveTo(tx, 5); ctx.lineTo(tx + 2.4, 11); ctx.lineTo(tx + 4.8, 5);
      ctx.closePath(); ctx.fill();
    }
    /* 三顆眼 */
    for (var e = 0; e < 3; e++) {
      ctx.fillStyle = P.core;
      ctx.beginPath(); ctx.arc(58 + e * 11, -9 + e * 8, 3.4 - e * 0.5, 0, 6.2832); ctx.fill();
    }
    /* 受擊白閃（本體輪廓） */
    if (hf > 0 && hf <= 0.5) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = hf;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.ellipse(8, 0, 62, 38, 0, 0, 6.2832); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    /* 階段虛線光環（世界座標） */
    ctx.save();
    ctx.translate(L.x, L.y);
    ctx.rotate(t * 0.4);
    ctx.strokeStyle = P.ring;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([14, 12]);
    ctx.beginPath(); ctx.arc(0, 0, 88, 0, 6.2832); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.restore();

    /* 弱點核心（世界座標：x + cos(t*1.2)*18, y - 10） */
    var cx = corePosX(L), cy = corePosY(L);
    var pulse = 1 + Math.sin(t * 4.2) * 0.12;
    var coreHot = L.coreHit > 0;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = coreHot ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.16)';
    ctx.beginPath(); ctx.arc(0, 0, 30 * pulse, 0, 6.2832); ctx.fill();
    ctx.restore();
    /* 旋轉虛線外圈 */
    ctx.rotate(t * 1.1);
    ctx.strokeStyle = P.ring;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 6]);
    ctx.beginPath(); ctx.arc(0, 0, 28, 0, 6.2832); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    /* 核心本體 */
    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = coreHot ? '#ffffff' : P.core;
    ctx.beginPath(); ctx.arc(0, 0, 15 * pulse, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)';
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(0, 0, 15 * pulse, 0, 6.2832); ctx.stroke();
    /* 核心十字標記（弱點提示） */
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-24, 0); ctx.lineTo(-18, 0);
    ctx.moveTo(18, 0); ctx.lineTo(24, 0);
    ctx.moveTo(0, -24); ctx.lineTo(0, -18);
    ctx.moveTo(0, 18); ctx.lineTo(0, 24);
    ctx.stroke();
    ctx.restore();

    /* 名稱與血條 */
    var ratio = clamp01(L.hp / L.maxhp);
    var bw = 132, bx = L.x - bw / 2, by = L.y - 112;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 10px "Microsoft JhengHei",system-ui';
    ctx.fillStyle = 'rgba(220,235,255,.8)';
    ctx.fillText(L.name, L.x, by - 8);
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, 7, 3.5); ctx.fill();
    ctx.fillStyle = L.phase === 3 ? '#ff5d73' : L.phase === 2 ? '#ffb36b' : '#c9a6ff';
    ctx.beginPath(); ctx.roundRect(bx, by, Math.max(2, bw * ratio), 7, 3.5); ctx.fill();
    /* 階段刻度 66% / 33% */
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    ctx.fillRect(bx + bw * P2_AT - 0.5, by, 1, 7);
    ctx.fillRect(bx + bw * P3_AT - 0.5, by, 1, 7);
    ctx.restore();

    /* 弱點提示（玩家在附近時） */
    if (hasSea() && sea.player && Math.hypot(sea.player.x - L.x, sea.player.y - L.y) < 720) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '600 9px "Microsoft JhengHei",system-ui';
      ctx.fillStyle = 'rgba(255,209,102,' + (0.5 + 0.3 * Math.abs(Math.sin(t * 3))) + ')';
      ctx.fillText('弱點', cx, cy - CORE_R - 12);
      ctx.restore();
    }
  }

  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }

  /* ---------------- 7. 對外 ---------------- */
  window.LEVIATHANS = {
    reset: reset,
    update: update,
    draw: draw,
    spawn: spawn,
    list: list
  };
})();
