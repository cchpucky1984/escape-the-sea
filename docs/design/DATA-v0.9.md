# 逃出大海 · v0.9 平衡定案與 meta 施工資料（DATA v0.9）

> 作者 A（PM／主企劃）· 2026-11-05 · 對應 `PRODUCT-v1.0` 支柱 A／B／E；前置 `DIFFICULTY-v0.8.md`、`DATA-v0.6.md` §3/§4、`CONTENT-v0.5.md` §3。
> 只寫 `docs/design/`；不跑 git、不改 `js/`。數值現況以 2026-11-05 00:35 的 `js/`（v0.8 `ad9627c`）為準。
> 現況快照：`BOSS_CFG`（`space.js:24-32`，`hp:900`、四招齊全）、`MIRROR_CFG`（`:33-42`）、`LC`（`:14-21`）、`game.ng` 欄位已存在但**無任何倍率套用**、`settings` 只有 `musicVol/sfxVol/reduceMotion/lang`、`CHALLENGES` 尚未存在。
## 1. 平衡定案（核心 1800；TTK 目標改寫）
- **核心 HP `900 → 1800`**（`space.js:25` 的 `BOSS_CFG.hp`）。四階段血線不變（100–75／75–50／50–25／<25%），轉階無敵 1.5s 不變。
- **目標改寫**：核心 TTK **70–100 秒**；含波次＋核心＋逃生＋鏡像的整場 **5–7 分鐘**（以滿裝、正常走位計，不含死亡重試）。
- TTK 驗算（滿裝 `dmg 5 / 0.23s = 21.7 dps`；核心 50% 後同盟軍 4 架 ×2/0.55s ≈ 14.5 dps）：
  | 段 | HP | DPS | 純射擊 | 實際（走位 miss 15%） |
  |---|---|---|---|---|
  | P1–P2 | 900 | 21.7 | 41s | 48s |
  | P3–P4 | 900 | 36.2 | 25s | 29s |
  | 轉階 | — | — | 4.5s | 4.5s |
  | **合計** | 1800 | — | **70.5s** | **≈82s** ✓ |
  - `gl3`（15 dps，50% 後 29.5）：純 60+30+4.5 ≈ 95s、實戰 **110–125s**——可以接受（未滿級本來就該更久），不另調。
- **檢查既有 TTK（Lead 量測值）**：巨獸 **59s** 在 40–70 ✓、鏡像 **52s** 在 40–70 ✓ → **兩者都不改**。核心改 1800 不影響這兩段（各自獨立 HP 池）。
- 衛星光束（90%→60%、10% 終結）與同盟軍 50% 觸發點**不動**；在 1800 HP 下光束 1 打掉 540 點＝整場 30%，仍是「超級武器」該有的份量。
- 整場 5–7 分鐘拆解：波次 1（10 隻）≈40s＋波次 2（24 隻）≈75s＋核心 ≈85s＋逃生倒數/鏡像 ≈95s＋轉場 ≈20s = **≈315s（5.2 分）**；有 1 次死亡重試 ≈6.5 分。
## 2. 挑戰模式 3：可施工資料（`CHALLENGES`，貼 `core.js` 的 `ACH` 之後）
```js
/* 通關一次解鎖。選單：標題 →「挑戰模式」（3 卡片）；模式中禁存檔、禁作弊、不可中途改難度。
   最佳分寫 localStorage[storageKey]（獨立 key，不進主存檔）。 */
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
```
- **執行點**（全部可用現有狀態判定，不需新系統）：
  - 開始：`game.challenge = { id, tLeft, startAt }`；標題選單按鈕 → `beginChallenge(id)` → `resetGame()` → 套 `rules` → `beginGame()`。
  - `iron`：`seaDeath()` 內 `if (game.challenge && game.challenge.id==='iron') challengeEnd(false)`（不重生、不 `respawnAtBase`）；母船/升空失敗同樣 `challengeEnd(false)`。
  - `speed`：`updateQuests` 或 HUD tick `game.challenge.tLeft = rules.timeLimit - game.stats.time`；≤0 → `challengeEnd(false)`；HUD 右上顯示 `mm:ss`。
  - `bare`：`addStructure('tower')` 回 false＋toast；`openCraft` 的四件裝備按鈕 disabled＋toast；`grantRandomMod()` 改 `addRes('alloy',3)`；`calcStats()` 把 `fin/tank/suit/magnet` 視為 0。
  - 成功：`stats.won` 成立時 `challengeEnd(true)` → 計算 `score(game.stats)`。
- **流程／畫面**：`challengeEnd(win)` → 結算卡（標題「挑戰失敗：一命深海」或「挑戰完成」、時間／擊殺／碎片／分數／最佳分）；按鈕「再試一次」「回標題」。最佳分顯示文案：
  - zh：`最佳分 {best}　·　本次 {score}` / `新紀錄！{score}`
  - en：`Best {best} · This run {score}` / `New record! {score}`
- **解鎖**：`game.stats.won === true`；未解鎖時卡片顯示「先通關一次」。
- **i18n**（貼 `docs/i18n/STRINGS.js`）；`chal.title`、`chal.locked`、`chal.retry`、`chal.back`、`chal.failTitle`、`chal.winTitle`、`chal.best`、`chal.newRecord`、`chal.iron.name/desc`、`chal.speed.name/desc`、`chal.bare.name/desc`（zh/en 見上方 name/nameEn 與 desc/descEn）。
## 3. NG+：可施工資料（`game.ng` 已存在於存檔，缺倍率與流程）
```js
/* 貼 core.js（CHALLENGES 之後）。結局畫面用；NG_MAX 防溢出。 */
const NG_MUL = { enemyHp: 0.25, enemyDmg: 0.10, aggr: 0.05, income: 0.15, leviHp: 0.30, bossHp: 0.20, mirrorHp: 0.20 };
const NG_MAX = 9;
function ngMul(k) { return 1 + (NG_MUL[k] || 0) * (game.ng || 0); }
```
- **套用點**（每一處都是一行乘算，不新增系統）：
  | 位置 | 套用 | 效果（ng=1） |
  |---|---|---|
  | `sea.js` `spawnHazard()` 的 `hp` | `× ngMul('enemyHp')` | 鯊魚 3→3.75（四捨五入 4） |
  | `sea.js` `spawnHazard()` 的 `dmgMul` | `× ngMul('enemyDmg')` | 傷害 ×1.10 |
  | `sea.js` `spawnHazard()` 的 `aggr` | `× ngMul('aggr')` | 移速/射速 ×1.05 |
  | `sea.js` `baseTick()` 每 5s 產出 | `× ngMul('income')` | 金屬 3→3.45（顯示取整） |
  | `leviathan.js` `MAX_HP` 生成時 | `× ngMul('leviHp')` | 240→312 |
  | `space.js` `BOSS_CFG.hp` 生成時 | `× ngMul('bossHp')` | 1800→2160 |
  | `space.js` `MIRROR_CFG` 的 `hpBase/hpGear/hpMod` | `× ngMul('mirrorHp')` | 滿裝 1520→1824 |
- **流程**：`showEnding(true)` 的結算頁多一顆按鈕「進入 NG+{n+1}」→ `startNGPlus()`：`game.ng = Math.min(NG_MAX, game.ng + 1)` → `resetGame({ keepMeta: true })`（保留 `game.ach`、挑戰最佳分、`game.ng`、`settings`）× `game.seed` 重抽 → `beginGame()`。
- **顯示**：標題畫面版本字旁 `NG+{n}`；結算頁一行「本輪難度：敵人 HP +{25n}%」；母船進場 toast 加註 `NG+{n}`。
- **存檔相容**：`game.ng` 已在 `saveGame/loadGame`（`core.js:718,871,919`）；`loadGame` 對舊檔 default `0`、`int(0,NG_MAX)`；`ach` 保留不動；`resetGame` 要接受 `keepMeta` 參數（預設 false，不影響既有「重新開始」）。
- **平衡**：NG+3 起敵人 HP ×1.75、BOSS 2160×1.6≈3456；若 `_dev/balance.mjs` 量到 NG+1 通關 <60 分或 >180 分，先調 `bossHp` 係數（0.20→0.15/0.25），不要動 `enemyHp`。
## 4. 可及性規格（設定面板新增 3 項）
### 4.1 reduce motion（影響範圍；`core.js:164` 已切 `body.reduce-motion`）
- **FX（D）**：`FX.shake(px,ms)` 振幅 ×0；`FX.hitstop(ms)` 直接 0；`FX.flash(color,ms)` alpha 上限 0.10、時長 ≤80ms；`FX.slowmo` 停用。
- **場景震動**：`sea.shake`／`launch.shake`／`moon.shake`／核心轉階震動一律乘 0（只關位移，不關特效本身）。
- **粒子**：`FX` part 上限 900 → 300（`spawn` 內 `if (reduceMotion && livePart > 300) return;`），避免畫面變死。
- **CSS（C）**：`body.reduce-motion *` 已關 animation/transition（`style.css:587-590`）；本輪補齊 `#dockcue` 箭頭、event banner、boss warning 殘留動畫（`:937-940` 已有一部分）。
- 驗收：切換後 `body.classList.contains('reduce-motion')`、`FX.stats().shakeAmp===0`、相鄰兩幀截圖位移 ≤2px。
### 4.2 色盲輔助（不靠顏色辨識；`settings.colorblind` → `body.cb-safe`）
- **原則**：每個「用顏色區分」的資訊補**形狀或文字**，不是換色。
- 敵人：shark＝三角鰭、drone＝菱形＋光環、jelly＝波浪傘（輪廓本來就不同）；近距離 <420 在頭頂加 1 個字母 `S／D／J`。
- 子彈：fast＝短線、slow＝圓球、homing＝菱形＋尾焰、laser＝線＋前搖細線（形狀已不同，補「粗細＋預告線」即可）。
- 事件／雷達：標記加形狀（垃圾潮＝圓、鯊魚群＝三角、守衛甦醒＝星形）；HUD 事件膠囊前加 icon。
- 成就分類已用 `✓ / ? / ◆ / ★ / ✦`（`core.js:1568`），保留。
- 驗收：`cb-safe` 開啟後，HUD／雷達出現形狀標記；灰階截圖仍能分辨 shark／drone／jelly（人工 1 次）。
### 4.3 字級 120%（`settings.fontScale ∈ {1, 1.2}`）
- **最終做法（class 策略，取代原 `--fs`）**：`applySettings()` 切 `body.text-lg / body.font-large`；CSS 用 `html:has(body.text-lg){font-size:120%}`＋各元素覆寫（`style.css:1081-1098`）。實測 `html` computed = 19.2px。
- Canvas 內文字（boss 血條／傷害數字）在 draw 時乘 `fontScale`（D，仍未做）。
- 驗收：切 1.2 後 `body.text-lg` 存在、`html` computed font-size ×1.2、`document.documentElement.scrollWidth ≤ 1280`。
### 4.4 設定面板順序（新）
靜音 → 音樂 → 音效 → **減少動態** → **色盲輔助** → **字級（100／120）** → 語言。全部寫入 `game.settings` 並存檔；舊檔缺欄位給 `false／false／1`。
### 4.5 實作狀態（B/C，2026-11-05 01:15 複驗完成）
- **已完成（A 實跑 headless 驗過）**：`settings.colorblind/fontScale` 存讀 ✓；`applySettings()` 正確切 `body.colorblind/cb-safe/font-large/text-lg`（`core.js:178-181`），實測 `html` computed font-size **19.2px（＝16×1.2）**；`sea.js:880` 在 `colorblind && 距離<420` 呼叫 `drawHazardTag()`，實測鯊魚／無人機／水母頭頂分別出現 **S／D／J**（截圖 `_shots/A3/02-extra.png`）；C 的 `.cb-safe` 文字標記與 `.text-lg` 規則已在 `style.css:1066-1110`。
- **已完成**：reduce motion 的 `installFxAccessibility()` 清單已含 **四項** `shake／flash／hitstop／slowmo`（`core.js:193`），B 實測 blocked 4 / passed 4。
- **收回的誤判**：`core.js:797` 與 `:1497` 的砲塔守衛**不是死碼**——`addStructure()` 是 API 層防護、`openBase` 那處是付款前擋（避免先扣資源），B 已抽成 `challengeBareBlocks(type)` 共用，兩處保留是刻意設計。
- **驗證陷阱（給 _dev 工具）**：v0.7 的 service worker 會讓 `shot.mjs` 讀到**舊版資產**（我第一次驗證就是被快取騙到，SW 未清除時 `applySettings` 是舊版）。`qa.mjs` 有先 unregister SW 所以不受影響，但 `shot.mjs`／`balance.mjs` 沒有——建議 Lead 把 qa.mjs 的 SW／cache 清除段貼到這兩支工具，否則平衡量測可能量到舊 build。
## 5. v0.9 驗收清單（QA 可腳本量）
1. 核心 HP：`q('BOSS_CFG.hp') === 1800`；`balance.mjs` 量到核心 TTK **70–100 秒**（滿裝）、整場 **5–7 分鐘**。
2. 巨獸 TTK 59s、鏡像 TTK 52s 仍在 40–70（同一份 balance 報告）。
3. `CHALLENGES.length === 3`、id 為 `iron/speed/bare`；`stats.won===false` 時挑戰選單鎖住；`i18nMissing()` 對 `chal.*` 為 0。
4. `iron`：觸發 `seaDeath()` → `challengeEnd(false)`、**不重生**（`respawnAtBase` 未被呼叫）、最佳分不變。
5. `speed`：`game.stats.time = 2701` → `challengeEnd(false)`；HUD 倒數與 `2700 - time` 一致。
6. `bare`：`addStructure('tower')===false`；`openCraft` 四件裝備按鈕 disabled；`grantRandomMod()` 改合金 +3；`calcStats()` 的 `fin/tank/suit/magnet` 視為 0。
7. 最佳分：`localStorage[storageKey]` 為 `{score,time,kills,date}` 且只留最高；模式中按 Esc 不寫主存檔。
8. NG+：`__T.ngMul('enemyHp')===1.25`（`game.ng=1` 時）、`income 1.15`、`leviHp 1.30`、`bossHp 1.20`；`game.ng` 夾 0–9；`__T.startNGPlus()` 後 `game.ach` 保留、`game.ng===1`；存讀檔 round-trip 後 `ng` 不變；`game.challenge` 存在時 `startNGPlus()` 回 false。
9. reduce motion：切換後 `body.classList.contains('reduce-motion')`、`FX.stats().shakeAmp===0`、`hitstop` 不觸發；**`slowmo` 也不作用**（`core.js:193` 清單已含 `slowmo`，B 實測 blocked 4／passed 4）。
10. 色盲：`settings.colorblind===true` 時 `body.classList.contains('cb-safe')`；toast／挑戰卡／狀態出現 `●/★/!/▶/◆/▲/⚠`（CSS）；**canvas 敵人頭頂 `S/D/J`**（`sea.js:880` `drawHazardTag`，<420m 才畫，A 已截圖驗證 `_shots/A3/02-extra.png`）。
11. 字級：`fontScale=1.2` 時 `body.classList.contains('text-lg')`、`html` computed `font-size` = **19.2px（16×1.2）**、`document.documentElement.scrollWidth ≤ 1280`。
12. 回歸：`_dev/qa.mjs` 全綠、`pageErrors=0`、`i18nMissing()` 空；`saveGame/loadGame` 的 `ng/settings/tut/ach` 都在；`__T.challenge`（getter）與 `__T.CHALLENGES` 可讀。
- 工具前置：`shot.mjs`／`balance.mjs` 要先做 `qa.mjs:93` 那段 service worker／cache 清除，否則會量到舊 build。
- 不進快速 gate 的：整場 5–7 分鐘、NG+1 通關時間（`balance.mjs` 長跑，門檻 60–180 分）。
