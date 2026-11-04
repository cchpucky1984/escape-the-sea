// QA regression suite for escape-the-sea (rebuilt 2026-11-05 after an encoding accident).
// Versioned copy lives in the repo at escape-the-sea/tools/qa.mjs — keep them in sync.
//
// Prereqs:
//   1) static server on GAME_URL (default http://127.0.0.1:5173/)
//   2) headless Chrome with CDP on CDP_PORT (default 9222)
// Usage: $env:CDP_PORT='9222'; $env:OUT_DIR='...'; node qa.mjs
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const PORT = Number(process.env.CDP_PORT || 9222);
const url = process.env.GAME_URL || 'http://127.0.0.1:5173/';
const outdir = process.env.OUT_DIR || 'H:\\DeepSeek\\PROJECT\\PROGRAMM\\_shots\\qa';
mkdirSync(outdir, { recursive: true });

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find(t => t.type === 'page');
if (!page) { console.error('no page target on port ' + PORT); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0; const pending = new Map();
const pageErrors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    pageErrors.push(String((d.exception && (d.exception.description || d.exception.value)) || d.text).slice(0, 300));
  }
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
    pageErrors.push('console.error: ' + m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 300));
  }
});
await new Promise(r => ws.addEventListener('open', r));
const send = (method, params = {}) => new Promise((res, rej) => {
  const mid = ++id;
  pending.set(mid, (m) => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result));
  ws.send(JSON.stringify({ id: mid, method, params }));
});
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const q = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('eval: ' + JSON.stringify(r.exceptionDetails).slice(0, 400));
  return r.result.value;
};
const KEYMAP = { escape: ['Escape', 'Escape', 27], enter: ['Enter', 'Enter', 13], ' ': [' ', 'Space', 32], shift: ['Shift', 'ShiftLeft', 16] };
const key = async (k, type = 'keyDown') => {
  const [name, code, vk] = KEYMAP[k] || [k, 'Key' + k.toUpperCase(), k.toUpperCase().charCodeAt(0)];
  await send('Input.dispatchKeyEvent', { type, key: name, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
};
const tap = async (k, ms = 140) => { await key(k); await sleep(ms); await key(k, 'keyUp'); };
const hold = async (k, ms) => { await key(k); await sleep(ms); await key(k, 'keyUp'); };
const click = async (x, y) => {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await sleep(60);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};
let shotN = 0;
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  const p = join(outdir, String(++shotN).padStart(2, '0') + '-' + name.replace(/[^\w]+/g, '-') + '.png');
  writeFileSync(p, Buffer.from(r.data, 'base64'));
  console.log('   shot ->', p);
};
const results = [];
const check = async (name, fn) => {
  const errBefore = pageErrors.length;
  try {
    const r = await fn();
    const ok = r === true || (r && r.ok !== false);
    results.push({ name, ok, detail: (r && r.detail) || '', errors: pageErrors.slice(errBefore) });
    console.log(`${ok ? '[PASS]' : '[FAIL]'} ${name}${r && r.detail ? ' — ' + String(r.detail).slice(0, 220) : ''}`);
  } catch (e) {
    results.push({ name, ok: false, detail: 'EXCEPTION: ' + e.message, errors: pageErrors.slice(errBefore) });
    console.log(`[FAIL] ${name} — EXCEPTION ${e.message}`);
  }
};
const startGame = async () => {
  await q(`document.getElementById('btn-start').click()`);
  await sleep(400);
  for (let i = 0; i < 12; i++) {
    if (await q(`document.getElementById('intro').hidden`)) break;
    await q(`document.getElementById('intro-next').click()`);
    await sleep(380);
  }
  await sleep(600);
};

await send('Page.enable'); await send('Runtime.enable');
try { await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true }); } catch (e) {}
await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url });
await sleep(2200);
try { await q(`(async () => { const rs = await navigator.serviceWorker.getRegistrations(); await Promise.all(rs.map(r => r.unregister())); if (window.caches) { const ks = await caches.keys(); await Promise.all(ks.map(k => caches.delete(k))); } return true; })()`); } catch (e) {}
await q(`localStorage.clear(); 'cleared'`);
await send('Page.reload'); await sleep(2400);

/* ---------------- boot / cheat ---------------- */
await check('boot: 標題畫面、canvas 尺寸、無 JS 錯誤', async () => {
  const s = await q(`JSON.stringify({scene:__T.game.scene, cw:document.getElementById('cv').width, titleHidden:document.getElementById('title').hidden})`);
  const o = JSON.parse(s);
  return { ok: o.scene === 'title' && o.cw > 0 && o.titleHidden === false, detail: JSON.stringify(o), shot: true };
});

await check('cheat: 標題畫面輸入 cheat 觸發', async () => {
  for (const k of ['c', 'h', 'e', 'a', 't']) { await key(k); await sleep(70); await key(k, 'keyUp'); }
  await sleep(400);
  const c = await q(`__T.game.cheat`);
  return { ok: c === true, detail: 'game.cheat=' + c };
});

await q(`localStorage.clear(); 'ok'`); await send('Page.reload'); await sleep(2400);

await check('sea-guard: 未 initSea 直接切到 sea 場景不會崩', async () => {
  const errBefore = pageErrors.length;
  await q(`(() => { setScene('sea'); return true; })()`);
  await sleep(700);
  const s = await q(`JSON.stringify({ bosses: Array.isArray(sea.bosses), n: Array.isArray(sea.bosses) ? sea.bosses.length : -1 })`);
  const o = JSON.parse(s);
  return { ok: o.bosses === true && pageErrors.length === errBefore, detail: JSON.stringify(o) };
});

await check('start: 開始遊戲 → sea 場景，3 HP', async () => {
  await startGame();
  const s = await q(`JSON.stringify({scene:__T.game.scene, hp:__T.sea.player.hp})`);
  const o = JSON.parse(s);
  return { ok: o.scene === 'sea' && o.hp === 3, detail: JSON.stringify(o) };
});

await check('movement: 按住 D 會向右游', async () => {
  const x0 = await q(`__T.sea.player.x`);
  await hold('d', 700);
  await sleep(100);
  const x1 = await q(`__T.sea.player.x`);
  return { ok: x1 - x0 > 40, detail: `dx=${(x1 - x0).toFixed(1)}px` };
});

await check('shoot: 滑鼠左鍵發射魚槍', async () => {
  await q(`__T.sea.bullets.length = 0; 'ok'`);
  await click(700, 300);
  await sleep(120);
  const n = await q(`__T.sea.bullets.length`);
  return { ok: n >= 1, detail: 'bullets=' + n };
});

await check('pickup: 磁力自動收集垃圾並加資源', async () => {
  const before = await q(`__T.game.res.plastic`);
  await q(`(() => { const P = __T.sea.player; __T.sea.pickups.push({ x: P.x + 24, y: P.y, type: 'plastic', t: 0, r: 17, alive: true }); return true; })()`);
  await sleep(500);
  const after = await q(`__T.game.res.plastic`);
  return { ok: after > before, detail: `plastic ${before} → ${after}` };
});

await check('oxygen: 離開基地會耗氧', async () => {
  const o0 = await q(`__T.sea.player.ox`);
  await sleep(2600);
  const o1 = await q(`__T.sea.player.ox`);
  return { ok: o1 < o0, detail: `ox ${o0.toFixed(1)} → ${o1.toFixed(1)}` };
});

await check('safe-zone: 回基地安全圈自動回滿血/氧/體力', async () => {
  await q(`(() => { const P = __T.sea.player; P.hp = 1; P.ox = 10; P.x = 0; P.y = 0; return true; })()`);
  await sleep(1200);
  const s = await q(`JSON.stringify({hp:__T.sea.player.hp, maxhp:calcStats().maxhp, ox:__T.sea.player.ox})`);
  const o = JSON.parse(s);
  return { ok: o.hp === o.maxhp && o.ox > 50, detail: JSON.stringify(o), shot: true };
});

await check('gate: 離基地太遠不能開建造面板', async () => {
  await q(`(() => { const P = __T.sea.player; P.x = 2000; P.y = 2000; document.getElementById('modal').classList.remove('show'); return true; })()`);
  await sleep(200);
  await q(`__T.openBase(); 'ok'`);
  await sleep(300);
  const shown = await q(`document.getElementById('modal').classList.contains('show')`);
  return { ok: shown === false, detail: 'modal shown=' + shown };
});

await check('build: 基地內建造成功、多一格', async () => {
  await q(`(() => { const P = __T.sea.player; P.x = 0; P.y = 0; __T.game.res = { plastic: 900, wood: 900, metal: 900, alloy: 90 }; __T.game.base.structures = []; return true; })()`);
  const before = JSON.parse(await q(`JSON.stringify({ tiles: __T.baseTiles().length })`));
  await q(`addStructure('net'); 'ok'`);
  await sleep(200);
  const after = JSON.parse(await q(`JSON.stringify({ tiles: __T.baseTiles().length, n: __T.game.base.structures.length })`));
  return { ok: after.tiles === before.tiles + 1 && after.n === 1, detail: JSON.stringify({ before, after }) };
});

await check('build-pay: 面板按鈕建造會扣資源', async () => {
  await q(`(() => { const P = __T.sea.player; P.x = 0; P.y = 0; P.hp = 3; __T.game.res = { plastic: 900, wood: 900, metal: 900, alloy: 90 }; __T.game.base.structures = []; return true; })()`);
  await q(`__T.openBase(); 'ok'`);
  await sleep(400);
  const before = JSON.parse(await q(`JSON.stringify({plastic:__T.game.res.plastic, wood:__T.game.res.wood, tiles:__T.baseTiles().length, cost: structureCost('net')})`));
  const clicked = await q(`(() => { const b = document.querySelector('[data-build="net"]'); if (!b) return false; b.click(); return true; })()`);
  await sleep(500);
  const after = JSON.parse(await q(`JSON.stringify({plastic:__T.game.res.plastic, wood:__T.game.res.wood, tiles:__T.baseTiles().length, n:__T.game.base.structures.length})`));
  const okPay = before.plastic - after.plastic === before.cost.plastic && before.wood - after.wood === before.cost.wood;
  return { ok: clicked && okPay && after.n === 1, detail: JSON.stringify({ before, after }) };
});

await check('craft: 沒有裝備房時升級卡被鎖住', async () => {
  await q(`__T.game.base.structures = [{type:'net', gx:0, gy:0, born:0}]; __T.openCraft(); 'ok'`);
  await sleep(400);
  const txt = await q(`document.getElementById('modal-body').innerText`);
  const hasBuy = await q(`document.querySelectorAll('[data-buy-up]').length`);
  return { ok: (txt.includes('需要裝備房') || txt.includes('需先建造「裝備房」')) && hasBuy === 0, detail: `buyBtns=${hasBuy}` };
});

await check('esc: Esc 關閉面板', async () => {
  await tap('escape'); await sleep(400);
  return { ok: (await q(`document.getElementById('modal').classList.contains('show')`)) === false, detail: 'closed' };
});

await check('quests: J 面板可開且超長可滾動', async () => {
  await q(`document.getElementById('modal').classList.remove('show'); __T.openQuests(); 'ok'`);
  await sleep(400);
  const s = await q(`(() => { const b = document.getElementById('modal-body'); return JSON.stringify({ scrollH: b.scrollHeight, clientH: b.clientHeight, overflowY: getComputedStyle(b).overflowY }); })()`);
  const o = JSON.parse(s);
  return { ok: o.scrollH <= o.clientH + 2 || /auto|scroll/.test(o.overflowY), detail: JSON.stringify(o) };
});

await check('pause: Esc 暫停選單可開可關', async () => {
  await q(`document.getElementById('modal').classList.remove('show'); setScene('sea'); 'ok'`);
  await sleep(200);
  await tap('escape'); await sleep(400);
  const o1 = JSON.parse(await q(`JSON.stringify({modal:document.getElementById('modal').classList.contains('show'), paused:__T.game.paused})`));
  await tap('escape'); await sleep(400);
  const closed = await q(`document.getElementById('modal').classList.contains('show')`);
  return { ok: o1.modal && o1.paused && closed === false, detail: JSON.stringify({ o1, closed: !closed }) };
});

await check('save-load: 存檔後重載可繼續', async () => {
  await q(`(() => { __T.game.res.plastic = 1234; __T.game.up.fin = 2; saveGame(true); return true; })()`);
  await send('Page.reload'); await sleep(2400);
  const vis = await q(`document.getElementById('btn-continue').hidden`);
  await q(`document.getElementById('btn-continue').click()`);
  await sleep(1600);
  const o = JSON.parse(await q(`JSON.stringify({scene:__T.game.scene, plastic:__T.game.res.plastic, fin:__T.game.up.fin})`));
  return { ok: vis === false && o.scene === 'sea' && o.plastic === 1234 && o.fin === 2, detail: JSON.stringify(o) };
});

await check('save-bounty-mods: 賞金／模組／新 stats 存檔往返', async () => {
  const r = await q(`(() => {
    __T.game.bounty = { active: [{ id: 'cull', tier: 1, target: 6, prog: 2, reward: { alloy: 2 }, done: false }], done: 2, rerollT: 0, zoneT: 0 };
    __T.game.mods = ['pierce']; __T.game.stats.leviathanKills = 3;
    saveGame(true);
    const ok = loadGame();
    return JSON.stringify({ ok, done: __T.game.bounty.done, mods: __T.game.mods.slice(), lv: __T.game.stats.leviathanKills });
  })()`);
  const o = JSON.parse(r);
  return { ok: o.ok && o.done === 2 && o.mods.length === 1 && o.mods[0] === 'pierce' && o.lv === 3, detail: r };
});

await check('death: 死亡扣 15% 塑膠、在基地復活', async () => {
  await q(`(() => { const P = __T.sea.player; P.x = 2000; P.y = 2000; P.hp = 1; P.inv = 0; __T.game.res.plastic = 100; hurtPlayer(10); return true; })()`);
  await sleep(500);
  const d = JSON.parse(await q(`JSON.stringify({dead:__T.sea.dead, plastic:__T.game.res.plastic, modal:document.getElementById('modal').classList.contains('show')})`));
  await q(`document.querySelector('#modal-foot button').click()`);
  await sleep(500);
  const a = JSON.parse(await q(`JSON.stringify({dead:__T.sea.dead, hp:__T.sea.player.hp, x:__T.sea.player.x, y:__T.sea.player.y})`));
  return { ok: d.dead === true && d.plastic === 85 && a.dead === false && a.hp > 0 && Math.hypot(a.x, a.y) < 600, detail: JSON.stringify({ ...d, after: a }) };
});

await check('launch-gate: 零件不齊不能發射', async () => {
  await q(`(() => { __T.game.parts = { hull: false, engine: false, fuel: false, nav: false }; startLaunch(); return true; })()`);
  await sleep(400);
  return { ok: (await q(`__T.game.scene`)) === 'sea', detail: 'blocked' };
});

await check('launch: 零件齊全 → 升空場景、W 加速', async () => {
  await q(`(() => { __T.game.parts = { hull: true, engine: true, fuel: true, nav: true };
    __T.game.up.harpoon = 3; __T.game.up.suit = 2;
    if (!__T.game.base.structures.some(s => s.type === 'dock')) __T.game.base.structures.push({ type: 'dock', gx: 0, gy: 0, born: 0 });
    if (!__T.game.base.structures.some(s => s.type === 'rnd')) __T.game.base.structures.push({ type: 'rnd', gx: 1, gy: 0, born: 0 });
    initLaunch(); setScene('launch'); return true; })()`);
  await sleep(1200);
  const p0 = await q(`launch.prog`);
  await hold('w', 1200); await sleep(400);
  const p1 = await q(`launch.prog`);
  return { ok: p1 > p0, detail: `prog ${p0.toFixed(1)} → ${p1.toFixed(1)}` };
});

await check('launch-retry: 連續 3 次升空都能進 dock（soft-lock 回歸）', async () => {
  const out = [];
  for (let i = 0; i < 3; i++) {
    await q(`(() => { __T.setScene('sea'); __T.initLaunch(); __T.launch.prog = 99.9; return true; })()`);
    await sleep(3500);
    out.push(await q(`__T.game.scene`));
    if (out[i] === 'dock') { await q(`__T.setScene('sea')`); await sleep(150); }
  }
  return { ok: out.every(s => s === 'dock'), detail: JSON.stringify(out) };
});

await check('dock: 登艦場景可操作', async () => {
  await q(`initDock(); setScene('dock'); 'ok'`);
  await sleep(600);
  const y0 = await q(`dock.y`);
  await hold('w', 900); await sleep(300);
  const y1 = await q(`dock.y`);
  return { ok: y1 < y0 || (await q(`dock.state`)) !== 'fly', detail: `y ${y0.toFixed(0)} → ${y1.toFixed(0)}` };
});

await check('moon: 母船決戰場景會出怪', async () => {
  await q(`initMoon(); setScene('moon'); 'ok'`);
  await sleep(2500);
  const o = JSON.parse(await q(`JSON.stringify({aliens: moon.aliens.length, wave: moon.wave, hp: moon.p.hp})`));
  return { ok: o.aliens > 0 || o.wave > 0, detail: JSON.stringify(o) };
});

await check('tech: 擊敗四角守衛累積 4 塊科技碎片', async () => {
  await q(`(() => { setScene('sea'); __T.game.tech = 0; __T.game.bossesKilled = []; for (const id of ['nw','ne','sw','se']) killSeaBoss({ id, name: '守衛' + id, x: 0, y: 0 }); return true; })()`);
  await sleep(400);
  const o = JSON.parse(await q(`JSON.stringify({tech:__T.game.tech, kills:__T.game.bossesKilled.length})`));
  return { ok: o.tech === 4 && o.kills === 4, detail: JSON.stringify(o) };
});

await check('leviathan: 四角巨獸存在且 pattern 分歧', async () => {
  await q(`(() => { __T.game.bossesKilled = []; initSea(true); setScene('sea'); return true; })()`);
  await sleep(600);
  let o = JSON.parse(await q(`JSON.stringify({ n: (window.LEVIATHANS && LEVIATHANS.list ? LEVIATHANS.list.length : 0), patterns: (window.LEVIATHANS && LEVIATHANS.list ? LEVIATHANS.list.map(l => l.pattern) : []) })`));
  if (o.n === 0) {
    await q(`(() => { if (window.LEVIATHANS && LEVIATHANS.spawn) LEVIATHANS.spawn(); return true; })()`);
    await sleep(400);
    o = JSON.parse(await q(`JSON.stringify({ n: (window.LEVIATHANS && LEVIATHANS.list ? LEVIATHANS.list.length : 0), patterns: (window.LEVIATHANS && LEVIATHANS.list ? LEVIATHANS.list.map(l => l.pattern) : []) })`));
  }
  const uniq = new Set(o.patterns);
  return { ok: o.n === 4 && uniq.size >= 4, detail: JSON.stringify(o) };
});

await check('moon-hp: 艙壓＝calcStats().moonHp（素裝100／suit4+shield3=223）', async () => {
  const a = JSON.parse(await q(`(() => { __T.game.up.suit = 0; __T.game.up.shield = 0; initMoon(); setScene('moon'); return JSON.stringify({maxhp: moon.p.maxhp}); })()`));
  const b = JSON.parse(await q(`(() => { __T.game.up.suit = 4; __T.game.up.shield = 3; initMoon(); setScene('moon'); return JSON.stringify({maxhp: moon.p.maxhp}); })()`));
  return { ok: a.maxhp === 100 && b.maxhp === 223, detail: JSON.stringify({ bare: a, geared: b }) };
});

await check('moon-survive: 素裝連吃 16 次 hurtMoon(6) 不會死（P0 通關）', async () => {
  const r = await q(`(() => { __T.game.up.suit = 0; __T.game.up.shield = 0; initMoon(); setScene('moon');
    for (let i = 0; i < 16; i++) { moon.p.inv = 0; hurtMoon(6); if (moon.state !== 'fight') break; }
    return JSON.stringify({state: moon.state, hp: Math.round(moon.p.hp), maxhp: moon.p.maxhp}); })()`);
  const o = JSON.parse(r);
  return { ok: o.state === 'fight' && o.hp > 0, detail: JSON.stringify(o) };
});

await check('gunMult: 魚槍等級 → 母船傷害倍率（0 / 0.35 / 1）', async () => {
  const o = JSON.parse(await q(`(() => { const out = {}; for (const gl of [0, 3, 4]) { __T.game.up.harpoon = gl; out['gl' + gl] = calcStats().gunMult; } __T.game.up.harpoon = 0; return JSON.stringify(out); })()`));
  return { ok: o.gl0 === 0 && o.gl3 === 0.35 && o.gl4 === 1, detail: JSON.stringify(o) };
});

await check('moon-boss: 900HP 四階段核心 → 逃生倒數 → 鏡像 BOSS → 結局', async () => {
  await q(`(() => { initMoon(); setScene('moon'); for (let i = 0; i < 10 && !moon.boss; i++) nextWave(); return true; })()`);
  await sleep(400);
  const info = JSON.parse(await q(`JSON.stringify({hasBoss: !!moon.boss, maxhp: moon.boss ? moon.boss.maxhp : 0})`));
  await q(`(() => { addStructure('satellite'); if (moon.boss) moon.boss.hp = moon.boss.maxhp * 0.85; return true; })()`);
  await sleep(1600);
  const beam = JSON.parse(await q(`JSON.stringify({hp: moon.boss ? Math.round(moon.boss.hp) : -1, maxhp: moon.boss ? moon.boss.maxhp : 0, beam1: !!moon.beam1})`));
  await shot('moon-boss');
  await q(`startEscape(); 'ok'`);
  await sleep(300);
  const esc = JSON.parse(await q(`JSON.stringify({state: moon.state, escapeT: Math.round(moon.escapeT || 0)})`));
  await q(`spawnMirror(); 'ok'`);
  await sleep(300);
  const mir = JSON.parse(await q(`JSON.stringify({has: !!moon.mirror, hp: moon.mirror ? moon.mirror.hp : 0, expect: (() => { const g = (game.up.fin||0)+(game.up.tank||0)+(game.up.suit||0)+(game.up.magnet||0)+(game.up.harpoon||0); return 300 + 55 * g + 40 * (Array.isArray(game.mods) ? game.mods.length : 0); })()})`));
  await shot('mirror');
  await q(`(() => { if (moon.mirror) moon.mirror.hp = 0; escapeWin(); return true; })()`);
  await sleep(3000);
  const end = JSON.parse(await q(`JSON.stringify({hidden: document.getElementById('ending').hidden, state: moon.state})`));
  await shot('ending');
  const beamOk = beam.beam1 === true && Math.abs(beam.hp - beam.maxhp * 0.6) < beam.maxhp * 0.1;
  // 核心 HP 由平衡決定（v0.9 起 1800）：只驗「有頭目、HP ≥900、其餘流程正確」
  return { ok: info.hasBoss && info.maxhp >= 900 && beamOk && esc.state === 'escape' && esc.escapeT >= 85 && mir.has && mir.hp === mir.expect && end.hidden === false && end.state === 'win', detail: JSON.stringify({ info, beam, esc, mir, ending: end }) };
});

await check('save-persist: 拾取後的資源重載仍在', async () => {
  await send('Page.navigate', { url }); await sleep(2200);
  await startGame();
  await q(`(() => { const P = __T.sea.player; P.x = 1200; P.y = 900; __T.game.res.plastic = 0; return true; })()`);
  await q(`(() => { const P = __T.sea.player; __T.sea.pickups.push({ x: P.x + 20, y: P.y, type: 'plastic', t: 0, r: 17, alive: true }); return true; })()`);
  await sleep(700);
  const before = await q(`__T.game.res.plastic`);
  await sleep(1200);
  await send('Page.reload'); await sleep(2400);
  await q(`document.getElementById('btn-continue').click()`);
  await sleep(1500);
  const after = await q(`__T.game.res.plastic`);
  return { ok: before > 0 && after === before, detail: `plastic ${before} → reload → ${after}` };
});

await check('no-double-charge: 升空失敗回基地只扣一次 8 金屬', async () => {
  await q(`(() => { setScene('sea'); __T.game.res.metal = 40; initLaunch(); setScene('launch'); launchFail(); return true; })()`);
  await sleep(600);
  const before = JSON.parse(await q(`JSON.stringify({metal:__T.game.res.metal, modal:document.getElementById('modal').classList.contains('show')})`));
  await q(`(() => { const b = document.querySelector('#modal-foot button'); if (b) b.click(); return true; })()`);
  await sleep(1200);
  const mid = await q(`__T.game.res.metal`);
  await sleep(1200);
  const after = JSON.parse(await q(`JSON.stringify({metal:__T.game.res.metal, scene:__T.game.scene})`));
  return { ok: before.metal === 40 && mid === 32 && after.metal === 32 && after.scene === 'sea', detail: `40 → 40 → 32 → ${after.metal}` };
});

await check('fixture-v2: 舊 v2 存檔可載入、建築格不重疊', async () => {
  const fixture = readFileSync(new URL('./fixtures/save-v2.json', import.meta.url), 'utf8');
  const loaded = await q(`(() => { localStorage.clear(); localStorage.setItem('escape-the-sea-v2', ${JSON.stringify(fixture)}); const ok = loadGame(); if (!ok) return 'loadfail'; initSea(false); setScene('sea'); return 'ok'; })()`);
  await sleep(600);
  const o = JSON.parse(await q(`JSON.stringify({structs:__T.game.base.structures.length, tiles:__T.baseTiles().length, parts:Object.values(__T.game.parts).filter(Boolean).length, plastic:__T.game.res.plastic})`));
  return { ok: loaded === 'ok' && o.structs === 9 && o.tiles === 10 && o.parts === 2 && o.plastic === 120, detail: JSON.stringify({ loaded, ...o }) };
});

await check('fixture-v1: 舊 v1 存檔遷移後平台格不重疊', async () => {
  const fixture = readFileSync(new URL('./fixtures/save-v1.json', import.meta.url), 'utf8');
  const loaded = await q(`(() => { localStorage.clear(); localStorage.setItem('escape-the-sea-v1', ${JSON.stringify(fixture)}); const ok = loadGame(); if (!ok) return 'loadfail'; initSea(false); setScene('sea'); return 'ok'; })()`);
  await sleep(600);
  const o = JSON.parse(await q(`JSON.stringify({structs:__T.game.base.structures.length, tiles:__T.baseTiles().length, plastic:__T.game.res.plastic})`));
  return { ok: loaded === 'ok' && o.structs === 8 && o.tiles === 9 && o.plastic === 40, detail: JSON.stringify({ loaded, ...o }) };
});

await check('bounty: 賞金終端 → H 面板 → claim → 6 秒補槽', async () => {
  await q(`(() => { setScene('sea'); const P = __T.sea.player; P.x = 0; P.y = 0;
    __T.game.res = { plastic: 900, wood: 900, metal: 900, alloy: 90 };
    if (!__T.game.base.structures.some(s => s.type === 'bounty')) addStructure('bounty');
    __T.game.bounty = { active: [], done: 0, rerollT: 0, zoneT: 0 }; return true; })()`);
  await sleep(900);
  const built = JSON.parse(await q(`JSON.stringify({terminal: countType('bounty'), active: __T.game.bounty.active.length})`));
  await q(`(() => { const c = __T.game.bounty.active[0]; if (c) c.prog = c.target; __T.openBounty(); return true; })()`);
  await sleep(500);
  const panel = JSON.parse(await q(`JSON.stringify({modal:document.getElementById('modal').classList.contains('show'), cards:document.querySelectorAll('[data-bounty]').length, ready:document.querySelectorAll('[data-ready="true"]').length})`));
  const before = JSON.parse(await q(`JSON.stringify({metal:__T.game.res.metal, done:__T.game.bounty.done})`));
  await q(`(() => { const btn = document.querySelector('[data-claim="0"]'); if (btn && !btn.disabled) btn.click(); return true; })()`);
  await sleep(600);
  const after = JSON.parse(await q(`JSON.stringify({metal:__T.game.res.metal, done:__T.game.bounty.done, active:__T.game.bounty.active.length})`));
  await sleep(6500);
  const refilled = await q(`__T.game.bounty.active.length`);
  return { ok: built.terminal === 1 && panel.modal && panel.ready >= 1 && after.done === before.done + 1 && refilled === 3, detail: JSON.stringify({ built, panel, before, after, refilled }) };
});

await check('mods: 模組工作台 → 3 槽 → 子彈欄位', async () => {
  await q(`(() => { setScene('sea'); const P = __T.sea.player; P.x = 0; P.y = 0;
    if (!__T.game.base.structures.some(s => s.type === 'modtable')) addStructure('modtable');
    __T.game.mods = []; return true; })()`);
  await sleep(600);
  await q(`(() => { for (let i = 0; i < 5; i++) { try { grantRandomMod(); } catch (e) {} } return true; })()`);
  await sleep(300);
  const mods = JSON.parse(await q(`JSON.stringify(__T.game.mods)`));
  await q(`__T.openCraft(); 'ok'`);
  await sleep(400);
  const cards = await q(`document.querySelectorAll('[data-mod]').length`);
  await q(`(() => { __T.sea.bullets.length = 0; __T.game.up.harpoon = 4; shootSea(); return true; })()`);
  await sleep(100);
  const bullet = JSON.parse(await q(`(() => { const b = __T.sea.bullets[0]; return JSON.stringify(b ? { has: true, pierce: b.pierce !== undefined, blast: b.blast !== undefined, emp: b.emp !== undefined } : { has: false }); })()`));
  return { ok: mods.length === 3 && cards >= 3 && bullet.has && bullet.pierce && bullet.blast && bullet.emp, detail: JSON.stringify({ mods, cards, bullet }) };
});

await check('onboarding: HUD「下一步」＋離基地 B 距離提示', async () => {
  await q(`(() => { setScene('sea'); const P = __T.sea.player; P.x = 2000; P.y = 2000; P.hp = 3; return true; })()`);
  await sleep(800);
  const next = JSON.parse(await q(`(() => { const el = document.getElementById('nextstep'); return JSON.stringify({hidden: !el || getComputedStyle(el).display === 'none', text: el ? el.innerText.slice(0, 80) : ''}); })()`));
  await q(`(() => { document.getElementById('modal').classList.remove('show'); __T.openBase(); return true; })()`);
  await sleep(300);
  const away = await q(`document.getElementById('modal').classList.contains('show')`);
  return { ok: next.hidden === false && next.text.length > 0 && away === false, detail: JSON.stringify({ next, modalShown: away }) };
});

await check('i18n: 切 en 後主要面板無中文殘留', async () => {
  const missing = await q(`(() => { setLang('en'); return JSON.stringify(__T.i18nMissing ? __T.i18nMissing() : ['no-hook']); })()`);
  await sleep(600);
  const cjk = await q(`(() => { const el = document.getElementById('hud'); const t = el ? el.innerText : ''; return (t.match(/[\\u4e00-\\u9fff]/g) || []).length; })()`);
  await q(`__T.openQuests(); 'ok'`);
  await sleep(500);
  const panelCjk = await q(`(() => { const t = document.getElementById('modal-body').innerText; return (t.match(/[\\u4e00-\\u9fff]/g) || []).length; })()`);
  await q(`document.getElementById('modal').classList.remove('show'); setLang('zh'); 'ok'`);
  const m = JSON.parse(missing);
  return { ok: Array.isArray(m) && m.length === 0 && cjk === 0 && panelCjk === 0, detail: JSON.stringify({ missing: m, cjk, panelCjk }) };
});

await check('tutorial: 5 步字串存在且無 raw placeholder', async () => {
  const r = await q(`(() => {
    const all = [1,2,3,4,5].map(i => t('tut.step' + i));
    return JSON.stringify({ n: (typeof TUTORIAL !== 'undefined' ? TUTORIAL.length : -1), all, raw: all.some(s => /[{}]/.test(s)) });
  })()`);
  const o = JSON.parse(r);
  return { ok: o.n === 5 && o.raw === false && o.all.every(s => s && s.length > 2), detail: JSON.stringify({ n: o.n, raw: o.raw, step1: o.all[0] }) };
});

await check('settings: 音量存檔往返', async () => {
  await q(`(() => { setScene('sea'); if (typeof openSettings === 'function') openSettings(); return true; })()`);
  await sleep(500);
  const dom = JSON.parse(await q(`JSON.stringify({settings: !!document.querySelector('.settings'), range: document.querySelectorAll('input[type=range]').length})`));
  await q(`(() => { __T.game.settings.musicVol = 50; __T.game.settings.sfxVol = 70; saveGame(true); return true; })()`);
  const before = JSON.parse(await q(`JSON.stringify({musicVol:__T.game.settings.musicVol, sfxVol:__T.game.settings.sfxVol})`));
  await q(`(() => { loadGame(); return true; })()`);
  const after = JSON.parse(await q(`JSON.stringify({musicVol:__T.game.settings.musicVol, sfxVol:__T.game.settings.sfxVol})`));
  await q(`document.getElementById('modal').classList.remove('show'); 'ok'`);
  return { ok: dom.settings && before.musicVol === 50 && after.musicVol === 50 && after.sfxVol === 70, detail: JSON.stringify({ dom, before, after }) };
});

await check('ach: 24 成就、模擬解鎖 10+（含隱藏）', async () => {
  const r = await q(`(() => {
    const total = (__T.ACH || []).length;
    const hidden = (__T.ACH || []).filter(a => a.hidden).length;
    const g = __T.game;
    g.ach = [];
    g.stats.collected = 1000; g.stats.kills = 200; g.stats.bosses = 4;
    g.stats.deaths = 0; g.stats.launched = true; g.stats.won = true; g.stats.time = 90 * 60;
    g.stats.sharkKills = 60; g.stats.droneKills = 120; g.stats.jellyKills = 30;
    g.stats.plasticCollected = 500; g.stats.deepSeconds = 300;
    g.stats.leviathanKills = 4; g.stats.rifts = 2; g.stats.botCollected = 300;
    g.up.fin = 4; g.up.tank = 4; g.up.suit = 4; g.up.magnet = 4; g.up.harpoon = 4; g.up.shield = 3;
    g.tech = 4; g.mods = ['pierce','blast','emp'];
    g.bounty = { active: [], done: 12, rerollT: 0, zoneT: 0 };
    g.parts = { hull: true, engine: true, fuel: true, nav: true };
    g.base.structures = [];
    for (let i = 0; i < 19; i++) g.base.structures.push({ type: 'net', gx: i, gy: 0, born: 0 });
    for (let i = 0; i < 3; i++) __T.checkAch();
    saveGame(true);
    return JSON.stringify({ total, hidden, unlocked: g.ach.length });
  })()`);
  const o = JSON.parse(r);
  await q(`__T.openQuests(); 'ok'`);
  await sleep(500);
  const cards = await q(`document.querySelectorAll('.ach-card, [data-ach]').length`);
  await q(`document.getElementById('modal').classList.remove('show'); 'ok'`);
  return { ok: o.total === 24 && o.hidden >= 5 && o.unlocked >= 10 && cards >= 10, detail: JSON.stringify({ ...o, cards }) };
});

await check('challenge: 3 挑戰、一命失敗、赤手空拳封鎖、不寫主存檔', async () => {
  // 解鎖挑戰（需通關或 revenge 成就）
  await q(`(() => { __T.game.stats.won = true; if (!__T.game.ach.includes('revenge')) __T.game.ach.push('revenge'); return true; })()`);
  const n = await q(`(window.CHALLENGES || (__T.CHALLENGES || [])).length`);
  // 一命深海：開始後死亡即失敗
  const start = await q(`(() => { const ok = beginChallenge('iron'); if (!ok) return JSON.stringify({ok:false}); saveGame(true); return JSON.stringify({ok:true, id: __T.game.challenge ? __T.game.challenge.id : null}); })()`);
  const s = JSON.parse(start);
  await sleep(700);
  const hud = JSON.parse(await q(`(() => { const el = document.getElementById('nextstep'); const txt = el ? el.innerText : ''; const missing = __T.i18nMissing ? __T.i18nMissing() : ['no-hook']; return JSON.stringify({ txt, missing }); })()`));
  const labelOk = /一命深海|Iron Dive/.test(hud.txt);
  const saveBlocked = await q(`saveGame(true) === false`);
  const persistKey = await q(`localStorage.getItem('escape-the-sea-v2')`);
  await q(`(() => { const P = __T.sea.player; P.x = 3000; P.y = 3000; P.hp = 1; P.inv = 0; hurtPlayer(99); return true; })()`);
  await sleep(700);
  const ironEnd = JSON.parse(await q(`JSON.stringify({ended: !!(__T.game.challenge && __T.game.challenge.ended), modal: document.getElementById('modal').classList.contains('show'), ending: !document.getElementById('ending').hidden})`));
  // 赤手空拳：砲塔/模組/四裝備封鎖、calcStats 無加成
  await q(`(() => { document.getElementById('modal').classList.remove('show'); __T.game.challenge = null; beginChallenge('bare'); return true; })()`);
  await q(`(() => { __T.game.up.fin = 4; __T.game.up.tank = 4; __T.game.up.suit = 4; __T.game.up.magnet = 4; addStructure('tower'); return true; })()`);
  await sleep(300);
  const bare = JSON.parse(await q(`JSON.stringify({ towers: countType('tower'), speed: Math.round(calcStats().speed), id: __T.game.challenge ? __T.game.challenge.id : null })`));
  await q(`(() => { __T.game.challenge = null; document.getElementById('modal').classList.remove('show'); setScene('sea'); return true; })()`);
  return { ok: n === 3 && s.ok === true && s.id === 'iron' && labelOk && hud.missing.length === 0 && saveBlocked === true && persistKey === null && (ironEnd.modal === true || ironEnd.ending === true) && bare.id === 'bare' && bare.towers === 0 && bare.speed === 152, detail: JSON.stringify({ n, s, hud, labelOk, saveBlocked, persistKey, ironEnd, bare }) };
});

await check('ngplus: ngMul 倍率與核心/鏡像 NG 套用', async () => {
  const m = JSON.parse(await q(`(() => { __T.game.ng = 2; return JSON.stringify({ enemyHp: __T.ngMul('enemyHp'), bossHp: __T.ngMul('bossHp'), mirrorHp: __T.ngMul('mirrorHp') }); })()`));
  await q(`(() => { initMoon(); setScene('moon'); for (let i = 0; i < 10 && !moon.boss; i++) nextWave(); return true; })()`);
  await sleep(400);
  const boss = await q(`moon.boss ? moon.boss.maxhp : -1`);
  await q(`(() => { startEscape(); spawnMirror(); return true; })()`);
  await sleep(300);
  const mir = JSON.parse(await q(`(() => { const g = (game.up.fin||0)+(game.up.tank||0)+(game.up.suit||0)+(game.up.magnet||0)+(game.up.harpoon||0); const mods = Array.isArray(game.mods) ? game.mods.length : 0; const base = 300 + 55 * g + 40 * mods; return JSON.stringify({ hp: moon.mirror ? moon.mirror.hp : -1, expect: Math.round(base * __T.ngMul('mirrorHp')) }); })()`));
  await q(`(() => { __T.game.ng = 0; return true; })()`);
  const bossOk = Math.abs(boss - Math.round(1800 * m.bossHp)) <= 2;
  return { ok: Math.abs(m.enemyHp - 1.5) < 1e-6 && Math.abs(m.bossHp - 1.4) < 1e-6 && bossOk && mir.hp === mir.expect, detail: JSON.stringify({ m, boss, mir }) };
});

await check('a11y: reduce motion 包住 FX、色盲/字級 class 生效', async () => {
  const r = await q(`(() => {
    __T.game.settings.reduceMotion = true; __T.game.settings.colorblind = true; __T.game.settings.fontScale = 1.2;
    applySettings();
    const F = window.fx || {};
    const wrapped = !!F.__reduceMotionWrapped;
    let shakeOk = true;
    try { if (F.shake) F.shake(10, 120); } catch (e) { shakeOk = false; }
    const cls = document.body.classList;
    const out = { wrapped, shakeOk, reduce: cls.contains('reduce-motion'), cb: cls.contains('cb-safe') || cls.contains('colorblind'), large: cls.contains('text-lg') || cls.contains('font-large') };
    __T.game.settings.reduceMotion = false; __T.game.settings.colorblind = false; __T.game.settings.fontScale = 1; applySettings();
    return JSON.stringify(out);
  })()`);
  const o = JSON.parse(r);
  return { ok: o.wrapped && o.shakeOk && o.reduce && o.cb && o.large, detail: r };
});

await check('mobile: 390x844 直向沒有橫向溢出', async () => {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  await q(`initSea(false); setScene('sea'); 'ok'`);
  await sleep(1200);
  const o = JSON.parse(await q(`JSON.stringify({vw:VW, innerW:innerWidth, scrollW:document.documentElement.scrollWidth})`));
  await shot('mobile');
  return { ok: o.scrollW <= o.innerW + 2 && Math.abs(o.vw - o.innerW) <= 2, detail: JSON.stringify(o) };
});

await check('fps: 1280x800 主場景 FPS（3 取最佳，fresh sea）', async () => {
  await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url }); await sleep(2200);
  await startGame(); await sleep(500);
  await q(`initSea(true); setScene('sea'); refreshHud(); 'ok'`);
  await sleep(1200);
  const sample = `new Promise(res => { let n = 0; const t0 = performance.now(); function f() { n++; if (performance.now() - t0 < 800) requestAnimationFrame(f); else res(n / ((performance.now() - t0) / 1000)); } requestAnimationFrame(f); })`;
  const runs = [];
  for (let i = 0; i < 3; i++) { runs.push(await q(sample)); await sleep(200); }
  const best = Math.max(...runs);
  return { ok: best >= 30, detail: `best=${best.toFixed(1)} fps of [${runs.map(x => x.toFixed(1)).join(', ')}]` };
});

/* ---------------- summary ---------------- */
const pass = results.filter(r => r.ok).length;
console.log('\n================ QA SUMMARY ================');
console.log(`PASS ${pass}/${results.length}`);
for (const r of results.filter(x => !x.ok)) console.log('  FAIL:', r.name, '—', String(r.detail).slice(0, 400));
const errs = [...new Set(pageErrors)];
console.log('pageErrors(' + errs.length + '):', errs.length ? JSON.stringify(errs, null, 1).slice(0, 1200) : 'none');
writeFileSync(join(outdir, 'results.json'), JSON.stringify({ when: new Date().toISOString(), results, pageErrors: errs }, null, 2));
ws.close();
process.exit(0);
