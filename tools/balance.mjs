// Balance report from a playtest log (JSONL: one JSON per sample, {t: seconds, ...state}).
// 目前資料來源：`_shots/A2/log.jsonl`（A 的腳本玩家 30 分鐘紀錄）。未來可用 `--log` 換新紀錄。
//
// 用法：
//   node balance.mjs [--log <path>] [--human 2.5] [--json out.json]
// 輸出：milestone 時間表、資源曲線、節奏判定（PASS/FAIL/SKIP），未達門檻時 exit code 1。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : def; };
const LOG = opt('log', 'H:\\DeepSeek\\PROJECT\\PROGRAMM\\_shots\\A2\\log.jsonl');
const HUMAN = Number(opt('human', 2.5));   // 腳本玩家 → 真人 的耗時倍率假設
const JSONOUT = opt('json', 'H:\\DeepSeek\\PROJECT\\PROGRAMM\\_shots\\balance-report.json');

if (!existsSync(LOG)) { console.error('找不到 log：' + LOG); process.exit(2); }

const samples = [];
for (const line of readFileSync(LOG, 'utf8').split(/\r?\n/)) {
  const s = line.trim();
  if (!s) continue;
  let o; try { o = JSON.parse(s); } catch (e) { continue; }
  const st = o.state || o;
  if (typeof o.t !== 'number' || typeof st !== 'object') continue;
  samples.push({ t: o.t, st, note: o.note || '' });
}
samples.sort((a, b) => a.t - b.t);
if (samples.length < 5) { console.error('樣本太少：' + samples.length); process.exit(2); }

const pick = (st, path, def) => path.split('.').reduce((v, k) => (v && typeof v === 'object' ? v[k] : undefined), st) ?? def;
const totalRes = (st) => { const r = st.res || {}; return (r.plastic || 0) + (r.wood || 0) + (r.metal || 0) + (r.alloy || 0); };
const anyUp = (st) => Object.values(st.up || {}).some(v => v > 0);
const partsAll = (st) => { const p = st.parts || {}; return !!(p.hull && p.engine && p.fuel && p.nav); };
const first = (pred) => samples.find(s => pred(s.st, s.t));
const at = (t) => samples.reduce((best, s) => (Math.abs(s.t - t) < Math.abs(best.t - t) ? s : best), samples[0]);

const milestones = {
  firstResource: first(st => totalRes(st) > 0),
  firstUpgrade: first(st => anyUp(st)),
  firstAlloy: first(st => (pick(st, 'res.alloy', 0) > 0)),
  partsFull: first(st => partsAll(st)),
  launch: first(st => st.scene === 'launch'),
  moon: first(st => st.scene === 'moon'),
};
const fmtT = (s) => {
  const sec = Math.round(s);       // 輸入＝秒
  const m = Math.floor(sec / 60), x = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0');
};
const row = (label, s) => ({ label, at: s ? s.t : null, atText: s ? fmtT(s.t) : '—' }); // 樣本 t 單位＝秒

// 腳本 log 的 t 以秒為單位（偶爾有跳躍）；milestone 統一換算成分鐘字串。
const M = [
  row('第一件資源', milestones.firstResource),
  row('第一次升級', milestones.firstUpgrade),
  row('第一塊合金', milestones.firstAlloy),
  row('四零件齊', milestones.partsFull),
  row('升空', milestones.launch),
  row('母船', milestones.moon),
];

// 資源曲線 / 擊殺率
const curve = [];
for (const mins of [5, 10, 15, 20, 25, 30]) {
  const s = at(mins * 60);
  curve.push({ min: mins, gameMin: Math.round(s.t / 60), res: s.st.res || {}, kills: s.st.kills || 0, built: s.st.built || 0, quests: s.st.quests || 0 });
}

// 腳本玩家到「升空」的遊戲分鐘；真人估算＝×HUMAN
const scriptMinToLaunch = milestones.launch ? milestones.launch.t / 60 : null;
const humanMinToLaunch = scriptMinToLaunch ? scriptMinToLaunch * HUMAN : null;
const scriptMinToMoon = milestones.moon ? milestones.moon.t / 60 : null;
const humanMinToMoon = scriptMinToMoon ? scriptMinToMoon * HUMAN : null;

const gates = [];
const addGate = (name, ok, detail, skipped) => gates.push({ name, status: skipped ? 'SKIP' : (ok ? 'PASS' : 'FAIL'), detail });
addGate('首輪時長（真人估算 90–150 分）', humanMinToMoon ? (humanMinToMoon >= 90 && humanMinToMoon <= 150) : false,
  humanMinToMoon ? `腳本 ${scriptMinToMoon.toFixed(1)} 分 ×${HUMAN} = ${humanMinToMoon.toFixed(0)} 分` : '缺 moon 樣本', !milestones.moon);
addGate('第一台逆向工程 ≤8 分', false, '此 log 沒有建築類型明細，無法量測', true);
addGate('3 張 T1 合約 ≤120 秒', false, 'log 在賞金合約實作前錄製，無法量測', true);
addGate('母船核心 TTK 70–100 秒', false, 'TTK 由 _dev/D9 腳本量測（73.9s PASS），此 log 不含戰鬥計時', true);

const fail = gates.filter(g => g.status === 'FAIL').length;
const report = {
  when: new Date().toISOString(),
  log: LOG,
  samples: samples.length,
  timeSpanMin: (samples[samples.length - 1].t / 60).toFixed(1),
  humanFactor: HUMAN,
  milestones: M,
  curve,
  gates,
  verdict: fail === 0 ? 'PASS' : 'NEEDS_WORK',
  note: '腳本玩家（A2 log）為超人類操作；真人倍率可調 --human。注意：此 log 錄於 v0.4（升空 gate 之前），現行版本會更長。',
};
writeFileSync(JSONOUT, JSON.stringify(report, null, 2));

console.log('=== Balance report ===');
console.log('log:', LOG, '| samples:', samples.length, '| span:', report.timeSpanMin, 'min | human×', HUMAN);
console.log('\n[Milestones]');
for (const m of M) console.log(' ', m.label.padEnd(8, '　'), m.atText);
console.log('\n[Resource curve]');
for (const c of curve) console.log(`  t=${c.min}m   塑膠${c.res.plastic ?? 0} 木${c.res.wood ?? 0} 金${c.res.metal ?? 0} 合${c.res.alloy ?? 0}   擊殺${c.kills} 建築${c.built} 任務${c.quests}`);
console.log('\n[Gates]');
for (const g of gates) console.log(`  ${g.status.padEnd(4)} ${g.name} — ${g.detail}`);
console.log('\nverdict:', report.verdict, '| json:', JSONOUT);
process.exit(fail === 0 ? 0 : 1);
