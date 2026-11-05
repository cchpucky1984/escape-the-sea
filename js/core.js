'use strict';
/* =========================================================
   逃出大海 — core：工具 / 音效 / 資料 / 存檔 / UI / 任務
   ========================================================= */

/* ---------- dom + canvas ---------- */
const $ = (id) => document.getElementById(id);
const cv = $('cv');
const ctx = cv.getContext('2d');
let VW = 0, VH = 0, DPR = 1;
/* 像素預算封頂：backbuffer 不超過 ~2.6M px（高 DPI / 4K / 手機省 GPU 填充） */
const MAX_BACKBUFFER_PX = 2.6e6;
function resizeCanvas() {
  VW = window.innerWidth; VH = window.innerHeight;
  let dpr = Math.min(2, window.devicePixelRatio || 1);
  if (VW * VH * dpr * dpr > MAX_BACKBUFFER_PX) dpr = Math.max(0.25, Math.sqrt(MAX_BACKBUFFER_PX / (VW * VH)));
  DPR = Math.round(dpr * 100) / 100;
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

/* ---------- i18n（docs/i18n/STRINGS.js；缺檔時沿用 zh 原文，不顯示 key） ---------- */
/* E 的 STRINGS.js 快照漏了 7 個成就名稱，先補英文避免 en 面板殘留中文 */
const I18N_EXTRA = {
  'ach.first_dive.name': ['第一次下潛', 'First Dive'],
  'ach.iron_isles.name': ['鋼鐵群島', 'Iron Isles'],
  'ach.full_kit.name': ['五體全滿', 'Full Kit'],
  'ach.iron_dive.name': ['鐵人潛水', 'Iron Dive'],
  'ach.safe_dive.name': ['穩健船長', 'Steady Captain'],
  'ach.no_mods.name': ['素槍主義', 'Purist'],
  'ach.no_tower.name': ['走位上癮', 'No Turrets'],
  'hint.giant': ['最近巨獸：{dir} {dist}（雷達紫點）· 或接賞金合約', 'Nearest Leviathan: {dir} {dist} (purple on radar) · or take bounties'],
  'hint.title': ['下一步', 'Next step'],
  'bounty.modbox': ['模組箱 ×{n}', 'Mod box ×{n}'],
  'ui.sail': ['出海 ▸', 'Set Sail ▸'],
  'end.statAch': ['成就 {n}/{total}（本輪 +{add}）', 'Achievements {n}/{total} (this run +{add})'],
  'bounty.icon': ['賞', '★'],
  'gate.gun': ['魚槍 Lv3（目前 Lv{n}）', 'Harpoon Lv3 (now Lv{n})'],
  'gate.suit': ['潛水衣 Lv2（目前 Lv{n}）', 'Dive Suit Lv2 (now Lv{n})'],
  'gate.rnd': ['火箭研發中心', 'Rocket R&D Center'],
  'ui.brand': ['逃出大海', 'Escape the Sea'],
  'chal.start': ['開始挑戰', 'Start Challenge'],
  'chal.bestOnly': ['最佳分 {score}', 'Best {score}'],
  'chal.bestEmpty': ['尚無紀錄', 'No record yet'],
  'chal.diffHard': ['困難', 'Hard'],
  'chal.diffNormal': ['一般', 'Normal'],
  'settings.colorblind': ['色盲友善', 'Colorblind friendly'],
  'settings.fontScale': ['字級', 'Text size'],
  'qa.marked': ['已標記卡點 #{n}（{time}）', 'Pinned issue #{n} ({time})'],
  'qa.export': ['匯出測試紀錄', 'Export QA log'],
  'bossui.eyebrow': ['最終 BOSS', 'FINAL BOSS'],
  'bossui.name': ['母船核心', 'Mothership Core'],
  'bossui.phase': ['階段 {n} / 3', 'PHASE {n} / 3'],
  'bossui.warning': ['核心過載 — 快躲', 'CORE OVERLOAD — MOVE'],
  'bossui.move.beam': ['光束', 'Beam'],
  'bossui.move.missile': ['導彈', 'Missile'],
  'bossui.move.charge': ['衝撞', 'Charge'],
  'bossui.move.gravity': ['重力', 'Gravity'],
  'bossui.mirror.eyebrow': ['逃脫階段', 'ESCAPE'],
  'bossui.mirror.name': ['你的鏡像', 'Your Mirror'],
  'bossui.skillPlus': ['技能 +1', 'SKILL +1'],
  'bossui.player': ['玩家', 'YOU'],
  'bossui.mirrorLabel': ['鏡像', 'MIRROR'],
  'bossui.compare.harpoon': ['魚槍', 'Harpoon'],
  'bossui.compare.speed': ['速度', 'Speed'],
  'bossui.compare.armor': ['裝甲', 'Armor'],
  'bossui.compare.rate': ['射速', 'Fire Rate'],
  'bossui.mirror.note': ['擊敗鏡像，奪回主控權', 'Defeat your mirror to reclaim control'],
  'radar.giant': ['巨獸 {dist}', 'Leviathan {dist}'],
  'dir.北': ['北', 'N'], 'dir.東北': ['東北', 'NE'], 'dir.東': ['東', 'E'], 'dir.東南': ['東南', 'SE'],
  'dir.南': ['南', 'S'], 'dir.西南': ['西南', 'SW'], 'dir.西': ['西', 'W'], 'dir.西北': ['西北', 'NW']
};
const I18N_USED = new Set();
const I18N_MISSING = new Set();
function langOf() {
  return (typeof game !== 'undefined' && game.settings && game.settings.lang === 'en') ? 'en' : 'zh';
}
function t(key, vars) {
  if (!key) return '';
  I18N_USED.add(key);
  const row = I18N_EXTRA[key] || (window.I18N_DATA && window.I18N_DATA[key]);
  let s = null;
  if (row) s = langOf() === 'en' ? (row[1] || row[0]) : row[0];
  if (!s) { I18N_MISSING.add(key); s = row ? row[0] : key; }
  if (vars) s = String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] === undefined ? m : String(vars[k])));
  return s;
}
function i18nMissing() { return Array.from(I18N_MISSING); }
const ZONE_KEYS = ['near', 'mid', 'deep', 'far'];
function zoneKey(z) { return ZONE_KEYS[z && z.id >= 0 && z.id < 4 ? z.id : 0]; }
function zoneName(z) { return t('zone.' + zoneKey(z) + '.name'); }
function zoneTip(z) { return t('zone.' + zoneKey(z) + '.tip'); }
function zoneShort(z) {
  const key = 'zone.' + zoneKey(z) + '.short';
  const v = t(key);
  return (v && v !== key) ? v : zoneName(z);
}
function resName(k) { return t('res.' + k); }
function structName(k) { return t('struct.' + k + '.name'); }
function structDesc(k) { return t('struct.' + k + '.desc'); }
function structTag(def) { const m = { prod: 'tag.prod', auto: 'tag.auto', def: 'tag.defense', '': 'tag.required' }; return t(m[def.tagCls] || 'tag.required'); }
function upgName(id) { return t('upg.' + id + '.name'); }
function upgDesc(u, lv) {
  if (u.id === 'fin') return t('upg.fin.desc', { n: lv * 18 });
  if (u.id === 'tank') return t('upg.tank.desc', { n: lv * 25, m: lv * 14 });
  if (u.id === 'suit') return t('upg.suit.desc', { n: 3 + lv });
  if (u.id === 'magnet') return t('upg.magnet.desc', { n: lv * 44 });
  return t('upg.harpoon.desc', { n: 1 + lv, m: Math.round((1 - Math.pow(0.86, lv)) * 100) });
}
function partName(id) { return t('part.' + id + '.name'); }
function partDesc(id) { return t('part.' + id + '.desc'); }
/* 面板 32px 圖示：zh 用原字，en 用 key 首字母（避免 en 面板殘留中文方塊） */
function icoOf(def, key) {
  if (langOf() !== 'en') return def.ch;
  return String(key || '').replace(/[^a-z]/gi, '').slice(0, 1).toUpperCase() || '·';
}
function modName(id) { return t('mod.' + id + '.name'); }
function modDesc(id) { return t('mod.' + id + '.desc'); }
function bntyName(id) { return t('bounty.' + id); }
function achName(a) { return t('ach.' + a.id + '.name'); }
function achDesc(a) { return t('ach.' + a.id + '.desc'); }
function questText(q) { return t('quest.' + q.id + '.text'); }
function questSub(q) { return t('quest.' + q.id + '.sub'); }
function setLang(lang) {
  game.settings.lang = lang === 'en' ? 'en' : 'zh';
  document.documentElement.lang = game.settings.lang === 'zh' ? 'zh-Hant' : 'en';
  saveGame(true);
  refreshStaticUI();
  refreshHud();
  if (modalEl.classList.contains('show')) {
    if (modalBody.querySelector('.settings')) openSettings();
    else if (modalBody.querySelector('.qlist')) openQuests();
    else if (modalBody.querySelector('.bounty-grid')) openBounty();
    else if (modalBody.querySelector('.mod-grid')) openCraft();
  }
}

/* ---------- audio ---------- */
let AC = null, master = null, muted = false, amb = null;
function sfxMasterVol() { return muted ? 0 : 0.22 * (clamp(game.settings.sfxVol, 0, 100) / 80); }
function initAudio() {
  if (AC) {
    if (AC.state === 'suspended') AC.resume();
    if (typeof MUSIC !== 'undefined') MUSIC.unlock();
    return;
  }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain();
    master.gain.value = sfxMasterVol();
    master.connect(AC.destination);
    startAmbient();
    if (typeof MUSIC !== 'undefined') MUSIC.unlock();
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
  if (master) master.gain.value = sfxMasterVol();
  if (typeof MUSIC !== 'undefined') MUSIC.setMuted();
}
function applySettings() {
  if (typeof document !== 'undefined' && game.settings) {
    document.body.classList.toggle('reduce-motion', !!game.settings.reduceMotion);
    document.body.classList.toggle('colorblind', !!game.settings.colorblind);
    document.body.classList.toggle('cb-safe', !!game.settings.colorblind);
    document.body.classList.toggle('font-large', game.settings.fontScale === 1.2);
    document.body.classList.toggle('text-lg', game.settings.fontScale === 1.2);
    document.documentElement.lang = game.settings.lang === 'en' ? 'en' : 'zh-Hant';
  }
  applyMute();
  if (typeof MUSIC !== 'undefined') MUSIC.updateVolume();
  installFxAccessibility();
  if (game.settings.reduceMotion && window.fx && typeof window.fx.clear === 'function') window.fx.clear();
}
/* reduce motion：統一包住 fx 的 shake/flash/hitstop（fx.js 由 D 管；這裡不改檔只包裝） */
function installFxAccessibility() {
  const F = window.fx;
  if (!F || F.__reduceMotionWrapped) return;
  for (const name of ['shake', 'flash', 'hitstop', 'slowmo']) {
    if (typeof F[name] !== 'function') continue;
    const orig = F[name];
    F[name] = function (...args) {
      if (game.settings.reduceMotion) return;
      return orig.apply(F, args);
    };
  }
  F.__reduceMotionWrapped = true;
}
/* 標題畫面在 loadGame 前也套用存檔的語言／音量（重整後不先閃回 zh） */
function restoreBootSettings() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const s = JSON.parse(raw);
    if (!s || !s.settings) return;
    for (const k of ['musicVol', 'sfxVol', 'reduceMotion', 'lang']) {
      if (s.settings[k] !== undefined) game.settings[k] = s.settings[k];
    }
    if (game.settings.lang !== 'en') game.settings.lang = 'zh';
    if (typeof game.settings.reduceMotion !== 'boolean') game.settings.reduceMotion = false;
    applySettings();
  } catch (e) {}
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
    /* v0.4：未知事件交給 fx.sfx（D 的 js/fx.js；不存在時安靜略過） */
    default: if (window.fx && typeof fx.sfx === 'function') fx.sfx(n); break;
  }
}

/* ---------- 背景音樂（WebAudio；docs/audio/*.mp3；404 安靜降級） ---------- */
const MUSIC = {
  unlocked: false, current: '', desired: '', playing: false, paused: false,
  buffers: Object.create(null), loading: Object.create(null), failed: Object.create(null),
  src: null, gain: null,
  MAP: { title: 'sea-a', intro: 'sea-a', sea: 'sea-a', launch: 'launch-b', dock: 'launch-b', moon: 'boss-a', ending: null },
  baseVol() { return Math.max(0.0001, 0.32 * (clamp(game.settings.musicVol, 0, 100) / 55)); },
  ensure() {
    if (!AC) initAudio();
    if (!AC) return false;
    if (!this.gain) {
      this.gain = AC.createGain();
      this.gain.gain.value = 0;
      this.gain.connect(AC.destination);
    }
    return true;
  },
  unlock() {
    if (!this.ensure()) return;
    this.unlocked = true;
    if (AC.state === 'suspended') { try { AC.resume(); } catch (e) {} }
    this.preload(['sea-a', 'launch-b', 'boss-a']);
    if (this.desired && this.desired !== this.current) this.play(this.desired);
  },
  fetchBuffer(name) {
    if (this.buffers[name]) return Promise.resolve(this.buffers[name]);
    if (this.failed[name]) return Promise.resolve(null);
    if (this.loading[name]) return this.loading[name];
    const p = (async () => {
      try {
        const r = await fetch('docs/audio/' + name + '.mp3?v=0.6.0');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const buf = await AC.decodeAudioData(await r.arrayBuffer());
        this.buffers[name] = buf;
        return buf;
      } catch (e) {
        this.failed[name] = true;
        return null;
      } finally { delete this.loading[name]; }
    })();
    this.loading[name] = p;
    return p;
  },
  preload(names) {
    if (!AC || !this.unlocked) return;
    for (const n of names) this.fetchBuffer(n);
  },
  stopCurrent(fade) {
    const s = this.src, g = this.gain;
    this.src = null; this.gain = null;
    this.playing = false;
    if (!s || !AC) return;
    const t = AC.currentTime;
    try {
      if (g) {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(g.gain.value, t);
        g.gain.linearRampToValueAtTime(0.0001, t + fade);
      }
      s.stop(t + fade + 0.05);
    } catch (e) {}
  },
  play(name, fade) {
    fade = fade || 1.2;
    if (!AC || !this.unlocked) return false;
    if (!name) { this.stopCurrent(1.5); this.current = ''; return true; }
    if (this.current === name && this.src) return true;
    this.current = name;               // 先把 desired track 反映給 __T.music()
    const token = name;
    this.fetchBuffer(name).then(buf => {
      if (this.desired !== token || !buf || !AC) { this.playing = false; return; }
      this.stopCurrent(fade);
      try {
        const src = AC.createBufferSource();
        src.buffer = buf; src.loop = true; src.loopStart = 0; src.loopEnd = buf.duration;
        const g = AC.createGain();
        const v = muted ? 0 : this.baseVol();
        g.gain.setValueAtTime(0.0001, AC.currentTime);
        g.gain.linearRampToValueAtTime(Math.max(0.0001, v), AC.currentTime + fade);
        src.connect(g); g.connect(AC.destination);
        src.start(0);
        this.src = src; this.gain = g;
        this.playing = !muted && !this.paused;
      } catch (e) { this.playing = false; }
    });
    return true;
  },
  setScene(scene) {
    if (scene === 'ending') {
      this.desired = ''; this.current = '';
      if (AC) this.stopCurrent(1.5);
      return;
    }
    const name = this.MAP[scene] || null;
    this.desired = name || '';
    if (!name) { if (AC) this.stopCurrent(0.8); this.current = ''; return; }
    if (this.current === name && this.src) return;
    if (this.unlocked && AC) this.play(name);
  },
  setMuted() {
    this.playing = !!this.src && !muted && !this.paused;
    if (!AC || !this.gain) return;
    const t = AC.currentTime;
    try {
      this.gain.gain.cancelScheduledValues(t);
      this.gain.gain.setValueAtTime(this.gain.gain.value, t);
      this.gain.gain.linearRampToValueAtTime(muted ? 0.0001 : this.baseVol(), t + 0.18);
    } catch (e) {}
  },
  updateVolume() { this.setMuted(); },
  status() {
    return {
      track: this.current || this.desired, desired: this.desired,
      playing: !!this.playing, paused: !!this.paused, muted: !!muted,
      musicVol: game.settings.musicVol, sfxVol: game.settings.sfxVol,
      ctx: AC ? AC.state : 'none', failed: Object.keys(this.failed)
    };
  }
};
document.addEventListener('visibilitychange', () => {
  if (!AC) return;
  if (document.visibilityState === 'hidden') {
    MUSIC.paused = true;
    MUSIC.playing = false;
    try { AC.suspend(); } catch (e) {}
  } else if (MUSIC.paused) {
    MUSIC.paused = false;
    try { AC.resume(); } catch (e) {}
    MUSIC.playing = !!MUSIC.src && !muted;
  }
});

/* ---------- 資源 / 建築資料 ---------- */
const RESMETA = {
  plastic: { name: '塑膠', icon: '🧴', color: '#6fe3ff' },
  wood:    { name: '木材', icon: '🪵', color: '#e0a95f' },
  metal:   { name: '金屬', icon: '🔩', color: '#cfd9e6' },
  alloy:   { name: '外星合金', icon: '👽', color: '#b892ff' }
};
/* ---------- 母船決戰常數（DATA v0.4 §7；D 在 space.js 消費） ---------- */
const MOON_HP_BASE = 100, MOON_HP_SUIT = 12, MOON_HP_SHIELD = 25;
const MOON_ARMOR_SUIT = 0.04, MOON_ARMOR_MAX = 0.16, MOON_INV = 1.1;
const MOON_GUN_MULT = [0, 0, 0, 0.35, 1.0];
const MOON_DMG = { gruntTouch: 6, shooterBullet: 5, shooterTouch: 5, coreRing: 4, coreAim: 5, coreTouch: 8 };
const MOON_SUPPLY = { perWave: 2, heal: 30, coreEvery: 20 };

/* ---------- 魚槍模組資料（DATA v0.4 §6；S1b 面板，S1a 先做存讀相容） ---------- */
const MODS = [
  { id: 'pierce', name: '穿透模組', ch: '穿', c: '#9fe8ff', desc: '子彈穿過目標 — 最多 3 個，傷害遞減', maxHits: 3, falloff: [1, 0.85, 0.72] },
  { id: 'blast',  name: '爆裂模組', ch: '爆', c: '#ffb36b', desc: '命中炸開 — 周圍敵人吃 55% 傷害', radius: 56, ratio: 0.55, selfMul: 0.85 },
  { id: 'emp',    name: '電磁模組', ch: '磁', c: '#c9a6ff', desc: '18% 機率讓目標停擺 1.2 秒', chance: 0.18, stopT: 1.2 }
];
function hasMod(id) { return game.mods.indexOf(id) >= 0; }
function modOf(id) { return MODS.find(m => m.id === id) || null; }

const UPG = [
  { id: 'fin', name: '推進蛙鞋', ch: '鞋', c: '#6fe3ff', max: 4, desc: l => `游泳速度 +${l * 18}%`,
    costs: [{ plastic: 8 }, { plastic: 16, metal: 8 }, { metal: 20, alloy: 3 }, { metal: 30, alloy: 6 }] },
  { id: 'tank', name: '鈦合金氧氣瓶', ch: '瓶', c: '#9beaff', max: 4, desc: l => `氧氣 +${l * 25} · 消耗 -${l * 14}%`,
    costs: [{ plastic: 10 }, { plastic: 18, metal: 6 }, { metal: 22, alloy: 3 }, { metal: 32, alloy: 6 }] },
  { id: 'suit', name: '深海潛水衣', ch: '衣', c: '#8ee6a4', max: 4, desc: l => `最大生命 ${3 + l} HP（每級 +1）`,
    costs: [{ wood: 8, plastic: 6 }, { wood: 14, metal: 10 }, { metal: 24, alloy: 4 }, { metal: 36, alloy: 8 }] },
  { id: 'magnet', name: '磁力收集器', ch: '磁', c: '#ffd166', max: 4, desc: l => `收集範圍 +${l * 44}`,
    costs: [{ metal: 8, plastic: 6 }, { metal: 16, plastic: 10 }, { metal: 24, alloy: 3 }, { metal: 34, alloy: 6 }] },
  { id: 'harpoon', name: '壓縮魚槍', ch: '槍', c: '#ff9aa8', max: 4, desc: l => `傷害 ${1 + l} · 射速 +${Math.round((1 - Math.pow(0.86, l)) * 100)}%`,
    costs: [{ wood: 6, metal: 8 }, { metal: 16, wood: 8 }, { metal: 26, alloy: 4 }, { metal: 38, alloy: 7 }] }
];

/* ---------- 賞金合約常數（DATA-v0.4 §5） ---------- */
const BOUNTY = {
  slots: 3,
  refill: 6,
  reroll: { metal: 15 },
  tierKills: [40, 120],
  patrolZone: 2,
  pool: [
    { id: 'cull', w: 3, text: '清剿：鯊魚', target: [6, 10, 16],
      reward: [{ alloy: 2, metal: 15 }, { alloy: 4, metal: 30 }, { alloy: 7, metal: 50 }] },
    { id: 'drone', w: 3, text: '拆解：外星無人機', target: [4, 7, 12],
      reward: [{ alloy: 3 }, { alloy: 5 }, { alloy: 9 }] },
    { id: 'salvage', w: 2, text: '打撈：帶回塑膠', target: [10, 18, 30],
      reward: [{ wood: 10, alloy: 1 }, { wood: 20, alloy: 2 }, { wood: 35, alloy: 4 }] },
    { id: 'patrol', w: 2, text: '巡弋：待在深海或更遠', target: [60, 100, 150],
      reward: [{ alloy: 3 }, { alloy: 5 }, { alloy: 8 }] },
    { id: 'decap', w: 1, minTier: 2, text: '獵首：擊敗一隻深海巨獸', target: [1, 1, 1],
      reward: [{ alloy: 8, modBox: 1 }, { alloy: 8, modBox: 1 }, { alloy: 8, modBox: 1 }] }
  ]
};

/* 每建造一座 → 平台多一格；成本 ×1.6^已建數量 */
const STRUCTS = {
  net:      { name: '自動收集網', ch: '網', c: '#8ee6a4', max: 3, tag: '生產', tagCls: 'prod',
              desc: '每 5 秒 +1 塑膠 · +1 木材', cost: { plastic: 12, wood: 10 } },
  recycler: { name: '分解工坊',   ch: '爐', c: '#ffb36b', max: 3, tag: '生產', tagCls: 'prod',
              desc: '每 5 秒 +1 金屬', cost: { metal: 14, wood: 8 } },
  botdock:  { name: 'BOT 船塢',   ch: '機', c: '#ffd166', max: 3, tag: '自動化', tagCls: 'auto',
              desc: '派出一台 BOT 自動出海收集物資', cost: { metal: 24, plastic: 14, alloy: 2 } },
  equip:    { name: '裝備房',     ch: '裝', c: '#8ee6a4', max: 1, tag: '必要', tagCls: '',
              desc: '解鎖裝備升級（C 面板）', cost: { metal: 16, wood: 12, plastic: 10 } },
  rnd:      { name: '火箭研發中心', ch: '研', c: '#9beaff', max: 1, tag: '必要', tagCls: '',
              desc: '解鎖火箭科技與超級武器', cost: { metal: 26, plastic: 16, alloy: 2 } },
  tower:    { name: '防禦炮塔',   ch: '塔', c: '#ff9aa8', max: 3, tag: '防禦', tagCls: 'def',
              desc: '自動射擊 360 範圍內的威脅', cost: { metal: 18, wood: 8 } },
  reverse:  { name: '外星逆向工程', ch: '碟', c: '#c9a6ff', max: 3, tag: '稀有', tagCls: '',
              desc: '每 10 秒 +1 外星合金', cost: { metal: 22, alloy: 3 } },
  satellite:{ name: '衛星光束發生器', ch: '衛', c: '#7fd4ff', max: 1, tag: '超級武器', tagCls: 'auto',
              desc: '決戰時呼叫軌道衛星光束', cost: { metal: 45, plastic: 30, alloy: 8 }, req: 'rnd' },
  dock:     { name: '火箭工坊',   ch: '箭', c: '#6fe3ff', max: 1, tag: '必要', tagCls: '',
              desc: '解鎖太空船組裝與發射', cost: { metal: 20, wood: 14, plastic: 12 } },
  bounty:   { name: '賞金終端',   ch: '賞', c: '#ffc247', max: 1, tag: '經濟', tagCls: '',
              desc: '解鎖賞金合約 — 擊殺與打撈都能換合金（按 H）', cost: { metal: 14, plastic: 8 } },
  modtable: { name: '模組工作台', ch: '模', c: '#a98bff', max: 1, tag: '必要', tagCls: '',
              desc: '魚槍可插 3 個模組 — 穿透 · 爆裂 · 電磁', cost: { metal: 34, alloy: 5 }, req: 'rnd' }
};
const STRUCT_KEYS = ['equip', 'rnd', 'modtable', 'dock', 'bounty', 'net', 'recycler', 'botdock', 'tower', 'reverse', 'satellite'];

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
    reward: { plastic: 6, wood: 5 } },
  { id: 'net', text: '建造第一座自動收集網', sub: '按 B（要游回基地附近才能建造）',
    prog: () => countType('net') + ' / 1', done: () => countType('net') >= 1,
    reward: { metal: 6 } },
  { id: 'equip', text: '建造裝備房', sub: '有裝備房才能升級裝備',
    prog: () => countType('equip') + ' / 1', done: () => countType('equip') >= 1,
    reward: { metal: 8 } },
  { id: 'harpoon', text: '把壓縮魚槍升級到 Lv2', sub: '按 C 升級裝備（需在基地附近）',
    prog: () => 'Lv ' + game.up.harpoon + ' / 2', done: () => game.up.harpoon >= 2,
    reward: { metal: 6 } },
  { id: 'rnd', text: '建造火箭研發中心', sub: '解鎖火箭科技與超級武器',
    prog: () => countType('rnd') + ' / 1', done: () => countType('rnd') >= 1,
    reward: { alloy: 1 } },
  { id: 'tech', text: '擊敗海域四角的守衛，收集 4 塊科技碎片', sub: '四角各一隻守衛，雷達上是紫色標記',
    prog: () => game.tech + ' / 4', done: () => game.tech >= 4,
    reward: { metal: 12, alloy: 2 } },
  { id: 'shield', text: '在研發中心解鎖火箭護盾科技', sub: '需要 4 塊科技碎片',
    prog: () => 'Lv ' + (game.up.shield || 0) + ' / 1', done: () => (game.up.shield || 0) >= 1,
    reward: {} },
  { id: 'parts', text: '組裝 4 個太空船零件', sub: '按 C 在「太空船」區建造',
    prog: () => partCount() + ' / 4', done: () => partCount() === 4,
    reward: { metal: 10, alloy: 2 } },
  { id: 'maxgun', text: '把壓縮魚槍升到最高級', sub: '母船內部：未滿級傷害只有 10%',
    prog: () => 'Lv ' + game.up.harpoon + ' / 4', done: () => game.up.harpoon >= 4,
    reward: { metal: 10 } },
  { id: 'launch', text: '發射太空船', sub: '按 C 按下發射，前往母船',
    prog: () => game.stats.launched ? '1 / 1' : '0 / 1', done: () => !!game.stats.launched,
    reward: {} },
  { id: 'boss', text: '擊敗母船核心', sub: '攻入外星母船，擊毀反應爐核心',
    prog: () => game.stats.won ? '1 / 1' : '0 / 1', done: () => !!game.stats.won,
    reward: {} },
  { id: 'bounty', text: '完成第一張賞金合約', sub: '按 H 打開賞金終端 — 擊殺與打撈都能換合金',
    prog: () => Math.min(1, game.bounty.done) + ' / 1', done: () => game.bounty.done >= 1,
    reward: { metal: 10, alloy: 2 } },
  { id: 'leviathan', text: '擊敗第一隻深海巨獸', sub: '海域四角，雷達上是紫色漩渦',
    prog: () => ((game.stats.leviathanKills || game.stats.bosses || 0) >= 1 ? '1' : '0') + ' / 1',
    done: () => (game.stats.leviathanKills || 0) >= 1 || (game.stats.bosses || 0) >= 1,
    reward: { alloy: 4 } },
  { id: 'mod', text: '把第一個模組裝上魚槍', sub: '按 C → 魚槍模組，三個槽',
    prog: () => game.mods.length + ' / 1', done: () => game.mods.length >= 1,
    reward: { metal: 12 } },
  { id: 'rift', text: '在裂縫關閉前打爆它的核心', sub: '每 3 分鐘開一次，紫色漩渦',
    prog: () => (game.stats.rifts || 0) + ' / 1', done: () => (game.stats.rifts || 0) >= 1,
    reward: { alloy: 5 } }
];

/* ---------- 成就 24（DATA-v0.6 §1） ---------- */
const ACH = [
  { id:'first_dive', name:'第一次下潛', type:'progress', hidden:false, desc:'收集第一件海上垃圾。', toast:'成就解鎖：第一次下潛', cond:() => game.stats.collected >= 1 },
  { id:'cleaner', name:'海上清道夫', type:'progress', hidden:false, desc:'累計收集 1000 件物資。', toast:'成就解鎖：海上清道夫', cond:() => game.stats.collected >= 1000 },
  { id:'builder', name:'平台一號', type:'progress', hidden:false, desc:'建造第一座建築。', toast:'成就解鎖：平台一號', cond:() => game.stats.built >= 1 },
  { id:'automated', name:'自動化上線', type:'progress', hidden:false, desc:'基地建築達 5 座。', toast:'成就解鎖：自動化上線', cond:() => game.stats.built >= 5 },
  { id:'iron_isles', name:'鋼鐵群島', type:'progress', hidden:false, desc:'基地建築達 19 座。', toast:'成就解鎖：鋼鐵群島', cond:() => game.stats.built >= 19 },
  { id:'gunmaster', name:'魚槍大師', type:'progress', hidden:false, desc:'壓縮魚槍升到 Lv4。', toast:'成就解鎖：魚槍大師', cond:() => game.up.harpoon >= 4 },
  { id:'full_kit', name:'五體全滿', type:'progress', hidden:false, desc:'五條裝備線全部 Lv4。', toast:'成就解鎖：五體全滿', cond:() => ['fin','tank','suit','magnet','harpoon'].every(k => game.up[k] >= 4) },
  { id:'tech4', name:'科技狂人', type:'progress', hidden:false, desc:'集滿 4 塊科技碎片。', toast:'成就解鎖：科技狂人', cond:() => game.tech >= 4 },
  { id:'mods3', name:'模組收藏家', type:'progress', hidden:false, desc:'魚槍插滿 3 個模組。', toast:'成就解鎖：模組收藏家', cond:() => game.mods.length >= 3 },
  { id:'revenge', name:'星際復仇', type:'progress', hidden:false, desc:'擊毀母船核心，完成第一輪。', toast:'成就解鎖：星際復仇', cond:() => game.stats.won === true },
  { id:'bounty10', name:'賞金獵人', type:'challenge', hidden:false, desc:'累計完成 10 張賞金合約。', toast:'成就解鎖：賞金獵人', cond:() => game.bounty.done >= 10 },
  { id:'levi4', name:'巨獸終結者', type:'challenge', hidden:false, desc:'擊敗 4 隻深海巨獸。', toast:'成就解鎖：巨獸終結者', cond:() => game.stats.leviathanKills >= 4 },
  { id:'iron_dive', name:'鐵人潛水', type:'challenge', hidden:false, desc:'零死亡通關。', toast:'成就解鎖：鐵人潛水', cond:() => game.stats.won && game.stats.deaths === 0 },
  { id:'safe_dive', name:'穩健船長', type:'challenge', hidden:false, desc:'死亡 5 次內通關。', toast:'成就解鎖：穩健船長', cond:() => game.stats.won && game.stats.deaths <= 5 },
  { id:'quick90', name:'分秒必爭', type:'challenge', hidden:false, desc:'90 分鐘內通關。', toast:'成就解鎖：分秒必爭', cond:() => game.stats.won && game.stats.time <= 5400 },
  { id:'speed60', name:'極速復仇', type:'challenge', hidden:false, desc:'60 分鐘內通關。', toast:'成就解鎖：極速復仇', cond:() => game.stats.won && game.stats.time <= 3600 },
  { id:'no_mods', name:'素槍主義', type:'challenge', hidden:false, desc:'不裝任何模組通關。', toast:'成就解鎖：素槍主義', cond:() => game.stats.won && game.mods.length === 0 },
  { id:'no_tower', name:'走位上癮', type:'challenge', hidden:false, desc:'不建造任何防禦炮塔通關。', toast:'成就解鎖：走位上癮', cond:() => game.stats.won && countType('tower') === 0 },
  { id:'cheater', name:'作弊者', type:'egg', hidden:true, desc:'在標題畫面輸入 cheat。', toast:'成就解鎖：作弊者', cond:() => game.cheat === true },
  { id:'shark50', name:'鯊魚剋星', type:'egg', hidden:true, desc:'擊殺 50 隻鯊魚。', toast:'成就解鎖：鯊魚剋星', cond:() => game.stats.sharkKills >= 50 },
  { id:'drone100', name:'無人機墳場', type:'egg', hidden:true, desc:'擊殺 100 台外星無人機。', toast:'成就解鎖：無人機墳場', cond:() => game.stats.droneKills >= 100 },
  { id:'jelly20', name:'水母終結', type:'egg', hidden:true, desc:'擊殺 20 隻水母。', toast:'成就解鎖：水母終結', cond:() => game.stats.jellyKills >= 20 },
  { id:'bot300', name:'BOT 工頭', type:'egg', hidden:true, desc:'BOT 累計帶回 300 件物資。', toast:'成就解鎖：BOT 工頭', cond:() => game.stats.botCollected >= 300 },
  { id:'deaths10', name:'十次重生', type:'egg', hidden:true, desc:'死亡 10 次。', toast:'成就解鎖：十次重生', cond:() => game.stats.deaths >= 10 }
];
let achNewRun = 0;
let achBaseline = 0;
function checkAch() {
  if (!Array.isArray(game.ach)) game.ach = [];
  /* 標題/intro 不檢查，避免還沒開局就存檔；ending 仍要檢查（A 指定放在 scene guard 之前） */
  if (game.scene === 'title' || game.scene === 'intro') return;
  for (const a of ACH) {
    if (game.ach.indexOf(a.id) >= 0) continue;
    if (a.type === 'challenge' && game.cheat) continue;   /* 作弊不給挑戰成就 */
    let ok = false;
    try { ok = !!a.cond(); } catch (e) { ok = false; }
    if (!ok) continue;
    game.ach.push(a.id);
    achNewRun++;
    toast(t('ach.toast', { name: achName(a) }), 'gold');
    sfx('quest');
    const F = (typeof window !== 'undefined') ? window.fx : null;
    if (F && typeof F.ring === 'function' && typeof sea !== 'undefined' && sea.player) {
      F.ring(sea.player.x, sea.player.y - 18, { r0: 8, r1: 90, life: 0.5, col: '#ffd166' });
    }
    saveGame(true);
  }
}

/* ---------- v0.9 挑戰模式（DATA-v0.9 §2） ---------- */
const CHALLENGES = [
  { id: 'iron', name: '一命深海', nameEn: 'Iron Dive', storageKey: 'escape-the-sea-chal-iron',
    desc: '不能死。死一次就結束。', descEn: 'No deaths. One death ends the run.',
    rules: { noRespawn: true, noCheat: true, noSave: true },
    score: (s) => Math.max(0, 10800 - s.time) + s.kills * 5 + s.tech * 200 + s.leviathanKills * 150 },
  { id: 'speed', name: '限時 45', nameEn: 'Speed Dive', storageKey: 'escape-the-sea-chal-speed',
    desc: '45 分鐘內攻入母船核心。', descEn: 'Reach the mothership core within 45 minutes.',
    rules: { timeLimit: 2700, noCheat: true, noSave: true },
    score: (s) => Math.max(0, 2700 - s.time) * 2 + Math.floor((game.res.metal + game.res.plastic + game.res.wood) / 10) },
  { id: 'bare', name: '赤手空拳', nameEn: 'Bare Hands', storageKey: 'escape-the-sea-chal-bare',
    desc: '不能建砲塔、不能裝模組，四件裝備不可升級。', descEn: 'No turrets, no mods, four gear lines locked.',
    rules: { noTower: true, noMods: true, lockUpgrades: ['fin', 'tank', 'suit', 'magnet'], noCheat: true, noSave: true },
    score: (s) => s.kills * 10 + s.leviathanKills * 300 + Math.max(0, 7200 - s.time) }
];
function challengeDef(id) { return CHALLENGES.find(c => c.id === id) || null; }
function challengeLocked() { return !(game.stats.won || (game.ach || []).includes('revenge')); }
function challengeBareBlocks(type) { return !!(game.challenge && game.challenge.id === 'bare' && type === 'tower'); }
function challengeBest(id) {
  try { const raw = localStorage.getItem((challengeDef(id) || {}).storageKey || ''); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}
function challengeHudText() {
  if (!game.challenge) return '';
  const c = challengeDef(game.challenge.id);
  if (!c) return '';
  if (c.rules.timeLimit) return t('chal.timeLeft', { time: fmtTime(Math.max(0, game.challenge.tLeft)) });
  return t('chal.' + c.id + '.desc');
}
function challengeEnd(win) {
  const ch = game.challenge;
  if (!ch || ch.ended) return false;
  ch.ended = true;
  const c = challengeDef(ch.id);
  let score = 0;
  try { score = c.score(game.stats) || 0; } catch (e) { score = 0; }
  score = Math.max(0, Math.round(score));
  const prev = challengeBest(ch.id);
  const isNew = !prev || score > (prev.score || 0);
  const best = isNew ? score : (prev.score || 0);
  try {
    if (isNew) localStorage.setItem(c.storageKey, JSON.stringify({ score, time: game.stats.time, kills: game.stats.kills, date: new Date().toISOString() }));
  } catch (e) {}
  ch.result = { win, score, best, isNew };
  if (win) game.stats.won = true;
  showEnding(win);
  return true;
}

/* ---------- v0.9 NG+（DATA-v0.9 §3） ---------- */
const NG_MUL = { enemyHp: 0.25, enemyDmg: 0.10, aggr: 0.05, income: 0.15, leviHp: 0.30, bossHp: 0.20, mirrorHp: 0.20, drop: 0.15 };
const NG_MAX = 9;
function ngMul(k) { return 1 + (NG_MUL[k] || 0) * (game.ng || 0); }

/* ---------- v0.7 教學（A 的 ONBOARD-v0.7 §1；本輪先接欄位、HUD 與基本前進） ---------- */
const TUTORIAL = [
  { step: 1, id: 'goHome', press: 'WASD / Shift', failT: 30,
    done: () => typeof sea !== 'undefined' && sea.player && Math.hypot(sea.player.x, sea.player.y) < baseRadius() },
  { step: 2, id: 'buildNet', press: 'B', failT: 45,
    done: () => countType('net') >= 1 },
  { step: 3, id: 'equipRoom', press: 'B → C', failT: 60,
    done: () => countType('equip') >= 1 && game.up.harpoon >= 1 },
  { step: 4, id: 'bounty', press: 'B → H', failT: 120,
    done: () => game.bounty.done >= 1 },
  { step: 5, id: 'launchGate', press: 'C', failT: 180,
    done: () => game.up.harpoon >= 3 && game.up.suit >= 2 && countType('rnd') >= 1 }
];
function tutCur() { return TUTORIAL.find(x => x.step === game.tut.step) || null; }
function tutHudText() {
  if (!game.tut || game.tut.done || game.scene !== 'sea') return '';
  const cur = tutCur();
  if (!cur) return '';
  if (game.tut.t > cur.failT) return t('tut.stuck');
  const P = (typeof sea !== 'undefined') ? sea.player : null;
  const dist = P ? fmtDist(Math.hypot(P.x, P.y)) : '';
  return t('tut.step' + cur.step, { dist });
}
function updateTutorial(dt) {
  if (!game.tut || game.tut.done || game.scene !== 'sea') return;
  const cur = tutCur();
  if (!cur) { game.tut.done = true; return; }
  game.tut.t += dt;
  if (!cur.done()) return;
  if (game.tut.doneIds.indexOf(cur.id) < 0) game.tut.doneIds.push(cur.id);
  if (game.tut.step >= TUTORIAL.length) {
    game.tut.done = true;
    toast(t('tut.done'), 'gold');
    saveGame(true);
  } else {
    game.tut.step++;
    game.tut.t = 0;
    saveGame();
  }
}
function updateChallenge(dt) {
  const ch = game.challenge;
  if (!ch || ch.ended || game.scene !== 'sea') return;
  const c = challengeDef(ch.id);
  if (!c) return;
  if (c.rules.timeLimit) {
    ch.tLeft = c.rules.timeLimit - game.stats.time;
    if (ch.tLeft <= 0) { ch.tLeft = 0; challengeEnd(false); }
  }
}

/* ---------- 遊戲狀態 ---------- */
const SAVE_KEY = 'escape-the-sea-v2';
const OLD_KEY = 'escape-the-sea-v1';
const SAVE_VER = 3;
const STAT_KEYS = ['collected', 'kills', 'time', 'deaths', 'launched', 'won', 'botCollected', 'built', 'bosses',
  'sharkKills', 'droneKills', 'jellyKills', 'plasticCollected', 'deepSeconds', 'leviathanKills', 'rifts'];

function defaultStats() {
  return {
    collected: 0, kills: 0, time: 0, deaths: 0, launched: false, won: false,
    botCollected: 0, built: 0, bosses: 0,
    sharkKills: 0, droneKills: 0, jellyKills: 0, plasticCollected: 0,
    deepSeconds: 0, leviathanKills: 0, rifts: 0
  };
}
function defaultBounty() { return { active: [], done: 0, rerollT: 0, zoneT: 0 }; }

const game = {
  scene: 'title', paused: false, muted: false, dirty: false,
  res: { plastic: 0, wood: 0, metal: 0, alloy: 0 },
  up:  { fin: 0, tank: 0, suit: 0, magnet: 0, harpoon: 0, shield: 0 },
  base: { structures: [] },
  parts: { hull: false, engine: false, fuel: false, nav: false },
  stats: defaultStats(),
  quest: { claimed: [] },
  pos: { x: 1000, y: 700 },
  tech: 0,
  bossesKilled: [],
  cheat: false,
  cheatUp: { fin: 0, tank: 0, suit: 0, magnet: 0, harpoon: 0 },
  bounty: defaultBounty(),
  mods: [],
  ach: [],
  ng: 0,
  seed: (Math.floor(Math.random() * 1000000000) || 1),
  challenge: null,
  diag: { marks: [], fps: { avg: 0, min: 0, p1: 0 }, errors: [] },
  tut: { step: 1, t: 0, done: false, doneIds: [] },
  settings: { musicVol: 55, sfxVol: 80, reduceMotion: false, colorblind: false, fontScale: 1, lang: 'zh' }
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
  const u = game.up, c = game.cheatUp || {};
  const bare = game.challenge && game.challenge.id === 'bare';
  const lock = bare ? ['fin', 'tank', 'suit', 'magnet'] : [];
  const lv = (k) => (lock.includes(k) ? 0 : (u[k] || 0) + (c[k] || 0));
  const gl = lv('harpoon');
  return {
    speed: 152 * (1 + 0.18 * lv('fin')),
    maxhp: 3 + lv('suit'),
    maxox: 100 + 25 * lv('tank'),
    oxRate: Math.max(0.3, 1 - 0.14 * lv('tank')),
    magnet: 92 + 44 * lv('magnet'),
    dmg: 1 + gl,
    fireRate: 0.42 * Math.pow(0.86, gl),
    /* v0.4 契約（AUDIT §4.5／DATA §8）：母船艙壓、減傷、登艦艦體、魚槍倍率 */
    armor: Math.min(MOON_ARMOR_MAX, MOON_ARMOR_SUIT * lv('suit')),
    moonHp: MOON_HP_BASE + MOON_HP_SUIT * lv('suit') + MOON_HP_SHIELD * (u.shield || 0),
    hullBonus: MOON_HP_SHIELD * (u.shield || 0),
    gunMult: MOON_GUN_MULT[Math.min(4, Math.max(0, gl))],
    shield: u.shield || 0,
    gunLv: gl
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
  if (challengeBareBlocks(type)) { toast(t('chal.bare.desc')); sfx('deny'); return false; }
  const def = STRUCTS[type];
  if (!def || countType(type) >= def.max) return false;
  const tile = freeTileFor();
  game.base.structures.push({ type, gx: tile.gx, gy: tile.gy, born: (typeof sea !== 'undefined' ? sea.t : 0) });
  game.stats.built++;
  if (type === 'bounty') { bountyRefillT = 0; ensureBounties(); }
  if (typeof onBaseChanged === 'function') onBaseChanged();
  saveGame();
  return true;
}

/* ---------- 存檔（v3：同一個 SAVE_KEY，payload 內加 v） ---------- */
let saveTimer = 0, saveLastStr = '', saveLastAt = -1e9, saveLastWritten = '';

function saveSnapshot() {
  return {
    v: SAVE_VER,
    res: game.res, up: game.up, base: game.base, parts: game.parts,
    stats: game.stats, quest: game.quest, pos: game.pos, muted: muted,
    tech: game.tech, bossesKilled: game.bossesKilled, cheat: game.cheat, cheatUp: game.cheatUp,
    bounty: game.bounty, mods: game.mods, ach: game.ach, ng: game.ng, seed: game.seed, tut: game.tut, settings: game.settings
  };
}
/* 立即存檔；同內容 250ms 內只寫一次（debounce）。force 忽略 debounce。
   非 force 會偵測「本地存檔被外部改寫」（例如 QA 塞 fixture）而不覆蓋。 */
function saveGame(force) {
  if (game.challenge) return false;   /* 挑戰模式不寫主存檔 */
  try {
    const str = JSON.stringify(saveSnapshot());
    const now = (typeof performance !== 'undefined') ? performance.now() : Date.now();
    if (!force) {
      let cur = null;
      try { cur = localStorage.getItem(SAVE_KEY); } catch (e) {}
      if (cur !== null && cur !== saveLastWritten && cur !== str) return false;
      if (str === saveLastStr && now - saveLastAt < 250) return false;
    }
    localStorage.setItem(SAVE_KEY, str);
    saveLastStr = str; saveLastAt = now; saveLastWritten = str; game.dirty = false;
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = 0; }
    return true;
  } catch (e) { return false; }
}
/* 標記髒資料，250ms 後合併寫一次（拾取／基地產出等低頻變動走這裡） */
function markDirty() {
  game.dirty = true;
  if (saveTimer) return;
  saveTimer = setTimeout(() => { saveTimer = 0; saveGame(); }, 250);
}
function hasSave() {
  try { return !!(localStorage.getItem(SAVE_KEY) || localStorage.getItem(OLD_KEY)); } catch (e) { return false; }
}
function migrateSave(s) {
  if (!s || typeof s !== 'object') return null;
  const d = defaultStats();
  s.stats = (s.stats && typeof s.stats === 'object') ? s.stats : {};
  for (const k in d) if (s.stats[k] === undefined) s.stats[k] = d[k];
  s.res = (s.res && typeof s.res === 'object') ? s.res : {};
  s.up = (s.up && typeof s.up === 'object') ? s.up : {};
  s.cheatUp = (s.cheatUp && typeof s.cheatUp === 'object') ? s.cheatUp : {};
  s.parts = (s.parts && typeof s.parts === 'object') ? s.parts : {};
  s.quest = (s.quest && typeof s.quest === 'object') ? s.quest : { claimed: [] };
  s.base = (s.base && typeof s.base === 'object') ? s.base : { structures: [] };
  if (!Array.isArray(s.base.structures)) s.base.structures = [];
  if (!Array.isArray(s.quest.claimed)) s.quest.claimed = [];
  if (!s.pos || typeof s.pos.x !== 'number' || typeof s.pos.y !== 'number') s.pos = { x: 1000, y: 700 };
  const b = s.bounty;
  s.bounty = (b && typeof b === 'object' && Array.isArray(b.active)) ? b : defaultBounty();
  s.bounty.active = s.bounty.active.filter(c => c && typeof c === 'object' && typeof c.id === 'string');
  if (typeof s.bounty.done !== 'number') s.bounty.done = 0;
  if (typeof s.bounty.rerollT !== 'number') s.bounty.rerollT = 0;
  if (typeof s.bounty.zoneT !== 'number') s.bounty.zoneT = 0;
  s.mods = Array.isArray(s.mods) ? s.mods.filter(id => MODS.some(m => m.id === id)).slice(0, 3) : [];
  s.ach = Array.isArray(s.ach) ? s.ach.filter(id => ACH.some(a => a.id === id)) : [];
  if (typeof s.ng !== 'number') s.ng = 0;
  if (typeof s.seed !== 'number' || !isFinite(s.seed)) s.seed = (Math.floor(Math.random() * 1000000000) || 1);
  s.settings = (s.settings && typeof s.settings === 'object') ? s.settings : {};
  if (typeof s.settings.musicVol !== 'number') s.settings.musicVol = 55;
  if (typeof s.settings.sfxVol !== 'number') s.settings.sfxVol = 80;
  if (typeof s.settings.reduceMotion !== 'boolean') s.settings.reduceMotion = false;
  if (typeof s.settings.colorblind !== 'boolean') s.settings.colorblind = false;
  if (s.settings.fontScale !== 1.2) s.settings.fontScale = 1;
  if (s.settings.lang !== 'en') s.settings.lang = 'zh';
  /* 舊檔／既有玩家跳過教學（A 的 ONBOARD §3） */
  if (!s.tut || typeof s.tut !== 'object') {
    s.tut = { step: 1, t: 0, done: !!(s.stats && (s.stats.built >= 1 || s.stats.won)), doneIds: [] };
  }
  s.v = SAVE_VER;
  return s;
}
function validateSave(s) {
  if (!s || typeof s !== 'object') return null;
  const int = (v, a, b, d) => { v = Number(v); return Number.isFinite(v) ? Math.max(a, Math.min(b, Math.floor(v))) : d; };
  for (const k of ['plastic', 'wood', 'metal', 'alloy']) s.res[k] = int(s.res[k], 0, 99999, 0);
  for (const k of ['fin', 'tank', 'suit', 'magnet', 'harpoon', 'shield']) s.up[k] = int(s.up[k], 0, 4, 0);
  for (const k of ['fin', 'tank', 'suit', 'magnet', 'harpoon']) s.cheatUp[k] = int(s.cheatUp[k], 0, 4, 0);
  for (const k of ['hull', 'engine', 'fuel', 'nav']) s.parts[k] = !!s.parts[k];
  s.tech = int(s.tech, 0, 4, 0);
  const d = defaultStats();
  for (const k in d) {
    if (typeof d[k] === 'boolean') s.stats[k] = !!s.stats[k];
    else s.stats[k] = int(s.stats[k], 0, 1e9, 0);
  }
  /* 建築白名單＋格座標驗證＋同格去重（修 AUDIT P2-2 的舊檔重疊） */
  const seen = new Set(), out = [];
  for (const st of s.base.structures) {
    if (!st || !STRUCTS[st.type]) continue;
    if (!Number.isInteger(st.gx) || !Number.isInteger(st.gy)) continue;
    const key = st.gx + ',' + st.gy;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ type: st.type, gx: st.gx, gy: st.gy, born: int(st.born, 0, 1e9, 0) });
    if (out.length >= 64) break;
  }
  s.base.structures = out;
  /* 賞金合約：id 白名單、tier/target/prog/reward 驗證（舊檔或損壞檔不炸） */
  const bo = [];
  if (s.bounty && Array.isArray(s.bounty.active)) {
    for (const c of s.bounty.active) {
      const def = c && bountyDef(c.id);
      if (!def) continue;
      const tier = int(c.tier, 1, 3, 1);
      const target = int(c.target, 1, 9999, def.target[tier - 1]);
      const reward = {};
      if (c.reward && typeof c.reward === 'object') {
        for (const k in c.reward) if (k === 'modBox' || k in game.res) reward[k] = int(c.reward[k], 0, 9999, 0);
      }
      bo.push({ id: c.id, tier, target, prog: int(c.prog, 0, target, 0), reward });
      if (bo.length >= BOUNTY.slots) break;
    }
  }
  s.bounty.active = bo;
  s.bounty.done = int(s.bounty.done, 0, 1e9, 0);
  s.bounty.rerollT = int(s.bounty.rerollT, 0, 1e9, 0);
  s.bounty.zoneT = int(s.bounty.zoneT, 0, 1e9, 0);
  s.quest.claimed = [...new Set(s.quest.claimed.filter(x => typeof x === 'string'))];
  s.ach = Array.isArray(s.ach) ? [...new Set(s.ach.filter(id => ACH.some(a => a.id === id)))] : [];
  s.ng = int(s.ng, 0, 9, 0);
  s.seed = (typeof s.seed === 'number' && isFinite(s.seed)) ? Math.floor(s.seed) : (Math.floor(Math.random() * 1000000000) || 1);
  s.settings.musicVol = int(s.settings.musicVol, 0, 100, 55);
  s.settings.sfxVol = int(s.settings.sfxVol, 0, 100, 80);
  s.settings.reduceMotion = !!s.settings.reduceMotion;
  s.settings.colorblind = !!s.settings.colorblind;
  s.settings.fontScale = s.settings.fontScale === 1.2 ? 1.2 : 1;
  s.settings.lang = s.settings.lang === 'en' ? 'en' : 'zh';
  if (!s.tut || typeof s.tut !== 'object') s.tut = { step: 1, t: 0, done: false, doneIds: [] };
  s.tut.step = int(s.tut.step, 1, 5, 1);
  s.tut.t = Math.max(0, Number(s.tut.t) || 0);
  s.tut.done = !!s.tut.done;
  s.tut.doneIds = Array.isArray(s.tut.doneIds) ? s.tut.doneIds.filter(x => typeof x === 'string') : [];
  if (s.tut.done) s.tut.step = 5;
  s.bossesKilled = Array.isArray(s.bossesKilled) ? [...new Set(s.bossesKilled.filter(x => typeof x === 'string'))] : [];
  s.pos = { x: int(s.pos.x, -1e5, 1e5, 1000), y: int(s.pos.y, -1e5, 1e5, 700) };
  return s;
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
    s = validateSave(migrateSave(s));
    if (!s) return false;
    for (const k in game.res) game.res[k] = (s.res && s.res[k]) || 0;
    for (const k in game.up) game.up[k] = (s.up && s.up[k]) || 0;
    for (const k in game.parts) game.parts[k] = !!(s.parts && s.parts[k]);
    for (const k in game.stats) if (s.stats && s.stats[k] !== undefined) game.stats[k] = s.stats[k];
    game.base.structures = (s.base && Array.isArray(s.base.structures)) ? s.base.structures : [];
    game.quest.claimed = (s.quest && Array.isArray(s.quest.claimed)) ? s.quest.claimed : [];
    if (s.pos && typeof s.pos.x === 'number') game.pos = { x: s.pos.x, y: s.pos.y };
    game.tech = s.tech || 0;
    game.bossesKilled = Array.isArray(s.bossesKilled) ? s.bossesKilled : [];
    game.cheat = !!s.cheat;
    game.cheatUp = Object.assign({ fin: 0, tank: 0, suit: 0, magnet: 0, harpoon: 0 }, s.cheatUp || {});
    game.bounty = s.bounty;
    game.mods = s.mods;
    game.ach = s.ach;
    game.ng = s.ng;
    game.seed = s.seed;
    game.challenge = null;
    game.tut = s.tut;
    game.settings = s.settings;
    achNewRun = 0;
    achBaseline = game.ach.length;
    bountyRefillT = 0;
    muted = !!s.muted; game.muted = muted;
    applySettings();
    try { saveLastWritten = raw || localStorage.getItem(SAVE_KEY) || ''; } catch (e) { saveLastWritten = ''; }
    game.dirty = false;
    return true;
  } catch (e) { return false; }
}
function migrateV1(old) {
  const out = { res: old.res || {}, up: old.up || {}, parts: old.parts || {}, stats: old.stats || {},
                pos: old.pos || { x: 1500, y: 1100 }, quest: { claimed: [] }, base: { structures: [] },
                muted: false, tech: old.tech || 0, bossesKilled: [], cheat: false,
                cheatUp: { fin: 0, tank: 0, suit: 0, magnet: 0, harpoon: 0 } };
  const mod = old.mod || {};
  /* 先讓 freeTileFor() 看到已配置的格，逐座佔格才不會重疊（AUDIT P2-2） */
  game.base.structures = out.base.structures;
  for (const k of STRUCT_KEYS) {
    const n = Math.max(0, Math.min(9, Number(mod[k]) || 0));
    for (let i = 0; i < n; i++) {
      const t = freeTileFor();
      out.base.structures.push({ type: k, gx: t.gx, gy: t.gy, born: 0 });
    }
  }
  return out;
}
function resetGame(opts) {
  const keepMeta = !!(opts === true || (opts && opts.keepMeta));
  const keepCheat = keepMeta ? false : !!game.cheat;
  const keepAch = keepMeta ? (game.ach || []).slice() : [];
  const keepNg = keepMeta ? (game.ng || 0) : 0;
  try { localStorage.removeItem(SAVE_KEY); localStorage.removeItem(OLD_KEY); } catch (e) {}
  if (typeof baseRT !== 'undefined') baseRT.clear();
  game.res = { plastic: 0, wood: 0, metal: 0, alloy: 0 };
  game.up = { fin: 0, tank: 0, suit: 0, magnet: 0, harpoon: 0, shield: 0 };
  game.base = { structures: [] };
  game.parts = { hull: false, engine: false, fuel: false, nav: false };
  game.stats = defaultStats();
  game.quest = { claimed: [] };
  game.pos = { x: 1000, y: 700 };
  game.tech = 0;
  game.bossesKilled = [];
  game.cheat = keepCheat;
  game.cheatUp = { fin: 0, tank: 0, suit: 0, magnet: 0, harpoon: 0 };
  game.bounty = defaultBounty();
  game.mods = [];
  game.ach = keepAch;
  game.ng = keepNg;
  game.seed = (Math.floor(Math.random() * 1000000000) || 1);
  game.challenge = null;
  game.tut = keepMeta
    ? { step: 5, t: 0, done: true, doneIds: ['goHome', 'buildNet', 'equipRoom', 'bounty', 'launchGate'] }
    : { step: 1, t: 0, done: false, doneIds: [] };
  achNewRun = 0;
  achBaseline = keepAch.length;
  bountyRefillT = 0;
  game.dirty = true;
  saveLastStr = ''; saveLastAt = -1e9; saveLastWritten = '';
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = 0; }
}
/* ---------- 資源 ---------- */
function addRes(k, n) {
  if (!(k in game.res)) return;
  game.res[k] = Math.min(99999, (game.res[k] || 0) + n);
  markDirty();
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

/* ---------- 賞金合約（DATA-v0.4 §5） ---------- */
let bountyRefillT = 0;
function fmtDist(d) { return d >= 1000 ? (d / 1000).toFixed(1) + ' km' : Math.round(d) + ' m'; }
function bountyDef(id) { return BOUNTY.pool.find(p => p.id === id) || null; }
function bountyTier() {
  const k = game.stats.kills || 0;
  return k < BOUNTY.tierKills[0] ? 1 : k < BOUNTY.tierKills[1] ? 2 : 3;
}
function bountyRoll(tier) {
  const pool = BOUNTY.pool.filter(p => !p.minTier || tier >= p.minTier);
  const total = pool.reduce((s, p) => s + p.w, 0);
  let r = Math.random() * total, def = pool[pool.length - 1];
  for (const p of pool) { if ((r -= p.w) <= 0) { def = p; break; } }
  const idx = Math.max(0, Math.min(2, tier - 1));
  return { id: def.id, tier, target: def.target[idx], prog: 0, reward: Object.assign({}, def.reward[idx]) };
}
function ensureBounties() {
  while (game.bounty.active.length < BOUNTY.slots) game.bounty.active.push(bountyRoll(bountyTier()));
}
function refillBounties(dt) {
  if (countType('bounty') <= 0) return;
  if (game.bounty.active.length >= BOUNTY.slots) { bountyRefillT = 0; return; }
  if (bountyRefillT > 0) { bountyRefillT -= dt; if (bountyRefillT > 0) return; }
  game.bounty.active.push(bountyRoll(bountyTier()));
}
function bountyOn(stat, n) {
  if (!n) return;
  if (stat === 'leviathanKills') stat = 'decap';   /* D 的 leviathan.js 用這個名字，對應 BOUNTY 的 decap */
  for (const c of game.bounty.active) {
    if (!c || c.id !== stat || c.prog >= c.target) continue;
    c.prog = Math.min(c.target, c.prog + n);
    game.dirty = true;
  }
}
function grantBountyReward(rw) {
  for (const k in rw) if (k !== 'modBox') addRes(k, rw[k]);
  if (rw.modBox) grantRandomMod();
}
function rewardHtml(rw) {
  const parts = [];
  for (const k in rw) if (k !== 'modBox' && RESMETA[k]) parts.push(resName(k) + ' ' + rw[k]);
  if (rw.modBox) parts.push(t('bounty.modbox', { n: rw.modBox }));
  return parts.join(' · ');
}
function claimBounty(i) {
  const c = game.bounty.active[i];
  if (!c || c.prog < c.target) return false;
  grantBountyReward(c.reward);
  game.bounty.active.splice(i, 1);
  game.bounty.done++;
  bountyRefillT = BOUNTY.refill;
  /* 面板開著（paused）時 updateSea 不會跑，用真實時間計時補槽；updateSea 內的 refill 仍保留 */
  setTimeout(() => {
    if (countType('bounty') <= 0 || game.bounty.active.length >= BOUNTY.slots) return;
    game.bounty.active.push(bountyRoll(bountyTier()));
    game.dirty = true;
    saveGame(); refreshHud();
    if (modalEl.classList.contains('show') && document.querySelector('.bounty-grid')) openBounty();
  }, BOUNTY.refill * 1000);
  sfx('quest');
  toast(t('bounty.doneToast', { text: bntyName(c.id), rewards: rewardHtml(c.reward) }), 'gold');
  saveGame(); refreshHud(); openBounty();
  return true;
}
function rerollBounty(i) {
  if (!game.bounty.active[i]) return false;
  if (!pay(BOUNTY.reroll)) { toast(t('bounty.rerollDeny', { n: BOUNTY.reroll.metal })); return false; }
  game.bounty.active[i] = bountyRoll(game.bounty.active[i].tier);
  sfx('build'); saveGame(); refreshHud(); openBounty();
  return true;
}
function bountyHtml() {
  let h = '<div class="bounty-grid grid">';
  game.bounty.active.forEach((c, i) => {
    const ready = c.prog >= c.target;
    const pct = clamp(c.prog / c.target * 100, 0, 100);
    h += `<div class="card bounty${ready ? ' ready' : ''}" data-bounty="${c.id}" data-tier="${c.tier}" data-ready="${ready}">
      <div class="card-h"><span class="ico" style="--c:#ffc247">${t('bounty.icon')}</span><b>${bntyName(c.id)}</b><span class="tag">T${c.tier}</span><span class="lv">${Math.floor(c.prog)} / ${c.target}</span></div>
      <div class="bounty-bar"><i style="width:${pct}%"></i></div>
      <p class="bounty-reward">${t('bounty.reward', { list: rewardHtml(c.reward) })}</p>
      <div class="bounty-actions">
        <button class="primary" data-claim="${i}" ${ready ? '' : 'disabled'}>${ready ? t('bounty.claim') : t('bounty.progress')}</button>
        <button class="ghost" data-reroll="${i}">${t('bounty.reroll', { n: BOUNTY.reroll.metal })}</button>
      </div>
    </div>`;
  });
  for (let i = game.bounty.active.length; i < BOUNTY.slots; i++) {
    h += `<div class="card bounty slot-empty" data-bounty-slot="${i}"><div class="done">${t('bounty.empty', { n: BOUNTY.refill })}</div></div>`;
  }
  h += '</div>';
  h += `<p class="muted bounty-note">${t('bounty.note', { refill: BOUNTY.refill, reroll: BOUNTY.reroll.metal })}</p>`;
  return h;
}
function openBounty() {
  if (game.scene !== 'sea') return;
  if (countType('bounty') <= 0) {
    sfx('deny');
    toast(t('bounty.needTerminal'));
    return;
  }
  if (game.bounty.active.length === 0 && bountyRefillT <= 0) ensureBounties();
  openModal(t('bounty.title'),
    `<div class="bounty-top"><span>${t('bounty.top', { n: game.bounty.active.length, slots: BOUNTY.slots, done: game.bounty.done || 0, tier: bountyTier() })}</span></div>` + bountyHtml(),
    [{ label: t('base.close') }]);
  modalBody.querySelectorAll('[data-claim]').forEach(btn => { btn.onclick = () => claimBounty(+btn.dataset.claim); });
  modalBody.querySelectorAll('[data-reroll]').forEach(btn => { btn.onclick = () => rerollBounty(+btn.dataset.reroll); });
}

/* ---------- 魚槍模組（DATA-v0.4 §6） ---------- */
function grantRandomMod() {
  if (game.challenge && game.challenge.id === 'bare') {
    addRes('alloy', 3);
    toast(t('chal.bare.desc') + ' +3');
    return null;
  }
  const left = MODS.filter(m => !hasMod(m.id));
  if (!left.length) { addRes('alloy', 3); toast(t('mod.full')); return null; }
  const m = pick(left);
  game.mods.push(m.id);
  saveGame(); refreshHud();
  toast(t('mod.got', { name: modName(m.id) }), 'gold');
  return m.id;
}
function bulletMods() { return { pierce: hasMod('pierce'), blast: hasMod('blast'), emp: hasMod('emp') }; }
/* 給 D 的巨獸／裂縫檔案呼叫（window 全域） */
window.bountyOn = bountyOn;
window.grantRandomMod = grantRandomMod;
window.bountyDef = bountyDef;
window.BOUNTY = BOUNTY;
window.MODS = MODS;

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

/* ---------- v0.10 QA／封測工具（BETA-KIT §6：F2/F3／匯出／錯誤收集） ---------- */
const QA_LOG_KEY = 'etsea-qa-log';
function qaStorageList() {
  try { const a = JSON.parse(localStorage.getItem(QA_LOG_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; }
}
function qaDiag() {
  if (!game.diag) game.diag = { marks: [], fps: { avg: 0, min: 0, p1: 0 }, errors: [] };
  return game.diag;
}
function qaPushError(msg) {
  const d = qaDiag();
  d.errors.push({ t: +(game.stats.time || 0).toFixed(2), msg: String(msg || 'unknown').slice(0, 240) });
  while (d.errors.length > 20) d.errors.shift();
}
function initQaDiag() {
  const d = qaDiag();
  d.marks = qaStorageList().slice(-50);
  qaInstallErrorHooks();
}
function qaInstallErrorHooks() {
  if (window.__qaErrorHooks) return;
  window.__qaErrorHooks = true;
  const prev = window.onerror;
  window.onerror = function (msg, src, line, col, err) {
    qaPushError((err && err.message) || msg);
    return prev ? prev.apply(this, arguments) : false;
  };
  window.addEventListener('unhandledrejection', (e) => qaPushError(e && e.reason ? (e.reason.message || e.reason) : 'unhandledrejection'));
}
function qaLog() { return qaDiag().marks; }
function qaMark() {
  const P = (typeof sea !== 'undefined' && sea.player) ? sea.player : null;
  const d = qaDiag();
  const entry = {
    t: +(game.stats.time || 0).toFixed(2),
    wall: Date.now(),
    scene: game.scene,
    x: P ? Math.round(P.x) : null,
    y: P ? Math.round(P.y) : null,
    hp: P ? +(P.hp || 0).toFixed(1) : null,
    ox: P ? +(P.ox || 0).toFixed(1) : null,
    /* 保留 Lead 工單要求的欄位，方便舊工具讀 */
    res: { plastic: game.res.plastic, wood: game.res.wood, metal: game.res.metal, alloy: game.res.alloy },
    challenge: game.challenge ? { id: game.challenge.id, ended: !!game.challenge.ended } : null,
    ng: game.ng || 0,
    note: ''
  };
  d.marks.push(entry);
  while (d.marks.length > 50) d.marks.shift();
  const stored = qaStorageList();
  stored.push(entry);
  while (stored.length > 200) stored.shift();
  try { localStorage.setItem(QA_LOG_KEY, JSON.stringify(stored)); } catch (e) {}
  toast(t('qa.marked', { n: d.marks.length, time: fmtTime(entry.t) }), 'qa-mark');
  return entry;
}
function qaVersion() {
  const s = document.querySelector('script[src*="main.js"]');
  const m = s && s.src.match(/[?&]v=([^&]+)/);
  if (m) return decodeURIComponent(m[1]);
  const ver = document.querySelector('#title .ver');
  return ver ? ver.textContent.trim() : 'unknown';
}
function buildQAExport() {
  const d = qaDiag();
  return {
    version: qaVersion(),
    exportedAt: new Date().toISOString(),
    ua: (navigator.userAgent || '').slice(0, 240),
    screen: window.innerWidth + 'x' + window.innerHeight,
    settings: Object.assign({}, game.settings),
    stats: Object.assign({}, game.stats),
    ng: game.ng || 0,
    ach: (game.ach || []).slice(),
    tut: { step: game.tut.step, done: !!game.tut.done, doneIds: (game.tut.doneIds || []).slice() },
    challenge: game.challenge ? { id: game.challenge.id, tLeft: game.challenge.tLeft, ended: !!game.challenge.ended } : null,
    marks: d.marks.slice(),
    fps: Object.assign({}, d.fps),
    errors: d.errors.slice(),
    saveRaw: (() => { try { return localStorage.getItem(SAVE_KEY) || ''; } catch (e) { return ''; } })()
  };
}
function exportQA() {
  const data = buildQAExport();
  try {
    const dt = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const name = 'escape-the-sea-log-' + dt.getFullYear() + pad(dt.getMonth() + 1) + pad(dt.getDate()) + '-' + pad(dt.getHours()) + pad(dt.getMinutes()) + '.json';
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    return data;
  } catch (e) { return data; }
}
let qaFpsOn = false, qaFpsFrames = 0, qaFpsAcc = 0, qaFpsWindow = 0;
let qaFpsSamples = [];
function ensureQaFpsPanel() {
  let el = document.getElementById('fps');
  if (!el) {
    el = document.createElement('div');
    el.id = 'fps'; el.className = 'fps-panel';
    el.style.cssText = 'position:fixed;right:12px;top:12px;z-index:9999;display:none;padding:6px 8px;border-radius:6px;background:rgba(2,7,13,.82);color:#9fe8ff;font:11px/1.5 ui-monospace,Consolas,monospace;white-space:nowrap;pointer-events:none';
    document.body.appendChild(el);
  }
  return el;
}
function toggleQaFps(force) {
  qaFpsOn = (force === undefined) ? !qaFpsOn : !!force;
  const el = ensureQaFpsPanel();
  el.style.display = qaFpsOn ? 'block' : 'none';
  el.hidden = !qaFpsOn;
  if (!qaFpsOn) { qaFpsFrames = 0; qaFpsAcc = 0; qaFpsWindow = 0; qaFpsSamples = []; }
  return qaFpsOn;
}
function qaFpsTick(rawDt) {
  if (!qaFpsOn) return;
  qaFpsFrames++; qaFpsAcc += rawDt; qaFpsWindow += rawDt;
  if (qaFpsAcc < 0.25) return;
  const fps = qaFpsFrames / qaFpsAcc;
  const ms = (qaFpsAcc / qaFpsFrames) * 1000;
  const fxStats = (window.fx && typeof window.fx.stats === 'function') ? window.fx.stats() : null;
  const parts = fxStats ? (fxStats.parts || 0) : 0;
  const entities = ((typeof sea !== 'undefined' && sea.hazards) ? sea.hazards.length : 0) +
    ((typeof sea !== 'undefined' && sea.ebullets) ? sea.ebullets.length : 0) + parts;
  ensureQaFpsPanel().textContent = `FPS ${fps.toFixed(1)} / ${ms.toFixed(1)} ms / E ${entities}`;
  qaFpsSamples.push(fps);
  if (qaFpsSamples.length > 40) qaFpsSamples.shift();
  qaFpsFrames = 0; qaFpsAcc = 0;
  if (qaFpsWindow >= 5) {
    const sorted = qaFpsSamples.slice().sort((a, b) => a - b);
    const avg = qaFpsSamples.reduce((a, b) => a + b, 0) / Math.max(1, qaFpsSamples.length);
    qaDiag().fps = {
      avg: +avg.toFixed(1),
      min: +(sorted[0] || 0).toFixed(1),
      p1: +(sorted[Math.max(0, Math.floor(sorted.length * 0.01))] || sorted[0] || 0).toFixed(1)
    };
    qaFpsWindow = 0;
  }
}

/* ---------- HUD ---------- */
/* ---------- HUD（快取簽名，值沒變就不寫 DOM：AUDIT P2-5） ---------- */
let hudT = 0;
const hudCache = { res: Object.create(null), ox: '', st: '', quest: '', idle: '', basetag: '', zone: '', nextstep: '' };
function setHudHtml(id, html, key) {
  const el = $(id);
  if (!el || hudCache[key] === html) return;
  hudCache[key] = html;
  el.innerHTML = html;
}
function setHudText(id, text, key) {
  const el = $(id);
  if (!el || hudCache[key] === text) return;
  hudCache[key] = text;
  el.textContent = text;
}
const HEART_SVG = '<svg viewBox="0 0 24 24"><path d="M12 21s-8-5.2-8-11a4.5 4.5 0 018-2.6A4.5 4.5 0 0120 10c0 5.8-8 11-8 11z"/></svg>';
let heartSig = '';
function renderHearts(hp, max) {
  const el = $('hearts');
  if (!el) return;
  const sig = Math.ceil(hp) + '/' + max;
  if (sig === heartSig) return;
  heartSig = sig;
  let h = '';
  for (let i = 0; i < max; i++) h += `<span class="heart ${i < Math.ceil(hp) ? 'on' : 'off'}">${HEART_SVG}</span>`;
  el.innerHTML = h;
}

function refreshHud() {
  for (const k of ['plastic', 'wood', 'metal', 'alloy']) {
    const val = fmtNum(game.res[k] || 0);
    if (hudCache.res[k] === val) continue;
    hudCache.res[k] = val;
    const el = $('r-' + k);
    if (el) el.textContent = val;
  }
  const S = calcStats();
  const P = (typeof sea !== 'undefined' && sea.player) ? sea.player : null;
  if (P) {
    renderHearts(P.hp, S.maxhp);
    const oxW = clamp(P.ox / S.maxox * 100, 0, 100) + '%';
    const stW = clamp(P.st, 0, 100) + '%';
    if (hudCache.ox !== oxW) { hudCache.ox = oxW; $('bar-ox').style.width = oxW; }
    if (hudCache.st !== stW) { hudCache.st = stW; $('bar-st').style.width = stW; }
  }
  setHudHtml('quest', questHtml(), 'quest');
  setHudText('idle', idleText(), 'idle');
  setHudHtml('basetag', baseTagHtml(), 'basetag');
  const zp = (typeof sea !== 'undefined' && sea.player) ? seaZone(Math.hypot(sea.player.x, sea.player.y)) : null;
  if (zp) {
    setHudHtml('zone', `<span style="color:${zp.color}">● ${zoneShort(zp)}</span>
      <span>${zoneTip(zp)}</span>
      <span>${t('hud.zoneCap', { n: zp.hazCap })}</span>`, 'zone');
  }
  /* v0.5 上手引導／v0.7 教學：HUD「下一步」chip（沿用 #nextstep，不新增 DOM） */
  const nsEl = ensureNextStepEl();
  const curTut = game.tut && !game.tut.done ? tutCur() : null;
  const chalTxt = challengeHudText();
  const tutTxt = tutHudText();
  const ns = chalTxt || tutTxt || nextStepText();
  if (nsEl) {
    nsEl.hidden = !ns;
    nsEl.style.display = ns ? '' : 'none';
    nsEl.classList.toggle('challenge', !!game.challenge);
    if (game.challenge) nsEl.dataset.challenge = game.challenge.id;
    else delete nsEl.dataset.challenge;
    const label = chalTxt ? t('chal.' + (game.challenge ? game.challenge.id : 'title') + '.name') : t('hint.title') + (tutTxt && curTut ? ' · ' + curTut.press : '');
    setHudHtml('nextstep', ns ? `<b>${label}</b><span>${ns}</span>` : '', 'nextstep');
  }
  /* NG+ HUD badge（index 由 C 管；動態建立） */
  let ngBadge = document.getElementById('hud-ng');
  if (!ngBadge) {
    const hud = $('hud');
    if (hud) {
      ngBadge = document.createElement('div');
      ngBadge.id = 'hud-ng'; ngBadge.className = 'ng-badge hud-ng';
      hud.appendChild(ngBadge);
    }
  }
  if (ngBadge) {
    ngBadge.hidden = !(game.ng > 0);
    ngBadge.textContent = game.ng > 0 ? t('ng.label', { n: game.ng }) : '';
  }
}
function ensureNextStepEl() {
  let el = $('nextstep');
  if (!el) {
    const hud = $('hud');
    if (!hud) return null;
    el = document.createElement('div');
    el.id = 'nextstep';
    el.className = 'nextstep';
    hud.appendChild(el);
  }
  return el;
}
/* 依任務狀態給一句「現在該做什麼」；需要基地的動作會附距離 */
function nextStepText() {
  if (game.scene !== 'sea' || typeof sea === 'undefined' || !sea.player || sea.dead) return '';
  const P = sea.player, d = Math.hypot(P.x, P.y), R = baseRadius();
  const near = d < R + 90;
  const back = (s) => near ? s : t('hint.back', { dist: fmtDist(d), step: s });
  if (countType('net') === 0) return back(t('hint.net'));
  if (countType('equip') === 0) return back(t('hint.equip'));
  if (countType('bounty') === 0) return back(t('hint.bounty'));
  if (game.bounty.active.length === 0 && bountyRefillT > 0) return t('hint.refill', { n: Math.ceil(bountyRefillT) });
  if (game.up.harpoon < 2) return back(t('hint.harpoon2'));
  if (game.tech < 4) {
    const li = nearestLeviathanInfo();
    if (li) return t('hint.giant', { dir: t('dir.' + li.dir), dist: fmtDist(li.dist) });
    return t('hint.tech');
  }
  if (countType('rnd') === 0) return back(t('hint.rnd'));
  if (partCount() < 4) return back(t('hint.parts'));
  if (countType('dock') === 0) return back(t('hint.dock'));
  return back(t('hint.launch'));
}
/* 靜態 HTML（index 由 C 管）在語言切換時同步；不動 canvas */
function refreshStaticUI() {
  document.title = t('ui.htmlTitle');
  const title = $('title');
  if (title) {
    const kicker = title.querySelector('.kicker'), blurb = title.querySelector('.blurb'), ctrl = title.querySelector('.ctrl');
    const h1 = title.querySelector('h1');
    if (h1) h1.textContent = t('ui.brand');
    if (kicker) kicker.textContent = t('ui.kicker');
    if (blurb) blurb.innerHTML = t('ui.blurb');
    if (ctrl) ctrl.textContent = t('ui.ctrl');
  }
  const setTxt = (id, key) => { const el = $(id); if (el) el.textContent = t(key); };
  setTxt('btn-challenge', 'chal.title');
  setTxt('end-kicker', 'ui.endKicker');
  setTxt('end-title', 'ui.endTitle');
  setTxt('btn-help', 'ui.help');
  setTxt('end-again', 'ui.endAgain');
  setTxt('hint', 'ui.hint');
  setTxt('btn-start', hasSave() ? 'main.restart' : 'ui.start');
  setTxt('btn-continue', 'ui.continue');
  const chips = document.querySelectorAll('#hud .res-row .chip');
  ['plastic', 'wood', 'metal', 'alloy'].forEach((k, i) => {
    const chip = chips[i];
    if (!chip) return;
    const labels = chip.querySelectorAll('i');
    if (labels.length) labels[labels.length - 1].textContent = resName(k);
  });
  const ver = document.querySelector('#title .ver');
  if (ver) {
    if (!ver.dataset.base) ver.dataset.base = ver.textContent;
    ver.textContent = ver.dataset.base + (game.ng > 0 ? ' · ' + t('ng.label', { n: game.ng }) : '');
  }
  document.documentElement.lang = game.settings.lang === 'en' ? 'en' : 'zh-Hant';
}
/* 最近巨獸方位（讀 D 的 LEVIATHANS.list；沒有檔案時回 null） */
function nearestLeviathanInfo() {
  if (typeof sea === 'undefined' || !sea.player || !window.LEVIATHANS || !Array.isArray(window.LEVIATHANS.list)) return null;
  const P = sea.player;
  let best = null, bd = Infinity;
  for (const b of window.LEVIATHANS.list) {
    if (!b || b.alive === false) continue;
    const d = Math.hypot(b.x - P.x, b.y - P.y);
    if (d < bd) { bd = d; best = b; }
  }
  if (!best) return null;
  const dirs = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
  const ang = Math.atan2(best.x - P.x, -(best.y - P.y));
  const idx = Math.round((((ang + Math.PI * 2) % (Math.PI * 2)) / (Math.PI / 4))) % 8;
  return { dir: dirs[idx], dist: bd, x: best.x, y: best.y };
}
function idleText() {
  const inc = baseIncomePer5();
  const parts = [];
  for (const k in inc) if (inc[k]) parts.push(resName(k) + '+' + inc[k]);
  const rev = countType('reverse');
  if (!parts.length && !rev) return t('hud.idleNone');
  if (rev) parts.push(t('hud.idleAlloy', { n: rev }));
  return t('hud.idleEvery5') + parts.join(' · ');
}

function baseTagHtml() {
  const tiles = baseTileCount();
  const bots = (typeof sea !== 'undefined' && sea.bots) ? sea.bots.length : countType('botdock');
  const maxBots = countType('botdock');
  const inside = (typeof sea !== 'undefined' && sea.player) ? (Math.hypot(sea.player.x, sea.player.y) < baseRadius()) : false;
  return `${inside ? '<span style="color:#c8ffd4">● ' + t('hud.safeResupply') + '</span>' : ''}
    <span>${t('hud.baseCount', { n: game.base.structures.length })}</span>
    <span>${t('hud.baseTiles', { n: tiles })}</span>
    <span>${t('hud.baseRadius', { n: Math.round(baseRadius()) })}</span>
    <span>${t('hud.baseBots', { n: bots, max: maxBots })}</span>
    <span>${t('hud.baseShards', { n: game.tech })}</span>`;
}

function atBase() {
  if (typeof sea === 'undefined' || !sea.player) return false;
  return Math.hypot(sea.player.x, sea.player.y) < baseRadius() + 90;
}
function questHtml() {
  const total = QUESTS.length;
  const done = game.quest.claimed.length;
  const cur = QUESTS.find(q => !game.quest.claimed.includes(q.id));
  const pct = Math.round(done / total * 100);
  if (!cur) return `<div class="q-top">${t('hud.quest', { done, total })}<div class="qbar"><i style="width:100%"></i></div></div>
    <div>${t('hud.questAllDone')}</div>`;
  const prog = cur.prog ? cur.prog() : '';
  return `<div class="q-top">${t('hud.quest', { done, total })}<div class="qbar"><i style="width:${pct}%"></i></div></div>
    <div>${questText(cur)}</div>
    <div class="q-sub">${prog ? prog + '　·　' : ''}${questSub(cur)}</div>`;
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
  (buttons || [{ label: t('base.close') }]).forEach(b => {
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
  /* 不再在這裡做場景補救（AUDIT P1-1：會與按鈕 onClick 重複執行）。
     X／Esc 關閉失敗 modal 的復活／返回基地由 main.js 的 recoverClosedFailureModal() 統一處理。 */
}
$('modal-x').onclick = closeModal;

/* ---------- 基地面板 ---------- */
function openBase() {
  if (game.scene !== 'sea') return;
  if (!atBase()) {
    sfx('deny');
    toast(t('toast.needBase', { dist: Math.round(Math.hypot(sea.player.x, sea.player.y)) + ' m' }));
    return;
  }
  const inc = baseIncomePer5();
  const rev = countType('reverse');
  const incTxt = [];
  for (const k of ['plastic', 'wood', 'metal']) if (inc[k]) incTxt.push(resName(k) + ' +' + inc[k]);
  if (rev) incTxt.push(t('hud.idleAlloy', { n: rev }));

  let h = `<div class="base-summary">
    <canvas id="basemini" width="264" height="264"></canvas>
    <div class="bs-stats">
      <div class="row"><span>${t('base.rows')}</span><b>${game.base.structures.length} / ${baseTileCount()}</b></div>
      <div class="row"><span>${t('base.radiusRow')}</span><b class="hi">${Math.round(baseRadius())} m</b></div>
      <div class="row"><span>${t('base.botRow')}</span><b>${countType('botdock')} / 3　<span style="color:#7fa3b4">${t('base.botAuto')}</span></b></div>
      <div class="row"><span>${t('base.per5')}</span><b>${incTxt.length ? incTxt.join(' · ') : '—'}</b></div>
      <div class="row"><span>${t('base.shardRow')}</span><b class="${game.tech >= 4 ? 'hi' : ''}">${game.tech} / 4 ${game.tech >= 4 ? t('base.shardReady') : t('base.shardHint')}</b></div>
    </div>
  </div>`;

  h += '<p class="muted">' + t('base.summaryHint') + '</p><div class="grid">';
  for (const k of STRUCT_KEYS) {
    const def = STRUCTS[k], n = countType(k), maxed = n >= def.max, cost = structureCost(k);
    const locked = def.req && !countType(def.req);
    h += `<div class="card${maxed ? ' maxed' : ''}">
      <div class="card-h"><span class="ico" style="--c:${def.c}">${icoOf(def, k)}</span><b>${structName(k)}</b>
        <span class="tag ${def.tagCls}">${structTag(def)}</span><span class="lv">${n}/${def.max}</span></div>
      <p>${structDesc(k)}</p>
      ${maxed ? '<div class="done">' + t('base.maxed') + '</div>'
        : locked ? `<div class="done" style="color:#ffb3a0">${t('base.locked', { name: structName(def.req) })}</div>`
        : `<div class="cost">${costHtml(cost)}</div>
           <button data-build="${k}">${t('base.build', { n: n + 1 })}</button>`}
    </div>`;
  }
  h += '</div>';

  openModal(t('base.title'), h, [{ label: t('base.close') }]);
  drawBaseMini($('basemini'));
  modalBody.querySelectorAll('[data-build]').forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.build;
      if (challengeBareBlocks(type)) { toast(t('chal.bare.desc')); sfx('deny'); return; }
      if (countType(type) >= STRUCTS[type].max) return;
      if (STRUCTS[type].req && !countType(STRUCTS[type].req)) { toast(t('toast.needStruct', { name: structName(STRUCTS[type].req) })); return; }
      const cost = structureCost(type);
      if (!pay(cost)) { toast(t('toast.noRes')); return; }
      addStructure(type);
      sfx('build');
      toast(t('toast.structBuilt', { name: structName(type) }));
      refreshHud();
      openBase();
    };
  });
}

/* ---------- 裝備 / 太空船面板 ---------- */
const SHIELD_COSTS = [{ metal: 30, alloy: 4 }, { metal: 45, alloy: 7 }, { metal: 60, alloy: 10 }];

function openCraft() {
  if (game.scene !== 'sea') return;
  if (!atBase()) {
    sfx('deny');
    toast(t('toast.needBase2', { dist: Math.round(Math.hypot(sea.player.x, sea.player.y)) + ' m' }));
    return;
  }
  const hasEquip = countType('equip') > 0;
  const hasRnd = countType('rnd') > 0;
  const canShield = hasRnd && game.tech >= 4;
  const pc = partCount();
  const gateLv = (k) => (game.up[k] || 0) + ((game.cheatUp && game.cheatUp[k]) || 0);
  const gateGun = gateLv('harpoon') >= 3;
  const gateSuit = gateLv('suit') >= 2;
  const gateRnd = countType('rnd') > 0;
  const gateDock = countType('dock') > 0;
  /* 發射 gate 與 startLaunch() 一致：4 零件＋工坊＋魚槍 Lv3＋潛水衣 Lv2＋研發中心 */
  const ready = pc === 4 && gateDock && gateGun && gateSuit && gateRnd;
  const gateMiss = [];
  if (!gateRnd) gateMiss.push(t('gate.rnd'));
  if (!gateGun) gateMiss.push(t('gate.gun', { n: gateLv('harpoon') }));
  if (!gateSuit) gateMiss.push(t('gate.suit', { n: gateLv('suit') }));
  if (pc < 4) gateMiss.push(t('craft.partProgress', { n: pc }));
  if (!gateDock) gateMiss.push(t('craft.noDock'));

  let h = '';

  /* ---- 裝備 ---- */
  h += '<h3 style="margin:0 0 10px;font-size:14px;color:#9fe4ff;letter-spacing:.1em">' + t('craft.equipTitle')
     + (hasEquip ? '' : '　<span style="color:#ff9a8b;font-size:12px">' + t('craft.needEquipTip') + '</span>') + '</h3><div class="grid">';
  for (const u of UPG) {
    const lv = game.up[u.id] || 0;
    const maxed = lv >= u.max;
    const cost = u.costs[lv];
    const bareLock = game.challenge && game.challenge.id === 'bare' && ['fin', 'tank', 'suit', 'magnet'].includes(u.id);
    h += `<div class="card${maxed ? ' maxed' : ''}${hasEquip ? '' : ' locked'}">
      <div class="card-h"><span class="ico" style="--c:${u.c}">${icoOf(u, u.id)}</span><b>${upgName(u.id)}</b><span class="lv">Lv ${lv}/${u.max}</span></div>
      <p>${upgDesc(u, lv)}</p>
      ${maxed ? '<div class="done">' + t('craft.maxed') + '</div>'
        : bareLock ? '<div class="done" style="color:#ffb3a0">' + t('chal.bare.desc') + '</div>'
        : !hasEquip ? '<div class="done" style="color:#ffb3a0">' + t('craft.needEquip') + '</div>'
        : `<div class="cost">${costHtml(cost)}</div>
           <button data-buy-up="${u.id}">${lv ? t('craft.upgradeTo', { n: lv + 1 }) : t('craft.make')}</button>`}
    </div>`;
  }
  h += '</div>';

  /* ---- 火箭科技 ---- */
  const sl = game.up.shield || 0;
  h += `<h3 style="margin:22px 0 10px;font-size:14px;color:#9beaff;letter-spacing:.1em">${t('craft.rocketTitle')}
     <span style="color:#7fa3b4;font-size:11.5px">${t('craft.inherit')}</span></h3><div class="grid">`;
  h += `<div class="card${sl >= 3 ? ' maxed' : ''}">
    <div class="card-h"><span class="ico" style="--c:#9beaff">${icoOf({ ch: '盾' }, 'shield')}</span><b>${t('craft.shieldName')}</b><span class="lv">Lv ${sl}/3</span></div>
    <p>${t('craft.shieldDesc')}</p>
    ${sl >= 3 ? '<div class="done">' + t('craft.maxed') + '</div>'
      : !hasRnd ? '<div class="done" style="color:#ffb3a0">' + t('craft.needRnd') + '</div>'
      : game.tech < 4 ? `<div class="done" style="color:#ffb3a0">${t('craft.needShards', { n: game.tech })}</div>`
      : `<div class="cost">${costHtml(SHIELD_COSTS[sl])}</div>
         <button data-buy-shield="1">${sl ? t('craft.upgradeTo', { n: sl + 1 }) : t('craft.research')}</button>`}
  </div>`;
  h += `<div class="card${countType('satellite') ? ' maxed' : ''}">
    <div class="card-h"><span class="ico" style="--c:#7fd4ff">${icoOf({ ch: '衛' }, 'satellite')}</span><b>${t('craft.satName')}</b>
      <span class="lv">${countType('satellite') ? t('craft.built') : t('craft.notBuilt')}</span></div>
    <p>${t('craft.satDesc')}</p>
    ${countType('satellite') ? '<div class="done">' + t('craft.ready') + '</div>'
      : hasRnd ? '<div class="done" style="color:#8ee6a4">' + t('craft.satCost') + '</div>'
      : '<div class="done" style="color:#ffb3a0">' + t('craft.needRnd') + '</div>'}
  </div>`;
  h += '</div>';

  /* ---- 魚槍模組（DATA-v0.4 §6；模組箱由巨獸／賞金獵首／裂縫給） ---- */
  const hasModTable = countType('modtable') > 0;
  h += `<h3 style="margin:22px 0 10px;font-size:14px;color:#c9a6ff;letter-spacing:.1em">${t('mod.title')}
     <span style="color:#7fa3b4;font-size:11.5px">${t('mod.slots', { n: game.mods.length })}</span></h3>`;
  if (!hasModTable) h += '<p class="muted" style="color:#ffb3a0">' + t('mod.needTable') + '</p>';
  h += '<div class="mod-grid grid">';
  for (let i = 0; i < 3; i++) {
    const id = game.mods[i], m = id ? modOf(id) : null;
    if (m) {
      h += `<div class="card mod" data-mod="${m.id}" data-owned="true" data-slot="${i}">
        <div class="card-h"><span class="ico" style="--c:${m.c}">${icoOf(m, m.id)}</span><b>${modName(m.id)}</b><span class="tag">${t('mod.equipped')}</span></div>
        <p class="mod-desc">${modDesc(m.id)}</p></div>`;
    } else {
      h += `<div class="card mod slot-empty" data-mod-slot="${i}"><div class="done">${t('mod.emptySlot')}</div></div>`;
    }
  }
  h += '</div>';

  /* ---- 太空船 ---- */
  h += '<h3 style="margin:22px 0 10px;font-size:14px;color:#ffd98a;letter-spacing:.1em">' + t('craft.partsTitle') + '　' + pc + ' / 4</h3><div class="grid">';
  for (const p2 of PARTS) {
    const built = game.parts[p2.id];
    h += `<div class="card${built ? ' maxed' : ''}">
      <div class="card-h"><span class="ico" style="--c:${p2.c}">${icoOf(p2, p2.id)}</span><b>${partName(p2.id)}</b><span class="lv">${built ? t('craft.done') : t('craft.notBuilt')}</span></div>
      <p>${partDesc(p2.id)}</p>
      ${built ? '<div class="done">' + t('craft.installed') + '</div>'
        : `<div class="cost">${costHtml(p2.cost)}</div>
           <button data-buy-part="${p2.id}">${t('craft.buildPart')}</button>`}
    </div>`;
  }
  h += '</div>';

  h += `<div class="launchbar">
    <div>
      <div class="lbl">${ready ? t('craft.launchReady') : t('craft.launchReq')}</div>
      <div class="sub">${ready ? t('craft.moonDetected') : gateMiss.join(' · ')}</div>
    </div>
    <button class="primary" id="btn-launch" style="margin-left:auto" ${ready ? '' : 'disabled'}>${t('craft.launch')}</button>
  </div>`;

  if (game.cheat) h += '<div style="margin-top:12px"><button class="ghost" id="btn-cheatpanel">' + t('cheat.open') + '</button></div>';

  openModal(t('craft.title'), h, [{ label: t('base.close') }]);

  modalBody.querySelectorAll('[data-buy-up]').forEach(btn => {
    btn.onclick = () => {
      if (!hasEquip) { toast(t('craft.needEquip')); return; }
      const u = UPG.find(x => x.id === btn.dataset.buyUp);
      if (game.challenge && game.challenge.id === 'bare' && ['fin', 'tank', 'suit', 'magnet'].includes(u.id)) { toast(t('chal.bare.desc')); sfx('deny'); return; }
      const lv = game.up[u.id] || 0;
      if (lv >= u.max) return;
      if (!pay(u.costs[lv])) { toast(t('toast.noRes')); return; }
      game.up[u.id] = lv + 1;
      if (u.id === 'suit') sea.player.hp += 1;
      if (u.id === 'tank') sea.player.ox += 25;
      sfx('build'); toast(t('craft.upgraded', { name: upgName(u.id), n: lv + 1 }));
      saveGame(); refreshHud(); openCraft();
    };
  });
  modalBody.querySelectorAll('[data-buy-part]').forEach(btn => {
    btn.onclick = () => {
      const p2 = PARTS.find(x => x.id === btn.dataset.buyPart);
      if (game.parts[p2.id]) return;
      if (!pay(p2.cost)) { toast(t('toast.noRes')); return; }
      game.parts[p2.id] = true;
      sfx('build'); toast(t('toast.structBuilt', { name: partName(p2.id) }));
      saveGame(); refreshHud(); openCraft();
    };
  });
  const sb = modalBody.querySelector('[data-buy-shield]');
  if (sb) sb.onclick = () => {
    if (!hasRnd || game.tech < 4) return;
    const lv = game.up.shield || 0;
    if (lv >= 3) return;
    if (!pay(SHIELD_COSTS[lv])) { toast(t('toast.noRes')); return; }
    game.up.shield = lv + 1;
    sfx('build'); toast(t('craft.shieldUp', { n: lv + 1 }));
    saveGame(); refreshHud(); openCraft();
  };
  const lb = $('btn-launch');
  if (lb) lb.onclick = () => { closeModal(); startLaunch(); };
  const cb = $('btn-cheatpanel');
  if (cb) cb.onclick = () => openCheat();
}

/* ---------- 作弊 ---------- */
function openCheat() {
  let h = '<p class="muted" style="color:#ff9aa8">' + t('cheat.desc') + '</p><div class="grid">';
  for (const u of UPG) {
    const cl = game.cheatUp[u.id] || 0;
    h += `<div class="card${cl >= 4 ? ' maxed' : ''}">
      <div class="card-h"><span class="ico" style="--c:${u.c}">${icoOf(u, u.id)}</span><b>${upgName(u.id)}</b><span class="lv">+${cl}</span></div>
      <p>${upgDesc(u, (game.up[u.id] || 0) + cl)}</p>
      ${cl >= 4 ? '<div class="done">' + t('cheat.full') + '</div>'
        : `<button data-cheat="${u.id}">${t('cheat.free')}</button>`}
    </div>`;
  }
  h += '</div>';
  openModal(t('cheat.title'), h, [{ label: t('cheat.take'), cls: 'primary' }]);
  modalBody.querySelectorAll('[data-cheat]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.cheat;
      game.cheatUp[id] = Math.min(4, (game.cheatUp[id] || 0) + 1);
      sfx('build');
      saveGame();
      const S = calcStats();
      if (id === 'suit') sea.player.hp = Math.min(S.maxhp, sea.player.hp + 1);
      if (id === 'tank') sea.player.ox = Math.min(S.maxox, sea.player.ox + 25);
      refreshHud();
      openCheat();
    };
  });
}

/* ---------- 任務 / 說明 / 暫停 ---------- */
function achHtml() {
  const done = game.ach.length, total = ACH.length;
  const pct = total ? Math.round(done / total * 100) : 0;
  const tabs = [['all', 'ach.tab.all'], ['progress', 'ach.tab.progress'], ['challenge', 'ach.tab.challenge'], ['secret', 'ach.tab.secret']];
  let h = `<div class="ach">
    <div class="ach-top">
      <div class="ach-progress"><div class="ach-bar"><i style="width:${pct}%"></i></div></div>
      <span class="ach-count">${t('ach.progress', { n: done, total })}</span>
    </div>
    <div class="ach-tabs">`;
  for (const [id, key] of tabs) {
    h += `<button class="ach-tab${id === 'all' ? ' on' : ''}" data-ach-cat="${id}" aria-pressed="${id === 'all'}">${t(key)}</button>`;
  }
  h += '</div><div class="ach-grid">';
  for (const a of ACH) {
    const unlocked = game.ach.includes(a.id);
    const hidden = !!a.hidden && !unlocked;
    const cat = a.type === 'egg' ? 'secret' : a.type;
    const catLabel = a.type === 'progress' ? t('ach.tab.progress') : a.type === 'challenge' ? t('ach.tab.challenge') : t('ach.tab.secret');
    const name = hidden ? '???' : achName(a);
    const desc = unlocked ? achDesc(a) : (hidden ? t('ach.hidden') : t('ach.locked', { desc: achDesc(a) }));
    const icon = unlocked ? '✓' : hidden ? '?' : a.type === 'progress' ? '◆' : a.type === 'challenge' ? '★' : '✦';
    h += `<div class="ach-card${unlocked ? ' unlocked' : ''}" data-ach="${a.id}" data-cat="${cat}" data-unlocked="${unlocked}" data-hidden="${hidden}">
      <span class="ach-icon">${icon}</span>
      <div class="ach-main"><div class="ach-name">${name}</div><div class="ach-desc">${desc}</div></div>
      <span class="ach-badge">${unlocked ? t('ach.unlocked') : catLabel}</span>
    </div>`;
  }
  return h + '</div></div>';
}

function openQuests() {
  let h = '<div class="qlist">';
  for (const q of QUESTS) {
    const done = game.quest.claimed.includes(q.id);
    h += `<div class="qrow${done ? ' done' : ''}">
      <div class="st">${done ? '✅' : '○'}</div>
      <div><div class="txt">${questText(q)}</div>
      <div class="sub">${q.prog ? q.prog() + '　·　' : ''}${questSub(q)}</div></div>
    </div>`;
  }
  h += '</div><p class="muted" style="margin-top:14px">' + t('quests.body') + '</p>';
  h += achHtml();
  openModal(t('ach.title'), h, [{ label: t('base.close') }]);
  modalBody.querySelectorAll('.ach-tab').forEach(btn => {
    btn.onclick = () => {
      const cat = btn.dataset.achCat;
      modalBody.querySelectorAll('.ach-tab').forEach(b => { b.classList.remove('on'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('on'); btn.setAttribute('aria-pressed', 'true');
      modalBody.querySelectorAll('.ach-card').forEach(card => {
        card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
      });
    };
  });
}

function openHelp() {
  const rows = [
    ['WASD / ↑↓←→', t('help.swim')],
    ['Shift', t('help.sprint')],
    ['Mouse / LMB', t('help.aim')],
    ['B', t('help.base')],
    ['C', t('help.craft')],
    ['H', t('help.bounty')],
    ['J', t('help.quests')],
    ['Esc', t('help.esc')],
    ['M', t('help.mute')]
  ];
  openModal(t('help.title'), rows.map(r => `<div class="keyrow"><span>${r[1]}</span><kbd>${r[0]}</kbd></div>`).join('') +
    `<p class="muted" style="margin-top:16px">${t('help.note')}</p>`,
    [{ label: t('help.ok'), cls: 'primary' }]);
}

function openChallengeMenu() {
  const unlocked = !challengeLocked();
  let h = '<div class="grid challenge-grid">';
  for (const c of CHALLENGES) {
    const best = challengeBest(c.id);
    h += `<div class="card challenge-card" data-diff="${c.id === 'speed' ? 'normal' : 'hard'}">
      <div class="card-h"><span class="ico" style="--c:#ffd166">◆</span><b>${t('chal.' + c.id + '.name')}</b><span class="ch-diff">${t(c.id === 'speed' ? 'chal.diffNormal' : 'chal.diffHard')}</span></div>
      <p>${t('chal.' + c.id + '.desc')}</p>
      <div class="cost"><span>${t('chal.rules')}：${t('chal.' + c.id + '.desc')}</span></div>
      <div class="done">${best ? t('chal.bestOnly', { score: best.score }) : t('chal.bestEmpty')}</div>
      ${unlocked ? `<button data-challenge="${c.id}">${t('chal.start')}</button>`
        : `<div class="done" style="color:#ffb3a0">${t('chal.locked')}</div>`}
    </div>`;
  }
  h += '</div>';
  openModal(t('chal.title'), h, [{ label: t('base.close') }]);
  modalBody.querySelectorAll('[data-challenge]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.challenge;
      closeModal();
      if (typeof beginChallenge === 'function') beginChallenge(id);
    };
  });
}

function openSettings() {
  const s = game.settings;
  const row = (label, key, val) => `<div class="settings-row"><label>${label}</label>
    <input class="slider" type="range" min="0" max="100" step="1" value="${val}" data-setting="${key}">
    <output class="settings-value" data-value="${key}">${val}</output></div>`;
  const h = `<div class="settings">
    <div class="settings-group">
      <div class="settings-row"><label>${t('settings.masterMute')}</label><button class="toggle" data-setting="mute" aria-checked="${muted}">${muted ? t('settings.on') : t('settings.off')}</button></div>
      ${row(t('settings.musicVol'), 'music', s.musicVol)}${row(t('settings.sfxVol'), 'sfx', s.sfxVol)}
    </div>
    <div class="settings-group">
      <div class="settings-row"><label>${t('settings.reduceMotion')}</label><button class="toggle" data-setting="reduceMotion" aria-checked="${!!s.reduceMotion}">${s.reduceMotion ? t('settings.on') : t('settings.off')}</button></div>
      <div class="settings-row"><label>${t('settings.colorblind')}</label><button class="toggle" data-setting="colorblind" aria-checked="${!!s.colorblind}">${s.colorblind ? t('settings.on') : t('settings.off')}</button></div>
      <div class="settings-row"><label>${t('settings.fontScale')}</label><button class="toggle" data-setting="fontScale" aria-checked="${s.fontScale === 1.2}">${s.fontScale === 1.2 ? '1.2×' : '1.0×'}</button></div>
      <div class="settings-row"><label>${t('settings.language')}</label><div class="segmented">
        <button class="seg" data-lang="zh-Hant" aria-pressed="${s.lang !== 'en'}">${t('settings.langZh')}</button>
        <button class="seg" data-lang="en" aria-pressed="${s.lang === 'en'}">EN</button>
      </div></div>
      <div class="settings-row"><label>QA</label><button class="ghost qa-export" data-qa-export>${t('qa.export')}</button></div>
    </div>
    <p class="settings-note">${t('settings.note')}</p>
  </div>`;
  openModal(t('settings.title'), h, [{ label: t('base.close') }]);
  modalBody.querySelectorAll('input[data-setting]').forEach(inp => {
    inp.oninput = () => {
      const key = inp.dataset.setting === 'music' ? 'musicVol' : 'sfxVol';
      game.settings[key] = clamp(+inp.value || 0, 0, 100);
      const out = modalBody.querySelector('output[data-value="' + inp.dataset.setting + '"]');
      if (out) out.textContent = game.settings[key];
      applySettings(); saveGame();
    };
  });
  const muteBtn = modalBody.querySelector('[data-setting="mute"]');
  if (muteBtn) muteBtn.onclick = () => {
    muted = !muted; game.muted = muted;
    applyMute();
    muteBtn.setAttribute('aria-checked', String(muted));
    muteBtn.textContent = muted ? t('settings.on') : t('settings.off');
    saveGame();
  };
  const rmBtn = modalBody.querySelector('[data-setting="reduceMotion"]');
  if (rmBtn) rmBtn.onclick = () => {
    game.settings.reduceMotion = !game.settings.reduceMotion;
    applySettings();
    rmBtn.setAttribute('aria-checked', String(!!game.settings.reduceMotion));
    rmBtn.textContent = game.settings.reduceMotion ? t('settings.on') : t('settings.off');
    saveGame();
  };
  modalBody.querySelectorAll('.seg[data-lang]').forEach(seg => {
    seg.onclick = () => {
      const lang = seg.dataset.lang === 'en' ? 'en' : 'zh';
      if (lang === game.settings.lang) return;
      setLang(lang);
    };
  });
  const cbBtn = modalBody.querySelector('[data-setting="colorblind"]');
  if (cbBtn) cbBtn.onclick = () => {
    game.settings.colorblind = !game.settings.colorblind;
    applySettings(); saveGame(true);
    cbBtn.setAttribute('aria-checked', String(!!game.settings.colorblind));
    cbBtn.textContent = game.settings.colorblind ? t('settings.on') : t('settings.off');
  };
  const fsBtn = modalBody.querySelector('[data-setting="fontScale"]');
  if (fsBtn) fsBtn.onclick = () => {
    game.settings.fontScale = game.settings.fontScale === 1.2 ? 1 : 1.2;
    applySettings(); saveGame(true);
    fsBtn.setAttribute('aria-checked', String(game.settings.fontScale === 1.2));
    fsBtn.textContent = game.settings.fontScale === 1.2 ? '1.2×' : '1.0×';
  };
  const exportBtn = modalBody.querySelector('[data-qa-export]');
  if (exportBtn) exportBtn.onclick = () => { initAudio(); exportQA(); };
}

function openPause() {
  if (game.scene !== 'sea' && game.scene !== 'moon' && game.scene !== 'launch' && game.scene !== 'dock') return;
  const btns = [
    { label: t('pause.resume'), cls: 'primary' },
    { label: muted ? t('pause.soundOff') : t('pause.soundOn'), keepOpen: true,
      onClick: () => { muted = !muted; game.muted = muted; applyMute(); saveGame(); openPause(); } },
    { label: t('pause.settings'), onClick: () => setTimeout(openSettings, 10) },
    { label: t('pause.help'), onClick: () => setTimeout(openHelp, 10) },
    { label: t('qa.export'), keepOpen: true, onClick: () => exportQA() }
  ];
  if (game.cheat) btns.push({ label: t('pause.cheat'), onClick: () => setTimeout(openCheat, 10) });
  btns.push({ label: t('pause.restart'), cls: 'danger', onClick: () => { game.cheat = false; resetGame(); location.reload(); } });
  openModal(t('pause.title'), '<p class="muted">' + t('pause.body') + '</p>', btns);
}

/* ---------- 任務結算 ---------- */
let questT = 0;
function updateQuests(dt) {
  checkAch();   /* A 指定：放在 scene guard 之前，ending 才會結算通關成就 */
  updateTutorial(dt);
  updateChallenge(dt);
  if (game.scene !== 'sea' && game.scene !== 'moon' && game.scene !== 'launch') return;
  if (game.paused) return;   /* AUDIT P2-3：暫停中不結算任務 */
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
      ? ' (+' + Object.keys(q.reward).map(k => resName(k) + ' ' + q.reward[k]).join(' · ') + ')' : '';
    toast(t('toast.questDone', { text: questText(q), rewards: rw }), 'gold');
    saveGame();
    refreshHud();
  }
}

/* ---------- 場景轉場（防重入：進行中回傳 false，不執行 fn） ---------- */
let transitioning = false;
function transition(fn) {
  if (transitioning) return false;
  transitioning = true;
  const f = $('fade');
  f.classList.add('on');
  setTimeout(() => {
    try { if (fn) fn(); }
    finally {
      setTimeout(() => { f.classList.remove('on'); transitioning = false; }, 120);
    }
  }, 320);
  return true;
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
  $('intro-text').innerHTML = `<div class="line">${t('intro.' + (introIdx + 1))}</div>`;
  $('intro-step').textContent = (introIdx + 1) + ' / ' + INTRO_LINES.length;
  $('intro-next').textContent = introIdx >= INTRO_LINES.length - 1 ? t('ui.sail') : t('ui.introNext');
}
function nextIntro() {
  if (introIdx < INTRO_LINES.length - 1) { introIdx++; renderIntro(); }
  else { $('intro').hidden = true; beginGame(); }
}

/* ---------- 結局 ---------- */
function showEnding(win) {
  if (game.challenge && !game.challenge.ended) { challengeEnd(win); return; }
  const ch = game.challenge;
  if (win) game.stats.won = true;
  checkAch();   /* 「星際復仇」等通關成就在結算前解鎖，結算頁才數得到 */
  if (win && !ch) saveGame();
  if (typeof MUSIC !== 'undefined') MUSIC.setScene('ending');
  const oldNg = $('end-ng'); if (oldNg) oldNg.remove();
  const oldHome = $('end-home'); if (oldHome) oldHome.remove();
  const oldBadge = document.querySelector('#ending .ng-badge'); if (oldBadge) oldBadge.remove();
  const endEl = $('ending');
  endEl.dataset.mode = ch ? 'challenge' : '';
  endEl.dataset.result = ch ? ((ch.result && ch.result.win) ? 'win' : 'lose') : '';
  endEl.hidden = false;
  if (ch) {
    const c = challengeDef(ch.id) || { name: ch.id };
    const r = ch.result || { win: !!win, score: 0, best: 0, isNew: false };
    $('end-kicker').textContent = r.win ? t('chal.winTitle') : t('chal.failTitle', { name: t('chal.' + ch.id + '.name') });
    $('end-title').textContent = t('chal.' + ch.id + '.name');
    $('end-text').innerHTML = `${t('chal.' + ch.id + '.desc')}<br>${r.isNew ? t('chal.newRecord', { score: r.score }) : t('chal.best', { best: r.best, score: r.score })}`;
    $('end-stats').innerHTML = `
      <div>${t('end.statTime')}<b>${fmtTime(game.stats.time)}</b></div>
      <div>${t('end.statKills')}<b>${game.stats.kills}</b></div>
      <div>${t('end.statGear')}<b>${Object.values(game.up).reduce((a, b) => a + b, 0)}</b></div>
      <div>${t('chal.score', { score: r.score })}<b>${t('chal.bestOnly', { score: r.best })}</b></div>`;
    $('end-again').textContent = t('chal.retry');
    $('end-again').onclick = () => { $('ending').hidden = true; if (typeof beginChallenge === 'function') beginChallenge(ch.id); };
    const home = document.createElement('button');
    home.id = 'end-home'; home.className = 'ghost';
    home.textContent = t('chal.back');
    home.onclick = () => { game.challenge = null; resetGame(); location.reload(); };
    $('ending').querySelector('.ending-inner').insertBefore(home, $('end-again'));
  } else {
    $('end-kicker').textContent = win ? t('end.winKicker') : t('end.loseKicker');
    $('end-title').textContent = win ? t('end.winTitle') : t('end.loseTitle');
    if (game.ng > 0) {
      const badge = document.createElement('div');
      badge.className = 'ng-badge end-ng';
      badge.textContent = t('ng.label', { n: game.ng });
      $('ending').querySelector('.ending-inner').insertBefore(badge, $('end-title'));
    }
    $('end-text').innerHTML = win ? t('end.winText') : t('end.loseText');
    const ngLine = game.ng > 0 ? `<div>${t('ng.enemyBuff', { hp: 25 * game.ng, dmg: 10 * game.ng })}</div>` : '';
    $('end-stats').innerHTML = `
      <div>${t('end.statTime')}<b>${fmtTime(game.stats.time)}</b></div>
      <div>${t('end.statTrash')}<b>${game.stats.collected}</b></div>
      <div>${t('end.statBuild')}<b>${game.base.structures.length}</b></div>
      <div>${t('end.statKills')}<b>${game.stats.kills}</b></div>
      <div>${t('end.statGear')}<b>${Object.values(game.up).reduce((a, b) => a + b, 0)}</b></div>
      <div>${t('end.statAch', { n: game.ach.length, total: ACH.length, add: Math.max(0, game.ach.length - achBaseline) })}</div>
      ${ngLine}`;
    $('end-again').textContent = t('ui.endAgain');
    $('end-again').onclick = () => { resetGame(); location.reload(); };
    if (win && game.ng < NG_MAX) {
      const b = document.createElement('button');
      b.id = 'end-ng'; b.className = 'primary';
      b.textContent = t('ng.start', { n: game.ng + 1 });
      b.onclick = () => { if (typeof startNGPlus === 'function') startNGPlus(); };
      $('ending').querySelector('.ending-inner').insertBefore(b, $('end-again'));
    }
  }
  game.paused = true;
  game.scene = 'ending';
  $('hud').style.display = 'none';
  $('hint').style.display = 'none';
  sfx(win ? 'win' : 'lose');
}
