'use strict';
/* =========================================================
   space.js — 升空（外星戰機阻擊）→ 登艦（衝入母船機庫）
   ========================================================= */

const launch = {
  prog: 0, hp: 100, maxhp: 100, x: 0, y: 0,
  rocks: [], stars: [], fighters: [], pdb: [], ebullets: [],
  t: 0, spawnT: 0, fighterT: 2, pdCool: 0, shake: 0, state: 'fly', winT: 0, flash: 0
};

function startLaunch() {
  const ready = Object.values(game.parts).every(Boolean) && countType('dock') > 0;
  if (!ready) { toast('太空船尚未完成'); return; }
  game.stats.launched = true;
  saveGame();
  transition(initLaunch);
}

function initLaunch() {
  const L = launch;
  L.prog = 0; L.hp = 130; L.maxhp = 130;
  L.x = VW / 2; L.y = VH * 0.76;
  L.rocks = []; L.stars = []; L.fighters = []; L.pdb = []; L.ebullets = [];
  L.t = 0; L.spawnT = 0.7; L.fighterT = 2.5; L.pdCool = 0;
  L.shake = 0; L.state = 'fly'; L.winT = 0; L.flash = 0;
  for (let i = 0; i < 190; i++) {
    L.stars.push({ x: rnd(0, VW), y: rnd(0, VH), z: rnd(0.15, 1), r: rnd(0.5, 1.9) });
  }
  setScene('launch');
  toast('點火！A / D 左右閃避，W 加速；艦上防禦炮會自動開火');
}

function updateLaunch(dt) {
  const L = launch;
  const keys = window.KEYS || {};
  L.t += dt;

  if (L.state === 'win') {
    L.winT += dt;
    L.prog = Math.min(100, L.prog + 30 * dt);
    L.flash = Math.min(1, L.flash + dt * 1.6);
    if (L.winT > 2.0 && !L.docked) { L.docked = true; transition(initDock); }
    return;
  }
  if (L.state !== 'fly') return;

  let dir = 0;
  if (keys['a'] || keys['arrowleft']) dir--;
  if (keys['d'] || keys['arrowright']) dir++;
  L.x = clamp(L.x + dir * 380 * dt, 46, VW - 46);
  const boost = !!(keys['w'] || keys['arrowup']);
  L.y = lerp(L.y, boost ? VH * 0.7 : VH * 0.77, 1 - Math.exp(-3 * dt));
  L.prog = Math.min(100, L.prog + (3.1 + (boost ? 1.6 : 0)) * dt);

  if (L.shake > 0) L.shake = Math.max(0, L.shake - 26 * dt);

  /* 隕石 */
  L.spawnT -= dt;
  if (L.spawnT <= 0 && L.prog < 96) {
    L.spawnT = Math.max(0.28, 0.9 - L.prog * 0.005);
    L.rocks.push({
      x: rnd(20, VW - 20), y: -50, r: rnd(9, 34),
      vy: rnd(150, 260) + L.prog * 0.8, vx: rnd(-40, 40),
      rot: rnd(0, 6.3), spin: rnd(-2.5, 2.5)
    });
  }
  for (const r of L.rocks) {
    r.y += r.vy * dt; r.x += r.vx * dt; r.rot += r.spin * dt;
    if (r.y > VH + 60) r.dead = true;
    if (!r.dead && Math.abs(r.x - L.x) < 20 + r.r && r.y > L.y - 50 - r.r && r.y < L.y + 50 + r.r) {
      r.dead = true;
      L.hp -= r.r * 0.6;
      L.shake = Math.min(20, L.shake + 10);
      L.flash = 0.6;
      sfx('boom');
      if (L.hp <= 0) { L.hp = 0; launchFail(); return; }
    }
  }
  L.rocks = L.rocks.filter(r => !r.dead);

  /* 外星戰機 */
  L.fighterT -= dt;
  if (L.fighterT <= 0 && L.prog > 8 && L.fighters.length < 3) {
    L.fighterT = Math.max(2.4, 5.0 - L.prog * 0.02);
    const fromLeft = Math.random() < 0.5;
    L.fighters.push({
      x: fromLeft ? -40 : VW + 40, y: rnd(80, VH * 0.42),
      vx: fromLeft ? rnd(90, 150) : -rnd(90, 150), vy: rnd(10, 40),
      hp: 2, t: rnd(0, 6), fire: rnd(0.7, 1.8), hit: 0
    });
  }
  for (const f of L.fighters) {
    f.t += dt;
    if (f.hit > 0) f.hit -= dt;
    /* 朝火箭方向偏航 */
    f.vx += (L.x - f.x) * 0.35 * dt;
    f.vx = clamp(f.vx, -210, 210);
    f.x += f.vx * dt;
    f.y += f.vy * dt + Math.sin(f.t * 2) * 8 * dt;
    f.fire -= dt;
    if (f.fire <= 0 && f.x > 0 && f.x < VW) {
      f.fire = rnd(2.2, 3.4);
      const a = Math.atan2(L.y - f.y, L.x - f.x);
      L.ebullets.push({ x: f.x, y: f.y, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, life: 3, r: 6, alive: true });
    }
    if (Math.abs(f.x - L.x) < 34 && Math.abs(f.y - L.y) < 56) {
      L.hp -= 8; L.shake = Math.min(20, L.shake + 10); L.flash = 0.5;
      f.dead = true; sfx('boom');
      if (L.hp <= 0) { L.hp = 0; launchFail(); return; }
    }
    if (f.x < -120 || f.x > VW + 120 || f.y > VH + 80) f.dead = true;
  }
  L.fighters = L.fighters.filter(f => !f.dead);

  /* 艦上防禦炮（自動反擊） */
  L.pdCool -= dt;
  if (L.pdCool <= 0) {
    let best = null, bd = 780;
    for (const f of L.fighters) {
      const d = Math.hypot(f.x - L.x, f.y - L.y);
      if (d < bd) { bd = d; best = f; }
    }
    if (best) {
      L.pdCool = 0.3;
      const a = Math.atan2(best.y - L.y, best.x - L.x);
      L.pdb.push({ x: L.x, y: L.y - 10, vx: Math.cos(a) * 900, vy: Math.sin(a) * 900, life: 1.2, alive: true, ang: a });
      tone(760, 0.05, 'square', 0.06, 320);
    } else L.pdCool = 0.2;
  }
  for (const b of L.pdb) {
    if (!b.alive) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) { b.alive = false; continue; }
    for (const f of L.fighters) {
      if (f.dead) continue;
      if (Math.hypot(f.x - b.x, f.y - b.y) < 22) {
        b.alive = false; f.hp--; f.hit = 0.15;
        if (f.hp <= 0) { f.dead = true; sfx('boom'); game.stats.kills++; }
        break;
      }
    }
  }
  L.pdb = L.pdb.filter(b => b.alive);

  /* 敵方電漿 */
  for (const b of L.ebullets) {
    if (!b.alive) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) { b.alive = false; continue; }
    if (Math.abs(b.x - L.x) < 24 && Math.abs(b.y - L.y) < 46) {
      b.alive = false;
      L.hp -= 5; L.shake = Math.min(16, L.shake + 6); sfx('hurt');
      if (L.hp <= 0) { L.hp = 0; launchFail(); return; }
    }
  }
  L.ebullets = L.ebullets.filter(b => b.alive);

  for (const s of L.stars) {
    if (s.spark) { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; s.vx *= 0.95; s.vy *= 0.95; }
  }
  L.stars = L.stars.filter(s => !s.spark || s.life > 0);

  if (L.prog >= 100) {
    L.state = 'win'; L.winT = 0; sfx('wave');
    toast('突破大氣層 — 母船就在月球軌道上');
  }
}

function launchFail() {
  launch.state = 'fail';
  sfx('lose');
  openModal('太空船解體', `<p class="muted">船體承受不住高速上升的震動，隔熱層一塊塊剝落。你按下了緊急分離。</p>
    <p class="muted" style="margin-top:10px">逃生艙落回海面，就在基地不遠處。太空船需要修理（金屬 -8）。</p>`,
    [{ label: '返回基地修理', cls: 'primary', onClick: backToBaseFromLaunch }]);
}

function backToBaseFromLaunch() {
  if (canPay({ metal: 8 })) pay({ metal: 8 });
  else game.res.metal = 0;
  game.pos = { x: 40, y: 150 };
  transition(() => { initSea(false); setScene('sea'); });
  toast('回到基地 — 重新發射即可');
}

function drawLaunch() {
  const L = launch;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, VW, VH);

  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#01030a');
  g.addColorStop(0.55, '#061427');
  g.addColorStop(1, '#0d2f4a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);

  const shx = L.shake > 0 ? rnd(-L.shake, L.shake) : 0;
  const shy = L.shake > 0 ? rnd(-L.shake, L.shake) : 0;
  ctx.save();
  ctx.translate(shx, shy);

  const speed = 60 + L.prog * 7;
  for (const s of L.stars) {
    if (s.spark) {
      ctx.globalAlpha = clamp(s.life / 0.7, 0, 1);
      ctx.fillStyle = '#ffd28a';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      continue;
    }
    const y = (s.y + L.t * speed * s.z) % (VH + 40) - 20;
    ctx.globalAlpha = 0.25 + s.z * 0.7;
    ctx.fillStyle = s.z > 0.7 ? '#dff4ff' : '#8fb3c4';
    ctx.fillRect(s.x, y, s.r, s.r * (1 + s.z * 3));
  }
  ctx.globalAlpha = 1;

  /* 月球與母船陰影 */
  const moonY = VH * 0.14 - L.prog * 1.2;
  const moonR = 40 + L.prog * 1.35;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const mg = ctx.createRadialGradient(VW * 0.78, moonY, moonR * 0.4, VW * 0.78, moonY, moonR * 2.4);
  mg.addColorStop(0, 'rgba(210,230,255,.22)');
  mg.addColorStop(1, 'rgba(210,230,255,0)');
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(VW * 0.78, moonY, moonR * 2.4, 0, 7); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#c9d6e4';
  ctx.beginPath(); ctx.arc(VW * 0.78, moonY, moonR, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(140,158,175,.55)';
  ctx.beginPath(); ctx.arc(VW * 0.78 - moonR * 0.3, moonY - moonR * 0.2, moonR * 0.22, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(VW * 0.78 + moonR * 0.35, moonY + moonR * 0.3, moonR * 0.15, 0, 7); ctx.fill();

  /* 母船（遠方剪影，越升越近） */
  const mshipY = -120 + L.prog * 2.2;
  const ms = 0.5 + L.prog * 0.006;
  ctx.save();
  ctx.globalAlpha = clamp(L.prog / 45, 0, 1) * 0.85;
  ctx.translate(VW * 0.5, mshipY);
  ctx.scale(ms, ms);
  ctx.fillStyle = '#0a1018';
  ctx.beginPath(); ctx.ellipse(0, 0, 260, 54, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -18, 150, 46, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(255,90,120,.35)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 260, 54, 0, 0, 7); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = Math.sin(L.t * 3 + i) > 0 ? 'rgba(255,90,120,.9)' : 'rgba(255,90,120,.2)';
    ctx.beginPath(); ctx.arc(-200 + i * 50, 16, 3.4, 0, 7); ctx.fill();
  }
  ctx.restore();

  /* 地球 */
  const eg = ctx.createRadialGradient(VW * 0.28, VH + 120, 40, VW * 0.28, VH + 120, 420);
  eg.addColorStop(0, '#3aa7d6');
  eg.addColorStop(0.55, '#1d6b9c');
  eg.addColorStop(1, 'rgba(12,40,68,0)');
  ctx.fillStyle = eg;
  ctx.beginPath(); ctx.arc(VW * 0.28, VH + 130, 400, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(140,235,255,.35)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(VW * 0.28, VH + 130, 400, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();

  /* 隕石 */
  for (const r of L.rocks) {
    ctx.save();
    ctx.translate(r.x, r.y);
    ctx.rotate(r.rot);
    ctx.fillStyle = '#5c6b78';
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      const rr = r.r * (0.74 + ((i * 37) % 10) / 28);
      if (i === 0) ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(20,30,40,.8)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }

  /* 外星戰機 */
  for (const f of L.fighters) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.vx > 0 ? 0.18 : Math.PI - 0.18);
    ctx.fillStyle = f.hit > 0 ? '#fff' : '#3a1f33';
    ctx.beginPath();
    ctx.moveTo(20, 0); ctx.lineTo(4, -12); ctx.lineTo(-16, -9); ctx.lineTo(-20, 0);
    ctx.lineTo(-16, 9); ctx.lineTo(4, 12);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,120,150,.8)'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = '#ff4d6d';
    ctx.beginPath(); ctx.arc(2, 0, 3.6, 0, 7); ctx.fill();
    ctx.restore();
  }

  /* 防禦炮彈 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const b of L.pdb) {
    ctx.strokeStyle = 'rgba(180,250,255,.95)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - Math.cos(b.ang) * 18, b.y - Math.sin(b.ang) * 18);
    ctx.stroke();
  }
  for (const b of L.ebullets) {
    ctx.fillStyle = 'rgba(255,90,140,.95)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,120,160,.25)';
    ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2.6, 0, 7); ctx.fill();
  }
  ctx.restore();

  drawRocket(L.x, L.y, 1);
  ctx.restore();

  if (L.flash > 0) {
    ctx.fillStyle = `rgba(255,240,210,${L.flash * 0.5})`;
    ctx.fillRect(0, 0, VW, VH);
    L.flash = Math.max(0, L.flash - 0.03);
  }

  drawLaunchHud();
}

function drawRocket(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const flick = 0.8 + Math.random() * 0.45;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fg = ctx.createLinearGradient(0, 40, 0, 40 + 130 * flick);
  fg.addColorStop(0, 'rgba(255,245,200,.95)');
  fg.addColorStop(0.35, 'rgba(120,220,255,.55)');
  fg.addColorStop(1, 'rgba(80,160,255,0)');
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.moveTo(-16, 42); ctx.quadraticCurveTo(0, 42 + 150 * flick, 16, 42);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#dfe9f2';
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.quadraticCurveTo(20, -26, 20, 10);
  ctx.lineTo(20, 42); ctx.lineTo(-20, 42); ctx.lineTo(-20, 10);
  ctx.quadraticCurveTo(-20, -26, 0, -58);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(90,120,140,.7)'; ctx.lineWidth = 2; ctx.stroke();

  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.moveTo(0, -58);
  ctx.quadraticCurveTo(14, -34, 14, -26);
  ctx.lineTo(-14, -26);
  ctx.quadraticCurveTo(-14, -34, 0, -58);
  ctx.fill();

  ctx.fillStyle = '#0d2b3d';
  ctx.beginPath(); ctx.arc(0, -4, 10, 0, 7); ctx.fill();
  ctx.fillStyle = '#6fe3ff';
  ctx.beginPath(); ctx.arc(0, -4, 7, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.75)';
  ctx.beginPath(); ctx.arc(-2.5, -6.5, 2.4, 0, 7); ctx.fill();

  ctx.fillStyle = '#2ea7c9';
  ctx.beginPath(); ctx.moveTo(-20, 18); ctx.lineTo(-36, 46); ctx.lineTo(-20, 42); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(20, 18); ctx.lineTo(36, 46); ctx.lineTo(20, 42); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2ea7c9';
  ctx.fillRect(-20, 24, 40, 5);

  /* 防禦炮座 */
  ctx.fillStyle = '#8fa8b5';
  ctx.beginPath(); ctx.arc(0, -26, 5, 0, 7); ctx.fill();
  ctx.restore();
}

function drawLaunchHud() {
  const L = launch;
  ctx.save();
  ctx.textAlign = 'left';

  const bw = Math.min(360, VW * 0.42), bx = 28, by = 28;
  ctx.fillStyle = 'rgba(2,12,20,.65)';
  ctx.strokeStyle = 'rgba(111,227,255,.3)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, 60, 10); ctx.fill(); ctx.stroke();
  ctx.font = '700 12px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = '#9fe4ff';
  ctx.fillText('上升高度', bx + 14, by + 22);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#eaf9ff';
  ctx.font = '700 16px system-ui';
  ctx.fillText(Math.floor(L.prog) + '%', bx + bw - 14, by + 23);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.beginPath(); ctx.roundRect(bx + 14, by + 32, bw - 28, 10, 5); ctx.fill();
  const pg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  pg.addColorStop(0, '#3ad1ff'); pg.addColorStop(1, '#b7f7ff');
  ctx.fillStyle = pg;
  ctx.beginPath(); ctx.roundRect(bx + 14, by + 32, (bw - 28) * L.prog / 100, 10, 5); ctx.fill();

  const hw = 200;
  ctx.fillStyle = 'rgba(2,12,20,.65)';
  ctx.strokeStyle = 'rgba(255,120,120,.28)';
  ctx.beginPath(); ctx.roundRect(bx, by + 70, hw, 40, 8); ctx.fill(); ctx.stroke();
  ctx.font = '700 11px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = '#ffb3b3';
  ctx.fillText('船體', bx + 12, by + 88);
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.beginPath(); ctx.roundRect(bx + 50, by + 80, hw - 66, 9, 5); ctx.fill();
  ctx.fillStyle = L.hp < 35 ? '#ff5d73' : '#ff9f68';
  ctx.beginPath(); ctx.roundRect(bx + 50, by + 80, (hw - 66) * clamp(L.hp / L.maxhp, 0, 1), 9, 5); ctx.fill();
  ctx.fillStyle = '#ffd9d9';
  ctx.font = '10px system-ui';
  ctx.fillText(Math.ceil(L.hp) + '', bx + 12, by + 102);

  ctx.textAlign = 'center';
  ctx.font = '12px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(160,210,230,.7)';
  ctx.fillText('A / D 閃避　·　W 加速上升　·　防禦炮自動反擊', VW / 2, VH - 26);
  ctx.restore();
}

/* =========================================================
   登艦：衝入外星母船機庫
   ========================================================= */
const dock = {
  x: 0, y: 0, vx: 0, vy: 0, hull: 100, maxhull: 100,
  t: 0, depth: 0, shots: [], turrets: [], state: 'fly', flash: 0, shake: 0
};

function initDock() {
  const D = dock;
  D.x = VW / 2; D.y = VH - 120; D.vx = 0; D.vy = 0;
  D.hull = 100; D.maxhull = 100; D.t = 0; D.depth = 0;
  D.shots = []; D.state = 'fly'; D.flash = 0; D.shake = 0;
  D.turrets = [
    { fx: 0.18, fy: 0.30, cool: 1.2 },
    { fx: 0.82, fy: 0.30, cool: 2.0 },
    { fx: 0.34, fy: 0.18, cool: 2.6 },
    { fx: 0.66, fy: 0.18, cool: 3.1 },
    { fx: 0.5, fy: 0.10, cool: 3.6 }
  ];
  setScene('dock');
  toast('衝進母船機庫 — 按住 W 前進，避開砲火');
}

function dockHangar() {
  return { x: VW / 2, y: VH * 0.30, w: 190, h: 100 };
}

function updateDock(dt) {
  const D = dock, keys = window.KEYS || {};
  D.t += dt;
  if (D.shake > 0) D.shake = Math.max(0, D.shake - 26 * dt);
  if (D.state !== 'fly') return;

  let ix = 0, iy = 0;
  if (keys['a'] || keys['arrowleft']) ix--;
  if (keys['d'] || keys['arrowright']) ix++;
  if (keys['w'] || keys['arrowup']) iy--;
  if (keys['s'] || keys['arrowdown']) iy++;
  const sp = 215;
  D.vx = lerp(D.vx, ix * sp, 1 - Math.exp(-6 * dt));
  D.vy = lerp(D.vy, iy * sp, 1 - Math.exp(-6 * dt));
  D.x = clamp(D.x + D.vx * dt, 40, VW - 40);
  D.y = clamp(D.y + (D.vy + 42) * dt, VH * 0.30, VH - 60);   /* 母船引力把你往後拉 */

  D.depth = clamp(1 - (D.y - VH * 0.36) / (VH - 60 - VH * 0.36), 0, 1);

  /* 砲塔開火 */
  for (const t of D.turrets) {
    t.cool -= dt;
    if (t.cool <= 0) {
      t.cool = rnd(2.1, 3.1);
      const tx = t.fx * VW, ty = t.fy * VH;
      const a = Math.atan2(D.y - ty, D.x - tx);
      D.shots.push({ x: tx, y: ty, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, life: 4, r: 7, alive: true });
      tone(200, 0.1, 'sawtooth', 0.07, 90);
    }
  }
  for (const s of D.shots) {
    if (!s.alive) continue;
    s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (s.life <= 0) { s.alive = false; continue; }
    if (Math.hypot(s.x - D.x, s.y - D.y) < 24) {
      s.alive = false;
      D.hull -= 8; D.shake = Math.min(16, D.shake + 8); D.flash = 0.5;
      sfx('hurt');
      if (D.hull <= 0) { D.hull = 0; dockFail(); return; }
    }
  }
  D.shots = D.shots.filter(s => s.alive);

  /* 進入機庫 */
  const h = dockHangar();
  if (Math.abs(D.x - h.x) < h.w / 2 && Math.abs(D.y - h.y) < h.h / 2) {
    D.state = 'in';
    sfx('win');
    transition(initMoon);
    return;
  }
  if (D.depth > 0.96) { D.depth = 1; }
}

function dockFail() {
  dock.state = 'fail';
  sfx('lose');
  openModal('太空船被擊落', `<p class="muted">母船的防禦砲火把太空船撕開。你彈射出去，看著它燒成碎片。</p>
    <p class="muted" style="margin-top:10px">逃生艙落回海面。修理需要金屬 8。</p>`,
    [{ label: '返回基地', cls: 'primary', onClick: backToBaseFromLaunch }]);
}

function drawDock() {
  const D = dock, h = dockHangar();
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#02040b');
  g.addColorStop(0.65, '#050b18');
  g.addColorStop(1, '#0a1a2c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);

  /* 星星 */
  for (let i = 0; i < 90; i++) {
    const x = (i * 173) % VW, y = (i * 97) % VH;
    ctx.globalAlpha = 0.25 + Math.abs(Math.sin(D.t * 0.8 + i)) * 0.55;
    ctx.fillStyle = '#dff4ff';
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;

  /* 下方的月球 */
  const mg = ctx.createRadialGradient(VW * 0.2, VH + 260, 60, VW * 0.2, VH + 260, 520);
  mg.addColorStop(0, 'rgba(200,215,235,.5)');
  mg.addColorStop(0.5, 'rgba(120,140,165,.22)');
  mg.addColorStop(1, 'rgba(60,80,100,0)');
  ctx.fillStyle = mg;
  ctx.beginPath(); ctx.arc(VW * 0.2, VH + 260, 520, 0, 7); ctx.fill();

  const shx = D.shake > 0 ? rnd(-D.shake, D.shake) : 0;
  const shy = D.shake > 0 ? rnd(-D.shake, D.shake) : 0;
  ctx.save();
  ctx.translate(shx, shy);

  /* ===== 母船船體 ===== */
  const hullBottom = VH * 0.50 - D.depth * VH * 0.05;

  /* 巨大艦體：弧形下緣＋裝甲 */
  ctx.save();
  const hullG = ctx.createLinearGradient(0, -260, 0, hullBottom + 90);
  hullG.addColorStop(0, '#0a111c');
  hullG.addColorStop(0.45, '#1a2434');
  hullG.addColorStop(0.8, '#121a26');
  hullG.addColorStop(1, '#070c14');
  ctx.fillStyle = hullG;
  ctx.beginPath();
  ctx.moveTo(-120, hullBottom + 130);
  ctx.lineTo(-60, VH * 0.02);
  ctx.quadraticCurveTo(VW * 0.5, -190, VW + 60, VH * 0.02);
  ctx.lineTo(VW + 120, hullBottom + 130);
  ctx.quadraticCurveTo(VW * 0.5, hullBottom + 190, -120, hullBottom + 130);
  ctx.closePath();
  ctx.fill();

  /* 下緣輪廓光 */
  ctx.strokeStyle = 'rgba(120,190,240,.28)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-120, hullBottom + 130);
  ctx.quadraticCurveTo(VW * 0.5, hullBottom + 190, VW + 120, hullBottom + 130);
  ctx.stroke();
  /* 艦腹陰影 */
  const shg = ctx.createLinearGradient(0, hullBottom - 40, 0, hullBottom + 150);
  shg.addColorStop(0, 'rgba(0,0,0,0)');
  shg.addColorStop(1, 'rgba(0,0,0,.6)');
  ctx.fillStyle = shg;
  ctx.beginPath();
  ctx.moveTo(-120, hullBottom + 130);
  ctx.quadraticCurveTo(VW * 0.5, hullBottom + 190, VW + 120, hullBottom + 130);
  ctx.lineTo(VW + 120, hullBottom - 10);
  ctx.lineTo(-120, hullBottom - 10);
  ctx.closePath(); ctx.fill();

  /* 裝甲板分格 */
  ctx.strokeStyle = 'rgba(110,160,200,.13)';
  ctx.lineWidth = 1.5;
  for (let i = 1; i < 11; i++) {
    const x = i / 11 * VW;
    ctx.beginPath(); ctx.moveTo(x, VH * 0.02 + 10); ctx.lineTo(x + (i - 5) * 10, hullBottom + 60); ctx.stroke();
  }
  for (let j = 1; j < 6; j++) {
    const y = VH * 0.02 + j * (hullBottom * 0.95 / 6);
    ctx.beginPath(); ctx.moveTo(-60, y); ctx.lineTo(VW + 60, y); ctx.stroke();
  }

  /* 艦體細節 */
  for (let i = 0; i < 22; i++) {
    const gx = (i * 173) % VW;
    const gy = VH * 0.05 + ((i * 97) % (hullBottom * 0.8));
    const w = 26 + (i * 13) % 70, hgt = 8 + (i * 7) % 22;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(30,44,60,.85)' : 'rgba(12,20,30,.8)';
    ctx.fillRect(gx, gy, w, hgt);
    ctx.strokeStyle = 'rgba(120,190,240,.10)';
    ctx.lineWidth = 1;
    ctx.strokeRect(gx, gy, w, hgt);
  }

  /* 中央脊線 */
  ctx.fillStyle = 'rgba(10,16,24,.9)';
  ctx.beginPath();
  ctx.moveTo(VW / 2 - 120, VH * 0.02);
  ctx.lineTo(VW / 2 + 120, VH * 0.02);
  ctx.lineTo(VW / 2 + 40, hullBottom + 60);
  ctx.lineTo(VW / 2 - 40, hullBottom + 60);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(120,190,240,.18)';
  ctx.lineWidth = 2;
  ctx.stroke();

  /* 船體燈帶 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const x = 20 + (i * 61) % (VW - 40);
    const y = VH * 0.1 + (i * 37) % (hullBottom * 0.8);
    const on = Math.sin(D.t * 2.4 + i) > -0.4;
    ctx.fillStyle = on ? 'rgba(120,200,255,.55)' : 'rgba(120,200,255,.12)';
    ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill();
  }
  ctx.restore();

  /* 機庫開口 */
  ctx.save();
  const hgx = h.x - h.w / 2, hgy = h.y - h.h / 2;
  const glow = 0.5 + Math.sin(D.t * 2) * 0.2;
  const hgl = ctx.createRadialGradient(h.x, h.y, 10, h.x, h.y, h.w);
  hgl.addColorStop(0, `rgba(150,245,255,${0.45 + glow * 0.3})`);
  hgl.addColorStop(0.55, 'rgba(80,200,255,.18)');
  hgl.addColorStop(1, 'rgba(60,170,255,0)');
  ctx.fillStyle = hgl;
  ctx.beginPath(); ctx.arc(h.x, h.y, h.w, 0, 7); ctx.fill();

  ctx.fillStyle = '#031018';
  ctx.beginPath(); ctx.roundRect(hgx, hgy, h.w, h.h, 14); ctx.fill();
  /* 隧道內壁（三層） */
  for (let i = 0; i < 3; i++) {
    const p2 = 12 + i * 14;
    ctx.fillStyle = `rgba(6,22,32,${0.9 - i * 0.18})`;
    ctx.beginPath(); ctx.roundRect(hgx + p2, hgy + p2 * 0.7, h.w - p2 * 2, h.h - p2 * 1.4, 10); ctx.fill();
    ctx.strokeStyle = `rgba(120,230,255,${0.35 - i * 0.09})`;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.roundRect(hgx + p2, hgy + p2 * 0.7, h.w - p2 * 2, h.h - p2 * 1.4, 10); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(150,245,255,.8)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(hgx, hgy, h.w, h.h, 14); ctx.stroke();
  /* 機庫指示燈 */
  for (let i = 0; i < 7; i++) {
    const lx = hgx + 16 + i * (h.w - 32) / 6;
    ctx.fillStyle = `rgba(${Math.sin(D.t * 4 + i) > 0 ? '150,245,255' : '40,90,120'},.9)`;
    ctx.beginPath(); ctx.arc(lx, hgy + 8, 2.4, 0, 7); ctx.fill();
  }

  /* 力場柵欄 */
  ctx.save();
  ctx.beginPath(); ctx.roundRect(hgx + 4, hgy + 4, h.w - 8, h.h - 8, 10); ctx.clip();
  for (let i = 0; i < 9; i++) {
    const x = hgx + ((i * 26 + D.t * 40) % h.w);
    ctx.fillStyle = 'rgba(120,240,255,.10)';
    ctx.fillRect(x, hgy, 8, h.h);
  }
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.font = '700 12px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(180,250,255,.9)';
  ctx.fillText('機庫入口', h.x, hgy - 12);
  ctx.restore();

  /* 砲塔 */
  for (const t of D.turrets) {
    const tx = t.fx * VW, ty = t.fy * VH;
    const a = Math.atan2(D.y - ty, D.x - tx);
    ctx.save();
    ctx.translate(tx, ty);
    ctx.fillStyle = '#1d2a38';
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,110,140,.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, 7); ctx.stroke();
    ctx.rotate(a);
    ctx.fillStyle = '#334c60';
    ctx.fillRect(0, -5, 26, 10);
    ctx.fillStyle = 'rgba(255,90,120,.9)';
    ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  /* 砲彈 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of D.shots) {
    ctx.fillStyle = 'rgba(255,90,140,.95)';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,130,160,.25)';
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 2.8, 0, 7); ctx.fill();
  }
  ctx.restore();

  /* 速度線 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const x = (i * 97) % VW;
    const y = ((i * 53 + D.t * (260 + i * 4)) % VH);
    ctx.strokeStyle = 'rgba(150,220,255,.10)';
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 30 + (i % 5) * 12); ctx.stroke();
  }
  ctx.restore();

  drawRocket(D.x, D.y, 1.0);

  if (D.flash > 0) {
    ctx.fillStyle = `rgba(255,120,120,${D.flash * 0.35})`;
    ctx.fillRect(0, 0, VW, VH);
    D.flash = Math.max(0, D.flash - 0.04);
  }
  ctx.restore();

  /* HUD */
  ctx.save();
  const bw = 220, bx = 28, by = 28;
  ctx.fillStyle = 'rgba(2,10,18,.7)';
  ctx.strokeStyle = 'rgba(255,120,120,.3)';
  ctx.beginPath(); ctx.roundRect(bx, by, bw, 44, 9); ctx.fill(); ctx.stroke();
  ctx.font = '700 11px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = '#ffb3c3';
  ctx.fillText('船體', bx + 12, by + 17);
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath(); ctx.roundRect(bx + 12, by + 24, bw - 24, 8, 4); ctx.fill();
  ctx.fillStyle = D.hull < 35 ? '#ff5d73' : '#ff9f68';
  ctx.beginPath(); ctx.roundRect(bx + 12, by + 24, (bw - 24) * clamp(D.hull / D.maxhull, 0, 1), 8, 4); ctx.fill();

  ctx.textAlign = 'center';
  ctx.font = '700 13px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(200,240,255,.8)';
  ctx.fillText('外星母船 · 機庫入口', VW / 2, 34);
  ctx.font = '12px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(160,210,230,.7)';
  ctx.fillText('WASD 飛行　·　W 前進（母船引力會把你往後拉）', VW / 2, VH - 26);
  ctx.restore();
}

/* =========================================================
   母船內部：最終決戰（含人類同盟軍）
   ========================================================= */
const ARENA = { w: 1200, h: 800 };
const moon = {
  p: { x: 600, y: 660, vx: 0, vy: 0, hp: 100, maxhp: 100, cool: 0, inv: 0, ang: -Math.PI / 2 },
  aliens: [], bullets: [], ebullets: [], boss: null,
  wave: 0, waveT: 0, t: 0, banner: 0, bannerText: '', state: 'fight', endT: 0,
  stars: [], shake: 0, kills: 0, dust: [], rocks: [],
  allies: [], alliance: false, radio: 0, radioText: ''
};

function moonView() {
  const s = Math.min(VW / ARENA.w, VH / ARENA.h) * 0.98;
  return { s, ox: (VW - ARENA.w * s) / 2, oy: (VH - ARENA.h * s) / 2 };
}
function screenToArena(x, y) {
  const v = moonView();
  return { x: (x - v.ox) / v.s, y: (y - v.oy) / v.s };
}

function initMoon() {
  const S = calcStats();
  const M = moon;
  M.p = { x: ARENA.w / 2, y: ARENA.h - 150, vx: 0, vy: 0, hp: S.maxhp, maxhp: S.maxhp, cool: 0, inv: 2, ang: -Math.PI / 2 };
  M.aliens = []; M.bullets = []; M.ebullets = []; M.boss = null;
  M.wave = 0; M.waveT = 0; M.t = 0; M.banner = 0; M.state = 'fight'; M.endT = 0; M.shake = 0; M.kills = 0;
  M.stars = []; M.dust = []; M.rocks = [];
  M.allies = []; M.alliance = false; M.radio = 0; M.radioText = '';
  for (let i = 0; i < 200; i++) M.stars.push({ x: rnd(0, 1), y: rnd(0, 1), r: rnd(0.4, 1.7), p: rnd(0, 6.3) });
  for (let i = 0; i < 40; i++) M.dust.push({ x: rnd(0, ARENA.w), y: rnd(ARENA.h * 0.58, ARENA.h), r: rnd(14, 60) });
  for (let i = 0; i < 26; i++) M.rocks.push({ x: rnd(20, ARENA.w - 20), y: rnd(ARENA.h * 0.62, ARENA.h - 20), s: rnd(4, 14) });
  setScene('moon');
  nextWave();
  toast('已進入母船內部 — 目標：核心反應爐');
}

function addAlien(type, x, y) {
  moon.aliens.push({
    type, x, y,
    hp: type === 'grunt' ? 4 : 6,
    maxhp: type === 'grunt' ? 4 : 6,
    r: type === 'grunt' ? 15 : 18,
    speed: type === 'grunt' ? 100 : 74,
    cool: rnd(1, 2.4), t: rnd(0, 6), hit: 0, ang: 0
  });
}

function nextWave() {
  moon.wave++;
  moon.aliens = [];
  if (moon.wave <= 2) {
    const grunts = moon.wave === 1 ? 6 : 7;
    for (let i = 0; i < grunts; i++) addAlien('grunt', rnd(90, ARENA.w - 90), rnd(-120, -30));
    if (moon.wave === 2) for (let i = 0; i < 3; i++) addAlien('shooter', rnd(90, ARENA.w - 90), rnd(-140, -60));
    moon.bannerText = '母船守軍 · 第 ' + moon.wave + ' 波';
    moon.banner = 2.2;
    sfx('wave');
  } else {
    moon.boss = { x: ARENA.w / 2, y: 175, r: 64, hp: 200, maxhp: 200, t: 0, fire: 2.4, spawn: 6, hit: 0, ang: 0, vy: 0 };
    moon.bannerText = '母船核心 · 反應爐';
    moon.banner = 2.6;
    sfx('boss');
    toast('擊毀核心！');
  }
}

function hurtMoon(n) {
  const P = moon.p, S = calcStats();
  if (P.inv > 0 || moon.state !== 'fight') return;
  P.hp -= n * (1 - S.armor * 0.6);
  P.inv = 0.75;
  moon.shake = Math.min(16, moon.shake + 8);
  sfx('hurt');
  if (P.hp <= 0) { P.hp = 0; moonLose(); }
}

function moonLose() {
  if (moon.state !== 'fight') return;
  moon.state = 'lose';
  moon.endT = 0;
  sfx('lose');
  setTimeout(() => {
    openModal('太空裝失效', `<p class="muted">面罩裂開，氧氣在母船的冷光裡無聲地流走。你的視線慢慢變暗……</p>
      <p class="muted" style="margin-top:10px">基地的維生艙把你拉了回來。裝備還在，母船還在。</p>`,
      [{ label: '再次出擊', cls: 'primary', onClick: () => transition(initMoon) },
       { label: '返回基地', onClick: () => transition(() => { game.pos = { x: 40, y: 150 }; initSea(false); setScene('sea'); }) }]);
  }, 900);
}

function moonWin() {
  if (moon.state !== 'fight') return;
  moon.state = 'win';
  moon.endT = 0;
  sfx('win');
  for (let i = 0; i < 40; i++) {
    const a = rnd(0, Math.PI * 2), s = rnd(40, 320);
    moon.ebullets.push({ x: moon.boss ? moon.boss.x : ARENA.w / 2, y: moon.boss ? moon.boss.y : 200, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.4, 1.1), r: rnd(3, 8), dmg: 0, boom: true });
  }
}

function fireMoon() {
  const P = moon.p, S = calcStats();
  if (P.cool > 0 || moon.state !== 'fight') return;
  P.cool = S.fireRate;
  const mw = window.MOUSE ? screenToArena(window.MOUSE.x, window.MOUSE.y) : { x: P.x, y: P.y - 200 };
  const ang = Math.atan2(mw.y - P.y, mw.x - P.x);
  P.ang = ang;
  moon.bullets.push({
    x: P.x + Math.cos(ang) * 20, y: P.y + Math.sin(ang) * 20,
    vx: Math.cos(ang) * 760, vy: Math.sin(ang) * 760, life: 1.1, dmg: S.dmg, ang
  });
  tone(640, 0.05, 'square', 0.07, 260);
}

function callAlliance() {
  if (moon.alliance) return;
  moon.alliance = true;
  moon.radioText = '「這裡是地球同盟軍第三艦隊——我們來接你回家了。」';
  moon.radio = 5.5;
  moon.bannerText = '人類同盟軍 抵達';
  moon.banner = 2.6;
  sfx('wave');
  for (let i = 0; i < 4; i++) {
    moon.allies.push({ x: ARENA.w / 2 + (i - 1.5) * 90, y: ARENA.h + 80 + i * 30, ang: -Math.PI / 2, cool: rnd(0.3, 1.2), t: rnd(0, 6) });
  }
  toast('人類同盟軍加入戰鬥！', 'gold');
}

function updateAllies(dt) {
  const M = moon;
  if (!M.alliance) return;
  for (const a of M.allies) {
    a.t += dt;
    const targetY = ARENA.h - 120 + Math.sin(a.t * 0.9 + a.x) * 26;
    const targetX = ARENA.w / 2 + Math.cos(a.t * 0.55 + a.x * 0.01) * 360;
    a.x = lerp(a.x, targetX, 1 - Math.exp(-1.6 * dt));
    a.y = lerp(a.y, targetY, 1 - Math.exp(-1.6 * dt));
    a.ang = lerpAngle(a.ang, Math.atan2((M.boss ? M.boss.y : 200) - a.y, (M.boss ? M.boss.x : ARENA.w / 2) - a.x), 1 - Math.exp(-3 * dt));
    a.cool -= dt;
    if (a.cool <= 0) {
      a.cool = 0.55;
      const tgt = M.boss;
      const ang = tgt ? Math.atan2(tgt.y - a.y, tgt.x - a.x) : a.ang;
      M.bullets.push({
        x: a.x + Math.cos(ang) * 16, y: a.y + Math.sin(ang) * 16,
        vx: Math.cos(ang) * 900, vy: Math.sin(ang) * 900, life: 1.1, dmg: 2, ang, ally: true
      });
    }
  }
}

function updateMoon(dt) {
  const M = moon, P = M.p, keys = window.KEYS || {};
  M.t += dt;
  game.stats.time += dt;

  if (M.shake > 0) M.shake = Math.max(0, M.shake - 24 * dt);
  if (M.banner > 0) M.banner -= dt;
  if (M.radio > 0) M.radio -= dt;

  if (M.state === 'win' || M.state === 'lose') {
    M.endT += dt;
    for (const b of M.ebullets) { b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; }
    M.ebullets = M.ebullets.filter(b => b.life > 0);
    if (M.state === 'win' && M.endT > 2.4) { showEnding(true); saveGame(); }
    return;
  }

  /* 同盟軍 */
  updateAllies(dt);

  /* 移動 */
  let ix = 0, iy = 0;
  if (keys['w'] || keys['arrowup']) iy--;
  if (keys['s'] || keys['arrowdown']) iy++;
  if (keys['a'] || keys['arrowleft']) ix--;
  if (keys['d'] || keys['arrowright']) ix++;
  if (ix || iy) { const m = Math.hypot(ix, iy); ix /= m; iy /= m; }
  const sprint = !!(keys['shift'] || keys['shiftleft']);
  const maxsp = 270 * (sprint ? 1.45 : 1);
  P.vx = lerp(P.vx, ix * maxsp, 1 - Math.exp(-8 * dt));
  P.vy = lerp(P.vy, iy * maxsp, 1 - Math.exp(-8 * dt));
  P.x = clamp(P.x + P.vx * dt, 26, ARENA.w - 26);
  P.y = clamp(P.y + P.vy * dt, 70, ARENA.h - 26);
  if (P.inv > 0) P.inv -= dt;
  if (P.cool > 0) P.cool -= dt;
  if (window.MOUSE && window.MOUSE.down) fireMoon();
  if (window.MOUSE) {
    const mw = screenToArena(window.MOUSE.x, window.MOUSE.y);
    P.ang = Math.atan2(mw.y - P.y, mw.x - P.x);
  }
  if (Math.random() < 0.35) {
    M.ebullets.push({ x: P.x + rnd(-8, 8), y: P.y + 16, vx: rnd(-10, 10), vy: rnd(20, 50), life: 0.6, r: rnd(1.5, 3), dmg: 0, dust: true });
  }

  /* 外星人 */
  for (const a of M.aliens) {
    if (a.dead) continue;
    a.t += dt;
    if (a.hit > 0) a.hit -= dt;
    const dx = P.x - a.x, dy = P.y - a.y;
    const d = Math.hypot(dx, dy) || 1;
    const ang = Math.atan2(dy, dx);
    a.ang = lerpAngle(a.ang || ang, ang, 1 - Math.exp(-4 * dt));
    if (a.type === 'grunt') {
      a.x += Math.cos(ang) * a.speed * dt;
      a.y += Math.sin(ang) * a.speed * dt;
      if (d < a.r + 16) hurtMoon(9);
    } else {
      const want = 300;
      const dir = d > want + 40 ? 1 : d < want - 40 ? -1 : 0;
      a.x += Math.cos(ang) * dir * a.speed * dt + Math.cos(ang + Math.PI / 2) * Math.sin(a.t) * 40 * dt;
      a.y += Math.sin(ang) * dir * a.speed * dt + Math.sin(ang + Math.PI / 2) * Math.sin(a.t) * 40 * dt;
      a.cool -= dt;
      if (a.cool <= 0) {
        a.cool = 2.1;
        M.ebullets.push({ x: a.x, y: a.y, vx: Math.cos(ang) * 250, vy: Math.sin(ang) * 250, life: 3.4, r: 6, dmg: 8 });
        tone(300, 0.1, 'sawtooth', 0.06, 140);
      }
      if (d < a.r + 14) hurtMoon(8);
    }
    a.x = clamp(a.x, 20, ARENA.w - 20);
    a.y = clamp(a.y, 40, ARENA.h - 20);
  }

  /* 核心 Boss */
  if (M.boss) {
    const B = M.boss;
    B.t += dt;
    if (B.hit > 0) B.hit -= dt;
    B.x = ARENA.w / 2 + Math.sin(B.t * 0.3) * 270;
    B.y = 175 + Math.sin(B.t * 0.7) * 26;
    B.ang = Math.atan2(P.y - B.y, P.x - B.x);
    B.fire -= dt;
    if (B.fire <= 0) {
      B.fire = Math.max(1.5, 2.4 - (1 - B.hp / B.maxhp) * 0.7);
      const n = 10;
      const off = B.t * 0.5;
      for (let i = 0; i < n; i++) {
        const a = off + i / n * Math.PI * 2;
        M.ebullets.push({ x: B.x, y: B.y, vx: Math.cos(a) * 165, vy: Math.sin(a) * 165, life: 3.4, r: 7, dmg: 7, alien: true });
      }
      const aim = Math.atan2(P.y - B.y, P.x - B.x);
      for (let i = -1; i <= 1; i++) {
        M.ebullets.push({ x: B.x, y: B.y + 20, vx: Math.cos(aim + i * 0.16) * 260, vy: Math.sin(aim + i * 0.16) * 260, life: 4, r: 6, dmg: 8, alien: true });
      }
      tone(120, 0.28, 'sawtooth', 0.12, 60);
    }
    B.spawn -= dt;
    if (B.spawn <= 0 && M.aliens.length < 5) {
      B.spawn = 7;
      addAlien('grunt', B.x - 60, B.y + 40);
      addAlien('grunt', B.x + 60, B.y + 40);
    }
    if (Math.hypot(P.x - B.x, P.y - B.y) < B.r + 16) hurtMoon(13);
    /* 同盟軍登場 */
    if (!M.alliance && B.hp < B.maxhp * 0.55) callAlliance();
  }

  /* 玩家子彈 */
  for (const b of M.bullets) {
    if (b.dead) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0 || b.x < -40 || b.x > ARENA.w + 40 || b.y < -40 || b.y > ARENA.h + 40) { b.dead = true; continue; }
    let hitDone = false;
    for (const a of M.aliens) {
      if (a.dead) continue;
      if (Math.hypot(a.x - b.x, a.y - b.y) < a.r + 5) {
        a.hp -= b.dmg; a.hit = 0.14; b.dead = true; hitDone = true;
        if (a.hp <= 0) {
          a.dead = true; M.kills++; game.stats.kills++;
          sfx('boom');
          for (let i = 0; i < 12; i++) {
            const ang = rnd(0, 6.3), s = rnd(30, 190);
            M.ebullets.push({ x: a.x, y: a.y, vx: Math.cos(ang) * s, vy: Math.sin(ang) * s, life: rnd(0.25, 0.6), r: rnd(2, 4), dmg: 0, boom: true });
          }
        }
        break;
      }
    }
    if (!hitDone && M.boss && Math.hypot(M.boss.x - b.x, M.boss.y - b.y) < M.boss.r) {
      M.boss.hp -= b.dmg; M.boss.hit = 0.12; b.dead = true;
      if (M.boss.hp <= 0) { M.boss.hp = 0; moonWin(); }
    }
  }
  M.bullets = M.bullets.filter(b => !b.dead);
  M.aliens = M.aliens.filter(a => !a.dead);

  /* 敵方子彈 */
  for (const b of M.ebullets) {
    if (b.dead) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if (b.life <= 0) { b.dead = true; continue; }
    if (b.dmg > 0 && Math.hypot(P.x - b.x, P.y - b.y) < 20) {
      b.dead = true; hurtMoon(b.dmg);
    }
  }
  M.ebullets = M.ebullets.filter(b => !b.dead);

  /* 波次 */
  if (M.state === 'fight' && !M.boss && M.aliens.length === 0) {
    M.waveT += dt;
    if (M.waveT > 1.7) { M.waveT = 0; nextWave(); }
  }
}

/* ---------- 母船內部繪製 ---------- */
function drawMoon() {
  const M = moon, P = M.p;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, VW, VH);

  /* 艙內背景 */
  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#05070d');
  g.addColorStop(0.45, '#080c14');
  g.addColorStop(1, '#0b0f18');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);

  /* 牆上的外星紋理 */
  ctx.save();
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 9; i++) {
    const y = (i * 90 + 40) % VH;
    ctx.strokeStyle = i % 2 ? 'rgba(140,90,200,.18)' : 'rgba(70,120,160,.14)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let x = -40; x <= VW + 40; x += 50) {
      const yy = y + Math.sin(x * 0.008 + M.t * 0.3 + i) * 12;
      if (x === -40) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();

  /* 地板 */
  const v = moonView();
  const shx = M.shake > 0 ? rnd(-M.shake, M.shake) : 0;
  const shy = M.shake > 0 ? rnd(-M.shake, M.shake) : 0;
  ctx.save();
  ctx.translate(v.ox + shx, v.oy + shy);
  ctx.scale(v.s, v.s);

  /* 艙壁 */
  const wallG = ctx.createLinearGradient(0, 0, 0, ARENA.h * 0.74);
  wallG.addColorStop(0, '#05080e');
  wallG.addColorStop(0.55, '#0a1019');
  wallG.addColorStop(1, '#121a26');
  ctx.fillStyle = wallG;
  ctx.fillRect(0, 0, ARENA.w, ARENA.h * 0.74);

  /* 肋拱 */
  for (let i = 0; i <= 8; i++) {
    const x = i / 8 * ARENA.w;
    ctx.strokeStyle = 'rgba(90,140,180,.11)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.quadraticCurveTo(ARENA.w / 2, ARENA.h * 0.36, x * 0.55 + ARENA.w * 0.22, ARENA.h * 0.74);
    ctx.stroke();
  }
  /* 管道束 */
  for (let i = 0; i < 5; i++) {
    const y = 26 + i * 20;
    ctx.strokeStyle = 'rgba(120,170,210,.12)';
    ctx.lineWidth = 2 + (i % 2);
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA.w, y + (i % 2 ? 6 : -4)); ctx.stroke();
    for (let j = 1; j < 8; j++) {
      const jx = j / 8 * ARENA.w;
      ctx.fillStyle = 'rgba(60,90,120,.35)';
      ctx.fillRect(jx - 3, y - 5, 6, 10);
    }
  }
  /* 觀景窗（看到月球） */
  ctx.save();
  const wx = ARENA.w - 372, wy = 72, ww = 300, wh = 106;
  ctx.fillStyle = '#02060c';
  ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 14); ctx.fill();
  ctx.save();
  ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 14); ctx.clip();
  const sky2 = ctx.createLinearGradient(0, wy, 0, wy + wh);
  sky2.addColorStop(0, '#01030a'); sky2.addColorStop(1, '#0a1524');
  ctx.fillStyle = sky2; ctx.fillRect(wx, wy, ww, wh);
  for (let i = 0; i < 46; i++) {
    ctx.fillStyle = 'rgba(220,240,255,.7)';
    ctx.fillRect(wx + (i * 97) % ww, wy + (i * 53) % (wh * 0.85), 1.6, 1.6);
  }
  ctx.fillStyle = '#b9c8d8';
  ctx.beginPath(); ctx.arc(wx + ww * 0.72, wy + wh * 0.8, wh * 0.42, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(120,140,165,.5)';
  ctx.beginPath(); ctx.arc(wx + ww * 0.66, wy + wh * 0.72, wh * 0.1, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.arc(wx + ww * 0.8, wy + wh * 0.9, wh * 0.07, 0, 7); ctx.fill();
  /* 窗上反光 */
  const rg2 = ctx.createLinearGradient(wx, wy, wx + ww, wy + wh);
  rg2.addColorStop(0, 'rgba(150,220,255,.08)');
  rg2.addColorStop(0.5, 'rgba(150,220,255,0)');
  ctx.fillStyle = rg2; ctx.fillRect(wx, wy, ww, wh);
  ctx.restore();
  ctx.strokeStyle = 'rgba(120,200,255,.4)';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.roundRect(wx, wy, ww, wh, 14); ctx.stroke();
  ctx.strokeStyle = 'rgba(120,200,255,.14)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(wx - 8, wy - 8, ww + 16, wh + 16, 18); ctx.stroke();
  ctx.restore();

  /* 牆腳燈帶 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const fg3 = ctx.createLinearGradient(0, ARENA.h * 0.66, 0, ARENA.h * 0.78);
  fg3.addColorStop(0, 'rgba(90,200,255,0)');
  fg3.addColorStop(0.7, 'rgba(90,200,255,.10)');
  fg3.addColorStop(1, 'rgba(90,200,255,0)');
  ctx.fillStyle = fg3;
  ctx.fillRect(0, ARENA.h * 0.66, ARENA.w, ARENA.h * 0.12);
  ctx.restore();

  ctx.fillStyle = '#11161f';
  ctx.beginPath();
  ctx.moveTo(0, ARENA.h);
  ctx.lineTo(0, ARENA.h * 0.72);
  for (let x = 0; x <= ARENA.w; x += 40) {
    ctx.lineTo(x, ARENA.h * 0.72 + Math.sin(x * 0.006) * 10 + Math.cos(x * 0.013) * 5);
  }
  ctx.lineTo(ARENA.w, ARENA.h);
  ctx.closePath(); ctx.fill();

  /* 地板格線與燈帶 */
  ctx.strokeStyle = 'rgba(90,160,200,.14)';
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 14; i++) {
    const y = ARENA.h * 0.72 + i * 22;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(ARENA.w, y); ctx.stroke();
  }
  for (let i = 0; i < 20; i++) {
    const x = i * 64;
    ctx.beginPath(); ctx.moveTo(x, ARENA.h * 0.72); ctx.lineTo(x + (i - 10) * 12, ARENA.h); ctx.stroke();
  }
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 6; i++) {
    const y = ARENA.h * 0.74 + i * 44;
    ctx.fillStyle = 'rgba(90,220,255,.05)';
    ctx.fillRect(0, y, ARENA.w, 2);
  }
  ctx.restore();

  /* 岩石／殘骸 */
  for (const r of M.rocks) {
    ctx.fillStyle = 'rgba(40,46,58,.9)';
    ctx.beginPath();
    ctx.moveTo(r.x - r.s, r.y + r.s * 0.5);
    ctx.lineTo(r.x - r.s * 0.3, r.y - r.s * 0.6);
    ctx.lineTo(r.x + r.s * 0.5, r.y - r.s * 0.4);
    ctx.lineTo(r.x + r.s, r.y + r.s * 0.5);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(120,150,180,.10)';
    ctx.beginPath();
    ctx.moveTo(r.x - r.s * 0.3, r.y - r.s * 0.6);
    ctx.lineTo(r.x + r.s * 0.5, r.y - r.s * 0.4);
    ctx.lineTo(r.x + r.s * 0.1, r.y);
    ctx.closePath(); ctx.fill();
  }
  for (const d of M.dust) {
    ctx.fillStyle = 'rgba(40,48,62,.22)';
    ctx.beginPath(); ctx.ellipse(d.x, d.y, d.r, d.r * 0.4, 0, 0, 7); ctx.fill();
  }

  /* 場地邊界 */
  ctx.strokeStyle = 'rgba(120,90,180,.16)';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 40, ARENA.w - 8, ARENA.h - 44);

  for (const a of M.aliens) drawAlien(a);
  if (M.boss) drawBoss(M.boss);
  for (const a of M.allies) drawAlly(a);

  /* 子彈 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const b of M.bullets) {
    ctx.strokeStyle = b.ally ? 'rgba(150,220,255,.95)' : 'rgba(190,250,255,.95)';
    ctx.lineWidth = b.ally ? 4 : 3.5;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - Math.cos(b.ang) * 26, b.y - Math.sin(b.ang) * 26);
    ctx.stroke();
  }
  for (const b of M.ebullets) {
    if (b.boom) {
      ctx.fillStyle = 'rgba(255,' + Math.floor(120 + Math.random() * 100) + ',80,.95)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    } else if (b.dust) {
      ctx.fillStyle = 'rgba(180,200,215,.25)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(255,90,130,.95)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,120,150,.28)';
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 2.4, 0, 7); ctx.fill();
    }
  }
  ctx.restore();

  drawAstronaut(P);
  ctx.restore();

  drawMoonHud();

  if (M.banner > 0) {
    const a = clamp(M.banner / 0.8, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.font = '900 40px "Microsoft JhengHei",system-ui';
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.fillText(M.bannerText, VW / 2 + 2, VH * 0.46 + 2);
    ctx.fillStyle = M.bannerText.indexOf('同盟') >= 0 ? '#9fe4ff' : (moon.wave >= 3 ? '#ffb3c1' : '#cdefff');
    ctx.fillText(M.bannerText, VW / 2, VH * 0.46);
    ctx.restore();
  }

  /* 無線電字幕 */
  if (M.radio > 0) {
    const a = clamp(M.radio / 1.2, 0, 1);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    const lines = [M.radioText];
    ctx.font = '600 15px "Microsoft JhengHei",system-ui';
    const w = ctx.measureText(lines[0]).width + 44;
    ctx.fillStyle = 'rgba(4,16,26,.82)';
    ctx.beginPath(); ctx.roundRect(VW / 2 - w / 2, VH * 0.72, w, 44, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(150,220,255,.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(VW / 2 - w / 2, VH * 0.72, w, 44, 10); ctx.stroke();
    ctx.fillStyle = '#bfe6ff';
    ctx.fillText(lines[0], VW / 2, VH * 0.72 + 28);
    ctx.restore();
  }
}

function drawAlien(a) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.ang || 0);
  const flash = a.hit > 0;
  const s = a.r / 15;
  ctx.scale(s, s);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gg = ctx.createRadialGradient(0, 0, 0, 0, 0, 40);
  gg.addColorStop(0, a.type === 'grunt' ? 'rgba(255,80,120,.22)' : 'rgba(200,120,255,.26)');
  gg.addColorStop(1, 'rgba(255,80,120,0)');
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(0, 0, 40, 0, 7); ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const tg = ctx.createLinearGradient(-12, 0, -46, 0);
  tg.addColorStop(0, 'rgba(255,120,150,.55)');
  tg.addColorStop(1, 'rgba(255,120,150,0)');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.moveTo(-12, -5);
  ctx.lineTo(-42 + Math.sin(a.t * 11) * 5, 0);
  ctx.lineTo(-12, 5);
  ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.fillStyle = flash ? '#ffffff' : (a.type === 'grunt' ? '#2c1c3d' : '#241a38');
  ctx.beginPath(); ctx.moveTo(6, -4); ctx.lineTo(-9, -21); ctx.lineTo(-18, -17); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(6, 4); ctx.lineTo(-9, 21); ctx.lineTo(-18, 17); ctx.lineTo(-6, 0); ctx.closePath(); ctx.fill();

  ctx.fillStyle = flash ? '#ffffff' : (a.type === 'grunt' ? '#412338' : '#3a2a52');
  ctx.beginPath();
  ctx.moveTo(22, 0); ctx.lineTo(6, -11); ctx.lineTo(-12, -8); ctx.lineTo(-16, 0);
  ctx.lineTo(-12, 8); ctx.lineTo(6, 11);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = a.type === 'grunt' ? 'rgba(255,120,150,.85)' : 'rgba(200,150,255,.9)';
  ctx.lineWidth = 1.6; ctx.stroke();

  const coreA = 0.7 + Math.sin(a.t * 6) * 0.3;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cg2 = ctx.createRadialGradient(2, 0, 1, 2, 0, 14);
  cg2.addColorStop(0, a.type === 'grunt' ? 'rgba(255,110,140,' + coreA + ')' : 'rgba(200,150,255,' + coreA + ')');
  cg2.addColorStop(1, 'rgba(255,80,120,0)');
  ctx.fillStyle = cg2;
  ctx.beginPath(); ctx.arc(2, 0, 14, 0, 7); ctx.fill();
  ctx.restore();
  ctx.fillStyle = a.type === 'grunt' ? '#ff4d6d' : '#c08cff';
  ctx.beginPath(); ctx.arc(2, 0, 4.4, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  ctx.beginPath(); ctx.arc(3.2, -1.2, 1.6, 0, 7); ctx.fill();

  if (a.hp < a.maxhp) {
    ctx.fillStyle = 'rgba(0,0,0,.5)';
    ctx.fillRect(-16, -26, 32, 4);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(-16, -26, 32 * (a.hp / a.maxhp), 4);
  }
  ctx.restore();
}

function drawAlly(a) {
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.rotate(a.ang || 0);
  ctx.scale(1.3, 1.3);

  /* 引擎 */
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const tg = ctx.createLinearGradient(-14, 0, -44, 0);
  tg.addColorStop(0, 'rgba(120,200,255,.7)');
  tg.addColorStop(1, 'rgba(120,200,255,0)');
  ctx.fillStyle = tg;
  ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(-44, 0); ctx.lineTo(-14, 4); ctx.closePath(); ctx.fill();
  ctx.restore();

  /* 機身 */
  ctx.fillStyle = '#cfd9e6';
  ctx.beginPath();
  ctx.moveTo(20, 0); ctx.lineTo(2, -7); ctx.lineTo(-14, -5); ctx.lineTo(-14, 5); ctx.lineTo(2, 7);
  ctx.closePath(); ctx.fill();
  /* 機翼 */
  ctx.fillStyle = '#8fa8b5';
  ctx.beginPath(); ctx.moveTo(4, -3); ctx.lineTo(-6, -16); ctx.lineTo(-12, -14); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(4, 3); ctx.lineTo(-6, 16); ctx.lineTo(-12, 14); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
  /* 座艙 */
  ctx.fillStyle = '#6fe3ff';
  ctx.beginPath(); ctx.arc(7, 0, 3.4, 0, 7); ctx.fill();
  /* 標記 */
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(-10, -1.5, 6, 3);
  ctx.restore();
}

function drawBoss(B) {
  ctx.save();
  ctx.translate(B.x, B.y);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gg = ctx.createRadialGradient(0, 0, 30, 0, 0, 190);
  gg.addColorStop(0, 'rgba(255,60,110,.24)');
  gg.addColorStop(0.6, 'rgba(150,60,255,.12)');
  gg.addColorStop(1, 'rgba(150,60,255,0)');
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(0, 0, 190, 0, 7); ctx.fill();
  ctx.restore();

  ctx.rotate(B.t * 0.15);

  ctx.strokeStyle = 'rgba(180,140,255,.55)';
  ctx.lineWidth = 7;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(0, 0, 78, i * 1.05, i * 1.05 + 0.62);
    ctx.stroke();
  }

  ctx.fillStyle = B.hit > 0 ? '#ffffff' : '#43325f';
  ctx.beginPath();
  ctx.moveTo(0, -56); ctx.lineTo(46, -20); ctx.lineTo(58, 22);
  ctx.lineTo(0, 58); ctx.lineTo(-58, 22); ctx.lineTo(-46, -20);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(200,160,255,.7)';
  ctx.lineWidth = 2.5; ctx.stroke();

  const pulse = 0.6 + Math.sin(B.t * 4) * 0.4;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createRadialGradient(0, 0, 2, 0, 0, 44 * pulse);
  cg.addColorStop(0, 'rgba(255,240,255,.7)');
  cg.addColorStop(0.3, 'rgba(255,90,130,.55)');
  cg.addColorStop(1, 'rgba(255,60,110,0)');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.arc(0, 0, 34 * pulse, 0, 7); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,150,180,.8)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.stroke();
  ctx.fillStyle = '#ffd9e3';
  ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill();

  ctx.fillStyle = '#4b3766';
  for (const a2 of [0.6, 2.4, 4.2]) {
    ctx.beginPath();
    ctx.ellipse(Math.cos(a2) * 44, Math.sin(a2) * 44, 9, 6, a2, 0, 7);
    ctx.fill();
  }
  ctx.rotate(-B.t * 0.15);
  ctx.restore();
}

function drawAstronaut(P) {
  ctx.save();
  ctx.translate(P.x, P.y);
  const flick = P.inv > 0 && Math.floor(P.inv * 14) % 2 === 0;

  const moving = Math.hypot(P.vx, P.vy) > 40;
  if (moving) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const fl = ctx.createLinearGradient(0, 14, 0, 40);
    fl.addColorStop(0, 'rgba(150,230,255,.7)');
    fl.addColorStop(1, 'rgba(90,170,255,0)');
    ctx.fillStyle = fl;
    ctx.beginPath(); ctx.ellipse(0, 26, 7, 14, 0, 0, 7); ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = flick ? '#ffffff' : '#d7e6f2';
  ctx.beginPath(); ctx.roundRect(-11, -12, 22, 26, 8); ctx.fill();
  ctx.strokeStyle = 'rgba(90,130,160,.6)'; ctx.lineWidth = 1.5; ctx.stroke();

  ctx.fillStyle = '#8fa8bb';
  ctx.beginPath(); ctx.roundRect(-16, -8, 8, 18, 3); ctx.fill();

  ctx.fillStyle = flick ? '#ffffff' : '#eef7ff';
  ctx.beginPath(); ctx.arc(0, -20, 12, 0, 7); ctx.fill();
  ctx.strokeStyle = 'rgba(90,130,160,.6)'; ctx.stroke();
  ctx.fillStyle = 'rgba(60,170,220,.85)';
  ctx.beginPath(); ctx.arc(1, -20, 8, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.beginPath(); ctx.ellipse(-2, -23, 3.5, 2.2, -0.5, 0, 7); ctx.fill();

  ctx.rotate(P.ang);
  ctx.fillStyle = '#3d4c58';
  ctx.beginPath(); ctx.roundRect(6, -3, 22, 6, 2); ctx.fill();
  ctx.fillStyle = '#9fe4ff';
  ctx.fillRect(24, -2, 6, 4);

  ctx.restore();
}

function drawMoonHud() {
  const M = moon, P = M.p;
  ctx.save();
  const w = 220, x = 26, y = VH - 64;
  ctx.fillStyle = 'rgba(2,10,18,.7)';
  ctx.strokeStyle = 'rgba(255,120,140,.3)';
  ctx.beginPath(); ctx.roundRect(x, y, w, 40, 8); ctx.fill(); ctx.stroke();
  ctx.font = '700 11px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = '#ffb3c3';
  ctx.textAlign = 'left';
  ctx.fillText('太空裝', x + 12, y + 17);
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath(); ctx.roundRect(x + 12, y + 23, w - 24, 9, 5); ctx.fill();
  const hg = ctx.createLinearGradient(x, 0, x + w, 0);
  hg.addColorStop(0, '#ff5d73'); hg.addColorStop(1, '#ffb36b');
  ctx.fillStyle = hg;
  ctx.beginPath(); ctx.roundRect(x + 12, y + 23, (w - 24) * clamp(P.hp / P.maxhp, 0, 1), 9, 5); ctx.fill();
  ctx.fillStyle = '#ffd9df'; ctx.font = '10px system-ui';
  ctx.fillText(Math.ceil(P.hp) + ' / ' + P.maxhp, x + 12, y + 46);

  ctx.textAlign = 'center';
  ctx.font = '700 13px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(180,230,255,.75)';
  ctx.fillText(M.boss ? '母船核心' : '外星母船 · 內部　第 ' + M.wave + ' 波', VW / 2, 34);

  if (M.boss) {
    const bw = Math.min(520, VW * 0.5), bx = VW / 2 - bw / 2, by = 46;
    ctx.fillStyle = 'rgba(0,0,0,.6)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, 14, 7); ctx.fill();
    const bg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
    bg.addColorStop(0, '#ff3d5f'); bg.addColorStop(0.6, '#ff8a5c'); bg.addColorStop(1, '#ffd166');
    ctx.fillStyle = bg;
    ctx.beginPath(); ctx.roundRect(bx, by, bw * clamp(M.boss.hp / M.boss.maxhp, 0, 1), 14, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(255,140,170,.5)';
    ctx.beginPath(); ctx.roundRect(bx, by, bw, 14, 7); ctx.stroke();
  } else {
    ctx.textAlign = 'right';
    ctx.font = '12px "Microsoft JhengHei",system-ui';
    ctx.fillStyle = 'rgba(160,210,230,.75)';
    ctx.fillText('剩餘敵人 ' + M.aliens.length, VW - 26, 34);
  }

  if (M.alliance) {
    ctx.textAlign = 'left';
    ctx.font = '700 11px "Microsoft JhengHei",system-ui';
    ctx.fillStyle = 'rgba(159,228,255,.9)';
    ctx.fillText('同盟軍  ' + M.allies.length + ' 架', 28, VH - 86);
  }

  ctx.textAlign = 'center';
  ctx.font = '11.5px "Microsoft JhengHei",system-ui';
  ctx.fillStyle = 'rgba(150,200,220,.55)';
  ctx.fillText('WASD 移動　·　滑鼠瞄準 / 按住發射　·　Shift 加速', VW / 2, VH - 14);
  ctx.restore();
}
