# v0.7-C1：PWA 殼／EN 版面防護／觸控安全區

> 擁有者：C（美術／版面）。本輪只改 `style.css`、`index.html`、`docs/art/`，新增 `manifest.webmanifest`。
> 驗證截圖：`_shots/C8/`；實機量測用 CDP 9303（真 viewport、cache disabled）。

## 1. PWA 殼

### manifest.webmanifest（root）
| 欄位 | 值 |
|---|---|
| name | 逃出大海 Escape the Sea |
| short_name | 逃出大海 |
| description | 深海生存 × 基地建造 × 星際復仇（一句話） |
| lang / dir | zh-Hant / ltr |
| start_url / scope | `.` / `.` |
| display | standalone |
| orientation | landscape |
| background_color | `#02070d`（STYLE 的 abyss） |
| theme_color | `#02070d` |
| icons | 192 any、512 any、192 maskable、512 maskable |

### icons（`docs/art/pwa/`，PIL 生成，不用 ComfyUI）
- 來源：`docs/art/title-art/title-1920x1080.webp` 中央 1080×1080 裁切，Brightness 1.10／Contrast 1.06／Color 1.05。
- `icon-192.png`、`icon-512.png`：滿版方圖（purpose any）。
- `icon-maskable-192.png`、`icon-maskable-512.png`：內容縮到 80%、置中，底色 `#02070d`（安全圈內；Android mask 不切主體）。
- `apple-touch-icon-180.png`（iOS）、`favicon-32.png`（備用）。
- 預覽頁：`docs/art/pwa/preview.html`（截圖 `_shots/C8/06-pwa-icon-preview-1920.png`）。

### index.html
- `<meta name="theme-color" content="#02070d">`
- `<link rel="manifest" href="manifest.webmanifest">`
- `<link rel="apple-touch-icon" href="docs/art/pwa/apple-touch-icon-180.png">`
- `apple-mobile-web-app-capable` / `status-bar-style=black-translucent` / `apple-mobile-web-app-title`
- viewport 加 `viewport-fit=cover`（搭 `env(safe-area-inset-*)`）。
- Chrome `Page.getAppManifest`：url 正確、**errors 空**、解析到 4 個 icon。

## 2. EN 版面防護（真 `setLang('en')`，非假字串）

測試環境：1280×800、390×844、1920×1080；量 `scrollWidth > clientWidth` 與元素右界。

| 區塊 | 1280 | 390 | 1920 | 修法 |
|---|---|---|---|---|
| 資源列 4 chips | 126/126 | 167/167 | 126/126 | 資源列加寬到 264（chip 128）；`.chip i` 可省略號 |
| 任務卡 / 下一步 | 336/336、340/340 | 340/340 | 同 | `.quest>div`、`#nextstep span` `overflow-wrap:anywhere` |
| 賞金卡／按鈕 | 302/302、274/274 | 345/345、317/317 | 同 | `.card-h` 可換行、action 按鈕 `flex:1 1 120px`＋可換行 |
| 成就卡／tabs | 225/225、938/938 | 1 欄 348 | 同 | `.ach-name` 只留右側 badge 空間；desc 用整卡寬；卡片 `min-width:0` |
| 設定面板 | 658/658（modal 660） | 374（modal） | 660 | label `flex:0 1 150px`、toggle `min-width:72`、segmented 可換行 |
| 文件本身 | docSW 1280 | docSW 390 | 1920 | 390 無橫向溢出 |

另做「超長英文」壓力測試（`EN_LONG_TEST` 等級的 60+ 字元標題/描述，1920/390），已全部可換行、不截字；結果收在 `_shots/C8/` 早期的 simulated 組（已清掉，保留真 EN 組）。
注意：canvas 上的區域名（基地 1.3 km／巨獸 2.2 km）仍由 B 的 i18n 控制，本輪 CSS 不處理。

## 3. 觸控安全區（配合 D 的 `js/touch.js`）

契約（D 確認）：
- 啟用時 `body.classList.add('touch-ui')` ＋ `document.documentElement.dataset.touch='on'`；停用時移除。
- Overlay：`#touch-ui`（inset 0, z 8, pointer-events none）、`#touch-stick`（左半, auto）、`#touch-stick-base` 120px、`#touch-stick-knob`、`#touch-fire` 76px、`#touch-sprint` 64px。
- 底部安全帶 ≤180px。

CSS（style.css 末端）：
- `#hint` bottom `196px`（≤430 為 `188px`）＋`env(safe-area-inset-bottom)`。
- `#toasts` bottom `252px`（≤430 為 `244px`）。
- `#hud` `max-height:calc(100vh - 180px - env(...))`。
- selector：`body.touch-ui`、`body[data-touch="on"]`、`html[data-touch="on"]` 三種都吃。

實機量測（390×844，D 的 touch.js 啟用、`TOUCH.enabled=true`）：
- 安全帶頂端 = **664**（844−180）；`#hint` bottom **656**、`#toasts` bottom **600**、`#hud` bottom **403** → 全部在安全帶上方。
- 右下 `#touch-fire` bottom 820、`#touch-sprint` bottom 814；按下搖桿時 `#touch-stick-base`（y660–780）與 hint 僅 4px 間隔、不重疊。
- 截圖：`_shots/C8/16-touch-real-390.png`（待機）、`20-touch-joystick-390.png`（按住搖桿）。

## 4. 檔案變更
- 新增：`manifest.webmanifest`、`docs/art/pwa/*`（icon 6 檔＋`preview.html`）、`docs/art/PWA-EN-v0.7.md`。
- 修改：`index.html`（PWA meta/link、v0.7.0-alpha、STRINGS.js 於 core 後、touch.js 於 main 後、全 `?v=0.7.0`）、`style.css`（EN 保險＋觸控安全區；另修 `.ach-progress` 軌道可見度、`.ach` 內文寬度）。
- 未動：`js/`、git。

## 5. 驗證結果
- `node _dev/qa.mjs`：**43/43 PASS、pageErrors(0)**（含 settings 鍵盤 55→60、ach 24 卡、mobile 390 scrollW 390）。
- Chrome `Page.getAppManifest`：manifest URL 正確、**errors=[]**、4 icons。
- EN 真機 1280/390/1920 全部無 `scrollWidth>clientWidth`；390 `docSW=390`。
- 觸控真機：`TOUCH.enabled=true`、`body.touch-ui`＋`html[data-touch=on]`、安全帶內無重疊。

## 6. CSS pseudo content 的 i18n（B 回報後補）
`.card.mod[data-slot]::after` 等已是英文；真正會露中文的只有兩個 `content`，用 `html[lang="en"]` 覆寫：
- `.ach-top::before`：`成就` → `Achievements`（截圖 `_shots/C8/21-en-ach-pseudo-1920.png`）。
- `.card.bounty.ready .bounty-actions::before`：`✓ 可領取` → `✓ Ready`（截圖 `_shots/C8/22-en-bounty-ready-1920.png`）。
- 驗證（computed style）：en = `"Achievements"` / `"✓ Ready"`；zh = `"成就"` / `"✓ 可領取"`。
- ⚠️ service worker 是 cache-first：驗證 CSS 改動要 `Network.setBypassServiceWorker({bypass:true})`（或等 SW cache 版本 bump），否則會讀到舊 `style.css`。

## 7. 待辦／已知
- EN 下 canvas 內文字（雷達/區域標籤）還是 zh：等 B 把 canvas 文本改短 key（task-24 備註已列）。
- PWA 的 service worker 由 D 的 `js/sw.js` 提供；本輪只驗 manifest/icons/註冊點，離線快取由 D 驗。
