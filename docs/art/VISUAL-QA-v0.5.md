# 商業級視覺差距清單（VISUAL-QA v0.5）

> 產出：C（美術）· 2026-11-04 · 依據：`_shots/C6/`（390／1280／1920 標題）、`_shots/C5/store/`（7 張 1920 實機）、`docs/art/STYLE-v0.4.md`
> 判準：以「itch.io／Steam 商業頁面上看到會不會覺得是學生作品」為尺。每項標 P0–P3 與擁有者。

## 0. 本輪已修（可直接驗收）

| 問題 | 修法 | 驗證 |
|---|---|---|
| 標題畫面只有暗色程序背景、沒有主視覺 | `style.css` 用 CSS 背景吃 ComfyUI 1920 key art（`#title` + `body[data-scene="title"] #cv{opacity:0}`） | `_shots/C6/title-final-1280.png`、`-1920.png` |
| 390 手機標題文字被裁切（英文副標、簡介、操作列） | `@media (max-width:430px)` 重排：`max-width:100%`、`overflow-wrap:anywhere`、`br{display:none}`、字級降一級 | `_shots/C6/title-final-390.png`：`bodyScroll=390`、無裁切 |
| kicker（海洋生存 · 基地建造 · 星際復仇）壓在飛碟亮邊上 | `#title` 加 `radial-gradient` 中央柔化層 | 1280 截圖目視可讀；QA 37/37 |

## 1. 仍待修（依 ROI 排序）

| 優先 | 問題 | 為什麼影響商業感 | 建議 | 擁有者 |
|---|---|---|---|---|
| **P1** | **結局畫面（`#ending`）沒有任何視覺**：純文字＋暗底 | 玩家最後看到的一頁是「完成證明」，商業作品一定放 key art／統計卡 | 用 ComfyUI 產一張「月球軌道、母船爆炸後的逃生艙」1920 底圖，套 `#ending::before`，統計卡做成玻璃卡 | C（圖+Css） |
| **P1** | 標題主視覺**首次載入會閃**（144KB webp 在 CSS 之後才抓） | 實機第一次進站會看到 0.2–0.5s 暗底 | `index.html` 加 `<link rel="preload" as="image" href="docs/art/title-art/title-1280x800.webp" media="(max-width:1440px)">`＋1920 版；或把圖轉成 CSS inline 的 base64（不建議） | C（HTML） |
| **P2** | 遊戲內「升空／登艦」場景偏空：星野＋少量隕石 | 第二、三幕是玩家最期待的高潮，畫面卻最單薄 | canvas 加：地球弧光、星雲色帶、殘骸漂浮層、母船剪影漸近；不需要新圖，純程序 | B/D |
| **P2** | 母船內部牆面是平面網格，沒有縱深 | 決戰舞台看起來像 debug 場景 | 加 2 層視差牆板、地面反光、警報燈掃描 | D（`space.js`） |
| **P2** | 商店截圖的 HUD 在 1920 空很多（左上一疊、右下雷達） | Steam 頁縮圖會顯得空 | 拍圖時用 `__T` 補滿基地/艦隊＋選高資訊量鏡頭（B3 腳本可再用） | E/C |
| **P3** | 按鈕只分 primary/ghost，缺 hover／active 微互動 | 商業作品的手感細節 | CSS `:hover{transform:translateY(-1px)}`、`:active{transform:none}`、focus-visible ring | C |
| **P3** | 載入中沒有 loading／skeleton | 首頁字型與圖載入時文字會跳動 | 用 `font-display:optional`？不載 webfont 時影響小；可加 0.3s 淡入 | C |
| **P3** | 部分中文標點在窄容器斷行（「——」開頭） | 排版細節 | `.blurb` 加 `line-break:strict`／`text-wrap:pretty` | C |

## 2. 商店素材現況（`docs/art/AI-ASSETS-v0.5.md`）

- 已有：main capsule 1232×706、header 460×215、library 600×900、hero 3840×1240、1920 key art、透明 logo、7 張 1920 實機、標題預覽
- 缺：**30 秒預告**（需 3 段錄影：基地縮時／BOT 出港／衛星光束）、**英文版 logo**（`ESCAPE THE SEA` 主標）、**Steam 活動頁用的 GIF**（1–2 個 <8MB）

## 3. 驗收方式

1. `node _dev/qa.mjs` 全綠（目前 37/37、pageErrors 0）
2. 三尺寸標題截圖：390／1280／1920，`bodyScroll <= innerWidth`、標題與簡介可讀
3. 商店縮圖測試：把 main capsule 縮到 231×132 仍能讀出中文標題（目前可，logo 字重夠）
4. 對比：正文 ≥4.5:1（`STYLE-v0.4.md` §2 已列）
