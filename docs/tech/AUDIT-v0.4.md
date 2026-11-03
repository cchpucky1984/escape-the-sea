# 逃出大海 v0.4 技術審計與實作切分（AUDIT-v0.4）
> 作者：B（主程式）· 2026-11-03 · 基準 v0.3.0（`main`；core 833／main 307／sea 1152／base 968／space 1702 行）· 依據 `docs/design/GDD-v0.4.md` 方案 A「賞金海域」與 `docs/qa/QA-BASELINE.md`；GDD 的 P1–P8 不重複，本文補程式面證據與切分。
> 實測：Chrome 156 headless（CDP 9302、`--disable-gpu` 軟體渲染）1280×800；腳本 `_dev/B/audit.mjs`／`audit2.mjs`／`audit3.mjs`、截圖 `_shots/B/`。FPS 只做同環境相對比較（非實機數字，同 QA-BASELINE P1-2）；全程各場景 `pageErrors: none`。
## 0. 結論
1. **P1 四件**：升空／登艦失敗「返回基地」重複扣款＋場景 init 兩次；重試升空 soft-lock；收集與自動收入不存檔；護盾科技在登艦／母船完全無效。
2. **效能**：基地全滿每幀新建 ~72 個 CanvasGradient、12 個 filter 陣列、39 次 `structureAt`、3.8 次 `baseRadius`；HUD 每秒 ~50 次 DOM mutation；1280×800 僅 16.9 fps、1920×1080 DPR2 掉到 2.7 fps。
3. v0.4 的 B 系統＝賞金合約、魚槍模組、深海巨獸、深海裂縫、存檔 v3；母船艙壓在 `space.js`（D 的檔，需裁決）。估工與 GDD 一致：B 6.5／D 3.0 人日；需 Lead 裁決 4 件（§7）。
## 1. 架構現況
- **載入**：`index.html:86-90` core → base → sea → space → main；五個 classic script **共用全域作用域**（無 module、無 build）。
- **全域狀態**：`game`（core.js:213-226）、`sea`（sea.js:7-15）、`launch`（space.js:6-10）、`dock`（space.js:469-472）、`moon`（space.js:802-809）；`window.__T`（main.js:294-307）把狀態與 QA 函式露天暴露。
- **輸入**：`KEYS`／`MOUSE`（main.js:6-9），只有 keydown/keyup/mousemove/mousedown（main.js:41-96）；**無 touch／pointer／gamepad**。
- **主迴圈**：`frame(now)`（main.js:259-283）＝`updateQuests`→依 `game.scene` update/draw→rAF；title／intro／ending 都走重的 `drawIdleBG`（main.js:100-182）；paused 只停 update、draw 照跑。
- **場景切換**：`setScene`（main.js:12-24）設 `game.scene`／`paused`／`body[data-scene]`／HUD；轉場 `transition(fn)`（core.js:783-792）＝`#fade` 320ms→fn→120ms。
- **存檔**：`saveGame`（core.js:288-296）序列化 `game` 子集到 `localStorage['escape-the-sea-v2']`，`loadGame`（core.js:300-324）逐欄還原；**無 version／無 schema 驗證**。
```
KEYS/MOUSE ─▶ main.frame() ─▶ updateSea / updateLaunch / updateDock / updateMoon
                                  │ mutate game.* / sea.* / launch.* / dock.* / moon.*
                                  ├▶ draw*()（3 處會反向寫狀態，P2-4）
                                  └▶ refreshHud()（讀 game/sea → DOM，core.js:403）
base.js baseTiles/baseRadius/BOT/tower/draw ◀──被 sea.js 呼叫（sea.js:352,518,696）
core.js calcStats/addRes/countType/STRUCTS/QUESTS/面板/存檔 ◀──被所有檔呼叫
space.js startLaunch←core.js:680、initDock←launch win、initMoon←dock win；三場景用 transition 串；localStorage('escape-the-sea-v2') ◀── saveGame()（core.js:288）／loadGame()（:300）
```
## 2. Bug／技術債清單（位置｜症狀＋重現｜嚴重度｜修法）
### P1-1 升空／登艦失敗「返回基地」重複扣款＋場景重複 init
位置 `core.js:488-496`、`core.js:783-792`、`space.js:183-197`、`space.js:548-554`；症狀：按「返回基地修理」金屬扣 **2 次**（實測 40→24，應 32）、`initSea` 2 次、`backToBaseFromLaunch` 2 次；`moonLose` 再次出擊 initMoon 2 次、「返回基地」先多 1 次再轉海面。
重現：`__T.game.res.metal=40; __T.initLaunch(); launchFail();` 等 modal → 點第一顆 → 1.2s 讀 metal（`audit2.mjs` transition-double）。修法：closeModal 移除 scene 補救；`backToBaseFromLaunch` 先設 `launch.state='idle'`；transition 重入改排隊或回 false。
### P1-2 重試升空 soft-lock（`launch.docked` 未重置）
位置 `space.js:6-10`（無初值）、`space.js:20-36`（initLaunch 未清）、`space.js:47`（`if (L.winT>2 && !L.docked)`）；症狀：首次升空成功後 `docked=true`，之後登艦或母船失敗回基地再升空，進度 100% 永遠停在 `state=win` 不進 dock → 該局無法通關。
重現：`__T.initLaunch(); __T.launch.prog=100;` 等 3.6s → scene=dock（對照）；再 `__T.initLaunch(); __T.launch.docked=true; __T.launch.prog=100;` 等 3.6s → 仍 launch、winT=3.63（`audit.mjs` launch-retry-stuck）。修法：`initLaunch()` 加 `L.docked=false`；win 判定用本次 `state/winT`。
### P1-3 收集／基地／BOT 收入不存檔（資料遺失）
位置 `core.js:355-358`（addRes 不存檔）、`sea.js:166-194`（collectPickup）、`sea.js:197-210`（baseTick）、`base.js:105-115`（depositBot）；症狀：拾取 3 塑膠後記憶體已變、`localStorage` 仍 0，reload→繼續後 **3 塑膠消失**；10 秒收集 31 件只寫 4 次存檔，且 4 次都由建造／任務獎勵觸發。
重現：`audit.mjs` save-gap／save-frequency（Storage.prototype.setItem 計數）。修法：`addRes` 設 `game.dirty`；`frame` 每 10s＋`visibilitychange/pagehide` 強制存；`saveGame` 加 250ms debounce。
### P1-4 護盾科技在登艦／母船完全無效
位置 `core.js:249`（`armor:0` 恆定）、`space.js:872`（`1-S.armor*0.6`）、`space.js:477`（dock `hull=100` 固定）、`space.js:23`（只有 launch 吃 shield）；症狀：護盾 Lv3（135 金屬 21 合金）母船減傷 0、登艦艦體不變；實測 armor=0、`hurtMoon(10)` 有/無護盾都扣 10、launch 艦體 80→155、dock 永遠 100（GDD P5 的程式原因）。
重現：`__T.game.up.shield=3; calcStats().armor`；`initMoon(); moon.p.inv=0; hurtMoon(10)`（`audit2.mjs` shield-armor）。修法：`calcStats` 回傳 `armor`／`moonHp`／`hullBonus`／`gunMult`（§4.5），D 在 space.js 消費、文案同步。
### P2-1 BOT 撿到空氣泡／補給箱 → 資源黑洞
位置 `base.js:85-95`（findBotTarget 不篩 type）、`base.js:96-115`（takePickupByBot／depositBot）、`core.js:355-358`（addRes 忽略 air/crate）；症狀：BOT 帶回 `{air:2,crate:1,plastic:2}` → `stats.botCollected +5`、資源只 plastic +2。
重現：`__T.addStructure('botdock')` 後塞上述 cargo 並 `depositBot(bot)`（`audit.mjs` bot-cargo-loss）。修法：findBotTarget 只選 4 種資源；crate 在 takePickupByBot 立即轉資源；depositBot 只累加實際入帳量。
### P2-2 v1 存檔遷移平台格子重疊
位置 `core.js:325-338`（migrateV1 先清空 `game.base.structures` 再靠 `freeTileFor()` 找格）＋`base.js:23-39`；症狀：6 座建築只佔 3 個唯一格子（`net@0,-1` 重複等），格數與建築數對不上、安全圈失真。
重現：`localStorage` 寫 `escape-the-sea-v1 {mod:{net:3,recycler:2,tower:1}}`→reload→繼續（`audit.mjs` v1-migration）。修法：migrateV1 用暫存陣列邊放邊查或固定螺旋配置；載入時過濾重複 `gx,gy`。
### P2-3 暫停時任務照樣結算、基地停止生產（與面板文案矛盾）
位置 `core.js:760-779`（updateQuests 無 paused 判斷，main.js:263 仍每幀呼叫）、`main.js:265-268`（paused 跳過 updateSea→baseTick）、`core.js:755`（文案「你的基地仍在自動生產」）；症狀：暫停中把 `stats.collected=15` → 0.9s 內任務完成領獎；建收集網後暫停 6.2s，塑膠／木材 0 產出（只有任務獎勵金屬 +6）。
重現：`audit2.mjs` paused-production、`audit.mjs` misc-behavior。修法：updateQuests 加 `if (game.paused) return`；文案改「生產暫停」或離線收益另案（GDD 方案 B）。
### P2-4 draw() 內改遊戲狀態 → 行為隨 FPS 變
位置 `sea.js:1056-1062`（drawPlayer 每幀噴粒子）、`space.js:300-301`（drawLaunch 內 `f.shieldT-=0.016`）、`space.js:351-355`、`space.js:767-771`（flash 在 draw 遞減）；症狀：戰機護盾 0.45s 在 58fps 實測約 0.48s；CPU 8× 節流 15.6fps 時 1.5s 後仍有 0.05（多撐 3 倍），低階機／高刷機行為不同。
重現：push `shieldT:0.45` 的 fighter、`game.paused=true` 只跑 draw，1.5s 讀值（`audit3.mjs` draw-mutation-throttled）。修法：時間推進全移入 update*、draw 只讀；粒子生成搬到 `updatePlayer(dt)`。
### P2-5 HUD 每 0.12s 全量重建 innerHTML
位置 `core.js:403-424`（refreshHud）、`core.js:436-447`、`core.js:453-464`、`sea.js:610-612`（每 0.12s 觸發）；症狀：實測 HUD 49.6 次 DOM mutation/s、refreshHud 6.2 次/s；每次重建任務 HTML 與 3 段 innerHTML，手機 CPU 成本高。
重現：`audit.mjs` perf-instrumentation（MutationObserver 監聽 `#hud`）。修法：快取 DOM 參照＋dirty flag（資源／血氧／任務各自），有變才寫。
### P2-6 熱路徑每幀重建幾何與漸層（詳見 §3）
位置 `base.js:10-45`（baseTiles/baseRadius 每次 new array+Set）、`base.js:47-49`（structureAt 線性搜尋，tileAge 每幀 39 次）、`core.js:238-253`（calcStats new object）、`sea.js:18-23`（seaZone new object）、`sea.js:108-111`（currentAt new object）；實測每幀 `structureAt` 39、`baseTiles` 5.1、`baseRadius` 3.8、`seaZone` 2.4、`calcStats` 1.4、`currentAt` 1 次（每秒 675／88.5／65／40.8／23.5／17.3 次）。
重現：`audit.mjs` perf-instrumentation（包裝 window 全域函式計數）。修法：D 在 base.js 做 `baseGeo{dirty,tiles,occ,radius,map}`；`calcStats` 版本號快取；`seaZone` 改 4 個常數物件；`currentAt` 改分量回傳或暫存物件。
### P2-7 標題／結局畫面全速 rAF 重繪
位置 `main.js:99-182`（drawIdleBG：3 linear＋2 radial/幀、60 星、30 條波浪）、`main.js:279-281`（else 分支）；症狀：無玩法仍全速重繪，實測 title 35.7 fps（軟體渲染）、每幀 3 linear＋2 radial，行動裝置耗電。
重現：`__T.setScene('title')` 後量 2.5s rAF 與 gradient 計數（`audit2.mjs` title-perf）。修法：標題降到 30fps、靜態層預渲染到 offscreen canvas；ending 同理。
### P3-1 存檔無 version／無驗證
位置 `core.js:288-296`（payload 無 v）、`core.js:300-324`（loadGame 只做型別判斷）；症狀：v0.4 加 `bounty/mods/stats` 只能靠 key 改名硬切；損壞存檔的 `gx/gy` 非數字會讓 baseRadius NaN、平台消失。
重現：手動寫 `{base:{structures:[{type:'net'}]}}` 再繼續。修法：payload 加 `v:3`＋`migrateSave()`／`validateSave()`（type 白名單、gx/gy 整數、up/res clamp）；保留 v1/v2 fixture。
### P3-2 死碼與露天測試鉤子
位置 `core.js:229-236`（`game.mod` 相容 getter，grep 無讀取端）、`main.js:34`（`escape-the-sea-cheat` 只寫不讀，重載後作弊遺失）、`main.js:294-307`（`__T` 暴露所有狀態）；症狀：維護者誤用死介面、作弊狀態不一致、玩家可從 console 改 `game`。
重現：載入後 `window.__T` 可見；作弊後 reload 再繼續→無免費裝備。修法：移除 `game.mod`；cheat 改存正式存檔或移除；`__T` 只在 `?qa=1` 掛載。
### P3-3 行動裝置：無觸控＋DPR 上限 2
位置 `main.js:41-96`（只有鍵鼠）、`core.js:11-19`（`DPR=Math.min(2, devicePixelRatio)`），QA-BASELINE P1-1 已記 CSS 破版；症狀：手機無法移動／射擊；1920×1080 DPR2 backbuffer 3840×2160 實測 2.7 fps；390×844 DPR3 實際以 2 倍繪製。
重現：`Emulation.setDeviceMetricsOverride` 1920×1080/Dpr2、390×844/Dpr3（`audit.mjs` fps、`audit3.mjs` cpu-throttle-fps）。修法：像素預算封頂（≤2.6M px：1920×1080 時 DPR≈1.12）或固定 1.5×；S1 若支援手機加 pointer 虛擬搖桿＋射擊鈕（B）、CSS 斷點由 C 負責。
## 3. 效能
### 3.1 實測（單一 headless Chrome、基地全滿 19 建築／20 格、海面滿載）
| 情境 | FPS | 備註 |
|---|---|---|
| 1280×800 DPR1（sea 基地全滿） | 16.9 | 基準；QA-BASELINE 18–26（當時 6 個 Chrome 並行） |
| 1920×1080 DPR2 | 2.7 | canvas 3840×2160，像素是 1280×800 的 8.1 倍 |
| 390×844 DPR3（實際 DPR2） | 5.6 @CPU 4× | 手機級 CPU 節流 |
| title 1280×800 | 35.7 | 無玩法仍全速重繪 |
### 3.2 每一幀配置了什麼物件（實測/幀）
- **CanvasGradient 72 個**（linear 56＋radial 15.7）：sea 水面 1、god rays 7、vignette 1、pickup 13–25、hazard 光暈、base 19 建築×約 2、BOT 尾流、player 光暈、boss 3；全部每幀重建。
- **陣列 12 個**（`filter`，共掃 85 元素）：pickups/hazards/bullets/ebullets 的 `some()+filter()` 成對；parts/floats/beams/shieldHits **無條件** filter（sea.js:602-608）。
- **物件 literal**：`seaZone` 2.4、`currentAt` 1、`calcStats` 1.4、粒子約 3.7（鯊魚尾跡＋玩家吐泡＋擊殺爆量 138 顆/次）；另有每幀十幾個 template string、HUD 2.9 次 mutation/幀（4 段 innerHTML 重建）。
### 3.3 陣列 filter／splice 熱點（要改 in-place）
`sea.js:444,515,569,585` 是 `some()`＋`filter()` 雙掃；`sea.js:602,604,606,608` 每幀固定配置 4 個新陣列；`space.js:84,118,157,170,175,535,968,1135-1147` 相同模式。建議 helper（放 core.js 或 fx.js）：`function compact(a,dead){let w=0;for(let i=0;i<a.length;i++){const v=a[i];if(!dead(v))a[w++]=v;}a.length=w;}`；統一用 `dead/alive` 單一欄位，不再混用 `!b.dead`／`!b.alive`。
### 3.4 優化清單（含負責人與預期）
1. **漸層物件快取**（D 在 `js/fx.js` 提供 `GFX.lin/GFX.rad(key,...)`；B/D 的 draw 改用）：72→≤6 個/幀。
2. **基地幾何快取**（D，base.js）：`baseTiles/baseRadius/structureAt` O(1)，省 65+88.5+675 次/秒的計算與 Set 配置。
3. **calcStats 版本快取＋seaZone 常數表**（B，core/sea）：狀態沒變不重算。
4. **HUD dirty flag**（B，core.js）：DOM mutation 49.6/s→<5/s。
5. **標題／結局 30fps＋離屏靜態層**（B，main.js）：title 省一半以上重繪。
6. **粒子池＋上限 400＋in-place 陣列**（D，fx.js；B 改 sea 呼叫）＋**像素預算封頂**（B，core.js `resizeCanvas`，4K/手機不再 ×4）：目標同環境 FPS +30% 以上才收工。
## 4. v0.4 系統設計（B 的系統；D 的介面契約）
### 4.1 賞金合約（core.js 資料/面板＋sea.js 勾子；GDD §3.1）
```js
const BOUNTY_DEFS={cull:{stat:'sharkKills',need:[6,10,16],reward:{alloy:[2,4,7],metal:[15,30,50]}},
 drone:{stat:'droneKills',need:[4,7,12],reward:{alloy:[3,5,9]}}, salvage:{stat:'plasticCollected',need:[10,18,30],reward:{wood:[10,20,35],alloy:[1,2,4]}},
 patrol:{stat:'deepSeconds',need:[60,100,150],reward:{alloy:[3,5,8]}}, decap:{stat:'leviathanKills',need:[1,1,1],reward:{alloy:[8,8,8],modbox:1}}};
game.bounty={active:[],done:0,refillT:0};  // game.stats 加 sharkKills/droneKills/jellyKills/plasticCollected/deepSeconds/leviathanKills/rifts
function tier(){return game.stats.kills<40?1:game.stats.kills<120?2:3}   function rollBounty(t)/*{id,tier,need,prog,reward,done}*/
function refillBounties(dt)/*active<3 每 6s 補 1*/  function bountyOn(stat,n)/*累加 active 進度並標 done*/  function bountyHtml()/function openBounty()/*H；sea+atBase+有 bounty 終端*/
function claimBounty(i)/*done→入帳、done++、saveGame*/  function rerollBounty(i)/*pay({metal:15}) 換牌*/
```
勾子：`damageHazard` 擊殺 shark/drone 累加；`collectPickup` plastic 累加；`updateSea` 在 `Z.id>=2` 累加 `deepSeconds`（回基地或離水重置）；`killLeviathan` 累加。存檔：`bounty`＋新 stats 進 v3（§4.6）。
### 4.2 魚槍模組（core.js 資料/面板＋sea.js 子彈；GDD §3.2）
```js
const MODS={pierce:{maxHits:3,mul:[1,.85,.72]},blast:{r:56,mul:.55},emp:{chance:.18,dur:1.2}};
game.mods=[]; // 3 槽，元素 id/null
function modCount()/hasMod(id)/openMods()/bulletMods()/*{pierce,blast,emp}*/
function makeBullet(x,y,ang,dmg) // sea.js：子彈帶 pierce:0/blast/emp 欄位
function hitBullet(b,target) // core.js（B 寫，D 在 space.js 共用）：回傳 {hits,killed,stop}
// 1) 命中扣血回報擊殺 2) pierce 第 2/3 次×.85/.72 且不觸發 blast 3) blast 命中半徑 56 其他×.55
// 4) emp 18% 設 target.empT=1.2（巨獸/核心免疫）
```
介面凍結點：`hitBullet` 與 bullet 欄位要在 D 動 `space.js:1101-1121` 前定稿（GDD R2）。
### 4.3 深海巨獸（sea.js；GDD §3.3）
```js
sea.leviathans=[{id,name,x,y,hp:240,maxhp:240,phase:1,t:0,ang:0,cool:0,spawnT:8,dashT:0,hit:0,core:{r:22},alive:true}];
function spawnLeviathans() // initSea 由 BOSS_SPOTS 建，取代 sea.bosses
function updateLeviathans(dt,P) // P1 追撞+扇形3發/2.2s；P2 環形5發/1.8s+每8s召2 drone；P3 speed×1.35+每4s衝刺1.8s
function damageLeviathan(b,hitX,hitY,dmg) // 核心(<22)×1.0、身體×0.3；回傳 'body'|'core'|'kill'
function killLeviathan(b) // tech+1(≤4)、modbox+1、alloy6、metal30、plastic20；bountyOn('leviathanKills')
function drawLeviathan(b) // 取代 drawSeaBoss（D2 裁決）；B 先做、D 只供 FX
```
核心座標 `b.x+cos(b.t*1.2)*18, b.y-10`；接觸傷害 4；TTK 驗收 16±4s（harpoon Lv3 全中核心）。
### 4.4 深海裂縫（sea.js；GDD §3.5）
```js
sea.rift={on:false,x:0,y:0,t:0,life:50,nextT:180,done:0,core:{hp:30,alive:true}};
function spawnRift()    // 距基地 1200–3000 隨機方位；每 180s 一次、同時最多 1 道
function updateRift(dt) // 玩家在 260 內：spawn 間隔/3、掉落×1.5、hazCap+2、aggr×1.2
function riftAt(x,y)->bool  // 供 spawnPickup/spawnHazard 查詢
function drawRift()         // 漩渦；radar（sea.js:1065）／compass（:827）紫標記
```
打爆核心：alloy 8、40% modbox、裂縫提前關閉；`game.stats.rifts++`；`saveGame()`。
### 4.5 calcStats v0.4 契約（B 寫，D 必須照此消費）
```js
function calcStats(){ const u=game.up,c=game.cheatUp||{},lv=k=>(u[k]||0)+(c[k]||0),gl=lv('harpoon');
 return { speed:152*(1+0.18*lv('fin')), maxhp:3+lv('suit'), maxox:100+25*lv('tank'), oxRate:Math.max(0.3,1-0.14*lv('tank')),
  magnet:92+44*lv('magnet'), dmg:1+gl, fireRate:0.42*Math.pow(0.86,gl),
  armor:Math.min(0.16,0.04*lv('suit')),               // 新增：母船減傷
  moonHp:100+12*lv('suit')+25*(u.shield||0),          // 新增：D 設 moon.p.maxhp
  hullBonus:25*(u.shield||0), gunMult:gl<3?0:gl>=4?1:0.35, // 新增：D 設 dock.maxhull=100+hullBonus；gunMult 取代 space.js:908
  shield:u.shield||0, gunLv:gl }; }
```
D 驗收：`suit=0,shield=0` 進母船 100 艙壓、連吃 16 次 `hurtMoon(6)` 仍活；`suit=4,shield=3` 223；母船 TTK 150–210s（GDD §6）。
### 4.6 存檔 v3 與遷移（core.js）
```js
const SAVE_VER=3;              // 不改 SAVE_KEY（GDD 要求），payload 內加 v；saveGame(force) 250ms debounce、payload {v:3,...}
function loadGame()            // s.v ?? 2 → migrateSave(s) → validateSave(s)
function migrateSave(s){       // 補 bounty/mods/新 stats；舊 quest 陣列照舊
 s.bounty??={active:[],done:0,refillT:0}; s.mods??=[];
 for(const k of ['sharkKills','droneKills','jellyKills','plasticCollected','deepSeconds','leviathanKills','rifts']) s.stats[k]??=0;
 return s; }
function validateSave(s){ return s; } // structures: STRUCTS 白名單+Number.isInteger(gx/gy)；up/res clamp；壞資料丟棄
```
自動存檔：`main.js` 每 10s（paused 不存）＋`visibilitychange/pagehide`；既有建造/付費/任務/升級觸發保留，新增賞金完成、裂縫核心、巨獸擊殺。
### 4.7 新建築／任務／按鍵
```js
STRUCTS.bounty={name:'賞金終端',ch:'賞',c:'#ffd166',max:1,tag:'必要',cost:{metal:14,plastic:8},desc:'解鎖賞金合約 — 擊殺與打撈都能換合金'};
STRUCTS.modtable={name:'模組工作台',ch:'模',c:'#c9a6ff',max:1,tag:'必要',req:'rnd',cost:{metal:34,alloy:5},desc:'魚槍可插 3 個模組 — 穿透 · 爆裂 · 電磁'};
STRUCT_KEYS=['equip','rnd','dock','bounty','modtable','net','recycler','botdock','tower','reverse','satellite'];
QUESTS.push(bounty,leviathan,mod,rift);  // 條件與文案照 GDD §5.1
// main.js keydown: if(k==='h') openBounty();  drawBaseMini（base.js，D）補 bounty/modtable 顏色
```
### 4.8 fx.js 介面（D 的新檔；B 的呼叫方式）
```js
// 載入順序：core → fx → base → sea → space → main（index.html 由 C 加、Lead 改 ?v=0.4.0）
window.FX={init(sceneKey),clear(),cap:400,burst(x,y,n,opts),ring(x,y,opts),damageText(x,y,text,color),
 trail(x,y,ang,opts),grad:{lin(key,...),rad(key,...)}}; // 漸層快取 key 含尺寸/顏色/停點
// B 在 sea.js 保留相容：sea.burst=(...a)=>window.FX?FX.burst(...a):legacyBurst(...a);
```
## 5. 實作切分（每單可獨立驗收；B＝我，D＝技術美術）

| 單 | 檔案／主要函式 | 估行 | 依賴 | 風險 |
|---|---|---|---|---|
| B-1 | core.js：calcStats（armor/moonHp/hullBonus/gunMult）＋新 stats＋BOUNTY/MODS 常數 | 80 | 無 | 舊存檔欄位缺省 |
| B-2 | core.js：存檔 v3／migrateSave／validateSave／自動存檔 | 100 | B-1 | 遷移錯→資料毀損，需 v1/v2 fixture |
| B-3 | core.js：賞金資料/面板/H/refill/claim/reroll＋2 新建築＋4 新任務 | 220 | B-1,B-2 | 文案對齊 GDD；面板 DOM 成本 |
| B-4 | core.js：模組狀態/面板＋`makeBullet`/`hitBullet` 共用 API | 140 | B-1 | 與 D 共用，API 要先凍結 |
| B-5 | sea.js：賞金勾子＋stats＋巨獸 AI/三段/掉落/繪製＋深海裂縫 | 260 | B-3 | 巨獸繪製歸屬（D2）；平衡 |
| B-6 | sea.js：pierce/blast/emp 子彈＋新手保護＋rift 生成＋radar/compass | 150 | B-4 | 兩處命中判定同步（GDD R2） |
| B-7 | main.js：H 鍵／pointer+touch 基礎／存檔節流／title 30fps | 70 | B-2 | 手機範圍需裁決 |
| B-8 | sea.js：compact 陣列／漸層呼叫改 FX／本地幾何快取 | 120 | D-3 | 需 before/after 數據 |
| D-1 | space.js：母船艙壓（maxhp/傷害/補給/HUD/無敵/gl 倍率） | 180 | B-1 | **D 的檔，需 Lead 批准（D1）** |
| D-2 | space.js：dock hullBonus＋母船子彈改用 `hitBullet` | 80 | B-4 | API 不同步 |
| D-3 | **新檔 js/fx.js**：粒子池＋漸層快取＋FX API | 180 | core | 載入順序（C/Lead） |
| D-4 | base.js：`baseGeo` 幾何快取＋`structureAt` Map＋漸層重用＋drawBaseMini 新色 | 120 | D-3 | 平台建造動畫不可破 |
| D-5 | base.js/sea.js/space.js：粒子改 FX、上限 400、in-place 陣列 | 90 | D-3 | 視覺回歸 |
合計 B 6.5／D 3.0 人日，與 GDD §7 一致。**B 不碰** `js/base.js`／`js/space.js`／`js/fx.js`；D 不碰 `js/core.js`／`js/main.js`／`js/sea.js`；跨檔共用只經 §4.2 的 `hitBullet` 與 §4.8 的 `FX`。
## 6. 測試策略（每張工單都可自動驗收）
- **回歸與本審計腳本**：`node _dev/shot.mjs` 八情境 pageErrors=0＋Lead 的 `_dev/qa.mjs` 25 項（手機 390×844 無溢出、存檔往返）；`_dev/B/audit.mjs`（存檔缺口／雙扣款／soft-lock／v1 遷移／BOT／效能計數）、`audit2.mjs`（shield／draw 變異／暫停／roundtrip）、`audit3.mjs`（CPU 節流）留用對照。
- **B-1～B-4**：`__T.game.up.shield=3; __T.calcStats().moonHp===223`；`__T.saveGame(); reload; 繼續` 後 `bounty/mods/stats` 存在；舊 v2 fixture 可載入且 11 個舊任務不變。**B-3/B-5/B-6**：`__T.addStructure('bounty'); __T.openBounty()` 截圖；塞 hazard 後 `damageHazard(h,99)` 驗合約進度；`__T.sea.bullets[0]` 檢查 pierce/blast/emp；三目標並排驗穿透 1/.85/.72。
- **B-5～B-7**：`__T.sea.leviathans` 置 ±2400 自動瞄準量 TTK 16±4s；`__T.sea.rift` 手動 spawn 量 180±5s 間隔、50s 關閉、核心給 alloy 8；手機 Emulation 觸控可移動／射擊；CPU 節流下難度不變（驗證 draw 不改狀態）。
- **D-1/D-2**：GDD §6.1（100 艙壓吃 16×6 仍活）、§6.2 TTK（`game.stats.time` 差值 150–210s）、§6.8 `shot.mjs moon` pageErrors none；`hitBullet` 兩檔同一份單元案例。
- **效能 gate（同環境前後對照）**：每幀 gradient ≤10、filter 陣列 ≤4、HUD mutation <5/s、1280×800 滿基地 FPS ≥1.3×16.9；以 `audit.mjs` 計數器驗收。
- **平衡腳本**（`_dev/balance.mjs`，Lead 建）：第一座逆向工程 ≤8 分鐘、3 張 T1 合約 ≤120s、合金期望 ≥6、巨獸／母船 TTK。
## 7. 假設、需裁決、風險
- **假設**：GDD-v0.4 為定稿方向；本文數值（BOUNTY_DEFS／MODS／leviathan／rift）全做成資料表，A 改平衡只改常數；GDD §3 若改動，B 工單估行需重估。
- **裁決 D1**：準不準 D 動 `space.js` 母船血量／傷害（GDD D1）？不准 → 方案 A 的 P1 修不了，B 只能做外圍（賞金／模組／巨獸）。
- **裁決 D2**：深海巨獸繪製留 `sea.js`（B）或移 `fx.js`（D）？建議**留 B**（與 AI/判定同檔），D 只供粒子；若移檔，B-5 減 60 行、D-3 加 50 行。
- **裁決 D3**：新建築是否佔平台格？GDD 要佔，B 照做，但每座會讓安全圈變大（baseRadius 公式不變）→ 需 A 確認平衡。
- **裁決 D4**：手機觸控是否納入 S1？納入則 B-7 估行 70→約 180（虛擬搖桿、射擊鈕、CSS 由 C 配合）；不納入只做 pointer 統一與像素封頂。
- **存檔語意**：GDD 要求「不改存檔 key」，本文採同一 key 內加 `v:3`；若 Lead 要換 key，migrate 需同時讀 v1/v2（測試成本 +0.5 日）。
- **風險**：① `index.html` 加 `fx.js` 由 C 改、`?v=` 由 Lead 改，順序錯了 fx 未載入（B 的 `sea.burst` fallback 可降級但粒子變少）。② headless FPS 噪聲大（他人 Chrome 並行），效能 gate 必須同輪、同機、單 Chrome。③ 存檔遷移最易出事，v1/v2 fixture 要先入 repo（Lead 的 `_dev/`）。
- **S0 邊界**：本文件只寫 `docs/tech/`；未改任何 `js/`、`index.html`、`style.css`、`README.md`，未跑 git。實測暫存腳本在 `_dev/B/`、截圖在 `_shots/B/`。
