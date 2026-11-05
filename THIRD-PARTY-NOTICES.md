# 第三方元件與 AI 生成素材揭露（THIRD-PARTY-NOTICES）

最後更新：2026-11-05（v0.11）

## 1. 隨遊戲散布的內容（全部為本作品自有）

| 類型 | 位置 | 來源 | 授權 |
|---|---|---|---|
| 程式碼 | `index.html`、`style.css`、`js/*.js`、`sw.js` | 本作品作者 | 見 `LICENSE`（All Rights Reserved） |
| 美術 | `docs/art/**`、`assets/**` | 本作品作者（部分為 AI 生成後人工挑選／合成） | 見 `LICENSE` |
| 音樂 | `docs/audio/*.mp3` | 本機 ComfyUI + ACE-Step 1.5 生成、人工剪輯循環 | 見 `LICENSE`（模型 Apache-2.0；輸出屬本作品） |
| 文字 | 遊戲內文案、`docs/**` | 本作品作者 | 見 `LICENSE` |

## 2. 未隨遊戲散布的第三方元件

| 元件 | 用途 | 授權 | 備註 |
|---|---|---|---|
| ComfyUI | 本機生成概念圖／商店素材／音樂 | GPL-3.0 | **不散布**；僅作為開發工具 |
| anima_pencil-XL | 概念圖／商店素材生成 | Fair AI Public License 1.0-SD | 輸出不受模型授權拘束、商用允許；模型本身不散布 |
| ACE-Step 1.5 | 背景音樂生成 | Apache-2.0 | 模型不散布；輸出屬本作品 |
| Stable Diffusion / SDXL 相關模型 | 僅測試，未採用於交付素材 | 各模型授權 | 未使用其輸出；`animeScreencapStyle` 輸出禁止商用，本作品**未採用** |
| Node.js | 開發／測試腳本（`tools/`） | MIT | 不散布 |
| 系統字型（Microsoft JhengHei、PingFang TC、Noto Sans TC 等） | 介面字型 | 各 OS 授權 | **不打包 webfont**，由使用者系統提供 |

## 3. AI 揭露

本作品使用 AI 工具於以下部分：

- **美術**：概念圖、標題畫面 key art、商店主圖（anima_pencil-XL 生成＋人工挑選與合成）。
- **音樂**：3 首背景音樂（ACE-Step 生成＋人工剪輯）。
- **文字**：開發過程中使用 AI 輔助撰寫與整理文件；遊戲內劇情與文案經人工定稿。
- **程式**：本作品程式碼由開發者主導、AI 輔助撰寫與審查。

遊戲內所有程式繪製的美術（場景、角色、粒子）為程式碼即時生成，非貼圖。

## 4. 授權紀錄

素材生成參數（模型、prompt、seed、日期）詳見：

- `docs/art/CONCEPTS-v0.4.md`（概念圖）
- `docs/art/AI-ASSETS-v0.5.md`（商店素材）
- `docs/audio/AUDIO-SPEC.md`（音樂）
- `docs/marketing/LEGAL.md`（完整法務紀錄與 AI 揭露）
