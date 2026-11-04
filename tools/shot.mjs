// Headless playtest harness for escape-the-sea (Chrome DevTools Protocol).
//
// Prerequisites:
//   1) static server:  python -m http.server 5173 --bind 127.0.0.1   (repo root)
//   2) headless chrome with CDP:
//      Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' `
//        -ArgumentList '--headless=new','--disable-gpu','--hide-scrollbars',
//        "--remote-debugging-port=$P", "--user-data-dir=$env:TEMP\cdp-$P", 'about:blank'
//
// Usage:
//   $env:CDP_PORT=9222; $env:OUT_DIR='H:\...\_shots'; node shot.mjs <scenario>
//   scenarios: title | sea | base | craft | quests | launch | dock | moon
//   optional: $env:EXTRA_EVAL='<js>'   run before the final screenshot
//
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const scenario = process.argv[2] || 'title';
const PORT = Number(process.env.CDP_PORT || 9222);
const url = process.env.GAME_URL || 'http://127.0.0.1:5173/';
const outdir = process.env.OUT_DIR || 'H:\\DeepSeek\\PROJECT\\PROGRAMM\\_shots';
const VIEW_W = Number(process.env.VIEW_W || 1280);
const VIEW_H = Number(process.env.VIEW_H || 800);
const VIEW_DPR = Number(process.env.VIEW_DPR || 1);   // 商店截圖可用 VIEW_DPR=1 配 1920x1080
mkdirSync(outdir, { recursive: true });

const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
const page = list.find(t => t.type === 'page');
if (!page) { console.error('no page target on port ' + PORT); process.exit(1); }

const ws = new WebSocket(page.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
const pageErrors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === 'Runtime.exceptionThrown') {
    const d = m.params.exceptionDetails;
    pageErrors.push(String((d.exception && (d.exception.description || d.exception.value)) || d.text).slice(0, 300));
  }
  if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) {
    pageErrors.push(m.params.type + ': ' + m.params.args.map(a => a.value ?? a.description).join(' ').slice(0, 300));
  }
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
    pageErrors.push('log: ' + m.params.entry.text.slice(0, 300));
  }
});
await new Promise(r => ws.addEventListener('open', r));
const send = (method, params = {}) => new Promise((res, rej) => {
  const mid = ++id;
  pending.set(mid, (m) => m.error ? rej(new Error(method + ': ' + m.error.message)) : res(m.result));
  ws.send(JSON.stringify({ id: mid, method, params }));
});

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const evalJS = async (expr) => {
  const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(r.exceptionDetails).slice(0, 500));
  return r.result.value;
};

let shotN = 0;
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  const p = join(outdir, String(++shotN).padStart(2, '0') + '-' + name + '.png');
  writeFileSync(p, Buffer.from(r.data, 'base64'));
  console.log('shot', p);
};

const KEYMAP = {
  escape: ['Escape', 'Escape', 27], enter: ['Enter', 'Enter', 13], ' ': [' ', 'Space', 32],
  arrowup: ['ArrowUp', 'ArrowUp', 38], arrowdown: ['ArrowDown', 'ArrowDown', 40],
  arrowleft: ['ArrowLeft', 'ArrowLeft', 37], arrowright: ['ArrowRight', 'ArrowRight', 39],
  shift: ['Shift', 'ShiftLeft', 16],
};
const keyDef = (k) => KEYMAP[k] || [k, 'Key' + k.toUpperCase(), k.toUpperCase().charCodeAt(0)];
const key = async (k, type = 'keyDown') => {
  const [name, code, vk] = keyDef(k);
  await send('Input.dispatchKeyEvent', { type, key: name, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
};
const tap = async (k, ms = 140) => { await key(k); await sleep(ms); await key(k, 'keyUp'); };
const hold = async (k, ms = 500) => { await key(k); await sleep(ms); await key(k, 'keyUp'); };
const click = async (x, y) => {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await sleep(70);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
};

const teleportHome = () => evalJS(`(() => { __T.sea.player.x = 0; __T.sea.player.y = 0; __T.sea.player.vx = 0; __T.sea.player.vy = 0; __T.sea.cam.x = 0; __T.sea.cam.y = 0; return true; })()`);
const grantAll = () => evalJS(`(() => { for (const k of ['plastic','wood','metal']) __T.give(k, 9999); __T.give('alloy', 99); return true; })()`);

await send('Page.enable');
await send('Runtime.enable');
try { await send('Log.enable'); } catch (e) {}
try { await send('Network.enable'); await send('Network.setCacheDisabled', { cacheDisabled: true }); } catch (e) {}
await send('Emulation.setDeviceMetricsOverride', { width: VIEW_W, height: VIEW_H, deviceScaleFactor: VIEW_DPR, mobile: false });
await send('Page.navigate', { url });
await sleep(2200);

const startGame = async () => {
  await evalJS(`document.getElementById('btn-start').click()`);
  await sleep(500);
  for (let i = 0; i < 12; i++) {
    if (await evalJS(`document.getElementById('intro').hidden`)) break;
    await evalJS(`document.getElementById('intro-next').click()`);
    await sleep(420);
  }
  await sleep(600);
};

try {
  if (scenario === 'title') {
    await sleep(900);
  } else {
    await startGame();
    await sleep(900);
    if (scenario === 'sea') await shot('sea');
    if (scenario === 'base') {
      await teleportHome(); await grantAll();
      await evalJS(`__T.mountAll()`); await sleep(900);
      await evalJS(`__T.openBase()`); await sleep(500);
      await shot('base');
    }
    if (scenario === 'craft') {
      await teleportHome(); await grantAll();
      await evalJS(`__T.addStructure('equip'); __T.openCraft()`); await sleep(500);
      await shot('craft');
    }
    if (scenario === 'quests') {
      await evalJS(`__T.openQuests()`); await sleep(400);
      await shot('quests');
    }
    if (scenario === 'launch') {
      await grantAll();
      await evalJS(`__T.addStructure('dock'); Object.keys(__T.game.parts).forEach(k => __T.game.parts[k] = true); __T.initLaunch(); __T.setScene('launch'); 'ok'`);
      await sleep(1200); await shot('launch-early');
      await hold('w', 800); await sleep(1200); await shot('launch-late');
    }
    if (scenario === 'dock') {
      await evalJS(`__T.initDock(); __T.setScene('dock'); 'ok'`);
      await sleep(900); await shot('dock');
      await hold('w', 700); await sleep(600); await shot('dock-enter');
    }
    if (scenario === 'moon') {
      await evalJS(`__T.initMoon(); __T.setScene('moon'); 'ok'`);
      await sleep(1500); await shot('moon');
    }
  }
  if (process.env.EXTRA_EVAL) {
    const out = await evalJS(process.env.EXTRA_EVAL);
    console.log('extraEval =>', JSON.stringify(out));
    await sleep(600);
    await shot('extra');
  }
  const info = await evalJS(`JSON.stringify({scene: __T.game.scene, paused: __T.game.paused, hp: __T.sea ? __T.sea.player.hp : null, res: __T.game.res, structs: __T.game.base ? __T.game.base.structures.length : 0})`);
  console.log('state', info);
} catch (e) {
  console.error('HARNESS ERROR', e.message);
} finally {
  console.log('pageErrors', pageErrors.length ? pageErrors : 'none');
  ws.close();
  process.exit(0);
}
