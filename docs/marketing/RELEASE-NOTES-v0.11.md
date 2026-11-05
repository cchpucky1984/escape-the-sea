# 發佈說明：v0.11（Release Notes）

> 2026-11-05 · v0.11 主線已上線（本機 commit，GitHub main 推送後生效）
> 這份是給玩家看的版本說明；技術細節見 `docs/HANDOFF.md`。中英各一版，可直接貼 itch devlog／GitHub Release。

---

# 繁體中文

## 逃出大海 v0.11 — 難度重製完成，主線可從頭玩到結局

這一版把 v0.8 以來的大改動收斂成一個可以直接玩的完整版本：四隻巨獸各有打法、最終戰重做成四階段＋逃生＋鏡像，加上挑戰模式與 NG+。也是第一次把商店頁、授權與更新紀錄整理成可發佈的狀態。

**重點**
- **四隻深海巨獸、四種模式**：光束掃射、追蹤導彈、衝撞、洋流場；每招都有前搖，看懂再閃。
- **最終戰重做**：手動瞄準升空、母船兩波（共 24 隻）、核心四階段（重力→光束→導彈→衝撞）；核心死後 **90 秒逃生倒數**，會出現複製你裝備、**技能 +1** 的**鏡像 BOSS**——打贏才真的通關。
- **破關後還有事做**：3 個挑戰模式（一命深海／限時 45／赤手空拳）、NG+ 0–9、24 個成就、8 個海域事件。
- **可及性**：減少動態、色盲輔助（形狀＋文字）、字級 100%／120%；英文介面自 v0.7 起完整。
- **份量**：15 個任務、4 隻巨獸、最終四合一 BOSS。一輪約 **75–105 分鐘（模型推估，封測後定案）**——若你玩得慢、常卡關，會更接近 2 小時。

**修正與技術**
- 海面繪製效能收尾（漸層快取、子彈批次）＋低 fps 自動降級；QA 47/47、console error 0。
- 封測版工具：F2 卡點標記、F3 FPS、匯出測試紀錄（**不含個資**，正式版不含這些工具列）。
- 授權文件到位：`LICENSE`（All Rights Reserved）＋ `THIRD-PARTY-NOTICES`（AI 美術／音樂揭露）。

**已知**
- 一輪長度目前是模型推估（中位約 75 分），封測＋平衡調整後會再更新數字；不要把它當成已實測。
- 音樂 6 段候選仍待人耳驗收；實機 iOS/Android 觸控與 PWA 安裝尚未測。

---

# English

## Escape the Sea v0.11 — difficulty rework complete; the mainline now runs credits to credits

This release folds the big changes since v0.8 into a complete, playable build: four leviathans with their own patterns, a reworked final battle (four-phase core, 90-second escape, Mirror boss), plus challenge modes and NG+. It is also the first version whose store page, licensing and changelog are ready to ship.

**Highlights**
- **Four leviathans, four patterns** — prism beam, homing missiles, charge, and a current field. Every attack is telegraphed.
- **Final battle rework** — manual aiming during ascent, two mothership waves (24 guards), a four-phase core (gravity → beam → missiles → charge), then a **90-second escape countdown** and a **Mirror Core** that copies your gear at **+1 skill**. Beat it to escape.
- **Reasons to come back** — 3 challenge modes (one life / 45 minutes / bare hands), NG+ up to 9, 24 achievements, 8 dynamic sea events.
- **Accessibility** — reduce motion, colorblind assist (shapes + labels), 100%/120% text size; full English UI since v0.7.
- **Content** — 15 quests, 4 leviathans, one four-in-one final boss. A run is roughly **75–105 minutes (model estimate; beta will confirm)** — slower, cautious first runs land closer to two hours.

**Fixes & tech**
- Sea rendering performance pass (gradient cache, batched bullets) and automatic FX downgrade; QA 47/47, zero console errors.
- Beta-only tools: F2 stuck-point marks, F3 FPS, JSON test-log export (**no personal data**; not present in the release build).
- Licensing: `LICENSE` (All Rights Reserved) + `THIRD-PARTY-NOTICES` (AI art/music disclosure).

**Known**
- Run length is currently a model estimate (median ~75 min); it will be updated after beta and balance tuning. Do not quote it as measured.
- Six music candidates still need a human listening pass; real-device iOS/Android touch and PWA install are untested.

**Links**: itch `[ITCH URL]` · GitHub `[REPO URL]` · Changelog `docs/marketing/CHANGELOG.md` · Press kit `[PRESSKIT URL]`
