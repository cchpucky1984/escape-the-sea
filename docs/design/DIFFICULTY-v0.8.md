# 逃出大海 · v0.8 難度與最終戰施工規格（DIFFICULTY v0.8）

> 作者 A（PM／主企劃）· 2026-11-05 · 對應 `PRODUCT-v1.0` 支柱 A／C／D；前置 `CONTENT-v0.5`（節奏）、`DATA-v0.6`（事件／成就）、`PLAYTEST-v0.4a`（體感）
> 使用者需求：「加難度＋最終戰重做」。本檔全部是**可施工數值**；只寫 `docs/design/`，不跑 git、不改 `js/`。
> 現況基準（2026-11-05 00:05 實查）：海域 `hazCap 2/4/6/8`、生成間隔 `rnd(3.2,7.5)/aggr`、組成 shark 50%／drone 35%／jelly 15%（`sea.js:19-22,94,540`）；巨獸 `MAX_HP 240`、3 階段共用扇形／環形／召喚（`leviathan.js:20,168-177`）；母船第 1 波 6 隻、第 2 波 7+3 隻、核心 200 HP（`space.js:869-877`）。
## 0. 設計原則（先講清楚，避免「變難＝變不公平」）
1. **變密不是變痛**：難度來自「同時要處理幾件事」，不是把一擊傷害拉高；玩家 HP 只有 3–7，任何「無預告的必中」都不做。
2. **每個新招式都有 ≥0.5 秒可讀前搖**（光束 1.4s、衝撞 0.9s、導彈有尾焰）；沒有前搖的傷害一律 ≤2。
3. **同屏敵彈上限**：海面 120、母船 140、逃生 90；超過就不再生成（效能與可躲性）。
4. **每隻巨獸只用自己的模式招式**（不再共用扇形／環形），四角玩法才真的不同。
## 1. 海面四海域密度（給 B；`sea.js:19-22` `seaZone()`、`:537-540` 生成）
| 海域 | 距離 | `hazCap` 現→新 | 生成間隔 現→新（每次隨機） | 組成 shark／drone／jelly | 累積門檻（給程式） |
|---|---|---|---|---|---|
| 近海 | <800 | 2 → **3** | 5.35s → **4.2–5.8s** | 50／25／25 | `<0.50` shark、`<0.75` drone、其餘 jelly |
| 外海 | 800–1600 | 4 → **6** | 5.35s → **3.6–5.0s** | 45／30／25 | `<0.45`／`<0.75` |
| 深海 | 1600–2600 | 6 → **10** | 5.35s → **1.5–2.1s**（吞吐 ≈ ×3） | 40／40／20 | `<0.40`／`<0.80` |
| 遠洋 | 2600+ | 8 → **12** | 1.8s → **1.1–1.6s**（−25%） | 35／45／20 | `<0.35`／`<0.80` |
- 實作：`hazT = rnd(區間) / Z.aggr`（aggr 維持 1／1.12／1.26／1.42）；`hazLimit = nearBoss ? 2 : Z.hazCap`，靠近巨獸時仍維持 2 隻避免彈幕疊加。
- 事件加成照舊疊加：EV03 `+4`、EV04 `+3`、裂縫 `+2`（`events.js`）；上限同樣受 120 同屏敵彈限制。
- 深海的「×3」用**間隔 ÷3**（5.35→1.8）表達；`hazCap` 同時拉到 10，否則生成會被 6 隻上限吃掉（間隔再短也沒用）。遠洋在深海基礎上「上限 +2、間隔 −25%」。
- 預期效果：深海區停留 60 秒會遇到約 30 隻（現約 10 隻），但同時最多 10 隻——壓力來自「一直有東西來」，不是一次湧 30 隻。
- **實作狀態（B，2026-11-04 23:53 落地，A 實查核對）**：`seaZone` 已帶 `hazCap 3/6/10/12`、`spawnMin/Max 4.2–5.8 / 3.6–5.0 / 1.5–2.1 / 1.1–1.6`、`comp [0.50,0.75] / [0.45,0.75] / [0.40,0.80] / [0.35,0.80]`（`sea.js:19-22`）；`hazT = rnd(Z.spawnMin, Z.spawnMax)/Z.aggr`（`:565`）；安全圈內不生成（`< R+80` 改推到 `R+120`，`:99-104`）；新增 `sea.hazSpawned` 累計計數器可直接量測。吞吐驗算：`60 ÷ ((1.5+2.1)/2 ÷ 1.26) = 42/分`（舊 `60 ÷ (5.35 ÷ 1.26) = 14/分`），與 B 實測 15→42 一致。
## 2. 四隻深海巨獸：各自模式（給 D；`js/leviathan.js`）
共同基底（不變）：`HP 240`、`r 60`、階段線 `0.66／0.33`、接觸傷害 P1-P2 `4`／P3 `6`、P3 移速 ×1.35、位置 `r 2900–3200` 由 `game.seed` 決定。
| 角 | 名稱 | 模式 | 主招參數 | P2 強化 | P3 強化 | 可躲方式（給玩家讀） |
|---|---|---|---|---|---|---|
| NW | 灼光守衛 | **光束** | 蓄能 1.4s（0.9s 細線預告＋0.5s 增粗）→ 光束長 900、寬 26，**每 0.25s 判定 4 傷**，持續 3.2s，掃描 ±60°（0.55 rad/s），冷卻 6.0s | 冷卻 5.0s、掃描 ±85°（0.7 rad/s） | 冷卻 4.0s；每 9s 追加「雙光束交叉」 | 看到細線就往側後方走，或繞到牠背後；距離 >900 安全 |
| NE | 蜂巢守衛 | **追蹤導彈** | 每 2.6s 發 2 枚：速度 210、轉向 2.0 rad/s、壽命 4.5s、引爆半徑 42、傷害 6；**可被魚槍打掉（hp 1、r 10）** | 3 枚、轉向 2.4、速度 230 | 4 枚、速度 250、壽命 5.0s | 貼身繞圈（轉向極限追不上）；或直接打掉 |
| SW | 裂濤守衛 | **衝撞** | 前搖 0.9s（後退 40px＋紅圈）→ 衝刺 620 px/s × 0.55s（約 340px），撞擊 10 傷＋擊退 260px；撞牆／出界自暈 1.1s（受傷 ×1.5）；循環：衝 3 次→休息 2s | 衝刺後留毒霧（r 45、3s、2 傷/s） | 速度 720、連續 2 次衝撞 | 前搖時橫向移動（衝刺鎖的是起手方向，不會轉彎） |
| SE | 淵流守衛 | **洋流場** | 半徑 520 場、**向心 130 px/s**、持續 6s、冷卻 7s；期間環形 8 發／2.5s（傷害 1） | 加切向渦流 0.8 rad/s＋水壓脈衝每 3s（半徑 200、5 傷） | 流速 180、半徑 620、每 1.8s 生 1 隻水母 | 逆流游（移速需 >130）或離開 620；水流粒子方向＝流向 |
- 掉落不變：科技碎片 ×1、模組箱 ×1、合金 6、金屬 30、塑膠 20（`DATA-v0.6`）；四隻共用 `leviathan.js`，用 `mode:'beam'|'homing'|'charge'|'current'` 分派。
- 平衡預期：每隻實戰 **40–70 秒**（Lv3 魚槍）；同一時間只會被一隻巨獸 aggro（維持 `aggro 1100`）。
## 3. 子彈型別表（給 D／B 共用；玩家與敵人各一套）
| 型別 | 速度 | 傷害 | 尺寸 | 壽命 | 追蹤 | 可見度（必須可躲） | 躲法 |
|---|---|---|---|---|---|---|---|
| `fast` 快速 | 480–620 px/s | 4 | r 6 | 3.0s | — | 青白亮點＋拖尾＋短促高音 | 側移或短衝刺 |
| `slow` 慢速 | 140–200 px/s | 6 | r 9 | 6.0s | — | 橙紅大光球＋低頻嗡聲 | 繞開（慢但痛） |
| `homing` 追蹤 | 210–250 px/s | **4**（原定 6，見下） | r 7 | 4.5s（硬上限） | 1.8–2.6 rad/s | 紅尾焰＋鎖定警示圈（0.4s） | 貼身繞圈／打掉（hp 1） |
| `laser` 雷射 | hitscan 線 | 4／tick（0.25s） | 寬 26×長 900 | 3.0–3.2s | 掃描 0.55 rad/s | 0.9–1.4s 細線前搖＋充能音 | 前搖後離開線、繞背 |
| 玩家子彈（基準） | 900 px/s | `S.dmg`（1–5） | r 5 | 1.1s | — | 白青短線 | — |
- **硬規則**：雷射／衝撞／導彈鎖定的前搖 ≥0.5s；同屏敵彈 ≤120（母船 140、逃生 90）；`homing` 同屏 ≤8 枚；同一時刻不允許「兩種以上無前搖傷害」。
- 玩家命中判定放寬（回應「很難打中」）：子彈對敵人 `r 22 → 27`、加 1.2° 輕微吸附；敵人對玩家的碰撞盒 **縮小**（見 §4）。
- **實作狀態（B，2026-11-04 23:53 落地，A 實查核對）**：`pushEBullet()`（`sea.js:116`）同屏上限 **120**（`:117`）、`homing` ≤8（`:118`）；drone `fast` 480–520／4 傷（`:628-629`）、jelly `slow` 140–180／6 傷（`:640-641`）、外海鯊魚 15% 帶 `homing` 210–250 px/s／轉向 1.8–2.6／壽命 4.5s（`:108,610-616`）。**唯一與原定不同：`homing` 傷害 6→4**——A 同意：追蹤彈難躲，4 傷與 `fast` 同級較公平，維持 B 的數值。`laser` 屬 D 的巨獸／母船實作。
## 4. 升空關卡難度（v0.8 目標：會緊張但可贏）
- 現況：進度 3.1%/s（壓 W 4.7%）≈24 秒；隕石間隔 `max(0.28, 0.9−prog×0.005)`；戰機間隔 `max(2.4, 5.0−prog×0.02)`、同屏 3、hp 6、撞擊 8 傷；玩家**不能瞄準**（只有自動防禦炮）。
- **改為可瞄準**：滑鼠移動＝準星、按住左鍵＝開火（沿用 `space.js` 既有 `MOUSE` 與 `pdb`）；傷害 `S.dmg`、射速 `S.fireRate`、子彈 900 px/s。自動防禦炮保留（780 內、傷害 1、0.3s 一發）。
- 難度增量：進度 3.1→**2.6%/s**（約 28 秒）；隕石間隔 `max(0.22, 0.75−prog×0.004)`、速度 +10%；戰機間隔 `max(1.8, 4.2−prog×0.02)`、**同屏上限 4**、射速 2.2–3.4 → **1.9–2.9s**；新增**攔截艇**：每 8s 從下方升起、追玩家 x、hp 8、撞擊 10 傷、速度 240。
- 命中判定（玩家友善）：戰機 vs 火箭 `|dx|<34 && |dy|<56` → **`|dx|<22 && |dy|<38`**；隕石 vs 火箭改圓形判定 `r+14`（原本 box 擦到就中）；玩家子彈 vs 敵人 `r 22→27`。
- 失敗提示：失敗卡列出傷害來源次數（`隕石 3 · 戰機 2 · 電漿 1`）＋一句「A/D 閃避；滑鼠可手動清戰機」。
- 船體：維持 `80+(maxhp−3)×20+hullBonus`；隕石傷害 `r×0.6` → **`r×0.5`**（抵銷密度上升）。
## 5. 母船波次（第 2 波大幅加）
| 波次 | 現況 | v0.8 | 備註 |
|---|---|---|---|
| 第 1 波 | 6 grunt | **8 grunt＋2 shooter**（10） | shooter 從兩側進場，逼玩家橫向移動 |
| 第 2 波 | 7 grunt＋3 shooter（10） | **14 grunt＋8 shooter＋2 菁英**（24） | 菁英：hp 12、r 22、射速 1.6s、移速 60 |
| 核心召喚 | 每 7s 2 grunt（場上 ≤5） | **每 3.5s 2 grunt 或 1 shooter（場上 ≤8）** | 只在核心階段生效 |
| 敵彈上限 | 無 | **140** | 超過不再生成，保 FPS |
- 兩波之間空檔維持 1.7s；第 2 波清完才進核心。第 2 波是「資源存量檢查」——玩家如果前面沒升級，會在這裡死。
## 6. 最終 BOSS（母船核心）四合一
- HP **200 → 900**（含 3 段轉階段 1.5s 無敵＋全場衝擊波，不會被白打）；r 64；位置維持上方左右擺動。
| 階段 | 血線 | 招式（全部同時啟用，依循環計時） | 參數 |
|---|---|---|---|
| P1 | 100–75% | **重力脈衝**＋環形彈 | 重力：全場向核心 60 px/s，每 6s 一次持續 2s；環形 12 發／2.2s（速度 165、傷害 4） |
| P2 | 75–50% | ＋**光束** | 蓄能 1.4s→3.0s 掃描（±70°、0.5 rad/s）、每 0.25s 4 傷；冷卻 6.5s |
| P3 | 50–25% | ＋**追蹤導彈**＋重力加強 | 每 4s 2 枚（速度 220、轉向 2.2、傷害 6、壽命 4.5s）；重力 90 px/s；**50% 同盟軍入場**（現有） |
| P4 | <25% | ＋**衝撞**＋召喚加速 | 前搖 1.0s→衝刺 560 px/s×0.5s、傷害 12；召喚 3 grunt／4s（場上 ≤8）；全部冷卻 ×0.8 |
- 招式循環：P2 起用固定順序「光束 → 環形 → 導彈 → 重力」，每招之間 1.2s 間隔；P4 改「衝撞 → 光束 → 導彈 → 環形」，間隔 0.8s。
- 彈幕上限 140；衛星光束（90%／10%）與同盟軍（50%）**保留不動**。
- TTK 目標：滿裝 **150–210 秒**；未滿級（gl3）約 2 倍時間。
## 7. 逃脫階段：鏡像 BOSS（新，擊敗才通關）
- 流程：核心爆炸 → **逃生倒數 90 秒**（HUD 大字倒數）→ 倒數第 20 秒時「鏡像」在玩家附近生成 → 擊敗它才開逃生艙（倒數歸零＝失敗，回基地重來）。
- 鏡像能力＝玩家當前裝備推算（`S = calcStats()`；`gearSum = fin+tank+suit+magnet+harpoon` 0–20）：
  - `mirrorHp  = 300 + 55 × gearSum + 40 × game.mods.length`（素裝 300；滿裝 300+1100+120 = 1520）
  - `mirrorDmg = 2 + 0.6 × S.dmg`（Lv0 → 2.6；Lv4 → 5.0）
  - `mirrorRate = max(0.16, S.fireRate × 0.85)`（比玩家快 15%）
  - `mirrorSpeed = S.speed × 1.08`
  - 模組效果「+1 級」：穿透 4 目標（玩家 3）、爆裂半徑 72（玩家 56）、電磁 24%／1.4s（玩家 18%／1.2s）
- 招式表（循環 8s，依序）：① 魚槍 3 連（`fast` 520、mirrorDmg）② 光束（前搖 1.2s、掃描 0.6 rad/s、3 傷/tick）③ 導彈 2 枚（轉向 2.4、傷害 5）④ 衝撞（前搖 0.8s、速度 600、傷害 8）⑤ 重力井（半徑 380、向心 110 px/s、2.5s）⑥ 回到①。
- 階段：HP 100–50% 用 ①②④；50–20% 加 ③⑤；<20% 全招冷卻 ×0.8、移速 ×1.15。
- UI：頂部兩條血條並排（左：玩家艙壓青色；右：鏡像紅色），標籤「**鏡像 · 同型態 · 技能 +1**」；鏡像受傷時右條閃白。擊敗時全場白閃＋`moonWin()`。
- 平衡：TTK 目標 **40–70 秒**（滿裝）；未滿裝 60–90 秒；玩家在倒數內有 70 秒可以打（20 秒生成＋90 秒倒數）。
## 8. 驗收門檻（可腳本量；`__T` 讀取點已標）
| # | 項目 | 門檻 | 量測方式 |
|---|---|---|---|
| 1 | 海面密度 | 深海 60 秒內生成 ≥25 隻、同屏峰值 ≤10（不含事件） | `sea.hazSpawned` 差值（B 已加，`sea.js:112`）＋取樣 `sea.hazards.length` |
| 2 | 巨獸 TTK | Lv3 魚槍 40–70 秒／隻；四隻都不同模式（`window.LEVIATHANS.list[i].mode`） | `__T` 讀 `LEVIATHANS.list` |
| 3 | 巨獸死亡率 | 首次挑戰死亡率 20–40%（太低＝不難，太高＝不公平） | 腳本跑 10 次 × 4 隻，統計 `stats.deaths` 增量 |
| 4 | 升空 | 滿裝通過率 ≥80%、素裝（Lv1 魚槍）通過率 ≤40% | 腳本跑 10 次記錄 `launch.state` |
| 5 | 母船波次 | 第 2 波同屏敵人 ≥20 秒內維持 ≥12 隻 | `moon.aliens.length` 取樣 |
| 6 | 最終 BOSS TTK | 滿裝 150–210 秒 | `moon.boss.hp` 與 `stats.time` |
| 7 | 鏡像 | TTK 40–70 秒；倒數結束前擊敗率 ≥60%（滿裝） | 新增 `moon.mirror` 狀態；`__T.moon.mirror` |
| 8 | 彈幕上限 | 海面 ≤120、母船 ≤140、逃生 ≤90（同屏 `ebullets.length`） | `sea.ebullets.length`／`moon.ebullets.length` |
| 9 | 效能 | 1280×800 headless ≥30fps；實機 ≥60fps（GPU） | `_dev/qa.mjs` fps 檢查 |
| 10 | 公平性 | 所有新招有前搖；無前搖傷害 ≤2 | 人工 review `docs/vfx` 預告清單＋腳本抽樣 |
### 8.1 `_dev/qa-v08.mjs` 可直接貼的 10 條 check（介面同 `qa.mjs` 的 `check(name, fn)`；`q`／`sleep`／`check` 已由它提供）
前置（貼一次）：
```js
const S = async (expr) => JSON.parse(await q(`JSON.stringify(${expr})`));   /* 取頁面狀態 */
const eq = (what, got, want) => ({ ok: JSON.stringify(got) === JSON.stringify(want), detail: what + ' got=' + JSON.stringify(got) });
```
```js
await check('v08-01 海域密度 hazCap 3/6/10/12', async () => eq('hazCap', await S(`[0,900,2000,2700].map(d=>seaZone(d).hazCap)`), [3,6,10,12]));
await check('v08-02 巨獸四模式各一', async () => eq('modes', await S(`LEVIATHANS.list.map(l=>l.mode).sort()`), ['beam','charge','current','homing']));
await check('v08-03 巨獸基底 4 隻／240HP／初始相位 1', async () => { const L = await S(`LEVIATHANS.list.map(l=>({hp:l.maxhp,ph:l.phase}))`); return { ok: L.length===4 && L.every(l=>l.hp===240 && l.ph===1), detail: JSON.stringify(L) }; });
await check('v08-04 升空：可瞄準＋失敗原因計數器', async () => { await q(`__T.initLaunch(); __T.setScene('launch'); 'ok'`); const L = await S(`({aim:'aim' in launch, hits:launch.hits||null})`); return { ok: L.aim===true && !!L.hits && ['rock','fighter','plasma'].every(k=>typeof L.hits[k]==='number'), detail: JSON.stringify(L) }; });
await check('v08-05 母船第1波≥10、第2波≥24', async () => { await q(`__T.initMoon(); 'ok'`); const w1 = await q(`moon.aliens.length`); await q(`__T.nextWave(); 'ok'`); const w2 = await q(`moon.aliens.length`); return { ok: w1>=10 && w2>=24, detail: 'w1='+w1+' w2='+w2 }; });
await check('v08-06 四合一核心 HP900／四階段欄位', async () => { await q(`__T.initMoon(); __T.nextWave(); __T.nextWave(); 'ok'`); const b = await S(`({hp:moon.boss&&moon.boss.maxhp, ph:moon.phase||1})`); return { ok: b.hp===900 && typeof b.ph==='number', detail: JSON.stringify(b) }; });
await check('v08-07 鏡像 HP＝300+55×裝備總等級+40×模組數', async () => { const m = await S(`({mirror:(typeof mirrorHp==='function'?mirrorHp():null), gear:['fin','tank','suit','magnet','harpoon'].reduce((a,k)=>a+(game.up[k]||0),0), mods:game.mods.length})`); const want = 300 + 55*m.gear + 40*m.mods; return { ok: m.mirror===want, detail: 'mirror='+m.mirror+' want='+want }; });
await check('v08-08 彈幕上限 120/140/90', async () => eq('limits', await S(`__T.LIMITS||null`), { sea:120, moon:140, escape:90 }));
await check('v08-09 headless ≥30fps', async () => { const f = await q(`(window.__fps||0)`); return { ok: f>=30, detail: 'fps='+f }; });
await check('v08-10 前搖 ≥0.5s（laser/charge/homingLock/mirrorBeam）', async () => { const T = await S(`__T.TELEGRAPH||null`); return { ok: !!T && ['laser','charge','homingLock','mirrorBeam'].every(k=>T[k]>=0.5), detail: JSON.stringify(T) }; });
```
- **需要 B/D 先曝露的 5 個讀取點**（沒有就會 FAIL 並印 detail，不會靜默）：`launch.hits`、`moon.phase`、`mirrorHp()`（頁面全域函式即可）、`__T.LIMITS`、`__T.TELEGRAPH`。`window.__fps` 用 `qa.mjs` 第 25 條同一段取樣即可（門檻改 30）。
- 行為型門檻（TTK／死亡率／60 秒生成量）不放 QA 快速 gate，留給 `_dev/balance.mjs` 長跑（見 `DATA-v0.6.md` §5 與 `ONBOARD-v0.7.md` §4）。
## 9. 實作切分（給 Lead 切工單；擁有權照 `HANDOFF` §6）
| 檔案 | 擁有者 | 本檔要做的段落 |
|---|---|---|
| `js/sea.js` | B | §1 密度（`seaZone` 回傳值＋生成間隔＋組成）、§3 海面子彈型別（drone/jelly/巨獸彈） |
| `js/leviathan.js` | D | §2 四模式（`mode` 分派＋各招式狀態機）、§3 巨獸子彈（laser/homing） |
| `js/space.js` | D | §4 升空（手動瞄準＋判定＋失敗原因計數）、§5 波次、§6 四合一核心、§7 鏡像（**不新增場景**：核心死後在 `moon` arena 內切 `mirror` 階段，倒數 90s） |
| `js/events.js` | D | 事件加成與 §1 新密度相容（`add.hazCap` 疊加、同屏 120 上限） |
| `style.css`／`index.html` | C | §7 雙血條對比（左艙壓青／右鏡像紅）、逃生倒數大字、失敗卡傷害來源明細 |
| `js/main.js` | B | §8 需要的 `__T`：`__T.LEVIATHANS`（已有 `window.LEVIATHANS`）、`__T.moon.mirror`、`__T.launch.hits={rock,fighter,plasma}` |
- **新狀態欄位**（給 B/D 先加 default，避免存檔回歸）：`launch.hits`（三個計數器）、`moon.phase`（1–4）、`moon.mirror = null|{hp,maxhp,t,cd}`、`launch.aim`（滑鼠座標）。
- **不要改**：`MOON_DMG` 基礎值（帳壓制已校準）、衛星光束 90%／10%、同盟軍 50%、升空 gate 三條件。
- 順序建議：① B 的 §1 密度（獨立、可先上）② D 的 §2 四模式 ③ D 的 §4–§7（同一檔，一次改完再測）④ C 的 UI ⑤ QA 補 §8 的 10 條到 `_dev/qa.mjs`。
