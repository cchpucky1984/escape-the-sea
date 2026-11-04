# 逃出大海 · Escape the Sea

單機 HTML5 網頁遊戲：在海灘被外星飛船巨炮打落海，被暗湧沖到大海中央。
收集海上垃圾 → 建造會長大的自動化基地 → 派出 BOT 出海 → 升級裝備 → 造太空船飛上月球 → 與外星母船決戰。

目前版本 **v0.6.0-alpha**（v1.0 為發售目標）；**v0.6 收尾中**：新標題畫面、背景音樂、24 個成就、8 個海域事件、設定面板與 i18n 字典，見文末〈v0.6〉。

## 開始玩

雙擊 `index.html`，或執行 `start.bat`（用預設瀏覽器開啟）。
免安裝、免網絡、免伺服器。進度自動存在瀏覽器 `localStorage`（key：`escape-the-sea-v2`）。

## 商店與連結（上架中）

- **itch.io**：`[待填]` — 付費版 Coming soon；另有「前 15 分鐘試玩」免費頁。
- **Steam 願望清單**：`[待填]` — 先開頁收集關注，桌面打包在 v0.7 之後評估。
- **GitHub Pages**：`[待填]` — 可免費直接玩最新開發版。
- 英文商店頁草稿：[docs/marketing/STORE-v0.6-EN.md](docs/marketing/STORE-v0.6-EN.md)　媒體素材：[PRESSKIT.md](docs/marketing/PRESSKIT.md)　隱私／授權：[LEGAL.md](docs/marketing/LEGAL.md)
- **AI 揭露**：key art 與概念圖為 ComfyUI + `anima_pencil-XL`（FAIPL-1.0-SD，輸出可商用）；音樂為 ACE-Step 1.5（Apache-2.0）；**遊戲內美術與音效全部是程式即時生成**。`animeScreencapStyle` 模型的輸出禁止商用、未採用。

## 操作

| 按鍵 | 功能 |
|---|---|
| WASD / 方向鍵 | 游動；月球內部移動；登艦時飛行 |
| Shift | 衝刺 / 月球加速 |
| 滑鼠、左鍵 | 瞄準、發射魚槍（月球：射擊） |
| 空白鍵 | 海面發射魚槍（同左鍵）；開場劇情按空白／Enter 繼續 |
| B | 自動化基地：建造新建築（平台會一格格擴張） |
| C | 裝備升級、魚槍模組、太空船組裝、發射 |
| H | 賞金合約（需先建造「賞金終端」） |
| J | 任務清單與成就 |
| Esc | 關閉面板 / 暫停選單（含音量設定） |
| M | 總靜音（音效＋音樂） |

## 生存規則（2026 平衡版）

- **生命 3 點**：起始 3 HP，鯊魚 −2、外星無人機 −1、水母 −1。回基地安全圈即回滿。
- 每升一級潛水衣，最大生命 +1（3 → 7）。HUD 用愛心圖案顯示，不再顯示數字。
- 氧氣／體力同樣改成圖示＋條，沒有數字；氧氣見底會持續扣血，靠近基地或撿空氣泡補充。
- **一定要游回基地**才能建造、升級、發射（面板會拒絕並顯示距離）。
- **裝備房**：沒建就不能升級裝備。
- **火箭研發中心**：沒建就不能研發火箭護盾、也不能建衛星光束發生器。
- **四角守衛**：海域四個角落各一隻（深海巨獸），擊敗得「科技碎片」；集滿 4 塊才能在研發中心研發火箭護盾。
- **衛星光束發生器**（超級武器，需研發中心）：母船決戰時，核心 90% 觸發第一發光束打到 60%；10% 時第二發直接終結。

## 火箭／母船規則

- 火箭等級直接繼承你的裝備：**速度＝蛙鞋、武器＝魚槍、裝甲＝潛水衣、護盾＝研發科技**。
- **升空門檻**：魚槍 Lv3＋潛水衣 Lv2＋火箭研發中心（缺哪項會顯示在 toast）。
- 升空時艦炮自動反擊，但**魚槍等級低於 3 打不穿外星戰機護盾**；Lv3 以上兩發擊落。
- 母船內部繼承同一套升級：**魚槍 Lv4 才是 100% 傷害，Lv3 只剩 35%，Lv1–2 打不穿外星人護盾**。
- 核心掉到 50% 時人類同盟軍進場。

## CHEAT

標題畫面直接打鍵盤 `cheat`（不用按 Enter）→ 畫面震動、標題出現 **YOU CHEATER!!!**。
再按「開始遊戲」，開局會彈出免費裝備面板，全部免費、與正常升級疊加、整場有效；之後可在 Esc 暫停選單再開。作弊不會解鎖挑戰類成就。

## 核心系統

**會長大的基地**
- 起點只有一塊補給平台；每建造一座建築，平台就多一格，並自動選擇最靠近中心的位置擴張。
- 五種建築可重複建造：自動收集網、分解工坊、防禦炮塔、外星逆向工程、BOT 船塢；另有一次性關鍵建築：裝備房、火箭研發中心、火箭工坊、衛星光束發生器、賞金終端、模組工作台。
- 造價隨同類數量 ×1.6 遞增，所以擴張有節奏但不會爆走。
- 基地面板有即時小地圖、安全圈半徑、每 5 秒產出、BOT 數量。

**安全圈**
- 半徑隨平台擴張而變大（面板與 HUD 都會顯示）。
- 圈內：玩家不會受傷、氧氣與生命自動補給；敵人子彈一進入就被護盾吸收；鯊魚、無人機、水母與巨獸會被擋在外面。
- 玩家在圈內時，敵怪只會在外圍徘徊。

**BOT 艦隊**
- 每座 BOT 船塢生產一台 BOT（最多 3 台）。
- BOT 會自己出海找垃圾、載滿 8 件就回基地卸貨；找不到垃圾時會在基地附近打撈，確保有被動收入。
- 可在雷達（黃點）與畫面上（黃色小艇 + 載貨量）看到牠們。

**賞金合約**：`H` 面板（需賞金終端）3 張合約、6 秒補槽、15 金屬換牌；擊殺／打撈／巡弋／獵首都能換合金。

**魚槍模組**：模組工作台解鎖 3 槽（穿透／爆裂／電磁）；模組箱由巨獸、賞金獵首與裂縫核心掉落。

**深海巨獸**：四角各一隻（240 HP、3 階段、弱點核心），擊敗掉科技碎片與模組箱；指北針在 2000m 內顯示最近方位。

**海域事件**：每局從 8 個事件抽（垃圾潮／洋流暴衝／鯊魚群／外星巡邏／氧氣外洩／補給箱雨／暗流漩渦／守衛甦醒），第一次在第 3 分鐘、之後每 100 秒檢定。

**裝備與太空船**：蛙鞋、氧氣瓶、潛水衣、磁力收集器、壓縮魚槍各 4 級（需裝備房）；船體、引擎、燃料槽、導航電腦 4 個零件；火箭工坊 ×1 才能發射。

**任務與成就**：15 個引導任務＋24 個成就（進度 10／挑戰 8／彩蛋 6），HUD 顯示進度、J 看全表；成就只給記錄，不給數值獎勵。

## 流程

1. **大海收集** → 2. **建基地與 BOT** → 3. **升級裝備** → 4. **組裝太空船**
5. **升空**：A/D 閃隕石、W 加速；外星戰機會來攔截，艦上防禦炮自動反擊。
6. **登艦**：母船就在月球軌道上。WASD 飛行，按住 W 衝進機庫入口（母船引力會把你往後拉）。
7. **母船內部**：兩波守軍 → 反應爐核心（艙壓制）。核心掉到 50% 時，地球同盟軍第三艦隊會殺進來跟你一起打。
8. **結局**：核心爆炸，同盟軍護著你的逃生艙離開。

## 海域風險／回報

離基地越遠，垃圾越肥、怪物越多越兇（HUD 會顯示當前海域）：

| 海域 | 距離 | 資源 | 怪物上限 |
|---|---|---|---|
| 近海 | < 800 | ×1 | 2 |
| 外海 | 800–1600 | ×1.3 | 4 |
| 深海 | 1600–2600 | ×1.6 | 6 |
| 遠洋 | 2600+ | ×2.0 | 8 |

遠洋的怪移動更快、開火更密；一趟的收入約是近海的 2 倍。

死亡：在基地復活，失去 15% 塑膠。升空／登艦失敗：回基地修理（金屬 -8）。母船戰敗：可再次出擊。

## v0.6（本輪）

- **標題畫面**：key art 換成原生 1920×1080（`docs/art/title-art/`，CSS 接線、載入失敗回退程序背景）。
- **背景音樂**：3 場景 × 2 候選（`docs/audio/`，ACE-Step、-18 LUFS、無縫循環）；已接 `MUSIC`（`setScene` 切換、音量可調）。候選仍需人耳驗收。
- **成就 24**：J 面板第二區（全部／進度／挑戰／彩蛋分頁），toast「成就解鎖」；不給數值獎勵。
- **海域事件 8**：`js/events.js`，首次 3 分鐘、之後每 100 秒；同時最多 1 個、冷卻 30 秒。
- **設定面板**：音樂／音效音量、總靜音、減少動態、語言（英文顯示 soon，v0.8）。
- **i18n 字典**：`docs/i18n/STRINGS.js`（`window.I18N_DATA`，425 條＋17 個動態模板＋複數規則），B 接線中。
- 待辦：挑戰模式 3 個、NG+、教學 5 步（設計已定案，接線中）；英文介面 v0.8；商店頁與預告素材（見 `docs/marketing/`）。

## 檔案

- `index.html` 入口　·　`style.css` 介面　·　`start.bat` 本機啟動
- `js/core.js` 狀態 / 存檔 / 資源 / 面板 / 任務 / 成就 / 音樂 / 設定
- `js/fx.js` 粒子、鏡頭震動、漸層快取、合成音效
- `js/base.js` 基地平台、安全圈、BOT、砲塔、建築繪製
- `js/sea.js` 大海場景（收集、敵人、雷達、指北針、賞金合約）
- `js/events.js` 海域事件（8 個）與深海裂縫
- `js/leviathan.js` 深海巨獸 AI／3 階段／弱點核心／掉落
- `js/space.js` 升空、登艦與月球決戰
- `js/main.js` 輸入、場景切換、主迴圈

## 文件索引

- [docs/PRODUCT-v1.0.md](docs/PRODUCT-v1.0.md) — 商業級品質標準（六支柱＋里程碑）
- [docs/HANDOFF.md](docs/HANDOFF.md) — 交接文件（暫停點、已知問題、下次開工順序）
- [docs/design/GDD-v0.4.md](docs/design/GDD-v0.4.md) — v0.4 企劃定案：賞金海域、數值、驗收
- [docs/design/CONTENT-v0.5.md](docs/design/CONTENT-v0.5.md) — 內容深度：成就 24／挑戰 3／事件 8／教學／NG+ 規格
- [docs/tech/AUDIT-v0.4.md](docs/tech/AUDIT-v0.4.md) — 架構與技術債審查
- [docs/art/STYLE-v0.4.md](docs/art/STYLE-v0.4.md) — 視覺風格與 HUD／面板規格
- [docs/art/TITLE-ART.md](docs/art/TITLE-ART.md) — 標題 key art 接線規格；素材見 [AI-ASSETS-v0.5.md](docs/art/AI-ASSETS-v0.5.md)
- [docs/audio/AUDIO-SPEC.md](docs/audio/AUDIO-SPEC.md) — 背景音樂規格、候選與接線說明
- [docs/vfx/VFX-AUDIO-v0.4.md](docs/vfx/VFX-AUDIO-v0.4.md) — 打擊感、粒子與音效設計
- [docs/content/LEVELS-v0.4.md](docs/content/LEVELS-v0.4.md) — 海域事件、守衛、數值與任務擴充
- [docs/marketing/STORE-v0.6-EN.md](docs/marketing/STORE-v0.6-EN.md) — 英文商店頁（itch＋Steam）與 AI 揭露
- [docs/marketing/STORE-v0.5.md](docs/marketing/STORE-v0.5.md) — 中文商店頁與素材清單
- [docs/marketing/TRAILER-v0.6.md](docs/marketing/TRAILER-v0.6.md) — 30 秒預告分鏡與重現指令
- [docs/marketing/DEVLOG-02.md](docs/marketing/DEVLOG-02.md) — Devlog #2（音樂／成就／事件／標題）
- [docs/marketing/PRESSKIT.md](docs/marketing/PRESSKIT.md) — 媒體素材包與事實表
- [docs/marketing/LEGAL.md](docs/marketing/LEGAL.md) — 隱私、AI 揭露、字型／音樂／模型授權清單
- [docs/i18n/STRINGS.js](docs/i18n/STRINGS.js) — zh-Hant → en 字典（425 條，可直接載入）
- [docs/i18n/STRINGS.md](docs/i18n/STRINGS.md) — 翻譯慣例與歷史對照
- [docs/qa/QA-BASELINE.md](docs/qa/QA-BASELINE.md) — QA 基準線與已知問題
- [docs/TEAM.md](docs/TEAM.md) — 團隊規範與檔案擁有權

## English

**Escape the Sea** is a single-player HTML5 survival / base-building game: an alien ship blasts you into the ocean, and you turn floating trash into a growing offshore base, a BOT fleet, and finally a spacecraft to take the fight to the alien mothership.

- **Play**: open `index.html` (or run `start.bat`). No install, no network, no account.
- **Controls**: WASD/Arrows swim · Shift sprint · Mouse aim/fire · B base · C gear · H bounties · J quests · Esc pause/settings · M mute.
- **Loop**: collect trash → grow the platform base → send out BOTs → upgrade gear → build a spacecraft → storm the mothership.
- **Status**: v0.6.0-alpha is playable (new title art, music, 24 achievements, 8 sea events); English UI is in progress and ships in v0.8. The string dictionary is `docs/i18n/STRINGS.js` (425 entries).
- **Privacy**: no accounts, no tracking; progress stays in your browser's `localStorage`. See [LEGAL.md](docs/marketing/LEGAL.md).
