# 標題畫面 key art 接線規格（v0.5，2026-11-04 更新）

> 給 B（`js/main.js` 的 `drawIdleBG`）｜產出：C（美術）
> 可視化預覽：`docs/art/title-preview.html`、截圖 `_shots/C5/00-title-art-preview-1920x1080.png`
> 本輪**不直接改 js**；以下程式碼片段可直接貼。

## 1. 檔案（2026-11-04 換圖：ComfyUI hires 原生 1920）

| 檔案 | 尺寸 | 容量 | 用途 |
|---|---|---|---|
| `docs/art/title-art/title-1920x1080.webp` | 1920×1080 | 144.5KB | 1920 視窗／商店素材／高解析 |
| `docs/art/title-art/title-1280x800.webp` | 1280×800 | 69.4KB | 1280 視窗／低記憶體 |

- 來源：ComfyUI `anima_pencil-XL-v4.0.0`，prompt 見 `docs/art/AI-ASSETS-v0.5.md`（seed 62001，1536×864 生成 → LatentUpscale 1920×1080 + 18 steps denoise 0.45 hires-fix）。
- 構圖：外星母船在中上、月光、潛水員剪影在下方海面——標題字壓在船身暗部，潛水員在按鈕下方。
- 兩張都 < 400KB；1920 版解碼後約 8.3MB 記憶體，只載入一次。

## 2. 合成順序（重要）

```
1) drawImage 底圖（cover）
2) 18% 暗化 rgba(2,7,13,.18)      ← 2026-11-04 由 40% 下調，因為換成更亮的新圖
3) #title 的 CSS 漸層（style.css:150，已同步調整為 .30 / .52 / .82）
4) 標題 DOM（h1 / blurb / buttons，pointer-events 照舊）
```

- 對比量測（底圖 + 18% 暗化 + 新 CSS 漸層，取各區平均背景色 vs 文字色）：
  - 標題字區 `#BFF4FF` **15.5:1**
  - 簡介區 `#9FC0D0`（小字）**8.2:1**
  - 操作列 `#9FC0D0`（小字）**5.8:1** ← 最低，仍 > 4.5:1
- 若 B 決定移除 `#title` 的 CSS 漸層，暗化要回到 **35–40%**。
- 只套用在 `game.scene === 'title'`；intro／ending 維持現有程序背景。

## 3. 給 B 的 `drawIdleBG` 接線（可直接貼）

```js
/* 模組層（main.js 頂端常數區） */
const TITLE_BG = new Image();
let titleBgReady = false;
TITLE_BG.onload = () => { titleBgReady = true; };
TITLE_BG.src = 'docs/art/title-art/title-1920x1080.webp?v=0.5.0';

/* 在 drawIdleBG(dt) 的最前面呼叫；回傳 true 代表底圖已接手背景 */
function drawTitleArt() {
  if (!titleBgReady || game.scene !== 'title') return false;
  const iw = TITLE_BG.naturalWidth, ih = TITLE_BG.naturalHeight;
  const sc = Math.max(VW / iw, VH / ih);            // cover：不留黑邊
  const dw = iw * sc, dh = ih * sc;
  ctx.drawImage(TITLE_BG, (VW - dw) / 2, (VH - dh) / 2, dw, dh);
  /* 18% 暗化（新圖較亮；量測見 §2） */
  ctx.fillStyle = 'rgba(2,7,13,.18)';
  ctx.fillRect(0, 0, VW, VH);
  return true;
}

/* drawIdleBG 開頭 */
function drawIdleBG(dt) {
  bgT += dt;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const hasArt = drawTitleArt();          // 新增這行
  if (!hasArt) {
    /* …現有程序漸層／星空／落日（fallback 不變）… */
  }
  /* 若 hasArt：可保留少量星光，alpha 乘 0.45 */
}
```

- `VW/VH` 用 CSS px（main.js 已 `setTransform(DPR…)`），不要乘 DPR。
- 載入失敗（檔案缺失／離線快取沒更新）→ `titleBgReady=false`，自動回退現有程序背景。
- 快取：路徑帶 `?v=0.5.0`，與 `index.html` 其他 `?v=` 同步；Lead 發版時一起改。
- **目前 `js/main.js` 尚未接線**（grep 無 `drawTitleArt` / `TITLE_BG`），這張圖現在只有 `title-preview.html` 看得到。

## 4. 驗收

1. 1280×800 與 1920×1080 標題畫面：飛碟、月光、潛水員、海平線可見，標題字／簡介字對比 ≥4.5:1（§2 已量測，最低 5.8:1）。
2. 首帧不能黑屏：圖片未載入時仍看得到程序背景（fallback）。
3. `pageErrors` none；`title`→`sea` 切換不重畫底圖（只在 title 場景呼叫 drawImage）。
4. 可對照預覽：`_shots/C5/00-title-art-preview-1920x1080.png`（合成順序與 §2 相同）。
