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
  var SPOT_D = 2400;                          /* 舊值（保留給其他系統讀）；實際位置用 SPOT_R */
  var SPOT_SEED = (typeof game !== 'undefined' && game && typeof game.seed === 'number') ? Math.abs(game.seed) : 0;
  var SPOT_R = 2900 + (SPOT_SEED % 301);      /* §2：r 2900–3200，由 game.seed 決定 */

  var SPOTS = [
    { id: 'nw', name: '灼光守衛 · 西北', x: -SPOT_R, y: -SPOT_R, mode: 'beam' },
    { id: 'ne', name: '蜂巢守衛 · 東北', x: SPOT_R, y: -SPOT_R, mode: 'homing' },
    { id: 'sw', name: '裂濤守衛 · 西南', x: -SPOT_R, y: SPOT_R, mode: 'charge' },
    { id: 'se', name: '淵流守衛 · 東南', x: SPOT_R, y: SPOT_R, mode: 'current' }
  ];

  /* 每階段色票（避免每幀組字串） */
  var PAL = {
    1: { body: '#3a2f66', dark: '#241c45', rim: '#c9a6ff', core: '#e2c8ff', glow: 'rgba(180,120,255,.10)', ring: 'rgba(200,160,255,.55)' },
    2: { body: '#5a3a2a', dark: '#3a2218', rim: '#ffb36b', core: '#ffd9a8', glow: 'rgba(255,150,60,.10)', ring: 'rgba(255,179,107,.55)' },
    3: { body: '#5e1f2a', dark: '#3a121a', rim: '#ff6f8a', core: '#ffd0da', glow: 'rgba(255,70,110,.12)', ring: 'rgba(255,111,138,.6)' }
  };

  /* ---------------- 0b. v0.8 分歧模式（DIFFICULTY-v0.8 §2；四角各一套） ---------------- */
  var MODE_OF = { nw: 'beam', ne: 'homing', sw: 'charge', se: 'current' };
  /* task-31 的對外欄位叫 pattern；A 文件叫 mode。beam↔laser 是同一招的兩個名字 */
  var PATTERN_ALIAS = { beam: 'laser', homing: 'homing', charge: 'charge', current: 'current' };
  var PAT_LABEL = { beam: '灼光守衛 · 光束', homing: '蜂巢守衛 · 導彈', charge: '裂濤守衛 · 衝撞', current: '淵流守衛 · 洋流' };
  var PAT_COL = {
    laser: '#8ee6ff', homing: '#ff8a5c', charge: '#ff6f8a', current: '#8dffc8'
  };
  /* §3 子彈表（傷害/速度/壽命/尺寸）；巨獸用 fast/slow/homing + laser */
  var BUL = {
    fast: { spd: [480, 620], dmg: 4, r: 6, life: 3.0 },
    slow: { spd: [140, 200], dmg: 6, r: 9, life: 6.0 },
    homing: { spd: [210, 250], dmg: 6, r: 7, life: 4.5, turn: [1.8, 2.6], hp: 1, explodeR: 42 }
  };
  var PROJ_CAP = 120;         /* §3 海面同屏敵彈上限 */
  var HOMING_CAP = 8;         /* §3 homing 同屏上限 */
  /* §2 NW 光束 */
  var BEAM = {
    windup: 1.4, telegraph: 0.9, len: 900, width: 26, dur: 3.2,
    tick: 0.25, dmg: 4, sweep: 0.55,
    cd: { 1: 6.0, 2: 5.0, 3: 4.0 },
    half: { 1: 60, 2: 85, 3: 85 },     /* 掃描半角（度） */
    sweepP2: 0.70, dualCd: 9.0
  };
  /* §2 NE 追蹤導彈 */
  var HOM = {
    interval: 2.6, n: { 1: 2, 2: 3, 3: 4 },
    turn: { 1: 2.0, 2: 2.4, 3: 2.4 },
    spd: { 1: 210, 2: 230, 3: 250 },
    life: { 1: 4.5, 2: 4.5, 3: 5.0 },
    explodeR: 42, dmg: 6, hp: 1, r: 10
  };
  /* §2 SW 衝撞 */
  var CHG = {
    windup: 0.9, speed: { 1: 620, 2: 620, 3: 720 }, rush: 0.55,
    impact: 10, kb: 260, stun: 1.1, stunDmgMul: 1.5,
    cycle: { 1: 3, 2: 3, 3: 2 }, rest: 2.0,
    poisonR: 45, poisonDur: 3.0, poisonDps: 2
  };
  /* §2 SE 洋流場 */
  var FLD = {
    r: { 1: 520, 2: 520, 3: 620 }, pull: { 1: 130, 2: 130, 3: 180 },
    dur: 6.0, cd: 7.0, ring: 8, ringInt: 2.5,
    tangent: 0.8, pulseR: 200, pulseDmg: 5, pulseInt: 3.0, jellyInt: 1.8
  };
  var SPOT_R_MIN = 2900, SPOT_R_MAX = 3200;   /* §2 位置 r 2900–3200（由 game.seed 決定） */

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
    var mode = spot.mode || MODE_OF[spot.id] || 'beam';
    return {
      id: spot.id, name: spot.name,
      homeX: spot.x, homeY: spot.y,
      x: spot.x, y: spot.y,
      hp: MAX_HP, maxhp: MAX_HP, r: 60,
      alive: true, active: false,
      t: rndf(0, 6.3), ang: rndf(0, 6.3), hit: 0, coreHit: 0,
      phase: 1,
      contactCd: 0,
      aggroMul: 1, speedMul: 1,     /* EV09 守衛甦醒用（events.js 設定，事件結束歸 1） */
      /* v0.8 §2：模式分派（mode）＋ task-31 對外欄位（pattern） */
      mode: mode,
      pattern: PATTERN_ALIAS[mode] || 'laser',
      atkT: rndf(1.8, 2.8), secT: rndf(1.2, 2.2), fieldCd: rndf(2.5, 3.5),
      field: null, beams: [], charge: null, stun: 0, restT: 0,
      rushCount: 0, dualT: BEAM.dualCd, rush: null,
      strafeDir: Math.random() < 0.5 ? -1 : 1, strafeT: rndf(1.6, 3.0)
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
    proj.length = 0;
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
    updateProjectiles(dt);        /* v0.8：巨獸彈幕（含追蹤彈／擊退位移） */
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
    if (L.stun > 0) L.stun -= dt;
    if (L.restT > 0) L.restT -= dt;
    if (L.dualT > 0) L.dualT -= dt;

    var ratio = L.hp / L.maxhp;
    var nextPhase = ratio > P2_AT ? 1 : (ratio > P3_AT ? 2 : 3);
    if (nextPhase !== L.phase) {
      L.phase = nextPhase;
      phaseFx(L);
    }

    var dx = P.x - L.x, dy = P.y - L.y;
    var d = Math.hypot(dx, dy) || 1;
    var homeD = dist(L.x, L.y, L.homeX, L.homeY);
    var engaged = !inSafe && d < 1150 * (L.aggroMul || 1) && homeD < 1500;
    var baseSp = (L.phase === 3 ? 46 * 1.35 : 46) * (L.speedMul != null ? L.speedMul : 1);
    var aim = Math.atan2(dy, dx);

    if (engaged) {
      L.active = true;
      if (L.stun > 0) {
        /* 撞牆自暈：慢速漂移、可被白打（受傷 ×1.5 在 hitByBullets 處理） */
        L.ang = lerpA(L.ang, aim, 1 - Math.exp(-2 * dt));
        L.x += Math.cos(L.ang) * 10 * dt;
        L.y += Math.sin(L.ang) * 10 * dt;
      } else if (L.charge) {
        /* 衝撞狀態機在 stepCharge 內移動 */
      } else if (L.beams.length) {
        /* 光束蓄能／掃射時定點，只轉向 */
        L.ang = lerpA(L.ang, aim, 1 - Math.exp(-4 * dt));
      } else {
        movePattern(L, dt, d, aim, baseSp);
        attackPattern(L, dt, d, aim);
      }

      /* 接觸傷害（§2 不變：P1–P2 4、P3 6） */
      if (d < L.r + 20 && L.contactCd <= 0 && !L.charge) {
        L.contactCd = 1.15;
        var cdmg = L.phase === 3 ? CONTACT_P3 : CONTACT;
        if (typeof hurtPlayer === 'function') hurtPlayer(cdmg);
        var F1 = fxAPI();
        if (F1) {
          F1.burst(P.x, P.y, { n: 8, spd: [60, 220], life: [0.2, 0.5], size: [1.2, 2.6], col: 'red', drag: 4 });
          F1.shake(4, 160);
          F1.sfx('hit');
        }
      }
    } else {
      L.active = false;
      L.charge = null;
      L.beams.length = 0;
      /* 脫戰飄回角落 */
      if (homeD > 60) {
        var ha = Math.atan2(L.homeY - L.y, L.homeX - L.x);
        L.ang = lerpA(L.ang, ha, 1 - Math.exp(-1.2 * dt));
        L.x += Math.cos(ha) * 26 * dt;
        L.y += Math.sin(ha) * 26 * dt;
      }
    }

    /* 招式狀態機（脫戰也會跑完當前招式，畫面不會硬切） */
    if (L.charge) stepCharge(L, dt, P, aim);
    stepBeams(L, dt, P);
    stepField(L, dt, P);

    /* 玩家子彈（不管交戰與否都能打） */
    hitByBullets(L);
  }

  /* ---------------- 3b. 移動：各模式維持距離＋環繞 ---------------- */
  function movePattern(L, dt, d, aim, baseSp) {
    var target = L.mode === 'beam' ? 700 : L.mode === 'homing' ? 760 : L.mode === 'charge' ? 240 : 500;
    if (L.phase === 3) target += 40;
    var dir;
    if (d > target + 90) dir = aim;                    /* 靠近 */
    else if (d < target - 90) dir = aim + Math.PI;     /* 拉開 */
    else dir = aim + Math.PI / 2 * (L.strafeDir || 1); /* 環繞 */
    L.strafeT -= dt;
    if (L.strafeT <= 0) { L.strafeDir = -(L.strafeDir || 1); L.strafeT = rndf(1.6, 3.0); }
    L.ang = lerpA(L.ang, dir, 1 - Math.exp(-3.2 * dt));
    var sp = baseSp * (L.mode === 'charge' ? 1.15 : 1);
    L.x += Math.cos(L.ang) * sp * dt;
    L.y += Math.sin(L.ang) * sp * dt;
  }

  /* ---------------- 3c. 招式排程（§2；每招都有 ≥0.5s 前搖） ---------------- */
  function attackPattern(L, dt, d, aim) {
    L.atkT -= dt;
    if (L.mode === 'beam') {
      if (L.atkT <= 0 && d < BEAM.len + 80) { L.atkT = BEAM.cd[L.phase]; startBeam(L, aim, false); }
      /* 慢速大光球：填充壓力（讀條時也能躲） */
      L.secT -= dt;
      if (L.secT <= 0) {
        L.secT = L.phase >= 3 ? 2.0 : 2.8;
        fireSlow(L, aim - 0.18); fireSlow(L, aim + 0.18);
      }
      /* P2 起：每 9s 交叉第二道 */
      if (L.phase >= 2 && L.dualT <= 0) { L.dualT = BEAM.dualCd; startBeam(L, aim + Math.PI * 0.5, true); }
    } else if (L.mode === 'homing') {
      if (L.atkT <= 0 && d < 1000) { L.atkT = HOM.interval; homingVolley(L, aim); }
      L.secT -= dt;
      if (L.secT <= 0) { L.secT = 1.8; fireFast(L, aim); }   /* 風箏時的小壓力 */
    } else if (L.mode === 'charge') {
      if (L.restT > 0) return;
      if (L.atkT <= 0) {
        if (d > 460) L.atkT = 0.45;                           /* 先靠近再起手 */
        else startCharge(L, aim);
      }
    } else if (L.mode === 'current') {
      L.fieldCd -= dt;
      if (L.fieldCd <= 0 && d < 900) { L.fieldCd = FLD.cd; startField(L); }
    }
  }

  /* ---------------- 3d. NW 光束（§2） ---------------- */
  function startBeam(L, aim, dual) {
    L.beams.push({
      stage: 'charge', t: BEAM.windup, ang: aim, startAng: aim,
      sweep: (L.phase >= 2 ? BEAM.sweepP2 : BEAM.sweep) * (Math.random() < 0.5 ? -1 : 1) * (dual ? -1 : 1),
      half: BEAM.half[L.phase] * Math.PI / 180,
      beamT: 0, elapsed: 0, hitCd: 0, dual: !!dual
    });
    if (L.beams.length > 2) L.beams.shift();
    var F = fxAPI();
    if (F) {
      F.ring(L.x, L.y, { r0: 24, r1: 96, life: 0.35, w: 3, col: 'cyan' });
      F.shake(2.5, 160);
      F.sfx('charge');
    }
    if (typeof tone === 'function') tone(220, 0.5, 'sawtooth', 0.06, 900);
  }

  function stepBeams(L, dt, P) {
    if (!L.beams.length) return;
    for (var i = L.beams.length - 1; i >= 0; i--) {
      var b = L.beams[i];
      b.t -= dt;
      if (b.stage === 'charge') {
        if (b.t <= 0) {
          b.stage = 'beam';
          b.t = BEAM.dur; b.beamT = BEAM.dur; b.elapsed = 0; b.hitCd = 0;
          b.startAng = b.ang;
          var F = fxAPI();
          if (F) { F.beam(L.x, L.y, L.x + Math.cos(b.ang) * BEAM.len, L.y + Math.sin(b.ang) * BEAM.len, { life: 0.35, w: BEAM.width, col: 'cyan' }); F.shake(6, 260); F.sfx('beam'); }
        }
      } else {
        b.elapsed += dt;
        b.ang = b.startAng + Math.max(-b.half, Math.min(b.half, b.sweep * b.elapsed));
        b.hitCd -= dt;
        if (b.hitCd <= 0 && beamHits(L, b, P)) {
          beamTickDamage(P);
          b.hitCd = BEAM.tick;
        }
        if (b.t <= 0) L.beams.splice(i, 1);
      }
    }
  }

  function beamHits(L, b, P) {
    var ex = L.x + Math.cos(b.ang) * BEAM.len, ey = L.y + Math.sin(b.ang) * BEAM.len;
    return distPointSeg(P.x, P.y, L.x, L.y, ex, ey) < BEAM.width * 0.5 + 16;
  }

  /* 光束 tick：§3 每 0.25s 判定 4 傷（不受玩家 1.4s 無敵幀吃掉，仍是可躲的持續傷害） */
  function beamTickDamage(P) {
    if (!hasSea() || sea.dead) return;
    if (typeof playerInSafe === 'function' && playerInSafe()) return;
    P.hp -= BEAM.dmg;
    P.inv = Math.max(P.inv || 0, 0.18);
    if (typeof float === 'function') float(P.x, P.y - 20, '-' + BEAM.dmg, '#8ee6ff');
    var F = fxAPI();
    if (F) {
      F.spark(P.x, P.y, { n: 8, spd: [120, 320], life: [0.08, 0.22], size: [1.4, 2.6], col: 'cyan' });
      F.shake(5, 140);
      F.flash('#8ee6ff', 0.12, 120);
      F.sfx('hit');
    }
    if (typeof renderHearts === 'function' && typeof calcStats === 'function') renderHearts(P.hp, calcStats().maxhp);
    if (P.hp <= 0) { P.hp = 0; if (typeof seaDeath === 'function') seaDeath(); }
  }

  /* ---------------- 3e. NE 追蹤導彈（§2） ---------------- */
  function homingVolley(L, aim) {
    var n = HOM.n[L.phase];
    for (var i = 0; i < n; i++) {
      var a = aim + (i - (n - 1) / 2) * 0.34;
      spawnProj('homing', L, a, {
        spd: HOM.spd[L.phase] + rndf(-10, 10),
        turn: HOM.turn[L.phase],
        life: HOM.life[L.phase]
      });
    }
    var F = fxAPI();
    if (F) {
      F.ring(L.x, L.y, { r0: 26, r1: 110, life: 0.35, w: 2.4, col: 'orange' });
      F.ring(sea.player.x, sea.player.y, { r0: 34, r1: 20, life: 0.42, w: 2, col: 'orange' });  /* 鎖定警示圈 0.4s */
      F.sfx('charge');
      F.shake(2, 120);
    }
    if (typeof tone === 'function') tone(180, 0.3, 'square', 0.05, 240);
  }

  /* ---------------- 3f. SW 衝撞（§2） ---------------- */
  function startCharge(L, aim) {
    L.charge = { stage: 'windup', t: CHG.windup, ang: aim, rushT: 0 };
    var F = fxAPI();
    if (F) {
      F.ring(L.x, L.y, { r0: 30, r1: 170, life: 0.45, w: 3.4, col: 'red' });
      F.ring(L.x, L.y, { r0: 8, r1: 60, life: 0.3, w: 3, col: 'red' });
      F.shake(3, 180);
      F.sfx('charge');
    }
    if (typeof tone === 'function') tone(90, 0.6, 'sawtooth', 0.09, 60);
    if (typeof float === 'function') float(L.x, L.y - 70, '！衝撞', '#ff8fa3');
  }

  function stepCharge(L, dt, P, aim) {
    var c = L.charge;
    if (!c) return;
    c.t -= dt;
    if (c.stage === 'windup') {
      /* 前搖：後退 40px＋紅圈；鎖的是起手方向，之後不再轉向 */
      var back = 40 / CHG.windup;
      L.x -= Math.cos(c.ang) * back * dt;
      L.y -= Math.sin(c.ang) * back * dt;
      L.ang = c.ang;
      if (c.t <= 0) {
        c.stage = 'rush'; c.t = CHG.rush;
        var F = fxAPI();
        if (F) { F.ring(L.x, L.y, { r0: 20, r1: 90, life: 0.2, w: 4, col: 'red' }); F.shake(4, 160); F.sfx('heavy'); }
      }
    } else if (c.stage === 'rush') {
      var sp = CHG.speed[L.phase] * (L.speedMul != null ? L.speedMul : 1);
      L.x += Math.cos(c.ang) * sp * dt;
      L.y += Math.sin(c.ang) * sp * dt;
      /* 撞擊：10 傷＋擊退 260px */
      if (dist(P.x, P.y, L.x, L.y) < L.r + 26 && L.contactCd <= 0) {
        L.contactCd = 1.2;
        if (typeof hurtPlayer === 'function') hurtPlayer(CHG.impact);
        knockback(P, c.ang, CHG.kb);
        var F2 = fxAPI();
        if (F2) {
          F2.burst(P.x, P.y, { n: 16, spd: [120, 420], life: [0.2, 0.6], size: [1.4, 3.2], col: 'red', drag: 3 });
          F2.shake(8, 300);
          F2.sfx('heavy');
        }
      }
      /* 撞牆／出界自暈 */
      var R = (typeof baseRadius === 'function') ? baseRadius() : 170;
      if (Math.hypot(L.x, L.y) < R + 90) {
        selfStun(L);
      } else if (c.t <= 0) {
        L.rushCount++;
        var need = (L.phase === 3 ? 2 : CHG.cycle[L.phase]);
        L.charge = null;
        if (L.rushCount >= need) {
          L.rushCount = 0;
          L.restT = CHG.rest;
          var F3 = fxAPI();
          if (F3) F3.ring(L.x, L.y, { r0: 20, r1: 80, life: 0.4, w: 2, col: 'red' });
        } else if (L.phase === 3 || L.rushCount < CHG.cycle[L.phase]) {
          /* P3 連衝：短前搖再衝一次 */
          L.charge = { stage: 'windup', t: 0.5, ang: Math.atan2(P.y - L.y, P.x - L.x), rushT: 0 };
        }
      }
    }
  }

  function selfStun(L) {
    L.charge = null;
    L.rushCount = 0;
    L.stun = CHG.stun;
    L.restT = CHG.rest;
    var F = fxAPI();
    if (F) {
      F.burst(L.x, L.y, { n: 26, spd: [80, 320], life: [0.3, 0.8], size: [1.4, 3.2], col: 'red', drag: 3 });
      F.ring(L.x, L.y, { r0: 30, r1: 180, life: 0.5, w: 4, col: 'white' });
      F.shake(9, 380);
      F.sfx('kill');
    }
    if (typeof float === 'function') float(L.x, L.y - 70, '撞牆暈眩', '#ffd166');
    if (typeof toast === 'function') toast(L.name + ' 撞牆暈眩 —— 破綻！', 'gold');
  }

  function knockback(P, ang, amount) {
    P.kbT = 0.3;
    P.kbVX = Math.cos(ang) * (amount / 0.3);
    P.kbVY = Math.sin(ang) * (amount / 0.3);
  }

  /* ---------------- 3g. SE 洋流場（§2） ---------------- */
  function startField(L) {
    L.field = { t: FLD.dur, ringT: 0, pulseT: FLD.pulseInt, jellyT: FLD.jellyInt };
    var F = fxAPI();
    if (F) {
      F.ring(L.x, L.y, { r0: 30, r1: FLD.r[L.phase], life: 0.7, w: 4, col: 'cyan' });
      F.flash('rgba(80,255,190,.10)', 320);
      F.shake(4, 240);
      F.sfx('wave');
    }
    if (typeof tone === 'function') tone(60, 1.6, 'sine', 0.12, 30);
    if (typeof float === 'function') float(L.x, L.y - 70, '洋流場', '#8dffc8');
  }

  function stepField(L, dt, P) {
    var f = L.field;
    if (!f) return;
    f.t -= dt;
    var dx = L.x - P.x, dy = L.y - P.y, dd = Math.hypot(dx, dy) || 1;
    var R = FLD.r[L.phase];
    if (dd < R) {
      /* 向心（流向＝朝向巨獸） */
      var pull = FLD.pull[L.phase] * (1 - dd / (R * 2)) * dt;
      P.x += dx / dd * pull;
      P.y += dy / dd * pull;
      /* P2 切向渦流 */
      if (L.phase >= 2) {
        var ang = Math.atan2(P.y - L.y, P.x - L.x) + FLD.tangent * dt;
        P.x = L.x + Math.cos(ang) * dd;
        P.y = L.y + Math.sin(ang) * dd;
      }
      /* 環形彈 8 發／2.5s（傷害 1） */
      f.ringT -= dt;
      if (f.ringT <= 0) {
        f.ringT = FLD.ringInt;
        ringBurst(L, FLD.ring, 150, 1);
      }
      /* P2 水壓脈衝 */
      if (L.phase >= 2) {
        f.pulseT -= dt;
        if (f.pulseT <= 0) {
          f.pulseT = FLD.pulseInt;
          if (dd < FLD.pulseR && typeof hurtPlayer === 'function') hurtPlayer(FLD.pulseDmg);
          var F = fxAPI();
          if (F) { F.ring(L.x, L.y, { r0: FLD.pulseR * 0.4, r1: FLD.pulseR, life: 0.35, w: 3, col: 'green' }); F.shake(4, 200); }
        }
      }
      /* P3 生水母 */
      if (L.phase >= 3) {
        f.jellyT -= dt;
        if (f.jellyT <= 0) { f.jellyT = FLD.jellyInt; spawnJelly(L); }
      }
    }
    if (f.t <= 0) L.field = null;
  }

  function ringBurst(L, n, spd, dmg) {
    var off = L.t * 0.6;
    for (var i = 0; i < n; i++) spawnProj('slow', L, off + i / n * Math.PI * 2, { spd: spd, dmg: dmg, life: 5 });
    var F = fxAPI();
    if (F) { F.ring(L.x, L.y, { r0: 26, r1: 78, life: 0.22, w: 2.2, col: 'green' }); F.sfx('crit'); }
  }

  function spawnJelly(L) {
    if (!hasSea() || !Array.isArray(sea.hazards)) return;
    var a = rndf(0, Math.PI * 2), dd = rndf(60, 140);
    sea.hazards.push({
      type: 'jelly', x: L.x + Math.cos(a) * dd, y: L.y + Math.sin(a) * dd,
      hp: 2, maxhp: 2, aggr: 1.1, dmgMul: 1, t: rndf(0, 6), cool: rndf(1, 2),
      ang: 0, r: 17, alive: true, hit: 0, flee: 0, summons: L.id
    });
    var F = fxAPI();
    if (F) { F.ring(L.x + Math.cos(a) * dd, L.y + Math.sin(a) * dd, { r0: 4, r1: 34, life: 0.3, w: 2, col: 'green' }); }
  }

  /* ---------------- 3h. 彈幕框架（§3） ---------------- */
  var proj = [];

  function spawnProj(type, L, ang, o) {
    o = o || {};
    if (proj.length >= PROJ_CAP) proj.shift();     /* 同屏上限：超過就讓最舊的消失 */
    if (type === 'homing') {
      var hn = 0;
      for (var i = 0; i < proj.length; i++) if (proj[i].alive && proj[i].type === 'homing') hn++;
      if (hn >= HOMING_CAP) return null;
    }
    var cfg = BUL[type];
    var spd = (o.spd != null) ? o.spd : rndf(cfg.spd[0], cfg.spd[1]);
    var p = {
      type: type,
      x: L.x + Math.cos(ang) * 34, y: L.y + Math.sin(ang) * 34,
      vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
      r: cfg.r, dmg: (o.dmg != null) ? o.dmg : cfg.dmg,
      life: (o.life != null) ? o.life : cfg.life,
      turn: type === 'homing' ? ((o.turn != null) ? o.turn : rndf(cfg.turn[0], cfg.turn[1])) : 0,
      hp: type === 'homing' ? HOM.hp : 0,
      explodeR: type === 'homing' ? HOM.explodeR : 0,
      owner: L.id, alive: true, warn: type === 'homing' ? 0.4 : 0
    };
    proj.push(p);
    return p;
  }

  function fireFast(L, aim) {
    spawnProj('fast', L, aim);
    var F = fxAPI();
    if (F) F.sfx('shoot');
    if (typeof tone === 'function') tone(980, 0.05, 'square', 0.04, 500);
  }
  function fireSlow(L, aim) {
    spawnProj('slow', L, aim);
    var F = fxAPI();
    if (F) { F.ring(L.x, L.y, { r0: 16, r1: 44, life: 0.18, w: 2, col: 'orange' }); F.sfx('crit'); }
    if (typeof tone === 'function') tone(110, 0.18, 'sawtooth', 0.05, 50);
  }

  function updateProjectiles(dt) {
    if (!hasSea()) return;
    var P = sea.player;
    var R = (typeof baseRadius === 'function') ? baseRadius() : 170;
    /* 衝撞擊退位移 */
    if (P.kbT > 0) {
      P.kbT -= dt;
      P.x += (P.kbVX || 0) * dt;
      P.y += (P.kbVY || 0) * dt;
    }
    if (!proj.length) return;
    for (var i = 0; i < proj.length; i++) {
      var p = proj[i];
      if (!p.alive) continue;
      if (p.type === 'homing') {
        if (p.warn > 0) p.warn -= dt;
        /* 追蹤轉向（§3 turn 1.8–2.6 rad/s） */
        var want = Math.atan2(P.y - p.y, P.x - p.x);
        var cur = Math.atan2(p.vy, p.vx);
        var diff = wrapA(want - cur);
        var maxT = p.turn * dt;
        cur += Math.max(-maxT, Math.min(maxT, diff));
        var sp = Math.hypot(p.vx, p.vy);
        p.vx = Math.cos(cur) * sp; p.vy = Math.sin(cur) * sp;
        /* 可被魚槍打掉（hp 1、r 10） */
        if (Array.isArray(sea.bullets)) {
          for (var j = 0; j < sea.bullets.length; j++) {
            var b = sea.bullets[j];
            if (!b || !b.alive) continue;
            if (dist(b.x, b.y, p.x, p.y) < p.r + 8) {
              b.alive = false;
              p.hp -= 1;
              if (p.hp <= 0) { explodeHoming(p); break; }
            }
          }
        }
        if (!p.alive) continue;
      }
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt;

      if (p.life <= 0) { if (p.type === 'homing') explodeHoming(p); else p.alive = false; continue; }
      if (Math.abs(p.x) > 3600 || Math.abs(p.y) > 3600) { p.alive = false; continue; }
      /* 基地護盾吸收 */
      if (Math.hypot(p.x, p.y) < R) {
        p.alive = false;
        if (typeof sfx === 'function') sfx('shield');
        continue;
      }
      /* 玩家判定 */
      var hitR = (p.type === 'homing') ? p.explodeR : (p.r + 16);
      if (dist(P.x, P.y, p.x, p.y) < hitR) {
        if (p.type === 'homing') explodeHoming(p);
        else {
          if (typeof hurtPlayer === 'function') hurtPlayer(p.dmg);
          p.alive = false;
          var F = fxAPI();
          if (F) { F.burst(p.x, p.y, { n: 6, spd: [80, 260], life: [0.15, 0.4], size: [1.2, 2.6], col: p.type === 'fast' ? 'cyan' : 'orange', drag: 3 }); }
        }
      }
    }
    if (proj.some(function (x) { return !x.alive; })) {
      proj = proj.filter(function (x) { return x.alive; });
    }
  }

  function explodeHoming(p) {
    if (!p.alive) return;
    p.alive = false;
    if (!hasSea()) return;
    var P = sea.player;
    if (dist(P.x, P.y, p.x, p.y) < p.explodeR && typeof hurtPlayer === 'function') hurtPlayer(HOM.dmg);
    var F = fxAPI();
    if (F) {
      F.burst(p.x, p.y, { n: 18, spd: [80, 320], life: [0.2, 0.6], size: [1.4, 3.2], col: 'orange', drag: 3.2 });
      F.ring(p.x, p.y, { r0: 8, r1: p.explodeR, life: 0.28, w: 3, col: 'orange' });
      F.shake(3, 160);
      F.sfx('boom');
    }
  }

  function wrapA(a) {
    return ((a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  }

  function distPointSeg(px, py, x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var len2 = dx * dx + dy * dy || 1;
    var t = ((px - x1) * dx + (py - y1) * dy) / len2;
    t = t < 0 ? 0 : (t > 1 ? 1 : t);
    var cx = x1 + t * dx, cy = y1 + t * dy;
    return Math.hypot(px - cx, py - cy);
  }

  /* ---------------- 4. 子彈命中（核心 ×1.0、身體 ×0.3） ---------------- */
  function corePosX(L) { return L.x + Math.cos(L.t * 1.2) * CORE_SWAY; }
  function corePosY(L) { return L.y - 10; }

  function hitByBullets(L) {
    if (!hasSea() || !Array.isArray(sea.bullets)) return;
    var cx = corePosX(L), cy = corePosY(L);
    /* §3 玩家命中判定放寬：敵人判定半徑 +5 */
    var stunMul = L.stun > 0 ? CHG.stunDmgMul : 1;
    for (var i = 0; i < sea.bullets.length; i++) {
      var b = sea.bullets[i];
      if (!b || !b.alive) continue;
      var isCore = dist(cx, cy, b.x, b.y) < CORE_R + 11;
      var isBody = !isCore && dist(L.x, L.y, b.x, b.y) < L.r + 11;
      if (!isCore && !isBody) continue;
      b.alive = false;
      var dmg = Math.max(0.1, (b.dmg || 1) * (isCore ? CORE_MUL : BODY_MUL) * stunMul);
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
    var hint = '';
    if (L.phase === 2) hint = { beam: ' — 光束加速、追加交叉掃射', homing: ' — 導彈三連發', charge: ' — 衝刺後留毒霧', current: ' — 追加切向渦流與水壓脈衝' }[L.mode] || '';
    if (L.phase === 3) hint = { beam: ' — 雙光束交叉', homing: ' — 導彈四連發', charge: ' — 連續兩次衝撞', current: ' — 流速加快、召喚水母' }[L.mode] || '';
    if (typeof toast === 'function') toast(L.name + ' 進入第 ' + L.phase + ' 階段' + hint, 'gold');
  }

  /* ---------------- 5. 擊殺與掉落（不呼叫 killSeaBoss，避免重複計算） ---------------- */
  function killL(L) {
    L.alive = false;
    L.hp = 0;
    L.beams.length = 0;
    L.field = null;
    L.charge = null;
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
      drawBeamsAndField(ctx, L, cam, vw, vh);
      if (cam && (L.x < cam.x - 320 || L.x > cam.x + vw + 320 || L.y < cam.y - 320 || L.y > cam.y + vh + 320)) continue;
      drawOne(ctx, L);
    }
    drawProjectiles(ctx);
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

  /* 光束前搖／掃射＋洋流場（世界座標；順便做畫面外剔除） */
  function drawBeamsAndField(ctx, L, cam, vw, vh) {
    var t = L.t;
    /* 洋流場 */
    if (L.field) {
      var R = FLD.r[L.phase];
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(140,255,210,.18)';
      ctx.lineWidth = 2;
      ctx.setLineDash([22, 16]);
      ctx.lineDashOffset = -t * 70;
      ctx.beginPath(); ctx.arc(L.x, L.y, R, 0, 6.2832); ctx.stroke();
      ctx.strokeStyle = 'rgba(140,255,210,.10)';
      ctx.beginPath(); ctx.arc(L.x, L.y, R * 0.62, 0, 6.2832); ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(140,255,210,.16)';
      ctx.lineWidth = 1.6;
      for (var i = 0; i < 12; i++) {
        var a = i / 12 * 6.2832 + t * 0.6;
        ctx.beginPath();
        ctx.moveTo(L.x + Math.cos(a) * R, L.y + Math.sin(a) * R);
        ctx.lineTo(L.x + Math.cos(a) * (R * 0.72), L.y + Math.sin(a) * (R * 0.72));
        ctx.stroke();
      }
      ctx.restore();
    }
    /* 光束 */
    if (!L.beams || !L.beams.length) return;
    for (var bi = 0; bi < L.beams.length; bi++) {
      var b = L.beams[bi];
      var ex = L.x + Math.cos(b.ang) * BEAM.len, ey = L.y + Math.sin(b.ang) * BEAM.len;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (b.stage === 'charge') {
        var prog = 1 - b.t / BEAM.windup;
        var thick = b.t > 0.5 ? 2 : (2 + (0.5 - b.t) * 60);   /* 前 0.9s 細線、最後 0.5s 增粗 */
        ctx.strokeStyle = 'rgba(142,230,255,' + (0.10 + 0.5 * prog).toFixed(3) + ')';
        ctx.lineWidth = thick;
        ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.fillStyle = 'rgba(180,240,255,' + (0.2 + 0.6 * prog).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(L.x, L.y, 6 + 14 * prog, 0, 6.2832); ctx.fill();
      } else {
        var w = BEAM.width;
        ctx.strokeStyle = 'rgba(120,220,255,.16)';
        ctx.lineWidth = w * 2.4;
        ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = 'rgba(160,240,255,.55)';
        ctx.lineWidth = w * 1.15;
        ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(ex, ey); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.95)';
        ctx.lineWidth = w * 0.42;
        ctx.beginPath(); ctx.moveTo(L.x, L.y); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.restore();
    }
  }

  /* 巨獸彈幕（fast／slow／homing 三種一眼可辨） */
  function drawProjectiles(ctx) {
    if (!proj.length) return;
    var cam = hasSea() ? sea.cam : null;
    var vw = (typeof VW === 'number') ? VW : 1280;
    var vh = (typeof VH === 'number') ? VH : 800;
    for (var i = 0; i < proj.length; i++) {
      var p = proj[i];
      if (!p.alive) continue;
      if (cam && (p.x < cam.x - 80 || p.x > cam.x + vw + 80 || p.y < cam.y - 80 || p.y > cam.y + vh + 80)) continue;
      var ang = Math.atan2(p.vy, p.vx);
      ctx.save();
      if (p.type === 'fast') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(200,245,255,.85)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(p.x - Math.cos(ang) * 16, p.y - Math.sin(ang) * 16);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.fillStyle = '#eaffff';
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.2832); ctx.fill();
      } else if (p.type === 'slow') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,120,80,.22)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 18, 0, 6.2832); ctx.fill();
        ctx.fillStyle = 'rgba(255,190,120,.9)';
        ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, 6.2832); ctx.fill();
        ctx.fillStyle = '#fff3e0';
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, 6.2832); ctx.fill();
      } else if (p.type === 'homing') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.strokeStyle = 'rgba(255,110,90,.55)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(p.x - Math.cos(ang) * 22, p.y - Math.sin(ang) * 22);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.fillStyle = '#ff8a5c';
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -5); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,220,180,.9)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-6, -5); ctx.lineTo(-6, 5); ctx.closePath(); ctx.stroke();
        if (p.warn > 0) {
          ctx.strokeStyle = 'rgba(255,120,90,.7)';
          ctx.setLineDash([5, 5]);
          ctx.beginPath(); ctx.arc(0, 0, 22, 0, 6.2832); ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      ctx.restore();
    }
  }

  function drawOne(ctx, L) {
    var P = PAL[L.phase] || PAL[1];
    var t = L.t;
    var hf = L.hit > 0 ? Math.min(1, L.hit / 0.16) : 0;
    var dash = !!(L.charge && L.charge.stage === 'rush');
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
    /* v0.8：模式標籤（讓玩家／QA 一眼分辨四隻） */
    ctx.font = '600 9px "Microsoft JhengHei",system-ui';
    ctx.fillStyle = PAT_COL[L.pattern] || '#8ee6ff';
    ctx.fillText(PAT_LABEL[L.mode] || '', L.x, by - 21);
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
  var api = {
    reset: reset,
    update: update,
    draw: draw,
    spawn: spawn,
    list: list
  };
  /* QA 讀彈幕用（non-enumerable，正式介面仍 5 個 key） */
  Object.defineProperty(api, 'proj', {
    enumerable: false,
    get: function () { return proj; }
  });
  window.LEVIATHANS = api;
})();
