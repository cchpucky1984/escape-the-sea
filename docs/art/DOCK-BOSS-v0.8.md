# v0.8-C1：升空→機庫轉場 overlay＋最終 BOSS／鏡像 BOSS UI

> 擁有者：C（美術／版面）。只改 `style.css`、`index.html`、`docs/art/`；不改 `js/`。
> 容器已預留在 `index.html`（空文字，JS 用 B 的 `t()` 填）；CSS 不含任何中文 content。
> 截圖：`_shots/C9/`（1920×1080、390×844，真場景背景）。驗證：真 `initDock()`／`initMoon()` 場景注入。

## 1. #dockcue（升空→機庫轉場提示）

### DOM 契約（index.html 已預留，勿重建結構）
```html
<div id="dockcue" hidden data-state="approach" data-visible="false" aria-live="polite">
  <span class="cue-arrow"></span>
  <div class="cue-card">
    <div class="cue-kicker"><i class="cue-dot"></i><span class="cue-kicker-text" data-i18n="dockcue.kicker"></span></div>
    <div class="cue-main">
      <span class="cue-line cue-line-approach" data-i18n="dockcue.actionApproach"></span>
      <span class="cue-line cue-line-ready" data-i18n="dockcue.actionReady"></span>
      <span class="cue-line cue-line-failed" data-i18n="dockcue.actionFailed"></span>
    </div>
    <div class="cue-sub">
      <span class="cue-sub-line cue-sub-approach" data-i18n="dockcue.boost"></span>
      <span class="cue-sub-line cue-sub-ready" data-i18n="dockcue.boostReady"></span>
      <span class="cue-sub-line cue-sub-failed" data-i18n="dockcue.retry"></span>
    </div>
    <div class="cue-meta"><span class="cue-dist" data-i18n="dockcue.distance">0 m</span><span class="cue-track"><i></i></span></div>
  </div>
</div>
```
- CSS 依 `data-state` 自動切換三行文案／副文案／顏色／動畫；JS **只切 state 與數字**。
- 顯示：`cue.hidden=false; cue.dataset.visible='true'`；CSS 350ms 淡入。
- 淡出：`cue.dataset.visible='false'`，350ms 後 `cue.hidden=true`（或直接 hidden，但會沒有淡出）。
- `--dock-progress`（0..1）：距離條；`--cue-angle`（deg，0=向上）：箭頭指向機庫方向。
- 失敗：`data-state="failed"` 會紅框＋左右 shake（`prefers-reduced-motion` 與 `body.reduce-motion` 會停用）。

### 給 D 的接線規格（class／時機／變數）
| 時機 | 動作 |
|---|---|
| `launch` state → `win`（2s 轉場倒數開始） | 顯示 approach，distance 可用剩餘倒數/「距機庫 xxx m」 |
| `initDock()` 進入 dock 場景 | 保持顯示；每幀更新距離／箭頭角度 |
| 玩家接近機庫（距離 ≤ 120 或進入 1.5× hangar 範圍） | `data-state="ready"`（金色） |
| 進入 hangar（`dock.state==='in'`，切 `initMoon` 前） | `data-visible=false` → 進 moon 後 hidden |
| `dockFail()`（被擊落／被彈開） | `data-state="failed"`，顯示 1.2s；開 modal 前後皆可，modal 開啟後 hidden |
| `backToBaseFromLaunch()` | 立即 hidden |
| 每個 frame | `cue.style.setProperty('--dock-progress', p)`；`--cue-angle = Math.atan2(dx,-dy)*180/Math.PI + 'deg'` |
| 文字 | 用 `t('dockcue.*', {n})` 填 `.cue-kicker-text`、三條 `.cue-line-*`、三條 `.cue-sub-line-*`、`.cue-dist`；不要用 innerHTML 塞中文 |
| a11y | 顯示時 `aria-hidden="false"`；`aria-live="polite"` 已預留；不要 focus |

> 安全區：`#dockcue` 不遮 HUD 資源列（HUD 只在 sea 顯示；`body[data-scene="sea"] #dockcue{display:none!important}` 已加保險）。

## 2. #bossui（最終 BOSS／鏡像 BOSS）

### DOM 契約（index.html 已預留）
```html
<div id="bossui" hidden data-visible="false" data-mode="final" data-phase="1">
  <div class="boss-card boss-final">
    .boss-top > .boss-eyebrow / .boss-name / .boss-phase
    .boss-hp > .boss-hp-track > i.boss-hp-fill + .boss-hp-text
    .boss-segments > i×3
    .boss-moves > .boss-move[data-move="beam|missile|charge|gravity"] > .mv-icon + .mv-name
    .boss-warning[hidden]
  </div>
  <div class="boss-card boss-mirror">
    .boss-top > .boss-eyebrow / .boss-name / .boss-skill
    .boss-hp > ...（--mirror-hp）
    .mirror-compare > .mc-head + .mc-row[data-stat="harpoon|speed|armor|rate"]（name/player/+1/mirror）
    .mirror-note
  </div>
</div>
```
- `data-mode="final"|"mirror"`：切換兩張卡；mirror 預設隱藏。
- `data-phase="1|2|3"`：階段格亮幾格（也可另加 `.boss-segments i.on`）；accent 色會跟著變。
- `--hp`（0..1）／`--mirror-hp`（0..1）：血條寬度；`.boss-hp-text` 由 JS 填 `Math.ceil(p*100)+'%'`。
- 當前招式：`#bossui.dataset.active = 'beam'`（CSS 支援）或給單一 `.boss-move.on`；兩者等價。
- `#bossui[data-visible="true"]` 淡入；`hidden` 隱藏。**只在 moon 場景顯示**（sea/title/intro/ending/launch/dock 有 scene guard）。

### 給 D 的接線規格
| 時機 | 動作 |
|---|---|
| 最終核心 boss 生成 | `bossui.hidden=false; data-visible='true'; data-mode='final'; data-phase='1'`；hp=1 |
| 每幀／受擊 | `--hp`；`.boss-hp-text`；血量跨 ⅔／⅓ 時 `data-phase=2/3` |
| 出招前搖 | `data-active=<move>`；可把 `.boss-warning` 解 hidden 顯示「核心過載／光束」等，前搖結束 hidden |
| 招式結束 | 清 `data-active`（或移除 `.boss-move.on`） |
| 核心死亡→逃脫階段 | `data-mode='mirror'`；`--mirror-hp=1`；用 `calcStats()` 算鏡像四項（玩家值 +1）填 `.mc-player/.mc-mirror` |
| 鏡像死亡／玩家死亡 | `data-visible='false'`；300ms 後 hidden（失敗重試時再顯示） |
| 文字 | 全部 `t('bossui.*')`；對比卡數值直接放 `Lv4`/`Lv5` 這類短字串（B 可自由） |

### 給 B 的 i18n key 清單（建議直接加進 STRINGS.js）
| key | zh-Hant | en |
|---|---|---|
| dockcue.kicker | 目標：母船機庫入口 | Objective: Mothership hangar |
| dockcue.actionApproach | 按住 W 衝進機庫 | Hold W to breach the hangar |
| dockcue.actionReady | 機庫入口已鎖定 | Hangar entrance locked |
| dockcue.actionFailed | 被彈開 — 重新對準 | Deflected — line up again |
| dockcue.boost | 按 W 加速 | Hold W to boost |
| dockcue.boostReady | 按住 W 衝進去 | Hold W to breach |
| dockcue.retry | 按 W 重新加速 | Hold W to try again |
| dockcue.distance | 距離 {n} m | {n} m away |
| bossui.eyebrow | 最終 BOSS | FINAL BOSS |
| bossui.name | 母船核心 | Mothership Core |
| bossui.phase | 階段 {n} / 3 | PHASE {n} / 3 |
| bossui.warning | 核心過載 — 快躲 | CORE OVERLOAD — MOVE |
| bossui.move.beam | 光束 | Beam |
| bossui.move.missile | 導彈 | Missile |
| bossui.move.charge | 衝撞 | Charge |
| bossui.move.gravity | 重力 | Gravity |
| bossui.mirror.eyebrow | 逃脫階段 | ESCAPE |
| bossui.mirror.name | 你的鏡像 | Your Mirror |
| bossui.skillPlus | 技能 +1 | SKILL +1 |
| bossui.player | 玩家 | YOU |
| bossui.mirrorLabel | 鏡像 | MIRROR |
| bossui.compare.harpoon | 魚槍 | Harpoon |
| bossui.compare.speed | 速度 | Speed |
| bossui.compare.armor | 裝甲 | Armor |
| bossui.compare.rate | 射速 | Fire Rate |
| bossui.mirror.note | 擊敗鏡像，奪回主控權 | Defeat your mirror to reclaim control |

### 可直接貼進 `docs/i18n/STRINGS.js` 的 26 條（E 用）
```js
/* v0.8 dockcue / bossui（C 提供，B 的 applyI18nDom 會吃） */
"dockcue.kicker":        ["目標：母船機庫入口", "Objective: Mothership hangar"],
"dockcue.actionApproach":["按住 W 衝進機庫", "Hold W to breach the hangar"],
"dockcue.actionReady":   ["機庫入口已鎖定", "Hangar entrance locked"],
"dockcue.actionFailed":  ["被彈開 — 重新對準", "Deflected — line up again"],
"dockcue.boost":         ["按 W 加速", "Hold W to boost"],
"dockcue.boostReady":    ["按住 W 衝進去", "Hold W to breach"],
"dockcue.retry":         ["按 W 重新加速", "Hold W to try again"],
"dockcue.distance":      ["距離 {n} m", "{n} m away"],
"bossui.eyebrow":        ["最終 BOSS", "FINAL BOSS"],
"bossui.name":           ["母船核心", "Mothership Core"],
"bossui.phase":          ["階段 {n} / 3", "PHASE {n} / 3"],
"bossui.warning":        ["核心過載 — 快躲", "CORE OVERLOAD — MOVE"],
"bossui.move.beam":      ["光束", "Beam"],
"bossui.move.missile":   ["導彈", "Missile"],
"bossui.move.charge":    ["衝撞", "Charge"],
"bossui.move.gravity":   ["重力", "Gravity"],
"bossui.mirror.eyebrow": ["逃脫階段", "ESCAPE"],
"bossui.mirror.name":    ["你的鏡像", "Your Mirror"],
"bossui.skillPlus":      ["技能 +1", "SKILL +1"],
"bossui.player":         ["玩家", "YOU"],
"bossui.mirrorLabel":    ["鏡像", "MIRROR"],
"bossui.compare.harpoon":["魚槍", "Harpoon"],
"bossui.compare.speed":  ["速度", "Speed"],
"bossui.compare.armor":  ["裝甲", "Armor"],
"bossui.compare.rate":   ["射速", "Fire Rate"],
"bossui.mirror.note":    ["擊敗鏡像，奪回主控權", "Defeat your mirror to reclaim control"],
```
> `STRINGS.js` 目前已有舊 `dockcue.target/holdW/distance/ready/fail` 5 條；B 擔心現在接 `[data-i18n]` 會讓 21 個新 key 記進 `i18nMissing()` 並讓 en QA 變紅。建議照 B 的計畫：E 貼上以上 26 條後，B 再做通用 `applyI18nDom()`（缺 key 保空白、不記 missing）。若 E 想少加 key，可把 `dockcue.kicker→target`、`actionReady→ready`、`actionFailed→fail`、`distance→distance`、`boost→holdW` 對映，只補 `actionApproach/boostReady/retry` ＋ bossui 18 條。

## 3. 驗證（真場景注入，1920/390）
- dockcue：1920 卡片 560×115.5、top 58；390 卡片 370×95.4、top 30；`docSW=390`，無橫向溢出。
- bossui：1920 760×118（final）／760×216.5（mirror）；390 374×91.8／374×177.8；全部在 viewport 內。
- HUD 保險：`setScene('sea')` 後強制顯示兩個 overlay，computed display 仍為 `none`（HUD display flex）→ 不遮資源列。
- 截圖：`01–03 dockcue 三態`、`04 boss final`、`05 phase 3`、`06 mirror`（各有 1920/390）。
- `node _dev/qa.mjs`：**47/47 PASS、pageErrors(0)**（v0.8 進行中版本；本輪只加 DOM 容器＋CSS，不動 js）。
- 注意：dockcue／bossui 的 JS 接線還沒進 B/D 的 js，截圖用 sample 文字注入容器；接線後需重拍確認實際字串（尤其 EN 長字串）。

## 4. 注意
- **CSS 不寫死中文**：v0.8 樣式的 `content` 只有 `◉ ➤ ⟫ ◎ ◆ ≈ ▣ ⟳ !` 等符號；中文全部來自 B 的 `t()`。
- 若 JS 會重建 `#bossui` 內容，必須保留上述 class／data 契約；否則 CSS 不生效。
- `reduce-motion`／`prefers-reduced-motion` 已停用 pulsing/shake。
