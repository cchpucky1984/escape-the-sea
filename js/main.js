'use strict';
/* =========================================================
   逃出大海 — main：輸入 / 場景 / 主迴圈 / 啟動
   ========================================================= */

const KEYS = {};
window.KEYS = KEYS;
const MOUSE = { x: 0, y: 0, down: false, inside: false };
window.MOUSE = MOUSE;

/* ---------- 場景 ---------- */
function setScene(s) {
  game.scene = s;
  game.paused = false;
  document.body.dataset.scene = s;
  $('hud').style.display = s === 'sea' ? 'flex' : 'none';
  $('hint').style.display = s === 'sea' ? 'block' : 'none';
  if (s === 'sea' || s === 'launch' || s === 'dock' || s === 'moon') {
    $('title').hidden = true;
    $('intro').hidden = true;
    $('ending').hidden = true;
  }
  if (s === 'sea') refreshHud();
}

/* ---------- 鍵盤 ---------- */
window.addEventListener('keydown', (e) => {
  const k = (e.key || '').toLowerCase();
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  if (e.repeat) { KEYS[k] = true; return; }
  KEYS[k] = true;
  initAudio();

  if (k === 'escape') {
    if (modalEl.classList.contains('show')) closeModal();
    else if (game.scene === 'sea' || game.scene === 'moon' || game.scene === 'launch' || game.scene === 'dock') openPause();
    return;
  }
  if (k === 'm') {
    muted = !muted;
    game.muted = muted;
    applyMute();
    toast(muted ? '音效已關閉' : '音效已開啟');
    saveGame();
    return;
  }
  if (game.paused) return;
  if (game.scene === 'sea') {
    if (k === 'b') openBase();
    if (k === 'c') openCraft();
    if (k === 'j') openQuests();
    if (k === ' ') shootSea();
  }
  if (game.scene === 'intro' && (k === ' ' || k === 'enter')) nextIntro();
});
window.addEventListener('keyup', (e) => {
  KEYS[(e.key || '').toLowerCase()] = false;
});
window.addEventListener('blur', () => {
  for (const k in KEYS) KEYS[k] = false;
  MOUSE.down = false;
});

cv.addEventListener('mousemove', (e) => {
  MOUSE.x = e.clientX; MOUSE.y = e.clientY; MOUSE.inside = true;
});
cv.addEventListener('mouseleave', () => { MOUSE.inside = false; MOUSE.down = false; });
cv.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  initAudio();
  MOUSE.down = true;
  if (game.paused) return;
  if (game.scene === 'sea') shootSea();
  if (game.scene === 'moon') fireMoon();
});
window.addEventListener('mouseup', () => { MOUSE.down = false; });
cv.addEventListener('contextmenu', (e) => e.preventDefault());

/* ---------- 標題背景 ---------- */
let bgT = 0;
function drawIdleBG(dt) {
  bgT += dt;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const horizon = VH * 0.575;

  const g = ctx.createLinearGradient(0, 0, 0, VH);
  g.addColorStop(0, '#061623');
  g.addColorStop(0.3, '#123a54');
  g.addColorStop(0.5, '#3d7e91');
  g.addColorStop(0.575, '#7fb0bb');
  g.addColorStop(0.62, '#2b5d72');
  g.addColorStop(1, '#071d29');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VW, VH);

  for (let i = 0; i < 60; i++) {
    const x = ((i * 197) % VW), y = ((i * 83) % (horizon * 0.85));
    const tw = 0.3 + 0.7 * Math.abs(Math.sin(bgT * 1.2 + i));
    ctx.globalAlpha = tw * 0.7;
    ctx.fillStyle = '#dff4ff';
    ctx.fillRect(x, y, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;

  const sx = VW * 0.7, sy = horizon - 8;
  const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(VW, VH) * 0.5);
  sg.addColorStop(0, 'rgba(255,206,140,.6)');
  sg.addColorStop(0.4, 'rgba(255,150,95,.2)');
  sg.addColorStop(1, 'rgba(255,120,80,0)');
  ctx.fillStyle = sg;
  ctx.beginPath(); ctx.arc(sx, sy, Math.max(VW, VH) * 0.5, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,226,180,.85)';
  ctx.beginPath(); ctx.arc(sx, sy, Math.min(VW, VH) * 0.035, 0, 7); ctx.fill();

  ctx.save();
  ctx.beginPath(); ctx.rect(0, horizon, VW, VH - horizon); ctx.clip();
  const wg = ctx.createLinearGradient(0, horizon, 0, VH);
  wg.addColorStop(0, '#3d7386');
  wg.addColorStop(0.35, '#1d5064');
  wg.addColorStop(1, '#061a26');
  ctx.fillStyle = wg;
  ctx.fillRect(0, horizon, VW, VH - horizon);

  for (let i = 0; i < 30; i++) {
    const p = i / 30;
    const y = horizon + Math.pow(p, 2.1) * (VH - horizon);
    ctx.strokeStyle = `rgba(190,245,255,${0.10 * (1 - p) + 0.015})`;
    ctx.lineWidth = 1 + p * 1.8;
    ctx.beginPath();
    for (let x = -20; x <= VW + 20; x += 26) {
      const yy = y + Math.sin(x * 0.011 + bgT * 1.3 + i * 0.8) * (1.2 + p * 3.2)
                   + Math.cos(x * 0.004 - bgT * 0.7) * (0.6 + p * 2);
      if (x === -20) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) {
    const p = i / 40;
    const y = horizon + p * (VH - horizon) * 0.7;
    const w = 14 + p * 90 + Math.sin(bgT * 2 + i) * 8;
    const cx = sx + Math.sin(bgT * 1.1 + i * 0.7) * (8 + p * 40);
    ctx.fillStyle = `rgba(255,200,140,${0.16 * (1 - p)})`;
    ctx.beginPath(); ctx.ellipse(cx, y, w, 1.6 + p * 2, 0, 0, 7); ctx.fill();
  }
  ctx.restore();
  ctx.restore();

  const ax = sx + Math.sin(bgT * 0.14) * 50;
  const ay = VH * 0.22 + Math.sin(bgT * 0.4) * 6;
  drawMothership(ax, ay, Math.min(VW, VH) * 0.00042 + 0.55);

  ctx.fillStyle = 'rgba(6,20,28,.85)';
  for (let i = 0; i < 5; i++) {
    const bx = ((i * 331 + bgT * 8) % (VW + 200)) - 100;
    const by = horizon + 40 + i * 42 + Math.sin(bgT + i) * 3;
    ctx.beginPath();
    ctx.roundRect(bx, by, 26 + i * 5, 5 + i * 1.4, 2);
    ctx.fill();
  }
}

function drawMothership(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const gg = ctx.createRadialGradient(0, 0, 10, 0, 0, 150);
  gg.addColorStop(0, 'rgba(255,70,110,.18)');
  gg.addColorStop(1, 'rgba(255,70,110,0)');
  ctx.fillStyle = gg;
  ctx.beginPath(); ctx.arc(0, 0, 150, 0, 7); ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(12,26,36,.92)';
  ctx.beginPath(); ctx.ellipse(0, 0, 110, 22, 0, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -10, 58, 26, 0, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = 'rgba(255,90,120,.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(0, 0, 110, 22, 0, 0, 7); ctx.stroke();

  for (let i = 0; i < 7; i++) {
    const lx = -80 + i * 27;
    const on = Math.sin(bgT * 3 + i) > 0;
    ctx.fillStyle = on ? 'rgba(255,90,120,.95)' : 'rgba(255,90,120,.25)';
    ctx.beginPath(); ctx.arc(lx, 6, 3, 0, 7); ctx.fill();
  }
  const bg = ctx.createLinearGradient(0, 20, 0, VH * 0.6);
  bg.addColorStop(0, 'rgba(255,120,150,.10)');
  bg.addColorStop(1, 'rgba(255,120,150,0)');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(-30, 18); ctx.lineTo(30, 18); ctx.lineTo(110, VH * 0.55); ctx.lineTo(-110, VH * 0.55);
  ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* ---------- 流程 ---------- */
function beginGame() {
  game.pos = { x: 1000, y: 700 };
  initSea(true);
  setScene('sea');
  refreshHud();
  saveGame();
  toast('目標：收集垃圾 → 建造基地 → 飛上月球');
}

$('btn-start').onclick = () => {
  initAudio();
  resetGame();
  startIntro();
};
$('btn-continue').onclick = () => {
  initAudio();
  if (loadGame()) {
    transition(() => {
      initSea(false);
      setScene('sea');
      refreshHud();
    });
    toast('歡迎回來 — 繼續你的工程');
  } else {
    toast('沒有可用的存檔');
  }
};
$('btn-help').onclick = () => { initAudio(); openHelp(); };
$('intro-next').onclick = () => nextIntro();
$('end-again').onclick = () => {
  resetGame();
  location.reload();
};

/* ---------- 主迴圈 ---------- */
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;

  updateQuests(dt);

  if (game.scene === 'sea') {
    if (!game.paused) updateSea(dt);
    if (!game.paused && MOUSE.down) shootSea();
    drawSea();
  } else if (game.scene === 'launch') {
    if (!game.paused) updateLaunch(dt);
    drawLaunch();
  } else if (game.scene === 'dock') {
    if (!game.paused) updateDock(dt);
    drawDock();
  } else if (game.scene === 'moon') {
    if (!game.paused) updateMoon(dt);
    if (!game.paused && MOUSE.down) fireMoon();
    drawMoon();
  } else {
    drawIdleBG(dt);
  }
  requestAnimationFrame(frame);
}

/* ---------- 啟動 ---------- */
if (hasSave()) {
  $('btn-continue').hidden = false;
  $('btn-start').textContent = '重新開始';
}
setScene('title');
requestAnimationFrame(frame);

/* ---------- QA 鉤子 ---------- */
window.__T = {
  game, sea, launch, moon, KEYS, MOUSE,
  initSea, setScene, initLaunch, initMoon, showEnding, beginGame,
  openBase, openCraft, openQuests, openHelp, openPause,
  startLaunch, nextWave, baseRadius, baseTiles, freeTileFor, addStructure,
  initDock, updateDock, drawDock, dock, callAlliance,
  give(k, n) { addRes(k, n); refreshHud(); },
  mountAll() {
    for (const k of STRUCT_KEYS) {
      while (countType(k) < STRUCTS[k].max) addStructure(k);
    }
    refreshHud();
  }
};
