# v0.9-C1：挑戰模式／NG+／可及性 UI 契約

> 擁有者：C（CSS／docs）。只改 `style.css`、`index.html`、`docs/art/`。
> B 已實作 challenge/NG+ 的 JS（`core.js`、`main.js`）；本檔以**實際 DOM**為準，列出 CSS 已吃的 class、B 尚缺的 hook、以及 i18n key 清單。
> 截圖：`_shots/C10/`（1920/390）；商店版另存 `docs/art/store/screenshots/`。

## 1. 挑戰模式

### 1.1 選單（B 的 `openChallengeMenu()`，modal）
實際 DOM：
```html
<!-- #modal.show -->
<div class="grid challenge-grid">
  <div class="card challenge-card">
    <div class="card-h"><span class="ico" style="--c:#ffd166">◆</span><b>一命深海</b></div>
    <p>不能死亡。死亡即結束，不重生。</p>
    <div class="cost"><span>規則：不能死。死一次就結束。</span></div>
    <div class="done">最佳分數：12,840</div>
    <button data-challenge="iron">開始挑戰</button>
  </div>
  <!-- speed / bare 同構；未解鎖時沒有 button，只有 .done（鎖定文案） -->
</div>
```
CSS 已吃：
- `.challenge-grid`：桌機 3 欄、≤768 1 欄（覆蓋 `.grid` 的 auto-fill）。
- `.card.challenge-card`：左側 3px 難度色條、底色、`.card-h b`/`p`/`.cost`/`.done`/`button[data-challenge]` 的字級與顏色。
- 難度色（目前由 B 的 `data-challenge` 判定）：`iron`＝紅、`speed`＝金、`bare`＝紫；卡內 `.ico` 也跟著變色。
- **建議 B 補**：`<div class="card challenge-card" data-diff="hard|normal">` ＋卡內 `<span class="ch-diff">困難</span>`；CSS 已支援 `data-diff` 的色與 `body.colorblind`/`body.cb-safe` 下的 `● ◆ ▲` 符號（目前用 `:has([data-challenge])` 也有色條，但沒有文字難度標籤）。

### 1.2 挑戰 HUD（B 目前用既有 `#nextstep`）
實際：`#nextstep > b`＝挑戰模式、`span`＝`challenge.timeLeft` 或 `challenge.*.rule`（由 `challengeHudText()` 產生）。
- **建議 B 補**：挑戰進行中給 `#nextstep` 加 `class="challenge"`＋`data-challenge="iron|speed|bare"`；CSS 已寫 `#nextstep.challenge` 的紅色左框與 `data-challenge` 色。
- 若之後改用獨立容器，CSS 也有 `.challenge-hud` 系（未使用，可留作備援）。

### 1.3 挑戰結算（沿用 `#ending`）
B 目前只換 `#end-kicker/#end-title/#end-text/#end-stats`，沒有 mode 屬性。
- **建議 B 補**：`#ending.dataset.mode='challenge'`、`#ending.dataset.result='win'|'lose'`；CSS 會套金色/紅色 kicker、金/紅框、`#end-title` 失敗色，並隱藏 NG+ 按鈕。
- 若 B 想用獨立分數卡：CSS 已有 `.challenge-result`（`.chr-badge/.chr-time/.chr-score-num/.chr-best-num`），B 可自行 insert。
- 目前畫面：時間／擊殺／裝備／分數＋最佳分都在 `.end-stats` 內，沿用結局卡即可。

### 1.4 B 的 i18n key（目前缺，會顯示 raw key）
| key | zh-Hant | en |
|---|---|---|
| challenge.records | 挑戰紀錄 | Challenge Records |
| challenge.entry | 挑戰模式 | Challenge Mode |
| challenge.rule | 規則 | Rule |
| challenge.iron.desc | 不能死亡。死亡即結束，不重生。 | No deaths. One death ends the run. |
| challenge.speed.desc | 45 分鐘內攻入母船核心，逾時失敗。 | Reach the mothership core within 45 minutes. |
| challenge.bare.desc | 不能建砲塔、不能裝模組；四件裝備不可升級。 | No turrets, no modules, four gear lines locked. |
| challenge.best | 最佳分數：{score} | Best: {score} |
| challenge.bestEmpty | 尚無紀錄 | No record yet |
| challenge.start | 開始挑戰 | Start Challenge |
| challenge.locked | 通關一次後解鎖 | Clear the game once to unlock |
| challenge.success | 挑戰成功 — {score} 分 | Challenge clear — {score} points |
| challenge.fail | 挑戰失敗 — {reason} | Challenge failed — {reason} |
| challenge.newRecord | 新紀錄！ | New record! |
| challenge.score | 分數 {score} | Score {score} |
| challenge.retry | 再挑戰一次 | Retry Challenge |
| challenge.exit | 返回 | Back |
| challenge.timeLeft | 剩餘 {time} | {time} left |

> `challenge.<id>.name`、`challenge.<id>.rule` 已在 STRINGS.js；`challenge.records/entry/rule/desc/start/best/bestEmpty/success/fail/newRecord/score/retry/exit/timeLeft` 尚未（E 的 task-39 會補；B 的 `t()` 現在會 fallback 成 raw key，截圖已用 sample 翻譯驗證版面）。

## 2. NG+ UI

- 結局：B 目前在 `#end-title` 後綴「· NG+3」，標題會變兩行大字；**建議改成 badge**：
  - `#end-title` 保持單行；在 `.ending-inner` 插 `<div class="ng-badge end-ng">NG+3</div>`（CSS 已備金框 pill）。
  - 「開始 NG+」按鈕 B 已用 `#end-ng.primary`；CSS 已把它改成金色（`#ending #end-ng`）。
  - `data-mode="challenge"` 時 CSS 會隱藏 NG+ 按鈕（挑戰中禁用 NG+）。
- HUD：B 目前沒有 NG+ 標記；**建議**在 `#hud` 內加 `<div class="ng-badge hud-ng">NG+3</div>`（CSS 已備）。`game.ng=0` 時 hidden。
- i18n：`ng.label`（NG+{n}）、`ng.start`（開始 NG+{n}）、`ng.count`、`ng.enemyBuff` 已在 STRINGS.js；badge 直接顯示 `t('ng.label',{n})` 即可。

## 3. 可及性

### 3.1 reduce motion
- `body.reduce-motion`（B 已加）與 `prefers-reduced-motion`：所有 `*`／`*::before`／`*::after` 的 `animation:none!important;transition:none!important`。
- 實測（390/1920）：toast `animationName=none`、`animationDuration=0s`、`transitionDuration=0s`。
- 影響：toast 進出、crown pulse、boss warning、cue arrow、achUnlock、dock shake 全部停用。

### 3.2 色盲輔助（不靠顏色）
- B 的 `applySettings()` 目前用 `body.colorblind`；C 同時支援 `body.cb-safe`（任務規格名），兩者都吃。
- 已加符號/文字：
  - toast：`●`／`★`（gold）前綴。
  - 挑戰卡：`iron ●`、`speed ◆`、`bare ▲`（`card-h b::after`）。
  - 難度資料若加 `data-diff`，`.ch-diff` 也會加符號。
  - `boss-move.on::after`＝`▶`；`ach-tab.on`＝`✓`；`#nextstep.challenge` 雙線左框。
  - 通用 class：`.state-ready`→`✓`、`.state-danger`→`⚠`、`.state-warn`→`!`（B 可在賞金 ready／事件／危險處加這些 class）。
- 賞金 ready 本來就有「✓ 可領取」文字；挑戰用文字規則與分數，不依賴顏色。

### 3.3 大字 120%
- B 用 `game.settings.fontScale=1.2` 並在 body 加 `font-large`；C 同時支援 `body.text-lg`（任務規格名）。
- `html:has(body.font-large),html:has(body.text-lg){font-size:120%}`；新 v0.9 元件全部用 `rem`，會跟著放大。
- 既有 px 元件加了 `body.font-large/.text-lg` 的重點覆寫（資源列、任務卡、設定 label、成就卡、賞金卡、標題 blurb、modal 標題/內文）；標題卡在 `#title .title-inner` 可垂直滾動，390 實測 `docSW=390`。
- 實測 root font 19.2px、settings label 18.816px。

### 3.4 設定面板（B 接線，C 給樣式）
B 的 `openSettings()` 目前只有 mute/reduceMotion/lang；請加兩列：
```html
<div class="settings-row"><label>${t('settings.colorblind')}</label>
  <button class="toggle" data-setting="colorblind" aria-checked="${!!s.colorblind}">...</button></div>
<div class="settings-row"><label>${t('settings.fontScale')}</label>
  <button class="toggle" data-setting="fontScale" aria-checked="${s.fontScale===1.2}">...</button></div>
```
- CSS 已吃 `button.toggle[data-setting="colorblind"]`、`[data-setting="fontScale"]`（也支援 `cbSafe`/`textLarge` 別名）；checked 時指示燈分別金色/綠色。
- i18n：`settings.colorblind`＝色盲輔助／Colorblind assist；`settings.fontScale`＝大字模式（120%）／Large text (120%)。
- B 若要在 UI 文案顯示「已開啟」的 body class，建議同時 toggle `colorblind`＋`cb-safe`、`font-large`＋`text-lg`（QA/截圖驗收看得到）。

## 4. 驗收（C 實測）
- 390：挑戰 modal 374px、卡片 348（1 欄）、`docSW=390`；設定 modal 374、bottom 836<844。
- 1902 對照：挑戰 modal 980、grid 938、card 304.7；結局卡 640。
- reduce-motion：`animation:none / duration 0s / transition 0s`（toast／cue）。
- 大字：root 19.2px、label 18.8px；390 無橫向溢出。
- 截圖：`_shots/C10/01-challenge-menu-{1920,390}.png`、`02-challenge-{iron,speed,bare}-*`、`03-challenge-win-*`、`04-challenge-fail-*`、`05-hud-ngplus-*`、`06-ngplus-ending-*`、`07-a11y-settings-*`。
- `qa.mjs`（v0.9 進行中）：**42/43 PASS、pageErrors 0**；唯一 FAIL 是 FPS 28.3（門檻 30）——對照 v0.8 的 37.5，屬 B 的敵人密度／新彈幕負載，不是 CSS 造成的（本輪只加 hidden overlay 與少量靜態樣式）。另第一次跑 `save-persist` 曾出現 3→6（B 的存檔／產出時序），第二次已 PASS。

## 5. 尚缺／依賴
- 挑戰與 NG+ 的 i18n keys 由 E（task-39）補；補完 B 重拍即可去掉 raw key。
- B 需補：`#nextstep.challenge`＋`data-challenge`、`#ending.dataset.mode/result`、NG+ badge（結局/HUD）、`settings.colorblind/fontScale` 兩列、挑戰卡 `data-diff`/`.ch-diff`（可選）。
- 本輪截圖為 B 的實際 DOM＋sample 翻譯注入；非 JS 接線完成後的最終字串。
