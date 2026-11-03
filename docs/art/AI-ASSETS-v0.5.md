# AI 素材清單與生成紀錄（v0.5）

> 產出：C（美術）· 2026-11-04 · 工具：本機 ComfyUI（`http://127.0.0.1:8188`）、Chrome headless、Python/Pillow
> 授權依據見 `docs/marketing/LEGAL.md` §4：只使用 `anima_pencil-XL-v4.0.0`（Fair AI Public License 1.0-SD，**輸出可商用**）；**未使用**被禁止販售圖像的 `animeScreencapStyle`。

## 1. 生成參數（全部素材共用）

| 項目 | 值 |
|---|---|
| checkpoint | `anima_pencil-XL-v4.0.0.safetensors`（SDXL finetune） |
| sampler / scheduler | `dpmpp_2m` / `karras` |
| steps / cfg | 30（hires 第二段 18 steps / denoise 0.45） |
| 解析度 | 一般 1344×768、直式 832×1216、超寬 1536×512 → LatentUpscale |
| negative | `text, letters, words, logo, watermark, signature, frame, border, blurry, lowres, jpeg artifacts, deformed, extra limbs, bad anatomy, oversaturated, flat vector, ui, hud` |
| 輸出原檔 | `H:\ComfyUI\output\etsea\`、`H:\ComfyUI\output\etsea-hires\`、工作區 `_art\raw\`（PNG） |
| 可重跑腳本 | `_dev\art\comfy.py`（一般生成）、`gen4.py`（hires／直式／超寬）、`compose.py`（品牌字＋capsule）、`title_update.py`（標題圖） |

## 2. 交付清單

### 2.1 遊戲內（標題畫面）

| 檔案 | 尺寸 | 說明 |
|---|---|---|
| `docs/art/title-art/title-1920x1080.webp` | 1920×1080 | 標題底圖（144.5KB）；hires 原生，非放大 |
| `docs/art/title-art/title-1280x800.webp` | 1280×800 | 1280 視窗版（69.4KB） |
| `docs/art/title-preview.html` | — | 合成預覽（18% 暗化＋CSS 漸層） |
| `style.css:150` | — | `#title` 漸層調亮（`.30/.52/.82`），配合新圖 |

接線方式見 `docs/art/TITLE-ART.md`（等 B 把 `drawIdleBG` 接上；目前尚未接線）。

### 2.2 商店／公關素材（`docs/art/store/`）

| 檔案 | 尺寸 | 用途 | 來源 |
|---|---|---|---|
| `logo-wordmark.png` | 1600×517（透明） | 標準字（中文主標＋英文副標） | Pillow 繪製（JhengHei Bold＋漸層＋青色外發光） |
| `main-capsule-1232x706.jpg` | 1232×706 | Steam 主 capsule | keyart-native + logo |
| `header-capsule-460x215.jpg` | 460×215 | Steam 頁首 capsule | keyart-native 裁切 + logo |
| `library-capsule-600x900.jpg` | 600×900 | Steam 遊戲庫直式 | 直式生成圖 + logo |
| `library-hero-3840x1240.jpg` | 3840×1240 | Steam 遊戲庫主視覺（無字） | 超寬生成圖升採樣 |
| `keyart-native-1920x1080.jpg` | 1920×1080 | press kit／itch 截圖首圖 | hires 原生 key art |

`_shots/C5/store/` 另有 1920×1080 實機截圖：`01-sea`、`01-base`、`01-launch-early`、`02-launch-late`、`01-moon`、`01-quests`、`02-extra`（賞金面板）。
`_shots/C5/00-title-art-preview-1920x1080.png` 是標題合成預覽。

## 3. 主要 prompt（可重跑）

```text
# keyart-native（標題與 key art 共用底圖，seed 62001）
epic cinematic key art, a lone diver silhouette standing on the water surface in the lower third,
looking up at a colossal alien mothership saucer hovering above the sea, thin cyan spotlight under
the ship, dark teal ocean with a path of moonlight, moody clouds, painterly matte painting, deep
teal and navy palette with cyan accents, dramatic composition, no text

# library capsule（直式，seed 62002）
vertical game poster composition, a lone diver in a worn diving suit with a harpoon gun in the lower
third, colossal alien mothership saucer looming in the upper half with a crimson beam, dark teal
ocean, floating plastic debris, painterly concept art, deep teal and navy palette, strong vertical
composition, no text

# library hero（超寬，seed 62003）
ultra wide panoramic cinematic shot of a dark teal ocean at dusk, a small alien mothership saucer
silhouette hovering above the horizon with a thin crimson beam, vast empty stormy sky, painterly
matte painting, deep teal and navy palette, panoramic composition, no text
```

其他候選（未採用）：`_art/raw/title-a…title-i`（雨天 UFO、極簡海平線、夕陽版等 9 張）、
`_art/raw/lib-hero`、`lib-capsule` 原始 PNG。採用理由：構圖留白給標題字、配色符合 `STYLE-v0.4.md` 的深海藍綠＋單一洋紅點綴。

## 4. 後處理

1. cover 裁切 → LANCZOS 縮放（`compose.py`）
2. 輕微分級：`sat 0.97–1.0 / contrast 1.02–1.05 / brightness 0.96–1.16`
3. 暗角（radial mask，`grade()` 之後）
4. 上下漸層 scrim，讓 logo 在縮圖也讀得到（main capsule 上 55% / 下 25%）
5. 標準字：`msjhbd.ttc` 逐字字距 → 遮罩上漸層 `#E8F8FF→#5ACDF5` → 16px 青色外發光；英文 `Bahnschrift` 字距 18
6. 輸出 JPEG q88–91（progressive）／WebP q82–84

> 標準字是用系統字型「柵格化」成圖片，不是散布字型檔，與 `LEGAL.md` §3「不打包 webfont」一致。

## 5. 還沒做（給 Lead 排 S1b）

1. **標題 canvas 接線**（B，`js/main.js:drawTitleArt`）——規格與程式碼片段已備好在 `TITLE-ART.md`。
2. **30 秒預告片**：需要 3 段錄影（基地縮時、BOT 出港、衛星光束），建議用 CDP 錄製。
3. **商店主圖去背版**（透明 logo 疊字分離），若 Steamworks 要求分開上傳 logo 層再補。
4. 英文版 logo（`ESCAPE THE SEA` 主標）——若要上 Steam 英文商店頁再做一版。
