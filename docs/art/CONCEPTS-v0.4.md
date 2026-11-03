# 逃出大海 v0.4 · 概念圖與商店素材（CONCEPTS）

> 產出：C（美術）· 2026-11-04 · 工具：本機 ComfyUI 0.43（`_dev\comfy\comfy.mjs`，RTX 4070 Ti 12.8GB）
> 圖檔：`docs/art/concepts/*.webp`（1216×832，每張 ≤300KB）；原 PNG：`_shots/C3/concept-*.png`；商店候選：`_shots/C3/store/`
> 對照：`docs/art/STYLE-v0.4.md`（色票／風格）。本輪只產出概念與素材，**沒有**改 `js/`、`index.html`、`style.css`。

## 1. 生成參數（全部一致）

- ckpt：`anima_pencil-XL-v4.0.0.safetensors`；sampler `dpmpp_2m` + `karras`；steps 26；cfg 7。
- 概念圖 1216×832；商店 key art 1344×768（再裁切，見 §5）。
- 負面 A（01／04／06）：`border, frame, white margin, letterbox, text, letters, logo, watermark, signature, blurry, lowres, jpeg artifacts, deformed, extra fingers, bad hands, extra limbs`
- 負面 B（02／03／05／07／08）：負面 A ＋ `pink sky, magenta sky, neon, synthwave, purple, over-saturated, black bars, writing, symbols`
- **重現驗證**：`concept-02-deepsea` 用同 ckpt／同尺寸／同 seed 41031 重跑，PIL 逐像素比對 **pixel-identical**（md5 `e634829559ab03188b75e1313dedf1d0`）。同版本 ComfyUI 下同 seed 可重現。
- 統一公式：`[主體] + [環境／光源] + painterly game concept art + [色票句] + no text`
  色票句固定 `muted teal and deep navy palette, warm amber accents`；外星場景改 `violet and cyan light accents`。

## 2. 八張概念圖（檔名／seed／用途／色票）

| # | 檔名 | seed | 用途 | 對應色票 |
|---|---|---|---|---|
| 1 | `01-nearshore.webp` | 41011 | 近海區：漂流垃圾＋日光穿透（商店截圖候選） | `#0F5A72` `#6FE3FF` `#FFD166` `#E0A95F` |
| 2 | `02-deepsea.webp` | 41031 | 遠洋／深海壓迫感（海域分層、鯊魚題材） | `#041827` `#08303F` `#6FE3FF` `#02070D` |
| 3 | `03-base.webp` | 41032 | 基地平台全景（木平台＋太陽能板＋BOT） | `#0F5A72` `#E0A95F` `#CFD9E6` `#FFD166` |
| 4 | `04-reactor.webp` | 41014 | 母船反應爐艙（核心房） | `#B892FF` `#FF4FD8` `#6FE3FF` `#02070D` |
| 5 | `05-leviathan.webp` | 41033 | 深海巨獸（S1b 四角守衛升級版） | `#08303F` `#0F5A72` `#6FE3FF` `#02070D` |
| 6 | `06-launch.webp` | 41016 | 火箭升空逃離海面 | `#0F5A72` `#FFD166` `#E0A95F` `#6FE3FF` |
| 7 | `07-title-keyart.webp` | 41034 | 標題 key art（UFO 剪影＋海平線） | `#0F5A72` `#8FB3C4` `#6FE3FF` `#02070D` |
| 8 | `08-diver.webp` | 41035 | 玩家潛水員半身設定 | `#0F5A72` `#FFD166` `#E0A95F` `#6FE3FF` |

## 3. 逐張 prompt（可直接重跑；`--name` 前綴對應 `_shots/C3/raw/`）

```text
01-nearshore  seed 41011  underwater shallow sea at dusk, sun rays through teal water, plastic bottles and wooden crates drifting in the current, small silver fish, painterly game concept art, muted teal and deep navy palette, warm amber accents, no text
02-deepsea    seed 41031  deep underwater scene, huge dark shark gliding through deep teal water, god rays from the surface far above, tiny diver silhouette in the distance, painterly game concept art, cold navy and teal palette, ominous pressure, no text
03-base       seed 41032  small makeshift floating base built from wooden planks and scrap metal, one solar panel, tiny turret, small bot boat moored, dark teal sea at dusk, painterly game concept art, muted teal palette, small warm wood accents, no text
04-reactor    seed 41014  alien mothership interior reactor chamber, glowing magenta reactor core, dark metal ribs, violet and cyan light accents, ominous atmosphere, painterly game concept art, no text
05-leviathan  seed 41033  deep sea leviathan, enormous dark silhouette with faint cyan bioluminescent patterns swimming below a tiny diver, deep underwater, painterly game concept art, cold teal and navy palette, no text
06-launch     seed 41016  rocket launching from a floating ocean platform, bright exhaust glow reflected on dark teal sea, spray and steam, dusk sky, painterly game concept art, teal and amber palette, no text
07-title      seed 41034  dramatic title key art, dark alien saucer silhouette high above a teal ocean at dusk, thin pale magenta light under the hull, lone diver silhouette in the water below, painterly game concept art, muted teal and navy palette, magenta only as a small rim light, overcast sky, no text
08-diver      seed 41035  character concept art, bust portrait of a lone diver, plain teal wetsuit without logos, glass bubble helmet with a warm headlamp, harpoon over the shoulder, dark teal ocean background, painterly game concept art, muted teal palette, warm amber accents, no text
```

```powershell
# 重跑任一張（在 _dev\comfy）：
node comfy.mjs --prompt "<上面那行>" --neg "<負面 A 或 B>" --ckpt anima_pencil-XL-v4.0.0.safetensors `
  --w 1216 --h 832 --steps 26 --cfg 7 --seed <seed> --name <前綴> --out "H:\DeepSeek\PROJECT\PROGRAMM\_shots\C3\raw"
```

## 4. 可進遊戲 vs 只能當參考

| # | 可進遊戲（可直接翻成 canvas/CSS） | 只能當參考 |
|---|---|---|
| 1 | 光柱角度（由上往下 15° 斜射）、木箱/瓶的暖木色、水面碎光 | AI 筆觸質感、魚群數量 |
| 2 | 三層水色（`#041827→#08303F→#0F5A72`）、鯊魚剪影輪廓 | 鯊魚細節與牙齒 |
| 3 | 木平台拼接、太陽能板深藍面、BOT 小艇比例 | 透視與結構（不能直接建模） |
| 4 | 環形核心＋同心圓燈帶（canvas 圓環＋徑向漸層）、洋紅單一焦點 | 全部幾何細節（只能當氛圍） |
| 5 | 巨大剪影＋青色生物光斑點（粒子）、潛水員比例尺 | 生物解剖 |
| 6 | 升空光柱、海面倒影、暖色逆光 | 火箭細節 |
| 7 | 飛碟剪影 + 海平線構圖 + 單一洋紅光點（標題畫面可照此重繪） | 雲層筆觸 |
| 8 | 頭盔比例、青綠潛水衣＋琥珀色頭燈、魚槍 | 動漫臉（遊戲內玩家只是小氣泡，不用這個臉） |

## 5. 商店／社群素材（`_shots/C3/store/`，2 候選 × 4 尺寸）

| 尺寸 | 檔案 | 來源／裁切 |
|---|---|---|
| 1920×1080 | `keyart-1920x1080-a.png`／`-b.png` | key-03（有潛水員）／key-05（空景）LANCZOS 放大 1.43× |
| Steam 616×353 | `steam-capsule-616x353-a.png`／`-b.png` | 16:9 直接縮 |
| itch 630×500 | `itch-cover-630x500-a.png`／`-b.png` | 5:4 中央裁切（原 1344×768 取 968×768） |
| GitHub 1280×640 | `github-social-1280x640-a.png`／`-b.png` | 2:1 中央裁切（原 1344×672） |

- 商店 key art 原圖：`_shots/C3/raw/key-03-01.png`（seed 42021）、`key-05-01.png`（seed 42031），皆 1344×768：

```text
key-03  seed 42021  cinematic key art, dark alien saucer silhouette high above a dark teal ocean at dusk, thin pale magenta light under the hull, lone diver silhouette in the water below, painterly game concept art, muted teal and navy palette, magenta only as a small rim light, wide composition, no text
key-05  seed 42031  cinematic key art, alien saucer hovering low above a dark teal ocean at dusk, its reflection rippling on the water, dark storm clouds, empty sea with no people, painterly game concept art, muted teal and navy palette, faint magenta underglow, no text
```

- key-03 負面用 B；key-05 負面：`person, people, human, silhouette, figure, text, letters, logo, watermark, border, frame, black bars, neon, synthwave, pink sky, blurry, lowres`。
- 1920×1080 目前是「放大候選」；正式上架建議原生 1920 生成或外部放大（本輪沒做，SDXL 16:9 直出細節會掉）。

## 6. 一致性公式（S1b 要更多圖時照這個）

- **角色**：固定句 `character concept art, bust portrait of a lone diver, plain teal wetsuit without logos, glass bubble helmet with a warm headlamp, harpoon over the shoulder`；只換背景與 seed（41036–41045），**不要**改色票句。
- **場景**：固定句 `painterly game concept art, muted teal and deep navy palette` ＋ 構圖詞（`wide shot`／`low angle`／`silhouette`）；同一場景只換 seed。
- **外星**：只允許一個洋紅光源（`single magenta reactor core` 或 `thin pale magenta light`），其餘用 cyan rim light。整張洋紅會變 synthwave（key-01／02／04 已淘汰）。
- **不要**在 prompt 寫任何文字、UI、標誌；文案一律留給 canvas/CSS（`STYLE-v0.4.md` §7）。

## 7. 已知限制／踩雷

- `sulphur_dev_fp8mixed` **不能用**：`CLIPTextEncode` 回 `clip input is invalid: None`（ckpt 不含可用 text encoder，`comfy.mjs` 的 SDXL workflow 不適用）；本輪全用 `anima_pencil-XL`。
- `20240503 animeScreencapStyle` 會把基地畫成寫實鑽油平台（`_shots/C3/raw/test-animecap-01.png`），風格不符未採用。
- 1024×576 常出現印刷邊框（`_shots/C3/raw/concept-a3-01.png`）；統一改 1216×832 後消失。
- 模型亂入：飛碟頂站人（`raw/key-04-01.png`）、潛水衣亂碼字（`raw/concept-h-diver-01.png`）、多鰭鯊魚（`raw/concept-b-deepsea-01.png`）→ 已重抽或淘汰，最終 8 張無文字、無明顯解剖錯誤。
- 全部圖檔：`concepts/` 8 張 webp 26–145KB（≤300KB）；`_shots/C3/` 8 張原 PNG；`store/` 8 張商店候選；`raw/` 保留全部生成與淘汰圖（含 `repro-check`）。
