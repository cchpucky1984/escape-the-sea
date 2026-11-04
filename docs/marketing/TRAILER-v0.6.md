# 30 秒預告片腳本 v2（v0.6）

> 擁有者：E · 2026-11-04 · 片長 30.0s／1920×1080／60fps（剪輯用 24 或 30fps 均可）· 輸出 H.264 MP4（8–12 Mbps）
> 音樂：`docs/audio/` 的 ACE-Step 候選（授權見 `docs/marketing/LEGAL.md` §4–§5；使用前需人耳驗收，`AUDIO-SPEC.md` §5）
> 所有素材都是**實機畫面**（v0.6 新標題圖是唯一 AI 圖，標註 AI-generated）。重現指令見 §3。

## 1. 規格與節奏

- 1920×1080、30.0 秒整；字幕一律英文（另有 zh 字幕軌備用）。
- 節奏：**每 2.5–3.5 秒切一鏡**，共 11 顆；前 3 秒就要看到「飛碟＋潛水員」，第 17 秒前進到月球，最後 2 秒上 CTA。
- 音軌對點：0.0 進 `sea-a`（-18 LUFS）→ 17.0 切 `launch-b` → 20.0 切 `boss-a` → 28.5 收在環境音＋一聲低頻。
- 畫面內**不得出現滑鼠游標、Debug HUD、toast 疊字殘留**；所有字幕置中、白字黑邊、≤8 個英文字。

## 2. 逐秒分鏡

| 秒 | 鏡頭／畫面 | 素材（現有） | 重現方式（shot.mjs／qa.mjs） | 字幕（EN） | 音效點 |
|---|---|---|---|---|---|
| 0.0–3.0 | 黑場 0.4s → 新標題畫面（母船、月光、潛水員剪影）緩慢 push-in 1.03× | `_shots/C6/title-final-1920.png`（1920×1080） | `qa.mjs` 檢查 `boot: 標題畫面…`（截圖 `C6/qa/01-boot-canvas-JS-.png`）；或 `EXTRA_EVAL='ok' node shot.mjs title` | An alien ship blasts you into the sea. | `sea-a` 淡入；2.6s 一聲低沉 impact |
| 3.0–6.0 | 水下：玩家游過垃圾，磁力把瓶罐木箱吸成一串（橫向跟拍） | `_shots/E/02-sea-clean.png` | `node shot.mjs sea`（1280×800）；1920 版用 `VIEW_W=1920 VIEW_H=1080`；或 `qa.mjs` `pickup: 磁力自動收集…` | …and leaves you with nothing but trash. | 連續 `pick` 音；水聲墊底 |
| 6.0–8.5 | 基地平台一格格亮起（實機建造瞬間、安全圈擴張） | 需新錄（基地 build timelapse） | `qa.mjs` `build: 基地內建造成功、多一格`；錄 `__T.mountAll()` 逐座建造（每座間隔 120ms） | Trash becomes a base. | `build` 音 ×3；平台擴張 whoosh |
| 8.5–11.0 | 基地全景＋3 台 BOT 出港、砲塔開火 | `_shots/E/03-base.png`（面板）＋需新錄（實機基地外圈） | `qa.mjs` `build-pay`／`safe-zone`；或 `shot.mjs base` 拍面板作插入鏡 | …and the base grows by itself. | `bot` 高音；`shield` 低鳴 |
| 11.0–14.0 | 深海紫紅：巨獸剪影靠近、弱點核心發光（3 階段第一段） | 需新錄（`js/leviathan.js` 已接線） | `node shot.mjs sea` + `EXTRA_EVAL` 見 §3-B（把玩家傳到 `LEVIATHANS.list[0]` 旁） | Something in the deep woke up. | `boss` 低鳴；心跳低頻 |
| 14.0–17.0 | 賞金終端 H 面板：3 張合約、按下領取、數值跳動 | `_shots/B4/b4-bounty-panel.png`、`_shots/C4/02-1920-bounty.png` | `qa.mjs` `bounty: 賞金終端 → H 面板 → 擊殺進度 → claim`（截圖 `C4/02-1920-bounty.png`） | Kill. Salvage. Get paid. | UI 點擊＋`quest` 三連音 |
| 17.0–20.0 | 升空：火箭穿雲、隕石擦過、戰機被艦炮擊落（跟拍） | `_shots/C6/qa/08-launch.png`、`_shots/E/07-launch-action.png` | `qa.mjs` `launch: 零件齊全 → 升空場景…`；`node shot.mjs launch`（會拍 early/late 兩張） | Then you fly. | `launch-b` 進；點火轟鳴＋boom ×2 |
| 20.0–22.5 | 登艦：衝進母船機庫、砲火閃過機身 | `_shots/C6/qa/09-dock.png` | `qa.mjs` `dock: 登艦場景可操作` | Breach the hangar. | 警報；金屬撞擊 |
| 22.5–26.0 | 母船內部：艙壓條降到紅色、核心血條下降、衛星光束落下 | `_shots/C6/qa/10-moon.png`、`_shots/C6/qa/11-moon-boss.png`、`_shots/E/11-moon-beam.png` | `qa.mjs` `moon`／`moon-boss`／`moon-survive`（艙壓＝100，素裝可吃 16 次） | Fight the core. Stay alive. | `boss-a`；每發命中 tick |
| 26.0–28.5 | 核心爆炸閃白 → 同盟軍戰機進場 → 玩家撤離 | `_shots/C6/qa/12-ending.png`、`_shots/E/10-moon-alliance.png` | `qa.mjs` `moon-boss` 的 `shot('ending')`；或 `__T.showEnding(true)` 後截圖 | …and settle the score. | win 和弦；白光 whoosh |
| 28.5–30.0 | End card：logo `docs/art/store/logo-wordmark.png`＋「WISHLIST / PLAY THE DEMO」＋平台 | `docs/art/store/logo-wordmark.png` | 剪輯軟體合成（不用程式截圖） | WISHLIST NOW · DEMO AVAILABLE | 環境音收尾；最後 0.2s 靜音 |

## 3. 捕捉與重現（可直接跑）

**前置（每次開機一次）**
```powershell
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\_dev'
# 1) 靜態伺服器（若沒開）：python -m http.server 5173 --bind 127.0.0.1
# 2) 專用 Chrome（E 用 9305）
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars','--remote-debugging-port=9305',`
  "--user-data-dir=$env:TEMP\cdp-9305",'about:blank'
Start-Sleep 4
$env:CDP_PORT='9305'; $env:OUT_DIR='H:\DeepSeek\PROJECT\PROGRAMM\_shots\E\trailer1920'
$env:VIEW_W='1920'; $env:VIEW_H='1080'
```

**A. 靜態鏡頭（標題／海面／基地／裝備／升空／母船）**
```powershell
$env:EXTRA_EVAL="'ok'"; node shot.mjs title      # 標題（要 EXTRA_EVAL 才會截圖）
node shot.mjs sea; node shot.mjs base; node shot.mjs craft
node shot.mjs launch; node shot.mjs dock; node shot.mjs moon
```

**B. 巨獸特寫（`__T` 注入，leviathan.js 已在 sea.js 接線）**
```powershell
$env:EXTRA_EVAL=@'
(() => {
  const L = window.LEVIATHANS && LEVIATHANS.list[0];
  if (!L) return 'no-leviathan';
  const P = __T.sea.player;
  P.x = L.x + 260; P.y = L.y + 180; P.inv = 0; P.ox = 100;
  __T.sea.cam.x = P.x - 960; __T.sea.cam.y = P.y - 540;
  return 'leviathan: ' + L.id + ' hp ' + L.hp;
})()
'@
node shot.mjs sea
```

**C. 賞金面板（qa 一步到位）**
```powershell
node _dev\qa.mjs          # 跑到 bounty 檢查時自動存 _shots\qa\（或直接重拍見 STORE 文件）
```
> `qa.mjs` 會輸出到 `_shots\qa\`；本次 v0.6 的 37 項截圖在 `_shots\C6\qa\`。要 1920 版就改 `VIEW_W/VIEW_H` 後重跑同一支（qa.mjs 支援同一組環境變數；若未支援，用 `shot.mjs` + `__T.openBounty()`）。

## 4. 還缺的鏡頭（3 段錄影，剪輯前要補）

1. **基地縮時**（6.0–8.5）：乾淨存檔 → `__T.give('plastic',9999); __T.give('wood',9999); __T.give('metal',9999); __T.give('alloy',99)` → 逐座 `__T.addStructure('net')` 等，每 120ms 一座，錄 8 秒。
2. **BOT 出港／砲塔開火**（8.5–11.0）：基地外緣繞圈 6 秒，讓 3 台 BOT 離港、砲塔打怪；錄 1280×800 可，後期放大到 1920。
3. **巨獸 3 階段**（11.0–14.0）：用 §3-B 的注入法，錄 10 秒（含階段轉換特效 `phaseFx`）。
> 這 3 段是 v0.6 唯一還缺的實機動態素材；沒有就先用靜圖 Ken Burns（推 1.05–1.12×）頂著，不要用概念圖假裝實機。

## 5. 音樂與授權對點

- 0–17s：`sea-a.mp3`（64 BPM / A minor，-18.0 LUFS，主選）；17–20s：`launch-b.mp3`（116 BPM / D minor，主選）；20–28.5s：`boss-a.mp3`（136 BPM / E minor，主選）；28.5–30s fade out。
- 三首都由 ComfyUI + ACE-Step 1.5 生成（Apache-2.0 模型、輸出專案自有）；成片要在描述欄加「Music generated with ACE-Step」並連到 `LEGAL.md`。
- 生成紀錄（model/seed/BPM/tags）在 `docs/audio/AUDIO-SPEC.md` §1–§2；剪輯前先人耳驗收，若 `boss-a` 不夠厚就換 `boss-b`（132 BPM）並把 BPM 圖表更新。

## 6. 交付清單

- [ ] 30.0s 成片 MP4（1920×1080、H.264 8–12Mbps）＋字幕檔（EN／zh-Hant 各一）
- [ ] 無游標、無 toast 殘留、無 Debug HUD、無 AI 概念圖混充實機
- [ ] 音樂三軌對點完成；描述欄含 AI 音樂揭露與 `LEGAL.md` 連結
- [ ] End card 的 itch／Steam 連結與 `STORE-v0.6-EN.md` 一致
- [ ] 封面幀（0.0s 標題圖）另存 1280×720 給 itch 影片縮圖
