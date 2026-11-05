# v0.10-C1：封測 UI 契約（FPS／F2 標記／匯出測試紀錄）

> 擁有者：C（CSS／docs）。只改 `style.css`、`docs/art/`。
> B 的 task-40 會建立 DOM 與行為；本檔是 class／i18n／觸發契約，CSS 已實作，B 照著用即可。
> 截圖：`_shots/C11/`（1920／390）。

## 1. F3 FPS 面板（`#fps`）

### DOM 契約（B 建立在 body 尾端；預設 `hidden`）
```html
<div id="fps" hidden data-tier="good">
  <div class="fps-row">
    <span class="fps-label">FPS</span>
    <b class="fps-val">59</b>
    <span class="fps-tier">GOOD</span>
  </div>
  <div class="fps-row">
    <span class="fps-label">MS</span>
    <b class="fps-val">16.8</b>
    <span class="fps-tier">particles 123</span>
  </div>
  <div class="fps-extra">tier 2 · 1280×800</div>
  <button class="fps-close" type="button" aria-label="Close">✕</button>
</div>
```
- 位置：`position:fixed; right:16px; top:16px; z-index:15`；半透明玻璃、`pointer-events:none`；只有 `.fps-close` 可點。
- 顯示／隱藏：F3 切換 `#fps.hidden`（預設 hidden，不影響一般玩家）。
- tier 色：`#fps[data-tier="good|ok|bad"]` 會把 `.fps-val`／`.fps-tier` 染綠／金／紅；也可直接在 `.fps-val` 加 `.good/.ok/.bad`。
- 390：`right:8px; top:8px; min-width:150px`，字級縮小；不與 HUD 重疊（FPS 只在右上）。
- 可加 `.fps-extra` 顯示粒子數／tier／解析度（10px muted）。
- 建議 B：`document.getElementById('fps')` 若不存在才建立，避免與其他人搶 DOM；C 未在 index 預留，避免 id 衝突。

## 2. F2 卡點標記 toast

B 的 `toast()` 已支援第二個 class 參數；標記時請用：
```js
toast(t('qa.marked', { n: qaLog.length }), 'qa-mark');
// 或建立 <div id="qa-toast" class="toast qa-mark">…</div>
```
CSS 已吃：
- `.toast.qa-mark`／`#qa-toast`：金色左框、暖色底、金色 `⚠` 前綴＋右側脈動點。
- 其他 toast（gold 等）不受影響。
- 建議文案：`qa.marked`＝「已標記卡點 #{n}」／「Bug point #{n} marked」。
- 標記資料（`localStorage['etsea-qa-log']`）不含個資；UI 不需要顯示座標。

## 3. 設定面板「匯出測試紀錄」按鈕

### DOM 契約（B 插在 `openSettings()` 的 `.settings` 內，語言列之後）
```html
<div class="settings-actions">
  <button class="settings-export" data-action="export-qa" type="button">
    <span>${t('qa.export')}</span>
    <span class="qa-export-meta">${t('qa.exportCount', { n: qaLog.length })}</span>
  </button>
</div>
```
- CSS：次要按鈕（半透明青框）、左側 `⤓` 下載 icon（CSS content，無中文）、hover/active/disabled、成功後可加 `.settings-export-done`（綠色）。
- 390：`.settings-actions{display:block}`、按鈕全寬。
- 建議互動：無紀錄時 disabled（或顯示 `qa.none`）；下載成功 toast `qa.exported`（含檔名）。
- 隱私：只匯出 `etsea-qa-log`＋UA／DPR／語言／版本／音樂開關；不含個資。設定面板可加一行 muted 說明（`qa.privacy`）。

## 4. 給 E 的 i18n key（task-44）
| key | zh-Hant | en |
|---|---|---|
| qa.marked | 已標記卡點 #{n} | Bug point #{n} marked |
| qa.export | 匯出測試紀錄 | Export test log |
| qa.exportCount | {n} 筆紀錄 | {n} records |
| qa.exported | 已下載 {file} | Downloaded {file} |
| qa.none | 尚無紀錄 | No records yet |
| qa.privacy | 只包含遊戲狀態與裝置資訊，不含個資。 | Game state and device info only; no personal data. |
| qa.fpsOn | FPS 覆蓋層：開 | FPS overlay: on |
| qa.fpsOff | FPS 覆蓋層：關 | FPS overlay: off |

> FPS 面板的 `FPS`／`MS`／`GOOD`／`OK`／`BAD` 是短標籤，可不翻；tier 文字由 JS 給。

## 5. 驗收（C）
- 390：FPS 面板 150px 寬、不溢出；匯出按鈕全寬；`docSW=390`。
- F2 toast 有金色 `⚠` 圖示與脈動點；與一般 toast 可區分。
- 匯出按鈕含下載 icon、hover/active/disabled 狀態、focus-visible 有 ring。
- 截圖：`_shots/C11/01-fps-panel-{1920,390}.png`、`02-qa-toast-*`、`03-settings-export-*`。
- `qa.mjs` 不回歸（B 的 v0.10 版本實測見 task-43 回報）。

## 6. 注意
- B 目前尚未建立 `#fps`；C 未在 index 預留，避免 id 衝突；CSS 已可用。
- 若 B 用 canvas 畫 FPS 而非 DOM，CSS 不適用；本檔以 DOM `#fps` 為準（B task-40 允許 DOM）。
- FPS 面板與 toast 都是 QA-only，不寫存檔、不影響成就。
