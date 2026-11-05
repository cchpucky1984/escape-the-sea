# 更新紀錄（CHANGELOG）— v0.3.0 → v0.11

> 擁有者：E · 2026-11-05 · 使用者可讀摘要；技術細節見 `docs/HANDOFF.md` 與各輪文件。
> 版本順序由舊到新；每版 3–5 點，分「新內容／平衡／修正」。

---

# 繁體中文

## v0.11 — 2026-11-05：發售整備

**新內容**
- 釋出包：`CHANGELOG`、itch 最終頁文案（`ITCH-FINAL.md`）、`RELEASE-NOTES`、社群發佈包（X thread／Reddit／巴哈）。
- 授權文件到位：`LICENSE`（All Rights Reserved）＋ `THIRD-PARTY-NOTICES.md`（AI 揭露與模型授權）。
- 商店素材補齊：wordmark、1920×1080 英雄圖、5 張 1920 實機截圖、玩法 3 步驟資訊圖。

**平衡**
- 首輪中位**模型推估約 75 分鐘**（±25%，目標 90–150；封測後定案）；核心 1800HP、TTK 約 74 秒。
- 難度曲線以「變密不變痛」為原則收斂：每個新招式都有 ≥0.5 秒前搖。

**修正**
- 海面繪製效能收尾（漸層快取／子彈批次繪製）＋低 fps 自動降級（<40→tier2、<28→tier3）。

## v0.10 — 2026-11-05：封測工具與效能

**新內容**
- 封測工具：F2 卡點標記、F3 FPS 面板、設定頁「匯出測試紀錄」（JSON）、`__T.timeScale` 加速測試。
- 封測計畫 `BETA-KIT`、上架彩排 `ITCH-ROLLOUT`、外聯信 `OUTREACH`。
- 商店英雄圖／wordmark／玩法資訊圖；隱私與 AI 揭露更新（含封測資料不含個資）。

**平衡**
- `tools/balance.mjs`：里程碑、資源曲線、TTK 門檻自動化。

**修正**
- 效能：moon／launch 漸層呼叫 −90%、子彈批次繪製、FX 自動降級。

## v0.9 — 2026-11-05：挑戰、NG+、可及性

**新內容**
- 挑戰模式 3：一命深海、限時 45、赤手空拳（獨立最佳分、不可存檔）。
- NG+ 0–9：保留成就／挑戰分數／巨獸擊殺，敵人與產出逐輪加成。
- 可及性：減少動態、色盲輔助（形狀＋文字）、字級 100%／120%；canvas 海域名雙語。

**平衡**
- 最終核心 900 → **1800 HP**，核心 TTK 目標 70–100 秒、整場決戰 5–7 分鐘。

**修正**
- 挑戰／NG+ UI 與結算頁；商店 5 張 1920×1080 截圖。

## v0.8 — 2026-11-05：難度重製＋最終戰重做

**新內容**
- 四隻深海巨獸四種模式：光束、追蹤導彈、衝撞、洋流場（各自前搖與躲法）。
- 子彈四型：快、慢、追蹤、雷射；`dockcue` 升空→機庫轉場提示、最終戰雙血條。
- 最終戰：升空手動瞄準、母船波次 10→24、核心四階段（重力→光束→導彈→衝撞）。
- **鏡像 BOSS**：核心死後 90 秒逃生倒數，第 20 秒出現複製你裝備、技能 +1 的鏡像，擊敗才通關。

**平衡**
- 海域密度：深海同屏上限 6→10、遠洋 8→12，生成間隔縮短；同屏敵彈上限 120。

**修正**
- 升空 gate 與失敗原因顯示；效能與 HUD 同步收斂。

## v0.7 — 2026-11-04：英文、觸控、PWA

**新內容**
- 英文介面（zh-Hant／en 全字串切換），i18n 字典與用語一致性表。
- 教學 5 步（回基地→建收集網→裝備房＋魚槍→賞金合約→升空 gate）＋ HUD「下一步」。
- 手機觸控（虛擬搖桿＋射擊鈕）、PWA 可安裝／離線；升空 gate UI 列缺口。

**平衡**
- 深色介面字級與按鈕尺寸調整；EN 字串長度收斂（最長句縮 50%）。

**修正**
- 母船／升空流程回歸；PWA 快取與 ?v= 同步。

## v0.6 — 2026-11-04：音樂、成就、事件

**新內容**
- 新標題 key art（原生 1920×1080）與結局插圖。
- 背景音樂 3 段（海面／升空／母船；另有 b 版候選）。
- 成就 24（進度 10／挑戰 8／彩蛋 6）、海域事件 8、裂縫。
- 設定面板：音樂／音效音量、總靜音、減少動態、語言。

**修正**
- 事件與成就 toast／存檔；音樂與場景切換整合。

## v0.5 — 2026-11-04：賞金海域

**新內容**
- 賞金合約＋賞金終端（H 面板）、魚槍模組 3 槽（穿透／爆裂／電磁）。
- 四隻深海巨獸（240HP、3 階段、弱點核心）、深海裂縫、模組箱。
- 升空 gate（魚槍 Lv3／潛水衣 Lv2／研發中心）與 HUD 下一步引導。

**平衡**
- 合金經濟與賞金分級（T1–T3）；巨獸 TTK 40–70 秒。

## v0.4 — 2026-11-03：可通關與可靠存檔

**新內容**
- 母船決戰改「艙壓＋減傷」制，取代原本的一擊必死。

**修正**
- 修 P0：母船無法通關、升空失敗重試 soft-lock、返回基地雙重扣款。
- 改 10 秒自動存檔＋切頁強制存，F5 不再掉進度；效能快取與粒子池。

## v0.3 — 2026-10-31：首個完整可玩版本

**新內容**
- 完整主線：撿垃圾→基地→BOT→裝備→升空→母船決戰→結局。
- 四海域（近海／外海／深海／遠洋）、四角守衛、科技碎片、衛星光束。
- 存檔（localStorage）、音效（WebAudio 合成）、四種結局演出。

---

# English

## v0.11 — 2026-11-05: Release packaging

**Added**
- Release pack: CHANGELOG, final itch page copy (`ITCH-FINAL.md`), release notes, and a social launch kit (X thread / Reddit / Bahamut).
- Licensing in place: `LICENSE` (All Rights Reserved) + `THIRD-PARTY-NOTICES.md` (AI and model disclosures).
- Store assets: wordmark, 1920×1080 hero art, five 1920 gameplay screenshots, a three-step "how to play" graphic.

**Balance**
- First-run median **modeled at ~75 minutes** (±25%, target 90–150; to be confirmed in beta); final core 1800 HP, ~74 s TTK.
- Difficulty kept "denser, not deadlier": every new attack has ≥0.5 s telegraph.

**Fixed**
- Sea rendering performance pass (gradient cache, bullet batching) + automatic FX downgrade below 40/28 fps.

## v0.10 — 2026-11-05: Beta tools and performance

**Added**
- Beta tools: F2 stuck-point marks, F3 FPS overlay, "Export test log" (JSON), `__T.timeScale`.
- Beta kit, itch rollout rehearsal, press outreach templates.
- Store hero art/wordmark/how-to-play graphic; updated privacy and AI disclosures.

**Balance**
- `tools/balance.mjs`: milestone, economy and TTK checks.

**Fixed**
- Performance: moon/launch gradient calls −90%, batched bullet drawing, automatic FX tiers.

## v0.9 — 2026-11-05: Challenges, NG+, accessibility

**Added**
- Three challenge modes: Iron Dive (one life), Speed Dive (45 min), Bare Hands (no turrets/mods/gear upgrades).
- NG+ 0–9 with escalating enemy/resource multipliers; keeps achievements and challenge scores.
- Accessibility: reduce motion, colorblind assist (shapes + labels), 100%/120% text size; bilingual canvas zone labels.

**Balance**
- Final core 900 → **1800 HP**; core TTK target 70–100 s, full finale 5–7 minutes.

**Fixed**
- Challenge/NG+ UI and results screen; five 1920×1080 store screenshots.

## v0.8 — 2026-11-05: Difficulty rework and final battle

**Added**
- Four leviathans with distinct patterns: beam, homing missiles, charge, current field.
- Four bullet types with clear telegraphs; hangar `dockcue`; dual boss health bars.
- Final battle: manual aiming during ascent, mothership waves 10→24, four-phase core (gravity → beam → missiles → charge).
- **Mirror boss**: after the core dies, a 90-second escape countdown spawns a mirror of your gear with +1 skill; beat it to escape.

**Balance**
- Sea density: deep-sea cap 6→10, high seas 8→12; on-screen enemy bullets capped at 120.

**Fixed**
- Launch gate and failure reasons; HUD/performance cleanup.

## v0.7 — 2026-11-04: English, touch, PWA

**Added**
- Full English UI (zh-Hant/en string switching) with a terminology review.
- Five-step tutorial; on-screen "next step" chip.
- Touch controls (virtual stick + fire button); installable offline PWA; launch-gate UI.

**Balance**
- UI type sizes and button hit areas; English copy shortened (longest strings cut ~50%).

**Fixed**
- Mothership/ascent flow regressions; service-worker cache/version sync.

## v0.6 — 2026-11-04: Music, achievements, events

**Added**
- New native-1920 title key art and ending illustration.
- Three background music tracks (plus alternate takes).
- 24 achievements, eight dynamic sea events, deep-sea rifts.
- Settings panel: music/SFX volume, master mute, reduce motion, language.

**Fixed**
- Event/achievement toasts and saves; music scene transitions.

## v0.5 — 2026-11-04: Bounty waters

**Added**
- Bounty contracts and terminal (H), three harpoon mod slots (pierce/blast/EMP).
- Four deep-sea leviathans (240 HP, three phases, weak core), rifts, mod boxes.
- Launch gate (Harpoon Lv3 / Suit Lv2 / R&D Center) and next-step HUD guidance.

**Balance**
- Alloy economy and bounty tiers; leviathan TTK 40–70 s.

## v0.4 — 2026-11-03: Beatable and reliable saves

**Added**
- Mothership fight reworked around cabin pressure + armor instead of one-shot deaths.

**Fixed**
- P0: uncompletable mothership, ascent-retry soft-lock, double charge on return.
- 10-second autosave + save on page hide; rendering caches and particle pools.

## v0.3 — 2026-10-31: First complete playable build

**Added**
- Full mainline: trash → base → BOTs → gear → launch → mothership → ending.
- Four sea zones, four corner guardians, tech shards, orbital beam.
- localStorage saves, synthesized WebAudio SFX, ending sequence.
