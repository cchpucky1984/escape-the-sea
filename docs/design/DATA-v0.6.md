# 逃出大海 · v0.6 施工資料（DATA v0.6）

> 作者 A（PM／主企劃）· 2026-11-04 · 延續 `docs/design/CONTENT-v0.5.md`；對應 PRODUCT 支柱 A／B／D。
> 用法：每節都是**可直接貼進程式的資料塊**；[貼到] 標明檔案與位置。本檔不進 `js/`，只定資料。
> 現況介面（2026-11-04 22:50 實查）：`game.stats` 已有 `collected/kills/time/deaths/launched/won/botCollected/built/bosses/sharkKills/droneKills/jellyKills/plasticCollected/deepSeconds/leviathanKills/rifts`（`core.js:273-283`）；`game.mods`、`game.bounty.done`、`game.tech`、`game.up` 已存在；`game.ach`、`game.ng`、`sea.ev` **尚未存在**（本檔定義）。
> **實作狀態（2026-11-04 23:10 核對 B/D 的落地）**：§1 ACH 24 已落地（`core.js:444` `checkAch()`；呼叫點 `:1489` scene guard 前、`:1549` 結算前；`game.ach`／`game.ng` 有 default 與 migrate 白名單、`ng` 夾 0–9）。§2 EVENTS／RIFT 由 **D 的 `js/events.js`** 實作（`window.SEA_EVENTS`；`sea.js` 只加 reset/update/draw 掛鉤與雷達讀取），欄位對照見 §2 末。§3 CHALLENGES／§4 NG_MUL **本輪未實作**（B 的 task-19 沒要求），資料留 v0.7。
## 0. 要新增的狀態（三處）
[貼到 `core.js`，`const game = {...}`（`:286-301`）內]：`ach: []`、`ng: 0`。
[貼到 `core.js`，`defaultStats()` 之後]：`function defaultAch() { return []; }`（舊檔由 `loadGame` 補 `game.ach = Array.isArray(s.ach) ? s.ach.filter(x => ACH.some(a => a.id === x)) : [];`，不改 `SAVE_VER`）。
[QA 讀表，2026-11-04 23:20 實查]：`__T.ACH`（24 筆，含 `cond`）與 `__T.SEA_EVENTS`（=`window.SEA_EVENTS`，有 `active`／`rift`）已存在；`EVENTS`／`RIFT` 是 `events.js` 的內部資料，**沒有**對外（若要驗 8 事件與權重，見 §6-5 的替代做法）。
- 成就檢查：`checkAch()` 必須放在 `updateQuests(dt)`（`core.js:1180`）**最前面、scene guard 之前**——否則「通關」類成就會在結算頁（`scene='ending'`）永遠不觸發。
## 1. 成就 24 個（`{id,name,desc,type,cond,hidden}`）
[貼到 `js/core.js`，接在 `QUESTS`（`:195-267`）之後]
```js
/* type: progress|challenge|egg；hidden=true 時未解鎖前 J 面板顯示「??? 隱藏成就」 */
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
function checkAch() {
  if (!Array.isArray(game.ach)) game.ach = [];
  for (const a of ACH) {
    if (game.ach.indexOf(a.id) >= 0) continue;
    if (a.type === 'challenge' && game.cheat) continue;   /* 作弊不給挑戰成就 */
    let ok = false; try { ok = !!a.cond(); } catch (e) { ok = false; }
    if (!ok) continue;
    game.ach.push(a.id); toast(a.toast, 'gold'); sfx('quest'); saveGame(true);
  }
}
```
- J 面板（`openQuests` `core.js:1134`）加第二區：標題「成就 `game.ach.length` / 24」；已解鎖列 `name`＋`desc`，未解鎖 `hidden` 顯示「??? 隱藏成就」、其餘顯示「未達成」。三種 `type` 用 `data-type` 上色（progress 青／challenge 金／egg 紫）。
- 不給數值獎勵（避免破壞平衡）；只在 toast、面板、結算頁出現。
## 2. 海域事件 8 個（`{id,name,weight,dur,mult,add,extra,toast,radarColor,fx}`）
[規格位置＝**`js/events.js`（D 的檔）**；`sea.js` 只加掛鉤。下表是本檔規格版，實際落地欄位見 §2 末「實作對照／缺口」]
```js
/* mult 全部是乘數（1=不變）；add 是加數；extra 是特殊參數（沒用到就省略） */
const EVENTS = [
  { id:'EV01', name:'垃圾潮', weight:23, dur:25, zones:[0,1,2,3],
    mult:{ drop:1.25, spawn:2.2 }, add:{}, extra:{},
    toast:'垃圾潮來了——趁現在撈！', radarColor:'#8ee6a4', fx:'pickupSparkle' },
  { id:'EV02', name:'洋流暴衝', weight:17, dur:18, zones:[0,1,2,3],
    mult:{ current:2.2, spd:1.15, ox:1.2 }, add:{}, extra:{},
    toast:'洋流突然加速！', radarColor:'#6fe3ff', fx:'currentLines' },
  { id:'EV03', name:'鯊魚群', weight:16, dur:12, zones:[1,2,3],
    mult:{}, add:{ hazCap:4 }, extra:{ spawnSharks:3, alloyPerKill:1 },
    toast:'鯊魚群！三隻以上', radarColor:'#ff9aa8', fx:'redPulse' },
  { id:'EV04', name:'外星巡邏', weight:11, dur:15, zones:[2,3],
    mult:{ aggr:1.1 }, add:{ hazCap:3 }, extra:{ spawnDrones:3, eliteHp:1.5, alloyDrop:[2,3] },
    toast:'外星巡邏隊接近', radarColor:'#c9a6ff', fx:'warpIn' },
  { id:'EV06', name:'氧氣外洩', weight:9, dur:20, zones:[0,1,2,3],
    mult:{ ox:2 }, add:{}, extra:{ airRate:1.5 },
    toast:'氧氣管在漏！', radarColor:'#9fe8ff', fx:'leakBubbles' },
  { id:'EV07', name:'補給箱雨', weight:9, dur:8, zones:[0,1,2,3],
    mult:{}, add:{}, extra:{ crateRain:5, crateRing:[280,500] },
    toast:'補給箱從天而降', radarColor:'#ffd166', fx:'crateFall' },
  { id:'EV08', name:'暗流漩渦', weight:8, dur:15, zones:[2,3],
    mult:{}, add:{}, extra:{ vortex:{ r:260, pull:60 }, endReward:{ alloy:2 } },
    toast:'暗流漩渦！不要被捲進去', radarColor:'#b892ff', fx:'vortexRings' },
  { id:'EV09', name:'守衛甦醒', weight:7, dur:30, zones:[3],
    mult:{}, add:{}, extra:{ bossAggro:2400, bossSpdMul:1.7 },
    toast:'深海的東西醒了——牠在找你', radarColor:'#ff7a90', fx:'bossGlow' }
];
const SEA_EV = { firstAt:180, interval:100, cooldown:30, maxPerRun:3, maxActive:1, totalWeight:100 };
```
- 判定：`weight` 總和必須 = 100（23+17+16+11+9+9+8+7）。用累加區間抽；抽到不合海域的事件 → 重擲一次，仍不合就這輪不觸發。
- 排程：`sea.evT` 初始 `firstAt`，之後每 `interval` 秒檢定；`sea.ev` 同時最多 1 個，形狀 `sea.ev = { id, t, dur, mult, add, extra } | null`（t 為已過秒數）、`sea.evCount = {}` 記每局次數；事件結束後冷卻 `cooldown` 秒；每局每個事件最多 `maxPerRun` 次。
- 套用點（B 已熟）：`mult.drop` → `collectPickup()`（`sea.js:213`）的 `amt`；`mult.spawn` → `sea.spawnT = 0.95 / Z.mult / (EV?EV.mult.spawn:1)`（`:514`）；`mult.current` → `currentAt()`（`:109`）回傳值相乘；`mult.aggr` → 生怪/追擊（`:537`）；`mult.ox` → `updateSea` 氧氣消耗；`add.hazCap` → `hazLimit`（`:535`）；`extra` 由事件啟動時一次性處理。
- 顯示：HUD 加一條事件列（`name` ＋ 剩餘秒數，底色 `radarColor`），雷達同色外圈；`fx` 是 `js/fx.js` 的粒子預設名（B 呼叫 `FX.<fx>`，沒有就跳過）。**不能只有 toast**。
### 2.1 深海裂縫（`RIFT`，與事件分開）
[貼在 `EVENTS` 之後]
```js
const RIFT = {
  firstAt:180, interval:180, dur:50, r:260,
  spawnMul:3, dropMul:1.5, hazAdd:2, aggrMul:1.2,
  coreHp:30, coreR:22, coreColor:'#b892ff',
  reward:{ alloy:8 }, modBoxChance:0.4, radarColor:'#b892ff'
};
```
- 生成：距基地 1200–3000 隨機方位；同時最多 1 個；關閉後 180 秒再開（首次 180 秒）。
- 效果（半徑 260 內）：生成間隔 = `0.95 / Z.mult / RIFT.spawnMul`、掉落 ×`RIFT.dropMul`（與海域倍率相乘）、`hazLimit += RIFT.hazAdd`、`aggr × RIFT.aggrMul`。
- 核心：可被魚槍打（`coreHp 30`）；打爆 → `game.stats.rifts++`、合金 8、40% 模組箱（`grantRandomMod()`）、裂縫提前關閉。
- 成就/任務已有欄位：`game.stats.rifts`（`core.js:281`）與任務 `rift`（`core.js:265`）。
### 2.2 實作對照與缺口（D 的 `js/events.js`，2026-11-04 23:10 核對）
- 實際形狀：`EVENTS` 是**物件**（key = id），欄位 `{ name, weight, dur, zone, toast, data }`；`zone` 是**最小海域 id**（本表 `zones` 的最小值；本表 8 個事件的 max 都是 3，因此等價）。`RIFT` 欄位 `{ interval, dur, r, coreHp, alloy, modChance, dropMul, limitBonus, spawnMin, spawnMax }`。
- 欄位對照：`mult.drop→data.dropMul`、`mult.spawn→data.spawnMul`、`mult.current→data.currentMul`、`mult.spd→data.speedMul`、`mult.ox→data.oxMul`、`mult.aggr→data.aggrMul`（EV09 用 2.18＝2400/1100）；`extra.*→data.{sharks,drones,hpMul,alloyDrop,alloyPerKill,crates,radius,vortexR,pull,endAlloy}`。
- **缺口（待 D 補，§6-7 會量到）**：`RIFT` 目前只有 `dropMul 1.5` 與 `limitBonus 2`，缺 `spawnMul:3`（裂縫內垃圾生成 ×3）與 `aggrMul:1.2`（GDD §3.5／CONTENT §4）。補法：`RIFT.spawnMul` 乘進 `sea.spawnT`、`RIFT.aggrMul` 乘進裂縫內生怪 aggr。
  - **2026-11-04 23:55 Lead 更正：此缺口已補。** D 的最終版 `js/events.js`：`RIFT` 常數含 `spawnMul:3`／`aggrMul:1.2`（`:69`），並在裂縫內以 `r.acc += dt*(RIFT.spawnMul-1)/…`（`:471-474`）補生成、`h.aggr *= RIFT.aggrMul`（`:431`、`:488`）套用；`SEA_EVENTS.rift` 也曝露 `spawnMul/dropMul/limitBonus/aggrMul` 供 QA 讀。**此條驗收已可自動化。**
- 視覺：D 目前用 `FX()` 呼叫 flash/sfx，事件沒有 `radarColor` 欄位；§6-6 的「HUD 事件列顏色」若不做，至少要補「事件名＋倒數」在 HUD（A 可接受的降級）。
- QA 鉤子：`__T.SEA_EVENTS.active`／`.rift` 可讀；建議 D 再加 `SEA_EVENTS.defs`（唯讀 `EVENTS` 表）與 `SEA_EVENTS.spawn(id)`（測試注入），這樣 §6-5 就能直接驗 8 事件與權重，不用等自然觸發。
## 3. 挑戰模式 3 個（v0.6 只做資料與規則；選單 v0.7）
[貼到 `js/core.js`，`ACH` 之後]
```js
const CHALLENGES = [
  { id:'iron', name:'一命深海', desc:'不能死。死一次就結束。', storageKey:'escape-the-sea-chal-iron',
    rules:{ noRespawn:true, noCheat:true, noSave:true },
    score:(s) => Math.max(0, 10800 - s.time) + s.kills * 5 + s.tech * 200 + s.leviathanKills * 150 },
  { id:'speed', name:'限時 45', desc:'45 分鐘內攻入母船核心。', storageKey:'escape-the-sea-chal-speed',
    rules:{ timeLimit:2700, noCheat:true, noSave:true },
    score:(s) => Math.max(0, 2700 - s.time) * 2 + Math.floor((game.res.metal + game.res.plastic + game.res.wood) / 10) },
  { id:'bare', name:'赤手空拳', desc:'不能建砲塔、不能裝模組，四件裝備不可升級。', storageKey:'escape-the-sea-chal-bare',
    rules:{ noTower:true, noMods:true, lockUpgrades:['fin','tank','suit','magnet'], noCheat:true, noSave:true },
    score:(s) => s.kills * 10 + s.leviathanKills * 300 + Math.max(0, 7200 - s.time) }
];
```
- 解鎖：`game.stats.won === true` 或 `game.ach.includes('revenge')`。計分函式的 `s` = `game.stats`。
- 實作：`game.challenge = { id, tLeft }`；`calcStats()` 在 `bare` 把四件裝備視為 0；`addStructure('tower')`／`openCraft` 的模組與四件升級按鈕回傳 false 並 toast；`seaDeath()` 在 `iron` 直接結算失敗（不重生）。
- 最佳分：`localStorage[storageKey] = JSON.stringify({ score, time, kills, date })`（只留最高分）；**不寫入主存檔**，模式中 `saveGame` 直接 return。
## 4. NG+ 規則
[貼到 `js/core.js`，`CHALLENGES` 之後]
```js
const NG_MUL = { enemyHp:0.25, enemyDmg:0.10, aggr:0.05, income:0.15, leviHp:0.30, modBoxPerLevi:1 };
const NG_MAX = 9;
function ngMul(k) { return 1 + (NG_MUL[k] || 0) * (game.ng || 0); }
```
- 套用點：`spawnHazard()` 的 `hp` ×`ngMul('enemyHp')`、`h.dmgMul` ×`ngMul('enemyDmg')`；`LEVIATHANS` 的 `MAX_HP` ×`ngMul('leviHp')`、每隻額外掉 `NG_MUL.modBoxPerLevi × game.ng` 個模組箱；`baseTick()` 產出 ×`ngMul('income')`。
- 通關後：結算頁加按鈕「進入下一輪 →」→ `game.ng = Math.min(NG_MAX, game.ng + 1); resetGame(true)`（`resetGame(keepMeta)`：保留 `game.ach`、挑戰最佳分、`game.ng`；重抽 `game.seed`）。
- 顯示：結算頁標題列 `NG+<ng>`；標題畫面版本字旁顯示 `NG+<ng>`；`game.ng>0` 時結算頁多一行「本輪難度：敵人 HP +<25·ng>%」。
- 存檔：`saveGame` 寫 `ng`；`loadGame` 舊檔 default `0`；`NG_MAX` 上限防止溢出。
## 5. 平衡量測規格 `_dev/balance.mjs`（B 實作）
- 輸入：`node _dev/balance.mjs [--runs=3] [--seed=42] [--out=_shots/balance] [--maxMin=150]`；用 CDP 9222（同 `qa.mjs`）開 `http://127.0.0.1:5173/`，跑**自動玩家政策**（同 `PLAYTEST-v0.4a` 的掃蕩邏輯；只用鍵盤/滑鼠，不用 `__T` 改資源）。
- 輸出：每次一檔 `_shots/balance/run-<n>.json`：
```json
{ "seed":42, "won":true, "durationSec":6312, "milestones":{"firstNet":95,"firstReverse":480,"firstBounty":200,"firstLeviathan":1980,"gateReady":4200,"firstLaunch":5600,"win":6312},
  "deaths":3, "bountyDone":14, "leviathanKills":4, "rifts":6, "achievements":["first_dive","cleaner"],
  "ttk":{"leviathanLv3":[52,61,47,58], "moon":176}, "maxIdleSec":54, "consoleErrors":0 }
```
- 門檻（未達 → 退出碼 1，並印差距表）：首輪 `durationSec` 中位數 **5400–9000 秒**；`firstReverse`（第一座逆向工程）**≤480 秒**；3 張 T1 合約（`bountyDone>=3`）**≤120 秒**；巨獸 TTK（Lv3，實戰含走位）**40–70 秒**；`ttk.moon` **150–210 秒**；`maxIdleSec`（沒有可買/可完成動作的最長秒數）**≤60**；`consoleErrors == 0`。
- 校準責任：若「時長 <75 分鐘」或「>150 分鐘」，A 依 `CONTENT-v0.5` §1 的三個旋鈕調整（巨獸 HP、賞金 T2/T3 門檻、逆向工程頻率），不改系統。
## 6. v0.6 驗收清單（QA 可量化）
1. `__T.ACH.length===24`；id 不重複；所有 `cond()` 可執行不拋錯（對 `game` 空狀態逐條 try/catch）。
2. 逐條注入條件 → 解鎖一次、`toast` 一次、`game.ach` 增加；重載後保留且不重複 toast。
3. 6 個 `hidden` 成就未解鎖時 J 面板顯示「??? 隱藏成就」；其餘顯示「未達成」。
4. `game.cheat===true` 時，`type:'challenge'` 的 8 條不得解鎖。
5. `__T.SEA_EVENTS.active` 是陣列、`__T.SEA_EVENTS.rift` 可讀；8 事件與 `weight` 總和 100 用「`events.js` 的 `EVENTS` 表＋§2.2 對照」人工核對（無對外 API；若 D 之後加 `SEA_EVENTS.defs` 就改用它）。事件注入目前沒有 API，改用自然觸發驗 `interval/cooldown/maxPerRun`（首次 180 秒、之後每 100 秒、冷卻 30 秒、同一事件 ≤3 次、同時 ≤1 個）。
6. 每個事件都要有可見表現（粒子/光暈/flash 任一），不能只有 toast；HUD 若沒有 `radarColor` 事件列，至少要有「事件名＋倒數」。
7. 裂縫：`firstAt` 後每 180±5 秒出現（`__T.SEA_EVENTS.rift`）、`dur` 準時關閉、核心打爆 → `stats.rifts+1`、合金 +8；同時最多 1 個；裂縫內生成率 ×3 與 aggr ×1.2 已列 §2.2 缺口。
8. NG+：通關 → 可進下一輪、`ng=1`、敵人 HP ×1.25；`game.ach` 保留；`ng` 到 9 不溢出；存讀檔含 `ng`。
9. `_dev/balance.mjs` 產出 3 份 json，§5 門檻全過或列出差距（Lead 可拿這份當 gate）。
10. 回歸：`_dev/qa.mjs` 全綠、`pageErrors=0`、`_dev/fixtures` 的 v1/v2 存檔可載入且 `ach/ng` 有 default。
