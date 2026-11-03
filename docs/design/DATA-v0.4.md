# 逃出大海 · v0.4 施工資料（DATA v0.4）

> 作者 A（PM／主企劃）· 2026-11-03 · 對應 `GDD-v0.4.md`（決策）與 Lead 裁決 D1–D4。
> 用法：每一塊都標了「檔案」與「行號區塊」，**直接貼**，不要重排版；行號以 v0.3.0（`main`）為準。
> 本檔只放資料與常數；函式邏輯由擁有者（B／D）補。S0 期間不進 `js/`。
## 0. 通則
- 全域常數都放 `js/core.js`（`index.html:86` 最先載入），`sea.js`／`space.js` 直接引用即可。
- 色票（`#ffc247`／`#a98bff`）如與 C 的 `docs/art/STYLE-v0.4.md` 衝突，以 C 為準、C 改。
- 模組定案：**三種各只能裝 1 個（共 3 槽）**，不會重複堆疊；模組箱全滿時自動換合金 3。
- 存檔：`SAVE_KEY`（`escape-the-sea-v2`）不變，只加欄位；舊檔缺欄位必須能跑（default 見 §3）。
## 1. 建築資料（貼進 `js/core.js` 的 `STRUCTS`，`:135-154`）
貼法：加在 `dock`（`:152-153`）之後、物件結尾 `};`（`:154`）之前。
```js
  bounty:   { name: '賞金終端',   ch: '賞', c: '#ffc247', max: 1, tag: '經濟', tagCls: '',
              desc: '解鎖賞金合約 — 擊殺與打撈都能換合金（按 H）', cost: { metal: 14, plastic: 8 } },
  modtable: { name: '模組工作台', ch: '模', c: '#a98bff', max: 1, tag: '必要', tagCls: '',
              desc: '魚槍可插 3 個模組 — 穿透 · 爆裂 · 電磁', cost: { metal: 34, alloy: 5 }, req: 'rnd' }
```
貼法：`js/core.js:155` 整行換成下面這行（順序只是面板閱讀順序：先研發中心、才解鎖工作台；造價與解鎖判定不看順序，但 `rnd` 放前面比較好懂）。
```js
const STRUCT_KEYS = ['equip', 'rnd', 'modtable', 'dock', 'bounty', 'net', 'recycler', 'botdock', 'tower', 'reverse', 'satellite'];
```
> 造價自動走 `structureCost()` 的 `×1.6ⁿ`（`core.js:263-267`），不用另外寫。
## 2. 遊戲狀態欄位（貼進 `js/core.js` 的 `const game = {...}`，`:213-226`）
貼法：接在 `cheatUp`（`:225`）之後。
```js
  bounty: { active: [], done: 0, rerollT: 0, zoneT: 0 },   /* active:[{id,tier,target,prog,reward}] */
  mods: [],                                               /* 已裝備模組 id，最多 3 個 */
```
貼法：`js/core.js:219` 的 `stats:` 那行，尾端加 `rifts: 0`（`bosses` 已存在，沿用）。
```js
  stats: { collected: 0, kills: 0, time: 0, deaths: 0, launched: false, won: false, botCollected: 0, built: 0, bosses: 0, rifts: 0 },
```
## 3. 存檔相容（`js/core.js`）
`saveGame()` 的欄位清單（`:290-294`）加一行：
```js
      bounty: game.bounty, mods: game.mods,
```
`loadGame()` 在 `cheatUp` 那行（`:320`）之後加兩行（舊檔就是照 default 跑）：
```js
    if (s.bounty && Array.isArray(s.bounty.active)) game.bounty = s.bounty;
    game.mods = Array.isArray(s.mods) ? s.mods.filter(id => MODS.some(m => m.id === id)).slice(0, 3) : [];
```
`resetGame()` 在 `game.cheatUp = ...`（`:352`）之後加兩行：
```js
  game.bounty = { active: [], done: 0, rerollT: 0, zoneT: 0 };
  game.mods = [];
```
## 4. 任務追加（貼進 `js/core.js` 的 `QUESTS`，`:207` 的 `];` 之前）
```js
  { id: 'bounty', text: '完成第一張賞金合約', sub: '按 H 打開賞金終端 — 擊殺與打撈都能換合金',
    prog: () => Math.min(1, game.bounty.done) + ' / 1', done: () => game.bounty.done >= 1,
    reward: { metal: 10, alloy: 2 } },
  { id: 'leviathan', text: '擊敗第一隻深海巨獸', sub: '海域四角，雷達上是紫色漩渦',
    prog: () => (game.stats.bosses || 0) + ' / 1', done: () => (game.stats.bosses || 0) >= 1,
    reward: { alloy: 4 } },
  { id: 'mod', text: '把第一個模組裝上魚槍', sub: '按 C → 魚槍模組，三個槽',
    prog: () => game.mods.length + ' / 1', done: () => game.mods.length >= 1,
    reward: { metal: 12 } },
  { id: 'rift', text: '在裂縫關閉前打爆它的核心', sub: '每 3 分鐘開一次，紫色漩渦',
    prog: () => (game.stats.rifts || 0) + ' / 1', done: () => (game.stats.rifts || 0) >= 1,
    reward: { alloy: 5 } },
```
> `updateQuests`（`core.js:765-779`）會自動接走，不用改。HUD 進度會變 `x / 15`。
## 5. 賞金合約常數（貼在 `js/core.js` 的 `UPG` 之後、`STRUCTS` 之前，`:132-134` 之間）
```js
const BOUNTY = {
  slots: 3,               /* 同時存在的合約數 */
  refill: 6,              /* 完成後幾秒補一張 */
  reroll: { metal: 15 },  /* 花錢換掉一張 */
  tierKills: [40, 120],   /* kills <40 → T1；<120 → T2；其餘 T3 */
  patrolZone: 2,          /* 巡弋：seaZone(d).id >= 2（深海／遠洋） */
  pool: [
    { id: 'cull',    w: 3, text: '清剿：鯊魚',
      target: [6, 10, 16],    reward: [{ alloy: 2, metal: 15 }, { alloy: 4, metal: 30 }, { alloy: 7, metal: 50 }] },
    { id: 'drone',   w: 3, text: '拆解：外星無人機',
      target: [4, 7, 12],     reward: [{ alloy: 3 }, { alloy: 5 }, { alloy: 9 }] },
    { id: 'salvage', w: 2, text: '打撈：帶回塑膠',
      target: [10, 18, 30],   reward: [{ wood: 10, alloy: 1 }, { wood: 20, alloy: 2 }, { wood: 35, alloy: 4 }] },
    { id: 'patrol',  w: 2, text: '巡弋：待在深海或更遠',
      target: [60, 100, 150], reward: [{ alloy: 3 }, { alloy: 5 }, { alloy: 8 }] },
    { id: 'decap',   w: 1, minTier: 2, text: '獵首：擊敗一隻深海巨獸',
      target: [1, 1, 1],      reward: [{ alloy: 8, modBox: 1 }, { alloy: 8, modBox: 1 }, { alloy: 8, modBox: 1 }] }
  ]
};
/* 發獎：modBox 不是資源（addRes 對未知 key 直接 return，core.js:356），要特判 */
function grantBountyReward(rw) {
  for (const k in rw) if (k !== 'modBox') addRes(k, rw[k]);
  if (rw.modBox) grantRandomMod();
}
/* 額外規則（GDD §3.2）：drone 合約 T3 完成時 8% 再給一個模組箱 → 在呼叫端加 if (tier === 3 && Math.random() < 0.08) grantRandomMod(); */
```
| id | 文案 | T1 | T2 | T3 | 獎勵 T1 / T2 / T3 |
|---|---|---|---|---|---|
| `cull` | 清剿：鯊魚 | 6 | 10 | 16 | 合金2+金屬15 / 合金4+金屬30 / 合金7+金屬50 |
| `drone` | 拆解：外星無人機 | 4 | 7 | 12 | 合金3 / 合金5 / 合金9 |
| `salvage` | 打撈：帶回塑膠 | 10 | 18 | 30 | 木10+合金1 / 木20+合金2 / 木35+合金4 |
| `patrol` | 巡弋：待在深海或更遠 | 60s | 100s | 150s | 合金3 / 合金5 / 合金8 |
| `decap` | 獵首：擊敗一隻深海巨獸（T2 起才出） | 1 | 1 | 1 | 合金8+模組箱 / 同上 / 同上 |
## 6. 模組常數（貼在 §5 的 `BOUNTY` 之後，同一個區塊）
```js
const MODS = [
  { id: 'pierce', name: '穿透模組', ch: '穿', c: '#9fe8ff', desc: '子彈穿過目標 — 最多 3 個，傷害遞減',
    maxHits: 3, falloff: [1, 0.85, 0.72] },
  { id: 'blast',  name: '爆裂模組', ch: '爆', c: '#ffb36b', desc: '命中炸開 — 周圍敵人吃 55% 傷害',
    radius: 56, ratio: 0.55, selfMul: 0.85 },
  { id: 'emp',    name: '電磁模組', ch: '磁', c: '#c9a6ff', desc: '18% 機率讓目標停擺 1.2 秒',
    chance: 0.18, stopT: 1.2 }
];
function hasMod(id) { return game.mods.indexOf(id) >= 0; }
function modOf(id) { return MODS.find(m => m.id === id) || null; }
function grantRandomMod() {   /* 三種各一個；都拿過就換合金 3 */
  const left = MODS.filter(m => !hasMod(m.id));
  if (!left.length) { addRes('alloy', 3); return null; }
  const m = pick(left);
  game.mods.push(m.id);
  toast('取得模組：' + m.name);
  return m.id;
}
```
## 7. 母船決戰常數（貼在 `js/core.js` 的 `RESMETA` 之後，`:120` 之後）
```js
const MOON_HP_BASE = 100;       /* 艙壓基礎值（取代 maxhp 3–7，space.js:823） */
const MOON_HP_SUIT = 12;        /* 每級潛水衣 +12 */
const MOON_HP_SHIELD = 25;      /* 每級火箭護盾 +25 */
const MOON_ARMOR_SUIT = 0.04;   /* 每級潛水衣減傷 4%（armor 上限 0.16） */
const MOON_INV = 1.1;           /* 受擊無敵秒數（原 0.75，space.js:873） */
const MOON_GUN_MULT = [0, 0, 0, 0.35, 1.0];  /* 魚槍 Lv0..4 傷害係數（原 <3→0、3→0.1，space.js:908） */
const MOON_DMG = {              /* 原值見 GDD §3.4 對照表 */
  gruntTouch: 6, shooterBullet: 5, shooterTouch: 5,
  coreRing: 4, coreAim: 5, coreTouch: 8
};
const MOON_SUPPLY = { perWave: 2, heal: 30, coreEvery: 20 };
```
## 8. `calcStats()` 改動（`js/core.js:238-253`）
把 `:249` 的 `armor: 0,` 換成下面兩行（`u`／`lv` 已在函式內）：
```js
    armor: Math.min(0.16, MOON_ARMOR_SUIT * lv('suit')),
    moonHp: MOON_HP_BASE + MOON_HP_SUIT * lv('suit') + MOON_HP_SHIELD * (u.shield || 0),
```
> `hurtMoon` 的 `(1 - S.armor * 0.6)`（`space.js:872`）從此才真正生效。海面的 `hurtPlayer`（`sea.js:127`）**不套 armor**，避免雙重減傷。
## 9. `js/space.js` 套用對照（D 改，左邊是現況行號）
```text
:823   hp: S.maxhp, maxhp: S.maxhp        →  hp: S.moonHp, maxhp: S.moonHp
:873   P.inv = 0.75;                      →  P.inv = MOON_INV;
:908   gl2 < 3 ? 0 : (gl2 >= 4 ? 1 : 0.1) →  MOON_GUN_MULT[Math.min(4, gl2)]
:1012  hurtMoon(9)                        →  hurtMoon(MOON_DMG.gruntTouch)
:1021  dmg: 8 (shooter 子彈)              →  dmg: MOON_DMG.shooterBullet
:1024  hurtMoon(8)                        →  hurtMoon(MOON_DMG.shooterTouch)
:1045  dmg: 7 (核心環形彈)                →  dmg: MOON_DMG.coreRing
:1049  dmg: 8 (核心瞄準彈)                →  dmg: MOON_DMG.coreAim
:1059  hurtMoon(13)                       →  hurtMoon(MOON_DMG.coreTouch)
:872   P.hp -= n * (1 - S.armor * 0.6);   →  不動（armor 由 §8 接上）
```
補給艙：`moon` 物件（`:802-808`）加 `supplies: []`、`initMoon`（`:824`）清空；`nextWave()`（`:850`）末尾掉 `MOON_SUPPLY.perWave` 個、核心階段（`:1031` 區塊）每 `coreEvery` 秒 1 個。
```js
/* updateMoon 內（放在 ebullets 迴圈旁）： */
for (const s of moon.supplies) {
  s.t += dt;
  if (Math.hypot(P.x - s.x, P.y - s.y) < 26) { s.dead = true; P.hp = Math.min(P.maxhp, P.hp + MOON_SUPPLY.heal); sfx('air'); }
}
moon.supplies = moon.supplies.filter(s => !s.dead);
```
> HUD：母船目前顯示的 3 顆愛心是 `refreshHud()` 讀 `sea.player` 的結果；v0.4 改成艙壓條並改讀 `moon.p`（C 決定樣式，沿用氧氣條元件）。
## 10. `js/sea.js` 套用點（B 改）
```js
/* BUG-1（Lead 實測）：:493 / :506 / :511 全部吃 dm（:487 已宣告 h.dmgMul） */
if (d < 30) hurtPlayer(Math.max(1, Math.round(2 * dm)));   /* 鯊魚 */
if (d < 42) hurtPlayer(Math.max(1, Math.round(1 * dm)));   /* 無人機 */
if (d < 34) hurtPlayer(Math.max(1, Math.round(1 * dm)));   /* 水母 */
/* 守衛（:518-540 的迴圈沒有 dm，自己算）：`const bz = ...` 放在 :524 之前（bd 已算好） */
const bz = seaZone(Math.hypot(b.x, b.y));
if (bd < b.r + 20) hurtPlayer(Math.max(1, Math.round(2 * (1 + bz.id * 0.14))));
```
判傷（`spawnHazard` 物件，`:102-105`）加 `empT: 0`；hazard 迴圈 `:459`（`h.flee`）之後加：
```js
    if (h.empT > 0) { h.empT -= dt; continue; }   /* 電磁停擺 */
```
玩家子彈命中（`:547-568`）：把 `break`（`:564`）改成 pierce 迴圈——`b.hits = (b.hits || 0)`、傷害乘 `falloff[b.hits]`（pierce）與 `selfMul`（blast）、`b.hits >= maxHits` 才 `b.alive = false`；第 1 次命中才觸發 blast 半徑傷害（不再觸發第 2、3 次）；命中後 `if (emp && Math.random() < emp.chance) h.empT = emp.stopT`。
## 11. QA 鉤子（`js/main.js` 的 `window.__T`，`:306` 之前）
```js
  BOUNTY, MODS,
  giveMod(id) { if (!hasMod(id)) game.mods.push(id); refreshHud(); return game.mods; },
```
## 12. 驗收指令（S1 拿著跑，全部不碰 git）
```text
1) 舊存檔：載入後 __T.game.bounty 存在、__T.game.mods 是陣列，console 無 error。
2) 母船艙壓：__T.initMoon(); __T.moon.p.maxhp === 100（素裝）；__T.game.up.suit=4 再 initMoon → 148。
3) 容錯：__T.moon.p.inv = 0; 連續 hurtMoon(6) ×16 仍存活（100÷6）。
4) 合約池：BOUNTY.pool.length === 5；T1 不會抽到 decap（minTier 2）。
5) 模組：__T.giveMod('pierce') 後 __T.game.mods.length === 1；重複給不變；三種都給後 grantRandomMod() 進合金。
6) 場景回歸：node _dev/shot.mjs moon 的 pageErrors 必須 none。
```
