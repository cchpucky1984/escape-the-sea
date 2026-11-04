/* =========================================================
   逃出大海 Escape the Sea — i18n 字典（zh-Hant → en）
   產出：E（企劃／行銷）· 2026-11-04 · v0.6 快照（B 同輪仍在施工）
   用法：<script src="docs/i18n/STRINGS.js"></script> 後讀 window.I18N_DATA[key][0|1]
   格式：{ "key": [zh-Hant, en] }；每條尾端 // 檔案:行號（快照位置）
   條數：425（其中 v0.6 code 字串已含成就 24、海域事件 8、設定面板；挑戰／教學／NG+ 仍為文件預定）
   快照：core 1568 · sea 1362 · space 1811 · base 1081 · main 364 · events 728 · leviathan 606 · fx 640 · index.html 99
   SHA-256 前 12 碼：{"core.js":"ad43512b9fc1","sea.js":"fbfebd951a73","space.js":"75d8c3fff5cd","base.js":"5a0cae07eec2","main.js":"ce3f2886b7d8","events.js":"1c5383ee55c7","leviathan.js":"2a0c85ed16fb","fx.js":"0c82a46c68ab","index.html":"9a7b14eb9e8b"}
   ⚠️ B／D 仍在改 js（core.js 於本輪持續變動），行號是快照；合併後用「以 zh 字串搜尋最近行」重對。
   ========================================================= */
window.I18N_DATA = {
  /* ── 資源 RESMETA ── */
  "res.plastic":               ["塑膠","Plastic"], // core.js:267
  "res.wood":                  ["木材","Wood"], // core.js:268
  "res.metal":                 ["金屬","Metal"], // core.js:269
  "res.alloy":                 ["外星合金","Alien Alloy"], // core.js:270
  /* ── 魚槍模組 MODS ── */
  "mod.pierce.name":           ["穿透模組","Piercing Module"], // core.js:281
  "mod.pierce.desc":           ["子彈穿過目標 — 最多 3 個，傷害遞減","Bullets pierce up to 3 targets, with damage falloff"], // core.js:281
  "mod.blast.name":            ["爆裂模組","Blast Module"], // core.js:282
  "mod.blast.desc":            ["命中炸開 — 周圍敵人吃 55% 傷害","Explodes on hit — nearby enemies take 55% damage"], // core.js:282
  "mod.emp.name":              ["電磁模組","EMP Module"], // core.js:283
  "mod.emp.desc":              ["18% 機率讓目標停擺 1.2 秒","18% chance to stun the target for 1.2 s"], // core.js:283
  "mod.title":                 ["魚槍模組","Harpoon Modules"], // core.js:406
  "mod.slots":                 ["（{n} / 3 槽）","({n} / 3 slots)"], // core.js:1239
  "mod.needTable":             ["需要「模組工作台」（基地 B 面板建造：金屬 34 · 合金 5，需火箭研發中心）","Requires a Module Workbench (build from the base panel: Metal 34 · Alloy 5, needs Rocket R&D Center)"], // core.js:1240
  "mod.equipped":              ["已裝備","Equipped"], // core.js:1246
  "mod.emptySlot":             ["空模組槽 — 模組箱：巨獸／賞金獵首／裂縫核心","Empty module slot — module boxes drop from Leviathans, bounty headhunts and Rift cores"], // core.js:1249
  "mod.full":                  ["模組已滿 — 轉換為外星合金 +3","Modules full — converted to Alien Alloy +3"], // core.js:905
  "mod.got":                   ["取得模組：{name}（按 C 查看魚槍模組）","Module acquired: {name} (press C for Harpoon Modules)"], // core.js:909
  /* ── 裝備 UPG ── */
  "upg.fin.name":              ["推進蛙鞋","Propulsion Fins"], // core.js:289
  "upg.fin.desc":              ["游泳速度 +{n}%","Swim speed +{n}%"], // core.js:289
  "upg.tank.name":             ["鈦合金氧氣瓶","Titanium Oxygen Tank"], // core.js:291
  "upg.tank.desc":             ["氧氣 +{n} · 消耗 -{m}%","Oxygen +{n} · drain -{m}%"], // core.js:291
  "upg.suit.name":             ["深海潛水衣","Deep-Sea Dive Suit"], // core.js:293
  "upg.suit.desc":             ["最大生命 {n} HP（每級 +1）","Max HP {n} (+1 per level)"], // core.js:293
  "upg.magnet.name":           ["磁力收集器","Magnetic Collector"], // core.js:295
  "upg.magnet.desc":           ["收集範圍 +{n}","Collection range +{n}"], // core.js:295
  "upg.harpoon.name":          ["壓縮魚槍","Compressed Harpoon"], // core.js:297
  "upg.harpoon.desc":          ["傷害 {n} · 射速 +{m}%","Damage {n} · Fire rate +{m}%"], // core.js:297
  /* ── 建築 STRUCTS ── */
  "struct.net.name":           ["自動收集網","Auto Collection Net"], // core.js:324
  "struct.net.desc":           ["每 5 秒 +1 塑膠 · +1 木材","+1 Plastic and +1 Wood every 5 s"], // core.js:325
  "struct.recycler.name":      ["分解工坊","Salvage Works"], // core.js:326
  "struct.recycler.desc":      ["每 5 秒 +1 金屬","+1 Metal every 5 s"], // core.js:327
  "struct.botdock.name":       ["BOT 船塢","BOT Dock"], // core.js:328
  "struct.botdock.desc":       ["派出一台 BOT 自動出海收集物資","Sends a BOT out to gather salvage automatically"], // core.js:329
  "struct.equip.name":         ["裝備房","Equipment Room"], // core.js:330
  "struct.equip.desc":         ["解鎖裝備升級（C 面板）","Unlocks gear upgrades (C panel)"], // core.js:331
  "struct.rnd.name":           ["火箭研發中心","Rocket R&D Center"], // core.js:332
  "struct.rnd.desc":           ["解鎖火箭科技與超級武器","Unlocks rocket tech and superweapons"], // core.js:333
  "struct.tower.name":         ["防禦炮塔","Defense Turret"], // core.js:334
  "struct.tower.desc":         ["自動射擊 360 範圍內的威脅","Auto-fires at threats within 360°"], // core.js:335
  "struct.reverse.name":       ["外星逆向工程","Alien Reverse Engineering"], // core.js:336
  "struct.reverse.desc":       ["每 10 秒 +1 外星合金","+1 Alien Alloy every 10 s"], // core.js:337
  "struct.satellite.name":     ["衛星光束發生器","Orbital Beam Generator"], // core.js:338
  "struct.satellite.desc":     ["決戰時呼叫軌道衛星光束","Calls down an orbital beam in the final battle"], // core.js:339
  "struct.dock.name":          ["火箭工坊","Rocket Workshop"], // core.js:340
  "struct.dock.desc":          ["解鎖太空船組裝與發射","Unlocks spacecraft assembly and launch"], // core.js:341
  "struct.bounty.name":        ["賞金終端","Bounty Terminal"], // core.js:342
  "struct.bounty.desc":        ["解鎖賞金合約 — 擊殺與打撈都能換合金（按 H）","Unlocks bounty contracts — kills and salvage pay in Alloy (H)"], // core.js:343
  "struct.modtable.name":      ["模組工作台","Module Workbench"], // core.js:344
  "struct.modtable.desc":      ["魚槍可插 3 個模組 — 穿透 · 爆裂 · 電磁","Fit up to 3 harpoon modules — Pierce · Blast · EMP"], // core.js:345
  /* ── 建築標籤 ── */
  "tag.prod":                  ["生產","Production"], // core.js:324
  "tag.auto":                  ["自動化","Automation"], // core.js:328
  "tag.required":              ["必要","Required"], // core.js:330
  "tag.defense":               ["防禦","Defense"], // core.js:334
  "tag.rare":                  ["稀有","Rare"], // core.js:336
  "tag.superweapon":           ["超級武器","Superweapon"], // core.js:333
  /* ── 太空船零件 PARTS ── */
  "part.hull.name":            ["船體","Hull"], // core.js:350
  "part.hull.desc":            ["耐壓艙體與隔熱層","Pressure hull and heat shielding"], // core.js:350
  "part.engine.name":          ["離子引擎","Ion Engine"], // core.js:351
  "part.engine.desc":          ["突破大氣層的推力","Thrust to break through the atmosphere"], // core.js:351
  "part.fuel.name":            ["燃料槽","Fuel Tank"], // core.js:352
  "part.fuel.desc":            ["液態氫與氧化劑","Liquid hydrogen and oxidizer"], // core.js:352
  "part.nav.name":             ["導航電腦","Navigation Computer"], // core.js:353
  "part.nav.desc":             ["鎖定月球上的外星旗艦","Locks onto the alien mothership in lunar orbit"], // core.js:353
  /* ── 開場劇情 ── */
  "intro.1":                   ["那天的海很平靜。我在淺灘游泳，直到天空裂開。","The sea was calm that day. I was swimming in the shallows when the sky split open."], // core.js:357
  "intro.2":                   ["外星飛船的巨炮擊中海面，氣流把我整個人捲進水裡。","The alien ship's cannon hit the water and the blast sucked me under."], // core.js:358
  "intro.3":                   ["暗湧一路把我沖出去——再浮上水面時，已經看不見岸，也看不見船。","The undercurrent dragged me out—when I surfaced, I could see neither shore nor ship."], // core.js:359
  "intro.4":                   ["沒關係。海上有無盡的垃圾，而垃圾就是材料。","Doesn't matter. The sea is full of trash, and trash is material."], // core.js:360
  "intro.5":                   ["收集、建造、升級。總有一天，我要飛上去，把這筆帳算清楚。","Gather. Build. Upgrade. One day I'll fly up there and settle the score."], // core.js:361
  /* ── 任務 QUESTS ── */
  "quest.collect.text":        ["收集 15 件海上垃圾","Collect 15 pieces of ocean trash"], // core.js:366
  "quest.collect.sub":         ["游過漂流垃圾就會自動吸進背包","Drift close to trash and your suit pulls it in"], // core.js:366
  "quest.net.text":            ["建造第一座自動收集網","Build your first Auto Collection Net"], // core.js:369
  "quest.net.sub":             ["按 B（要游回基地附近才能建造）","Press B (swim back near your base to build)"], // core.js:369
  "quest.equip.text":          ["建造裝備房","Build an Equipment Room"], // core.js:372
  "quest.equip.sub":           ["有裝備房才能升級裝備","You need an Equipment Room to upgrade gear"], // core.js:372
  "quest.harpoon.text":        ["把壓縮魚槍升級到 Lv2","Upgrade the Compressed Harpoon to Lv2"], // core.js:375
  "quest.harpoon.sub":         ["按 C 升級裝備（需在基地附近）","Press C to upgrade gear (must be near base)"], // core.js:375
  "quest.rnd.text":            ["建造火箭研發中心","Build a Rocket R&D Center"], // core.js:378
  "quest.rnd.sub":             ["解鎖火箭科技與超級武器","Unlocks rocket tech and superweapons"], // core.js:333
  "quest.tech.text":           ["擊敗海域四角的守衛，收集 4 塊科技碎片","Defeat the four corner leviathans, collect 4 Tech Shards"], // core.js:381
  "quest.tech.sub":            ["四角各一隻守衛，雷達上是紫色標記","One leviathan per corner—purple markers on the radar"], // core.js:381
  "quest.shield.text":         ["在研發中心解鎖火箭護盾科技","Unlock Rocket Shield tech at the R&D Center"], // core.js:384
  "quest.shield.sub":          ["需要 4 塊科技碎片","Requires 4 Tech Shards"], // core.js:384
  "quest.parts.text":          ["組裝 4 個太空船零件","Assemble all 4 spacecraft parts"], // core.js:387
  "quest.parts.sub":           ["按 C 在「太空船」區建造","Press C and build in the Spacecraft section"], // core.js:387
  "quest.maxgun.text":         ["把壓縮魚槍升到最高級","Max out the Compressed Harpoon"], // core.js:390
  "quest.maxgun.sub":          ["母船內部：未滿級傷害只有 10%","In the mothership, damage is only 10% below max level"], // core.js:390
  "quest.launch.text":         ["發射太空船","Launch the spacecraft"], // core.js:393
  "quest.launch.sub":          ["按 C 按下發射，前往母船","Press C, then Launch, and head for the mothership"], // core.js:393
  "quest.boss.text":           ["擊敗母船核心","Destroy the Mothership Core"], // core.js:396
  "quest.boss.sub":            ["攻入外星母船，擊毀反應爐核心","Board the alien mothership and destroy the reactor core"], // core.js:396
  "quest.bounty.text":         ["完成第一張賞金合約","Complete your first bounty contract"], // core.js:399
  "quest.bounty.sub":          ["按 H 打開賞金終端 — 擊殺與打撈都能換合金","Press H for the Bounty Terminal — kills and salvage pay in Alloy"], // core.js:399
  "quest.leviathan.text":      ["擊敗第一隻深海巨獸","Defeat your first Leviathan"], // core.js:402
  "quest.leviathan.sub":       ["海域四角，雷達上是紫色漩渦","In the four corners—purple swirls on the radar"], // core.js:402
  "quest.mod.text":            ["把第一個模組裝上魚槍","Install your first harpoon module"], // core.js:406
  "quest.mod.sub":             ["按 C → 魚槍模組，三個槽","Press C → Harpoon Modules, three slots"], // core.js:406
  "quest.rift.text":           ["在裂縫關閉前打爆它的核心","Destroy the Rift core before it closes"], // core.js:409
  "quest.rift.sub":            ["每 3 分鐘開一次，紫色漩渦","Opens every 3 minutes—purple swirl"], // core.js:409
  /* ── 海域 ── */
  "zone.near.name":            ["近海","Nearshore"], // sea.js:19
  "zone.near.tip":             ["資源 ×1 · 威脅低","Resources ×1 · Low threat"], // sea.js:19
  "zone.mid.name":             ["外海","Open Sea"], // sea.js:20
  "zone.mid.tip":              ["資源 ×1.3 · 威脅中","Resources ×1.3 · Medium threat"], // sea.js:20
  "zone.deep.name":            ["深海","Deep Sea"], // sea.js:21
  "zone.deep.tip":             ["資源 ×1.6 · 威脅高","Resources ×1.6 · High threat"], // sea.js:21
  "zone.far.name":             ["遠洋","High Seas"], // sea.js:22
  "zone.far.tip":              ["資源 ×2 · 極度危險","Resources ×2 · Extreme danger"], // sea.js:22
  /* ── 守衛 ── */
  "boss.nw":                   ["西北守衛","Northwest Guardian"], // sea.js:26
  "boss.ne":                   ["東北守衛","Northeast Guardian"], // sea.js:27
  "boss.sw":                   ["西南守衛","Southwest Guardian"], // sea.js:28
  "boss.se":                   ["東南守衛","Southeast Guardian"], // sea.js:29
  /* ── HUD ── */
  "hud.zoneCap":               ["怪物上限 {n}","Threat cap {n}"], // core.js:985
  "hud.compass":               ["基地 {dist}","Base {dist}"], // sea.js:967
  "hud.quest":                 ["任務 {done}/{total}","Quests {done}/{total}"], // core.js:1008
  "hud.questAllDone":          ["全部任務完成 — 你已經把帳算清楚了","All quests complete — the score is settled"], // core.js:1079
  "hud.idleNone":              ["基地尚未自動化 — 按 B 建造收集網與 BOT 船塢","Base not automated yet — press B to build a Collection Net and a BOT Dock"], // core.js:1051
  "hud.idleEvery5":            ["基地每 5 秒：","Base every 5 s:"], // core.js:1053
  "hud.idleAlloy":             ["合金+{n}（每10秒）","Alloy +{n} (every 10 s)"], // core.js:1052
  "hud.safeResupply":          ["安全區 · 補給中","Safe zone · resupplying"], // core.js:1061
  "hud.baseCount":             ["基地 {n} 座","Base: {n} buildings"], // core.js:891
  "hud.baseTiles":             ["平台 {n} 格","Platform: {n} tiles"], // core.js:1063
  "hud.baseRadius":            ["安全圈 {n} m","Safe zone {n} m"], // core.js:1064
  "hud.baseBots":              ["BOT {n}/{max}","BOT {n}/{max}"], // core.js:1051
  "hud.baseShards":            ["科技碎片 {n}/4","Tech Shards {n}/4"], // core.js:1066

  /* ── 海面浮字 ── */
  "sea.death.title":           ["失去意識…","You black out…"], // sea.js:198
  "sea.death.body":            ["海水灌進面罩。你最後看見的，是頭頂那道搖晃的光。","Seawater floods your mask. The last thing you see is the wavering light above."], // sea.js:198
  "sea.death.lost":            ["失去 15% 塑膠（{n} 件）","Lost 15% of your plastic ({n} pieces)"], // sea.js:200
  "sea.death.btn":             ["爬起來","Get up"], // sea.js:201
  "sea.crate":                 ["補給箱！","Supply crate!"], // sea.js:226
  "sea.air":                   ["+ 氧氣","+ Oxygen"], // sea.js:233
  "sea.baseprod":              ["基地生產","Base production"], // sea.js:264
  "sea.bossKill":              ["擊敗{name} — 取得科技碎片 {n}/4","Defeated {name} — Tech Shard {n}/4"], // sea.js:340
  "sea.techFull":              ["4 塊碎片齊集！到火箭研發中心研發「火箭護盾科技」","All 4 shards collected! Research Rocket Shield tech at the R&D Center"], // sea.js:341
  "sea.safe":                  ["安全區","Safe Zone"], // sea.js:477
  "sea.repaired":              ["維修完成","Repairs complete"], // sea.js:489
  "sea.pickupFloat":           ["+{amt} {res} ×{mult}","+{amt} {res} ×{mult}"], // sea.js:245
  /* ── BOT ── */
  "bot.recycled":              ["BOT 回收","BOT salvaged"], // base.js:217
  "bot.returned":              ["BOT 帶回 {n} 件","BOT brought back {n} items"], // base.js:229
  "bot.patrol":                ["打撈 +1","Salvaged +1"], // base.js:267

  /* ── 基地面板 ── */
  "base.built":                ["建造完成","Construction complete"], // base.js:149
  "base.supply":               ["補給站","Supply Station"], // base.js:495
  "base.safeTag":              ["安全區 · 敵怪無法進入","Safe zone · enemies cannot enter"], // base.js:585
  "base.gearTag":              ["裝備","Gear"], // base.js:847
  "base.title":                ["自動化基地 — 海上平台","Automated Base — Ocean Platform"], // core.js:1159
  "base.rows":                 ["建築 / 平台","Buildings / Platforms"], // core.js:1135
  "base.radiusRow":            ["安全圈半徑","Safe zone radius"], // core.js:1136
  "base.botRow":               ["BOT 艦隊","BOT Fleet"], // core.js:1137
  "base.botAuto":              ["（自動出海收集）","(auto-gathers at sea)"], // core.js:1137
  "base.per5":                 ["每 5 秒產出","Output every 5 s"], // core.js:1138
  "base.shardRow":             ["科技碎片","Tech Shards"], // core.js:1066
  "base.shardReady":           ["· 已可研發護盾","· shield ready"], // core.js:1139
  "base.shardHint":            ["· 擊敗四角守衛","· defeat the four leviathans"], // core.js:1139
  "base.summaryHint":          ["每次建造都會在平台上多佔一格，基地會一格格長大。敵怪無法進入安全圈。","Every building adds a tile—your base grows tile by tile. Enemies cannot enter the safe zone."], // core.js:1143
  "base.maxed":                ["已達上限","At max"], // core.js:1151
  "base.locked":               ["需要：{name}","Requires: {name}"], // core.js:1152
  "base.build":                ["建造（第 {n} 座）","Build (#{n})"], // core.js:1154
  "base.close":                ["關閉 (Esc)","Close (Esc)"], // core.js:897

  /* ── toast ── */
  "toast.needBase":            ["距離基地 {dist} — 游回安全圈再按 B","Base {dist} away — swim back into the safe zone, then press B"], // core.js:1121
  "toast.needBase2":           ["距離基地 {dist} — 游回安全圈再按 C","Base {dist} away — swim back into the safe zone, then press C"], // core.js:1121
  "toast.needStruct":          ["需要先建造{name}","Build the {name} first"], // core.js:1165
  "toast.noRes":               ["資源不足","Not enough resources"], // core.js:1167
  "toast.structBuilt":         ["{name} 建造完成 — 平台擴張中","{name} built — platform expanding"], // core.js:1170
  "toast.questDone":           ["任務完成：{text}{rewards}","Quest complete: {text}{rewards}"], // core.js:1501
  "toast.gotMod":              ["取得模組：{name}","Module acquired: {name}"], // DATA-v0.4.md:117

  /* ── 裝備／太空船面板 ── */
  "craft.title":               ["裝備 · 火箭科技 · 太空船","Gear · Rocket Tech · Spacecraft"], // core.js:1278
  "craft.equipTitle":          ["裝備升級","Gear Upgrades"], // core.js:1196
  "craft.needEquipTip":        ["— 需先建造「裝備房」","— Build an Equipment Room first"], // core.js:1197
  "craft.maxed":               ["已達最高等級","Max level"], // core.js:1205
  "craft.needEquip":           ["需要裝備房","Requires Equipment Room"], // core.js:1206
  "craft.upgradeTo":           ["升級至 Lv {n}","Upgrade to Lv {n}"], // core.js:1208
  "craft.make":                ["製作","Craft"], // core.js:1208
  "craft.rocketTitle":         ["火箭科技","Rocket Tech"], // core.js:1213
  "craft.inherit":             ["（速度＝蛙鞋　武器＝魚槍　裝甲＝潛水衣）","(Speed = Fins · Weapon = Harpoon · Armor = Dive Suit)"], // core.js:1216
  "craft.shieldName":          ["火箭護盾科技","Rocket Shield Tech"], // core.js:1218
  "craft.shieldDesc":          ["升空與登艦時，船體額外 +25 裝甲，並減少砲火傷害","+25 hull armor during launch and docking, and reduced gunfire damage"], // core.js:1219
  "craft.needRnd":             ["需要火箭研發中心","Requires Rocket R&D Center"], // core.js:1221
  "craft.needShards":          ["需要 4 塊科技碎片（{n}/4）","Requires 4 Tech Shards ({n}/4)"], // core.js:1222
  "craft.research":            ["研發護盾","Research Shield"], // core.js:1139
  "craft.satName":             ["衛星光束發生器","Orbital Beam Generator"], // core.js:1227
  "craft.built":               ["已建造","Built"], // core.js:1228
  "craft.notBuilt":            ["未建造","Not built"], // core.js:1228
  "craft.satDesc":             ["決戰時呼叫軌道衛星，兩發藍色光束直接打穿母船核心（在基地 B 建造）","Calls an orbital satellite in the final battle—two blue beams pierce the mothership core (build it with B)"], // core.js:1229
  "craft.ready":               ["✓ 已就緒","✓ Ready"], // core.js:1230
  "craft.satCost":             ["可在基地面板建造（金屬 45 · 塑膠 30 · 合金 8）","Build from the base panel (Metal 45 · Plastic 30 · Alloy 8)"], // core.js:1231
  "craft.partsTitle":          ["太空船零件","Spacecraft Parts"], // core.js:1025
  "craft.done":                ["完成","Done"], // core.js:1079
  "craft.installed":           ["✓ 已安裝","✓ Installed"], // core.js:1261
  "craft.buildPart":           ["建造零件","Build Part"], // core.js:1263
  "craft.launchReady":         ["太空船組裝完成，隨時可以發射。","Spacecraft assembled — ready to launch."], // core.js:1270
  "craft.launchReq":           ["發射條件：4 個零件 + 火箭工坊 ×1","To launch: 4 parts + 1 Rocket Workshop"], // core.js:1270
  "craft.moonDetected":        ["月球軌道上偵測到外星母船。","Alien mothership detected in lunar orbit."], // core.js:1271
  "craft.partProgress":        ["零件進度 {n}/4","Parts {n}/4"], // core.js:1271
  "craft.noDock":              ["· 尚未建造火箭工坊","· Rocket Workshop not built yet"], // core.js:1271
  "craft.launch":              ["發射太空船 →","Launch Spacecraft →"], // core.js:1273
  "craft.upgraded":            ["{name} → Lv {n}","{name} → Lv {n}"], // core.js:1290
  "craft.shieldUp":            ["火箭護盾科技 → Lv {n}","Rocket Shield Tech → Lv {n}"], // core.js:1311

  /* ── 作弊 ── */
  "cheat.desc":                ["作弊模式：以下升級完全免費，與正常升級疊加，整場有效。","Cheat mode: these upgrades are free, stack with normal upgrades, and last the whole run."], // core.js:1322
  "cheat.full":                ["作弊已滿","Cheat maxed"], // core.js:1328
  "cheat.free":                ["免費升級","Free upgrade"], // core.js:1329
  "cheat.title":               ["YOU CHEATER!!! — 免費裝備","YOU CHEATER!!! — Free Gear"], // core.js:1333
  "cheat.take":                ["收下 (Esc)","Take it (Esc)"], // core.js:1333
  "cheat.open":                ["開啟作弊裝備（免費）","Open cheat gear (free)"], // core.js:1276
  "cheat.toast":               ["YOU CHEATER!!! — 開局後會彈出免費裝備","YOU CHEATER!!! — free gear will pop up when the run starts"], // main.js:40

  /* ── 任務面板 ── */
  "quests.body":               ["完成任務會獲得資源獎勵。任務只是引導，你可以用任何順序建造。","Quests reward resources. They are guidance—build in any order."], // core.js:1391
  "quests.title":              ["任務","Quests"], // core.js:1081

  /* ── 操作說明 ── */
  "help.title":                ["操作說明","Controls"], // core.js:1418
  "help.swim":                 ["游動","Swim"], // core.js:1408
  "help.sprint":               ["衝刺（消耗體力）","Sprint (uses stamina)"], // core.js:1409
  "help.aim":                  ["瞄準、發射魚槍","Aim and fire the harpoon"], // core.js:1410
  "help.base":                 ["自動化基地：建造新建築（平台會擴張）","Automated base: build structures (the platform expands)"], // core.js:1411
  "help.craft":                ["裝備升級 / 魚槍模組 / 太空船","Gear upgrades / harpoon modules / spacecraft"], // core.js:1412
  "help.bounty":               ["賞金合約（需賞金終端）","Bounty contracts (requires Bounty Terminal)"], // core.js:1413
  "help.quests":               ["任務清單","Quest list"], // core.js:1414
  "help.esc":                  ["關閉面板 / 暫停","Close panel / pause"], // core.js:1415
  "help.mute":                 ["音效開關","SFX on/off"], // core.js:1416
  "help.note":                 ["基地安全圈內不會被攻擊，敵怪也無法進入。氧氣耗盡會扣血——靠近基地或撿空氣泡補充。","The base safe zone blocks attacks and enemies. Running out of oxygen drains HP—return to base or grab air bubbles."], // core.js:1419
  "help.ok":                   ["知道了","Got it"], // core.js:1420

  /* ── 暫停 ── */
  "pause.title":               ["已暫停","Paused"], // core.js:1479
  "pause.body":                ["海面暫時靜了下來。你的基地仍在自動生產。","The sea is quiet for a moment. Your base keeps producing."], // core.js:1479
  "pause.resume":              ["繼續遊戲","Resume"], // core.js:1471
  "pause.soundOn":             ["音效：開啟","SFX: on"], // core.js:1472
  "pause.soundOff":            ["音效：關閉","SFX: off"], // core.js:1472
  "pause.help":                ["操作說明","Controls"], // core.js:1418
  "pause.cheat":               ["作弊裝備","Cheat Gear"], // core.js:1276
  "pause.restart":             ["重新開始","Restart"], // core.js:1478
  "pause.settings":            ["音量設定","Volume settings"], // core.js:1474

  /* ── 結局 ── */
  "end.winKicker":             ["任務完成 · 母船決戰","Mission Complete · Mothership Battle"], // core.js:1548
  "end.loseKicker":            ["任務失敗","Mission Failed"], // core.js:1548
  "end.winTitle":              ["你把帳算清了","The score is settled"], // core.js:1549
  "end.loseTitle":             ["你被擊落了","Shot down"], // core.js:1549
  "end.winText":               ["母船核心在你眼前炸開，整艘巨艦從內部亮成一顆白色的星。同盟軍的戰機從火球兩側穿出來，護著你的逃生艙往外飛。「任務完成，歡迎回家。」——遠處那顆藍色星球上，有一片海在等你。","The mothership core bursts open and the whole ship lights up like a white star. Alliance fighters cut through the fireball and escort your escape pod out. \"Mission complete. Welcome home.\" Far below, a blue planet has a sea waiting for you."], // core.js:1551
  "end.loseText":              ["太空裝的警報聲蓋過了所有聲音。你按下了緊急撤離，艙體拖著黑煙墜回海面。","The suit's alarm drowns out everything. You hit emergency eject and the pod falls back to the sea, trailing black smoke."], // core.js:1552
  "end.statTime":              ["遊戲時間","Play time"], // core.js:1554
  "end.statTrash":             ["收集垃圾","Trash collected"], // core.js:1555
  "end.statBuild":             ["基地建築","Base buildings"], // core.js:1556
  "end.statKills":             ["擊殺敵人","Kills"], // core.js:1557
  "end.statGear":              ["裝備等級","Gear levels"], // core.js:1558

  /* ── main.js ── */
  "main.soundOff":             ["音效已關閉","SFX off"], // main.js:65
  "main.soundOn":              ["音效已開啟","SFX on"], // main.js:65
  "main.goal":                 ["先游回基地 → 按 B 建造（基地在 {dist} 外；HUD 左上會顯示下一步）","Swim back to base → press B to build (base is {dist} away; the HUD shows your next step)"], // main.js:232
  "main.welcome":              ["歡迎回來 — 繼續你的工程","Welcome back — continue the build"], // main.js:249
  "main.noSave":               ["沒有可用的存檔","No save found"], // main.js:251
  "main.restart":              ["重新開始","Restart"], // main.js:317

  /* ── space.js ── */
  "space.notReady":            ["太空船尚未完成","Spacecraft is not ready"], // space.js:14
  "space.ignite":              ["點火！A / D 左右閃避，W 加速；艦上防禦炮會自動開火","Ignition! A/D to dodge, W to accelerate; the turret fires automatically"], // space.js:47
  "space.breach":              ["突破大氣層 — 母船就在月球軌道上","Atmosphere breached — the mothership is in lunar orbit"], // space.js:191
  "space.failTitle":           ["太空船解體","Spacecraft broke apart"], // space.js:198
  "space.failBody":            ["船體承受不住高速上升的震動，隔熱層一塊塊剝落。你按下了緊急分離。","The hull can't take the vibration of the ascent; the heat shield peels off in pieces. You hit emergency separation."], // space.js:198
  "space.repair":              ["返回基地修理","Return to base for repairs"], // space.js:200
  "space.back":                ["回到基地 — 重新發射即可","Back at base — launch again when ready"], // space.js:208
  "space.altitude":            ["上升高度","Altitude"], // space.js:438
  "space.hull":                ["船體","Hull"], // space.js:457
  "space.launchCtrl":          ["A / D 閃避　·　W 加速上升　·　艦炮等級 Lv{n}（打不穿戰機護盾）","A/D dodge · W accelerate · Gun Lv{n} (can't pierce fighter shields)"], // space.js:470
  "space.launchWarn":          ["武器等級不足 3 — 外星戰機有護盾，只能靠閃避","Weapon below Lv3 — alien fighters have shields; dodge them"], // space.js:473
  "space.hangarToast":         ["衝進母船機庫 — 按住 W 前進，避開砲火","Breach the hangar — hold W and dodge the fire"], // space.js:499
  "space.dockFailTitle":       ["太空船被擊落","Spacecraft shot down"], // space.js:563
  "space.dockFailBody":        ["母船的防禦砲火把太空船撕開。你彈射出去，看著它燒成碎片。","The mothership's guns tear the spacecraft apart. You eject and watch it burn."], // space.js:563
  "space.hangarTitle":         ["外星母船 · 機庫入口","Alien Mothership · Hangar Bay"], // space.js:803
  "space.hangarCtrl":          ["WASD 飛行　·　W 前進（母船引力會把你往後拉）","WASD to fly · W to advance (mothership gravity drags you back)"], // space.js:806
  "space.moonEnter":           ["艙壓 {hp} · 裝甲 {pct}%　—　目標：核心反應爐","Cabin Pressure {hp} · Armor {pct}% — Objective: Reactor Core"], // space.js:849
  "space.moonNoDmg":           ["武器 Lv{n} — 外星人有護盾，攻擊無效","Weapon Lv{n} — aliens have shields; attacks have no effect"], // space.js:850
  "space.moonReduced":         ["武器 Lv{n} — 護盾減傷，傷害 {pct}%","Weapon Lv{n} — shields reduce damage to {pct}%"], // space.js:850
  "space.wave":                ["母船守軍 · 第 {n} 波","Mothership Guard · Wave {n}"], // space.js:872
  "space.core":                ["母船核心 · 反應爐","Mothership Core · Reactor"], // space.js:878
  "space.coreHit":             ["擊毀核心！","Core destroyed!"], // space.js:882
  "space.loseTitle":           ["太空裝失效","Suit failure"], // space.js:965
  "space.loseBody":            ["面罩裂開，氧氣在母船的冷光裡無聲地流走。你的視線慢慢變暗……","The faceplate cracks and oxygen streams away in the cold light. Your vision fades…"], // space.js:965
  "space.retry":               ["再次出擊","Attack again"], // space.js:967
  "space.returnBase":          ["返回基地","Return to base"], // space.js:968
  "space.radio":               ["「這裡是地球同盟軍第三艦隊——我們來接你回家了。」","\"This is the Earth Alliance Third Fleet—we're here to bring you home.\""], // space.js:1002
  "space.alliance":            ["人類同盟軍 抵達","Earth Alliance Arrives"], // space.js:1004
  "space.allianceToast":       ["人類同盟軍加入戰鬥！","Earth Alliance joins the fight!"], // space.js:1010
  "space.beam1":               ["衛星光束 · 鎖定核心","Orbital Beam · Core Locked"], // space.js:1156
  "space.beam2":               ["衛星光束 · 最終一擊","Orbital Beam · Final Strike"], // space.js:1163
  "space.cabin":               ["艙壓","Cabin Pressure"], // space.js:1742
  "space.armorLine":           ["裝甲 {pct}%　·　火力 ×{mult}","Armor {pct}% · Firepower ×{mult}"], // space.js:1760
  "space.supplies":            ["　·　補給艙 {n}"," · Supply pods {n}"], // space.js:1761
  "space.moonTitle":           ["外星母船 · 內部　第 {n} 波","Alien Mothership · Interior — Wave {n}"], // space.js:1766
  "space.enemies":             ["剩餘敵人 {n}","Enemies left {n}"], // space.js:1795
  "space.allies":              ["同盟軍  {n} 架","Allies {n}"], // space.js:1802
  "space.shieldNo":            ["護盾無效","Shield ineffective"], // space.js:1778
  "space.moonCtrl":            ["WASD 移動　·　滑鼠瞄準 / 按住發射　·　Shift 加速","WASD move · Mouse aim / hold to fire · Shift accelerate"], // space.js:1808

  /* ── index.html 靜態 UI ── */
  "ui.start":                  ["開始遊戲","Start Game"], // index.html:49
  "ui.continue":               ["繼續遊戲","Continue"], // index.html:50
  "ui.help":                   ["操作說明","Controls"], // index.html:51
  "ui.hint":                   ["WASD 游動　·　Shift 衝刺　·　滑鼠 瞄準／發射　·　B 基地　·　C 裝備　·　J 任務　·　Esc 暫停　·　M 靜音","WASD swim · Shift sprint · Mouse aim/fire · B base · C gear · J quests · Esc pause · M mute"], // index.html:35
  "ui.kicker":                 ["海洋生存 · 基地建造 · 星際復仇","Ocean Survival · Base Building · Interstellar Revenge"], // index.html:41
  "ui.blurb":                  ["外星飛船的一炮把你打進海裡，暗湧把你沖到無人的海域。收集海上漂流垃圾、建造會自己長大的自動化基地、派出 BOT 出海，最後造一艘太空船飛上月球——把帳算清楚。","An alien ship blasts you into the sea, and the current drags you somewhere no one can find you. Collect drifting trash, grow an automated base, send out BOTs—then build a spacecraft and fly to the moon to settle the score."], // index.html:45
  "ui.ctrl":                   ["WASD 游動 · Shift 衝刺 · 滑鼠瞄準 / 點擊發射 · B 基地 · C 裝備 · J 任務 · M 靜音","WASD swim · Shift sprint · Mouse aim / click to fire · B base · C gear · J quests · M mute"], // index.html:53
  "ui.introNext":              ["繼續 ▸","Continue ▸"], // index.html:64
  "ui.endKicker":              ["任務完成","Mission Complete"], // index.html:72
  "ui.endTitle":               ["你贏了","You win"], // index.html:73
  "ui.endAgain":               ["重新開始","Restart"], // index.html:76
  "ui.htmlTitle":              ["逃出大海 — Escape the Sea","Escape the Sea"], // index.html:6
  "ui.challenge":              ["挑戰模式","Challenge Mode"], // CONTENT-v0.5.md:62
  "ui.ngplus":                 ["進入下一輪 NG+{n}","Start Next Run NG+{n}"], // CONTENT-v0.5.md:90

  /* ── HUD 下一步 ── */
  "hint.back":                 ["游回基地（{dist}）→ {step}","Swim back to base ({dist}) → {step}"], // core.js:1013
  "hint.net":                  ["按 B 建造「自動收集網」","Press B to build an Auto Collection Net"], // core.js:1014
  "hint.equip":                ["按 B 建造「裝備房」","Press B to build an Equipment Room"], // core.js:1015
  "hint.bounty":               ["按 B 建造「賞金終端」→ 按 H 接合約","Press B to build a Bounty Terminal → press H for contracts"], // core.js:1016
  "hint.refill":               ["等 {n} 秒補新合約（按 H 查看）","New contract in {n} s (press H to view)"], // core.js:1017
  "hint.harpoon2":             ["按 C 把壓縮魚槍升到 Lv2","Press C to upgrade the Compressed Harpoon to Lv2"], // core.js:1018
  "hint.tech":                 ["打四角守衛（雷達紫色）或接賞金合約","Fight four leviathans (purple on radar) or take bounty contracts"], // core.js:1022
  "hint.rnd":                  ["按 B 建造「火箭研發中心」","Press B to build a Rocket R&D Center"], // core.js:1024
  "hint.parts":                ["按 C 建造 4 個太空船零件","Press C to build all 4 spacecraft parts"], // core.js:1025
  "hint.dock":                 ["按 B 建造「火箭工坊」","Press B to build a Rocket Workshop"], // core.js:1026
  "hint.launch":               ["按 C 發射太空船","Press C to launch the spacecraft"], // core.js:1027

  /* ── 賞金合約 ── */
  "bounty.title":              ["賞金終端 — 海上合約","Bounty Terminal — Ocean Contracts"], // core.js:895
  "bounty.top":                ["合約 {n}/{slots} · 已完成 {done} 張 · 擊殺等級 T{tier}","Contracts {n}/{slots} · Completed {done} · Kill tier T{tier}"], // core.js:660
  "bounty.reward":             ["獎勵：{list}","Reward: {list}"], // core.js:873
  "bounty.claim":              ["領取獎勵","Claim reward"], // core.js:875
  "bounty.progress":           ["進行中","In progress"], // core.js:875
  "bounty.reroll":             ["換一張（{n} 金屬）","Reroll ({n} Metal)"], // core.js:876
  "bounty.empty":              ["等待新合約…（{n} 秒內補上）","Waiting for a new contract… (within {n} s)"], // core.js:881
  "bounty.note":               ["完成一張後 {refill} 秒補一張；{reroll} 金屬可換掉不想要的合約。擊殺與打撈進度會即時更新。","A new contract arrives {refill} s after you finish one; {reroll} Metal rerolls an unwanted contract. Kill and salvage progress updates live."], // core.js:884
  "bounty.needTerminal":       ["需要「賞金終端」— 在基地按 B 建造（金屬 14 · 塑膠 8）","Requires a Bounty Terminal — build it from the base panel with B (Metal 14 · Plastic 8)"], // core.js:891
  "bounty.doneToast":          ["賞金合約完成：{text}（{rewards}）","Bounty complete: {text} ({rewards})"], // core.js:853
  "bounty.rerollDeny":         ["金屬不足（需要 {n}）","Not enough Metal (need {n})"], // core.js:859
  "bounty.cull":               ["清剿：鯊魚","Cull: Sharks"], // DATA-v0.4.md:74
  "bounty.drone":              ["拆解：外星無人機","Dismantle: Alien Drones"], // DATA-v0.4.md:76
  "bounty.salvage":            ["打撈：帶回塑膠","Salvage: Bring back Plastic"], // DATA-v0.4.md:78
  "bounty.patrol":             ["巡弋：待在深海或更遠","Patrol: Stay in Deep Sea or beyond"], // DATA-v0.4.md:80
  "bounty.decap":              ["獵首：擊敗一隻深海巨獸","Headhunt: Defeat a Leviathan"], // DATA-v0.4.md:82

  /* ── 成就 ── */
  "ach.cleaner.name":          ["海上清道夫","Ocean Sweeper"], // CONTENT-v0.5.md:36
  "ach.builder.name":          ["平台一號","Platform One"], // CONTENT-v0.5.md:37
  "ach.automated.name":        ["自動化上線","Automation Online"], // CONTENT-v0.5.md:38
  "ach.gunmaster.name":        ["魚槍大師","Harpoon Master"], // CONTENT-v0.5.md:40
  "ach.tech4.name":            ["科技狂人","Tech Addict"], // CONTENT-v0.5.md:42
  "ach.mods3.name":            ["模組收藏家","Module Collector"], // CONTENT-v0.5.md:43
  "ach.revenge.name":          ["星際復仇","Interstellar Revenge"], // CONTENT-v0.5.md:44
  "ach.bounty10.name":         ["賞金獵人","Bounty Hunter"], // CONTENT-v0.5.md:45
  "ach.levi4.name":            ["巨獸終結者","Leviathan Slayer"], // CONTENT-v0.5.md:46
  "ach.quick90.name":          ["分秒必爭","Beat the Clock"], // CONTENT-v0.5.md:49
  "ach.speed60.name":          ["極速復仇","Speedrun Revenge"], // CONTENT-v0.5.md:50
  "ach.cheater.name":          ["作弊者","Cheater"], // CONTENT-v0.5.md:53
  "ach.shark50.name":          ["鯊魚剋星","Shark Bane"], // CONTENT-v0.5.md:54
  "ach.drone100.name":         ["無人機墳場","Drone Graveyard"], // CONTENT-v0.5.md:55
  "ach.jelly20.name":          ["水母終結","Jelly End"], // CONTENT-v0.5.md:56
  "ach.bot300.name":           ["BOT 工頭","BOT Foreman"], // CONTENT-v0.5.md:57
  "ach.deaths10.name":         ["十次重生","Ten Lives"], // CONTENT-v0.5.md:58
  "ach.toast":                 ["成就解鎖：{name}","Achievement unlocked: {name}"], // CONTENT-v0.5.md:32
  "ach.panel":                 ["成就","Achievements"], // CONTENT-v0.5.md:32
  "ach.progress":              ["已解鎖 {n}/{total}","Unlocked {n}/{total}"], // CONTENT-v0.5.md:32
  "ach.first_dive.desc":       ["收集第一件海上垃圾。","Collect your first piece of ocean trash."], // core.js:416
  "ach.cleaner.desc":          ["累計收集 1000 件物資。","Collect 1,000 items in total."], // core.js:417
  "ach.builder.desc":          ["建造第一座建築。","Build your first structure."], // core.js:418
  "ach.automated.desc":        ["基地建築達 5 座。","Reach 5 structures in your base."], // core.js:419
  "ach.iron_isles.desc":       ["基地建築達 19 座。","Reach 19 structures in your base."], // core.js:420
  "ach.gunmaster.desc":        ["壓縮魚槍升到 Lv4。","Upgrade the Compressed Harpoon to Lv4."], // core.js:421
  "ach.full_kit.desc":         ["五條裝備線全部 Lv4。","Max all five gear lines to Lv4."], // core.js:422
  "ach.tech4.desc":            ["集滿 4 塊科技碎片。","Collect all 4 Tech Shards."], // core.js:423
  "ach.mods3.desc":            ["魚槍插滿 3 個模組。","Fill all 3 harpoon module slots."], // core.js:424
  "ach.revenge.desc":          ["擊毀母船核心，完成第一輪。","Destroy the mothership core and finish your first run."], // core.js:425
  "ach.bounty10.desc":         ["累計完成 10 張賞金合約。","Complete 10 bounty contracts."], // core.js:426
  "ach.levi4.desc":            ["擊敗 4 隻深海巨獸。","Defeat 4 deep-sea leviathans."], // core.js:427
  "ach.iron_dive.desc":        ["零死亡通關。","Finish a run without dying."], // core.js:428
  "ach.safe_dive.desc":        ["死亡 5 次內通關。","Finish a run with 5 or fewer deaths."], // core.js:429
  "ach.quick90.desc":          ["90 分鐘內通關。","Finish a run within 90 minutes."], // core.js:430
  "ach.speed60.desc":          ["60 分鐘內通關。","Finish a run within 60 minutes."], // core.js:431
  "ach.no_mods.desc":          ["不裝任何模組通關。","Finish a run without any modules."], // core.js:432
  "ach.no_tower.desc":         ["不建造任何防禦炮塔通關。","Finish a run without building any turret."], // core.js:433
  "ach.cheater.desc":          ["在標題畫面輸入 cheat。","Type \"cheat\" on the title screen."], // core.js:434
  "ach.shark50.desc":          ["擊殺 50 隻鯊魚。","Kill 50 sharks."], // core.js:435
  "ach.drone100.desc":         ["擊殺 100 台外星無人機。","Kill 100 alien drones."], // core.js:436
  "ach.jelly20.desc":          ["擊殺 20 隻水母。","Kill 20 jellyfish."], // core.js:437
  "ach.bot300.desc":           ["BOT 累計帶回 300 件物資。","Have BOTs bring back 300 items in total."], // core.js:438
  "ach.deaths10.desc":         ["死亡 10 次。","Die 10 times."], // core.js:439
  "ach.title":                 ["任務與成就","Quests & Achievements"], // core.js:1393
  "ach.tab.all":               ["全部","All"], // core.js:1353
  "ach.tab.progress":          ["進度","Progress"], // core.js:1353
  "ach.tab.challenge":         ["挑戰","Challenge"], // core.js:1353
  "ach.tab.secret":            ["彩蛋","Secret"], // core.js:1353
  "ach.hidden":                ["隱藏成就 — 解鎖後揭曉","Hidden achievement — unlock to reveal"], // core.js:1370
  "ach.locked":                ["未達成：{desc}","Not yet: {desc}"], // core.js:1370
  "ach.unlocked":              ["已解鎖","Unlocked"], // core.js:1375

  /* ── 海域事件 ── */
  "event.EV01.name":           ["垃圾潮","Trash Tide"], // events.js:26
  "event.EV01.toast":          ["垃圾潮來了——趁現在撈！","Trash tide — gather while it lasts!"], // events.js:27
  "event.EV02.name":           ["洋流暴衝","Current Surge"], // events.js:31
  "event.EV02.toast":          ["洋流突然加速！","The current surges!"], // events.js:32
  "event.EV03.name":           ["鯊魚群","Shark Pod"], // events.js:36
  "event.EV03.toast":          ["鯊魚群！三隻以上","Shark pod! Three or more"], // events.js:37
  "event.EV04.name":           ["外星巡邏","Alien Patrol"], // events.js:41
  "event.EV04.toast":          ["外星巡邏隊接近","Alien patrol approaching"], // events.js:42
  "event.EV06.name":           ["氧氣外洩","Oxygen Leak"], // events.js:46
  "event.EV06.toast":          ["氧氣管在漏！","Oxygen line leaking!"], // events.js:47
  "event.EV07.name":           ["補給箱雨","Supply Rain"], // events.js:51
  "event.EV07.toast":          ["補給箱從天而降","Supply crates falling from the sky"], // events.js:52
  "event.EV08.name":           ["暗流漩渦","Whirlpool"], // events.js:56
  "event.EV08.toast":          ["暗流漩渦！不要被捲進去","Whirlpool! Don't get pulled in"], // events.js:57
  "event.EV09.name":           ["守衛甦醒","Guardian Awakens"], // events.js:61
  "event.EV09.toast":          ["深海的東西醒了——牠在找你","Something in the deep woke up — it is hunting you"], // events.js:62

  /* ── 教學（待接線） ── */
  "tut.step1": ["先游回基地 — 跟著箭頭，進到綠色安全圈","Swim back to base — follow the arrow into the green safe zone"], // core.js:574
  "tut.step2": ["按 B 建造「自動收集網」— 讓基地自己賺資源","Press B to build a Collection Net — your base earns for you"], // core.js:576
  "tut.step3": ["按 B 建「裝備房」，再按 C 把魚槍升到 Lv1","Build the Gear Room with B, then press C to upgrade the Harpoon to Lv1"], // core.js:578
  "tut.step4": ["按 B 建「賞金終端」（金屬 14·塑膠 8），按 H 接第一張合約","Build the Bounty Terminal (Metal 14 · Plastic 8) with B, then press H for your first contract"], // core.js:580
  "tut.step5": ["升空門檻：魚槍 Lv3、潛水衣 Lv2、火箭研發中心（按 C 看進度）","Launch gate: Harpoon Lv3, Suit Lv2, Rocket R&D Center (press C for progress)"], // core.js:582
  "tut.stuck": ["卡住了嗎？按 Esc 看操作說明；資源不够時 HUD 會顯示差多少","Stuck? Press Esc for controls; the HUD shows what you're missing"], // core.js:66
  "tut.done": ["教學完成 — 接下來自由探索，J 看任務","Tutorial complete — explore freely, press J for quests"], // core.js:60

  /* ── 挑戰模式（正式 key 為 chal.*；舊 challenge.*.name/rule 已於 v0.9 移除） ── */

  /* ── NG+（待接線） ── */
  "ng.label":                  ["NG+{n}","NG+{n}"], // CONTENT-v0.5.md:92
  "ng.summary":                ["本輪新增成就","Achievements this run"], // CONTENT-v0.5.md:92

  /* ── 分數（待接線） ── */
  "score.total":               ["分數 {n}","Score {n}"], // CONTENT-v0.5.md:68

  /* ── 音樂（待接線） ── */
  "music.title":               ["音樂","Music"], // AUDIO-SPEC.md:3
  "music.on":                  ["音樂：開啟","Music: on"], // AUDIO-SPEC.md:89
  "music.off":                 ["音樂：關閉","Music: off"], // AUDIO-SPEC.md:89
  "music.volume":              ["音樂音量","Music volume"], // AUDIO-SPEC.md:51

  /* ── 深海裂縫 ── */
  "rift.appear":               ["深海裂縫出現了 —— 裂縫核心可被魚槍打爆","A deep-sea rift opened — its core can be shot with the harpoon"], // events.js:375
  "rift.broken":               ["裂縫核心崩解 —— 獲得合金 {n}","Rift core collapsed — {n} Alloy earned"], // events.js:399
  "rift.core":                 ["裂縫核心 {hp}/{max}","Rift Core {hp}/{max}"], // events.js:704
  "rift.modBox":               ["模組箱","Module box"], // events.js:17

  /* ── 設定面板 ── */
  "settings.title":            ["設定 — 音量","Settings — Volume"], // core.js:1440
  "settings.musicVol":         ["音樂音量","Music volume"], // core.js:1429
  "settings.sfxVol":           ["音效音量","SFX volume"], // core.js:1429
  "settings.masterMute":       ["總靜音","Master Mute"], // core.js:1431
  "settings.reduceMotion":     ["減少動態","Reduce motion"], // core.js:1432
  "settings.on":               ["開","On"], // core.js:1431
  "settings.off":              ["關","Off"], // core.js:1431
  "settings.language":         ["語言","Language"], // core.js:1433
  "settings.langZh":           ["繁中","Traditional Chinese"], // core.js:1434
  "settings.langEn":           ["EN（soon）","EN (soon)"], // core.js:1435
  "settings.note":             ["音樂與音效可分開調整；M 可快速總靜音。英文介面與 reduce motion 完整支援會在 v0.8 完成。","Music and SFX can be adjusted separately; M toggles master mute. Full English UI and reduce-motion support arrive in v0.8."], // core.js:1438
  /* ── v0.8 難度與最終戰（A 施工中；文案先定稿，B 落地後補行號） ── */
  "leviathan.arc.name": ["弧光巨獸","Arc Leviathan"], // v0.8-pending
  "leviathan.arc.tag": ["光束型","Beam type"], // v0.8-pending
  "leviathan.arc.intro": ["牠的光會掃過整片海——看到集氣就先離開直線","Its beam sweeps the whole sea — leave the line when it charges"], // v0.8-pending
  "leviathan.arc.move1": ["稜鏡掃射","Prism Sweep"], // v0.8-pending
  "leviathan.arc.move2": ["集束凝視","Focus Gaze"], // v0.8-pending
  "leviathan.arc.move3": ["過載爆閃","Overload Flash"], // v0.8-pending
  "leviathan.arc.hint1": ["掃射是橫向的：往上下閃，不要後退","The sweep is horizontal — dodge up or down, not back"], // v0.8-pending
  "leviathan.arc.hint2": ["被凝視鎖定時躲到巨獸側面","Break line of sight by moving to its flank"], // v0.8-pending
  "leviathan.missile.name": ["蜂巢巨獸","Hive Leviathan"], // v0.8-pending
  "leviathan.missile.tag": ["導彈型","Missile type"], // v0.8-pending
  "leviathan.missile.intro": ["牠的背會打開，一次放出整群追蹤彈","Its back opens and releases a swarm of seekers"], // v0.8-pending
  "leviathan.missile.move1": ["飛彈巢","Missile Nest"], // v0.8-pending
  "leviathan.missile.move2": ["追跡齊射","Seeker Volley"], // v0.8-pending
  "leviathan.missile.move3": ["誘餌分裂","Decoy Split"], // v0.8-pending
  "leviathan.missile.hint1": ["追蹤彈會轉彎——繞著牠跑，不要直線後退","Seekers turn — circle it instead of backing away"], // v0.8-pending
  "leviathan.missile.hint2": ["齊射前會有蜂鳴聲，聽到就衝刺","Listen for the buzz before a volley, then sprint"], // v0.8-pending
  "leviathan.ram.name": ["鐵顎巨獸","Maw Leviathan"], // v0.8-pending
  "leviathan.ram.tag": ["衝撞型","Charger type"], // v0.8-pending
  "leviathan.ram.intro": ["牠只看得到直線上的獵物——但那一條線很寬","It only sees prey in a straight line — a very wide one"], // v0.8-pending
  "leviathan.ram.move1": ["破浪衝撞","Breach Charge"], // v0.8-pending
  "leviathan.ram.move2": ["尾掃","Tail Sweep"], // v0.8-pending
  "leviathan.ram.move3": ["蓄勢怒吼","Gathering Roar"], // v0.8-pending
  "leviathan.ram.hint1": ["衝撞撞到礁石會停——引牠去撞","It stops if it hits rock — bait it into one"], // v0.8-pending
  "leviathan.ram.hint2": ["尾掃是近身 360°：貼身時先退一步","Tail Sweep is 360° up close — step back before it lands"], // v0.8-pending
  "leviathan.current.name": ["漩渦巨獸","Maelstrom Leviathan"], // v0.8-pending
  "leviathan.current.tag": ["洋流型","Current type"], // v0.8-pending
  "leviathan.current.intro": ["牠不追你，牠讓海追你","It doesn't chase you — it makes the sea do it"], // v0.8-pending
  "leviathan.current.move1": ["逆流漩渦","Undertow"], // v0.8-pending
  "leviathan.current.move2": ["離心拉扯","Rip Current"], // v0.8-pending
  "leviathan.current.move3": ["潮汐重壓","Tidal Crush"], // v0.8-pending
  "leviathan.current.hint1": ["被拉向漩渦時往外游，不要順著流","Swim outward against the pull — don't ride it"], // v0.8-pending
  "leviathan.current.hint2": ["重壓前水面會變平——那是最後一秒","The surface flattens before the crush — that's your last second"], // v0.8-pending
  "bullet.fast.name": ["快彈","Fast Shot"], // v0.8-pending
  "bullet.fast.hint": ["直線很快，靠橫向位移閃","Straight and fast — dodge sideways"], // v0.8-pending
  "bullet.slow.name": ["慢彈","Slow Shot"], // v0.8-pending
  "bullet.slow.hint": ["慢但會留在場上，別走進舊彈幕","Slow but lingers — don't walk into old shots"], // v0.8-pending
  "bullet.seeker.name": ["追蹤彈","Seeker"], // v0.8-pending
  "bullet.seeker.hint": ["會轉彎，繞圈或衝刺拉開","It turns — circle or sprint to break it"], // v0.8-pending
  "bullet.laser.name": ["雷射","Laser"], // v0.8-pending
  "bullet.laser.hint": ["亮線先出現，看到線就離開","The line shows first — leave it before impact"], // v0.8-pending
  "dockcue.target": ["目標：機庫入口，按住 W 衝進去","Objective: Hangar entrance — hold W to breach"], // v0.8-pending
  "dockcue.holdW": ["按住 W 前進；母船引力會把你往後拉","Hold W to advance; the mothership's gravity pulls you back"], // v0.8-pending
  "dockcue.distance": ["距離機庫 {n} m","{n} m to the hangar"], // v0.8-pending
  "dockcue.ready": ["對準入口——現在衝","Lined up — breach now"], // v0.8-pending
  "dockcue.fail": ["被擊落——回基地修理，再試一次","Shot down — return to base, repair, try again"], // v0.8-pending
  "wave.add": ["第 {n} 波 — 守軍增援","Wave {n} — reinforcements"], // v0.8-pending
  "wave.elite": ["精英守軍出現","Elite guards incoming"], // v0.8-pending
  "wave.coreGuard": ["核心守軍：全部擋在核心前","Core guard — everything between you and the core"], // v0.8-pending
  "wave.escape": ["逃脫階段：核心不穩，快走","Escape phase — core unstable, move"], // v0.8-pending
  "boss.move.beam": ["核心光束","Core Beam"], // v0.8-pending
  "boss.move.missile": ["導彈雨","Missile Rain"], // v0.8-pending
  "boss.move.charge": ["衝撞","Charge"], // v0.8-pending
  "boss.move.gravity": ["重力井","Gravity Well"], // v0.8-pending
  "boss.warn.beam": ["光束集氣——離開直線","Beam charging — get off the line"], // v0.8-pending
  "boss.warn.missile": ["導彈雨——找空隙","Missile rain — find a gap"], // v0.8-pending
  "boss.warn.charge": ["衝撞——側閃","Charge — sidestep"], // v0.8-pending
  "boss.warn.gravity": ["重力井——往外游","Gravity well — swim out"], // v0.8-pending
  "boss.phase2": ["核心外殼破裂——攻擊更快","Core shell cracked — attacks speed up"], // v0.8-pending
  "boss.phase3": ["核心過載——最後一波","Core overload — final wave"], // v0.8-pending
  "mirror.name": ["鏡像核心","Mirror Core"], // v0.8-pending
  "mirror.tag": ["逃脫階段 BOSS","Escape-phase boss"], // v0.8-pending
  "mirror.intro1": ["「你以為逃得掉？我就是你留下的東西。」","\"You thought you could escape? I am what you left behind.\""], // v0.8-pending
  "mirror.intro2": ["「你的每一步，我都會做得更好一點。」","\"Every move you make, I make one step better.\""], // v0.8-pending
  "mirror.skillPlus": ["鏡像技能 +1：你的魚槍 Lv{n} → 它的 Lv{n+1}","Mirror skill +1: your Harpoon Lv{n} → its Lv{n+1}"], // v0.8-pending
  "mirror.hint": ["它複製你的裝備，但永遠高一級——用走位補差距","It copies your gear, always one level ahead — out-position it"], // v0.8-pending
  "mirror.phase2": ["鏡像加速——注意殘影","It accelerates — watch the afterimages"], // v0.8-pending
  "mirror.winTitle": ["帳算清了","The score is settled"], // v0.8-pending
  "mirror.win": ["你打贏了自己——逃生艙脫離母船","You beat yourself — the pod clears the mothership"], // v0.8-pending
  "mirror.loseTitle": ["你被自己的鏡像擊落","Shot down by your own mirror"], // v0.8-pending
  "mirror.lose": ["這次是它先算清你的帳","This time it settled your score first"], // v0.8-pending

  /* ── v0.9 挑戰／NG+／可及性／canvas 海域名短版（v0.9-pending；B 落地後補行號） ── */
  "ng.title": ["下一輪","Next Run"], // DATA-v0.6.md:131
  "ng.name": ["新一輪（NG+）","New Run (NG+)"], // DATA-v0.6.md:131
  "ng.count": ["第 {n} 輪","Run {n}"], // DATA-v0.6.md:140
  "ng.start": ["開始 NG+{n}","Start NG+{n}"], // DATA-v0.6.md:139
  "ng.desc": ["重置資源、裝備、基地與零件；保留成就、巨獸擊殺與 NG+ 次數","Resets resources, gear, base and parts; keeps achievements, leviathan kills and NG+ count"], // DATA-v0.6.md:139
  "ng.enemyBuff": ["敵人 HP +{hp}% · 傷害 +{dmg}%","Enemy HP +{hp}% · Damage +{dmg}%"], // DATA-v0.6.md:140
  "ng.resBuff": ["資源產出 +{n}%","Resource output +{n}%"], // DATA-v0.6.md:135
  "ng.ending": ["你在 NG+{n} 又贏了一次","You won again on NG+{n}"], // DATA-v0.6.md:140
  "ng.max": ["已達最高 NG+9","Max NG+9 reached"], // DATA-v0.6.md:132
  "ng.confirm": ["進入 NG+{n}？","Start NG+{n}?"], // DATA-v0.6.md:139
  "ng.keep": ["保留","Kept"], // DATA-v0.6.md:139
  "a11y.title": ["可及性","Accessibility"], // PRODUCT-v1.0.md:18
  "a11y.reduceMotion": ["減少動態","Reduce Motion"], // PRODUCT-v1.0.md:18
  "a11y.reduceMotionDesc": ["關閉鏡頭震動、閃光與粒子","Turns off camera shake, flashes and particles"], // PRODUCT-v1.0.md:18
  "a11y.colorblind": ["色盲輔助","Colorblind Assist"], // PRODUCT-v1.0.md:18
  "a11y.colorblindDesc": ["為顏色標記加上形狀與文字","Adds shapes and labels to color-coded markers"], // PRODUCT-v1.0.md:18
  "a11y.textSize": ["字級","Text Size"], // PRODUCT-v1.0.md:18
  "a11y.textSizeDesc": ["介面字級 100%／115%／130%","UI text size 100% / 115% / 130%"], // PRODUCT-v1.0.md:18
  "a11y.reset": ["恢復預設","Reset to defaults"], // v0.9-pending
  "a11y.note": ["可及性選項只影響呈現，不影響難度","Accessibility options change presentation only, not difficulty"], // PRODUCT-v1.0.md:18
  "zone.near.short": ["近海","NEAR"], // HANDOFF.md:42
  "zone.mid.short": ["外海","OPEN"], // HANDOFF.md:42
  "zone.deep.short": ["深海","DEEP"], // HANDOFF.md:42
  "zone.far.short": ["遠洋","FAR"], // HANDOFF.md:42

  /* ── v0.9（A DATA-v0.9 定案：挑戰／NG+／可及性；行號 pending 者待 B 落地） ── */
  "chal.title": ["挑戰模式","Challenge Mode"], // DATA-v0.9.md:22
  "chal.locked": ["先通關一次","Finish a run first"], // DATA-v0.9.md:48
  "chal.retry": ["再試一次","Try again"], // DATA-v0.9.md:45
  "chal.back": ["回標題","Back to title"], // DATA-v0.9.md:45
  "chal.failTitle": ["挑戰失敗：{name}","Challenge failed: {name}"], // DATA-v0.9.md:45
  "chal.winTitle": ["挑戰完成","Challenge complete"], // DATA-v0.9.md:45
  "chal.best": ["最佳分 {best} · 本次 {score}","Best {best} · This run {score}"], // DATA-v0.9.md:46
  "chal.newRecord": ["新紀錄！{score}","New record! {score}"], // DATA-v0.9.md:47
  "chal.iron.name": ["一命深海","Iron Dive"], // DATA-v0.9.md:25
  "chal.iron.desc": ["不能死。死一次就結束。","No deaths. One death ends the run."], // DATA-v0.9.md:26
  "chal.speed.name": ["限時 45","Speed Dive"], // DATA-v0.9.md:29
  "chal.speed.desc": ["45 分鐘內攻入母船核心。","Reach the mothership core within 45 minutes."], // DATA-v0.9.md:30
  "chal.bare.name": ["赤手空拳","Bare Hands"], // DATA-v0.9.md:33
  "chal.bare.desc": ["不能建砲塔、不能裝模組，四件裝備不可升級。","No turrets, no modules, four gear lines locked."], // DATA-v0.9.md:34
  "chal.score": ["分數 {score}","Score {score}"], // v0.9-pending
  "chal.rules": ["規則","Rules"], // v0.9-pending
  "chal.timeLeft": ["剩餘 {time}","{time} left"], // v0.9-pending
  "ng.ngDiff": ["本輪難度：敵人 HP +{n}%","This run's difficulty: enemy HP +{n}%"], // DATA-v0.9.md:68
  "ng.bossBuff": ["BOSS HP +{n}%","BOSS HP +{n}%"], // DATA-v0.9.md:65
  "a11y.colorblindTag": ["色盲友善標記","Colorblind-friendly markers"], // DATA-v0.9.md:78
  "a11y.fontScale120": ["字級 120%","Text size 120%"], // DATA-v0.9.md:85
  "a11y.textSizeDesc": ["介面字級 100%／120%","UI text size 100% / 120%"], // DATA-v0.9.md:85

};

/* ── 動態模板（含數字／名稱的句子） ─────────────────────────
   實作：tpl('dist.base', {n: 640}) → "距離基地 640 m" / "640 m from base"
   搭配 I18N_RULES 的複數與量詞規則使用。 */
window.I18N_TEMPLATES = {
  "dist.base":        ["距離基地 {n} m", "{n} m from base"],
  "dist.short":       ["{n} m", "{n} m"],
  "dist.km":          ["{n} km", "{n} km"],
  "level.need":       ["魚槍需 Lv{lv}（目前 Lv{cur}）", "Harpoon Lv{lv} required (current Lv{cur})"],
  "level.next":       ["{name} → Lv{lv}", "{name} → Lv{lv}"],
  "res.reward":       ["+{n} {res}", "+{n} {res}"],
  "count.items":      ["{n} 件", "{n} items"],
  "time.mmss":        ["{m}:{s}", "{m}:{s}"],
  "time.seconds":     ["{n} 秒", "{n} s"],
  "percent":          ["{n}%", "{n}%"],
  "ngplus":           ["NG+{n}", "NG+{n}"],
  "score":            ["分數 {n}", "Score {n}"],
  "best":             ["最佳 {n}", "Best {n}"],
  "shard.progress":   ["科技碎片 {n}/4", "Tech Shards {n}/4"],
  "wave":             ["第 {n} 波", "Wave {n}"],
  "guardian.alert":   ["最近巨獸：{dir} {dist}", "Nearest Leviathan: {dir} {dist}"],
};

/* ── 複數與量詞規則（v0.8 實作參考） ─────────────────────────
   zh-Hant：沒有複數變化；量詞固定（件／座／格／塊／張／隻／發／個）。
   en：英文需處理複數，規則如下：
     n === 1        → 單數（1 item / 1 building / 1 shard）
     n !== 1        → 複數（2 items / 3 buildings）
     只修名詞，不動數字與單位（m、km、Lv、HP、× 不變）。
   en 不可數：Alloy / Metal / Plastic / Wood 當資源名時不加 s（+15 Metal）。
   千分位：zh 用 1,234；en 也用 1,234（與 fmtNum 的 k 縮寫二選一，UI 統一用 k）。
   句子順序：en 把「距離」放後面（{n} m from base），zh 放前面（距離基地 {n} m）。 */
window.I18N_RULES = {
  plural: { en: 'n === 1 ? one : other', zh: 'none' },
  measureWords: { zh: ['件', '座', '格', '塊', '張', '隻', '發', '個'], en: 'none' },
  uncountable: ['Metal', 'Plastic', 'Wood', 'Alloy'],
  ignoreUnits: ['m', 'km', 'Lv', 'HP', '×', '%'],
};

/* ── v0.6 待接線提醒 ─────────────────────────────────────────
   成就（24）／海域事件（8）／挑戰（3）／NG+／教學（5）目前在 docs 定案、
   尚未進 js（本輪 B／A 施工中）。key 已預留，B 接線時直接讀 I18N_DATA 即可。 */
