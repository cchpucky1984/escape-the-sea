# v0.9-C1：挑戰模式／NG+／可及性 UI 契約

> 擁有者：C（CSS／docs）。只改 `style.css`、`index.html`、`docs/art/`。
> B 已於 v0.9 接完 challenge/NG+/a11y；本檔以**實際 DOM**為準。
> 截圖：`_shots/C10/`（1920／390，B 實際 UI）；商店版在 `docs/art/store/screenshots/`。
> QA：**46/46 PASS、pageErrors 0**（B 最新版重跑）。

## 1. 挑戰模式

### 1.1 選單（`openChallengeMenu()`，modal）
實際 DOM：
```html
<div class="grid challenge-grid">
  <div class="card challenge-card" data-diff="hard">
    <div class="card-h">
      <span class="ico" style="--c:#ffd166">◆</span>
      <b>一命深海</b>
      <span class="ch-diff">困難</span>
    </div>
    <p>不能死。死一次就結束。</p>
    <div class="cost"><span>規則：不能死。死一次就結束。</span></div>
    <div class="done">最佳分 12,840</div>
    <button data-challenge="iron">開始挑戰</button>
  </div>
  <!-- speed data-diff=normal / bare data-diff=hard -->
</div>
```
CSS 已吃：
- `.challenge-grid`：桌機 3 欄、≤768 1 欄（覆蓋 `.grid`）。
- `.card.challenge-card`：難度色左條（hard 紅／normal 金／bare 紫）、底色、`.ch-diff` 難度 pill、`.card-h b`、`p`、`.cost`、`.done`、`button[data-challenge]`。
- 難度色優先序：`data-diff` → 無 `data-diff` 時以 `:has([data-challenge])` fallback。
- 未解鎖：B 只放 `.done`（無 button），既有 `.card:not(:has(button))` 會給金色/透明度；本輪不動。

### 1.2 挑戰 HUD
B 用既有 `#nextstep`，並已加：
```html
<div id="nextstep" class="nextstep challenge" data-challenge="speed">
  <b>挑戰模式</b><span>剩餘 44:59</span>
</div>
```
- CSS：`#nextstep.challenge[data-challenge="iron|speed|bare"]` 分別紅／金／紫左框與 label 色。
- **建議（非阻塞）**：label 目前是 `t('chal.title')`（挑戰模式），不是當前挑戰名；若要符合「顯示當前挑戰名」，把 label 改成 `t('chal.'+id+'.name')` 即可（CSS 不用改）。

### 1.3 挑戰結算
B 已設 `#ending.dataset.mode='challenge'` 與 `data-result='win|lose'`（C 的 CSS 兩種都吃 `fail`/`lose`）。
- CSS：金色 kicker/邊框（win）、紅色 kicker/邊框（lose）、失敗標題色；`data-mode=challenge` 時隱藏 NG+ 按鈕。
- 分數/最佳分在 `.end-stats` 內（B 的 `challengeEnd()` 產生）；若之後要獨立分數卡，CSS 已有 `.challenge-result`（`.chr-*`）可接。

### 1.4 i18n key（B 已改 E 的 `chal.*`，`i18nMissing()` 空）
| key | zh-Hant | en |
|---|---|---|
| chal.title | 挑戰模式 | Challenge Mode |
| chal.start | 開始挑戰 | Start Challenge |
| chal.rules | 規則 | Rules |
| chal.iron.name / .desc | 一命深海／不能死。死一次就結束。 | Iron Dive／No deaths. One death ends the run. |
| chal.speed.name / .desc | 限時 45／45 分鐘內攻入母船核心。 | Speed Dive／Reach the mothership core within 45 minutes. |
| chal.bare.name / .desc | 赤手空拳／不能建砲塔、不能裝模組，四件裝備不可升級。 | Bare Hands／No turrets, no modules, four gear lines locked. |
| chal.diffHard / .diffNormal | 困難／一般 | Hard／Normal |
| chal.bestOnly / .bestEmpty | 最佳分 {score}／尚無紀錄 | Best {score}／No record yet |
| chal.locked | 先通關一次 | Finish a run first |
| chal.winTitle / .failTitle | 挑戰完成／挑戰失敗：{name} | Challenge complete／Challenge failed: {name} |
| chal.best / .newRecord | 最佳分 {best} · 本次 {score}／新紀錄！{score} | Best {best} · This run {score}／New record! {score} |
| chal.score / .timeLeft | 分數 {score}／剩餘 {time} | Score {score}／{time} left |
| chal.retry / .back | 再試一次／回標題 | Try again／Back to title |

> B 的卡片規則仍引用舊 `challenge.<id>.rule`（STRINGS 仍保留這些舊 key）；目前 `i18nMissing()` 空。若 E 之後移除舊 key，需把 `core.js` 的 `t('challenge.'+id+'.rule')` 換成 `chal.<id>.rule`（或直接沿用 `chal.<id>.desc`）。

## 2. NG+ UI（B 已接）
- 結局：`.ng-badge.end-ng`（例：`NG+3`）顯示在 `#end-title` 上方；`#end-title` 不再後綴。`#end-ng.primary` 由 CSS 改金色。
- HUD：B 在 `refreshHud()` 建立 `.ng-badge.hud-ng`（`NG+3`），`ng=0` 時隱藏。
- CSS 已吃：`.ng-badge`／`.hud-ng`／`.end-ng`／`#ending #end-ng`。
- i18n：`ng.label`、`ng.start`、`ng.count`、`ng.enemyBuff`、`ng.max`（已有）。

## 3. 可及性（B 已接）

### reduce motion
- `body.reduce-motion`（B 的 toggle）→ 全域 `animation:none!important;transition:none!important`。
- 實測（390/1920）：toast、cue `animationName=none`、`animationDuration=0s`、`transitionDuration=0s`。

### 色盲輔助
- B 的 `applySettings()` 現在同時 toggle `colorblind`＋`cb-safe`；CSS 兩者都吃。
- 符號：toast `●`／`★`（gold）；挑戰卡 `.ch-diff` `● ◆ ○ ▲`；boss move `▶`；`ach-tab.on` `✓`；`#nextstep.challenge` 雙線左框；通用 `.state-ready/danger/warn` → `✓ ⚠ !`。
- 賞金 ready 本來已有「✓ 可領取」文字。

### 大字
- B 的 `fontScale=1.2` 同時 toggle `font-large`＋`text-lg`。
- `html:has(body:is(.font-large,.text-lg)){font-size:120%}`；v0.9 元件用 rem；既有 UI 有重點 px 覆寫。
- 實測：root 19.2px、settings label 18.816px；390 `docSW=390`、無橫向溢出。

### 設定面板（B 已加兩列）
- `<button class="toggle" data-setting="colorblind">`、`data-setting="fontScale"`；CSS checked 指示燈金／綠。
- i18n：`settings.colorblind`／`settings.fontScale`（B 已補）。

## 4. 驗收（C 實測）
- 390：挑戰 modal 374、卡片 348（1 欄）、`docSW=390`；設定 modal 374、bottom 836<844。
- 1920：挑戰 modal 980、grid 938、card 304.7；結局卡 640。
- reduce-motion：`animation:none / 0s / transition 0s`。
- 大字：root 19.2、label 18.8；390 無溢出。
- 截圖：`_shots/C10/01-challenge-menu-{1920,390}.png`、`02-challenge-{iron,speed,bare}-*`、`03-challenge-win-*`、`04-challenge-fail-*`、`05-hud-ngplus-*`、`06-ngplus-ending-*`、`07-a11y-settings-*`。
- **QA：46/46 PASS、pageErrors 0**。

## 5. 尚缺／建議
- 挑戰 HUD label 顯示當前挑戰名（目前「挑戰模式」；改 `t('chal.<id>.name')` 即可）。
- `core.js` 舊 `challenge.<id>.rule` key 未清（目前有對應字串，無 raw key）。
- 商店 5 張 1920 為 C9 截圖（含中文 UI）；英文商店頁待另拍。
