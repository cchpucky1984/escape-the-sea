# 美術資產進度（暫停於 2026-11-04 01:14，使用者關機）

## 狀態：task-1（S1b-A ComfyUI 美術資產包）**未完成**，已釋回任務板

### 已完成
- 讀完 task-1 與 `_dev/comfy.mjs`；確認 ComfyUI 0.43.0 可用（queue 空、VRAM 8.3GB free）。
- **title-bg 候選 4 張已生成**（同 prompt、只改 seed 1101–1104，1216×704，26 steps，anima_pencil-XL）：
  - `H:\ComfyUI\output\etsea\title_00001_.png`（seed 1101）
  - `H:\ComfyUI\output\etsea\title_00002_.png`（seed 1102）
  - `H:\ComfyUI\output\etsea\title_00003_.png`（seed 1103）
  - `H:\ComfyUI\output\etsea\title_00004_.png`（seed 1104）
  - 對照表：`_dev\C\sheet-title.png`
  - 生成腳本：`_dev\C\gen-title.mjs`（可重跑）
- 尚未挑選／裁切／轉 webp／寫入 `assets/art/web/title-bg.webp`。

### 待辦（重開機後從這裡繼續）
1. 看 `_dev\C\sheet-title.png` 挑 1 張（另存 2 張備選路徑給 Lead），
   Pillow cover 裁切 → 1920×1080 → 調色 → `assets/art/web/title-bg.webp`（≤400KB），
   完成立刻 `send_message` 給 lead（B 在等這張接標題）。
2. ending-bg（1920×1080，4 候選）、capsule-616x353、cover-630x500、og-1200x630、hero-1920x620。
3. `assets/art/src/` 只留採用的原圖；`assets/art/preview-title.png`（Pillow 疊字確認安全區）。
4. `docs/art/ART-PIPELINE.md`（prompt／negative／model／seed／steps／尺寸／後製／重跑指令）。

### 已知環境問題（重開機後要留意）
- `assets/art/README.md` **不存在**（task-1 說已備好，但 repo HEAD `4fc37c4` 沒有）。本輪先照 task-1 內文規格（1920×1080 等）做，若 README 後來補上，以它為準。
- `_dev/comfy.mjs` 回傳的 `o.path` **忽略 subfolder**（實際檔案在 `H:\ComfyUI\output\etsea\`，它卻印 `H:\ComfyUI\output\title_*.png`）。請以實際路徑為準，或請 Lead 修 helper（我沒改它）。
- 上一輪未 commit 的三個檔仍在工作區：`docs/art/TITLE-ART.md`（M）、`style.css`（M）、`docs/art/VISUAL-QA-v0.5.md`（??）。不是我這輪動的，交給 Lead 決定。
