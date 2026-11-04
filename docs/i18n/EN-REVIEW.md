# EN 文案校對包（v0.7 / 給 B 接線與 C 排版用）

> 擁有者：E · 2026-11-04 · 依據 `docs/i18n/STRINGS.js`（425 條，v0.6 快照）
> **後續更新（2026-11-04）**：§2 紅字的 18 處已直接套用至 `docs/i18n/STRINGS.js`（keys 不變、只改 en 值、行號註解保留）；另補 8 處同概念殘留（共 **26 處 en 值變更**、條數仍 425）。語法已用 `node -e "new Function(require('fs').readFileSync('docs/i18n/STRINGS.js','utf8'))"` 驗證通過。
> 註：原清單第 18 項誤寫成 `ach.no_tower.desc`；實際要改的是 `ach.no_mods.desc`（「不裝任何模組」），已按正確 key 套用，**沒有改任何 key 名**。
> 用途：英文版接線前先定「一個概念一種譯法」；接線後用它檢查版面。**本檔不改程式碼**，B 依 §2 改字典值、C 依 §3 調版面。
> 現況：v0.7 英文尚在施工（設定面板的 EN 還是 `soon`）；本檔是上線前必須收斂的清單。

## 1. 三條硬規則

1. **一概念一譯法**：§2 的 Final EN 是唯一合法寫法；同一概念不得出現兩種（例：安全圈只能寫 Safe Zone，不可 `safe area`／`safe circle`）。
2. **大小寫**：作為「系統名／HUD 標籤」用 Title Case（`Safe Zone`、`Cabin Pressure`、`Tech Shard`）；句子內文用 lowercase（`the safe zone`、`a tech shard`）。同一畫面上不要混用。
3. **英文長度**：英文平均比中文長 50–90%——本字典 425 條實測 **2.6× 字元數**（平均 11.3 zh / 28.9 en 字元）。按鈕 ≤ 22 字元、toast ≤ 60、HUD 標籤 ≤ 14；超過就要縮短，不是縮字級。

## 2. 用語一致性表（36 條｜Final EN 為唯一合法寫法）

| # | zh-Hant | Final EN | 目前字典裡的問題（要改的 key） |
|---|---|---|---|
| 1 | 基地 | **Base** | 一致；內文用 `your base`，標籤用 `Base` |
| 2 | 安全圈 | **Safe Zone** | 一致；句內 lowercase `the safe zone`（`base.safeTag` 等） |
| 3 | 平台 | **Platform** | 一致（`hud.baseTiles` 用 Platform） |
| 4 | 資源 | **Resource** | 一致（`res.*` 的畫面用資源圖示＋名稱） |
| 5 | 塑膠／木材／金屬／外星合金 | **Plastic / Wood / Metal / Alien Alloy** | 不可寫 Alloy 之外的簡寫；`Alien Alloy` 不拆行 |
| 6 | 賞金合約 | **Bounty Contract** | `bounty.*` 已用；`Bounty Terminal` 是建築名，不合併 |
| 7 | 賞金終端 | **Bounty Terminal** | 一致（`bounty.needTerminal` 等） |
| 8 | 模組 | **Module** | ⚠️ 目前混用 `Mod`（`mod.*`、`Harpoon Mods`、`Mod box`、`Mod Workbench`）→ 全部改 Module |
| 9 | 模組工作台 | **Module Workbench** | ⚠️ `mod.needTable` 現在是 `Mod Workbench` |
| 10 | 模組箱 | **Module Box** | ⚠️ `mod.emptySlot` 現在是 `mod boxes` |
| 11 | 魚槍 | **Harpoon** | 一致；`Compressed Harpoon` 是裝備全名 |
| 12 | 魚槍模組 | **Harpoon Modules** | ⚠️ `mod.title` 現在是 `Harpoon Mods` |
| 13 | 蛙鞋 | **Fins** | 一致（`Propulsion Fins` 為裝備全名） |
| 14 | 潛水衣 | **Dive Suit** | ⚠️ `craft.inherit` 用 `Suit` → 改 `Dive Suit`（欄位放不下可寫 `Suit`，但只在該處） |
| 15 | 氧氣瓶 | **Oxygen Tank** | 一致（`Titanium Oxygen Tank` 為全名） |
| 16 | 磁力收集器 | **Magnetic Collector** | 一致 |
| 17 | 逆向工程 | **Reverse Engineering** | 一致（`Alien Reverse Engineering`） |
| 18 | 艙壓 | **Cabin Pressure** | 一致；兩處（`space.moonEnter`／`space.cabin`）大小寫要統一成標籤式 |
| 19 | 巨獸 | **Leviathan** | ⚠️ `hint.tech` 寫 `guardians`、`sea.death` 無關；守衛舊稱要換成 Leviathan |
| 20 | 深海裂縫 | **Rift** | ⚠️ `rift.core` 大小寫未統一（`Rift Core`）；`quest.rift.*` 已用 Rift，無舊稱 |
| 21 | 科技碎片 | **Tech Shard** | 一致；HUD 用 `Tech Shards {n}/4` |
| 22 | 反應爐核心 | **Reactor Core** | ⚠️ 目前 `Mothership Core` 與 `reactor core` 混用 → 統一 `Reactor Core`（母船核心＝Reactor Core） |
| 23 | 母船 | **Mothership** | 一致；`Alien Mothership` 只在場景標題用 |
| 24 | 機庫 | **Hangar** | 一致 |
| 25 | 升空 | **Launch**（動詞／按鈕）· **Ascent**（飛行階段） | ⚠️ `space.launchCtrl` 用 launch 當階段名，可接受；標題一律 `Launch` |
| 26 | 登艦 | **Boarding** | ⚠️ `space.hangarCtrl` 沒提到；場景標題用 `Hangar Bay` |
| 27 | 任務 | **Quest** | 一致（`Quests {done}/{total}`） |
| 28 | 成就 | **Achievement** | 一致；`Achievements` 為面板名 |
| 29 | 挑戰模式 | **Challenge Mode** | ⚠️ `ui.challenge` 是 Challenge Mode，但 `ach.tab.challenge` 是 Challenge（分類標籤可短，但文件要標明） |
| 30 | 教學 | **Tutorial** | 字典尚未有（`tut.*` 是預定）；一經實作一律 Tutorial |
| 31 | 砲塔 | **Turret** | 一致（`No turrets, no mods` → 改 `No turrets, no modules`） |
| 32 | 收集網 | **Collection Net** | ⚠️ 混用 `Auto Collection Net` 與 `Collection Net` → 建築全名 `Auto Collection Net`，句中可 `Collection Net` |
| 33 | 分解工坊 | **Salvage Works** | 一致（工坊不是 Workshop；Workshop 只有 Rocket Workshop） |
| 34 | BOT | **BOT** | 全大寫、不翻譯；`BOT Dock`、`BOT Fleet`、`BOT {n}/{max}` |
| 35 | 音效 | **SFX** | ⚠️ 目前混用 `Sound`（`pause.soundOn/Off`、`main.soundOn/Off`、`help.mute`）→ 全部改 SFX；**音樂**才是 Music |
| 36 | 總靜音 | **Master Mute** | ⚠️ `settings.masterMute` 是 Master mute；按鈕式統一 `Master Mute` |

> 🔴 **B 要改的 key 總表（共 18 處）**：`mod.title`、`mod.needTable`、`mod.emptySlot`、`mod.full`（mods → modules）、`struct.modtable.name/desc`、`craft.inherit`（Suit → Dive Suit）、`hint.tech`（guardians → leviathans）、`quest.tech.text/sub`（守衛 → Leviathan）、`pause.soundOn/Off`、`main.soundOn/Off`、`help.mute`（Sound → SFX）、`settings.masterMute`、`space.moonEnter`（大小寫）、`ach.no_mods.desc`（mods → modules；原表誤植為 `ach.no_tower.desc`）。
>
> ✅ **2026-11-04 已套用**：上述 18 處＋同概念殘留 8 處（`quest.mod.text/sub`、`base.shardHint`、`toast.gotMod`、`help.craft`、`ach.mods3.name/desc`、`rift.modBox`）＝**26 處 en 值變更**；全字典再掃 `mods|Mod Workbench|Harpoon Mods|Sound on|Sound off|guardians` 已為 0。keys／條數（425）／行號註解皆未動。
> 改完後 `STRINGS.js` 的條數不變；`EN-REVIEW` 這張表就是 review 的 diff 依據。

## 3. 20 條「英文太長」的 UI 字串與建議縮短版

> 選法：按鈕／toast／HUD／面板卡片用字，英文超過 36 字元且中文很短者。`{...}` 是佔位符，縮短時不可拿掉。
> 「現長 → 建議」= 英文字元數；`≤` 後的目標是該元件上限。

| # | key（用途） | 現在 EN（長度） | 建議縮短版（長度） | 為什麼 |
|---|---|---|---|---|
| 1 | `bounty.note`（面板說明） | A new contract arrives {refill} s after you finish one; {reroll} Metal rerolls an unwanted contract. Kill and salvage progress updates live.（140） | New contract in {refill} s; {reroll} Metal to reroll. Progress updates live.（73） | 面板底部兩行，140 會爆 3 行 |
| 2 | `mod.needTable`（面板提示） | Requires a Mod Workbench (build from the base panel: Metal 34 · Alloy 5, needs Rocket R&D Center)（97） | Requires Module Workbench (Metal 34 · Alloy 5; R&D Center)（64） | 卡片內文字，需 ≤2 行 |
| 3 | `base.summaryHint`（面板副標） | Every building adds a tile—your base grows tile by tile. Enemies cannot enter the safe zone.（92） | Each building adds a tile; enemies cannot enter the Safe Zone.（68） | 標題下方一行說明 |
| 4 | `cheat.desc`（作弊面板） | Cheat mode: these upgrades are free, stack with normal upgrades, and last the whole run.（88） | Cheat: free upgrades, stack with normal ones, active all run.（65） | 面板首行，需一眼看完 |
| 5 | `main.goal`（開局 toast） | Swim back to base → press B to build (base is {dist} away; the HUD shows your next step)（88） | Swim back to base → press B to build ({dist} away; HUD shows next step)（78） | toast ≤60 目標，仍超；見 #6 |
| 6 | `main.goal`（toast 版） | 同上 | Swim back, press B to build（{dist} away）（48） | toast 硬上限 60；細節留給 HUD |
| 7 | `bounty.needTerminal`（toast） | Requires a Bounty Terminal — build it from the base panel with B (Metal 14 · Plastic 8)（87） | Requires Bounty Terminal — build with B (Metal 14 · Plastic 8)（66） | toast 過長會換行遮畫面 |
| 8 | `mod.emptySlot`（卡片） | Empty mod slot — mod boxes drop from Leviathans, bounty headhunts and Rift cores（80） | Empty module slot — drops from Leviathans, headhunts, Rift cores（72） | 卡片高度固定，需 ≤2 行 |
| 9 | `tut.step3`（教學） | Build an Auto Collection Net, then an Equipment Room to upgrade your harpoon（76） | Build a Collection Net, then an Equipment Room（48） | 教學卡一行一句 |
| 10 | `tut.step4`（教學） | Press C to upgrade the harpoon to Lv1; a shark is coming — aim and hold fire（76） | Press C to upgrade; a shark is coming — aim and hold fire（59） | 教學卡 ≤ 2 行 |
| 11 | `tut.step1`（教學） | Follow the white arrow — swim over trash and it gets pulled into your pack（74） | Follow the arrow — swim over trash to collect（48） | 教學第一步要最短 |
| 12 | `hud.idleNone`（HUD） | Base not automated yet — press B to build a Collection Net and a BOT Dock（73） | Not automated — press B to build a Net and BOT Dock（56） | HUD 一行，不可換行 |
| 13 | `space.ignite`（場景 toast） | Ignition! A/D to dodge, W to accelerate; the turret fires automatically（71） | Ignition! A/D dodge · W boost · turret fires automatically（60） | 進場提示 ≤60 |
| 14 | `tut.step5`（教學） | Build a Bounty Terminal (Metal 14 · Plastic 8), press H for a contract（70） | Build a Bounty Terminal (Metal 14 · Plastic 8), then H（59） | 教學卡 |
| 15 | `sea.techFull`（toast） | All 4 shards collected! Research Rocket Shield tech at the R&D Center（69） | All 4 shards collected! Research Rocket Shield at R&D（58） | toast 60 上限 |
| 16 | `space.launchCtrl`（畫布底部） | A/D dodge · W accelerate · Gun Lv{n} (can't pierce fighter shields)（67） | A/D dodge · W boost · Gun Lv{n} (can't pierce shields)（55） | 1920 與 1280 都要放得下 |
| 17 | `hint.tech`（HUD 下一步） | Fight the four guardians (purple on radar) or take bounty contracts（67） | Fight four leviathans (purple radar) or take bounties（56） | HUD chip 兩行內 |
| 18 | `quest.bounty.sub`（任務 sub） | Press H for the Bounty Terminal — kills and salvage pay in Alloy（64） | Press H for bounty contracts — kills and salvage pay Alloy（61） | 任務列表 sub ≤70 但英文易換行 |
| 19 | `space.hangarCtrl`（畫布底部） | WASD to fly · W to advance (mothership gravity drags you back)（62） | WASD fly · hold W to advance (gravity pulls you back)（52） | 底部兩段式提示 |
| 20 | `bounty.top`（面板標頭） | Contracts {n}/{slots} · Completed {done} · Kill tier T{tier}（60） | Contracts {n}/{slots} · Done {done} · Tier T{tier}（45） | 標頭一行，數字多 |

> 剩下 5 條可順手縮（不列主表）：`craft.satCost`（59→44 `Build with B (Metal 45 · Plastic 30 · Alloy 8)`）、`space.moonNoDmg`（58→`Weapon Lv{n} — aliens shielded`）、`space.moonCtrl`（55→`WASD move · Mouse aim / hold fire · Shift boost`）、`ui.kicker`（53→`Survival · Base Building · Revenge`）、`rift.appear`（62→`A Rift opened — shoot its core`）。

## 4. B / C 接線注意

- **B**：以上縮短版要一次改在 `docs/i18n/STRINGS.js`（同 key、同 `file:line` 註解），不要改程式內的 zh；改完跑一次 `new Function('window', src)` 語法檢查。
- **C**：`#hint`、`.basetag`、`.nextstep`、`#toasts` 要量 en 最長字串；`#hint` 目前 `white-space:nowrap`（v0.6），en 版會超寬 → 加 `@media (max-width: 900px)` 或允許兩行。
- **量測方式**：`JSON` 的 en 長度只是粗估；實際用 canvas 量（`ctx.measureText`）在 1280／1920／390 三種寬度各量一次，記錄在 `docs/i18n/EN-REVIEW.md` 的 PR 說明。
- **佔位符**：`{n}`、`{dist}`、`{name}`、`{hp}`、`{pct}`、`{lv}`、`{cur}`、`{refill}`、`{reroll}`、`{slots}`、`{tier}` 不可翻譯、不可加空白；en 句子裡的位置可調（英文常把距離放句尾）。
- **複數**：`{n} items`／`{n} shards` 由 `I18N_RULES.plural` 處理；資源名（Metal/Plastic/Wood/Alloy）不可加 s。
- **不要機翻**：`Leviathan`、`Rift`、`BOT`、`Cabin Pressure`、`Tech Shard` 是自訂名詞，機器翻譯會翻成 `monster`／`crack`／`cabin voltage`，一律以 §2 為準。

## 5. 驗收（v0.7 英文版上線前）

- [x] §2 的 18 處 key 已改（＋8 處殘留，共 26 處 en 值）；全字典搜尋 `Mod Workbench`、`Harpoon Mods`、`mod boxes`、`Sound`、`guardians` 已為 0
- [x] 字串總數不變（425）；`new Function` 驗證通過（2026-11-04）
- [ ] 1280／1920 截圖各 5 張：無文字溢出、無 `…` 截斷、無遮擋
- [ ] 390×844 手機直向：按鈕與 toast 不換行到破版
- [ ] 設定切 EN → 重開頁面仍為 EN（`localStorage` 語言欄位）
