'use strict';
/* =========================================================
   逃出大海 — 第一幕：大海（收集 / 生存 / 基地 / BOT）
   ========================================================= */

const WORLD_LIMIT = 4000;
const sea = {
  player: { x: 1500, y: 1100, vx: 0, vy: 0, hp: 100, ox: 100, st: 100, ang: 0, inv: 0, cool: 0, t: 0 },
  cam: { x: 0, y: 0 },
  aim: { x: 0, y: 0 },
  pickups: [], hazards: [], bullets: [], ebullets: [], floats: [], parts: [], beams: [],
  specks: [], fish: [], bots: [], shieldHits: [], bosses: [],
  t: 0, spawnT: 0, hazT: 6, baseT: 0, tick: 0, shake: 0,
  hazSpawned: 0, dead: false, safeT: 0, wasSafe: false
};

/* 距離基地越遠 → 資源越豐富、怪物越多越兇（v0.8 密度見 DIFFICULTY §1） */
function seaZone(d) {
  if (d < 800)  return { id: 0, name: '近海', mult: 1,   hazCap: 3,  aggr: 1,    color: '#8ee6a4', tip: '資源 ×1 · 威脅低', spawnMin: 4.2, spawnMax: 5.8, comp: [0.50, 0.75] };
  if (d < 1600) return { id: 1, name: '外海', mult: 1.3, hazCap: 6,  aggr: 1.12, color: '#6fe3ff', tip: '資源 ×1.3 · 威脅中', spawnMin: 3.6, spawnMax: 5.0, comp: [0.45, 0.75] };
  if (d < 2600) return { id: 2, name: '深海', mult: 1.6, hazCap: 10, aggr: 1.26, color: '#ffd166', tip: '資源 ×1.6 · 威脅高', spawnMin: 1.5, spawnMax: 2.1, comp: [0.40, 0.80] };
  return { id: 3, name: '遠洋', mult: 2.0, hazCap: 12, aggr: 1.42, color: '#ff9aa8', tip: '資源 ×2 · 極度危險', spawnMin: 1.1, spawnMax: 1.6, comp: [0.35, 0.80] };
}

const BOSS_SPOTS = [
  { id: 'nw', name: '西北守衛', x: -2400, y: -2400 },
  { id: 'ne', name: '東北守衛', x: 2400, y: -2400 },
  { id: 'sw', name: '西南守衛', x: -2400, y: 2400 },
  { id: 'se', name: '東南守衛', x: 2400, y: 2400 }
];

const PTYPES = [['plastic', 40], ['wood', 26], ['metal', 22], ['air', 7], ['crate', 5]];
function weightedPickupType() {
  const total = PTYPES.reduce((s, p) => s + p[1], 0);
  let r = Math.random() * total;
  for (const [k, w] of PTYPES) { if ((r -= w) <= 0) return k; }
  return 'plastic';
}

/* ---------- init ---------- */
function initSea(fresh) {
  const S = calcStats(), P = sea.player;
  P.x = game.pos.x; P.y = game.pos.y;
  P.hp = S.maxhp; P.ox = S.maxox; P.st = 100;
  P.vx = P.vy = 0; P.ang = -0.6; P.inv = 2.5; P.cool = 0;
  sea.pickups = []; sea.hazards = []; sea.bullets = []; sea.ebullets = [];
  sea.floats = []; sea.beams = []; sea.shieldHits = [];
  sea.bots = []; sea.fish = [];
  sea.t = 0; sea.spawnT = 0; sea.hazT = 8; sea.baseT = 0; sea.tick = 0;
  sea.hazSpawned = 0;
  sea.shake = 0; sea.dead = false;
  sea.cam.x = P.x - VW / 2; sea.cam.y = P.y - VH / 2;
  sea.specks = [];
  for (let i = 0; i < 90; i++) {
    sea.specks.push({ x: rnd(0, VW), y: rnd(0, VH), r: rnd(0.6, 2.2), v: rnd(6, 26), a: rnd(0.08, 0.3) });
  }
  for (let i = 0; i < 16; i++) sea.fish.push(newFish(true));
  sea.bosses = BOSS_SPOTS.filter(b => !game.bossesKilled.includes(b.id)).map(b => ({
    id: b.id, name: b.name, x: b.x, y: b.y,
    hp: 20, maxhp: 20, alive: true, t: rnd(0, 6), cool: rnd(1.5, 3),
    ang: 0, r: 46, hit: 0
  }));
  syncBots();
  /* D 的巨獸檔（js/leviathan.js）：不存在時跳過 */
  if (window.LEVIATHANS && typeof LEVIATHANS.reset === 'function') LEVIATHANS.reset();
  /* D 的海域事件／裂縫（js/events.js）：不存在時跳過 */
  if (window.SEA_EVENTS && typeof SEA_EVENTS.reset === 'function') SEA_EVENTS.reset();
}

function newFish(initial) {
  const P = sea.player;
  const a = rnd(0, Math.PI * 2), d = initial ? rnd(120, 1100) : rnd(900, 1500);
  return {
    x: P.x + Math.cos(a) * d, y: P.y + Math.sin(a) * d,
    ang: rnd(0, 6.3), sp: rnd(22, 55), size: rnd(5, 13), ph: rnd(0, 6.3), wob: rnd(0.6, 1.8)
  };
}

/* ---------- spawning ---------- */
function spawnPickup(initial) {
  const P = sea.player;
  const a = rnd(0, Math.PI * 2);
  const d = initial ? rnd(170, 780) : rnd(420, 860);
  const type = weightedPickupType();
  sea.pickups.push({
    x: P.x + Math.cos(a) * d, y: P.y + Math.sin(a) * d,
    type, t: rnd(0, 7), r: type === 'crate' ? 24 : 17, alive: true
  });
}

function spawnHazard() {
  const P = sea.player;
  const a = rnd(0, Math.PI * 2), d = rnd(520, 920);
  const Z = seaZone(Math.hypot(P.x, P.y));
  const comp = Z.comp || [0.50, 0.85];
  const r = Math.random();
  const type = r < comp[0] ? 'shark' : r < comp[1] ? 'drone' : 'jelly';
  let x = P.x + Math.cos(a) * d, y = P.y + Math.sin(a) * d;
  /* 不要生在安全圈內 */
  const R = baseRadius();
  if (Math.hypot(x, y) < R + 80) {
    const b = Math.atan2(y, x);
    x = Math.cos(b) * (R + 120); y = Math.sin(b) * (R + 120);
  }
  const hp = Math.round((type === 'shark' ? 3 : 2) * (1 + Z.id * 0.35) * ngMul('enemyHp'));
  sea.hazards.push({
    type, x, y, hp, maxhp: hp, aggr: Z.aggr * ngMul('aggr'), dmgMul: (1 + Z.id * 0.14) * ngMul('enemyDmg'),
    homing: type === 'shark' && Z.id === 1 && Math.random() < 0.15,
    shootT: rnd(1.5, 3.5),
    t: rnd(0, 6), cool: rnd(1, 2.4), ang: 0, r: type === 'shark' ? 20 : 17, alive: true, hit: 0, flee: 0, empT: 0
  });
  sea.hazSpawned = (sea.hazSpawned || 0) + 1;
}

/* v0.8 海面敵彈：fast／slow／homing 共用一個推入器，同屏上限 120 */
function pushEBullet(o) {
  if (sea.ebullets.length >= 120) return false;
  if (o.homing && sea.ebullets.filter(b => b.homing).length >= 8) return false;
  sea.ebullets.push(o);
  return true;
}

/* ---------- helpers ---------- */
function currentAt(x, y, t) {
  const a = Math.sin(x * 0.0011 + t * 0.3) + Math.cos(y * 0.0014 - t * 0.22);
  return { x: Math.cos(y * 0.001 + t * 0.15) * 20 * a, y: Math.sin(x * 0.0013 - t * 0.18) * 18 * a };
}
function float(x, y, text, color) {
  const F = fxAPI();
  if (F && typeof F.text === 'function') {
    F.text(x, y, text, { col: color || '#dff4ff', size: 15, rise: 26, life: 1.3 });
    return;
  }
  sea.floats.push({ x, y, text, color: color || '#dff4ff', life: 1.3, max: 1.3 });
}
function burst(x, y, n, color, spd) {
  const F = fxAPI();
  if (F && typeof F.burst === 'function') {
    F.burst(x, y, { n, spd: [20, spd || 140], life: [0.4, 0.9], size: [1.5, 4], col: fxCol(color) });
    return;
  }
  for (let i = 0; i < n; i++) {
    const a = rnd(0, Math.PI * 2), s = rnd(20, spd || 140);
    sea.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.4, 0.9), max: 0.9, size: rnd(1.5, 4), color: color || '#9fe8ff' });
  }
}
sea.burst = burst;

/* ---------- v0.4 FX 橋接（js/fx.js 存在時走粒子池；缺席時退回舊 canvas 粒子） ---------- */
function fxAPI() { return (typeof window !== 'undefined' && window.fx) ? window.fx : null; }
/* 舊 burst/float 的色票 → fx 粒子 token（粒子只吃固定 8 色） */
function fxCol(c) {
  if (!c) return 'cyan';
  const s = String(c).toLowerCase();
  if (s.indexOf('ffd') >= 0 || s.indexOf('ffe') >= 0) return 'gold';
  if (s.indexOf('ffb3') >= 0) return 'orange';
  if (s.indexOf('ff9a') >= 0 || s.indexOf('ff8') >= 0 || s.indexOf('ff6') >= 0 || s.indexOf('ff5d') >= 0 || s.indexOf('ff4') >= 0) return 'red';
  if (s.indexOf('c9a') >= 0 || s.indexOf('c3a') >= 0 || s.indexOf('b892') >= 0) return 'violet';
  if (s.indexOf('8ee6') >= 0 || s.indexOf('c8ff') >= 0) return 'green';
  if (s.indexOf('6fe3') >= 0 || s.indexOf('9fe8') >= 0 || s.indexOf('dff4') >= 0 || s.indexOf('9ff4') >= 0 ||
      s.indexOf('bdf3') >= 0 || s.indexOf('bfe9') >= 0 || s.indexOf('190') >= 0) return 'cyan';
  if (s.indexOf('7fd') >= 0) return 'blue';
  return 'white';
}
function fxLin(key, fn) { const F = fxAPI(); return (F && F.grad && F.grad.lin) ? F.grad.lin(key, fn) : fn(); }
function fxRad(key, fn) { const F = fxAPI(); return (F && F.grad && F.grad.rad) ? F.grad.rad(key, fn) : fn(); }
function shakeSea(px, ms) {
  if (game.settings.reduceMotion) return;
  const F = fxAPI();
  if (F && typeof F.shake === 'function') { F.shake(px, ms || 160); return; }
  sea.shake = Math.min(22, (sea.shake || 0) + px);
}
function fxRing(x, y, r1, col, life) {
  const F = fxAPI();
  if (F && typeof F.ring === 'function') F.ring(x, y, { r0: 3, r1: r1 || 36, life: life || 0.26, w: 2, col: col || 'white' });
}
function fxSpark(x, y, opts) {
  const F = fxAPI();
  if (F && typeof F.spark === 'function') F.spark(x, y, opts || {});
}

function playerInSafe() {
  return Math.hypot(sea.player.x, sea.player.y) < baseRadius();
}

function hurtPlayer(n) {
  const P = sea.player;
  if (P.inv > 0 || sea.dead) return;
  if (playerInSafe()) return;
  P.hp -= n;
  P.inv = 1.4;
  shakeSea(7, 180);
  sfx('hurt');
  sfx('hit');
  float(P.x, P.y - 20, '-' + n, '#ff8f8f');
  burst(P.x, P.y, 8, '#ff9a8b', 120);
  fxSpark(P.x, P.y, { n: 5, col: 'red', spd: [90, 240] });
  const F = fxAPI();
  if (F && typeof F.flash === 'function') F.flash('#ff4050', 140);
  renderHearts(P.hp, calcStats().maxhp);
  if (P.hp <= 0) { P.hp = 0; seaDeath(); }
}

function seaDeath() {
  if (sea.dead) return;
  sea.dead = true;
  game.stats.deaths++;
  /* 挑戰「一命深海」：死亡直接結算，不重生 */
  if (game.challenge && game.challenge.id === 'iron') { challengeEnd(false); return; }
  sfx('lose');
  const lost = Math.floor((game.res.plastic || 0) * 0.15);
  game.res.plastic -= lost;
  saveGame();
  openModal(t('sea.death.title'), `<p class="muted">${t('sea.death.body')}</p>
    <p class="muted" style="margin-top:10px">${t('sea.death.lost', { n: lost })}</p>`,
    [{ label: t('sea.death.btn'), cls: 'primary', onClick: respawnAtBase }]);
}

function respawnAtBase() {
  const S = calcStats(), P = sea.player;
  P.hp = S.maxhp * 0.6; P.ox = S.maxox; P.st = 100;
  P.x = 0; P.y = 60; P.vx = P.vy = 0; P.inv = 3;
  sea.hazards.length = 0;
  sea.dead = false;
  sea.cam.x = P.x - VW / 2; sea.cam.y = P.y - VH / 2;
  saveGame();
}

/* ---------- collect ---------- */
function collectPickup(p) {
  if (!p.alive) return;
  p.alive = false;
  const S = calcStats();
  const Z = seaZone(Math.hypot(p.x, p.y));
  if (p.type === 'crate') {
    for (let i = 0; i < 3; i++) {
      const k = pick(['plastic', 'wood', 'metal']);
      addRes(k, Math.max(2, Math.round(rnd(3, 6) * Z.mult)));
    }
    if (Math.random() < 0.6 + Z.id * 0.08) addRes('alloy', Math.max(1, Math.round(Z.id * 0.6)));
    float(p.x, p.y, t('sea.crate'), '#ffe28a');
    burst(p.x, p.y, 12, '#ffd166', 150);
    fxRing(p.x, p.y, 54, 'gold', 0.32);
    fxSpark(p.x, p.y, { n: 6, col: 'gold', spd: [120, 300] });
    sfx('build');
  } else if (p.type === 'air') {
    sea.player.ox = Math.min(S.maxox, sea.player.ox + 30);
      float(p.x, p.y, t('sea.air'), '#8ff3ff');
    fxRing(p.x, p.y, 30, 'cyan', 0.24);
    sfx('air');
  } else {
    const base = (p.type === 'alloy') ? 1 : 2;
    const amt = Math.max(1, Math.round(base * Z.mult));
    addRes(p.type, amt);
    game.stats.collected += amt;
    if (p.type === 'plastic') {
      game.stats.plasticCollected = (game.stats.plasticCollected || 0) + amt;
      bountyOn('salvage', amt);
    }
    float(p.x, p.y, '+' + amt + ' ' + RESMETA[p.type].name + (Z.id ? ' ×' + Z.mult : ''), RESMETA[p.type].color);
    burst(p.x, p.y, 4, RESMETA[p.type].color, 80);
    fxRing(p.x, p.y, p.type === 'alloy' ? 34 : 26, RESMETA[p.type].color, 0.22);
    sfx('pick');
  }
  refreshHud();
}

/* ---------- base automation ---------- */
function baseTick() {
  sea.tick++;
  const inc = baseIncomePer5();
  let any = false;
  for (const k in inc) if (inc[k]) { addRes(k, Math.max(1, Math.round(inc[k] * ngMul('income')))); any = true; }
  if (sea.tick % 2 === 0) {
    const rev = countType('reverse');
    if (rev) { addRes('alloy', Math.max(1, Math.round(rev * ngMul('income')))); any = true; }
  }
  if (any && Math.hypot(sea.player.x, sea.player.y) < baseRadius() + 340) {
    float(rnd(-40, 40), -baseRadius() * 0.5, t('sea.baseprod'), '#8ee6a4');
  }
  refreshHud();
}

/* ---------- shooting ---------- */
function shootSea() {
  const P = sea.player, S = calcStats();
  if (P.cool > 0 || sea.dead) return;
  P.cool = S.fireRate;
  const ang = Math.atan2(sea.aim.y - P.y, sea.aim.x - P.x);
  /* §4 輕微吸附：1.2° 內最近敵人 */
  let aim = ang;
  let best = null, bestD = 1e9;
  for (const h of sea.hazards) {
    if (!h.alive) continue;
    const dx = h.x - P.x, dy = h.y - P.y, dd = Math.hypot(dx, dy);
    if (dd > 900) continue;
    let da = Math.atan2(dy, dx) - ang;
    da = ((da + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    if (Math.abs(da) <= 1.2 * Math.PI / 180 && dd < bestD) { bestD = dd; best = ang + da; }
  }
  if (best !== null) aim = best;
  const mods = bulletMods();
  sea.bullets.push({
    x: P.x + Math.cos(aim) * 18, y: P.y + Math.sin(aim) * 18,
    vx: Math.cos(aim) * 800, vy: Math.sin(aim) * 800, life: 0.85, dmg: S.dmg, ang: aim, alive: true,
    pierce: !!mods.pierce, blast: !!mods.blast, emp: !!mods.emp, hits: 0
  });
  sfx('shoot');
}

/* 爆裂模組：命中點半徑 56 內其他敵人吃 55%（第 2、3 次穿透命中不再觸發） */
function blastDamage(x, y, exclude, dmg) {
  for (const h of sea.hazards) {
    if (!h.alive || h === exclude) continue;
    if (Math.hypot(h.x - x, h.y - y) < 56) damageHazard(h, Math.max(1, Math.round(dmg * 0.55)), false);
  }
  fxRing(x, y, 56, 'gold', 0.24);
}

function damageHazard(h, dmg, fromTower) {
  h.hp -= dmg;
  h.hit = 0.15;
  float(h.x + rnd(-6, 6), h.y - h.r - 6, String(dmg), fromTower ? '#bdf3ff' : '#ffffff');
  fxSpark(h.x, h.y, { n: fromTower ? 4 : 3, col: 'white' });
  sfx('hit');
  if (h.hp <= 0) {
    h.alive = false;
    game.stats.kills++;
    if (h.type === 'shark') { game.stats.sharkKills = (game.stats.sharkKills || 0) + 1; bountyOn('cull', 1); }
    else if (h.type === 'drone') { game.stats.droneKills = (game.stats.droneKills || 0) + 1; bountyOn('drone', 1); }
    else game.stats.jellyKills = (game.stats.jellyKills || 0) + 1;
    burst(h.x, h.y, h.type === 'drone' ? 16 : 10, h.type === 'drone' ? '#c9a6ff' : '#ff9a8b', 180);
    fxRing(h.x, h.y, h.type === 'drone' ? 52 : 38, h.type === 'drone' ? 'violet' : 'red', 0.3);
    fxSpark(h.x, h.y, { n: 8, col: h.type === 'drone' ? 'violet' : 'red', spd: [140, 380] });
    sfx('boom');
    sfx('kill');
    if (h.type === 'drone') {
      const n = Math.max(1, Math.round((Math.random() < 0.4 ? 2 : 1) * ngMul('drop')));
      for (let i = 0; i < n; i++) {
        sea.pickups.push({ x: h.x + rnd(-14, 14), y: h.y + rnd(-14, 14), type: 'alloy', t: 0, r: 17, alive: true });
      }
    }
    if (!fromTower) shakeSea(4, 140);
  } else {
    burst(h.x, h.y, 3, '#ffffff', 70);
  }
}

function killSeaBoss(b) {
  b.alive = false;
  if (!game.bossesKilled.includes(b.id)) game.bossesKilled.push(b.id);
  game.tech = Math.min(4, game.tech + 1);
  addRes('metal', 10);
  addRes('alloy', 3);
  addRes('plastic', 8);
  game.stats.bosses = (game.stats.bosses || 0) + 1;
  game.stats.kills++;
  for (let i = 0; i < 46; i++) {
    burst(b.x + rnd(-50, 50), b.y + rnd(-50, 50), 3, i % 3 ? '#ffd166' : '#c9a6ff', 330);
  }
  shakeSea(16, 420);
  fxRing(b.x, b.y, 150, 'gold', 0.5);
  const F = fxAPI();
  if (F && typeof F.flash === 'function') F.flash('#ffd166', 180);
  sfx('kill');
  sfx('boom'); sfx('quest');
  toast(t('sea.bossKill', { name: t('boss.' + b.id), n: game.tech }), 'gold');
  if (game.tech >= 4) setTimeout(() => toast(t('sea.techFull'), 'gold'), 1400);
  saveGame();
  refreshHud();
}

function drawSeaBoss(b) {
  const t = sea.t;
  ctx.save();
  ctx.translate(b.x, b.y);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const g = fxRad('sea:bossGlow', () => {
    const g2 = ctx.createRadialGradient(0, 0, 10, 0, 0, 150);
    g2.addColorStop(0, 'rgba(180,120,255,.30)');
    g2.addColorStop(0.6, 'rgba(255,80,140,.10)');
    g2.addColorStop(1, 'rgba(120,60,220,0)');
    return g2;
  });
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fill();
  ctx.restore();

  /* 外環 */
  ctx.save();
  ctx.rotate(t * 0.35);
  ctx.strokeStyle = 'rgba(200,160,255,.55)';
  ctx.lineWidth = 5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 62, i * 2.1, i * 2.1 + 1.2);
    ctx.stroke();
  }
  ctx.restore();

  /* 觸手 */
  ctx.strokeStyle = 'rgba(150,110,220,.55)';
  ctx.lineWidth = 6;
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + t * 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * 34, Math.sin(a) * 34);
    ctx.quadraticCurveTo(
      Math.cos(a + 0.4) * 58, Math.sin(a + 0.4) * 58 + Math.sin(t * 2 + i) * 8,
      Math.cos(a + 0.18) * 80, Math.sin(a + 0.18) * 80
    );
    ctx.stroke();
  }

  /* 本體 */
  ctx.save();
  ctx.rotate(b.ang || 0);
  ctx.fillStyle = b.hit > 0 ? '#ffffff' : '#2a1f42';
  ctx.beginPath();
  ctx.moveTo(0, -42); ctx.lineTo(34, -20); ctx.lineTo(34, 20); ctx.lineTo(0, 42);
  ctx.lineTo(-34, 20); ctx.lineTo(-34, -20);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(210,170,255,.8)';
  ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();

  /* 核心 */
  const pulse = 0.6 + Math.sin(t * 4) * 0.4;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createRadialGradient(0, 0, 2, 0, 0, 40 * pulse);
  cg.addColorStop(0, 'rgba(255,230,255,.9)');
  cg.addColorStop(0.35, 'rgba(255,90,150,.7)');
  cg.addColorStop(1, 'rgba(255,60,120,0)');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(0, 0, 40 * pulse, 0, 7); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffd9e3';
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill();

  /* 血條 + 名稱 */
  const w = 96;
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.fillRect(-w / 2, -70, w, 6);
  ctx.fillStyle = '#ff5d73';
  ctx.fillRect(-w / 2, -70, w * clamp(b.hp / b.maxhp, 0, 1), 6);
  ctx.textAlign = 'center';
  ctx.font = '700 10px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(220,190,255,.9)';
  ctx.fillText(t('boss.' + b.id), 0, -78);
  ctx.restore();
}

/* ---------- update ---------- */
function updateSea(dt) {
  if (sea.dead) return;
  sea.t += dt;
  game.stats.time += dt;
  if (window.LEVIATHANS && typeof LEVIATHANS.update === 'function') LEVIATHANS.update(dt);
  if (window.SEA_EVENTS && typeof SEA_EVENTS.update === 'function') SEA_EVENTS.update(dt);
  const P = sea.player, S = calcStats(), keys = window.KEYS || {};
  const R = baseRadius();
  const dBase = Math.hypot(P.x, P.y);
  const inSafe = dBase < R;
  const Z = seaZone(dBase);
  /* 賞金巡弋：深海（id 2）以後累積，回基地/近海自然停止 */
  if (Z.id >= BOUNTY.patrolZone) { game.stats.deepSeconds += dt; bountyOn('patrol', dt); }

  /* movement */
  let ix = 0, iy = 0;
  if (keys['w'] || keys['arrowup']) iy--;
  if (keys['s'] || keys['arrowdown']) iy++;
  if (keys['a'] || keys['arrowleft']) ix--;
  if (keys['d'] || keys['arrowright']) ix++;
  if (ix || iy) { const m = Math.hypot(ix, iy); ix /= m; iy /= m; }

  const wantSprint = (keys['shift'] || keys['shiftleft'] || keys['shiftright']) && (ix || iy) && P.st > 1;
  const spd = S.speed * (wantSprint ? 1.75 : 1);
  P.vx = lerp(P.vx, ix * spd, 1 - Math.exp(-5 * dt));
  P.vy = lerp(P.vy, iy * spd, 1 - Math.exp(-5 * dt));

  const cur = currentAt(P.x, P.y, sea.t);
  P.x = clamp(P.x + (P.vx + cur.x) * dt, -WORLD_LIMIT, WORLD_LIMIT);
  P.y = clamp(P.y + (P.vy + cur.y) * dt, -WORLD_LIMIT, WORLD_LIMIT);
  P.t += dt;
  if (ix || iy) P.ang = lerpAngle(P.ang, Math.atan2(iy, ix), 1 - Math.exp(-7 * dt));

  if (wantSprint) P.st = Math.max(0, P.st - 30 * dt);
  else P.st = Math.min(100, P.st + 16 * dt);

  /* oxygen */
  P.ox = Math.max(0, P.ox - dt * 0.85 * S.oxRate);
  if (P.ox <= 0) {
    P.hp -= 3 * dt;
    if (P.hp <= 0) { seaDeath(); return; }
  }
  if (P.inv > 0) P.inv -= dt;
  if (P.cool > 0) P.cool -= dt;

  /* base refill */
  if (inSafe && !sea.wasSafe) {
    sea.wasSafe = true;
    float(P.x, P.y - 30, t('sea.safe'), '#8ee6a4');
    sfx('deposit');
  } else if (!inSafe && sea.wasSafe) {
    sea.wasSafe = false;
  }

  if (dBase < R) {
    P.ox = Math.min(S.maxox, P.ox + S.maxox * 0.55 * dt);
    P.st = 100;
    if (P.hp < S.maxhp) {
      P.hp = S.maxhp;
      renderHearts(P.hp, S.maxhp);
      float(P.x, P.y - 26, t('sea.repaired'), '#8ee6a4');
      sfx('deposit');
    }
    sea.safeT = 0.6;
  } else if (sea.safeT > 0) sea.safeT -= dt;

  /* camera */
  sea.cam.x = lerp(sea.cam.x, P.x - VW / 2, 1 - Math.exp(-6 * dt));
  sea.cam.y = lerp(sea.cam.y, P.y - VH / 2, 1 - Math.exp(-6 * dt));
  game.pos.x = P.x; game.pos.y = P.y;

  if (sea.shake > 0) sea.shake = Math.max(0, sea.shake - 22 * dt);

  /* base automation */
  sea.baseT += dt;
  while (sea.baseT >= 5) { sea.baseT -= 5; baseTick(); }
  refillBounties(dt);

  /* bots */
  updateBots(dt);
  updateBaseTowers(dt);

  /* pickups */
  sea.spawnT -= dt;
  const pMax = 13 + Z.id * 3;
  if (sea.spawnT <= 0 && sea.pickups.length < pMax) {
    spawnPickup(false);
    sea.spawnT = 0.95 / Z.mult;
  }
  for (const p of sea.pickups) {
    if (!p.alive) continue;
    p.t += dt;
    const dx = P.x - p.x, dy = P.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < S.magnet * 2.6) {
      const pull = (1 - d / (S.magnet * 2.6)) * 520;
      p.x += dx / d * pull * dt;
      p.y += dy / d * pull * dt;
    }
    if (d < 34) collectPickup(p);
    else if (d > 1600) p.alive = false;
  }
  if (sea.pickups.some(p => !p.alive)) sea.pickups = sea.pickups.filter(p => p.alive);

  /* hazards */
  sea.hazT -= dt;
  const nearBoss = (sea.bosses || []).some(b => b.alive && Math.hypot(P.x - b.x, P.y - b.y) < 1000);
  const hazLimit = nearBoss ? 2 : Z.hazCap;
  if (sea.hazT <= 0 && sea.hazards.length < hazLimit) {
    spawnHazard();
    sea.hazT = rnd(Z.spawnMin, Z.spawnMax) / Z.aggr;
  }

  for (const h of sea.hazards) {
    if (!h.alive) continue;
    h.t += dt;
    if (h.hit > 0) h.hit -= dt;
    if (h.flee > 0) h.flee -= dt;
    if (h.empT > 0) { h.empT -= dt; continue; }   /* 電磁模組：停擺 */

    /* 安全圈：物理阻擋 */
    const hb = Math.hypot(h.x, h.y);
    if (hb < R + h.r) {
      const b = Math.atan2(h.y, h.x);
      h.x = Math.cos(b) * (R + h.r + 6);
      h.y = Math.sin(b) * (R + h.r + 6);
      if (Math.random() < 0.25) {
        sea.shieldHits.push({ a: b + rnd(-0.12, 0.12), life: 0.42, max: 0.42, r: R });
        if (Math.random() < 0.3) sfx('shield');
        if (typeof baseHitFx === 'function') baseHitFx(h.x, h.y, b);
      }
      h.flee = 0.7;
    }

    const dx = P.x - h.x, dy = P.y - h.y;
    const d = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx);

    if (inSafe) {
      /* 玩家在安全圈：敵怪在外圍徘徊 / 後退 */
      const b = Math.atan2(h.y, h.x);
      h.x += Math.cos(b) * 34 * dt;
      h.y += Math.sin(b) * 34 * dt;
      h.ang = lerpAngle(h.ang || b, b, 1 - Math.exp(-3 * dt));
      continue;
    }

    const aggr = h.aggr || 1, dm = h.dmgMul || 1;
    if (h.type === 'shark') {
      const sp = (95 + Math.sin(h.t * 3) * 12) * aggr;
      h.x += Math.cos(ang) * sp * dt;
      h.y += Math.sin(ang) * sp * dt;
      h.ang = lerpAngle(h.ang || ang, ang, 1 - Math.exp(-5 * dt));
      if (d < 30) hurtPlayer(Math.max(1, Math.round(2 * dm)));
      /* 外海 shark 群偶爾追蹤彈（≤15%） */
      if (h.homing) {
        h.shootT -= dt;
        if (h.shootT <= 0 && d < 700) {
          h.shootT = rnd(3.0, 5.0) / aggr;
          const spd = rnd(210, 250);
          pushEBullet({ x: h.x, y: h.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 4.5, r: 7, dmg: 4, type: 'homing', speed: spd, homing: true, turn: rnd(1.8, 2.6), alive: true });
          tone(320, 0.16, 'triangle', 0.07, 180);
        }
      }
      if (Math.random() < 0.4) burst(h.x - Math.cos(h.ang) * 16, h.y - Math.sin(h.ang) * 16, 1, '#bfe9ff', 40);
    } else if (h.type === 'drone') {
      const want = 330;
      const dir = d > want + 50 ? 1 : d < want - 50 ? -1 : 0;
      h.x += Math.cos(ang) * dir * 74 * aggr * dt + Math.cos(ang + Math.PI / 2) * Math.sin(h.t * 0.9) * 46 * dt;
      h.y += Math.sin(ang) * dir * 74 * aggr * dt + Math.sin(ang + Math.PI / 2) * Math.sin(h.t * 0.9) * 46 * dt;
      h.cool -= dt;
      if (h.cool <= 0 && d < 760) {
        h.cool = 2.3 / aggr;
        const spd = rnd(480, 520);   /* v0.8 fast */
        pushEBullet({ x: h.x, y: h.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 3, r: 6, dmg: 4, type: 'fast', speed: spd, alive: true });
        tone(240, 0.12, 'sawtooth', 0.08, 120);
      }
      if (d < 42) hurtPlayer(Math.max(1, Math.round(1 * dm)));
    } else {
      const c = currentAt(h.x, h.y, sea.t);
      h.x += Math.cos(h.t * 0.7) * 12 * dt + c.x * 0.6 * dt;
      h.y += Math.sin(h.t * 0.95) * 12 * dt + c.y * 0.6 * dt;
      h.cool -= dt;
      if (h.cool <= 0 && d < 720) {
        h.cool = rnd(3.2, 4.6) / aggr;
        const spd = rnd(140, 180);   /* v0.8 slow */
        pushEBullet({ x: h.x, y: h.y, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd, life: 6, r: 9, dmg: 6, type: 'slow', speed: spd, alive: true });
        tone(120, 0.25, 'sine', 0.06, 60);
      }
      if (d < 34) hurtPlayer(Math.max(1, Math.round(1 * dm)));
    }
    if (d > 1600) h.alive = false;
  }
  if (sea.hazards.some(h => !h.alive)) sea.hazards = sea.hazards.filter(h => h.alive);

  /* 四角守衛 */
  for (const b of sea.bosses) {
    if (!b.alive) continue;
    b.t += dt;
    if (b.hit > 0) b.hit -= dt;
    const bdx = P.x - b.x, bdy = P.y - b.y;
    const bd = Math.hypot(bdx, bdy) || 1;
    if (bd < 1100 && !inSafe) {
      const sp = bd > 240 ? 36 : 0;
      b.x += bdx / bd * sp * dt;
      b.y += bdy / bd * sp * dt;
      b.ang = lerpAngle(b.ang, Math.atan2(bdy, bdx), 1 - Math.exp(-3 * dt));
      b.cool -= dt;
      if (b.cool <= 0 && bd < 780) {
        b.cool = 2.5;
        for (let i = 0; i < 8; i++) {
          const a2 = b.t * 0.6 + i / 8 * Math.PI * 2;
          pushEBullet({ x: b.x, y: b.y, vx: Math.cos(a2) * 165, vy: Math.sin(a2) * 165, life: 4.5, r: 7, dmg: 1, alive: true });
        }
        tone(110, 0.3, 'sawtooth', 0.12, 50);
      }
      const bz = seaZone(Math.hypot(b.x, b.y));
      if (bd < b.r + 20) hurtPlayer(Math.max(1, Math.round(2 * (1 + bz.id * 0.14))));
    }
  }

  /* player bullets（穿透／爆裂／電磁） */
  for (const b of sea.bullets) {
    if (!b.alive) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) { b.alive = false; continue; }
    for (const h of sea.hazards) {
      if (!h.alive) continue;
      if (b.hitList && b.hitList.indexOf(h) >= 0) continue;
      if (Math.hypot(h.x - b.x, h.y - b.y) < h.r + 11) {
        const hits = b.hits || 0;
        const mul = b.pierce ? [1, 0.85, 0.72][Math.min(2, hits)] : 1;
        damageHazard(h, Math.max(1, Math.round(b.dmg * mul)), false);
        if (b.blast && hits === 0) blastDamage(h.x, h.y, h, b.dmg);
        if (b.emp && Math.random() < 0.18) h.empT = 1.2;
        b.hits = hits + 1;
        if (!b.hitList) b.hitList = [];
        b.hitList.push(h);
        if (!b.pierce || b.hits >= 3) { b.alive = false; break; }
      }
    }
    if (b.alive) {
      for (const bo of sea.bosses) {
        if (!bo.alive) continue;
        if (Math.hypot(bo.x - b.x, bo.y - b.y) < bo.r + 6) {
          bo.hp -= b.dmg;
          bo.hit = 0.15;
          float(bo.x + rnd(-12, 12), bo.y - bo.r - 4, String(b.dmg), '#ffffff');
          fxSpark(b.x, b.y, { n: 4, col: 'violet', spd: [120, 320] });
          fxRing(bo.x, bo.y, 34, 'violet', 0.22);
          b.alive = false;
          if (bo.hp <= 0) killSeaBoss(bo);
          break;
        }
      }
    }
  }
  if (sea.bullets.some(b => !b.alive)) sea.bullets = sea.bullets.filter(b => b.alive);

  /* enemy bullets — 安全圈會吸收 */
  for (const b of sea.ebullets) {
    if (!b.alive) continue;
    if (b.homing) {
      const cur = Math.atan2(b.vy, b.vx);
      const want = Math.atan2(P.y - b.y, P.x - b.x);
      let da = ((want - cur + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      const turn = (b.turn || 2.0) * dt;
      da = clamp(da, -turn, turn);
      const sp = Math.hypot(b.vx, b.vy);
      b.vx = Math.cos(cur + da) * sp;
      b.vy = Math.sin(cur + da) * sp;
    }
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) { b.alive = false; continue; }
    const bb = Math.hypot(b.x, b.y);
    if (bb < R) {
      b.alive = false;
      sea.shieldHits.push({ a: Math.atan2(b.y, b.x), life: 0.35, max: 0.35, r: R });
      sfx('shield');
      if (typeof baseHitFx === 'function') baseHitFx(b.x, b.y, Math.atan2(b.y, b.x));
      continue;
    }
    if (Math.hypot(P.x - b.x, P.y - b.y) < 20) { hurtPlayer(b.dmg); b.alive = false; }
  }
  if (sea.ebullets.some(b => !b.alive)) sea.ebullets = sea.ebullets.filter(b => b.alive);

  /* fish */
  for (let i = 0; i < sea.fish.length; i++) {
    const f = sea.fish[i];
    f.x += Math.cos(f.ang) * f.sp * dt;
    f.y += Math.sin(f.ang) * f.sp * dt + Math.sin(sea.t * 1.4 + f.ph) * 6 * dt;
    f.ang += Math.sin(sea.t * 0.6 + f.ph) * 0.2 * dt;
    if (Math.hypot(f.x - P.x, f.y - P.y) > 1700) sea.fish[i] = newFish(false);
  }

  /* particles */
  for (const p of sea.parts) {
    p.x += p.vx * dt; p.y += p.vy * dt;
    p.vx *= 0.96; p.vy *= 0.96;
    p.life -= dt;
  }
  sea.parts = sea.parts.filter(p => p.life > 0);
  for (const f of sea.floats) { f.y -= 26 * dt; f.life -= dt; }
  sea.floats = sea.floats.filter(f => f.life > 0);
  for (const b of sea.beams) b.life -= dt;
  sea.beams = sea.beams.filter(b => b.life > 0);
  for (const s of sea.shieldHits) s.life -= dt;
  sea.shieldHits = sea.shieldHits.filter(s => s.life > 0);

  /* hud */
  hudT += dt;
  if (hudT > 0.12) { hudT = 0; refreshHud(); }

  if (window.MOUSE) {
    sea.aim.x = window.MOUSE.x + sea.cam.x;
    sea.aim.y = window.MOUSE.y + sea.cam.y;
  }
}

/* =========================================================
   draw
   ========================================================= */
/* v0.11 背景水面（god rays／caustics）快取：透明覆蓋層每 2 幀重畫一次，
   其餘幀只 blit；`window.__PERF_LEGACY=true` 可切回原逐幀路徑做 A/B。 */
let seaFxCv = null, seaFxCtx = null, seaFxFrame = 0;
function paintWaterFX(c, t, cam, legacy) {
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const span = VW + 520;
    const x = ((i * 240 - cam.x * 0.22 - t * 12) % span + span) % span - 200;
    const lg = c.createLinearGradient(x, 0, x + 220, VH);
    lg.addColorStop(0, 'rgba(130,235,255,.09)');
    lg.addColorStop(1, 'rgba(130,235,255,0)');
    c.fillStyle = lg;
    c.beginPath();
    c.moveTo(x, -40); c.lineTo(x + 92, -40);
    c.lineTo(x + 300, VH + 40); c.lineTo(x + 140, VH + 40);
    c.closePath(); c.fill();
  }
  c.restore();

  c.save();
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = 'rgba(150,245,255,.06)';
  c.lineWidth = 1.5;
  const step = legacy ? 70 : 96;
  const dx = legacy ? 40 : 64;
  const off = ((cam.y * 0.45 + t * 14) % step + step) % step;
  for (let i = 0; i < VH / step + 2; i++) {
    const by = i * step - off;
    c.beginPath();
    for (let x = -dx; x <= VW + dx; x += dx) {
      const y = by + Math.sin((x + cam.x * 0.45) * 0.0058 + t * 0.9 + i * 0.7) * 9
                   + Math.cos(x * 0.0031 - t * 0.55) * 5;
      if (x === -dx) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
  }
  c.restore();
}
function drawWaterFX(t, cam) {
  if (window.__PERF_LEGACY) { paintWaterFX(ctx, t, cam, true); return; }
  if (!seaFxCv || seaFxCv.width !== VW || seaFxCv.height !== VH) {
    seaFxCv = document.createElement('canvas');
    seaFxCv.width = VW; seaFxCv.height = VH;
    seaFxCtx = seaFxCv.getContext('2d');
    seaFxFrame = 0;
  }
  if (seaFxFrame++ % 2 === 0) {
    seaFxCtx.clearRect(0, 0, VW, VH);
    paintWaterFX(seaFxCtx, t, cam, false);
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.drawImage(seaFxCv, 0, 0);
  ctx.restore();
}

function drawSea() {
  const cam = sea.cam, t = sea.t, P = sea.player;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, VW, VH);

  /* water（sea:* 漸層快取，key 含尺寸） */
  const g = fxLin('sea:water:' + VW + 'x' + VH, () => {
    const g2 = ctx.createLinearGradient(0, 0, 0, VH);
    g2.addColorStop(0, '#0b435e');
    g2.addColorStop(0.42, '#073047');
    g2.addColorStop(1, '#03161f');
    return g2;
  });
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);

  /* 海域色調：越遠越陰冷 */
  const zt = seaZone(Math.hypot(P.x, P.y));
  if (zt.id > 0) {
    const tint = ['rgba(0,0,0,0)', 'rgba(8,54,86,.10)', 'rgba(16,34,74,.16)', 'rgba(38,8,58,.20)'][zt.id];
    ctx.fillStyle = tint;
    ctx.fillRect(0, 0, VW, VH);
  }

  /* god rays + caustics（v0.11 快取 overlay；__PERF_LEGACY 切回逐幀） */
  drawWaterFX(t, cam);

  /* particles in water */
  ctx.fillStyle = 'rgba(190,245,255,.5)';
  for (const s of sea.specks) {
    const sx = ((s.x - cam.x * 0.5) % VW + VW) % VW;
    const sy = ((s.y - cam.y * 0.5 + t * s.v) % VH + VH) % VH;
    ctx.globalAlpha = s.a;
    ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* world */
  ctx.save();
  let shx = 0, shy = 0;
  const FX = fxAPI();
  if (FX && typeof FX.shakeOffset === 'function') {
    const sh = FX.shakeOffset();
    shx = sh.x; shy = sh.y;
  } else if (sea.shake > 0) {
    shx = rnd(-sea.shake, sea.shake); shy = rnd(-sea.shake, sea.shake);
  }
  ctx.translate(-cam.x + shx, -cam.y + shy);

  drawFish();
  drawBaseSystem(t);
  /* 基地在畫面外時 base.js 不會呼叫 drawWorld；這裡補一次，fx 內部同幀去重 */
  if (FX && typeof FX.drawWorld === 'function') FX.drawWorld(ctx);
  /* D 的深海巨獸（js/leviathan.js；不存在時跳過） */
  if (window.LEVIATHANS && typeof LEVIATHANS.draw === 'function') LEVIATHANS.draw(ctx);
  /* D 的海域事件（js/events.js；世界座標，與巨獸同層） */
  if (window.SEA_EVENTS && typeof SEA_EVENTS.draw === 'function') SEA_EVENTS.draw(ctx);

  for (const p of sea.pickups) {
    if (!p.alive) continue;
    if (p.x < cam.x - 90 || p.x > cam.x + VW + 90 || p.y < cam.y - 90 || p.y > cam.y + VH + 90) continue;
    drawPickup(p);
  }

  for (const h of sea.hazards) {
    if (!h.alive) continue;
    if (h.x < cam.x - 140 || h.x > cam.x + VW + 140 || h.y < cam.y - 140 || h.y > cam.y + VH + 140) continue;
    drawHazard(h);
    if (game.settings.colorblind && Math.hypot(h.x - sea.player.x, h.y - sea.player.y) < 420) drawHazardTag(h);
  }

  for (const bo of sea.bosses) {
    if (!bo.alive) continue;
    if (bo.x < cam.x - 200 || bo.x > cam.x + VW + 200 || bo.y < cam.y - 200 || bo.y > cam.y + VH + 200) continue;
    drawSeaBoss(bo);
  }

  /* tower beams */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const b of sea.beams) {
    ctx.strokeStyle = `rgba(140,240,255,${Math.min(1, b.life * 5)})`;
    ctx.lineWidth = b.tower ? 2 : 3;
    ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
    ctx.fillStyle = `rgba(200,255,255,${Math.min(1, b.life * 3)})`;
    ctx.beginPath(); ctx.arc(b.x2, b.y2, 8, 0, 7); ctx.fill();
  }
  ctx.restore();

  /* bullets */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const b of sea.bullets) {
    ctx.strokeStyle = 'rgba(180,250,255,.95)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - Math.cos(b.ang) * 22, b.y - Math.sin(b.ang) * 22);
    ctx.stroke();
  }
  for (const b of sea.ebullets) {
    const col = b.type === 'fast' ? 'rgba(160,240,255,.95)' : b.type === 'slow' ? 'rgba(255,150,80,.95)' : b.type === 'homing' ? 'rgba(255,90,100,.95)' : 'rgba(255,120,140,.9)';
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,200,210,.3)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2.2, 0, 7); ctx.fill();
  }
  ctx.restore();

  drawBots(t);
  drawPlayer();

  /* particles */
  for (const p of sea.parts) {
    ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
    ctx.fillStyle = p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* shield hits */
  for (const s of sea.shieldHits) {
    const k = s.life / s.max;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = `rgba(150,255,235,${k * 0.85})`;
    ctx.lineWidth = 3 + (1 - k) * 5;
    ctx.beginPath();
    ctx.arc(0, 0, s.r - (1 - k) * 4, s.a - 0.16, s.a + 0.16);
    ctx.stroke();
    ctx.strokeStyle = `rgba(160,240,255,${k * 0.45})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, s.r - (1 - k) * 22, s.a - 0.1, s.a + 0.1);
    ctx.stroke();
    ctx.restore();
  }

  /* floats */
  ctx.textAlign = 'center';
  for (const f of sea.floats) {
    const a = clamp(f.life / f.max, 0, 1);
    ctx.globalAlpha = a;
    ctx.font = '700 15px "Microsoft JhengHei",system-ui,sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,.55)';
    ctx.fillText(f.text, f.x + 1, f.y + 1);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  drawDepthVignette();
  drawCompass();
  drawRadar();
  drawAimReticle();
}

function drawFish() {
  ctx.save();
  for (const f of sea.fish) {
    const d = Math.hypot(f.x - sea.player.x, f.y - sea.player.y);
    if (d > 1250) continue;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.ang);
    ctx.globalAlpha = clamp(1 - d / 1400, 0.1, 0.42);
    ctx.fillStyle = '#0a2a3a';
    ctx.beginPath(); ctx.ellipse(0, 0, f.size, f.size * 0.42, 0, 0, 7); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-f.size * 0.8, 0);
    ctx.lineTo(-f.size * 1.6, -f.size * 0.45);
    ctx.lineTo(-f.size * 1.6, f.size * 0.45);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawDepthVignette() {
  const g = fxRad('sea:vignette:' + VW + 'x' + VH, () => {
    const g2 = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.78);
    g2.addColorStop(0, 'rgba(0,0,0,0)');
    g2.addColorStop(1, 'rgba(0,10,18,.72)');
    return g2;
  });
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);
}

function drawCompass() {
  const P = sea.player;
  const d = Math.hypot(P.x, P.y);
  if (d < 420) return;
  const px = P.x - sea.cam.x, py = P.y - sea.cam.y;
  const a = Math.atan2(-P.y, -P.x);
  const cx = px + Math.cos(a) * 74;
  const cy = py + Math.sin(a) * 74;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = 'rgba(142,230,164,.38)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.stroke();
  ctx.rotate(a);
  ctx.fillStyle = 'rgba(142,230,164,.92)';
  ctx.beginPath(); ctx.moveTo(15, 0); ctx.lineTo(-7, -7); ctx.lineTo(-2, 0); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '700 10.5px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(170,240,190,.9)';
  const label = d >= 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m';
  ctx.fillText(t('hud.compass', { dist: label }), cx, cy + 34);
  ctx.restore();

  /* 指北針：最近深海巨獸（距基地 >1200 m 才顯示；讀 D 的 LEVIATHANS.list） */
  if (d > 1200 && window.LEVIATHANS && Array.isArray(window.LEVIATHANS.list)) {
    let best = null, bd = Infinity;
    for (const lv of window.LEVIATHANS.list) {
      if (!lv || lv.alive === false) continue;
      const dd = Math.hypot(lv.x - P.x, lv.y - P.y);
      if (dd < bd) { bd = dd; best = lv; }
    }
    if (best) {
      const la = Math.atan2(best.y - P.y, best.x - P.x);
      const lx = px + Math.cos(la) * 112, ly = py + Math.sin(la) * 112;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.strokeStyle = 'rgba(201,166,255,.35)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(0, 0, 20, 0, 7); ctx.stroke();
      ctx.rotate(la);
      ctx.fillStyle = 'rgba(201,166,255,.95)';
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-7, -7); ctx.lineTo(-2, 0); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 10.5px "Microsoft JhengHei",system-ui';
      ctx.fillStyle = 'rgba(220,195,255,.92)';
      ctx.fillText(t('radar.giant', { dist: bd >= 1000 ? (bd / 1000).toFixed(1) + ' km' : Math.round(bd) + ' m' }), lx, ly + 34);
      ctx.restore();
    }
  }
}

function drawPickup(p) {
  const bob = Math.sin(p.t * 2.2) * 3;
  ctx.save();
  ctx.translate(p.x, p.y + bob);
  const col = p.type === 'air' ? '#9ff4ff' : p.type === 'crate' ? '#ffd166' : RESMETA[p.type].color;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gg = fxRad('sea:pickup:' + p.type + ':' + p.r, () => {
    const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, p.r * 2.2);
    g2.addColorStop(0, col + '3a');
    g2.addColorStop(1, col + '00');
    return g2;
  });
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(0, 0, p.r * 2.2, 0, 7); ctx.fill();
  ctx.restore();

  ctx.rotate(Math.sin(p.t * 1.3) * 0.15);
  if (p.type === 'plastic') {
    ctx.fillStyle = 'rgba(150,240,255,.85)';
    ctx.beginPath(); ctx.roundRect(-6, -13, 12, 24, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.fillRect(-4, -10, 3, 12);
    ctx.fillStyle = '#6fe3ff';
    ctx.fillRect(-3.5, -17, 7, 5);
  } else if (p.type === 'wood') {
    ctx.fillStyle = '#b07a45';
    ctx.beginPath(); ctx.roundRect(-17, -5, 34, 11, 2); ctx.fill();
    ctx.strokeStyle = 'rgba(90,55,25,.8)'; ctx.lineWidth = 1;
    for (let i = -12; i < 16; i += 7) { ctx.beginPath(); ctx.moveTo(i, -4); ctx.lineTo(i + 2, 5); ctx.stroke(); }
  } else if (p.type === 'metal') {
    ctx.fillStyle = '#c6d3e0';
    ctx.beginPath(); ctx.ellipse(0, 0, 8, 12, 0.5, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.beginPath(); ctx.ellipse(-2, -3, 2.5, 5, 0.5, 0, 7); ctx.fill();
    ctx.strokeStyle = '#8fa2b5'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 9, 0.6, 2.4); ctx.stroke();
  } else if (p.type === 'alloy') {
    ctx.fillStyle = '#c3a4ff';
    ctx.beginPath();
    ctx.moveTo(0, -12); ctx.lineTo(11, -2); ctx.lineTo(6, 11); ctx.lineTo(-6, 11); ctx.lineTo(-11, -2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(4, -1); ctx.lineTo(0, 2); ctx.lineTo(-4, -1); ctx.closePath(); ctx.fill();
  } else if (p.type === 'air') {
    ctx.strokeStyle = 'rgba(160,245,255,.9)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.stroke();
    ctx.fillStyle = 'rgba(200,250,255,.25)';
    ctx.beginPath(); ctx.arc(0, 0, 10, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)';
    ctx.beginPath(); ctx.arc(-3, -4, 2.4, 0, 7); ctx.fill();
  } else {
    ctx.fillStyle = '#a9793f';
    ctx.beginPath(); ctx.roundRect(-15, -13, 30, 26, 3); ctx.fill();
    ctx.strokeStyle = '#6d4a22'; ctx.lineWidth = 2;
    ctx.strokeRect(-15, -13, 30, 26);
    ctx.beginPath(); ctx.moveTo(-15, -13); ctx.lineTo(15, 13); ctx.moveTo(15, -13); ctx.lineTo(-15, 13); ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-6, -3, 12, 6);
  }
  ctx.restore();
}

function drawHazardTag(h) {
  const ch = h.type === 'shark' ? 'S' : h.type === 'drone' ? 'D' : 'J';
  ctx.save();
  ctx.translate(h.x, h.y - 34);
  ctx.fillStyle = 'rgba(0,0,0,.68)';
  ctx.strokeStyle = 'rgba(255,255,255,.9)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 11px "Microsoft JhengHei",system-ui';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(ch, 0, 1);
  ctx.restore();
}

function drawHazard(h) {
  ctx.save();
  ctx.translate(h.x, h.y);
  const flash = h.hit > 0;

  if (h.type === 'shark') {
    ctx.rotate(h.ang || 0);
    ctx.fillStyle = flash ? '#ffffff' : '#26404f';
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 11, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(38, -7); ctx.lineTo(36, 4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-4, -8); ctx.lineTo(2, -24); ctx.lineTo(12, -9); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-22, 0); ctx.lineTo(-36, -12); ctx.lineTo(-32, 0); ctx.lineTo(-36, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.beginPath(); ctx.arc(18, -3, 1.8, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.beginPath(); ctx.ellipse(0, 3, 20, 5, 0, 0, 7); ctx.fill();
  } else if (h.type === 'drone') {
    const bob = Math.sin(h.t * 3) * 3;
    ctx.translate(0, bob);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gg = fxRad('sea:droneGlow', () => {
      const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, 46);
      g2.addColorStop(0, 'rgba(255,70,110,.3)');
      g2.addColorStop(1, 'rgba(255,70,110,0)');
      return g2;
    });
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 0, 46, 0, 7); ctx.fill();
    ctx.restore();
    ctx.fillStyle = flash ? '#fff' : '#3a2c4a';
    ctx.beginPath(); ctx.ellipse(0, 0, 24, 9, 0, 0, 7); ctx.fill();
    ctx.fillStyle = flash ? '#fff' : '#5b4670';
    ctx.beginPath(); ctx.ellipse(0, -5, 13, 10, 0, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#ff4d6d';
    ctx.beginPath(); ctx.arc(0, -2, 4.5, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.beginPath(); ctx.arc(-1.5, -3.5, 1.6, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,90,120,.5)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-34, 3); ctx.moveTo(24, 0); ctx.lineTo(34, 3); ctx.stroke();
  } else {
    ctx.fillStyle = 'rgba(190,140,255,.35)';
    ctx.beginPath(); ctx.ellipse(0, -2, 15, 12, 0, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(220,180,255,.75)';
    ctx.lineWidth = 1.6;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 5, 2);
      ctx.quadraticCurveTo(i * 5 + Math.sin(h.t * 2 + i) * 6, 14, i * 5 + Math.sin(h.t * 2.4 + i) * 5, 26);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(240,220,255,.5)';
    ctx.beginPath(); ctx.ellipse(0, -2, 15, 12, 0, Math.PI, 0); ctx.stroke();
  }
  ctx.restore();

  if (h.hp < h.maxhp) {
    ctx.fillStyle = 'rgba(0,0,0,.4)';
    ctx.fillRect(h.x - 16, h.y - h.r - 16, 32, 4);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(h.x - 16, h.y - h.r - 16, 32 * (h.hp / h.maxhp), 4);
  }
}

function drawPlayer() {
  const P = sea.player;
  if (sea.dead) return;
  const flick = P.inv > 0 && Math.floor(P.inv * 12) % 2 === 0;
  ctx.save();
  ctx.translate(P.x, P.y);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const rg = fxRad('sea:playerGlow', () => {
    const g2 = ctx.createRadialGradient(0, 0, 0, 0, 0, 52);
    g2.addColorStop(0, 'rgba(150,240,255,.16)');
    g2.addColorStop(1, 'rgba(150,240,255,0)');
    return g2;
  });
  ctx.fillStyle = rg;
  ctx.beginPath(); ctx.arc(0, 0, 52, 0, 7); ctx.fill();
  ctx.restore();

  ctx.rotate(P.ang);
  const kick = Math.sin(P.t * 9);

  ctx.strokeStyle = '#12384c';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-24, -8 - kick * 4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-8, 4); ctx.lineTo(-24, 8 + kick * 4); ctx.stroke();
  ctx.fillStyle = '#2ea7c9';
  ctx.beginPath(); ctx.moveTo(-23, -10 - kick * 4); ctx.lineTo(-40, -15 - kick * 6); ctx.lineTo(-38, -3 - kick * 4); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-23, 10 + kick * 4); ctx.lineTo(-40, 15 + kick * 6); ctx.lineTo(-38, 3 + kick * 4); ctx.closePath(); ctx.fill();

  /* 氣樽 */
  ctx.fillStyle = '#cfd9e6';
  ctx.beginPath(); ctx.roundRect(-11, -11, 12, 8, 3); ctx.fill();
  ctx.fillStyle = '#8fa8b5';
  ctx.beginPath(); ctx.roundRect(-11, 3, 12, 8, 3); ctx.fill();

  ctx.fillStyle = flick ? '#ffffff' : '#0f4763';
  ctx.beginPath(); ctx.ellipse(0, 0, 15, 8.5, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(210,250,255,.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = flick ? '#ffffff' : '#1c6e8f';
  ctx.beginPath(); ctx.ellipse(1, 0, 10, 6, 0, 0, 7); ctx.fill();
  /* 腰帶 */
  ctx.fillStyle = 'rgba(255,209,102,.85)';
  ctx.fillRect(-4, -8, 4, 16);

  const armPh = Math.sin(P.t * 5);
  ctx.strokeStyle = '#0f4763'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(2, -7); ctx.lineTo(14 + armPh * 4, -16 - armPh * 3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(2, 7); ctx.lineTo(14 - armPh * 4, 16 + armPh * 3); ctx.stroke();
  ctx.fillStyle = '#f0b48a';
  ctx.beginPath(); ctx.arc(14 + armPh * 4, -16 - armPh * 3, 2.6, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(14 - armPh * 4, 16 + armPh * 3, 2.6, 0, 7); ctx.fill();

  ctx.fillStyle = '#f0b48a';
  ctx.beginPath(); ctx.arc(15, 0, 7.5, 0, 7); ctx.fill();
  ctx.fillStyle = '#8ff3ff';
  ctx.beginPath(); ctx.ellipse(18.5, -1, 5.5, 4, 0, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.8)';
  ctx.beginPath(); ctx.ellipse(19.5, -2.6, 2, 1.3, -0.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#1b3b4a';
  ctx.beginPath(); ctx.arc(12.5, 1.5, 2.2, 0, 7); ctx.fill();

  /* 頭燈 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const lg2 = fxLin('sea:headlight', () => {
    const g2 = ctx.createLinearGradient(20, 0, 54, 0);
    g2.addColorStop(0, 'rgba(160,245,255,.09)');
    g2.addColorStop(1, 'rgba(160,245,255,0)');
    return g2;
  });
  ctx.fillStyle = lg2;
  ctx.beginPath(); ctx.moveTo(20, -4); ctx.lineTo(54, -9); ctx.lineTo(54, 7); ctx.lineTo(20, 4); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#cfd9e6'; ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(26, -4); ctx.stroke();
  ctx.fillStyle = '#eaf7ff';
  ctx.beginPath(); ctx.moveTo(26, -7); ctx.lineTo(32, -4); ctx.lineTo(26, -1); ctx.closePath(); ctx.fill();

  ctx.restore();

  if (Math.random() < 0.5) {
    sea.parts.push({
      x: P.x + Math.cos(P.ang) * 18 + rnd(-4, 4), y: P.y + Math.sin(P.ang) * 18 + rnd(-4, 4),
      vx: rnd(-6, 6), vy: rnd(-40, -14), life: rnd(0.5, 1.1), max: 1.1,
      size: rnd(1, 3), color: 'rgba(190,245,255,.75)'
    });
  }
}

function drawRadar() {
  const P = sea.player;
  /* C 要求：半徑 92（原本 64）；小螢幕把雷達抬高，避開底部 #hint（390 寬實測） */
  const R = 92;
  const narrow = VW < 1100;
  const cx = VW - R - 10, cy = VH - R - (narrow ? 150 : 10);
  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = 'rgba(3,16,24,.72)';
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(111,227,255,.35)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke();
  ctx.strokeStyle = 'rgba(111,227,255,.12)';
  ctx.beginPath(); ctx.arc(0, 0, R * 0.6, 0, 7); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-R, 0); ctx.lineTo(R, 0); ctx.moveTo(0, -R); ctx.lineTo(0, R); ctx.stroke();

  const scale = R / 1500;

  /* base footprint */
  const br = baseRadius() * scale;
  ctx.fillStyle = 'rgba(120,235,255,.10)';
  ctx.beginPath(); ctx.arc((0 - P.x) * scale, (0 - P.y) * scale, br, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(142,230,164,.5)';
  ctx.beginPath(); ctx.arc((0 - P.x) * scale, (0 - P.y) * scale, br, 0, 7); ctx.stroke();

  for (const p of sea.pickups) {
    if (!p.alive) continue;
    const dx = (p.x - P.x) * scale, dy = (p.y - P.y) * scale;
    if (dx * dx + dy * dy > R * R) continue;
    ctx.fillStyle = p.type === 'crate' ? '#ffd166' : p.type === 'air' ? '#9ff4ff' : p.type === 'alloy' ? '#c3a4ff' : 'rgba(140,230,255,.75)';
    ctx.beginPath(); ctx.arc(dx, dy, p.type === 'crate' ? 2.6 : 1.7, 0, 7); ctx.fill();
  }
  for (const h of sea.hazards) {
    if (!h.alive) continue;
    const dx = (h.x - P.x) * scale, dy = (h.y - P.y) * scale;
    if (dx * dx + dy * dy > R * R) continue;
    ctx.fillStyle = '#ff5d73';
    ctx.beginPath(); ctx.arc(dx, dy, 2.4, 0, 7); ctx.fill();
  }
  for (const b of sea.bots) {
    const dx = (b.x - P.x) * scale, dy = (b.y - P.y) * scale;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(dx, dy, 2, 0, 7); ctx.fill();
  }

  for (const bo of sea.bosses) {
    if (!bo.alive) continue;
    const dx = (bo.x - P.x) * scale, dy = (bo.y - P.y) * scale;
    const dd = Math.hypot(dx, dy) || 1;
    const k2 = dd > R - 9 ? (R - 9) / dd : 1;
    ctx.fillStyle = '#c9a6ff';
    ctx.beginPath(); ctx.arc(dx * k2, dy * k2, 3.2, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(201,166,255,.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(dx * k2, dy * k2, 5.5 + Math.sin(sea.t * 3) * 1.5, 0, 7); ctx.stroke();
  }

  /* D 的深海巨獸：距基地 >1200 m 才畫紫點（Lead 指定，避免近海太亂） */
  if (Math.hypot(P.x, P.y) > 1200 && window.LEVIATHANS && Array.isArray(window.LEVIATHANS.list)) {
    for (const lv of window.LEVIATHANS.list) {
      if (!lv || lv.alive === false) continue;
      const dx = (lv.x - P.x) * scale, dy = (lv.y - P.y) * scale;
      const dd = Math.hypot(dx, dy) || 1;
      const k2 = dd > R - 9 ? (R - 9) / dd : 1;
      ctx.fillStyle = '#c9a6ff';
      ctx.beginPath(); ctx.arc(dx * k2, dy * k2, 3.8, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(201,166,255,.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(dx * k2, dy * k2, 7 + Math.sin(sea.t * 3) * 1.8, 0, 7); ctx.stroke();
    }
  }

  /* 海域事件（D 的 SEA_EVENTS.active 陣列；x/y 為 null 的廣域事件不畫點） */
  if (window.SEA_EVENTS) {
    const EV_COL = { EV01: '#8ee6a4', EV02: '#6fe3ff', EV03: '#ff5d73', EV04: '#c9a6ff', EV06: '#ffb36b', EV07: '#ffd166', EV08: '#7f7cff', EV09: '#ff9aa8' };
    const evs = Array.isArray(SEA_EVENTS.active) ? SEA_EVENTS.active : [];
    for (const ev of evs) {
      if (!ev || ev.x == null || ev.y == null) continue;
      const dx = (ev.x - P.x) * scale, dy = (ev.y - P.y) * scale;
      const dd = Math.hypot(dx, dy) || 1;
      const k2 = dd > R - 9 ? (R - 9) / dd : 1;
      const col = EV_COL[ev.id] || '#ffd166';
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(dx * k2, dy * k2, 3.4, 0, 7); ctx.fill();
      ctx.strokeStyle = col;
      ctx.globalAlpha = 0.8;
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(dx * k2, dy * k2, 6.5 + Math.sin(sea.t * 4) * 1.6, 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    const rift = SEA_EVENTS.rift;
    if (rift && rift.alive !== false && typeof rift.x === 'number' && typeof rift.y === 'number') {
      const dx = (rift.x - P.x) * scale, dy = (rift.y - P.y) * scale;
      const dd = Math.hypot(dx, dy) || 1;
      const k2 = dd > R - 9 ? (R - 9) / dd : 1;
      ctx.strokeStyle = '#c9a6ff';
      ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(dx * k2, dy * k2, 8, 0, 7); ctx.stroke();
      ctx.fillStyle = 'rgba(201,166,255,.9)';
      ctx.beginPath(); ctx.arc(dx * k2, dy * k2, 2.6, 0, 7); ctx.fill();
    }
  }

  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.4)';
  ctx.beginPath(); ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(P.ang) * 10, Math.sin(P.ang) * 10); ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '11px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(160,210,230,.75)';
  const dd = Math.hypot(P.x, P.y);
  ctx.fillText(t('hud.compass', { dist: dd >= 1000 ? (dd / 1000).toFixed(1) + ' km' : Math.round(dd) + ' m' }), cx, cy - R - 10);
  ctx.restore();
}

function drawAimReticle() {
  if (!window.MOUSE || !window.MOUSE.inside) return;
  const m = window.MOUSE;
  const P = sea.player;
  const d = Math.hypot(m.x + sea.cam.x - P.x, m.y + sea.cam.y - P.y);
  if (d < 40) return;
  ctx.save();
  ctx.translate(m.x, m.y);
  ctx.strokeStyle = 'rgba(160,250,255,.55)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-14, 0); ctx.lineTo(-6, 0); ctx.moveTo(14, 0); ctx.lineTo(6, 0);
  ctx.moveTo(0, -14); ctx.lineTo(0, -6); ctx.moveTo(0, 14); ctx.lineTo(0, 6);
  ctx.stroke();
  ctx.restore();
}
