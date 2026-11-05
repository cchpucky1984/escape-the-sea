# v0.11 Steam capsule 檢查

> 檢查日期：2026-11-05。尺寸以 PIL 實測；logo 安全區以「中央 80% 框」近似檢查（Steam 文件無硬性像素值，實務上 logo 不要貼邊）。
> 圖：`steam-capsule-check.png`（1920×1080 檢查表）、`_shots/C12/09-steam-capsule-check.png`。

## 1. 現有檔案

| 用途 | 檔案 | 尺寸 | 大小 | 結果 |
|---|---|---|---|---|
| Main capsule | `docs/art/store/main-capsule-1232x706.jpg` | 1232×706 | 107.6 KB | ✅ 尺寸正確；logo 在中央安全區內 |
| Header capsule | `docs/art/store/header-capsule-460x215.jpg` | 460×215 | 18.5 KB | ✅ 尺寸正確；logo 在中央安全區內 |
| Library capsule | `docs/art/store/library-capsule-600x900.jpg` | 600×900 | 89.1 KB | ⚠️ 尺寸正確；logo 頂端約高於中央 80% 框 20px（建議下移或縮小） |
| Library hero | `docs/art/store/library-hero-3840x1240.jpg` | 3840×1240 | 374.4 KB | ✅ 尺寸正確（Steam library hero） |
| Logo（透明） | `docs/art/store/logo-wordmark.png` | 1600×517 | 407.7 KB | ✅ 透明 PNG；Steam logo 無 400KB 限制 |
| Small capsule | `docs/art/store/small-capsule-231x87.jpg` | 231×87 | 5.7 KB | ✅ 本輪補上（由 main capsule 置中裁切） |
| Screenshots | `docs/art/store/itch/screenshot-0*.jpg` | 1920×1080 ×5 | 92–167 KB | ✅ 可直接用於 Steam store（至少 5 張） |

## 2. 缺件／待辦

- [ ] **Library capsule logo 安全區**：現有 logo 頂端約在 y=65（600×900），中央 80% 框從 y=90 開始；建議把 logo 下移 ~25px 或縮小 5%。本次未動原圖（避免破壞既有合成）。
- [ ] **Small capsule**：已補 `small-capsule-231x87.jpg`，但 logo 在縮圖中偏小；可另做「只留中文」的 231×87 版本。
- [ ] **Community icon 184×184**、**Client icon 32×32**：尚未輸出（可從 `docs/art/pwa/icon-512.png` 縮圖）。
- [ ] **Steam 頁面預覽圖**：需要 5 張 screenshot 的英文版（目前全中文 UI）。
- [ ] **Trailer**：無（尚未錄製）。
- [ ] **Store 文案／價格／AI 揭露**：在 `docs/marketing/` 範圍，非美術缺件。

## 3. 品牌一致性
- 現有 main/header/library 使用舊的**青色** wordmark；本輪新做的 `wordmark/wordmark-1280.png` 是**金色**版（itch cover/banner/資訊圖使用）。
- 若要完全統一，建議用新 wordmark 重出三張 capsule（main 置中、header 置中、library 中央）；本次只檢查，未替換舊圖。
- `steam-capsule-check.png` 的金色框是**近似安全區**（中央 80%），不是 Steam 官方精確規範。

## 4. 驗收
- 尺寸：main 1232×706、header 460×215、library 600×900、small 231×87、library hero 3840×1240 全部正確。
- 檔案大小：全部 <400KB（logo PNG 407.7KB 例外，Steam 無此限制）。
- 結論：尺寸合規；缺件集中在 icon 尺寸變體、英文截圖、trailer，以及 library logo 安全區微調。
