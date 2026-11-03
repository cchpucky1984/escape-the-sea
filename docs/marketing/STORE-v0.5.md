# 商店頁定稿（v0.5 / 目標 v1.0 發售）

> 擁有者：E · 2026-11-04 · 依據 `docs/PRODUCT-v1.0.md` 支柱 F（發售準備）
> 狀態：文案可用；**素材尚未到齊**（缺 steam 主 capsule／hero／logo、缺原生 1920 key art、缺 5 張 1920×1080 實機截圖、缺 30 秒預告）。
> 定價策略更新：S0 的「itch 免費」建議作廢——PRODUCT v1.0 假設為一次性買斷 **US$2.99–4.99**；本文件建議 itch **US$2.99**、Steam **US$3.99**，另開一個「前 15 分鐘試玩」免費頁導流。

## 1. 定位與商店標語

- 標題：**逃出大海 Escape the Sea**
- 一句話：**撿垃圾、造基地、把外星母船打下來。**
- 英文 tagline：**Scavenge the sea. Grow a base. Take the fight to the moon.**
- 類型：單機 HTML5 動作生存 × 基地建造 × 輕射擊；**一輪 90–150 分鐘**（PRODUCT 目標；S1b 後以實測為準）
- 目標玩家：短時間想破一款小品的人／喜歡自動化數字成長的人／想玩生存但怕永久死亡的人。

## 2. itch.io 上架包（照 itch 表單欄位排）

**Title**：逃出大海 Escape the Sea
**Project URL**：`escape-the-sea`（`[待定]` itch 帳號）
**Tagline（≤160 字）**：在海上撿垃圾，造一座會長大的基地，然後飛上月球把外星母船拆了。

**Short description（欄位上限 160 字；本稿 88 字，可直接貼）**
> 外星飛船把你打落海。收集漂流垃圾、造一座會長大的自動化基地、升級魚槍、組裝太空船飛上月球，把母船打下來。單機 HTML5，免安裝，一輪 90–150 分鐘。

**Classification**：Game → **Action**（次要 Adventure）
**Made with**：`HTML5 / Canvas 2D`（自製引擎，無框架）
**Platforms**：HTML5（瀏覽器）＋ Windows／macOS／Linux（任何現代瀏覽器）
**Languages**：繁體中文（預設）· English（v0.8）
**Status**：In development（Coming soon）
**Content warnings**：Mild violence（擊毀外星機器與外星人、爆炸）；**AI-generated assets: Yes**（概念圖／key art；見 LEGAL §4）
**Pricing**：US$2.99 買斷；**前 15 分鐘試玩頁**免費；[待定] 首發 −20%（US$2.39）7 天。

**Long description（itch 支援簡單 HTML；以下可直接貼）**
> 外星飛船的一炮把你打進海裡，暗湧把你沖到看不見岸的地方。海面上只有垃圾——但垃圾就是材料。
>
> 游出去撿漂流垃圾 → 按 B 在平台上蓋建築，每蓋一座平台就多一格、安全圈就大一圈 → 造 BOT 船塢，黃色小艇會自己出海把物資載回來 → 造裝備房，把蛙鞋、氧氣瓶、潛水衣、磁力收集器、壓縮魚槍一路升滿 → 湊齊 4 個零件、造出太空船 → 發射。
>
> 升空後 A/D 閃隕石、W 加速；外星戰機來攔截，艦上防禦炮自動反擊。衝進月球軌道上的母船機庫，打穿兩波守軍，面對反應爐核心。核心掉到 50% 時，地球同盟軍第三艦隊會殺進來跟你一起打——然後你的逃生艙會被護著離開。
>
> **一輪 90–150 分鐘、有明確結局、可重玩**：賞金合約、魚槍模組、深海巨獸與深海裂縫（v0.5 內容深度）讓每一輪的路線不一樣。
>
> **沒有安裝、沒有連線、沒有廣告、沒有內購**：打開網頁就能玩，進度存在你自己的瀏覽器。美術與音效全部即時生成。

**5 特色（itch 條列，可直接貼）**
1. **會長大的基地**：每座建築都在平台上佔一格，安全圈隨之變大；圈內自動補給、敵彈被護盾吸收、怪被推出去。
2. **真的會做事的自動化**：收集網／分解工坊／逆向工程被動產資源，BOT 自己出海、載滿 8 件回基地卸貨。
3. **越遠越肥**：近海→外海→深海→遠洋四區，資源與威脅同步上升，四角守衛掉科技碎片。
4. **裝備就是你的火箭**：蛙鞋＝速度、魚槍＝火力、潛水衣＝裝甲、護盾科技＝升空減傷；魚槍沒滿級在母船內傷害只剩 10%。
5. **90–150 分鐘的完整曲線**：撿垃圾 → 建基地 → 賞金合約 → 升裝備 → 升空 → 登艦 → 母船決戰 → 結局。

**Tags（itch）**：`singleplayer` `action` `survival` `base-building` `underwater` `sci-fi` `html5` `exploration` `shooter` `short`
**Cover image**：`_shots/C3/store/itch-cover-630x500-a.png`（630×500，來源見 §5）
**Screenshots（itch 至少 5 張，16:9 優先；等 1920 重拍）**
| # | 檔案（現有 1280×800） | 說明（zh／en） |
|---|---|---|
| 1 | `_shots/E/02-sea-clean.png` | 海面收集／Collecting trash at sea |
| 2 | `_shots/E/03-base.png` | 基地面板：19 座建築、安全圈 486m／Base panel |
| 3 | `_shots/E/04-craft-upgrade.png` | 裝備升級＋火箭科技／Gear & rocket tech |
| 4 | `_shots/E/07-launch-action.png` | 升空：戰機與隕石／Launch under fire |
| 5 | `_shots/E/11-moon-beam.png` | 衛星光束打核心／Orbital beam on the core |

**Uploads**：itch HTML5 需要 zip（含 `index.html`、`js/`、`style.css`、`start.bat` 可留）；把 `docs/`、`_shots/` 排除。約 <300KB 程式碼＋素材，上傳前用 `Compress-Archive` 打包（Lead 執行，E 不碰發版流程）。
**Devlog #1（上架當天發，可直接貼）**
> **〈我們把整片海做完了〉**
> 這款遊戲的起點是一個很簡單的問題：如果被外星人打到海裡，你只剩垃圾，能不能靠垃圾造一艘火箭？
> v0.5 我們把「垃圾 → 基地 → 火箭」的曲線補完了：賞金合約讓戰鬥能換合金、魚槍模組讓 Build 有選擇、深海巨獸讓遠洋不再只是數字變大。
> 商店頁今天開，試玩版是前 15 分鐘。如果你玩到「第一次被鯊魚咬」或「基地第一次自動產資源」，歡迎留言告訴我哪一刻最有感。 — E／行銷

## 3. Steam 願望清單頁草稿

> 前提：Steam 版需要桌面打包（Electron／Tauri），**不在 v0.5 範圍**；先開願望清單頁收集關注，等 v0.7 平台化再送審。

**Short description（Steam 上限 300 字元；本稿 112 字元）**
> 被外星飛船打落海的你，只有滿海的垃圾。收集、建造會自動成長的海上基地、派出 BOT 艦隊、升級魚槍與潛水裝，最後組裝太空船飛上月球與母船決戰。單機 HTML5 動作生存小品，繁體中文＋英文，一輪 90–150 分鐘。

**Long description（Steam 編輯器 BBcode，可直接貼）**
> [b]撿垃圾，造基地，把帳算清楚。[/b]
> 外星飛船的巨炮把你打落海。醒來時岸不見了，只剩滿海漂流垃圾——而垃圾就是材料。
> [b]會長大的基地[/b]
> 每建造一座建築，海上平台就多一格、安全圈就大一圈。圈內你不會受傷、氧氣與生命自動補給、敵人的子彈被護盾吸收。
> [b]真的會做事的 BOT 艦隊[/b]
> 每座 BOT 船塢派出一台黃色小艇，自己出海找垃圾、載滿 8 件回基地卸貨；防禦炮塔 360 度自動開火。
> [b]越遠越肥，也越危險[/b]
> 近海、外海、深海、遠洋四區；四角的守衛掉「科技碎片」，集滿 4 塊才能研發火箭護盾。v0.5 起再加賞金合約、魚槍模組、深海巨獸與深海裂縫。
> [b]你的裝備，就是你的火箭[/b]
> 蛙鞋決定火箭速度、魚槍決定艦炮火力、潛水衣決定裝甲。魚槍沒到 Lv3 打不穿戰機護盾，沒滿級在母船內傷害只剩 10%——升級不是選項，是門票。
> [b]有結局的 90–150 分鐘[/b]
> 升空閃隕石 → 衝進母船機庫 → 兩波守軍 → 反應爐核心。核心掉到 50%，人類同盟軍進場；裝了衛星光束發生器，還能在 90% 與 10% 各吃一發軌道光束。

**Steam 標籤**：`Singleplayer` `Action` `Survival` `Base Building` `Space` `Underwater` `Sci-fi` `Shoot 'em up` `Crafting` `Short`
**分類**：Action, Adventure, Indie；**語言**：繁體中文（介面／字幕）、英文（v0.8）。
**Capsule 需求尺寸清單（現況 → 誰補）**
| 用途 | 尺寸 | 現況 | 備註 |
|---|---|---|---|
| Main capsule | 1232×706 | ❌ 缺 | 需含 logo；由 key art 重構 |
| Small capsule | 616×353 | ✅ `steam-capsule-616x353-a.png` | 已選 a（§5） |
| Header capsule | 460×215 | ❌ 缺 | 從 main 裁切＋重新排版 |
| Library capsule | 600×900 | ❌ 缺 | 直式，需新構圖（潛水員＋母船） |
| Library hero | 3840×1240 | ❌ 缺 | 需原生寬幅；不可用 1920 放大 |
| Logo | 1280×720（透明 PNG） | ❌ 缺 | 中文「逃出大海」＋英文 wordmark |
| Screenshots | 1920×1080 ×5 | ⚠️ 現有 1280×800 | 用 `VIEW_W=1920 VIEW_H=1080` 重拍 |
| Trailer | 30s | ❌ 缺 | 分鏡見 `MARKETING-v0.4.md` §6 |

## 4. 商店素材 a/b 選擇（`_shots/C3/store/`，8 張候選）

| 用途 | 選用 | 理由 |
|---|---|---|
| Key art（1920×1080／press hero） | **a**（`keyart-1920x1080-a.png`） | 有潛水員剪影＝「人 vs 巨艦」的故事與比例尺；唯一亮點是海面反光，縮圖也讀得懂。b 是空景，氛圍好但沒有主角。 |
| Steam small capsule 616×353 | **a**（`steam-capsule-616x353-a.png`） | 616px 寬時 b 的雲層噪點會糊成一片；a 的上方是乾淨漸層，logo 疊字安全區足夠。 |
| itch cover 630×500 | **a**（`itch-cover-630x500-a.png`） | 5:4 裁切後 a 的飛碟＋潛水員都在框內；itch 列表縮到 315px 時只剩一個亮點，a 的辨識度最高。 |
| GitHub social 1280×640 | **b**（`github-social-1280x640-b.png`） | 2:1 橫幅沒有疊字需求，b 的對稱構圖＋雲層更適合當 repo 卡片；且與上架素材區隔，不重複。 |
| 備用／press 次要圖 | b（key art b、itch b、steam b） | 空景適合「世界觀」段落與 press kit 的背景圖。 |

**共同問題（上架前必須解）**：四張都**沒有 logo／標準字**。Steam capsule 慣例是圖＋logo 一起交；建議 C 在 a 的基礎上加字（中文主、英文副），並保留上方 22% 安全區。

## 5. 缺「原生 1920」的重抽 prompt（可直接跑）

現有 `keyart-1920x1080-a/b` 是 1344×768 **LANCZOS 放大 1.43×**（`docs/art/CONCEPTS-v0.4.md:66,79`），細節不足，1920 螢幕上會軟。重抽做法：先用 SDXL 最佳 16:9（1536×864）生成，再用 hires fix 2× 後 downsample 到 1920×1080（避免直接 1920 直出變形）。ckpt／sampler／steps／cfg 照 `CONCEPTS-v0.4.md:9`。

```text
# a（有潛水員；key-03 原生版）seed 42021
cinematic key art, dark alien saucer silhouette high above a dark teal ocean at dusk, thin pale magenta light under the hull, lone diver silhouette in the water below, painterly game concept art, muted teal and navy palette, magenta only as a small rim light, wide composition, no text
# 負面 B：border, frame, white margin, letterbox, text, letters, logo, watermark, signature, blurry, lowres, jpeg artifacts, deformed, extra fingers, bad hands, extra limbs, pink sky, magenta sky, neon, synthwave, purple, over-saturated, black bars, writing, symbols

# b（空景；key-05 原生版）seed 42031
cinematic key art, alien saucer hovering low above a dark teal ocean at dusk, its reflection rippling on the water, dark storm clouds, empty sea with no people, painterly game concept art, muted teal and navy palette, faint magenta underglow, no text
# 負面：person, people, human, silhouette, figure, text, letters, logo, watermark, border, frame, black bars, neon, synthwave, pink sky, blurry, lowres
```

```powershell
# 在 _dev\comfy 下重抽（1536×864 → 2× hires → 1920×1080）
node comfy.mjs --prompt "<上面 a 或 b>" --neg "<對應負面>" --ckpt anima_pencil-XL-v4.0.0.safetensors `
  --w 1536 --h 864 --steps 30 --cfg 7 --seed 42021 --hires 2 --name key-03-native --out "H:\DeepSeek\PROJECT\PROGRAMM\_shots\C3\raw"
# 產出後（Lead／C 執行，E 不跑發版）：
magick key-03-native-01.png -resize 1920x1080! -quality 92 keyart-1920x1080-a-native.png
```

**尚缺、需重抽或重構的原生尺寸（給 C 的工單）**
1. **Main capsule 1232×706**：以 a 的 1920 原生版為底，重新構圖讓飛碟在中上、潛水員在下 1/3、左側留 30% 給 logo。
2. **Library hero 3840×1240**：需原生寬幅（SDXL 用 1536×496 生成再 2.5×），prompt 在 a 的字尾加 `ultra wide panoramic composition, diver at far left, saucer at right third`，不可用 1920 裁切放大。
3. **Library capsule 600×900**：直式重抽，prompt 改成 `vertical poster composition, alien saucer above, lone diver silhouette below, deep teal ocean`，seed 42022。
4. **Logo 1280×720 透明 PNG**：不是 AI 圖，請 C 用現有標題字（`style.css` 的標題字型）重排中文＋英文，輸出透明 PNG。
5. **5 張 1920×1080 實機截圖**：`_dev/shot.mjs` 已支援 `VIEW_W/VIEW_H`：
```powershell
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\_dev'
$env:CDP_PORT='9305'; $env:OUT_DIR='H:\DeepSeek\PROJECT\PROGRAMM\_shots\E\store1920'
$env:VIEW_W='1920'; $env:VIEW_H='1080'
node shot.mjs base        # 基地面板
node shot.mjs craft       # 裝備
node shot.mjs launch      # 升空
node shot.mjs moon        # 母船
node shot.mjs title       # 標題（需 EXTRA_EVAL='ok' 才會截圖）
```

## 6. 上架前 Check-list（Lead 驗收用）

- [ ] itch 頁面：標題／短描述（88 字）／長描述／5 特色／標籤／封面／5 截圖／AI 揭露／試玩頁連結
- [ ] Steam 願望清單頁：短描述（112 字元）／長描述 BBcode／capsule 全尺寸／logo／5 張 1920 截圖
- [ ] 原生 1920 key art（a）與 3840×1240 hero 已產出
- [ ] 價格與首發折扣設定（itch 2.99／Steam 3.99，待 Lead 定案）
- [ ] `LEGAL.md` 的 AI 揭露與素材清單同步到兩個商店頁
- [ ] 30 秒預告（分鏡見 `MARKETING-v0.4.md` §6）
- [ ] 商店頁英文版文案（v0.8 與 en 字串一起上）
