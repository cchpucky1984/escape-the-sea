# 逃出大海 · 開發團隊工作規範（Sprint S0）

> 本文件是團隊唯一的事實來源（single source of truth）。
> 角色名稱、擁有權、指令、驗收標準都以這裡為準。有衝突時由 Team Lead 裁決。

## 1. 專案現況

- 專案：`H:\DeepSeek\PROJECT\PROGRAMM\escape-the-sea`（GitHub `cchpucky1984/escape-the-sea`，`main` 分支，目前 v0.3.0）
- 類型：單機 HTML5 網頁遊戲（Canvas 2D + 原生 JS，無框架、無建置流程、無外部素材）
- 內容：海面收集垃圾 → 建造會長大的自動化基地 → BOT 艦隊 → 裝備升級 → 太空船升空 → 月球母船決戰
- 程式規模：`js/core.js` 833 行、`js/base.js` 968、`js/sea.js` 1152、`js/space.js` 1702、`js/main.js` 307；`style.css` 14KB
- 美術全部是程式繪製（canvas path / gradient / 粒子），**沒有圖片資產**；音效是 WebAudio 即時合成，**沒有音檔**
- 存檔：`localStorage`（`escape-the-sea-v2`）

### 檔案責任（S1 實作階段的寫入範圍，S0 一律不碰程式碼）

| 檔案 | 擁有者 |
|---|---|
| `js/core.js`、`js/main.js`、`js/sea.js` | B 主程式 |
| `js/base.js`、`js/space.js`、新檔 `js/fx.js` | D 技術美術 |
| `index.html`、`style.css` | C 美術 |
| `README.md` | E 副企劃／行銷 |
| `docs/design/**` | A PM |
| `docs/tech/**` | B |
| `docs/art/**` | C |
| `docs/vfx/**` | D |
| `docs/marketing/**`、`docs/content/**` | E |
| `docs/qa/**`、`_dev/**` | Lead |
| `docs/TEAM.md` | Lead（其他人不要改） |

## 2. 本機環境（已就緒，直接用）

- 靜態伺服器（已由 Lead 啟動，持續運行）：**http://127.0.0.1:5173/**
- 截圖／自動遊玩工具：`H:\DeepSeek\PROJECT\PROGRAMM\_dev\shot.mjs`（CDP 驅動 headless Chrome）

### 自己開一台 headless Chrome（每人一個 port，不要共用）

```powershell
$P = 9301   # A=9301  B=9302  C=9303  D=9304  E=9305
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars',"--remote-debugging-port=$P",`
  "--user-data-dir=$env:TEMP\cdp-$P",'about:blank'
Start-Sleep 3
```

### 跑情境並截圖

```powershell
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\_dev'
$env:CDP_PORT = '9301'
$env:OUT_DIR  = 'H:\DeepSeek\PROJECT\PROGRAMM\_shots\A'
node shot.mjs base     # title | sea | base | craft | quests | launch | dock | moon
```

- `EXTRA_EVAL` 環境變數可以在最後一張截圖前執行一段 JS，例如
  `$env:EXTRA_EVAL='__T.give("metal",500); "ok"'`
- 遊戲內建 QA 鉤子 `window.__T`（見 `js/main.js` 檔尾）：`__T.game`、`__T.sea`、`__T.give(k,n)`、`__T.mountAll()`、`__T.setScene('moon')`、`__T.initMoon()`、`__T.openBase()` 等。
- 靜態 mockup / 原型 HTML 也可以直接用 Chrome 截圖：
  `& 'C:\Program Files\Google\Chrome\Application\chrome.exe' --headless=new --screenshot=out.png --window-size=1280,800 "file:///H:/.../mockup.html"`

## 3. 協作規則（全部人都要遵守）

1. **先認領任務**：`team_task_list` → `team_task_get` → `team_task_update(action=claim, expected_revision=<最新>)`，做完 `action=complete`。
2. **只寫自己的目錄**（見上表）。S0 期間**不修改** `js/`、`index.html`、`style.css`。
3. **不要跑任何 git 指令**（不改分支、不 commit、不 push）。版本控制由 Lead 統一處理。
4. **不要殺別人的程序**、不要搶別人的 port（A=9301 … E=9305）。
5. 文件用**繁體中文**，程式碼註解也用繁體中文（跟現有專案一致）。
6. 交付要**可執行、可驗收**：數字、色票、檔案路徑、函式名、行號都要具體，不要寫「可以考慮優化」這種空話。
7. 每份文件 ≤ 200 行，重點優先。做完用 `send_message` 給 `lead` 一份 ≤ 12 行的摘要（做了什麼／檔案路徑／需要 Lead 決定的事／風險）。
8. 有疑問先自己查程式碼與 README，再問 Lead。

## 4. Sprint S0 目標（本輪）

> **主題：v0.4 企劃定案 + 可視化原型**。這輪不進主程式，先把「做什麼、長什麼樣」定下來，並用獨立 HTML 原型驗證。

| 角色 | 任務 | 交付物 |
|---|---|---|
| A PM／主企劃 | 決定 v0.4 主題方向（提 3 方案＋推薦）、核心循環診斷、新內容與數值、任務／對白文字 | `docs/design/GDD-v0.4.md` |
| B 主程式 | 架構與技術債審查（含 file:line）、v0.4 系統設計、實作切分與風險 | `docs/tech/AUDIT-v0.4.md` |
| C 美術 | 視覺風格指南、HUD／面板／圖示重製規格、可截圖的 mockup | `docs/art/STYLE-v0.4.md`、`docs/art/hud-mockup.html` |
| D 技術美術 | 打擊感／粒子／音效系統設計，可截圖的 VFX 原型 | `docs/vfx/VFX-AUDIO-v0.4.md`、`docs/vfx/vfx-demo.html` |
| E 副企劃／行銷 | 商店頁與社群文案、30 秒預告分鏡、截圖腳本；關卡／海域事件擺放與數值表 | `docs/marketing/MARKETING-v0.4.md`、`docs/content/LEVELS-v0.4.md` |

### 完成定義（DoD）

- 交付物存在、可開啟、內容具體到能直接施工
- 有截圖佐證（C、D、E 至少各 2 張截圖，放在 `_shots\<角色>\`）
- 已在自己的 task 上 `complete`，並 send_message 給 lead
- 沒有修改別人範圍的檔案（Lead 會用 `git status` 驗）

## 5. 下一階段（S1，等 Lead 統整後才開工）

- 由 Lead 把 S0 成果整合成 `docs/ROADMAP-v0.4.md`，切出實作工單
- 實作依檔案擁有權分工；跨檔案的整合（例如新粒子系統接到 sea/base）由 Lead 協調
- 版本號、`index.html` 的 `?v=` 快取參數由 Lead 統一更新
- 全程**只在本機**，確認後才由 Lead 決定是否 commit / push
