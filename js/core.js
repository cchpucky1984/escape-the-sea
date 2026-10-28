'use strict';
/* =========================================================
   逃出大海 — core：工具 / 音效 / 資料 / 存檔 / UI / 任務
   ========================================================= */

/* ---------- dom + canvas ---------- */
const $ = (id) => document.getElementById(id);
const cv = $('cv');
const ctx = cv.getContext('2d');
let VW = 0, VH = 0, DPR = 1;
function resizeCanvas() {
  DPR = Math.min(2, window.devicePixelRatio || 1);
  VW = window.innerWidth; VH = window.innerHeight;
  cv.width = Math.floor(VW * DPR); cv.height = Math.floor(VH * DPR);
  cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ---------- utils ---------- */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
function rnd(a, b) { if (b === undefined) { b = a; a = 0; } return a + Math.random() * (b - a); }
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
function lerpAngle(a, b, t) {
  const d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
  return a + d * t;
}
const fmtTime = (s) => {
  s = Math.floor(s);
  const m = Math.floor(s / 60);
  return m + ':' + String(s % 60).padStart(2, '0');
};
const fmtNum = (n) => (n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(Math.floor(n)));

/* ---------- audio ---------- */
let AC = null, master = null, muted = false, amb = null;
function initAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain();
    master.gain.value = muted ? 0 : 0.22;
    master.connect(AC.destination);
    startAmbient();
  } catch (e) { AC = null; }
}
function startAmbient() {
  if (!AC || amb) return;
  try {
    const g = AC.createGain(); g.gain.value = 0.0001; g.connect(master);
    const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300; f.Q.value = 0.6;
    const o1 = AC.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
    const o2 = AC.createOscillator(); o2.type = 'sine'; o2.frequency.value = 82.5;
    const lfo = AC.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.06;
    const lg = AC.createGain(); lg.gain.value = 0.014;
    lfo.connect(lg); lg.connect(g.gain);
    o1.connect(f); o2.connect(f); f.connect(g);
    o1.start(); o2.start(); lfo.start();
    g.gain.linearRampToValueAtTime(0.05, AC.currentTime + 5);
    amb = { g, o1, o2, lfo };
  } catch (e) { amb = null; }
}
function applyMute() {
  if (master) master.gain.value = muted ? 0 : 0.22;
}
function tone(f0, dur, type, vol, f1) {
  if (!AC || muted) return;
  const t = AC.currentTime;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'sine';
  o.frequency.setValueAtTime(f0, t);
  if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol || 0.2, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.03);
}
function noiseHit(dur, vol, freq) {
  if (!AC || muted) return;
  dur = dur || 0.35;
  const len = Math.floor(AC.sampleRate * dur);
  const buf = AC.createBuffer(1, len, AC.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
  const src = AC.createBufferSource(); src.buffer = buf;
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq || 700;
  const g = AC.createGain(); g.gain.value = vol || 0.28;
  src.connect(f); f.connect(g); g.connect(master);
  src.start();
}
function sfx(n) {
  switch (n) {
    case 'pick': tone(760, 0.07, 'triangle', 0.15, 1180); break;
    case 'air': tone(520, 0.2, 'sine', 0.17, 900); break;
    case 'shoot': tone(320, 0.07, 'square', 0.1, 130); break;
    case 'hurt': tone(170, 0.22, 'sawtooth', 0.18, 60); break;
    case 'boom': noiseHit(0.4, 0.26, 750); break;
    case 'build': tone(440, 0.12, 'triangle', 0.15, 660); setTimeout(() => tone(680, 0.2, 'triangle', 0.13, 900), 90); break;
    case 'deny': tone(180, 0.13, 'square', 0.11, 110); break;
    case 'win': [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.32, 'triangle', 0.15), i * 140)); break;
    case 'lose': [300, 220, 150].forEach((f, i) => setTimeout(() => tone(f, 0.36, 'sawtooth', 0.13), i * 160)); break;
    case 'wave': tone(210, 0.5, 'sine', 0.13, 460); break;
    case 'boss': tone(90, 1.3, 'sawtooth', 0.18, 44); break;
    case 'quest': [660, 880, 1100].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.12), i * 110)); break;
    case 'bot': tone(940, 0.06, 'sine', 0.08, 1320); break;
    case 'shield': tone(120, 0.18, 'sine', 0.12, 60); break;
    case 'deposit': tone(520, 0.09, 'triangle', 0.1, 780); break;
  }
}

/* ---------- 資源 / 建築資料 ---------- */
const RESMETA = {
  plastic: { name: '塑膠', icon: '🧴', color: '#6fe3ff' },
  wood:    { name: '木材', icon: '🪵', color: '#e0a95f' },
  metal:   { name: '金屬', icon: '🔩', color: '#cfd9e6' },
  alloy:   { name: '外星合金', icon: '👽', color: '#b892ff' }
};
const UPG = [
  { id: 'fin', name: '推進蛙鞋', ch: '鞋', c: '#6fe3ff', max: 4, desc: l => `游泳速度 +${l * 18}%`,
    costs: [{ plastic: 8 }, { plastic: 16, metal: 8 }, { metal: 20, alloy: 3 }, { metal: 30, alloy: 6 }] },
  { id: 'tank', name: '鈦合金氧氣瓶', ch: '瓶', c: '#9beaff', max: 4, desc: l => `氧氣上限 +${l * 25} · 消耗 -${l * 14}%`,
    costs: [{ plastic: 10 }, { plastic: 18, metal: 6 }, { metal: 22, alloy: 3 }, { metal: 32, alloy: 6 }] },
  { id: 'suit', name: '深海潛水衣', ch: '衣', c: '#8ee6a4', max: 4, desc: l => `生命上限 +${l * 25} · 減傷 ${l * 9}%`,
    costs: [{ wood: 8, plastic: 6 }, { wood: 14, metal: 10 }, { metal: 24, alloy: 4 }, { metal: 36, alloy: 8 }] },
  { id: 'magnet', name: '磁力收集器', ch: '磁', c: '#ffd166', max: 4, desc: l => `收集範圍 +${l * 44}`,
    costs: [{ metal: 8, plastic: 6 }, { metal: 16, plastic: 10 }, { metal: 24, alloy: 3 }, { metal: 34, alloy: 6 }] },
  { id: 'harpoon', name: '壓縮魚槍', ch: '槍', c: '#ff9aa8', max: 4, desc: l => `傷害 ${1 + l} · 射速 +${Math.round((1 - Math.pow(0.86, l)) * 100)}%`,
    costs: [{ wood: 6, metal: 8 }, { metal: 16, wood: 8 }, { metal: 26, alloy: 4 }, { metal: 38, alloy: 7 }] }
];

/* 每建造一座 → 平台多一格；成本 ×1.6^已建數量 */
const STRUCTS = {
  net:      { name: '自動收集網', ch: '網', c: '#8ee6a4', max: 3, tag: '生產', tagCls: 'prod',
              desc: '每 5 秒 +1 塑膠 · +1 木材', cost: { plastic: 12, wood: 10 } },
  recycler: { name: '分解工坊',   ch: '爐', c: '#ffb36b', max: 3, tag: '生產', tagCls: 'prod',
              desc: '每 5 秒 +1 金屬', cost: { metal: 14, wood: 8 } },
  tower:    { name: '防禦炮塔',   ch: '塔', c: '#ff9aa8', max: 3, tag: '防禦', tagCls: 'def',
              desc: '自動射擊 360 範圍內的威脅', cost: { metal: 18, wood: 8 } },
  reverse:  { name: '外星逆向工程', ch: '碟', c: '#c9a6ff', max: 3, tag: '稀有', tagCls: '',
              desc: '每 10 秒 +1 外星合金', cost: { metal: 22, alloy: 3 } },
  botdock:  { name: 'BOT 船塢',   ch: '機', c: '#ffd166', max: 3, tag: '自動化', tagCls: 'auto',
              desc: '派出一台 BOT 自動出海收集物資', cost: { metal: 24, plastic: 14, alloy: 2 } },
  dock:     { name: '火箭工坊',   ch: '箭', c: '#6fe3ff', max: 1, tag: '必要', tagCls: '',
              desc: '解鎖太空船組裝與發射', cost: { metal: 20, wood: 14, plastic: 12 } }
};
const STRUCT_KEYS = ['net', 'recycler', 'tower', 'reverse', 'botdock', 'dock'];

const PARTS = [
  { id: 'hull', name: '船體', ch: '體', c: '#cfd9e6', desc: '耐壓艙體與隔熱層', cost: { plastic: 12, metal: 10, wood: 6 } },
  { id: 'engine', name: '離子引擎', ch: '擎', c: '#ff9a8b', desc: '突破大氣層的推力', cost: { metal: 18, plastic: 8, alloy: 2 } },
  { id: 'fuel', name: '燃料槽', ch: '槽', c: '#ffd166', desc: '液態氫與氧化劑', cost: { plastic: 14, wood: 10, metal: 6 } },
  { id: 'nav', name: '導航電腦', ch: '導', c: '#6fe3ff', desc: '鎖定月球上的外星旗艦', cost: { metal: 12, alloy: 3, plastic: 6 } }
];

const INTRO_LINES = [
  '那天的海很平靜。我在淺灘游泳，直到天空裂開。',
  '外星飛船的巨炮擊中海面，氣流把我整個人捲進水裡。',
  '暗湧一路把我沖出去——再浮上水面時，已經看不見岸，也看不見船。',
  '沒關係。海上有無盡的垃圾，而垃圾就是材料。',
  '收集、建造、升級。總有一天，我要飛上去，把這筆帳算清楚。'
];

/* ---------- 任務鏈 ---------- */
const QUESTS = [
  { id: 'collect', text: '收集 15 件海上垃圾', sub: '游過漂流垃圾就會自動吸進背包',
    prog: () => Math.min(15, game.stats.collected) + ' / 15', done: () => game.stats.collected >= 15,
    reward: { plastic: 8, wood: 6 } },
  { id: 'net', text: '建造第一座自動收集網', sub: '按 B 打開基地，建築會讓平台擴張',
    prog: () => countType('net') + ' / 1', done: () => countType('net') >= 1,
    reward: { metal: 8 } },
  { id: 'bot', text: '建造 BOT 船塢，派機械人出海', sub: 'BOT 會自己撿垃圾並帶回基地',
    prog: () => countType('botdock') + ' / 1', done: () => countType('botdock') >= 1,
    reward: { metal: 10, alloy: 2 } },
  { id: 'harpoon', text: '把壓縮魚槍升級到 Lv2', sub: '按 C 升級裝備，用來對付鯊魚與無人機',
    prog: () => 'Lv ' + game.up.harpoon + ' / 2', done: () => game.up.harpoon >= 2,
    reward: { metal: 8 } },
  { id: 'dock', text: '建造火箭工坊', sub: '基地要有工坊才能組裝太空船',
    prog: () => countType('dock') + ' / 1', done: () => countType('dock') >= 1,
    reward: { plastic: 12, wood: 10 } },
  { id: 'parts', text: '組裝 4 個太空船零件', sub: '按 C 在「太空船」區建造',
    prog: () => partCount() + ' / 4', done: () => partCount() === 4,
    reward: { metal: 12, alloy: 3 } },
  { id: 'launch', text: '發射太空船', sub: '按 C 按下發射，前往月球',
    prog: () => game.stats.launched ? '1 / 1' : '0 / 1', done: () => !!game.stats.launched,
    reward: {} },
  { id: 'boss', text: '擊敗母船核心', sub: '攻入外星母船，擊毀反應爐核心',
    prog: () => game.stats.won ? '1 / 1' : '0 / 1', done: () => !!game.stats.won,
    reward: {} }
];

/* ---------- 遊戲狀態 ---------- */
const SAVE_KEY = 'escape-the-sea-v2';
const OLD_KEY = 'escape-the-sea-v1';

const game = {
  scene: 'title', paused: false, muted: false,
  res: { plastic: 0, wood: 0, metal: 0, alloy: 0 },
  up:  { fin: 0, tank: 0, suit: 0, magnet: 0, harpoon: 0 },
  base: { structures: [] },
  parts: { hull: false, engine: false, fuel: false, nav: false },
  stats: { collected: 0, kills: 0, time: 0, deaths: 0, launched: false, won: false, botCollected: 0, built: 0 },
  quest: { claimed: [] },
  pos: { x: 1000, y: 700 }
};
window.game = game;

/* 相容層：舊 code 讀 game.mod → 由基地建築即時計算 */
Object.defineProperty(game, 'mod', {
  get() {
    const o = {};
    for (const k of STRUCT_KEYS) o[k] = countType(k);
    return o;
  }
});

function calcStats() {
  const u = game.up;
  return {
    speed: 152 * (1 + 0.18 * u.fin),
    maxhp: 100 + 25 * u.suit,
    maxox: 100 + 25 * u.tank,
    oxRate: Math.max(0.3, 1 - 0.14 * u.tank),
    magnet: 92 + 44 * u.magnet,
    dmg: 1 + u.harpoon,
    fireRate: 0.42 * Math.pow(0.86, u.harpoon),
    armor: Math.min(0.45, 0.09 * u.suit)
  };
}

function countType(t) {
  let n = 0;
  for (const s of game.base.structures) if (s.type === t) n++;
  return n;
}
function partCount() {
  return Object.values(game.parts).filter(Boolean).length;
}
function structureCost(t) {
  const def = STRUCTS[t], n = countType(t), f = Math.pow(1.6, n), out = {};
  for (const k in def.cost) out[k] = Math.ceil(def.cost[k] * f);
  return out;
}
function baseIncomePer5() {
  const inc = { plastic: 0, wood: 0, metal: 0, alloy: 0 };
  for (const s of game.base.structures) {
    if (s.type === 'net') { inc.plastic += 1; inc.wood += 1; }
    if (s.type === 'recycler') inc.metal += 1;
  }
  return inc;
}
function addStructure(type) {
  const def = STRUCTS[type];
  if (!def || countType(type) >= def.max) return false;
  const tile = freeTileFor();
  game.base.structures.push({ type, gx: tile.gx, gy: tile.gy, born: (typeof sea !== 'undefined' ? sea.t : 0) });
  game.stats.built++;
  if (typeof onBaseChanged === 'function') onBaseChanged();
  saveGame();
  return true;
}

/* ---------- 存檔 ---------- */
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      res: game.res, up: game.up, base: game.base, parts: game.parts,
      stats: game.stats, quest: game.quest, pos: game.pos, muted: muted
    }));
  } catch (e) { /* ignore */ }
}
function hasSave() {
  try { return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem(OLD_KEY)); } catch (e) { return false; }
}
function loadGame() {
  try {
    let raw = localStorage.getItem(SAVE_KEY);
    let s = raw ? JSON.parse(raw) : null;
    if (!s) {
      const old = localStorage.getItem(OLD_KEY);
      if (!old) return false;
      s = migrateV1(JSON.parse(old));
      if (!s) return false;
    }
    for (const k in game.res) game.res[k] = (s.res && s.res[k]) || 0;
    for (const k in game.up) game.up[k] = (s.up && s.up[k]) || 0;
    for (const k in game.parts) game.parts[k] = !!(s.parts && s.parts[k]);
    for (const k in game.stats) if (s.stats && s.stats[k] !== undefined) game.stats[k] = s.stats[k];
    game.base.structures = (s.base && Array.isArray(s.base.structures)) ? s.base.structures.filter(x => x && STRUCTS[x.type]) : [];
    game.quest.claimed = (s.quest && Array.isArray(s.quest.claimed)) ? s.quest.claimed : [];
    if (s.pos && typeof s.pos.x === 'number') game.pos = { x: s.pos.x, y: s.pos.y };
    muted = !!s.muted; game.muted = muted;
    return true;
  } catch (e) { return false; }
}
function migrateV1(old) {
  const out = { res: old.res || {}, up: old.up || {}, parts: old.parts || {}, stats: old.stats || {},
                pos: old.pos || { x: 1500, y: 1100 }, quest: { claimed: [] }, base: { structures: [] } };
  const mod = old.mod || {};
  game.base.structures = [];
  for (const k of STRUCT_KEYS) {
    const n = mod[k] || 0;
    for (let i = 0; i < n; i++) {
      const t = freeTileFor();
      out.base.structures.push({ type: k, gx: t.gx, gy: t.gy });
    }
  }
  return out;
}
function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(OLD_KEY); } catch (e) {}
  game.res = { plastic: 0, wood: 0, metal: 0, alloy: 0 };
  game.up = { fin: 0, tank: 0, suit: 0, magnet: 0, harpoon: 0 };
  game.base = { structures: [] };
  game.parts = { hull: false, engine: false, fuel: false, nav: false };
  game.stats = { collected: 0, kills: 0, time: 0, deaths: 0, launched: false, won: false, botCollected: 0, built: 0 };
  game.quest = { claimed: [] };
  game.pos = { x: 1000, y: 700 };
}

/* ---------- 資源 ---------- */
function addRes(k, n) {
  if (!(k in game.res)) return;
  game.res[k] = Math.min(99999, (game.res[k] || 0) + n);
}
function canPay(cost) {
  for (const k in cost) if ((game.res[k] || 0) < cost[k]) return false;
  return true;
}
function pay(cost) {
  if (!canPay(cost)) { sfx('deny'); return false; }
  for (const k in cost) game.res[k] -= cost[k];
  saveGame();
  return true;
}
function costHtml(cost) {
  return Object.keys(cost).map(k => {
    const ok = (game.res[k] || 0) >= cost[k];
    return `<span class="${ok ? '' : 'no'}"><i class="dot ${k}"></i>${fmtNum(cost[k])}</span>`;
  }).join('');
}

/* ---------- toast ---------- */
function toast(msg, cls) {
  const box = $('toasts');
  const d = document.createElement('div');
  d.className = 'toast' + (cls ? ' ' + cls : '');
  d.textContent = msg;
  box.appendChild(d);
  while (box.children.length > 4) box.removeChild(box.firstChild);
  setTimeout(() => { d.style.transition = 'opacity .4s, transform .4s'; d.style.opacity = '0'; d.style.transform = 'translateX(20px)'; }, 2300);
  setTimeout(() => d.remove(), 2900);
}

/* ---------- HUD ---------- */
let hudT = 0;
function refreshHud() {
  for (const k of ['plastic', 'wood', 'metal', 'alloy']) {
    const el = $('r-' + k);
    if (el) el.textContent = fmtNum(game.res[k] || 0);
  }
  const S = calcStats();
  const P = (typeof sea !== 'undefined' && sea.player) ? sea.player : null;
  if (P) {
    $('bar-hp').style.width = clamp(P.hp / S.maxhp * 100, 0, 100) + '%';
    $('bar-ox').style.width = clamp(P.ox / S.maxox * 100, 0, 100) + '%';
    $('bar-st').style.width = clamp(P.st, 0, 100) + '%';
    $('v-hp').textContent = Math.ceil(P.hp) + '/' + S.maxhp;
    $('v-ox').textContent = Math.ceil(P.ox) + '/' + S.maxox;
    $('v-st').textContent = Math.ceil(P.st);
  }
  $('quest').innerHTML = questHtml();
  $('idle').textContent = idleText();
  $('basetag').innerHTML = baseTagHtml();
  const zp = (typeof sea !== 'undefined' && sea.player) ? seaZone(Math.hypot(sea.player.x, sea.player.y)) : null;
  if (zp) {
    $('zone').innerHTML = `<span style="color:${zp.color}">● ${zp.name}</span>
      <span>${zp.tip}</span>
      <span>怪物上限 <b>${zp.hazCap}</b></span>`;
  }
}

function idleText() {
  const inc = baseIncomePer5();
  const parts = [];
  const names = { plastic: '塑膠', wood: '木材', metal: '金屬' };
  for (const k in inc) if (inc[k]) parts.push(names[k] + '+' + inc[k]);
  const rev = countType('reverse');
  if (!parts.length && !rev) return '基地尚未自動化 — 按 B 建造收集網與 BOT 船塢';
  if (rev) parts.push('合金+' + rev + '（每10秒）');
  return '基地每 5 秒：' + parts.join(' · ');
}

function baseTagHtml() {
  const tiles = baseTileCount();
  const bots = (typeof sea !== 'undefined' && sea.bots) ? sea.bots.length : countType('botdock');
  const maxBots = countType('botdock');
  const inside = (typeof sea !== 'undefined' && sea.player) ? (Math.hypot(sea.player.x, sea.player.y) < baseRadius()) : false;
  return `${inside ? '<span style="color:#c8ffd4">● 安全區 · 補給中</span>' : ''}
    <span>基地 <b>${game.base.structures.length}</b> 座</span>
    <span>平台 <b>${tiles}</b> 格</span>
    <span>安全圈 <b>${Math.round(baseRadius())}</b> m</span>
    <span>BOT <b>${bots}</b>/${maxBots}</span>`;
}

function questHtml() {
  const total = QUESTS.length;
  const done = game.quest.claimed.length;
  const cur = QUESTS.find(q => !game.quest.claimed.includes(q.id));
  const pct = Math.round(done / total * 100);
  if (!cur) return `<div class="q-top">任務 ${done}/${total}<div class="qbar"><i style="width:100%"></i></div></div>
    <div>全部任務完成 — 你已經把帳算清楚了</div>`;
  const prog = cur.prog ? cur.prog() : '';
  return `<div class="q-top">任務 ${done}/${total}<div class="qbar"><i style="width:${pct}%"></i></div></div>
    <div>${cur.text}</div>
    <div class="q-sub">${prog ? prog + '　·　' : ''}${cur.sub || ''}</div>`;
}

/* ---------- modal ---------- */
const modalEl = $('modal');
const modalBody = $('modal-body');
const modalFoot = $('modal-foot');
function openModal(title, html, buttons) {
  modalEl.querySelector('h2').textContent = title;
  modalBody.innerHTML = html;
  modalBody.scrollTop = 0;
  modalFoot.innerHTML = '';
  (buttons || [{ label: '關閉' }]).forEach(b => {
    const el = document.createElement('button');
    el.textContent = b.label;
    el.className = b.cls || 'ghost';
    el.onclick = () => {
      if (b.onClick) b.onClick();
      if (!b.keepOpen) closeModal();
    };
    modalFoot.appendChild(el);
  });
  modalEl.classList.add('show');
  game.paused = true;
}
function closeModal() {
  modalEl.classList.remove('show');
  game.paused = false;
  /* 強制補救：任何「非自願」關閉都要能繼續遊戲 */
  if (typeof sea !== 'undefined' && game.scene === 'sea' && sea.dead) { respawnAtBase(); return; }
  if (game.scene === 'launch' && launch.state === 'fail') { backToBaseFromLaunch(); return; }
  if (game.scene === 'dock' && dock.state === 'fail') { backToBaseFromLaunch(); return; }
  if (game.scene === 'moon' && moon.state === 'lose') { initMoon(); return; }
}
$('modal-x').onclick = closeModal;

/* ---------- 基地面板 ---------- */
function openBase() {
  if (game.scene !== 'sea') return;
  const inc = baseIncomePer5();
  const rev = countType('reverse');
  const incTxt = [];
  if (inc.plastic) incTxt.push('塑膠 +' + inc.plastic);
  if (inc.wood) incTxt.push('木材 +' + inc.wood);
  if (inc.metal) incTxt.push('金屬 +' + inc.metal);
  if (rev) incTxt.push('合金 +' + rev + '（10秒）');

  let h = `<div class="base-summary">
    <canvas id="basemini" width="264" height="264"></canvas>
    <div class="bs-stats">
      <div class="row"><span>建築 / 平台</span><b>${game.base.structures.length} 座 · ${baseTileCount()} 格</b></div>
      <div class="row"><span>安全圈半徑</span><b class="hi">${Math.round(baseRadius())} m</b></div>
      <div class="row"><span>BOT 艦隊</span><b>${countType('botdock')} / 3　<span style="color:#7fa3b4">（自動出海收集）</span></b></div>
      <div class="row"><span>每 5 秒產出</span><b>${incTxt.length ? incTxt.join(' · ') : '—'}</b></div>
      <div class="row"><span>砲塔防禦</span><b>${countType('tower')} 座 · 射程 360</b></div>
    </div>
  </div>`;

  h += '<p class="muted">每次建造都會在平台上多佔一格，基地會一格格長大。敵怪無法進入安全圈。</p><div class="grid">';
  for (const k of STRUCT_KEYS) {
    const def = STRUCTS[k], n = countType(k), maxed = n >= def.max, cost = structureCost(k);
    h += `<div class="card${maxed ? ' maxed' : ''}">
      <div class="card-h"><span class="ico" style="--c:${def.c}">${def.ch}</span><b>${def.name}</b>
        <span class="tag ${def.tagCls}">${def.tag}</span><span class="lv">${n}/${def.max}</span></div>
      <p>${def.desc}</p>
      ${maxed ? '<div class="done">已達上限</div>'
        : `<div class="cost">${costHtml(cost)}</div>
           <button data-build="${k}">建造（第 ${n + 1} 座）</button>`}
    </div>`;
  }
  h += '</div>';

  openModal('自動化基地 — 海上平台', h, [{ label: '關閉 (Esc)' }]);
  drawBaseMini($('basemini'));
  modalBody.querySelectorAll('[data-build]').forEach(btn => {
    btn.onclick = () => {
      const t = btn.dataset.build;
      if (countType(t) >= STRUCTS[t].max) return;
      const cost = structureCost(t);
      if (!pay(cost)) { toast('資源不足'); return; }
      addStructure(t);
      sfx('build');
      toast(STRUCTS[t].name + ' 建造完成 — 平台擴張中');
      refreshHud();
      openBase();
    };
  });
}

/* ---------- 裝備 / 太空船面板 ---------- */
function openCraft() {
  if (game.scene !== 'sea') return;
  let h = '';
  const pc = partCount();
  const ready = pc === 4 && countType('dock') > 0;

  h += '<h3 style="margin:0 0 10px;font-size:14px;color:#9fe4ff;letter-spacing:.1em">裝備升級</h3><div class="grid">';
  for (const u of UPG) {
    const lv = game.up[u.id] || 0;
    const maxed = lv >= u.max;
    const cost = u.costs[lv];
    h += `<div class="card${maxed ? ' maxed' : ''}">
      <div class="card-h"><span class="ico" style="--c:${u.c}">${u.ch}</span><b>${u.name}</b><span class="lv">Lv ${lv}/${u.max}</span></div>
      <p>${u.desc(lv)}</p>
      ${maxed ? '<div class="done">已達最高等級</div>'
        : `<div class="cost">${costHtml(cost)}</div>
           <button data-buy-up="${u.id}">${lv ? '升級至 Lv ' + (lv + 1) : '製作'}</button>`}
    </div>`;
  }
  h += '</div>';

  h += '<h3 style="margin:22px 0 10px;font-size:14px;color:#ffd98a;letter-spacing:.1em">太空船零件　' + pc + ' / 4</h3><div class="grid">';
  for (const p of PARTS) {
    const built = game.parts[p.id];
    h += `<div class="card${built ? ' maxed' : ''}">
      <div class="card-h"><span class="ico" style="--c:${p.c}">${p.ch}</span><b>${p.name}</b><span class="lv">${built ? '完成' : '未建造'}</span></div>
      <p>${p.desc}</p>
      ${built ? '<div class="done">✓ 已安裝</div>'
        : `<div class="cost">${costHtml(p.cost)}</div>
           <button data-buy-part="${p.id}">建造零件</button>`}
    </div>`;
  }
  h += '</div>';

  h += `<div class="launchbar">
    <div>
      <div class="lbl">${ready ? '太空船組裝完成，隨時可以發射。' : '發射條件：4 個零件 + 火箭工坊 ×1'}</div>
      <div class="sub">${ready ? '月球軌道上偵測到外星旗艦。' : '零件進度 ' + pc + '/4' + (countType('dock') ? '' : ' · 尚未建造火箭工坊（B 基地）')}</div>
    </div>
    <button class="primary" id="btn-launch" style="margin-left:auto" ${ready ? '' : 'disabled'}>發射太空船 →</button>
  </div>`;

  openModal('裝備與太空船', h, [{ label: '關閉 (Esc)' }]);

  modalBody.querySelectorAll('[data-buy-up]').forEach(btn => {
    btn.onclick = () => {
      const u = UPG.find(x => x.id === btn.dataset.buyUp);
      const lv = game.up[u.id] || 0;
      if (lv >= u.max) return;
      if (!pay(u.costs[lv])) { toast('資源不足'); return; }
      game.up[u.id] = lv + 1;
      if (u.id === 'suit') sea.player.hp += 25;
      if (u.id === 'tank') sea.player.ox += 25;
      sfx('build'); toast(u.name + ' → Lv ' + (lv + 1));
      saveGame(); refreshHud(); openCraft();
    };
  });
  modalBody.querySelectorAll('[data-buy-part]').forEach(btn => {
    btn.onclick = () => {
      const p = PARTS.find(x => x.id === btn.dataset.buyPart);
      if (game.parts[p.id]) return;
      if (!pay(p.cost)) { toast('資源不足'); return; }
      game.parts[p.id] = true;
      sfx('build'); toast(p.name + ' 建造完成');
      saveGame(); refreshHud(); openCraft();
    };
  });
  const lb = $('btn-launch');
  if (lb) lb.onclick = () => { closeModal(); startLaunch(); };
}

/* ---------- 任務 / 說明 / 暫停 ---------- */
function openQuests() {
  let h = '<div class="qlist">';
  for (const q of QUESTS) {
    const done = game.quest.claimed.includes(q.id);
    h += `<div class="qrow${done ? ' done' : ''}">
      <div class="st">${done ? '✅' : '○'}</div>
      <div><div class="txt">${q.text}</div>
      <div class="sub">${q.prog ? q.prog() + '　·　' : ''}${q.sub || ''}</div></div>
    </div>`;
  }
  h += '</div><p class="muted" style="margin-top:14px">完成任務會獲得資源獎勵。任務只是引導，你可以用任何順序建造。</p>';
  openModal('任務', h, [{ label: '關閉 (Esc)' }]);
}

function openHelp() {
  const rows = [
    ['WASD / 方向鍵', '游動'],
    ['Shift', '衝刺（消耗體力）'],
    ['滑鼠 / 左鍵', '瞄準、發射魚槍'],
    ['B', '自動化基地：建造新建築（平台會擴張）'],
    ['C', '裝備升級 / 太空船'],
    ['J', '任務清單'],
    ['Esc', '關閉面板 / 暫停'],
    ['M', '音效開關']
  ];
  openModal('操作說明', rows.map(r => `<div class="keyrow"><span>${r[1]}</span><kbd>${r[0]}</kbd></div>`).join('') +
    `<p class="muted" style="margin-top:16px">基地安全圈內不會被攻擊，敵怪也無法進入。氧氣耗盡會扣血——靠近基地或撿空氣泡補充。</p>`,
    [{ label: '知道了', cls: 'primary' }]);
}

function openPause() {
  if (game.scene !== 'sea' && game.scene !== 'moon' && game.scene !== 'launch') return;
  openModal('已暫停', `<p class="muted">海面暫時靜了下來。你的基地仍在自動生產。</p>`,
    [
      { label: '繼續遊戲', cls: 'primary' },
      { label: muted ? '音效：關閉' : '音效：開啟', keepOpen: true,
        onClick: () => { muted = !muted; game.muted = muted; applyMute(); saveGame(); openPause(); } },
      { label: '操作說明', onClick: () => setTimeout(openHelp, 10) },
      { label: '重新開始', cls: 'danger', onClick: () => { resetGame(); location.reload(); } }
    ]);
}

/* ---------- 任務結算 ---------- */
let questT = 0;
function updateQuests(dt) {
  if (game.scene !== 'sea' && game.scene !== 'moon' && game.scene !== 'launch') return;
  questT += dt;
  if (questT < 0.4) return;
  questT = 0;
  for (const q of QUESTS) {
    if (game.quest.claimed.includes(q.id)) continue;
    let ok = false;
    try { ok = q.done(); } catch (e) { ok = false; }
    if (!ok) continue;
    game.quest.claimed.push(q.id);
    if (q.reward) for (const k in q.reward) addRes(k, q.reward[k]);
    sfx('quest');
    const rw = q.reward && Object.keys(q.reward).length
      ? '（+' + Object.keys(q.reward).map(k => RESMETA[k].name + ' ' + q.reward[k]).join(' · ') + '）' : '';
    toast('任務完成：' + q.text + rw, 'gold');
    saveGame();
    refreshHud();
  }
}

/* ---------- 場景轉場 ---------- */
let transitioning = false;
function transition(fn) {
  if (transitioning) { if (fn) fn(); return; }
  transitioning = true;
  const f = $('fade');
  f.classList.add('on');
  setTimeout(() => {
    if (fn) fn();
    setTimeout(() => { f.classList.remove('on'); transitioning = false; }, 120);
  }, 320);
}

/* ---------- 劇情 ---------- */
let introIdx = 0;
function startIntro() {
  introIdx = 0;
  $('title').hidden = true;
  $('intro').hidden = false;
  if (typeof setScene === 'function') setScene('intro');
  renderIntro();
}
function renderIntro() {
  $('intro-text').innerHTML = `<div class="line">${INTRO_LINES[introIdx]}</div>`;
  $('intro-step').textContent = (introIdx + 1) + ' / ' + INTRO_LINES.length;
  $('intro-next').textContent = introIdx >= INTRO_LINES.length - 1 ? '出海 ▸' : '繼續 ▸';
}
function nextIntro() {
  if (introIdx < INTRO_LINES.length - 1) { introIdx++; renderIntro(); }
  else { $('intro').hidden = true; beginGame(); }
}

/* ---------- 結局 ---------- */
function showEnding(win) {
  if (win) { game.stats.won = true; saveGame(); }
  $('end-kicker').textContent = win ? '任務完成 · 母船決戰' : '任務失敗';
  $('end-title').textContent = win ? '你把帳算清了' : '你被擊落了';
  $('end-text').innerHTML = win
    ? '母船核心在你眼前炸開，整艘巨艦從內部亮成一顆白色的星。<br>同盟軍的戰機從火球兩側穿出來，護著你的逃生艙往外飛。<br>「任務完成，歡迎回家。」——遠處那顆藍色星球上，有一片海在等你。'
    : '太空裝的警報聲蓋過了所有聲音。你按下了緊急撤離，艙體拖著黑煙墜回海面。';
  $('end-stats').innerHTML = `
    <div>遊戲時間<b>${fmtTime(game.stats.time)}</b></div>
    <div>收集垃圾<b>${game.stats.collected}</b></div>
    <div>基地建築<b>${game.base.structures.length}</b></div>
    <div>擊殺敵人<b>${game.stats.kills}</b></div>
    <div>裝備等級<b>${Object.values(game.up).reduce((a, b) => a + b, 0)}</b></div>`;
  $('ending').hidden = false;
  game.paused = true;
  game.scene = 'ending';
  $('hud').style.display = 'none';
  $('hint').style.display = 'none';
  sfx(win ? 'win' : 'lose');
}
