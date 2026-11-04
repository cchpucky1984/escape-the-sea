'use strict';
/* =========================================================
   events.js — 海域隨機事件（8 個）＋ 深海裂縫（v0.6）
   ---------------------------------------------------------
   載入順序：core → fx → base → sea → leviathan → events → space → main
   對外只暴露：
     window.SEA_EVENTS = { reset(), update(dt), draw(ctx), active: [], rift }
     - active：陣列，最多 1 筆 { id, name, radarColor, t, dur, x, y, data, claimed }
     - rift：getter，沒有裂縫時 null；有裂縫時
       { x, y, r:260, t, dur:50, spawnMul:3, dropMul:1.5, hazAdd:2, aggrMul:1.2,
         radarColor:'#b892ff', core:{ hp:30, maxhp:30, hit, alive }, alive:true }
   B 在 sea.js 掛 3 行（本檔不改 sea.js）：
     initSea 尾端       if (window.SEA_EVENTS) SEA_EVENTS.reset();
     updateSea(dt) 內   if (window.SEA_EVENTS) SEA_EVENTS.update(dt);
     drawSea 相機內     if (window.SEA_EVENTS) SEA_EVENTS.draw(ctx);
   測試注入（CONTENT §4.1）：`__T.sea.ev = { id:'EV08', dur:15 }` 會在下一幀被吃掉並啟動。
   數值來源：docs/design/CONTENT-v0.5.md §4.1（權重 23/17/16/11/9/9/8/7）
            ＋ LEVELS 裂縫參數（180s / 50s / 核心 30HP / 合金 8＋40% 模組箱）
   ========================================================= */

(function () {
  'use strict';

  /* ---------------- 0. 事件資料表（權重總和 100） ---------------- */
  var EVENTS = {
    EV01: {
      name: '垃圾潮', weight: 23, dur: 25, zone: 0,
      toast: '垃圾潮來了——趁現在撈！', radarColor: '#8ee6a4',
      data: { spawnMul: 2.2, dropMul: 1.25 }
    },
    EV02: {
      name: '洋流暴衝', weight: 17, dur: 18, zone: 0,
      toast: '洋流突然加速！', radarColor: '#6fe3ff',
      data: { currentMul: 2.2, speedMul: 1.15, oxMul: 1.2 }
    },
    EV03: {
      name: '鯊魚群', weight: 16, dur: 12, zone: 1,
      toast: '鯊魚群！三隻以上', radarColor: '#ff9aa8',
      data: { sharks: 3, alloyPerKill: 1 }
    },
    EV04: {
      name: '外星巡邏', weight: 11, dur: 15, zone: 2,
      toast: '外星巡邏隊接近', radarColor: '#c9a6ff',
      data: { drones: 3, hpMul: 1.5, alloyDrop: [2, 3] }
    },
    EV06: {
      name: '氧氣外洩', weight: 9, dur: 20, zone: 0,
      toast: '氧氣管在漏！', radarColor: '#9fe8ff',
      data: { oxMul: 2, airMul: 1.5 }
    },
    EV07: {
      name: '補給箱雨', weight: 9, dur: 8, zone: 0,
      toast: '補給箱從天而降', radarColor: '#ffd166',
      data: { crates: 5, radius: 500 }
    },
    EV08: {
      name: '暗流漩渦', weight: 8, dur: 15, zone: 2,
      toast: '暗流漩渦！不要被捲進去', radarColor: '#b892ff',
      data: { vortexR: 260, pull: 60, endAlloy: 2 }
    },
    EV09: {
      name: '守衛甦醒', weight: 7, dur: 30, zone: 3,
      toast: '深海的東西醒了——牠在找你', radarColor: '#ff7a90',
      data: { aggroMul: 2.18, speedMul: 1.7 }
    }
  };
  var ORDER = ['EV01', 'EV02', 'EV03', 'EV04', 'EV06', 'EV07', 'EV08', 'EV09'];

  /* 裂縫參數（DATA-v0.6 §2.1） */
  var RIFT = {
    interval: 180, dur: 50, r: 260, coreHp: 30,
    alloy: 8, modChance: 0.4,
    spawnMul: 3, dropMul: 1.5, hazAdd: 2, aggrMul: 1.2,
    spawnMin: 1200, spawnMax: 3000, radarColor: '#b892ff'
  };

  /* ---------------- 1. 狀態 ---------------- */
  var active = [];
  var rift = null;
  var evT = 0;            /* 海域內經過秒數（reset 歸零） */
  var nextCheck = 180;    /* 第 3 分鐘起 */
  var coolT = 0;          /* 事件之間冷卻 30s */
  var riftT = 0;          /* 下一道裂縫計時 */
  var counts = Object.create(null);   /* 同一事件每局上限 3 */

  /* ---------------- 2. 小工具 ---------------- */
  function hasSea() { return (typeof sea !== 'undefined') && sea && sea.player; }
  function FX() { return (typeof window !== 'undefined' && window.fx) ? window.fx : null; }
  function rndf(a, b) { return a + Math.random() * (b - a); }
  function say(text) { if (typeof toast === 'function') toast(text, 'gold'); }
  function grant(k, n) { if (typeof addRes === 'function') addRes(k, n); }
  function zoneOf(x, y) {
    if (typeof seaZone !== 'function') return { id: 0, mult: 1, aggr: 1, hazCap: 2 };
    return seaZone(Math.hypot(x, y));
  }
  function playerZone() {
    if (!hasSea()) return { id: 0, mult: 1, aggr: 1, hazCap: 2 };
    return zoneOf(sea.player.x, sea.player.y);
  }
  function camRect() {
    var cam = (hasSea() && sea.cam) ? sea.cam : { x: 0, y: 0 };
    var w = (typeof VW === 'number') ? VW : 1280;
    var h = (typeof VH === 'number') ? VH : 800;
    return { x: cam.x, y: cam.y, w: w, h: h };
  }

  /* 生一隻 hazard（走 sea.js 既有 AI／繪製／掉落；標記 evTag 供獎勵追蹤） */
  function spawnHazardAt(type, x, y, hpMul, tag) {
    if (!hasSea() || !Array.isArray(sea.hazards)) return null;
    var Z = zoneOf(x, y);
    var base = (type === 'shark') ? 3 : 2;
    var hp = Math.max(1, Math.round(base * (1 + Z.id * 0.35) * (hpMul || 1)));
    var h = {
      type: type, x: x, y: y, hp: hp, maxhp: hp,
      aggr: Z.aggr, dmgMul: 1 + Z.id * 0.14,
      t: rndf(0, 6), cool: rndf(0.6, 1.6), ang: 0,
      r: type === 'shark' ? 20 : 17, alive: true, hit: 0, flee: 0, empT: 0,
      evTag: tag || null, rewarded: false
    };
    sea.hazards.push(h);
    return h;
  }

  function spawnNear(type, dist0, dist1, hpMul, tag) {
    if (!hasSea()) return null;
    var P = sea.player;
    var a = rndf(0, Math.PI * 2), d = rndf(dist0, dist1);
    var x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d;
    var R = (typeof baseRadius === 'function') ? baseRadius() : 170;
    if (Math.hypot(x, y) < R + 80) {
      var b = Math.atan2(y, x);
      x = Math.cos(b) * (R + 120); y = Math.sin(b) * (R + 120);
    }
    return spawnHazardAt(type, x, y, hpMul, tag);
  }

  function pushPickup(type, x, y) {
    if (!hasSea() || !Array.isArray(sea.pickups)) return null;
    var p = { type: type, x: x, y: y, t: rndf(0, 7), r: type === 'crate' ? 24 : 17, alive: true };
    sea.pickups.push(p);
    return p;
  }

  /* ---------------- 3. 事件生命週期 ---------------- */
  function start(id, o) {
    o = o || {};
    var def = EVENTS[id];
    if (!def) return null;
    if (active.length) return null;             /* 同時最多 1 個 */
    var P = hasSea() ? sea.player : { x: 0, y: 0 };
    var ev = {
      id: id,
      name: def.name,
      radarColor: def.radarColor || '#8fe8ff',
      t: 0,
      dur: o.dur || def.dur,
      x: null,
      y: null,
      data: {},
      claimed: 0,
      acc: 0,
      spawned: 0,
      watch: [],
      target: null,
      startX: P.x,
      startY: P.y
    };
    for (var k in def.data) ev.data[k] = def.data[k];
    if (o.data) for (var k2 in o.data) ev.data[k2] = o.data[k2];
    active.push(ev);
    counts[id] = (counts[id] || 0) + 1;
    say(def.toast);
    var F = FX();
    if (F) {
      F.ring(P.x, P.y, { r0: 30, r1: 190, life: 0.55, w: 3, col: 'cyan' });
      F.shake(2, 120);
      F.sfx('wave');
    }
    onStart(ev);
    return ev;
  }

  function onStart(ev) {
    if (!hasSea()) return;
    var P = sea.player;
    if (ev.id === 'EV03') {
      for (var i = 0; i < ev.data.sharks; i++) {
        var h = spawnNear('shark', 420, 700, 1, 'EV03');
        if (h) ev.watch.push(h);
      }
      FX() && FX().flash('#ff4050', 0.08, 200);
    } else if (ev.id === 'EV04') {
      for (var j = 0; j < ev.data.drones; j++) {
        var d = spawnNear('drone', 460, 760, ev.data.hpMul, 'EV04');
        if (d) ev.watch.push(d);
      }
      FX() && FX().flash('rgba(200,160,255,.10)', 260);
    } else if (ev.id === 'EV07') {
      ev.x = P.x; ev.y = P.y;
    } else if (ev.id === 'EV08') {
      ev.x = P.x; ev.y = P.y;
      if (typeof tone === 'function') tone(70, 1.2, 'sawtooth', 0.10, 40);
      if (typeof float === 'function') float(P.x, P.y - 40, '暗流漩渦', '#c9a6ff');
    } else if (ev.id === 'EV09') {
      var lv = nearestLeviathan(P.x, P.y);
      if (lv) {
        ev.target = lv;
        ev.x = lv.x; ev.y = lv.y;
        lv.aggroMul = ev.data.aggroMul;
        lv.speedMul = ev.data.speedMul;
      }
      FX() && FX().sfx('boss');
    } else if (ev.id === 'EV02') {
      FX() && FX().sfx('charge');
    } else if (ev.id === 'EV01') {
      FX() && FX().flash('rgba(120,235,255,.10)', 260);
    } else if (ev.id === 'EV06') {
      FX() && FX().sfx('crack');
    }
  }

  function nearestLeviathan(x, y) {
    if (typeof window === 'undefined' || !window.LEVIATHANS || !Array.isArray(window.LEVIATHANS.list)) return null;
    var best = null, bd = 1e9;
    for (var i = 0; i < window.LEVIATHANS.list.length; i++) {
      var l = window.LEVIATHANS.list[i];
      if (!l || !l.alive) continue;
      var d = Math.hypot(l.x - x, l.y - y);
      if (d < bd) { bd = d; best = l; }
    }
    return best;
  }

  function endEv(ev, expired) {
    var F = FX();
    if (ev.id === 'EV08' && expired !== false) {
      grant('alloy', ev.data.endAlloy || 2);
      if (typeof float === 'function' && hasSea()) float(sea.player.x, sea.player.y - 30, '+2 合金', '#c9a6ff');
    }
    if (ev.id === 'EV09' && ev.target) {
      ev.target.aggroMul = 1;
      ev.target.speedMul = 1;
    }
    if (ev.id === 'EV01' && F) F.ring(ev.startX, ev.startY, { r0: 20, r1: 120, life: 0.5, w: 2, col: 'cyan' });
  }

  /* ---------------- 4. 事件每幀效果 ---------------- */
  function tick(ev, dt) {
    if (!hasSea()) return;
    var P = sea.player;
    var S = (typeof calcStats === 'function') ? calcStats() : { speed: 152, oxRate: 1 };
    var d = ev.data;

    if (ev.id === 'EV01') {
      /* 生成速率 ×2.2：以額外 spawnPickup 補足（sea.js 自己那條不動） */
      var Z = playerZone();
      var baseGap = 0.95 / Math.max(0.3, Z.mult);
      ev.acc += dt * (d.spawnMul - 1) / baseGap;
      while (ev.acc >= 1) {
        ev.acc -= 1;
        if (typeof spawnPickup === 'function') spawnPickup(false);
        ev.spawned++;
      }
    } else if (ev.id === 'EV02') {
      /* 洋流 ×2.2：補上額外 1.2 倍洋流位移 */
      if (typeof currentAt === 'function') {
        var cur = currentAt(P.x, P.y, sea.t);
        P.x += cur.x * (d.currentMul - 1) * dt;
        P.y += cur.y * (d.currentMul - 1) * dt;
      }
      /* 移速 +15%：有輸入時沿輸入方向補位移 */
      var keys = window.KEYS || {};
      var ix = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
      var iy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
      if (ix || iy) {
        var m = Math.hypot(ix, iy) || 1;
        P.x += (ix / m) * S.speed * (d.speedMul - 1) * dt;
        P.y += (iy / m) * S.speed * (d.speedMul - 1) * dt;
      }
      /* 氧耗 ×1.2：補上額外 20% */
      P.ox = Math.max(0, P.ox - dt * 0.85 * S.oxRate * (d.oxMul - 1));
    } else if (ev.id === 'EV03' || ev.id === 'EV04') {
      /* 擊殺獎勵（只結算一次；hazard 已被 sea.js 過濾掉但物件參照還在） */
      for (var i = 0; i < ev.watch.length; i++) {
        var h = ev.watch[i];
        if (!h || h.rewarded || h.alive) continue;
        h.rewarded = true;
        if (ev.id === 'EV03') {
          grant('alloy', ev.data.alloyPerKill || 1);
          if (typeof float === 'function') float(h.x, h.y - 20, '+1 合金', '#c9a6ff');
        } else {
          var lo = ev.data.alloyDrop[0], hi = ev.data.alloyDrop[1];
          var n = Math.round(rndf(lo, hi));
          grant('alloy', n);
          if (typeof float === 'function') float(h.x, h.y - 20, '+' + n + ' 合金', '#c9a6ff');
        }
        var F = FX();
        if (F) F.ring(h.x, h.y, { r0: 6, r1: 46, life: 0.3, w: 2, col: 'violet' });
      }
    } else if (ev.id === 'EV06') {
      /* 氧耗 ×2：補上額外 100%；空氣泡 +50%：週期性多生 air */
      P.ox = Math.max(0, P.ox - dt * 0.85 * S.oxRate * (d.oxMul - 1));
      ev.acc += dt;
      if (ev.acc >= 2.2) {
        ev.acc = 0;
        if (Math.random() < 0.5) pushPickup('air', P.x + rndf(-260, 260), P.y + rndf(-260, 260));
      }
      if (Math.random() < dt * 6) {
        var F6 = FX();
        if (F6) F6.trail(P.x + rndf(-14, 14), P.y + 10, { col: 'cyan', size: 2, life: 0.5, vy: -60, tx: 0, ty: 6 });
      }
    } else if (ev.id === 'EV07') {
      /* 半徑 500 掉 5 個 crate（0.55s 一個，營造「雨」） */
      ev.acc += dt;
      while (ev.acc >= 0.55 && ev.spawned < (d.crates || 5)) {
        ev.acc -= 0.55;
        var a = rndf(0, Math.PI * 2), r = rndf(120, d.radius || 500);
        var px = (ev.x || P.x) + Math.cos(a) * r, py = (ev.y || P.y) + Math.sin(a) * r;
        pushPickup('crate', px, py);
        ev.spawned++;
        var F7 = FX();
        if (F7) F7.ring(px, py, { r0: 4, r1: 30, life: 0.25, w: 2, col: 'gold' });
      }
    } else if (ev.id === 'EV08') {
      /* 半徑 260 內向心 60px/s */
      var vx = ev.x - P.x, vy = ev.y - P.y;
      var vd = Math.hypot(vx, vy) || 1;
      if (vd < (d.vortexR || 260)) {
        var f = (d.pull || 60) * (0.45 + 0.55 * (1 - vd / (d.vortexR || 260)));
        P.x += vx / vd * f * dt;
        P.y += vy / vd * f * dt;
      }
    } else if (ev.id === 'EV09') {
      if (ev.target && ev.target.alive) { ev.x = ev.target.x; ev.y = ev.target.y; }
      else {
        var l2 = nearestLeviathan(P.x, P.y);
        if (l2) {
          ev.target = l2; ev.x = l2.x; ev.y = l2.y;
          l2.aggroMul = ev.data.aggroMul;
          l2.speedMul = ev.data.speedMul;
        }
      }
    }
  }

  /* ---------------- 5. 隨機觸發 ---------------- */
  function tryTrigger() {
    var zid = playerZone().id;
    var pool = [], total = 0;
    for (var i = 0; i < ORDER.length; i++) {
      var id = ORDER[i], def = EVENTS[id];
      if (!def) continue;
      if (zid < def.zone) continue;
      if ((counts[id] || 0) >= 3) continue;
      pool.push({ id: id, w: def.weight });
      total += def.weight;
    }
    if (!pool.length) return null;
    var r = Math.random() * total;
    for (var j = 0; j < pool.length; j++) {
      r -= pool[j].w;
      if (r <= 0) return start(pool[j].id);
    }
    return start(pool[pool.length - 1].id);
  }

  /* ---------------- 6. 深海裂縫 ---------------- */
  function spawnRift() {
    if (!hasSea() || rift) return null;
    var a = rndf(0, Math.PI * 2), d = rndf(RIFT.spawnMin, RIFT.spawnMax);
    var x = Math.cos(a) * d, y = Math.sin(a) * d;
    rift = {
      x: x, y: y, r: RIFT.r, t: 0, dur: RIFT.dur, alive: true,
      /* 效期參數一併曝露，QA／其他系統可直接讀 SEA_EVENTS.rift.spawnMul 等 */
      spawnMul: RIFT.spawnMul, dropMul: RIFT.dropMul,
      hazAdd: RIFT.hazAdd, aggrMul: RIFT.aggrMul,
      radarColor: RIFT.radarColor,
      core: { x: x, y: y, hp: RIFT.coreHp, maxhp: RIFT.coreHp, hit: 0, alive: true },
      acc: 0, spawnT: 0
    };
    riftT = 0;
    say('深海裂縫出現了 —— 裂縫核心可被魚槍打爆');
    var F = FX();
    if (F) {
      F.ring(x, y, { r0: 40, r1: 340, life: 0.9, w: 4, col: 'violet' });
      F.ring(x, y, { r0: 10, r1: 140, life: 0.55, w: 3, col: 'white' });
      F.flash('rgba(180,120,255,.16)', 520);
      F.shake(7, 320);
      F.sfx('charge');
    }
    return rift;
  }

  function closeRift(destroyed) {
    if (!rift) return;
    var x = rift.x, y = rift.y;
    var F = FX();
    if (destroyed) {
      grant('alloy', RIFT.alloy);
      var mod = false;
      if (typeof grantRandomMod === 'function') {
        try { if (Math.random() < RIFT.modChance) { grantRandomMod(); mod = true; } } catch (e) { }
      }
      if (typeof game !== 'undefined' && game && game.stats) game.stats.rifts = (game.stats.rifts || 0) + 1;
      if (typeof float === 'function') float(x, y - 40, '+8 合金', '#c9a6ff');
      say('裂縫核心崩解 —— 獲得合金 8' + (mod ? ' · 模組箱' : ''));
      if (F) {
        F.burst(x, y, { n: 46, spd: [90, 420], life: [0.4, 1.0], size: [1.4, 3.6], col: 'violet', drag: 2.2, grav: -20 });
        F.burst(x, y, { n: 18, spd: [60, 260], life: [0.3, 0.8], size: [1.4, 3], col: 'gold', drag: 2.6, grav: -10 });
        F.ring(x, y, { r0: 20, r1: 260, life: 0.6, w: 4, col: 'violet' });
        F.flash('#ffffff', 0.35, 240);
        F.shake(12, 420);
        F.hitstop(60);
        F.sfx('kill');
      }
      if (typeof saveGame === 'function') saveGame();
      if (typeof refreshHud === 'function') refreshHud();
    } else if (F) {
      F.ring(x, y, { r0: rift.r, r1: 20, life: 0.6, w: 2, col: 'violet' });
      F.sfx('shield');
    }
    rift = null;
  }

  function spawnRiftHazard(r) {
    if (!hasSea()) return;
    var a = rndf(0, Math.PI * 2), d = rndf(80, r.r - 40);
    var h = spawnHazardAt(Math.random() < 0.5 ? 'shark' : 'drone', r.x + Math.cos(a) * d, r.y + Math.sin(a) * d, 1, 'RIFT');
    if (h) {
      h.rift = true;
      h.aggr = (h.aggr || 1) * RIFT.aggrMul;   /* 裂縫內 aggr ×1.2 */
    }
  }

  function updateRift(dt) {
    if (!hasSea()) return;
    if (!rift) {
      riftT += dt;
      if (riftT >= RIFT.interval) spawnRift();
      return;
    }
    var r = rift;
    r.t += dt;
    if (r.core.hit > 0) r.core.hit -= dt;
    var P = sea.player;
    var d = Math.hypot(P.x - r.x, P.y - r.y);

    /* 玩家魚槍打核心（核心 30HP，可提前打爆） */
    if (r.core.alive && Array.isArray(sea.bullets)) {
      for (var i = 0; i < sea.bullets.length; i++) {
        var b = sea.bullets[i];
        if (!b || !b.alive) continue;
        if (Math.hypot(b.x - r.core.x, b.y - r.core.y) < 34) {
          b.alive = false;
          var dmg = b.dmg || 1;
          r.core.hp -= dmg;
          r.core.hit = 0.16;
          if (typeof float === 'function') float(b.x + rndf(-6, 6), b.y - 12, String(Math.round(dmg * 10) / 10), '#e2c8ff');
          var F = FX();
          if (F) {
            F.spark(b.x, b.y, { n: 7, spd: [160, 420], life: [0.06, 0.18], size: [1.4, 2.6], col: 'violet' });
            F.ring(r.core.x, r.core.y, { r0: 8, r1: 40, life: 0.2, w: 2.2, col: 'white' });
            F.sfx('crit');
          }
          if (typeof tone === 'function') tone(620, 0.06, 'square', 0.06, 300);
          if (r.core.hp <= 0) { r.core.hp = 0; r.core.alive = false; closeRift(true); return; }
        }
      }
    }

    /* 半徑 260 內：垃圾生成 ×RIFT.spawnMul（DATA §2.1；額外 2 倍補足 sea.js 那條 1 倍） */
    if (d < r.r + 320 && typeof spawnPickup === 'function') {
      var Zm = playerZone().mult || 1;
      r.acc += dt * (RIFT.spawnMul - 1) / (0.95 / Math.max(0.3, Zm));
      while (r.acc >= 1) {
        r.acc -= 1;
        var a2 = rndf(0, Math.PI * 2), rr = Math.sqrt(Math.random()) * r.r;
        var pt = (typeof weightedPickupType === 'function') ? weightedPickupType() : 'plastic';
        pushPickup(pt, r.x + Math.cos(a2) * rr, r.y + Math.sin(a2) * rr);
      }
    }
    /* 裂縫內敵人 aggr ×RIFT.aggrMul（每隻只加成一次；含 sea.js 自己生的怪） */
    if (Array.isArray(sea.hazards)) {
      for (var hi = 0; hi < sea.hazards.length; hi++) {
        var hz = sea.hazards[hi];
        if (!hz || !hz.alive || hz.riftAggr) continue;
        if (Math.hypot(hz.x - r.x, hz.y - r.y) < r.r) {
          hz.aggr = (hz.aggr || 1) * RIFT.aggrMul;
          hz.riftAggr = 1;
        }
      }
    }
    /* 敵人上限 +2：自己補生（不去動 sea.js 的 hazCap） */
    r.spawnT -= dt;
    if (d < r.r && r.spawnT <= 0 && Array.isArray(sea.hazards)) {
      var mine = 0;
      for (var k = 0; k < sea.hazards.length; k++) if (sea.hazards[k].alive && sea.hazards[k].rift) mine++;
      if (mine < RIFT.hazAdd) { spawnRiftHazard(r); r.spawnT = 6; }
    }
    /* 掉落 ×1.5 以 data 形式提供給其他系統讀（B 可選用） */
    if (r.t >= r.dur) closeRift(false);
  }

  /* ---------------- 7. 更新入口 ---------------- */
  function update(dt) {
    if (!hasSea()) return;
    dt = +dt || 0;
    if (dt <= 0) return;
    if (dt > 0.25) dt = 0.25;          /* 避免大 dt 一次跳太多（測試加速時可分次呼叫） */
    evT += dt;
    coolT = Math.max(0, coolT - dt);

    /* 測試／CONTENT §4.1 注入：__T.sea.ev = { id, dur, data } */
    if (sea.ev && sea.ev.id && !active.length) {
      var inj = sea.ev;
      sea.ev = null;
      start(inj.id, inj);
    }

    updateRift(dt);

    for (var i = active.length - 1; i >= 0; i--) {
      var ev = active[i];
      ev.t += dt;
      tick(ev, dt);
      if (ev.t >= ev.dur) {
        endEv(ev, true);
        active.splice(i, 1);
        coolT = 30;
      }
    }

    if (!active.length && coolT <= 0 && evT >= nextCheck) {
      nextCheck = evT + 100;
      tryTrigger();
    }
  }

  /* ---------------- 8. 世界座標繪製（相機 transform 內） ---------------- */
  function drawTint(ctx, color) {
    var c = camRect();
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(c.x - 24, c.y - 24, c.w + 48, c.h + 48);
    ctx.restore();
  }

  function draw(ctx) {
    if (!ctx || !hasSea()) return;
    var c = camRect();
    /* 事件視覺 */
    for (var i = 0; i < active.length; i++) drawEvent(ctx, active[i], c);
    /* 裂縫（畫面外不畫，省成本） */
    if (rift && onScreen(rift.x, rift.y, rift.r + 100, c)) drawRift(ctx, rift);
    /* HUD：事件名＋倒數（DATA §2.1 的最低可接受降級；世界座標換算成鏡頭固定位置） */
    drawHud(ctx, c);
  }

  function drawHud(ctx, c) {
    if (!active.length && !rift) return;
    var lines = [];
    for (var i = 0; i < active.length; i++) {
      var ev = active[i];
      lines.push({
        text: ev.name,
        time: Math.max(0, Math.ceil(ev.dur - ev.t)),
        color: ev.radarColor || '#8fe8ff'
      });
    }
    if (rift) lines.push({
      text: '深海裂縫',
      time: Math.max(0, Math.ceil(rift.dur - rift.t)),
      color: RIFT.radarColor
    });
    if (!lines.length) return;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 12px "Microsoft JhengHei",system-ui';
    var cx = c.x + c.w / 2, y = c.y + 96;
    for (var k = 0; k < lines.length; k++) {
      var L = lines[k];
      var label = L.text + '　' + L.time + 's';
      var w = Math.max(96, ctx.measureText(label).width + 30);
      ctx.fillStyle = 'rgba(4,18,26,.72)';
      ctx.beginPath(); ctx.roundRect(cx - w / 2, y - 11, w, 22, 11); ctx.fill();
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = L.color;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.roundRect(cx - w / 2, y - 11, w, 22, 11); ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = L.color;
      ctx.fillText(label, cx, y + 0.5);
      y += 27;
    }
    ctx.restore();
  }

  function onScreen(x, y, margin, c) {
    return x > c.x - margin && x < c.x + c.w + margin && y > c.y - margin && y < c.y + c.h + margin;
  }

  function drawEvent(ctx, ev, c) {
    var t = ev.t;
    if (ev.id === 'EV01') {
      drawTint(ctx, 'rgba(120,235,255,.055)');
      /* 上升垃圾泡沫 */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var i = 0; i < 16; i++) {
        var x = c.x + ((i * 137 + t * 26) % c.w);
        var y = c.y + c.h - ((t * 34 + i * 91) % c.h);
        var a = 0.10 + 0.10 * Math.abs(Math.sin(t * 2 + i));
        ctx.fillStyle = 'rgba(160,240,255,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(x, y, 2 + (i % 3), 0, 6.2832); ctx.fill();
      }
      ctx.restore();
    } else if (ev.id === 'EV02') {
      /* 洋流線條：12 條短流光沿畫面橫向掃 */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(170,240,255,.20)';
      ctx.lineWidth = 2;
      for (var j = 0; j < 12; j++) {
        var yy = c.y + (j + 0.5) * c.h / 12;
        var off = (t * 260 + j * 173) % (c.w + 300) - 150;
        ctx.beginPath();
        ctx.moveTo(c.x + off, yy);
        ctx.lineTo(c.x + off + 120, yy + 14);
        ctx.stroke();
      }
      ctx.restore();
      drawTint(ctx, 'rgba(90,200,255,.03)');
    } else if (ev.id === 'EV06') {
      drawTint(ctx, 'rgba(140,255,230,.05)');
      /* 玩家身上的漏氣泡泡 */
      var P = sea.player;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (var k = 0; k < 8; k++) {
        var px = P.x + Math.sin(t * 2.2 + k * 1.9) * (14 + k * 3);
        var py = P.y + 12 - ((t * 60 + k * 23) % 140);
        ctx.fillStyle = 'rgba(160,255,235,' + (0.35 - k * 0.035).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(px, py, 2.4 + (k % 2), 0, 6.2832); ctx.fill();
      }
      ctx.restore();
    } else if (ev.id === 'EV07') {
      /* 5 個箱子從上落下（位置在事件開始時記下） */
      var baseX = ev.x || sea.player.x, baseY = ev.y || sea.player.y;
      if (!onScreen(baseX, baseY, 600, c)) return;
      ctx.save();
      for (var m = 0; m < Math.min(5, ev.spawned + 1); m++) {
        var fall = Math.min(1, Math.max(0, (t - m * 0.55) / 0.7));
        var ang = m * 1.2566;
        var r = 120 + (m % 3) * 130;
        var cx = baseX + Math.cos(ang) * r, cy = baseY + Math.sin(ang) * r - (1 - fall) * 300;
        ctx.globalAlpha = 0.9 * fall;
        ctx.fillStyle = '#8a6a3f';
        ctx.fillRect(cx - 11, cy - 11, 22, 22);
        ctx.strokeStyle = 'rgba(255,209,102,.9)'; ctx.lineWidth = 2;
        ctx.strokeRect(cx - 11, cy - 11, 22, 22);
        ctx.beginPath(); ctx.moveTo(cx - 11, cy - 11); ctx.lineTo(cx + 11, cy + 11);
        ctx.moveTo(cx + 11, cy - 11); ctx.lineTo(cx - 11, cy + 11); ctx.stroke();
      }
      ctx.restore();
    } else if (ev.id === 'EV08') {
      var vx = ev.x, vy = ev.y;
      var R = ev.data.vortexR || 260;
      if (!onScreen(vx, vy, R + 80, c)) return;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      /* 三圈旋轉虛線 */
      for (var q = 0; q < 3; q++) {
        ctx.strokeStyle = 'rgba(200,160,255,' + (0.32 - q * 0.08).toFixed(2) + ')';
        ctx.lineWidth = 2.4;
        ctx.setLineDash([18, 14]);
        ctx.lineDashOffset = -t * (70 + q * 30);
        ctx.beginPath(); ctx.arc(vx, vy, R * (0.32 + q * 0.3), 0, 6.2832); ctx.stroke();
      }
      ctx.setLineDash([]);
      /* 向心螺旋 */
      ctx.strokeStyle = 'rgba(160,120,255,.22)';
      ctx.lineWidth = 1.6;
      for (var s = 0; s < 10; s++) {
        var a3 = s / 10 * Math.PI * 2 + t * 0.8;
        ctx.beginPath();
        ctx.moveTo(vx + Math.cos(a3) * R, vy + Math.sin(a3) * R);
        ctx.quadraticCurveTo(vx + Math.cos(a3 + 0.5) * R * 0.55, vy + Math.sin(a3 + 0.5) * R * 0.55,
          vx + Math.cos(a3 + 0.9) * R * 0.18, vy + Math.sin(a3 + 0.9) * R * 0.18);
        ctx.stroke();
      }
      ctx.restore();
    } else if (ev.id === 'EV09') {
      if (ev.target && ev.target.alive) {
        var lx = ev.target.x, ly = ev.target.y;
        if (!onScreen(lx, ly, 260, c)) return;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        var pulse = 0.5 + 0.5 * Math.sin(t * 3);
        ctx.strokeStyle = 'rgba(255,80,110,' + (0.16 + pulse * 0.18).toFixed(3) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(lx, ly, 150 + pulse * 40, 0, 6.2832); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,120,150,.12)';
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(lx, ly, 210 + pulse * 50, 0, 6.2832); ctx.stroke();
        ctx.restore();
      }
      drawTint(ctx, 'rgba(255,70,110,.035)');
    }
  }

  function drawRift(ctx, r) {
    drawTint(ctx, 'rgba(160,100,255,.06)');
    var t = r.t;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    /* 外圈三層旋轉虛線 */
    for (var q = 0; q < 3; q++) {
      var rad = r.r * (0.36 + q * 0.30);
      ctx.strokeStyle = 'rgba(200,160,255,' + (0.38 - q * 0.09).toFixed(2) + ')';
      ctx.lineWidth = 3 - q * 0.6;
      ctx.setLineDash([22, 16]);
      ctx.lineDashOffset = -t * (90 + q * 40);
      ctx.beginPath(); ctx.arc(r.x, r.y, rad, 0, 6.2832); ctx.stroke();
    }
    ctx.setLineDash([]);
    /* 向心碎片 */
    for (var i = 0; i < 14; i++) {
      var a = i / 14 * Math.PI * 2 + t * 0.5;
      var prog = ((t * 0.55 + i * 0.13) % 1);
      var rr = r.r * (1 - prog);
      var x = r.x + Math.cos(a) * rr, y = r.y + Math.sin(a) * rr;
      ctx.fillStyle = 'rgba(220,190,255,' + (0.5 * (1 - prog)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(x, y, 2.2 + (i % 3), 0, 6.2832); ctx.fill();
    }
    ctx.restore();

    /* 核心（30HP 弱點） */
    var core = r.core;
    var hot = core.hit > 0;
    var pulse = 1 + Math.sin(t * 4) * 0.1;
    ctx.save();
    ctx.translate(core.x, core.y);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = hot ? 'rgba(255,255,255,.45)' : 'rgba(180,120,255,.28)';
    ctx.beginPath(); ctx.arc(0, 0, 46 * pulse, 0, 6.2832); ctx.fill();
    ctx.restore();
    ctx.rotate(t * 0.9);
    ctx.strokeStyle = 'rgba(235,215,255,.9)';
    ctx.lineWidth = 2.4;
    ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.arc(0, 0, 28, 0, 6.2832); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    ctx.save();
    ctx.translate(core.x, core.y);
    ctx.fillStyle = hot ? '#ffffff' : '#e2c8ff';
    ctx.beginPath(); ctx.arc(0, 0, 13 * pulse, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 0, 13 * pulse, 0, 6.2832); ctx.stroke();
    ctx.restore();
    /* 核心 HP 條 */
    var ratio = Math.max(0, core.hp / core.maxhp);
    var bw = 96, bx = core.x - bw / 2, by = core.y - 56;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, 6, 3); ctx.fill();
    ctx.fillStyle = '#c9a6ff';
    ctx.beginPath(); ctx.roundRect(bx, by, Math.max(2, bw * ratio), 6, 3); ctx.fill();
    ctx.textAlign = 'center';
    ctx.font = '700 9px "Microsoft JhengHei",system-ui';
    ctx.fillStyle = 'rgba(230,215,255,.85)';
    ctx.fillText('裂縫核心 ' + Math.ceil(core.hp) + '/' + core.maxhp, core.x, by - 5);
    ctx.restore();
  }

  /* ---------------- 9. reset（initSea 呼叫） ---------------- */
  function reset() {
    for (var i = 0; i < active.length; i++) endEv(active[i], false);
    active.length = 0;
    rift = null;
    evT = 0;
    nextCheck = 180;
    coolT = 0;
    riftT = 0;
    counts = Object.create(null);
  }

  /* ---------------- 10. 對外 ---------------- */
  var api = { reset: reset, update: update, draw: draw, active: active };
  Object.defineProperty(api, 'rift', {
    enumerable: true,
    get: function () { return rift; }
  });
  /* QA 鉤子（A 要求；非 enumerable，Object.keys 仍是 5 個正式 key） */
  Object.defineProperty(api, 'defs', { enumerable: false, value: EVENTS });
  Object.defineProperty(api, 'spawn', {
    enumerable: false,
    value: function (id, opts) { return start(id, opts); }
  });
  window.SEA_EVENTS = api;
})();
