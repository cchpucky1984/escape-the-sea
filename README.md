# 逃出大海 · Escape the Sea

單機 HTML5 網頁遊戲：在海灘被外星飛船巨炮打落海，被暗湧沖到大海中央。
收集海上垃圾 → 建造會長大的自動化基地 → 派出 BOT 出海 → 升級裝備 → 造太空船飛上月球 → 與外星母船決戰。

目前版本 **v0.4.0-alpha**；**v0.5 開發中**（內容深度：賞金合約／魚槍模組／深海巨獸／深海裂縫），進度見文末〈開發中（v0.5）〉。

## 開始玩

雙擊 `index.html`，或執行 `start.bat`（用預設瀏覽器開啟）。
免安裝、免網絡、免伺服器。進度自動存在瀏覽器 `localStorage`（key：`escape-the-sea-v2`）。

## 商店與連結（上架中）

- **itch.io**：`[待填]` — 付費版 Coming soon；另有「前 15 分鐘試玩」免費頁。
- **Steam 願望清單**：`[待填]` — 先開頁收集關注，桌面打包在 v0.7 之後評估。
- **GitHub Pages**：`[待填]` — 可免費直接玩最新開發版。
- 隱私、AI 揭露與素材授權：[docs/marketing/LEGAL.md](docs/marketing/LEGAL.md)　媒體素材：[docs/marketing/PRESSKIT.md](docs/marketing/PRESSKIT.md)
- 商店 key art 為 AI 生成（ComfyUI）；**遊戲內美術與音效全部是程式即時生成**，沒有任何圖片檔或音檔。

## 操作

| 按鍵 | 功能 |
|---|---|
| WASD / 方向鍵 | 游動；月球內部移動；登艦時飛行 |
| Shift | 衝刺 / 月球加速 |
| 滑鼠、左鍵 | 瞄準、發射魚槍（月球：射擊） |
| 空白鍵 | 海面發射魚槍（同左鍵）；開場劇情按空白／Enter 繼續 |
| B | 自動化基地：建造新建築（平台會一格格擴張） |
| C | 裝備升級、太空船組裝、發射 |
| J | 任務清單 |
| Esc | 關閉面板 / 暫停選單 |
| M | 音效開關 |

## 生存規則（2026 平衡版）

- **生命 3 點**：起始 3 HP，鯊魚 −2、外星無人機 −1、水母 −1。回基地安全圈即回滿。
- 每升一級潛水衣，最大生命 +1（3 → 7）。HUD 用愛心圖案顯示，不再顯示數字。
- 氧氣／體力同樣改成圖示＋條，沒有數字；氧氣見底會持續扣血，靠近基地或撿空氣泡補充。
- **一定要游回基地**才能建造、升級、發射（面板會拒絕並提示）。
- **裝備房**：沒建就不能升級裝備。
- **火箭研發中心**：沒建就不能研發火箭護盾、也不能建衛星光束發生器。
- **四角守衛**：海域四個角落各一隻，擊敗得「科技碎片」；集滿 4 塊才能在研發中心研發火箭護盾。
- **衛星光束發生器**（超級武器，需研發中心）：母船決戰時，核心 90% 觸發第一發光束打到 60%；10% 時第二發直接終結。

## 火箭／母船規則

- 火箭等級直接繼承你的裝備：**速度＝蛙鞋、武器＝魚槍、裝甲＝潛水衣、護盾＝研發科技**。
- 升空時艦炮自動反擊，但**魚槍等級低於 3 打不穿外星戰機護盾**；Lv3 以上兩發擊落。
- 母船內部繼承同一套升級：**魚槍 Lv4 才是 100% 傷害，Lv3 只剩 10%，Lv1–2 打不穿外星人護盾**。
- 核心掉到 50% 時人類同盟軍進場。

## CHEAT

標題畫面直接打鍵盤 `cheat`（不用按 Enter）→ 畫面震動、標題出現 **YOU CHEATER!!!**。
再按「開始遊戲」，開局會彈出免費裝備面板，全部免費、與正常升級疊加、整場有效；之後可在 Esc 暫停選單再開。

## 核心系統

**會長大的基地**
- 起點只有一塊補給平台；每建造一座建築，平台就多一格，並自動選擇最靠近中心的位置擴張。
- 五種建築可重複建造：自動收集網、分解工坊、防禦炮塔、外星逆向工程、BOT 船塢；另有四種一次性關鍵建築：裝備房、火箭研發中心、火箭工坊、衛星光束發生器。
- 造價隨同類數量 ×1.6 遞增，所以擴張有節奏但不會爆走。
- 基地面板有即時小地圖、安全圈半徑、每 5 秒產出、BOT 數量。

**安全圈**
- 半徑隨平台擴張而變大（面板與 HUD 都會顯示）。
- 圈內：玩家不會受傷、氧氣與生命自動補給；敵人子彈一進入就被護盾吸收；鯊魚、無人機、水母會被物理推出去，無法進入。
- 玩家在圈內時，敵怪只會在外圍徘徊。

**BOT 艦隊**
- 每座 BOT 船塢生產一台 BOT（最多 3 台）。
- BOT 會自己出海找垃圾、載滿 8 件就回基地卸貨；找不到垃圾時會在基地附近打撈，確保有被動收入。
- 可在雷達（黃點）與畫面上（黃色小艇 + 載貨量）看到牠們。

**裝備與太空船**：蛙鞋、氧氣瓶、潛水衣、磁力收集器、壓縮魚槍各 4 級（需裝備房）；船體、引擎、燃料槽、導航電腦 4 個零件；火箭工坊 ×1 才能發射。

**任務鏈**：11 個引導任務，多數完成後有資源獎勵（HUD 顯示進度、J 看全表）。

## 流程

1. **大海收集** → 2. **建基地與 BOT** → 3. **升級裝備** → 4. **組裝太空船**
5. **升空**：A/D 閃隕石、W 加速；外星戰機會來攔截，艦上防禦炮自動反擊。
6. **登艦**：母船就在月球軌道上。WASD 飛行，按住 W 衝進機庫入口（母船引力會把你往後拉）。
7. **母船內部**：兩波守軍 → 反應爐核心。核心掉到 50% 時，地球同盟軍第三艦隊會殺進來跟你一起打。
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

## 開發中（v0.5）

方向：把「戰鬥」接回「經濟」，讓每一輪路線不一樣（`docs/PRODUCT-v1.0.md` 支柱 A／B）。

- **賞金合約**：新面板 `H`＋建築「賞金終端」；3 張合約（清剿／拆解／打撈／巡弋／獵首），完成換合金。
- **魚槍模組**：3 槽（穿透／爆裂／電磁），需「模組工作台」。
- **深海巨獸**：四角守衛升級版（3 階段、弱點核心）。
- **深海裂縫**：每 3 分鐘開啟的限時熱點。
- **母船艙壓值**：把一擊必死改成艙壓＋減傷＋補給艙（v0.4.0-alpha 已修完 soft-lock／雙重扣款／存檔掉資料）。
- 目標：一輪 90–150 分鐘、新玩家 3 分鐘內知道下一步（`PRODUCT-v1.0.md`）。實際日期不承諾，完成才發。

## 檔案

- `index.html` 入口　·　`style.css` 介面　·　`start.bat` 本機啟動
- `js/core.js` 狀態 / 存檔 / 資源 / 面板 / 任務 / 音效 / i18n 資料
- `js/fx.js` 粒子、鏡頭震動、漸層快取、合成音效
- `js/base.js` 基地平台、安全圈、BOT、砲塔、建築繪製
- `js/sea.js` 大海場景（收集、敵人、雷達、指北針、賞金合約）
- `js/space.js` 升空、登艦與月球決戰
- `js/main.js` 輸入、場景切換、主迴圈

## 文件索引

- [docs/PRODUCT-v1.0.md](docs/PRODUCT-v1.0.md) — 商業級品質標準（六支柱＋里程碑）
- [docs/ROADMAP-v0.4.md](docs/ROADMAP-v0.4.md) — 施工路線圖與工單
- [docs/design/GDD-v0.4.md](docs/design/GDD-v0.4.md) — v0.4 企劃定案：賞金海域、數值、驗收
- [docs/design/DATA-v0.4.md](docs/design/DATA-v0.4.md) — 任務／建築／文案資料塊
- [docs/tech/AUDIT-v0.4.md](docs/tech/AUDIT-v0.4.md) — 架構與技術債審查
- [docs/art/STYLE-v0.4.md](docs/art/STYLE-v0.4.md) — 視覺風格與 HUD／面板規格；概念圖見 [CONCEPTS-v0.4.md](docs/art/CONCEPTS-v0.4.md)
- [docs/vfx/VFX-AUDIO-v0.4.md](docs/vfx/VFX-AUDIO-v0.4.md) — 打擊感、粒子與音效設計
- [docs/content/LEVELS-v0.4.md](docs/content/LEVELS-v0.4.md) — 海域事件、守衛、數值與任務擴充
- [docs/marketing/STORE-v0.5.md](docs/marketing/STORE-v0.5.md) — 商店頁定稿（itch／Steam）與素材清單
- [docs/marketing/PRESSKIT.md](docs/marketing/PRESSKIT.md) — 媒體素材包與事實表
- [docs/marketing/LEGAL.md](docs/marketing/LEGAL.md) — 隱私聲明、字型／AI／音樂授權清單
- [docs/i18n/STRINGS.md](docs/i18n/STRINGS.md) — zh-Hant → en 字串字典（v0.8 i18n 基礎）
- [docs/qa/QA-BASELINE.md](docs/qa/QA-BASELINE.md) — QA 基準線與已知問題
- [docs/TEAM.md](docs/TEAM.md) — 團隊規範與檔案擁有權

## English

**Escape the Sea** is a single-player HTML5 survival / base-building game: an alien ship blasts you into the ocean, and you turn floating trash into a growing offshore base, a BOT fleet, and finally a spacecraft to take the fight to the alien mothership.

- **Play**: open `index.html` (or run `start.bat`). No install, no network, no account.
- **Controls**: WASD/Arrows swim · Shift sprint · Mouse aim/fire · B base · C gear · J quests · Esc pause · M mute.
- **Loop**: collect trash → grow the platform base → send out BOTs → upgrade gear → build a spacecraft → storm the mothership.
- **Status**: v0.4.0-alpha is playable; v0.5 (bounty contracts, harpoon mods, leviathan, rifts) is in development; full English localisation is planned for v0.8.
- **Privacy**: no accounts, no tracking; progress stays in your browser's `localStorage`. See [LEGAL.md](docs/marketing/LEGAL.md).
