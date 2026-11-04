# 逃出大海 · v0.7 上手引導施工資料（ONBOARD v0.7）

> 作者 A（PM／主企劃）· 2026-11-05 · 對應 `docs/PRODUCT-v1.0.md` 支柱 **B（上手與 UX）**；教學內容延續 `docs/design/CONTENT-v0.5.md` §5。
> 目標：把「第一步該做什麼」從 HUD 的一句提示，升級成 **5 步可量測教學**（`TUTORIAL` 陣列），並讓 B 可以直接貼進 `core.js`。
> 只寫 `docs/design/`；不跑 git、不改 `js/`。
## 0. 現況（2026-11-04 23:55 實查）與缺口
- **已有**：`nextStepText()`（`core.js:1013`）已是一條「網 → 裝備房 → 賞金終端 → 魚槍 Lv2 → 巨獸 → 研發中心 → 零件 → 工坊 → 發射」的提示鏈；`toast.needBase`（`STRINGS.js`）已有「距離基地 X — 游回安全圈再按 B」；`startLaunch()`（`space.js:12`）已實作升空 gate（魚槍 3／潛水衣 2／研發中心），但**只在按鈕按下時 toast，C 面板的按鈕沒有 disabled 也沒列缺口**。
- **缺**：`game.tut` 欄位與教學狀態機；5 步的「觸發／完成／失敗保護」；i18n 未接線（`STRINGS.js` 425 條，等 B 的 `t()`）。
- v0.7 做法：**不新增場景、不加新面板**；教學只是 `nextStepText()` 前面的 5 個步驟，HUD 沿用現有 `#nextstep` chip。
- **實作狀態（2026-11-04 23:37 核對 B 的落地）**：`TUTORIAL` 5 步（`core.js:567-578`，id／`press`／`failT`／`done` 與本檔 §1 一致，step5＝升空 gate）✅；`game.tut={step,t,done,doneIds}`（`:638`）、存檔舊檔 `built>=1||won` 即 done（`:776`/`:833-838`）✅；HUD chip 顯示 `tut.stepN`（`:580-584`、`:1142-1146`）✅；C 面板發射鈕已含 gate（`core.js:1380` `gateGun/gateSuit/gateRnd`）✅；`__T.tut`／`skipTut()`／`i18nMissing()`（`main.js:368-370`）✅、`i18nMissing()` 為 0、pageErrors none。
- **待修（A 實測，會顯示錯指令）**：`STRINGS.js` 的 `tut.step1…step5` 還是 **CONTENT-v0.5 的舊五步**（撿垃圾／回基地／建網＋裝備房／升級＋鯊魚／合約），與 `TUTORIAL` 的（回基地／建網／裝備房＋升級／合約／gate）**整體錯位一格**；`tut.step2` 還留著 `{dist}` 但 `tutHudText()`（`:584`）呼叫 `t('tut.step2')` 沒傳變數 → 玩家會看到字面 `{dist}`。正確字串見 §2，B 直接替換即可。
## 1. `TUTORIAL` 陣列（貼到 `js/core.js`，`ACH` 之後）
```js
/* v0.7 教學：step 1→5 依序；引擎每 0.25 s 檢查 cur.done()，成立就 doneIds.push(id)、step++。
   t = 目前步驟停留秒數（換步歸零）；t > failT 時顯示 fail 文案（每 20 s 再提示一次）。
   hud/fail 同時提供 zh/en；i18n 接線後改用 t('tut.N.hud')。 */
const TUTORIAL = [
  { step: 1, id: 'goHome', press: 'WASD / Shift',
    trig: (t) => t.step === 1 && game.scene === 'sea',
    done: () => Math.hypot(sea.player.x, sea.player.y) < baseRadius(),
    hud:  { zh: '先游回基地 — 跟著箭頭，進到綠色安全圈', en: 'Swim back to base — follow the arrow into the green safe zone' },
    fail: { zh: '按住 Shift 衝刺；氧氣還够，別慌', en: 'Hold Shift to sprint — you have enough oxygen' },
    failT: 30 },
  { step: 2, id: 'buildNet', press: 'B',
    trig: (t) => t.doneIds.indexOf('goHome') >= 0,
    done: () => countType('net') >= 1,
    hud:  { zh: '按 B 建造「自動收集網」— 讓基地自己賺資源', en: 'Press B to build a Collection Net — your base earns for you' },
    fail: { zh: '要在安全圈內才能建造；資源不够時 HUD 會顯示差多少', en: 'You must be inside the safe zone to build; the HUD shows what you lack' },
    failT: 45 },
  { step: 3, id: 'equipRoom', press: 'B → C',
    trig: (t) => t.doneIds.indexOf('buildNet') >= 0,
    done: () => countType('equip') >= 1 && game.up.harpoon >= 1,
    hud:  { zh: '按 B 建「裝備房」，再按 C 把魚槍升到 Lv1', en: 'Build the Gear Room with B, then press C to upgrade the Harpoon to Lv1' },
    fail: { zh: '裝備房：金屬 16·木材 12·塑膠 10；升 Lv1：木材 6·金屬 8', en: 'Gear Room: Metal 16 · Wood 12 · Plastic 10; Lv1 upgrade: Wood 6 · Metal 8' },
    failT: 60 },
  { step: 4, id: 'bounty', press: 'B → H',
    trig: (t) => t.doneIds.indexOf('equipRoom') >= 0,
    done: () => game.bounty.done >= 1,
    hud:  { zh: '按 B 建「賞金終端」（金屬 14·塑膠 8），按 H 接第一張合約', en: 'Build the Bounty Terminal (Metal 14 · Plastic 8) with B, then press H for your first contract' },
    fail: { zh: '120 秒沒完成會自動換成「擊殺 3 隻鯊魚」', en: 'Stuck contracts auto-swap to “kill 3 sharks” after 120 s' },
    failT: 120 },
  { step: 5, id: 'launchGate', press: 'C',
    trig: (t) => t.doneIds.indexOf('bounty') >= 0,
    done: () => game.up.harpoon >= 3 && game.up.suit >= 2 && countType('rnd') >= 1,
    hud:  { zh: '升空門檻：魚槍 Lv3、潛水衣 Lv2、火箭研發中心（按 C 看進度）', en: 'Launch gate: Harpoon Lv3, Suit Lv2, Rocket R&D Center (press C for progress)' },
    fail: { zh: '缺的項目會列在發射鈕下方；打巨獸拿科技碎片可換護盾', en: 'Missing items are listed under the launch button; Leviathans drop tech shards for the shield' },
    failT: 180 }
];
```
- 完成 step 5 → `game.tut.done = true`，HUD 交棒回 `nextStepText()`，**不要**再顯示教學。
- 失敗保護不是阻擋，只是「換一句更明確的話」；玩家永遠可以照自己的順序做（教學不鎖任何功能）。
- 例外：step 2/3/4 在安全圈外按 B／C，沿用現有 `toast.needBase`（`openBase`/`openCraft` 已擋），教學只把 `t` 歸零並顯示 `fail`。
## 2. i18n 字串（貼到 `docs/i18n/STRINGS.js`，E 擁有；key 已照 `tut.*` 分組）
```js
  "tut.1.hud":  ["先游回基地 — 跟著箭頭，進到綠色安全圈", "Swim back to base — follow the arrow into the green safe zone"],
  "tut.1.fail": ["按住 Shift 衝刺；氧氣還够，別慌", "Hold Shift to sprint — you have enough oxygen"],
  "tut.2.hud":  ["按 B 建造「自動收集網」— 讓基地自己賺資源", "Press B to build a Collection Net — your base earns for you"],
  "tut.2.fail": ["要在安全圈內才能建造；資源不够時 HUD 會顯示差多少", "You must be inside the safe zone to build; the HUD shows what you lack"],
  "tut.3.hud":  ["按 B 建「裝備房」，再按 C 把魚槍升到 Lv1", "Build the Gear Room with B, then press C to upgrade the Harpoon to Lv1"],
  "tut.3.fail": ["裝備房：金屬 16·木材 12·塑膠 10；升 Lv1：木材 6·金屬 8", "Gear Room: Metal 16 · Wood 12 · Plastic 10; Lv1 upgrade: Wood 6 · Metal 8"],
  "tut.4.hud":  ["按 B 建「賞金終端」（金屬 14·塑膠 8），按 H 接第一張合約", "Build the Bounty Terminal (Metal 14 · Plastic 8) with B, then press H for your first contract"],
  "tut.4.fail": ["120 秒沒完成會自動換成「擊殺 3 隻鯊魚」", "Stuck contracts auto-swap to “kill 3 sharks” after 120 s"],
  "tut.5.hud":  ["升空門檻：魚槍 Lv3、潛水衣 Lv2、火箭研發中心（按 C 看進度）", "Launch gate: Harpoon Lv3, Suit Lv2, Rocket R&D Center (press C for progress)"],
  "tut.5.fail": ["缺的項目會列在發射鈕下方；打巨獸拿科技碎片可換護盾", "Missing items are listed under the launch button; Leviathans drop tech shards for the shield"],
  "tut.done":   ["教學完成 — 接下來自由探索，J 看任務", "Tutorial complete — explore freely, press J for quests"],
```
## 3. 給 B 的實作清單（教學系統需要的最小改動）
- **狀態**：`game.tut = { step:1, t:0, done:false, doneIds:[] }`；`done` 就是工單說的 **`tutDone`**（若你偏好獨立布林 `game.tutDone` 也可，語意相同；`tutDone === game.tut.done`）。
- **存檔**（`saveGame`/`loadGame`，`core.js:382`/`:481`）：寫入 `tut`；舊檔／既有玩家 **預設跳過**：`if (!s.tut && s.stats && (s.stats.built >= 1 || s.stats.won)) game.tut.done = true;`（避免 v0.6 玩家重看教學）；新檔從 step 1 開始。
- **更新**：`refreshHud()` 內（或 `updateQuests`）每 0.25 s 跑一次：`t += dt` → 若 `cur.done()` 則 `doneIds.push(id); step++; t=0`（一次最多前進 1 步，防跳關）；`t > failT` 時 HUD 顯示 `fail`。
- **HUD 優先序**：`tut.done ? nextStepText() : t('tut.'+step+'.hud')`——沿用現有 `#nextstep` chip（`core.js:991-1010`），**不要新增 DOM**。教學完成時 toast `tut.done` 一次。
- **按鍵**：教學不攔按鍵；只把 `press` 顯示在 chip 的 `<b>下一步</b>` 後面（例：`下一步 · B`）。圈外按 B/C 的舊 toast 不動。
- **升空 gate（另一個 UX 缺口，順手修）**：`openCraft` 的發射鈕（`core.js:1272-1278`）現在 `ready` 只查 4 零件＋工坊；請把 `startLaunch()` 的三條件拉到 `ready` 判斷並在 `.launchbar` 列出缺口（「魚槍 Lv3 2/3 · 潛水衣 Lv2 1/2 · 研發中心 未建」），與 step 5 文案一致。
- **QA 鉤子**：`__T.tut = game.tut;`、`__T.skipTut = () => { game.tut.done = true; };`
- **NG+／挑戰模式**：新一輪開始時 `game.tut.done = true`（教學只跑一次）。
## 4. 首輪 14 個檢查點（`_dev/balance.mjs` 可量測）
規則：每個 CP 記「條件第一次為真的秒數」；**落在窗口內＝PASS**，`start<=t<=end`（容忍 ±5 分鐘），且 CP 必須單調遞增。判定式都能用 `__T` 讀。
| CP | 窗口（分） | 檢查條件（第一次為真） | balance 欄位 |
|---|---|---|---|
| CP01 | 0–10 | `game.tut.done === true`（且 `countType('net')>=1 && countType('equip')>=1`） | `cp.tutDone` |
| CP02 | 10–20 | `countType('recycler')>=1 && countType('reverse')>=1 && game.bounty.done>=1` | `cp.automated` |
| CP03 | 20–30 | `countType('modtable')>=1 && game.up.harpoon>=2` | `cp.modsOnline` |
| CP04 | 30–40 | `game.stats.leviathanKills>=1` | `cp.levi1` |
| CP05 | 40–50 | `game.stats.leviathanKills>=2 && game.up.tank>=2` | `cp.levi2` |
| CP06 | 50–60 | `game.stats.leviathanKills>=3 && game.up.shield>=1` | `cp.levi3` |
| CP07 | 60–70 | `game.tech>=4 && game.up.shield>=2` | `cp.shards4` |
| CP08 | 70–80 | `game.up.harpoon>=3 && countType('rnd')>=1` | `cp.gateWeapon` |
| CP09 | 80–90 | `game.up.harpoon>=4 && game.mods.length>=3` | `cp.maxGun` |
| CP10 | 90–100 | `partCount()>=3 && countType('dock')>=1` | `cp.parts3` |
| CP11 | 100–110 | `game.up.harpoon>=3 && game.up.suit>=2 && countType('rnd')>=1 && partCount()===4 && countType('dock')>=1`（＝可發射） | `cp.gateReady` |
| CP12 | 110–120 | `game.stats.launched===true` | `cp.firstLaunch` |
| CP13 | 120–130 | `game.stats.won===true` | `cp.win` |
| CP14 | 130–140 | `game.ng>=1`（NG+；若 v0.7 未上，改「重玩新檔後 `stats.built>=1`」） | `cp.ngPlus` |
- 輸出：新增 `cp:{tutDone:…,automated:…,win:…}` 到 `_dev/balance/run-<n>.json`（規格見 `DATA-v0.6.md` §5）；若任一 CP 未落在窗口，印「實際 vs 目標」表。
- 通過標準：CP01 必須 **≤10 分**（前 10 分鐘要教完）；CP13 中位數 **120–150 分**；相鄰 CP 間隔不得 >20 分（>20 分＝空窗）。
## 5. 未達標時的三個旋鈕（只調數值，不改系統）
1. **巨獸 HP**：`leviathan.js` 的 `MAX_HP 240 → 300`（延後 CP04–CP07，讓 30–70 分鐘變厚）。
2. **賞金門檻**：`BOUNTY.tierKills [40,120] → [60,180]`（延後 T2/T3 獎勵，讓 10–40 分鐘變慢）。
3. **逆向工程**：`reverse` 上限 3→2、產出 10 s→15 s（合金從 18/分降到 8/分，把 20–40 分鐘的「馬上全滿」拉開）。
- 反向（太快）：若 CP13 <120 分，先看 CP11（可發射）是否早於 100 分——提早就是 gate 沒生效，不是旋鈕問題。
## 6. 驗收（v0.7 教學做完的標準）
1. 新檔進 sea 後 **30 秒內** HUD 出現 step 1 文案（`__T.tut.step===1`）；8 分鐘內 `tut.done===true`（腳本跑）。
2. step 2/3/4 在圈外按 B/C：**面板不開**、`t` 歸零、顯示 `fail` 文案（沿用 `toast.needBase`）。
3. 五步文案 zh／en 都能取到（`I18N_DATA['tut.N.hud'][0..1]` 非空）；切 en 時不顯示中文（i18n 接線後）。
4. `tut.done` 只 toast 一次；重載後不會從 step 1 重播；v0.6 舊檔載入即 `done=true`。
5. 升空 gate：C 面板在未達標時按鈕 disabled 且列出缺口；達標後可按並進母船。
6. `_dev/balance.mjs` 的 CP01…CP14 全部有值，窗口判定輸出 PASS/FAIL。
