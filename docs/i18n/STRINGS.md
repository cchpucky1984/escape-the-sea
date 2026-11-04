# 英文字串清單（zh-Hant → en）— v0.5 / 給 v0.8 i18n 的基礎

> 擁有者：E（副企劃／行銷）· 2026-11-04 00:49 快照（`core.js` 1228 行、`sea.js` 1281、`space.js` 1810、`base.js` 1080、`main.js` 360、`fx.js` 639、`index.html` 94）
> SHA-256 前 12 碼：core `30408A7AF89D` · sea `900191B567A9` · space `75D8C3FFF5CD` · base `5A0CAE07EEC2` · main `B1FE286B9DE2` · index `03AAE5C720D0`。B／D 同輪改檔會讓行號位移；合併後用「以 zh 字串搜尋最近行」重對一次。
> 共 **319 條**（§1 字典 271＋§1b 新面板 30＋§2 預定 18）；本檔是**資料檔（字典）**，不受一般文件 200 行上限限制。
> **已由 `docs/i18n/STRINGS.js` 取代（v0.6，425 條、含成就／事件／設定面板）**：要接線請用 `window.I18N_DATA`；本檔保留作翻譯說明、固定譯名與歷史對照。
> 用法：下方 `STRINGS` 物件**可直接貼進** `js/i18n.js`（或 `core.js` 的資料區），key 為 `模組.用途`；`[0]` 是 zh-Hant、`[1]` 是 en。
> `{n}`／`{name}`／`{pct}` 是佔位符，v0.8 接線時要換成各自的 template 參數；**不要把數字寫死在翻譯裡**。

## 1. 字典（可直接貼）

```js
/* escape-the-sea · v0.5 snapshot · [zh-Hant, en] */
export const STRINGS = {
  /* ── 資源 RESMETA ── js/core.js:121-126 ─────────────────────── */
  "res.plastic":        ["塑膠", "Plastic"],                                       // core.js:122
  "res.wood":           ["木材", "Wood"],                                          // core.js:123
  "res.metal":          ["金屬", "Metal"],                                         // core.js:124
  "res.alloy":          ["外星合金", "Alien Alloy"],                                // core.js:125

  /* ── 魚槍模組 MODS ── js/core.js:135-139 ────────────────────── */
  "mod.pierce.name":    ["穿透模組", "Piercing Module"],                            // core.js:136
  "mod.pierce.desc":    ["子彈穿過目標 — 最多 3 個，傷害遞減", "Bullets pierce up to 3 targets, with damage falloff"], // core.js:136
  "mod.blast.name":     ["爆裂模組", "Blast Module"],                               // core.js:137
  "mod.blast.desc":     ["命中炸開 — 周圍敵人吃 55% 傷害", "Explodes on hit — nearby enemies take 55% damage"], // core.js:137
  "mod.emp.name":       ["電磁模組", "EMP Module"],                                 // core.js:138
  "mod.emp.desc":       ["18% 機率讓目標停擺 1.2 秒", "18% chance to stun the target for 1.2 s"], // core.js:138

  /* ── 裝備 UPG ── js/core.js:143-154 ─────────────────────────── */
  "upg.fin.name":       ["推進蛙鞋", "Propulsion Fins"],                            // core.js:144
  "upg.fin.desc":       ["游泳速度 +{n}%", "Swim speed +{n}%"],                     // core.js:144
  "upg.tank.name":      ["鈦合金氧氣瓶", "Titanium Oxygen Tank"],                   // core.js:146
  "upg.tank.desc":      ["氧氣 +{n} · 消耗 -{m}%", "Oxygen +{n} · drain -{m}%"],    // core.js:146
  "upg.suit.name":      ["深海潛水衣", "Deep-Sea Dive Suit"],                       // core.js:148
  "upg.suit.desc":      ["最大生命 {n} HP（每級 +1）", "Max HP {n} (+1 per level)"], // core.js:148
  "upg.magnet.name":    ["磁力收集器", "Magnetic Collector"],                       // core.js:150
  "upg.magnet.desc":    ["收集範圍 +{n}", "Collection range +{n}"],                 // core.js:150
  "upg.harpoon.name":   ["壓縮魚槍", "Compressed Harpoon"],                         // core.js:152
  "upg.harpoon.desc":   ["傷害 {n} · 射速 +{m}%", "Damage {n} · Fire rate +{m}%"],  // core.js:152

  /* ── 建築 STRUCTS ── js/core.js:157-176 ─────────────────────── */
  "struct.net.name":      ["自動收集網", "Auto Collection Net"],                    // core.js:179
  "struct.net.desc":      ["每 5 秒 +1 塑膠 · +1 木材", "+1 Plastic and +1 Wood every 5 s"], // core.js:180
  "struct.recycler.name": ["分解工坊", "Salvage Works"],                            // core.js:181
  "struct.recycler.desc": ["每 5 秒 +1 金屬", "+1 Metal every 5 s"],                // core.js:182
  "struct.botdock.name":  ["BOT 船塢", "BOT Dock"],                                 // core.js:183
  "struct.botdock.desc":  ["派出一台 BOT 自動出海收集物資", "Sends a BOT out to gather salvage automatically"], // core.js:184
  "struct.equip.name":    ["裝備房", "Equipment Room"],                             // core.js:185
  "struct.equip.desc":    ["解鎖裝備升級（C 面板）", "Unlocks gear upgrades (C panel)"], // core.js:186
  "struct.rnd.name":      ["火箭研發中心", "Rocket R&D Center"],                    // core.js:187
  "struct.rnd.desc":      ["解鎖火箭科技與超級武器", "Unlocks rocket tech and superweapons"], // core.js:188
  "struct.tower.name":    ["防禦炮塔", "Defense Turret"],                           // core.js:189
  "struct.tower.desc":    ["自動射擊 360 範圍內的威脅", "Auto-fires at threats within 360°"], // core.js:190
  "struct.reverse.name":  ["外星逆向工程", "Alien Reverse Engineering"],            // core.js:191
  "struct.reverse.desc":  ["每 10 秒 +1 外星合金", "+1 Alien Alloy every 10 s"],    // core.js:192
  "struct.satellite.name":["衛星光束發生器", "Orbital Beam Generator"],             // core.js:193
  "struct.satellite.desc":["決戰時呼叫軌道衛星光束", "Calls down an orbital beam in the final battle"], // core.js:194
  "struct.dock.name":     ["火箭工坊", "Rocket Workshop"],                          // core.js:195
  "struct.dock.desc":     ["解鎖太空船組裝與發射", "Unlocks spacecraft assembly and launch"], // core.js:196
  "tag.prod":           ["生產", "Production"],                                    // core.js:179
  "tag.auto":           ["自動化", "Automation"],                                  // core.js:183
  "tag.required":       ["必要", "Required"],                                      // core.js:185
  "tag.defense":        ["防禦", "Defense"],                                       // core.js:189
  "tag.rare":           ["稀有", "Rare"],                                          // core.js:191
  "tag.superweapon":    ["超級武器", "Superweapon"],                                // core.js:193

  /* ── 太空船零件 PARTS ── js/core.js:179-184 ─────────────────── */
  "part.hull.name":     ["船體", "Hull"],                                           // core.js:205
  "part.hull.desc":     ["耐壓艙體與隔熱層", "Pressure hull and heat shielding"],   // core.js:205
  "part.engine.name":   ["離子引擎", "Ion Engine"],                                 // core.js:206
  "part.engine.desc":   ["突破大氣層的推力", "Thrust to break through the atmosphere"], // core.js:206
  "part.fuel.name":     ["燃料槽", "Fuel Tank"],                                    // core.js:207
  "part.fuel.desc":     ["液態氫與氧化劑", "Liquid hydrogen and oxidizer"],          // core.js:207
  "part.nav.name":      ["導航電腦", "Navigation Computer"],                        // core.js:208
  "part.nav.desc":      ["鎖定月球上的外星旗艦", "Locks onto the alien mothership in lunar orbit"], // core.js:208

  /* ── 開場劇情 INTRO_LINES ── js/core.js:186-192 ─────────────── */
  "intro.1": ["那天的海很平靜。我在淺灘游泳，直到天空裂開。", "The sea was calm that day. I was swimming in the shallows when the sky split open."], // core.js:212
  "intro.2": ["外星飛船的巨炮擊中海面，氣流把我整個人捲進水裡。", "The alien ship's cannon hit the water and the blast sucked me under."], // core.js:213
  "intro.3": ["暗湧一路把我沖出去——再浮上水面時，已經看不見岸，也看不見船。", "The undercurrent dragged me out—when I surfaced, I could see neither shore nor ship."], // core.js:214
  "intro.4": ["沒關係。海上有無盡的垃圾，而垃圾就是材料。", "Doesn't matter. The sea is full of trash, and trash is material."], // core.js:215
  "intro.5": ["收集、建造、升級。總有一天，我要飛上去，把這筆帳算清楚。", "Gather. Build. Upgrade. One day I'll fly up there and settle the score."], // core.js:216

  /* ── 任務 QUESTS（text / sub） ── js/core.js:195-229 ────────── */
  "quest.collect.text": ["收集 15 件海上垃圾", "Collect 15 pieces of ocean trash"],                          // core.js:221
  "quest.collect.sub":  ["游過漂流垃圾就會自動吸進背包", "Drift close to trash and your suit pulls it in"],   // core.js:221
  "quest.net.text":     ["建造第一座自動收集網", "Build your first Auto Collection Net"],                     // core.js:224
  "quest.net.sub":      ["按 B（要游回基地附近才能建造）", "Press B (swim back near your base to build)"],     // core.js:224
  "quest.equip.text":   ["建造裝備房", "Build an Equipment Room"],                                            // core.js:227
  "quest.equip.sub":    ["有裝備房才能升級裝備", "You need an Equipment Room to upgrade gear"],                // core.js:227
  "quest.harpoon.text": ["把壓縮魚槍升級到 Lv2", "Upgrade the Compressed Harpoon to Lv2"],                   // core.js:230
  "quest.harpoon.sub":  ["按 C 升級裝備（需在基地附近）", "Press C to upgrade gear (must be near base)"],      // core.js:230
  "quest.rnd.text":     ["建造火箭研發中心", "Build a Rocket R&D Center"],                                    // core.js:233
  "quest.rnd.sub":      ["解鎖火箭科技與超級武器", "Unlocks rocket tech and superweapons"],                    // core.js:233
  "quest.tech.text":    ["擊敗海域四角的守衛，收集 4 塊科技碎片", "Defeat the four corner guardians, collect 4 Tech Shards"], // core.js:236
  "quest.tech.sub":     ["四角各一隻守衛，雷達上是紫色標記", "One guardian per corner—purple markers on the radar"], // core.js:236
  "quest.shield.text":  ["在研發中心解鎖火箭護盾科技", "Unlock Rocket Shield tech at the R&D Center"],        // core.js:239
  "quest.shield.sub":   ["需要 4 塊科技碎片", "Requires 4 Tech Shards"],                                     // core.js:239
  "quest.parts.text":   ["組裝 4 個太空船零件", "Assemble all 4 spacecraft parts"],                           // core.js:242
  "quest.parts.sub":    ["按 C 在「太空船」區建造", "Press C and build in the Spacecraft section"],            // core.js:242
  "quest.maxgun.text":  ["把壓縮魚槍升到最高級", "Max out the Compressed Harpoon"],                           // core.js:245
  "quest.maxgun.sub":   ["母船內部：未滿級傷害只有 10%", "In the mothership, damage is only 10% below max level"], // core.js:245
  "quest.launch.text":  ["發射太空船", "Launch the spacecraft"],                                             // core.js:248
  "quest.launch.sub":   ["按 C 按下發射，前往母船", "Press C, then Launch, and head for the mothership"],     // core.js:248
  "quest.boss.text":    ["擊敗母船核心", "Destroy the Mothership Core"],                                      // core.js:251
  "quest.boss.sub":     ["攻入外星母船，擊毀反應爐核心", "Board the alien mothership and destroy the reactor core"], // core.js:251

  /* ── 海域與守衛 ── js/sea.js:18-30 ────────────────────────── */
  "zone.near.name": ["近海", "Nearshore"],              "zone.near.tip": ["資源 ×1 · 威脅低", "Resources ×1 · Low threat"],   // sea.js:19
  "zone.mid.name":  ["外海", "Open Sea"],               "zone.mid.tip":  ["資源 ×1.3 · 威脅中", "Resources ×1.3 · Medium threat"], // sea.js:20
  "zone.deep.name": ["深海", "Deep Sea"],               "zone.deep.tip": ["資源 ×1.6 · 威脅高", "Resources ×1.6 · High threat"], // sea.js:21
  "zone.far.name":  ["遠洋", "High Seas"],              "zone.far.tip":  ["資源 ×2 · 極度危險", "Resources ×2 · Extreme danger"], // sea.js:22
  "boss.nw": ["西北守衛", "Northwest Guardian"],        "boss.ne": ["東北守衛", "Northeast Guardian"],       // sea.js:26
  "boss.sw": ["西南守衛", "Southwest Guardian"],        "boss.se": ["東南守衛", "Southeast Guardian"],       // sea.js:28
  "hud.zoneCap": ["怪物上限 {n}", "Threat cap {n}"],                                                          // core.js:760
  "hud.compass": ["基地 {dist}", "Base {dist}"],                                                              // sea.js:965

  /* ── 海面 toast / 浮字 ── js/sea.js ────────────────────────── */
  "sea.death.title":  ["失去意識…", "You black out…"],                                                        // sea.js:196
  "sea.death.body":   ["海水灌進面罩。你最後看見的，是頭頂那道搖晃的光。", "Seawater floods your mask. The last thing you see is the wavering light above."], // sea.js:196
  "sea.death.lost":   ["失去 15% 塑膠（{n} 件）", "Lost 15% of your plastic ({n} pieces)"],                    // sea.js:198
  "sea.death.btn":    ["爬起來", "Get up"],                                                                   // sea.js:199
  "sea.crate":        ["補給箱！", "Supply crate!"],                                                           // sea.js:224
  "sea.air":          ["+ 氧氣", "+ Oxygen"],                                                                 // sea.js:231
  "sea.baseprod":     ["基地生產", "Base production"],                                                        // sea.js:262
  "sea.bossKill":     ["擊敗{name} — 取得科技碎片 {n}/4", "Defeated {name} — Tech Shard {n}/4"],               // sea.js:338
  "sea.techFull":     ["4 塊碎片齊集！到火箭研發中心研發「火箭護盾科技」", "All 4 shards collected! Research Rocket Shield tech at the R&D Center"], // sea.js:339
  "sea.safe":         ["安全區", "Safe Zone"],                                                                // sea.js:475
  "sea.repaired":     ["維修完成", "Repairs complete"],                                                       // sea.js:487
  "sea.pickupFloat":  ["+{amt} {res} ×{mult}", "+{amt} {res} ×{mult}"],                                       // sea.js:243

  /* ── BOT / 基地浮字 ── js/base.js ──────────────────────────── */
  "bot.recycled": ["BOT 回收", "BOT salvaged"],                        // base.js:217
  "bot.returned": ["BOT 帶回 {n} 件", "BOT brought back {n} items"],    // base.js:229
  "bot.patrol":   ["打撈 +1", "Salvaged +1"],                          // base.js:267
  "base.built":   ["建造完成", "Construction complete"],                // base.js:149
  "base.supply":  ["補給站", "Supply Station"],                         // base.js:495
  "base.safeTag": ["安全區 · 敵怪無法進入", "Safe zone · enemies cannot enter"], // base.js:585
  "base.gearTag": ["裝備", "Gear"],                                     // base.js:847

  /* ── HUD 與基地面板 ── js/core.js ──────────────────────────── */
  "hud.quest":         ["任務 {done}/{total}", "Quests {done}/{total}"],                 // core.js:833
  "hud.questAllDone":  ["全部任務完成 — 你已經把帳算清楚了", "All quests complete — the score is settled"], // core.js:834
  "hud.idleNone":      ["基地尚未自動化 — 按 B 建造收集網與 BOT 船塢", "Base not automated yet — press B to build a Collection Net and a BOT Dock"], // core.js:806
  "hud.idleEvery5":    ["基地每 5 秒：", "Base every 5 s:"],                             // core.js:808
  "hud.idleAlloy":     ["合金+{n}（每10秒）", "Alloy +{n} (every 10 s)"],                 // core.js:807
  "hud.safeResupply":  ["安全區 · 補給中", "Safe zone · resupplying"],                   // core.js:816
  "hud.baseCount":     ["基地 {n} 座", "Base: {n} buildings"],                           // core.js:817
  "hud.baseTiles":     ["平台 {n} 格", "Platform: {n} tiles"],                           // core.js:818
  "hud.baseRadius":    ["安全圈 {n} m", "Safe zone {n} m"],                              // core.js:819
  "hud.baseBots":      ["BOT {n}/{max}", "BOT {n}/{max}"],                               // core.js:820
  "hud.baseShards":    ["科技碎片 {n}/4", "Tech Shards {n}/4"],                          // core.js:821
  "base.title":        ["自動化基地 — 海上平台", "Automated Base — Ocean Platform"],      // core.js:914
  "base.rows":         ["建築 / 平台", "Buildings / Platforms"],                          // core.js:890
  "base.radiusRow":    ["安全圈半徑", "Safe zone radius"],                                // core.js:891
  "base.botRow":       ["BOT 艦隊", "BOT Fleet"],                                         // core.js:892
  "base.botAuto":      ["（自動出海收集）", "(auto-gathers at sea)"],                      // core.js:892
  "base.per5":         ["每 5 秒產出", "Output every 5 s"],                               // core.js:893
  "base.shardRow":     ["科技碎片", "Tech Shards"],                                       // core.js:894
  "base.shardReady":   ["· 已可研發護盾", "· shield ready"],                              // core.js:894
  "base.shardHint":    ["· 擊敗四角守衛", "· defeat the four guardians"],                 // core.js:894
  "base.summaryHint":  ["每次建造都會在平台上多佔一格，基地會一格格長大。敵怪無法進入安全圈。", "Every building adds a tile—your base grows tile by tile. Enemies cannot enter the safe zone."], // core.js:898
  "base.maxed":        ["已達上限", "At max"],                                            // core.js:906
  "base.locked":       ["需要：{name}", "Requires: {name}"],                              // core.js:907
  "base.build":        ["建造（第 {n} 座）", "Build (#{n})"],                             // core.js:909
  "base.close":        ["關閉 (Esc)", "Close (Esc)"],                                     // core.js:914
  "toast.needBase":    ["距離基地 {dist} — 游回安全圈再按 B", "Base {dist} away — swim back into the safe zone, then press B"], // core.js:876
  "toast.needBase2":   ["距離基地 {dist} — 游回安全圈再按 C", "Base {dist} away — swim back into the safe zone, then press C"], // core.js:939
  "toast.needStruct":  ["需要先建造{name}", "Build the {name} first"],                    // core.js:920
  "toast.noRes":       ["資源不足", "Not enough resources"],                              // core.js:922
  "toast.structBuilt": ["{name} 建造完成 — 平台擴張中", "{name} built — platform expanding"], // core.js:925

  /* ── 裝備 / 太空船面板 ── js/core.js:718-838 ──────────────── */
  "craft.title":        ["裝備 · 火箭科技 · 太空船", "Gear · Rocket Tech · Spacecraft"],     // core.js:1033
  "craft.equipTitle":   ["裝備升級", "Gear Upgrades"],                                      // core.js:951
  "craft.needEquipTip": ["— 需先建造「裝備房」", "— Build an Equipment Room first"],          // core.js:952
  "craft.maxed":        ["已達最高等級", "Max level"],                                       // core.js:960
  "craft.needEquip":    ["需要裝備房", "Requires Equipment Room"],                            // core.js:961
  "craft.upgradeTo":    ["升級至 Lv {n}", "Upgrade to Lv {n}"],                              // core.js:963
  "craft.make":         ["製作", "Craft"],                                                   // core.js:963
  "craft.rocketTitle":  ["火箭科技", "Rocket Tech"],                                         // core.js:970
  "craft.inherit":      ["（速度＝蛙鞋　武器＝魚槍　裝甲＝潛水衣）", "(Speed = Fins · Weapon = Harpoon · Armor = Suit)"], // core.js:971
  "craft.shieldName":   ["火箭護盾科技", "Rocket Shield Tech"],                              // core.js:973
  "craft.shieldDesc":   ["升空與登艦時，船體額外 +25 裝甲，並減少砲火傷害", "+25 hull armor during launch and docking, and reduced gunfire damage"], // core.js:974
  "craft.needRnd":      ["需要火箭研發中心", "Requires Rocket R&D Center"],                    // core.js:976
  "craft.needShards":   ["需要 4 塊科技碎片（{n}/4）", "Requires 4 Tech Shards ({n}/4)"],      // core.js:977
  "craft.research":     ["研發護盾", "Research Shield"],                                     // core.js:979
  "craft.satName":      ["衛星光束發生器", "Orbital Beam Generator"],                        // core.js:982
  "craft.built":        ["已建造", "Built"],                                                 // core.js:983
  "craft.notBuilt":     ["未建造", "Not built"],                                             // core.js:983
  "craft.satDesc":      ["決戰時呼叫軌道衛星，兩發藍色光束直接打穿母船核心（在基地 B 建造）", "Calls an orbital satellite in the final battle—two blue beams pierce the mothership core (build it with B)"], // core.js:984
  "craft.ready":        ["✓ 已就緒", "✓ Ready"],                                            // core.js:985
  "craft.satCost":      ["可在基地面板建造（金屬 45 · 塑膠 30 · 合金 8）", "Build from the base panel (Metal 45 · Plastic 30 · Alloy 8)"], // core.js:986
  "craft.partsTitle":   ["太空船零件", "Spacecraft Parts"],                                  // core.js:1010
  "craft.done":         ["完成", "Done"],                                                   // core.js:1014
  "craft.installed":    ["✓ 已安裝", "✓ Installed"],                                        // core.js:1016
  "craft.buildPart":    ["建造零件", "Build Part"],                                          // core.js:1018
  "craft.launchReady":  ["太空船組裝完成，隨時可以發射。", "Spacecraft assembled — ready to launch."], // core.js:1025
  "craft.launchReq":    ["發射條件：4 個零件 + 火箭工坊 ×1", "To launch: 4 parts + 1 Rocket Workshop"], // core.js:1025
  "craft.moonDetected": ["月球軌道上偵測到外星母船。", "Alien mothership detected in lunar orbit."], // core.js:1026
  "craft.partProgress": ["零件進度 {n}/4", "Parts {n}/4"],                                   // core.js:1026
  "craft.noDock":       ["· 尚未建造火箭工坊", "· Rocket Workshop not built yet"],            // core.js:1026
  "craft.launch":       ["發射太空船 →", "Launch Spacecraft →"],                            // core.js:1028
  "craft.upgraded":     ["{name} → Lv {n}", "{name} → Lv {n}"],                              // core.js:1045
  "craft.shieldUp":     ["火箭護盾科技 → Lv {n}", "Rocket Shield Tech → Lv {n}"],             // core.js:1066

  /* ── 作弊 / 任務 / 說明 / 暫停 / 結局 ── js/core.js ────────── */
  "cheat.desc":      ["作弊模式：以下升級完全免費，與正常升級疊加，整場有效。", "Cheat mode: these upgrades are free, stack with normal upgrades, and last the whole run."], // core.js:1077
  "cheat.full":      ["作弊已滿", "Cheat maxed"],                                    // core.js:1083
  "cheat.free":      ["免費升級", "Free upgrade"],                                   // core.js:1084
  "cheat.title":     ["YOU CHEATER!!! — 免費裝備", "YOU CHEATER!!! — Free Gear"],    // core.js:1088
  "cheat.take":      ["收下 (Esc)", "Take it (Esc)"],                                // core.js:1088
  "cheat.open":      ["開啟作弊裝備（免費）", "Open cheat gear (free)"],               // core.js:1031
  "cheat.toast":     ["YOU CHEATER!!! — 開局後會彈出免費裝備", "YOU CHEATER!!! — free gear will pop up when the run starts"], // main.js:39
  "quests.body":     ["完成任務會獲得資源獎勵。任務只是引導，你可以用任何順序建造。", "Quests reward resources. They are guidance—build in any order."], // core.js:1115
  "quests.title":    ["任務", "Quests"],                                             // core.js:1116
  "help.title":      ["操作說明", "Controls"],                                       // core.js:1131
  "help.swim":       ["游動", "Swim"],                                               // core.js:1121
  "help.sprint":     ["衝刺（消耗體力）", "Sprint (uses stamina)"],                   // core.js:1122
  "help.aim":        ["瞄準、發射魚槍", "Aim and fire the harpoon"],                 // core.js:1123
  "help.base":       ["自動化基地：建造新建築（平台會擴張）", "Automated base: build structures (the platform expands)"], // core.js:1124
  "help.craft":      ["裝備升級 / 魚槍模組 / 太空船", "Gear upgrades / harpoon mods / spacecraft"], // core.js:1125
  "help.bounty":     ["賞金合約（需賞金終端）", "Bounty contracts (requires Bounty Terminal)"],     // core.js:1126
  "help.quests":     ["任務清單", "Quest list"],                                      // core.js:1127
  "help.esc":        ["關閉面板 / 暫停", "Close panel / pause"],                      // core.js:1128
  "help.mute":       ["音效開關", "Sound on/off"],                                    // core.js:1129
  "help.note":       ["基地安全圈內不會被攻擊，敵怪也無法進入。氧氣耗盡會扣血——靠近基地或撿空氣泡補充。", "The base safe zone blocks attacks and enemies. Running out of oxygen drains HP—return to base or grab air bubbles."], // core.js:1132
  "help.ok":         ["知道了", "Got it"],                                           // core.js:1133
  "pause.title":     ["已暫停", "Paused"],                                           // core.js:1146
  "pause.body":      ["海面暫時靜了下來。你的基地仍在自動生產。", "The sea is quiet for a moment. Your base keeps producing."], // core.js:1146
  "pause.resume":    ["繼續遊戲", "Resume"],                                          // core.js:1139
  "pause.soundOn":   ["音效：開啟", "Sound: on"],                                     // core.js:1140
  "pause.soundOff":  ["音效：關閉", "Sound: off"],                                    // core.js:1140
  "pause.help":      ["操作說明", "Controls"],                                        // core.js:1131
  "pause.cheat":     ["作弊裝備", "Cheat Gear"],                                      // core.js:1144
  "pause.restart":   ["重新開始", "Restart"],                                         // core.js:1145
  "end.winKicker":   ["任務完成 · 母船決戰", "Mission Complete · Mothership Battle"], // core.js:1211
  "end.loseKicker":  ["任務失敗", "Mission Failed"],                                 // core.js:1211
  "end.winTitle":    ["你把帳算清了", "The score is settled"],                        // core.js:1212
  "end.loseTitle":   ["你被擊落了", "Shot down"],                                     // core.js:1212
  "end.winText":     ["母船核心在你眼前炸開，整艘巨艦從內部亮成一顆白色的星。同盟軍的戰機從火球兩側穿出來，護著你的逃生艙往外飛。「任務完成，歡迎回家。」——遠處那顆藍色星球上，有一片海在等你。", "The mothership core bursts open and the whole ship lights up like a white star. Alliance fighters cut through the fireball and escort your escape pod out. \"Mission complete. Welcome home.\" Far below, a blue planet has a sea waiting for you."], // core.js:1214
  "end.loseText":    ["太空裝的警報聲蓋過了所有聲音。你按下了緊急撤離，艙體拖著黑煙墜回海面。", "The suit's alarm drowns out everything. You hit emergency eject and the pod falls back to the sea, trailing black smoke."], // core.js:1215
  "end.statTime":    ["遊戲時間", "Play time"],                                       // core.js:1217
  "end.statTrash":   ["收集垃圾", "Trash collected"],                                 // core.js:1218
  "end.statBuild":   ["基地建築", "Base buildings"],                                  // core.js:1219
  "end.statKills":   ["擊殺敵人", "Kills"],                                           // core.js:1220
  "end.statGear":    ["裝備等級", "Gear levels"],                                     // core.js:1221
  "toast.questDone": ["任務完成：{text}{rewards}", "Quest complete: {text}{rewards}"], // core.js:1167

  /* ── main.js ──────────────────────────────────────────────── */
  "main.soundOff": ["音效已關閉", "Sound off"],                                     // main.js:64
  "main.soundOn":  ["音效已開啟", "Sound on"],                                      // main.js:64
  "main.goal":     ["目標：收集垃圾 → 建造基地 → 攻入母船", "Objective: collect trash → build your base → storm the mothership"], // main.js:230
  "main.welcome":  ["歡迎回來 — 繼續你的工程", "Welcome back — continue the build"],  // main.js:248
  "main.noSave":   ["沒有可用的存檔", "No save found"],                              // main.js:250
  "main.restart":  ["重新開始", "Restart"],                                         // main.js:316

  /* ── space.js ─────────────────────────────────────────────── */
  "space.notReady":    ["太空船尚未完成", "Spacecraft is not ready"],                              // space.js:14
  "space.ignite":      ["點火！A / D 左右閃避，W 加速；艦上防禦炮會自動開火", "Ignition! A/D to dodge, W to accelerate; the turret fires automatically"], // space.js:47
  "space.breach":      ["突破大氣層 — 母船就在月球軌道上", "Atmosphere breached — the mothership is in lunar orbit"], // space.js:191
  "space.failTitle":   ["太空船解體", "Spacecraft broke apart"],                                  // space.js:198
  "space.failBody":    ["船體承受不住高速上升的震動，隔熱層一塊塊剝落。你按下了緊急分離。", "The hull can't take the vibration of the ascent; the heat shield peels off in pieces. You hit emergency separation."], // space.js:198
  "space.repair":      ["返回基地修理", "Return to base for repairs"],                            // space.js:200
  "space.back":        ["回到基地 — 重新發射即可", "Back at base — launch again when ready"],      // space.js:208
  "space.altitude":    ["上升高度", "Altitude"],                                                  // space.js:438
  "space.hull":        ["船體", "Hull"],                                                          // space.js:457
  "space.launchCtrl":  ["A / D 閃避　·　W 加速上升　·　艦炮等級 Lv{n}（打不穿戰機護盾）", "A/D dodge · W accelerate · Gun Lv{n} (can't pierce fighter shields)"], // space.js:470
  "space.launchWarn":  ["武器等級不足 3 — 外星戰機有護盾，只能靠閃避", "Weapon below Lv3 — alien fighters have shields; dodge them"], // space.js:473
  "space.hangarToast": ["衝進母船機庫 — 按住 W 前進，避開砲火", "Breach the hangar — hold W and dodge the fire"], // space.js:499
  "space.dockFailTitle":["太空船被擊落", "Spacecraft shot down"],                                 // space.js:563
  "space.dockFailBody": ["母船的防禦砲火把太空船撕開。你彈射出去，看著它燒成碎片。", "The mothership's guns tear the spacecraft apart. You eject and watch it burn."], // space.js:563
  "space.hangarTitle": ["外星母船 · 機庫入口", "Alien Mothership · Hangar Bay"],                  // space.js:803
  "space.hangarCtrl":  ["WASD 飛行　·　W 前進（母船引力會把你往後拉）", "WASD to fly · W to advance (mothership gravity drags you back)"], // space.js:806
  "space.moonEnter":   ["艙壓 {hp} · 裝甲 {pct}%　—　目標：核心反應爐", "Cabin pressure {hp} · Armor {pct}% — Objective: reactor core"], // space.js:849
  "space.moonNoDmg":   ["武器 Lv{n} — 外星人有護盾，攻擊無效", "Weapon Lv{n} — aliens have shields; attacks have no effect"], // space.js:850
  "space.moonReduced": ["武器 Lv{n} — 護盾減傷，傷害 {pct}%", "Weapon Lv{n} — shields reduce damage to {pct}%"], // space.js:850
  "space.wave":        ["母船守軍 · 第 {n} 波", "Mothership Guard · Wave {n}"],                    // space.js:872
  "space.core":        ["母船核心 · 反應爐", "Mothership Core · Reactor"],                          // space.js:878
  "space.coreHit":     ["擊毀核心！", "Core destroyed!"],                                          // space.js:882
  "space.loseTitle":   ["太空裝失效", "Suit failure"],                                             // space.js:965
  "space.loseBody":    ["面罩裂開，氧氣在母船的冷光裡無聲地流走。你的視線慢慢變暗……", "The faceplate cracks and oxygen streams away in the cold light. Your vision fades…"], // space.js:965
  "space.retry":       ["再次出擊", "Attack again"],                                               // space.js:967
  "space.returnBase":  ["返回基地", "Return to base"],                                             // space.js:968
  "space.radio":       ["「這裡是地球同盟軍第三艦隊——我們來接你回家了。」", "\"This is the Earth Alliance Third Fleet—we're here to bring you home.\""], // space.js:1002
  "space.alliance":    ["人類同盟軍 抵達", "Earth Alliance Arrives"],                              // space.js:1004
  "space.allianceToast":["人類同盟軍加入戰鬥！", "Earth Alliance joins the fight!"],                 // space.js:1010
  "space.beam1":       ["衛星光束 · 鎖定核心", "Orbital Beam · Core Locked"],                      // space.js:1156
  "space.beam2":       ["衛星光束 · 最終一擊", "Orbital Beam · Final Strike"],                     // space.js:1163
  "space.cabin":       ["艙壓", "Cabin Pressure"],                                                 // space.js:1742
  "space.armorLine":   ["裝甲 {pct}%　·　火力 ×{mult}", "Armor {pct}% · Firepower ×{mult}"],       // space.js:1760
  "space.supplies":    ["　·　補給艙 {n}", " · Supply pods {n}"],                                  // space.js:1761
  "space.moonTitle":   ["外星母船 · 內部　第 {n} 波", "Alien Mothership · Interior — Wave {n}"],    // space.js:1766
  "space.enemies":     ["剩餘敵人 {n}", "Enemies left {n}"],                                       // space.js:1795
  "space.allies":      ["同盟軍  {n} 架", "Allies {n}"],                                           // space.js:1802
  "space.shieldNo":    ["護盾無效", "Shield ineffective"],                                         // space.js:1778
  "space.moonCtrl":    ["WASD 移動　·　滑鼠瞄準 / 按住發射　·　Shift 加速", "WASD move · Mouse aim / hold to fire · Shift accelerate"], // space.js:1808

  /* ── index.html 靜態 UI ───────────────────────────────────── */
  "ui.start":       ["開始遊戲", "Start Game"],                                       // index.html:47
  "ui.continue":    ["繼續遊戲", "Continue"],                                         // index.html:48
  "ui.help":        ["操作說明", "Controls"],                                         // index.html:49
  "ui.hint":        ["WASD 游動　·　Shift 衝刺　·　滑鼠 瞄準／發射　·　B 基地　·　C 裝備　·　J 任務　·　Esc 暫停　·　M 靜音", "WASD swim · Shift sprint · Mouse aim/fire · B base · C gear · J quests · Esc pause · M mute"], // index.html:33
  "ui.kicker":      ["海洋生存 · 基地建造 · 星際復仇", "Ocean Survival · Base Building · Interstellar Revenge"], // index.html:39
  "ui.blurb":       ["外星飛船的一炮把你打進海裡，暗湧把你沖到無人的海域。收集海上漂流垃圾、建造會自己長大的自動化基地、派出 BOT 出海，最後造一艘太空船飛上月球——把帳算清楚。", "An alien ship blasts you into the sea, and the current drags you somewhere no one can find you. Collect drifting trash, grow an automated base, send out BOTs—then build a spacecraft and fly to the moon to settle the score."], // index.html:43-45
  "ui.ctrl":        ["WASD 游動 · Shift 衝刺 · 滑鼠瞄準 / 點擊發射 · B 基地 · C 裝備 · J 任務 · M 靜音", "WASD swim · Shift sprint · Mouse aim / click to fire · B base · C gear · J quests · M mute"], // index.html:51
  "ui.introNext":   ["繼續 ▸", "Continue ▸"],                                         // index.html:62
  "ui.endKicker":   ["任務完成", "Mission Complete"],                                 // index.html:70
  "ui.endTitle":    ["你贏了", "You win"],                                            // index.html:71
  "ui.endAgain":    ["重新開始", "Restart"],                                          // index.html:74
  "ui.htmlTitle":   ["逃出大海 — Escape the Sea", "Escape the Sea"],                  // index.html:6
};
```

## 1b. v0.5 面板字串（B 施工中；快照時已進 code）

> 「下一步提示／賞金終端／魚槍模組」是快照時已實作的新介面，與 §1 同一個字典；B 仍在改這幾段，合併後要重對行號。
> 另外 `initSea()` 的開場 toast 已在 v0.5 移除（改由 HUD 的「下一步」引導），所以 §1 沒有 `sea.intro`。

```js
  /* ── HUD「下一步」引導 nextStepText ── js/core.js:784-799 ── */
  "hint.back":     ["游回基地（{dist}）→ {step}", "Swim back to base ({dist}) → {step}"], // core.js:788
  "hint.net":      ["按 B 建造「自動收集網」", "Press B to build an Auto Collection Net"], // core.js:789
  "hint.equip":    ["按 B 建造「裝備房」", "Press B to build an Equipment Room"], // core.js:790
  "hint.bounty":   ["按 B 建造「賞金終端」→ 按 H 接合約", "Press B to build a Bounty Terminal → press H for contracts"], // core.js:791
  "hint.refill":   ["等 {n} 秒補新合約（按 H 查看）", "New contract in {n} s (press H to view)"], // core.js:792
  "hint.harpoon2": ["按 C 把壓縮魚槍升到 Lv2", "Press C to upgrade the Compressed Harpoon to Lv2"], // core.js:793
  "hint.tech":     ["打四角守衛（雷達紫色）或接賞金合約", "Fight the four guardians (purple on radar) or take bounty contracts"], // core.js:794
  "hint.rnd":      ["按 B 建造「火箭研發中心」", "Press B to build a Rocket R&D Center"], // core.js:795
  "hint.parts":    ["按 C 建造 4 個太空船零件", "Press C to build all 4 spacecraft parts"], // core.js:796
  "hint.dock":     ["按 B 建造「火箭工坊」", "Press B to build a Rocket Workshop"], // core.js:797
  "hint.launch":   ["按 C 發射太空船", "Press C to launch the spacecraft"], // core.js:798

  /* ── 賞金終端（H 面板）js/core.js:639-675 ─────────────────── */
  "bounty.title":        ["賞金終端 — 海上合約", "Bounty Terminal — Ocean Contracts"], // core.js:670
  "bounty.top":          ["合約 {n}/{slots} · 已完成 {done} 張 · 擊殺等級 T{tier}", "Contracts {n}/{slots} · Completed {done} · Kill tier T{tier}"], // core.js:671
  "bounty.reward":       ["獎勵：{list}", "Reward: {list}"], // core.js:648
  "bounty.claim":        ["領取獎勵", "Claim reward"], // core.js:650
  "bounty.progress":     ["進行中", "In progress"], // core.js:650
  "bounty.reroll":       ["換一張（{n} 金屬）", "Reroll ({n} Metal)"], // core.js:651
  "bounty.empty":        ["等待新合約…（{n} 秒內補上）", "Waiting for a new contract… (within {n} s)"], // core.js:656
  "bounty.note":         ["完成一張後 {refill} 秒補一張；{reroll} 金屬可換掉不想要的合約。擊殺與打撈進度會即時更新。", "A new contract arrives {refill} s after you finish one; {reroll} Metal rerolls an unwanted contract. Kill and salvage progress updates live."], // core.js:659
  "bounty.needTerminal": ["需要「賞金終端」— 在基地按 B 建造（金屬 14 · 塑膠 8）", "Requires a Bounty Terminal — build it from the base panel with B (Metal 14 · Plastic 8)"], // core.js:666
  "bounty.doneToast":    ["賞金合約完成：{text}（{rewards}）", "Bounty complete: {text} ({rewards})"], // core.js:628
  "bounty.rerollDeny":   ["金屬不足（需要 {n}）", "Not enough Metal (need {n})"], // core.js:634

  /* ── 魚槍模組（C 面板）js/core.js:991-1007 ────────────────── */
  "mod.title":      ["魚槍模組", "Harpoon Mods"], // core.js:993
  "mod.slots":      ["（{n} / 3 槽）", "({n} / 3 slots)"], // core.js:994
  "mod.needTable":  ["需要「模組工作台」（基地 B 面板建造：金屬 34 · 合金 5，需火箭研發中心）", "Requires a Mod Workbench (build from the base panel: Metal 34 · Alloy 5, needs Rocket R&D Center)"], // core.js:995
  "mod.equipped":   ["已裝備", "Equipped"], // core.js:1001
  "mod.emptySlot":  ["空模組槽 — 模組箱：巨獸／賞金獵首／裂縫核心", "Empty mod slot — mod boxes drop from Leviathans, bounty headhunts and Rift cores"], // core.js:1004
  "mod.full":       ["模組已滿 — 轉換為外星合金 +3", "Mods full — converted to Alien Alloy +3"], // core.js:680
  "mod.got":        ["取得模組：{name}（按 C 查看魚槍模組）", "Mod acquired: {name} (press C for Harpoon Mods)"], // core.js:684
```

## 2. v0.5 預定字串（尚未進 code，來源 `docs/design/DATA-v0.4.md`）

```js
  "struct.bounty.name":   ["賞金終端", "Bounty Terminal"],                    // DATA-v0.4.md:14
  "struct.bounty.desc":   ["解鎖賞金合約 — 擊殺與打撈都能換合金（按 H）", "Unlocks bounty contracts — kills and salvage pay in Alloy (H)"], // DATA-v0.4.md:15
  "struct.modtable.name": ["模組工作台", "Mod Workbench"],                    // DATA-v0.4.md:16
  "struct.modtable.desc": ["魚槍可插 3 個模組 — 穿透 · 爆裂 · 電磁", "Fit up to 3 harpoon mods — Pierce · Blast · EMP"], // DATA-v0.4.md:17
  "quest.bounty.text":    ["完成第一張賞金合約", "Complete your first bounty contract"], // DATA-v0.4.md:51
  "quest.bounty.sub":     ["按 H 打開賞金終端 — 擊殺與打撈都能換合金", "Press H for the Bounty Terminal — kills and salvage pay in Alloy"], // DATA-v0.4.md:51
  "quest.leviathan.text": ["擊敗第一隻深海巨獸", "Defeat your first Leviathan"], // DATA-v0.4.md:54
  "quest.leviathan.sub":  ["海域四角，雷達上是紫色漩渦", "In the four corners—purple swirls on the radar"], // DATA-v0.4.md:54
  "quest.mod.text":       ["把第一個模組裝上魚槍", "Install your first harpoon mod"], // DATA-v0.4.md:57
  "quest.mod.sub":        ["按 C → 魚槍模組，三個槽", "Press C → Harpoon Mods, three slots"], // DATA-v0.4.md:57
  "quest.rift.text":      ["在裂縫關閉前打爆它的核心", "Destroy the Rift core before it closes"], // DATA-v0.4.md:60
  "quest.rift.sub":       ["每 3 分鐘開一次，紫色漩渦", "Opens every 3 minutes—purple swirl"], // DATA-v0.4.md:60
  "bounty.cull":    ["清剿：鯊魚", "Cull: Sharks"],                          // DATA-v0.4.md:74
  "bounty.drone":   ["拆解：外星無人機", "Dismantle: Alien Drones"],          // DATA-v0.4.md:76
  "bounty.salvage": ["打撈：帶回塑膠", "Salvage: Bring back Plastic"],        // DATA-v0.4.md:78
  "bounty.patrol":  ["巡弋：待在深海或更遠", "Patrol: Stay in Deep Sea or beyond"], // DATA-v0.4.md:80
  "bounty.decap":   ["獵首：擊敗一隻深海巨獸", "Headhunt: Defeat a Leviathan"], // DATA-v0.4.md:82
  "toast.gotMod":   ["取得模組：{name}", "Mod acquired: {name}"],            // DATA-v0.4.md:117
```

## 3. 翻譯慣例（v0.8 一律照這個）

- **固定譯名**：基地 Base／安全圈 Safe Zone／科技碎片 Tech Shard／外星合金 Alien Alloy／母船 Mothership／艙壓 Cabin Pressure／賞金合約 Bounty Contract／深海巨獸 Leviathan／深海裂縫 Rift／魚槍 Harpoon／蛙鞋 Fins／潛水衣 Dive Suit／氧氣瓶 Oxygen Tank／磁力收集器 Magnetic Collector／逆向工程 Reverse Engineering／BOT 一律不翻。
- **語氣**：zh 玩家是「你」；en 用第二人稱、短句、動詞開頭（`Build`, `Collect`, `Destroy`），不用 "Please"、不用驚嘆號連發（`!` 最多一個）。
- **長度**：按鈕文字 en ≤ 22 字元；toast ≤ 60 字元；任務 text ≤ 50 字元、sub ≤ 70。超長就分成兩句。
- **格式**：句中 `·` 保留成 `·`（比 `|` 輕）；`—` 用 em dash；`×` 保留。
- **不要翻**：`BOT`、`YOU CHEATER!!!`（保留原文）、`Lv`、`HP`、`m`、`km`、`×`、資源圖示 emoji。
- **測試指令（v0.8 驗收）**：`__T` 開頭加 `__T.setLang('en')`；切換後所有 panel／toast／canvas 文字都要變，且 `localStorage['escape-the-sea-v2'].lang` 要保留。
