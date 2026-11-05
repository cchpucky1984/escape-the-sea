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

## 7. v0.11 實際接線補充（B v0.10 已實作）

已確認 B 的實際 DOM：
- `ensureQaFpsPanel()`：`<div id="fps" class="fps-panel" style="position:fixed;right:12px;top:12px;z-index:9999;...">FPS 59.8 / 16.7 ms / E 0</div>`，單行 textContent、inline style。
  - C 的 CSS 已吃 `#fps.fps-panel`；**390 需 `!important` 覆寫 inline `top/right`**，已加（移到左下、bottom 320px，避開 HUD）。
- 匯出：`<div class="settings-row"><label>QA</label><button class="ghost qa-export" data-qa-export>匯出測試紀錄</button></div>`；C 已加 `.settings-row button.qa-export`／`[data-qa-export]` 樣式＋下載 icon；390 全寬。
- F2：B 已把 toast class 改成 `qa-mark`；實測 `#toasts .toast`＝`toast qa-mark`、`::before`＝`"⚠"`，C 的專屬樣式生效（截圖 `_shots/C12/10-f2-toast-1920.png`）。
- `#ending[data-mode=challenge]`、`#ending[data-mode=challenge][data-result=win|lose]` 與 `.ng-badge.end-ng`／`.hud-ng` 都已接線，C 的 CSS 生效。
- **bossui 已修**：D 已更新 `space.js`，`.boss-name`／`.boss-eyebrow`／`.boss-move .mv-name`／鏡像 `.mc-row .mc-name`／`.mc-player-label`／`.mc-mirror-label`／`.mirror-note` 都正確填入；實測 BOSS 名稱「母船核心」、四招「光束/導彈/衝撞/重力」、鏡像「魚槍/速度/裝甲/射速」、`i18nMissing=[]`。商店 04/05 已改為 v0.10 實際 UI。

## 8. 驗收（v0.11）
- itch 定稿包：`docs/art/store/ITCH-PACK.md`（全部 ≤400KB）。
- Steam 檢查：`docs/art/store/STEAM-CAPSULE-CHECK.md`。
- 390：FPS 面板在左下（x10、寬 ~174）、不遮 HUD；匯出按鈕可見（bottom <844）；`docSW=390`。
- 截圖：`_shots/C12/06-hud-390-colorbind-textlg.png`、`07-settings-export-390.png`、`09-steam-capsule-check.png`。
- `qa.mjs`：**47/47 PASS、pageErrors 0**。
