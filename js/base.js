'use strict';
/* =========================================================
   base.js — 會長大的海上基地 / 安全圈 / BOT 艦隊
   ========================================================= */

const TILE = 120;
const baseRT = new Map();   /* 砲塔角度、建造動畫等執行期狀態 */

/* ---------- 平台格子 ---------- */
function baseTiles() {
  const out = [{ gx: 0, gy: 0, core: true }];
  const seen = new Set(['0,0']);
  for (const s of game.base.structures) {
    const k = s.gx + ',' + s.gy;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ gx: s.gx, gy: s.gy, core: false });
  }
  return out;
}
function baseTileCount() { return baseTiles().length; }

function freeTileFor() {
  const tiles = baseTiles();
  const occ = new Set(tiles.map(t => t.gx + ',' + t.gy));
  const cands = new Map();
  for (const t of tiles) {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const gx = t.gx + dx, gy = t.gy + dy, k = gx + ',' + gy;
      if (occ.has(k) || cands.has(k)) continue;
      const diag = (dx && dy) ? 0.45 : 0;
      cands.set(k, { gx, gy, d: Math.hypot(gx, gy) + diag + rnd(0, 0.28) });
    }
  }
  const arr = [...cands.values()].sort((a, b) => a.d - b.d);
  if (!arr.length) return { gx: 0, gy: -4 };
  const best = arr.filter(c => c.d <= arr[0].d + 0.35);
  return pick(best);
}

function baseRadius() {
  let m = 0;
  for (const t of baseTiles()) m = Math.max(m, Math.hypot(t.gx * TILE, t.gy * TILE));
  return Math.max(170, m + 126);
}

function structureAt(gx, gy) {
  return game.base.structures.find(s => s.gx === gx && s.gy === gy);
}
function structureWorld(s) {
  return { x: s.gx * TILE, y: s.gy * TILE };
}
function botHome(i) {
  const docks = game.base.structures.filter(s => s.type === 'botdock');
  const d = docks[i] || docks[0];
  if (!d) return { x: 0, y: 0 };
  return { x: d.gx * TILE, y: d.gy * TILE + 26 };
}
function onBaseChanged() {
  if (typeof sea !== 'undefined' && sea.burst) {
    const tiles = baseTiles();
    const t = tiles[tiles.length - 1];
    sea.burst(t.gx * TILE, t.gy * TILE, 18, '#9fe8ff', 200);
    sea.shake = Math.min(10, sea.shake + 3);
  }
}

/* =========================================================
   BOT
   ========================================================= */
function newBot(i) {
  const h = botHome(i);
  return {
    x: h.x + rnd(-14, 14), y: h.y + rnd(-10, 10), ang: rnd(0, 6.3),
    state: 'dock', t: rnd(0, 0.8), target: null,
    cargo: {}, count: 0, cap: 8, prop: rnd(0, 6)
  };
}
function syncBots() {
  if (!sea.bots) sea.bots = [];
  const want = countType('botdock');
  while (sea.bots.length < want) sea.bots.push(newBot(sea.bots.length));
  if (sea.bots.length > want) sea.bots.length = want;
}
function findBotTarget(bot) {
  const home = botHome(sea.bots.indexOf(bot));
  let best = null, bd = 1250;
  for (const p of sea.pickups) {
    if (!p.alive) continue;
    if (sea.bots.some(o => o !== bot && o.target === p)) continue;
    const d = Math.hypot(p.x - home.x, p.y - home.y);
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}
function takePickupByBot(bot, p) {
  p.alive = false;
  bot.cargo[p.type] = (bot.cargo[p.type] || 0) + 1;
  bot.count++;
  bot.target = null;
  if (Math.random() < 0.5) {
    sea.floats.push({ x: p.x, y: p.y - 14, text: 'BOT 回收', color: '#ffd166', life: 0.9, max: 0.9 });
  }
}
function depositBot(bot) {
  let n = 0;
  for (const k in bot.cargo) { addRes(k, bot.cargo[k]); n += bot.cargo[k]; }
  if (n > 0) {
    game.stats.botCollected += n;
    sea.floats.push({ x: bot.x, y: bot.y - 24, text: 'BOT 帶回 ' + n + ' 件', color: '#8ee6a4', life: 1.4, max: 1.4 });
    sfx('deposit');
    refreshHud();
  }
  bot.cargo = {}; bot.count = 0;
}
function updateBots(dt) {
  syncBots();
  for (let i = 0; i < sea.bots.length; i++) {
    const b = sea.bots[i];
    b.t += dt; b.prop += dt * 14;
    const home = botHome(i);
    const sp = 156;

    if (b.state === 'dock') {
      b.x = lerp(b.x, home.x, 1 - Math.exp(-6 * dt));
      b.y = lerp(b.y, home.y, 1 - Math.exp(-6 * dt));
      b.ang = lerpAngle(b.ang, -Math.PI / 2, 1 - Math.exp(-4 * dt));
      if (b.t > 1.1) { b.state = 'hunt'; b.t = 0; }
      continue;
    }
    if (b.state === 'patrol') {
      const dx = b.px - b.x, dy = b.py - b.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d > 24) {
        b.x += dx / d * sp * 0.75 * dt;
        b.y += dy / d * sp * 0.75 * dt;
        b.ang = lerpAngle(b.ang, Math.atan2(dy, dx), 1 - Math.exp(-5 * dt));
      }
      if (b.t > 2.2) {
        /* 打撈到一點物資 */
        const k = pick(['plastic', 'plastic', 'wood', 'metal']);
        b.cargo[k] = (b.cargo[k] || 0) + 1;
        b.count++;
        sea.floats.push({ x: b.x, y: b.y - 16, text: '打撈 +1', color: '#ffd166', life: 0.9, max: 0.9 });
        b.state = 'hunt'; b.t = 0;
        if (b.count >= b.cap) b.state = 'return';
      }
      continue;
    }
    if (b.state === 'hunt') {
      if (!b.target || !b.target.alive) b.target = findBotTarget(b);
      if (!b.target) {
        b.state = 'patrol'; b.t = 0;
        b.px = home.x + rnd(-620, 620);
        b.py = home.y + rnd(-620, 620);
        continue;
      }
      const dx = b.target.x - b.x, dy = b.target.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 22) { takePickupByBot(b, b.target); }
      else {
        b.x += dx / d * sp * dt;
        b.y += dy / d * sp * dt;
        b.ang = lerpAngle(b.ang, Math.atan2(dy, dx), 1 - Math.exp(-6 * dt));
      }
      if (b.count >= b.cap) { b.state = 'return'; b.t = 0; }
    } else if (b.state === 'return') {
      const dx = home.x - b.x, dy = home.y - b.y;
      const d = Math.hypot(dx, dy) || 1;
      if (d < 26) { depositBot(b); b.state = 'dock'; b.t = 0; }
      else {
        b.x += dx / d * sp * 0.9 * dt;
        b.y += dy / d * sp * 0.9 * dt;
        b.ang = lerpAngle(b.ang, Math.atan2(dy, dx), 1 - Math.exp(-6 * dt));
      }
    }
  }
}

/* =========================================================
   砲塔
   ========================================================= */
function updateBaseTowers(dt) {
  if (typeof sea === 'undefined') return;
  game.base.structures.forEach((s, idx) => {
    if (s.type !== 'tower') return;
    const key = s.gx + ',' + s.gy;
    let rt = baseRT.get(key);
    if (!rt) { rt = { ang: -Math.PI / 2, cool: 0, flash: 0 }; baseRT.set(key, rt); }
    rt.cool -= dt;
    if (rt.flash > 0) rt.flash -= dt;
    const x = s.gx * TILE, y = s.gy * TILE;
    let best = null, bd = 360;
    if (sea.hazards) {
      for (const h of sea.hazards) {
        if (!h.alive) continue;
        const d = Math.hypot(h.x - x, h.y - y);
        if (d < bd) { bd = d; best = h; }
      }
    }
    if (best) rt.ang = lerpAngle(rt.ang, Math.atan2(best.y - y, best.x - x), 1 - Math.exp(-7 * dt));
    if (best && rt.cool <= 0) {
      rt.cool = 0.85;
      rt.flash = 0.12;
      damageHazard(best, 2, true);
      sea.beams.push({ x1: x, y1: y - 16, x2: best.x, y2: best.y, life: 0.16, tower: true });
      tone(920, 0.05, 'square', 0.05, 460);
    }
  });
}

/* =========================================================
   繪製：平台
   ========================================================= */
function drawBaseSystem(t) {
  const R0 = baseRadius();
  /* 遠離鏡頭就不畫（省效能） */
  if (typeof sea !== 'undefined') {
    const cx = sea.cam.x, cy = sea.cam.y;
    if (0 < cx - R0 - 80 || 0 > cx + VW + R0 + 80 || 0 < cy - R0 - 80 || 0 > cy + VH + R0 + 80) return;
  }
  const tiles = baseTiles();
  const R = R0;
  const P = (typeof sea !== 'undefined') ? sea.player : null;
  const inside = P ? Math.hypot(P.x, P.y) < R : false;
  const pulse = 0.5 + Math.sin(t * 1.6) * 0.5;

  ctx.save();

  /* 水面泡沫 / 平台陰影 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fg = ctx.createRadialGradient(0, 0, R * 0.5, 0, 0, R * 1.25);
  fg.addColorStop(0, 'rgba(120,235,255,.10)');
  fg.addColorStop(1, 'rgba(120,235,255,0)');
  ctx.fillStyle = fg;
  ctx.beginPath(); ctx.arc(0, 0, R * 1.25, 0, 7); ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(0,0,0,.35)';

  /*** 連接橋（讓相鄰格看起來是同一塊平台） ***/
  const occSet = new Set(tiles.map(x => x.gx + ',' + x.gy));
  for (const tl of tiles) {
    const x = tl.gx * TILE, y = tl.gy * TILE;
    for (const [dx, dy] of [[1, 0], [0, 1]]) {
      if (!occSet.has((tl.gx + dx) + ',' + (tl.gy + dy))) continue;
      ctx.fillStyle = '#2c3f47';
      ctx.fillRect(x + (dx ? TILE / 2 - 6 : -TILE / 2), y + (dy ? TILE / 2 - 6 : -TILE / 2),
        dx ? 12 : TILE, dy ? 12 : TILE);
      ctx.fillStyle = 'rgba(10,22,28,.55)';
      ctx.fillRect(x + (dx ? TILE / 2 - 6 : -TILE / 2), y + (dy ? TILE / 2 - 2 : -TILE / 2),
        dx ? 12 : TILE, dy ? 4 : TILE);
    }
  }

  /*** 甲板 ***/
  for (const tl of tiles) {
    const x = tl.gx * TILE, y = tl.gy * TILE;
    const age = tileAge(tl);
    const sc = 0.86 + 0.14 * age;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(sc, sc);

    /* 陰影 */
    ctx.fillStyle = 'rgba(0,0,0,.28)';
    ctx.beginPath(); ctx.roundRect(-TILE / 2 + 6, -TILE / 2 + 10, TILE - 8, TILE - 8, 10); ctx.fill();

    /* 主體 */
    const g = ctx.createLinearGradient(0, -TILE / 2, 0, TILE / 2);
    g.addColorStop(0, tl.core ? '#3f6270' : '#3a4c55');
    g.addColorStop(1, tl.core ? '#264450' : '#26363e');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(-TILE / 2 + 3, -TILE / 2 + 3, TILE - 6, TILE - 6, 9); ctx.fill();

    /* 木板紋 */
    ctx.strokeStyle = 'rgba(12,24,30,.55)';
    ctx.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(-TILE / 2 + 7, i * 22);
      ctx.lineTo(TILE / 2 - 7, i * 22);
      ctx.stroke();
    }
    /* 內圈高光 */
    ctx.strokeStyle = tl.core ? 'rgba(120,240,255,.5)' : 'rgba(150,225,245,.18)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-TILE / 2 + 5, -TILE / 2 + 5, TILE - 10, TILE - 10, 8); ctx.stroke();
    ctx.restore();
  }

  /*** 邊緣欄杆 + 燈 ***/
  const occ = new Set(tiles.map(x => x.gx + ',' + x.gy));
  for (const tl of tiles) {
    const x = tl.gx * TILE, y = tl.gy * TILE, h = TILE / 2 - 3;
    const sides = [
      { dx: 1, dy: 0, x1: x + h, y1: y - h, x2: x + h, y2: y + h },
      { dx: -1, dy: 0, x1: x - h, y1: y - h, x2: x - h, y2: y + h },
      { dx: 0, dy: 1, x1: x - h, y1: y + h, x2: x + h, y2: y + h },
      { dx: 0, dy: -1, x1: x - h, y1: y - h, x2: x + h, y2: y - h }
    ];
    for (const sd of sides) {
      if (occ.has((tl.gx + sd.dx) + ',' + (tl.gy + sd.dy))) continue;
      ctx.strokeStyle = 'rgba(150,225,245,.42)';
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(sd.x1, sd.y1); ctx.lineTo(sd.x2, sd.y2); ctx.stroke();
      ctx.strokeStyle = 'rgba(10,22,28,.85)';
      ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(sd.x1, sd.y1); ctx.lineTo(sd.x2, sd.y2); ctx.stroke();
      /* 燈 */
      for (let k = 0; k <= 3; k++) {
        const px = lerp(sd.x1, sd.x2, k / 3), py = lerp(sd.y1, sd.y2, k / 3);
        const on = (Math.sin(t * 2 + px * 0.02 + py * 0.03) > -0.3);
        ctx.fillStyle = on ? 'rgba(140,245,255,.9)' : 'rgba(140,245,255,.22)';
        ctx.beginPath(); ctx.arc(px, py, on ? 2.2 : 1.6, 0, 7); ctx.fill();
        if (on) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = 'rgba(120,235,255,.16)';
          ctx.beginPath(); ctx.arc(px, py, 7, 0, 7); ctx.fill();
          ctx.restore();
        }
      }
    }
  }

  /*** 核心補給站 ***/
  if (!structureAt(0, 0)) {
    ctx.save();
    ctx.translate(0, 0);
    /* 平台 */
    ctx.fillStyle = 'rgba(18,44,56,.9)';
    ctx.beginPath(); ctx.roundRect(-42, -38, 84, 76, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(120,240,255,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(-42, -38, 84, 76, 10); ctx.stroke();
    /* 補給箱 */
    ctx.fillStyle = '#4c5f68';
    ctx.beginPath(); ctx.roundRect(-26, -18, 52, 34, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(200,240,255,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = '#8ee6a4';
    ctx.fillRect(-7, -22, 14, 8);
    /* 十字標記 */
    ctx.fillStyle = '#dff4ff';
    ctx.fillRect(-3.5, -12, 7, 22);
    ctx.fillRect(-11, -4.5, 22, 7);
    /* 天線 */
    ctx.strokeStyle = 'rgba(180,240,255,.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(26, -18); ctx.lineTo(26, -46); ctx.stroke();
    ctx.fillStyle = 'rgba(255,110,130,' + (0.35 + pulse * 0.6) + ')';
    ctx.beginPath(); ctx.arc(26, -48, 3.4, 0, 7); ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const cg = ctx.createRadialGradient(0, 0, 4, 0, 0, 90);
    cg.addColorStop(0, 'rgba(120,235,255,.16)');
    cg.addColorStop(1, 'rgba(120,235,255,0)');
    ctx.fillStyle = cg; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.fill();
    ctx.restore();
    ctx.restore();

    if (inside) {
      ctx.textAlign = 'center';
      ctx.font = '700 10px "Microsoft JhengHei",system-ui';
      ctx.fillStyle = 'rgba(200,255,215,.85)';
      ctx.fillText('補給站', 0, 60);
    }
  }

  /*** 甲板雜物 ***/
  for (const tl of tiles) {
    const x = tl.gx * TILE, y = tl.gy * TILE;
    const seed = Math.abs(tl.gx * 7 + tl.gy * 13);
    if (seed % 3 === 0) {
      /* 貨箱 */
      ctx.save();
      ctx.translate(x - 36, y + 38);
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath(); ctx.ellipse(0, 7, 12, 4, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#8a6a3f';
      ctx.beginPath(); ctx.roundRect(-10, -8, 20, 16, 2); ctx.fill();
      ctx.strokeStyle = 'rgba(40,26,12,.8)'; ctx.lineWidth = 1.4;
      ctx.strokeRect(-10, -8, 20, 16);
      ctx.beginPath(); ctx.moveTo(-10, -8); ctx.lineTo(10, 8); ctx.stroke();
      ctx.restore();
    }
    if (seed % 4 === 1) {
      /* 油桶 */
      ctx.save();
      ctx.translate(x + 38, y + 34);
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.beginPath(); ctx.ellipse(0, 8, 9, 3.5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#3f6b78';
      ctx.beginPath(); ctx.roundRect(-7, -10, 14, 18, 3); ctx.fill();
      ctx.strokeStyle = 'rgba(180,240,255,.35)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = 'rgba(200,250,255,.35)';
      ctx.fillRect(-7, -3, 14, 2);
      ctx.restore();
    }
    if (seed % 5 === 2) {
      /* 繩圈 */
      ctx.save();
      ctx.translate(x + 34, y - 38);
      ctx.strokeStyle = 'rgba(220,200,160,.4)';
      ctx.lineWidth = 1.6;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath(); ctx.ellipse(0, 0, 8 - i * 2, 4 - i, 0, 0, 7); ctx.stroke();
      }
      ctx.restore();
    }
  }

  /*** 建築 ***/
  for (const s of game.base.structures) {
    const age = tileAge(s);
    ctx.save();
    ctx.translate(s.gx * TILE, s.gy * TILE);
    const sc = 0.6 + 0.4 * age;
    ctx.scale(sc, sc);
    ctx.globalAlpha = 0.4 + 0.6 * age;
    drawStructure(s, t);
    ctx.restore();
  }

  /*** 安全圈 ***/
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const dg = ctx.createRadialGradient(0, 0, R * 0.55, 0, 0, R);
  dg.addColorStop(0, 'rgba(90,220,255,0)');
  dg.addColorStop(0.82, inside ? 'rgba(90,230,255,.085)' : 'rgba(90,220,255,.045)');
  dg.addColorStop(1, inside ? 'rgba(140,255,220,.16)' : 'rgba(90,220,255,.06)');
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.setLineDash([16, 13]);
  ctx.lineDashOffset = -t * 26;
  ctx.strokeStyle = inside ? 'rgba(150,255,225,' + (0.45 + pulse * 0.3) + ')' : 'rgba(120,235,255,.34)';
  ctx.lineWidth = 2.4;
  ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.stroke();
  ctx.setLineDash([]);
  /* 圈上的節點 */
  for (let i = 0; i < 12; i++) {
    const a = t * 0.12 + i / 12 * Math.PI * 2;
    const px = Math.cos(a) * R, py = Math.sin(a) * R;
    ctx.fillStyle = inside ? 'rgba(170,255,230,.8)' : 'rgba(140,235,255,.5)';
    ctx.beginPath(); ctx.arc(px, py, 2.6, 0, 7); ctx.fill();
  }
  ctx.restore();

  /* 圈內標示 */
  if (inside) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '700 12px "Microsoft JhengHei",system-ui';
    ctx.fillStyle = 'rgba(160,255,220,.75)';
    ctx.fillText('安全區 · 敵怪無法進入', 0, -R - 14);
    ctx.restore();
  }

  ctx.restore();
}

function tileAge(tl) {
  if (tl.core) return 1;
  const s = structureAt(tl.gx, tl.gy);
  const t = (typeof sea !== 'undefined') ? sea.t : 0;
  if (!s || !s.born) return 1;
  return clamp((t - s.born) / 0.55, 0, 1);
}

/* =========================================================
   繪製：各種建築
   ========================================================= */
function drawStructure(s, t) {
  const def = STRUCTS[s.type] || { name: '?' };
  const key = s.gx + ',' + s.gy;
  const rt = baseRT.get(key) || {};

  /* 投影 */
  ctx.fillStyle = 'rgba(0,0,0,.30)';
  ctx.beginPath(); ctx.ellipse(0, 30, 38, 10, 0, 0, 7); ctx.fill();
  /* 側面（厚度） */
  ctx.fillStyle = 'rgba(7,18,24,.92)';
  ctx.beginPath(); ctx.roundRect(-40, -28, 80, 68, 8); ctx.fill();
  /* 頂面 */
  const pg = ctx.createLinearGradient(0, -34, 0, 34);
  pg.addColorStop(0, 'rgba(30,58,70,.98)');
  pg.addColorStop(1, 'rgba(15,32,40,.98)');
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.roundRect(-40, -34, 80, 68, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(160,235,255,.28)';
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.roundRect(-40, -34, 80, 68, 8); ctx.stroke();
  ctx.strokeStyle = 'rgba(200,250,255,.12)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-34, -30); ctx.lineTo(34, -30); ctx.stroke();

  if (s.type === 'net') {
    /* 兩根支柱 */
    ctx.fillStyle = '#6b7d86';
    ctx.fillRect(-30, -34, 5, 50);
    ctx.fillRect(25, -34, 5, 50);
    /* 網面 */
    const sway = Math.sin(t * 1.4 + s.gx) * 2.5;
    ctx.strokeStyle = 'rgba(170,235,255,.5)';
    ctx.lineWidth = 1.1;
    for (let i = 0; i <= 5; i++) {
      const px = -28 + i * 11 + sway * 0.2;
      ctx.beginPath();
      ctx.moveTo(px, -32);
      ctx.quadraticCurveTo(px + sway, -4, px, 14);
      ctx.stroke();
    }
    for (let j = 0; j <= 4; j++) {
      const py = -32 + j * 11.5;
      ctx.beginPath();
      ctx.moveTo(-28, py);
      ctx.quadraticCurveTo(0, py + 8 + sway, 28, py);
      ctx.stroke();
    }
    /* 收集籃 */
    ctx.fillStyle = '#3f5a66';
    ctx.beginPath(); ctx.roundRect(-22, 12, 44, 14, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(180,240,255,.45)'; ctx.lineWidth = 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(142,230,164,.75)';
    ctx.beginPath(); ctx.arc(-10, 18, 2.4, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 19, 2, 0, 7); ctx.fill();
    /* 吊臂 */
    ctx.save();
    ctx.translate(0, -40);
    ctx.rotate(Math.sin(t * 0.8 + s.gx) * 0.6 - 0.5);
    ctx.strokeStyle = '#8fa8b5'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(30, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(200,240,255,.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(28, 16); ctx.stroke();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.arc(28, 18, 3, 0, 7); ctx.fill();
    ctx.restore();
  }

  else if (s.type === 'recycler') {
    /* 爐體 */
    const g = ctx.createLinearGradient(0, -26, 0, 26);
    g.addColorStop(0, '#5c6f78'); g.addColorStop(1, '#334750');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.roundRect(-30, -24, 60, 46, 6); ctx.fill();
    ctx.strokeStyle = 'rgba(200,240,255,.25)'; ctx.lineWidth = 1.4; ctx.stroke();
    /* 爐口 */
    const glow = 0.55 + Math.sin(t * 4 + s.gy) * 0.3;
    ctx.fillStyle = 'rgba(255,' + Math.floor(120 + glow * 80) + ',60,' + (0.7 + glow * 0.3) + ')';
    ctx.beginPath(); ctx.roundRect(-16, 2, 32, 16, 4); ctx.fill();
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gg = ctx.createRadialGradient(0, 10, 2, 0, 10, 40);
    gg.addColorStop(0, 'rgba(255,150,60,.28)');
    gg.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(0, 10, 40, 0, 7); ctx.fill();
    ctx.restore();
    /* 齒輪 */
    ctx.save();
    ctx.translate(22, -32);
    ctx.rotate(t * 1.4);
    ctx.fillStyle = '#9db4c0';
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate(i / 6 * Math.PI * 2);
      ctx.fillRect(-2.5, -9, 5, 6);
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill();
    ctx.fillStyle = '#334750';
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, 7); ctx.fill();
    ctx.restore();
    /* 煙 */
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.5 + i * 0.33 + s.gx * 0.1) % 1;
      const px = -18 + Math.sin((t + i) * 1.4) * 8;
      const py = -34 - p * 34;
      ctx.fillStyle = 'rgba(190,210,220,' + (0.26 * (1 - p)) + ')';
      ctx.beginPath(); ctx.arc(px, py, 5 + p * 9, 0, 7); ctx.fill();
    }
  }

  else if (s.type === 'tower') {
    /* 底座 */
    ctx.fillStyle = '#42555f';
    ctx.beginPath(); ctx.arc(0, 4, 22, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(200,240,255,.3)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 4, 22, 0, 7); ctx.stroke();
    /* 塔身 */
    ctx.fillStyle = '#546b76';
    ctx.beginPath(); ctx.roundRect(-12, -14, 24, 22, 4); ctx.fill();
    /* 砲塔頭 */
    ctx.save();
    ctx.translate(0, -16);
    ctx.rotate((rt.ang === undefined ? -Math.PI / 2 : rt.ang) + Math.PI / 2);
    ctx.fillStyle = '#7d95a2';
    ctx.beginPath(); ctx.arc(0, 0, 11, 0, 7); ctx.fill();
    ctx.fillStyle = '#c9d9e3';
    ctx.fillRect(0, -4, 26, 8);
    ctx.fillStyle = '#2b3c46';
    ctx.fillRect(22, -3, 5, 6);
    if (rt.flash > 0) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,230,150,' + (rt.flash * 4) + ')';
      ctx.beginPath(); ctx.arc(30, 0, 12, 0, 7); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    /* 警示燈 */
    ctx.fillStyle = 'rgba(255,110,130,' + (0.4 + Math.sin(t * 5) * 0.4) + ')';
    ctx.beginPath(); ctx.arc(-18, -24, 3, 0, 7); ctx.fill();
  }

  else if (s.type === 'reverse') {
    /* 基座 */
    ctx.fillStyle = '#2b2340';
    ctx.beginPath(); ctx.ellipse(0, 16, 30, 10, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(200,170,255,.45)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, 16, 30, 10, 0, 0, 7); ctx.stroke();
    /* 穹頂 */
    const gg = ctx.createRadialGradient(-6, -14, 3, 0, 0, 34);
    gg.addColorStop(0, 'rgba(226,200,255,.85)');
    gg.addColorStop(0.5, 'rgba(170,120,255,.5)');
    gg.addColorStop(1, 'rgba(90,50,170,.22)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(0, 10, 27, Math.PI, 0); ctx.fill();
    ctx.strokeStyle = 'rgba(220,195,255,.8)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, 10, 27, Math.PI, 0); ctx.stroke();
    /* 內部殘骸 */
    ctx.fillStyle = 'rgba(60,40,90,.8)';
    ctx.beginPath();
    ctx.moveTo(-9, 8); ctx.lineTo(2, -8); ctx.lineTo(11, 2); ctx.lineTo(3, 8);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(220,200,255,.5)'; ctx.lineWidth = 1; ctx.stroke();
    /* 能量柱 */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const bg2 = ctx.createLinearGradient(0, 8, 0, -34);
    bg2.addColorStop(0, 'rgba(190,150,255,.35)');
    bg2.addColorStop(1, 'rgba(190,150,255,0)');
    ctx.fillStyle = bg2;
    ctx.beginPath();
    ctx.moveTo(-6, 8); ctx.lineTo(-2, -34); ctx.lineTo(2, -34); ctx.lineTo(6, 8);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    /* 軌道環 */
    ctx.save();
    ctx.translate(0, 2);
    ctx.rotate(t * 0.8);
    ctx.strokeStyle = 'rgba(215,185,255,.6)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 11, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = 'rgba(235,215,255,.95)';
    ctx.beginPath(); ctx.arc(34, 0, 2.6, 0, 7); ctx.fill();
    ctx.restore();
    /* 浮游粒子 */
    for (let i = 0; i < 3; i++) {
      const a = t * 1.2 + i * 2.1;
      ctx.fillStyle = 'rgba(215,190,255,.7)';
      ctx.beginPath();
      ctx.arc(Math.cos(a) * 20, -6 + Math.sin(a * 1.3) * 12, 1.8, 0, 7);
      ctx.fill();
    }
  }

  else if (s.type === 'botdock') {
    /* 泊位 */
    ctx.fillStyle = '#2f4a55';
    ctx.beginPath(); ctx.roundRect(-36, 4, 72, 24, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(255,209,102,.5)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.roundRect(-36, 4, 72, 24, 5); ctx.stroke();
    /* 黃黑警示條 */
    for (let i = 0; i < 6; i++) {
      ctx.fillStyle = i % 2 ? 'rgba(255,209,102,.75)' : 'rgba(30,44,52,.9)';
      ctx.fillRect(-34 + i * 11, 24, 11, 4);
    }
    /* 龍門架 */
    ctx.strokeStyle = '#8fa8b5'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-26, 4); ctx.lineTo(-26, -30); ctx.lineTo(26, -30); ctx.lineTo(26, 4); ctx.stroke();
    /* 吊燈 */
    ctx.fillStyle = 'rgba(255,235,170,' + (0.5 + Math.sin(t * 6) * 0.4) + ')';
    ctx.beginPath(); ctx.arc(0, -31, 3.4, 0, 7); ctx.fill();
    /* 機械臂 */
    ctx.strokeStyle = '#c9d9e3'; ctx.lineWidth = 2;
    const arm = Math.sin(t * 1.6) * 0.4;
    ctx.beginPath(); ctx.moveTo(-26, -30); ctx.lineTo(-26 + Math.cos(arm) * 16, -30 + Math.sin(arm) * 16); ctx.stroke();
    /* 泊位號 */
    ctx.fillStyle = 'rgba(255,209,102,.85)';
    ctx.font = '700 9px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('BOT', 0, 18);
  }

  else if (s.type === 'equip') {
    /* 裝備房：工作台 + 工具牆 */
    ctx.fillStyle = '#33454f';
    ctx.beginPath(); ctx.roundRect(-32, -22, 64, 46, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(142,230,164,.45)'; ctx.lineWidth = 1.4; ctx.stroke();
    /* 屋頂 */
    ctx.fillStyle = '#3f5866';
    ctx.beginPath();
    ctx.moveTo(-34, -22); ctx.lineTo(0, -38); ctx.lineTo(34, -22);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(180,240,255,.25)'; ctx.stroke();
    /* 工作台 */
    ctx.fillStyle = '#8a6a3f';
    ctx.fillRect(-26, 2, 52, 10);
    ctx.fillStyle = '#6b4f2b';
    ctx.fillRect(-26, 12, 52, 3);
    /* 工具 */
    ctx.fillStyle = '#cfd9e6';
    ctx.fillRect(-20, -12, 3, 12);
    ctx.fillRect(-13, -12, 3, 9);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(-4, -12, 9, 4);
    ctx.fillStyle = '#8ee6a4';
    ctx.beginPath(); ctx.arc(12, -8, 5, 0, 7); ctx.fill();
    ctx.fillStyle = '#0c2028';
    ctx.beginPath(); ctx.arc(12, -8, 2, 0, 7); ctx.fill();
    /* 掛牌 */
    ctx.fillStyle = 'rgba(142,230,164,.9)';
    ctx.font = '700 10px "Microsoft JhengHei",system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('裝備', 0, -26);
  }

  else if (s.type === 'rnd') {
    /* 火箭研發中心 */
    ctx.fillStyle = '#2b3f4d';
    ctx.beginPath(); ctx.roundRect(-32, -18, 64, 42, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(155,234,255,.45)'; ctx.lineWidth = 1.4; ctx.stroke();
    /* 玻璃幕牆 */
    ctx.fillStyle = 'rgba(90,200,255,.25)';
    ctx.fillRect(-24, -10, 26, 18);
    ctx.strokeStyle = 'rgba(155,234,255,.5)'; ctx.lineWidth = 1;
    ctx.strokeRect(-24, -10, 26, 18);
    /* 屏幕數據 */
    ctx.fillStyle = 'rgba(155,234,255,.75)';
    for (let i = 0; i < 3; i++) ctx.fillRect(-21 + i * 8, -6 + (i % 2) * 4, 5, 2);
    /* 火箭模型 */
    ctx.fillStyle = '#dfe9f2';
    ctx.beginPath();
    ctx.moveTo(18, -6); ctx.lineTo(24, 6); ctx.lineTo(12, 6); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(16, 6, 4, 4);
    /* 天線碟 */
    ctx.save();
    ctx.translate(0, -22);
    ctx.rotate(-0.4 + Math.sin(t * 0.6) * 0.12);
    ctx.strokeStyle = '#9db4c0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.stroke();
    ctx.fillStyle = '#c9d9e3';
    ctx.beginPath(); ctx.ellipse(0, -12, 10, 4.5, 0, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(155,234,255,.8)';
    ctx.beginPath(); ctx.arc(0, -12, 2, 0, 7); ctx.fill();
    ctx.restore();
  }

  else if (s.type === 'satellite') {
    /* 衛星光束發生器 */
    ctx.fillStyle = '#22333f';
    ctx.beginPath(); ctx.roundRect(-30, 2, 60, 26, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(127,212,255,.5)'; ctx.lineWidth = 1.4; ctx.stroke();
    /* 基座環 */
    ctx.fillStyle = '#2e4a5a';
    ctx.beginPath(); ctx.ellipse(0, 2, 22, 8, 0, 0, 7); ctx.fill();
    /* 支架 */
    ctx.strokeStyle = '#9db4c0'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -18); ctx.stroke();
    /* 大碟 */
    ctx.save();
    ctx.translate(0, -24);
    ctx.rotate(Math.sin(t * 0.4) * 0.15);
    const dg = ctx.createLinearGradient(0, -12, 0, 10);
    dg.addColorStop(0, '#dff3ff');
    dg.addColorStop(1, '#7fa8bd');
    ctx.fillStyle = dg;
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 12, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(127,212,255,.8)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.ellipse(0, 0, 26, 12, 0, 0, 7); ctx.stroke();
    ctx.fillStyle = '#eaf9ff';
    ctx.beginPath(); ctx.arc(0, -2, 3.4, 0, 7); ctx.fill();
    ctx.restore();
    /* 藍光 */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const bg4 = ctx.createLinearGradient(0, -34, 0, -80);
    bg4.addColorStop(0, 'rgba(120,220,255,.45)');
    bg4.addColorStop(1, 'rgba(120,220,255,0)');
    ctx.fillStyle = bg4;
    ctx.beginPath(); ctx.moveTo(-12, -34); ctx.lineTo(-4, -80); ctx.lineTo(4, -80); ctx.lineTo(12, -34);
    ctx.closePath(); ctx.fill();
    const cg4 = ctx.createRadialGradient(0, -24, 2, 0, -24, 40);
    cg4.addColorStop(0, 'rgba(150,230,255,.5)');
    cg4.addColorStop(1, 'rgba(150,230,255,0)');
    ctx.fillStyle = cg4;
    ctx.beginPath(); ctx.arc(0, -24, 40, 0, 7); ctx.fill();
    ctx.restore();
  }

  else if (s.type === 'dock') {
    /* 發射台 */
    ctx.fillStyle = '#37474f';
    ctx.beginPath(); ctx.arc(0, 6, 32, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,209,102,.45)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 6, 32, 0, 7); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,209,102,.25)';
    ctx.beginPath(); ctx.arc(0, 6, 22, 0, 7); ctx.stroke();
    /* 火箭（依零件進度） */
    const pc = partCount();
    if (pc > 0) {
      const hgt = 10 + pc * 7;
      ctx.fillStyle = '#dfe9f2';
      ctx.beginPath();
      ctx.moveTo(0, -30 - hgt);
      ctx.quadraticCurveTo(9, -22 - hgt * 0.5, 9, 4);
      ctx.lineTo(-9, 4);
      ctx.quadraticCurveTo(-9, -22 - hgt * 0.5, 0, -30 - hgt);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ff6b6b';
      ctx.beginPath();
      ctx.moveTo(0, -30 - hgt);
      ctx.quadraticCurveTo(6, -24 - hgt * 0.6, 6, -20 - hgt * 0.5);
      ctx.lineTo(-6, -20 - hgt * 0.5);
      ctx.quadraticCurveTo(-6, -24 - hgt * 0.6, 0, -30 - hgt);
      ctx.fill();
      ctx.fillStyle = '#6fe3ff';
      ctx.beginPath(); ctx.arc(0, -14 - hgt * 0.4, 3.2, 0, 7); ctx.fill();
      /* 火焰 */
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const f = 0.7 + Math.sin(t * 12) * 0.3;
      const fg2 = ctx.createLinearGradient(0, 6, 0, 20 + 16 * f);
      fg2.addColorStop(0, 'rgba(255,240,190,.85)');
      fg2.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = fg2;
      ctx.beginPath();
      ctx.moveTo(-6, 6); ctx.quadraticCurveTo(0, 22 + 16 * f, 6, 6);
      ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    /* 桁架 */
    ctx.strokeStyle = '#8fa8b5'; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.moveTo(24, 6); ctx.lineTo(24, -36); ctx.lineTo(34, -36); ctx.lineTo(34, 6); ctx.stroke();
    /* 進度燈 */
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = i < partCount() ? 'rgba(142,230,164,.95)' : 'rgba(255,255,255,.15)';
      ctx.beginPath(); ctx.arc(-30 + i * 10, 26, 2.6, 0, 7); ctx.fill();
    }
  }

  /* 名稱牌 */
  ctx.textAlign = 'center';
  ctx.font = '8.5px "Microsoft JhengHei",system-ui';
  const nw = ctx.measureText(def.name).width + 12;
  ctx.fillStyle = 'rgba(5,16,22,.62)';
  ctx.beginPath(); ctx.roundRect(-nw / 2, 37, nw, 13, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(150,225,245,.16)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(-nw / 2, 37, nw, 13, 4); ctx.stroke();
  ctx.fillStyle = 'rgba(205,240,252,.85)';
  ctx.fillText(def.name, 0, 47);
}

/* =========================================================
   繪製：BOT
   ========================================================= */
function drawBots(t) {
  if (!sea.bots) return;
  for (const b of sea.bots) {
    ctx.save();
    ctx.translate(b.x, b.y);
    /* 尾流 */
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const wg = ctx.createRadialGradient(-Math.cos(b.ang) * 12, -Math.sin(b.ang) * 12, 0,
      -Math.cos(b.ang) * 12, -Math.sin(b.ang) * 12, 18);
    wg.addColorStop(0, 'rgba(160,240,255,.25)');
    wg.addColorStop(1, 'rgba(160,240,255,0)');
    ctx.fillStyle = wg;
    ctx.beginPath(); ctx.arc(-Math.cos(b.ang) * 12, -Math.sin(b.ang) * 12, 18, 0, 7); ctx.fill();
    ctx.restore();

    ctx.rotate(b.ang);
    /* 機身 */
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, 0, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(90,60,10,.55)'; ctx.lineWidth = 1.4; ctx.stroke();
    /* 駕駛艙 */
    ctx.fillStyle = '#eaf7ff';
    ctx.beginPath(); ctx.arc(3, -2, 4.4, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(60,150,190,.9)';
    ctx.beginPath(); ctx.arc(3.8, -2.4, 3, 0, 7); ctx.fill();
    /* 螺旋槳 */
    ctx.strokeStyle = 'rgba(220,245,255,.65)';
    ctx.lineWidth = 1.6;
    const pr = Math.sin(b.prop) * 6;
    ctx.beginPath(); ctx.moveTo(-12, -6 - pr * 0.3); ctx.lineTo(-12, 6 + pr * 0.3); ctx.stroke();
    /* 貨艙 */
    if (b.count) {
      const w = 4 + Math.min(10, b.count);
      ctx.fillStyle = '#8ee6a4';
      ctx.beginPath(); ctx.roundRect(-6, -12, w, 4, 1); ctx.fill();
    }
    /* 訊號燈 */
    ctx.fillStyle = 'rgba(255,90,120,' + (0.4 + Math.abs(Math.sin(t * 4 + b.prop)) * 0.6) + ')';
    ctx.beginPath(); ctx.arc(-9, 0, 1.8, 0, 7); ctx.fill();
    ctx.restore();

    /* 載貨量（未旋轉座標） */
    if (b.count > 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = '700 9px system-ui';
      ctx.fillStyle = 'rgba(200,255,215,.85)';
      ctx.fillText(b.count + '/' + b.cap, b.x, b.y - 16);
      ctx.restore();
    }
  }
}

/* =========================================================
   基地小地圖（面板用）
   ========================================================= */
function drawBaseMini(canvas) {
  if (!canvas) return;
  const c = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  c.clearRect(0, 0, W, H);
  const tiles = baseTiles();
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  for (const t of tiles) {
    minX = Math.min(minX, t.gx); maxX = Math.max(maxX, t.gx);
    minY = Math.min(minY, t.gy); maxY = Math.max(maxY, t.gy);
  }
  const cell = 34;
  const ox = W / 2, oy = H / 2;

  /* 安全圈 */
  const sr = (baseRadius() / TILE) * cell;
  c.fillStyle = 'rgba(120,235,255,.05)';
  c.beginPath(); c.arc(ox, oy, sr, 0, 7); c.fill();
  c.strokeStyle = 'rgba(120,235,255,.4)';
  c.setLineDash([5, 5]);
  c.beginPath(); c.arc(ox, oy, sr, 0, 7); c.stroke();
  c.setLineDash([]);

  const colors = {
    net: '#8ee6a4', recycler: '#ffb36b', tower: '#ff9aa8',
    reverse: '#c9a6ff', botdock: '#ffd166', dock: '#6fe3ff'
  };
  for (const t of tiles) {
    const x = ox + t.gx * cell, y = oy + t.gy * cell;
    c.fillStyle = t.core ? 'rgba(120,235,255,.55)' : 'rgba(150,215,235,.22)';
    c.fillRect(x + 1.5, y + 1.5, cell - 3, cell - 3);
    const s = structureAt(t.gx, t.gy);
    if (s) {
      c.fillStyle = colors[s.type] || '#fff';
      c.fillRect(x + cell * 0.28, y + cell * 0.28, cell * 0.44, cell * 0.44);
    }
  }
  /* 中心十字 */
  c.strokeStyle = 'rgba(255,255,255,.25)';
  c.beginPath(); c.moveTo(W / 2 - 6, H / 2); c.lineTo(W / 2 + 6, H / 2);
  c.moveTo(W / 2, H / 2 - 6); c.lineTo(W / 2, H / 2 + 6); c.stroke();
}
