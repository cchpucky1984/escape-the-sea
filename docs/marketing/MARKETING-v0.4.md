# 逃出大海 · 商店頁／預告／社群／截圖腳本（v0.4）

> 擁有者：E（副企劃／行銷）· 基準 v0.3.0（2026-10-26 build）· 2026-11-03
> 素材：`H:\DeepSeek\PROJECT\PROGRAMM\_shots\E\`（14 張 1280×800，全部為實機截圖，無合成）
> 本文件文案可直接貼 itch.io / Steam / X / Discord / 巴哈；`[待定]` 是需 Lead 決定的項目。

## 1. 定位

- **一句話（商店副標）**：撿垃圾、造基地、把外星母船打下來。
- **英文 tagline**：Scavenge the sea. Grow a base. Take the fight to the moon.
- **類型**：單機 HTML5 動作生存 ＋ 基地建造 ＋ 輕射擊。一輪 30–45 分鐘，免安裝、免連線、全程序化美術與音效（無圖片／音檔資產）。
- **賣點順序**（商店頁、預告片、社群貼文全部照此順序）：①基地會長大 ②BOT 自動化 ③海域風險回報 ④裝備會變成火箭 ⑤月球母船決戰；**不做**：Roguelike 隨機升級、多人連線、劇情分歧、DLC——這些「不做」就是跟競品的差異。

## 2. 目標玩家

| Persona | 特徵 | 買單理由 |
|---|---|---|
| 短時間玩家（主力） | 30–60 分鐘一輪、開瀏覽器就玩、不想學 20 個快捷鍵 | 只有 WASD＋滑鼠＋B/C/J，第一次玩 3 分鐘內就懂 |
| 自動化愛好者 | 喜歡看數字自己長大（Factorio / Dome Keeper 玩家） | 收集網、分解工坊、BOT 艦隊、安全圈，離線也在生產 |
| 小品收藏者 | 買 2–5 美元、當晚破台、怕被永久懲罰 | 死亡只掉 15% 塑膠、升空失敗只修 8 金屬；有明確結局 |

## 3. 競品比較（3 款）

| 遊戲 | 我們像的地方 | 我們不像的地方（= 我們的定位） |
|---|---|---|
| **Vampire Survivors** | 短局數、低操作門檻、傷害數字一直跳 | 我們**沒有**隨機升級抽選；成長在「基地與裝備」而不是「每 30 秒選 1/3」；有明確終點 |
| **Dome Keeper** | 基地自動化、防守、資源循環 | 我們是**連續開放海域**（4 區、離基地越遠越肥），不是定點挖礦防守；主線是「造火箭」 |
| **Dave the Diver** | 潛水收集＋經營升級＋幽默小人物 | 我們**沒有**劇情演出與角色關係，是硬派一點的純玩法小品；美術是程式繪製而非點陣素材 |

**一句話差異**：「比你玩過的基地建造少了半小時教學，比生存遊戲少了永久死亡，比割草遊戲多了親手打造的基地。」

## 4. itch.io 商店頁草稿

**標題**：逃出大海 Escape the Sea　**副標**：撿垃圾、造基地、把外星母船打下來

**Short description（可直接貼）**
> 外星飛船把你打落海。在海上撿垃圾、建一座會長大的自動化基地、派 BOT 出海、升級裝備，最後造太空船飛上月球拆了母船。免安裝 HTML5 單機小遊戲，一輪 30–45 分鐘。

**Long description**
> 那天海很平靜，直到天空裂開。外星飛船的巨炮把你打落海，暗湧把你沖到看不見岸的地方。
>
> 沒關係。海上有無盡的垃圾，而垃圾就是材料。
>
> 游出去撿漂流垃圾 → 按 B 在平台上蓋一座座建築，每蓋一座，平台就多一格、安全圈就大一圈 → 造 BOT 船塢，黃色小艇會自己出海把物資載回來 → 造裝備房，把蛙鞋、氧氣瓶、潛水衣、磁力收集器、壓縮魚槍一路升滿 → 造火箭工坊，湊齊 4 個零件 → 發射。
>
> 升空後 A/D 閃隕石、W 加速，外星戰機來攔截；衝進月球軌道上的母船機庫，打穿兩波守軍，面對 200 點血的反應爐核心。核心掉到 50% 時，地球同盟軍第三艦隊會殺進來跟你一起打。核心爆炸，你的逃生艙被護著離開。海面那顆藍色星球上，還有一片海在等你。
>
> **沒有安裝、沒有連線、沒有外部素材**：打開 index.html 就能玩，進度自動存在瀏覽器。美術與音效全部用 Canvas 與 WebAudio 即時生成。

**特色條列（5 點）**
1. **會長大的基地**：每座建築都在平台上佔一格，平台一格格擴張、安全圈半徑跟著變大；圈內自動補給、敵人子彈被護盾吸收、怪被物理推出去。
2. **真的會做事的自動化**：收集網與分解工坊每 5 秒產資源、外星逆向工程每 10 秒產合金，BOT 載滿 8 件自己回基地卸貨。
3. **四片海域、四隻守衛**：近海 → 外海 → 深海 → 遠洋，越遠資源越肥、怪越快越兇；四個角落的守衛會掉科技碎片。
4. **裝備直接繼承到火箭**：蛙鞋=火箭速度、魚槍=艦炮與母船傷害、潛水衣=裝甲、研發的護盾科技=升空減傷。
5. **30 分鐘的完整曲線**：撿垃圾 → 建基地 → 升裝備 → 升空 → 登艦 → 母船決戰 → 結局，一輪跑完。

**標籤（itch tags）**：`singleplayer` `action` `survival` `base-building` `underwater` `sci-fi` `html5` `short` `exploration` `shooter`　**分級／內容提醒**：普遍級（0+）。含輕度科幻暴力（擊毀外星機器與外星人、爆炸特效），無血腥、無裸露、無文字成人內容。itch.io 內容警示勾選「Mild violence」即可。

## 5. Steam 商店頁草稿

**Short description（≤300 字元，可直接貼）**
> 被外星飛船打落海的你，只有滿海的垃圾。收集、建造會自動生長的基地、派出 BOT 艦隊、升級裝備，最後組裝太空船飛上月球，與外星母船決戰。單機 HTML5 小品，一輪 30–45 分鐘。

**Long description（Steam 編輯器 BBcode）**
> [b]撿垃圾，造基地，把帳算清楚。[/b]
>
> 外星飛船的巨炮把你打落海。醒來時岸不見了，只剩滿海漂流垃圾——而垃圾就是材料。
>
> [b]會長大的基地[/b]
> 每建造一座建築，海上平台就多一格、安全圈就大一圈。安全圈內你不會受傷、氧氣與生命自動補給、敵人的子彈被護盾吸收。
>
> [b]真的會做事的 BOT 艦隊[/b]
> 每座 BOT 船塢派出一台黃色小艇，自己出海找垃圾、載滿 8 件回基地卸貨；防禦炮塔 360 度自動開火。
>
> [b]越遠越肥，也越危險[/b]
> 近海、外海、深海、遠洋四區；遠洋的資源與怪物強度同步上升，四個角落的守衛掉「科技碎片」，集滿 4 塊才能研發火箭護盾。
>
> [b]你的裝備，就是你的火箭[/b]
> 蛙鞋決定火箭速度、魚槍決定艦炮火力、潛水衣決定裝甲。魚槍沒到 Lv3 打不穿戰機護盾，沒滿級在母船內傷害只剩 10%——升級不是選項，是門票。
>
> [b]三分鐘的決戰[/b]
> 升空閃隕石 → 衝進母船機庫 → 兩波守軍 → 反應爐核心。核心掉到 50%，人類同盟軍進場；裝了衛星光束發生器，還能在 90% 與 10% 時各吃一發軌道光束。

**特色條列 5 點（Steam 版，同 §4 可照抄）**：①會長大的基地 ②真的會做事自動化 ③四片海域、四隻守衛 ④裝備直接繼承到火箭 ⑤30 分鐘的完整曲線
**Steam 標籤**：`Singleplayer` `Action` `Survival` `Base Building` `Space` `Underwater` `Sci-fi` `Shoot 'em up` `Crafting` `Short`
**分級**：無成人內容；台灣分級建議普遍級（0+），若審查要求可改保護級（6+）；Steam 需填「Mild Violence」相關問卷項目。**售價（Lead 已定方向）**：itch.io 免費上架、Steam 先開願望清單頁；*US$2.99（台灣 NT$102）為暫定試算值*，實際價格等商店頁做好再定。理由：一輪 30–45 分鐘的小品，2.99 是衝動購買價，也比同類基地建造作品低一階，符合小品定位。

## 6. 30 秒預告分鏡（逐秒｜每一段標明要展示的系統）

| 秒 | 鏡頭／畫面 | 展示系統 | 字幕 | 音效點 |
|---|---|---|---|---|
| 0.0–3.0 | 黑畫面 → 標題與海平線升起，母船剪影從右上掠過（`00-title.png`，可加 0.5s 快門） | 世界觀／標題 | 外星飛船把你打落海 | 低頻 drone 進場；2.6s 一聲巨響 |
| 3.0–6.5 | 水下 POV 跟著玩家游，磁力把一串垃圾吸過來（`02-sea-clean.png` 連續 play） | 收集／磁力收集器 | 在海中央醒來，你只有垃圾 | pick 音效連打；水聲墊底 |
| 6.5–10.0 | 鏡頭拉高，基地平台一格格亮起擴張（`03-base.png` 的基地小地圖＋實機基地 build 縮時） | 基地擴張 | 但垃圾會變成基地 | build 音 ×3；平台擴張 whoosh |
| 10.0–13.5 | 基地全景：3 台 BOT 出港、炮塔開火、安全圈護盾吸掉敵彈（需新錄：`__T.mountAll()` 後在基地外緣繞圈） | 自動化／安全圈 | BOT 出海、炮塔守家 | bot 高音、shield 低鳴 |
| 13.5–17.0 | 裝備面板，魚槍 Lv1→Lv4 逐級跳（`04-craft-upgrade.png`，用 UI 放大 1.15 倍） | 成長／裝備 | 升級魚槍、蛙鞋、潛水衣 | 四次升級音，節奏對在 1/2 拍 |
| 17.0–20.0 | 深海紫紅色調，四角守衛的環形彈幕掃過畫面（需新錄：`__T.openBase` 後傳送到 `(-2400,-2400)` 觸發 NW 守衛） | 海域風險／守衛 | 越遠越肥，也越兇 | boss 低鳴；彈幕高頻 |
| 20.0–23.0 | 升空：火箭穿雲、隕石擦過、戰機被艦炮擊落（`07-launch-action.png` 連續 play） | 升空 | 然後，你飛上去 | 點火轟鳴 → boom ×2 |
| 23.0–26.0 | 衝進機庫 → 母船內部 → 核心血條下降（`09-moon-boss.png` + `__T.moon.boss.hp` 下降動畫） | 登艦／決戰 | 母船就在月球軌道 | 警報；命中 tick |
| 26.0–28.5 | 衛星光束落下打穿核心 → 白光 → 同盟軍戰機進場（`11-moon-beam.png`、`10-moon-alliance.png`） | 超級武器／結局 | 連同盟軍都來接你回家 | 光束上揚；win 和弦 |
| 28.5–30.0 | End card：LOGO＋平台網址＋「現在就能玩」（`00-title.png` 淡出） | CTA | 逃出大海 · 現在就能玩 | 環境音收尾 |

**節奏規則**：每 3–3.5 秒切一次鏡頭，共 10 顆；字幕一律 ≤11 字、置中、白字黑邊；不要出現任何 UI 滑鼠游標。`[待定]` 需 Lead 同意新增 3 段錄影（基地縮時、BOT 出港、守衛彈幕），否則用現有靜圖做 Ken Burns 推拉。

## 7. 社群貼文（3 組）

**① X（發售日 + 素材圖 `09-moon-boss.png`）**
> 外星飛船把我打落海，所以我撿了三個月的垃圾，造了一座會長大的基地，然後把太空船開到月球把它的母船拆了。
> 《逃出大海 Escape the Sea》——免安裝 HTML5 單機小品，一輪 30–45 分鐘，現在就能玩。#indiegame #gamedev #webgame #screenshotsaturday #逃出大海

**② Discord（開發者社群／遊戲社群，素材 `03-base.png`）**
> **逃出大海 Escape the Sea** — 單機 HTML5，免安裝，30–45 分鐘一輪。
> 核心循環：海面撿垃圾 → 基地一格格長大 → BOT 自動出海 → 裝備升滿 → 造火箭上月球。
> 目前 v0.3.0 可玩，正在做 v0.4（海域隨機事件＋四角守衛差異化）。
> 想找人幫我試「第一次玩 10 分鐘內會不會卡住」——卡在哪請直接回報，會進 changelog。
> 連結：`[待定]` #playtesting #basebuilding

**③ 巴哈姆特（哈啦區／獨立遊戲板，素材 `02-sea-clean.png`＋`10-moon-alliance.png`）**
> 【小品分享】逃出大海 Escape the Sea — 撿垃圾造基地，然後飛上月球拆母船
> 各位好，我做了一款免安裝的 HTML5 單機小遊戲，打開網頁就能玩，進度存在瀏覽器。
> 玩法很直白：被外星飛船打落海 → 撿漂流垃圾 → 在海上蓋一座會長大的基地（每蓋一座，平台多一格、安全圈變大）→ 造 BOT 自動出海 → 升級蛙鞋／氧氣瓶／潛水衣／魚槍 → 湊 4 個零件造太空船 → 升空、登艦、打反應爐核心。
> 我特別想推兩件事：一是「安全圈」——圈內你不會受傷、敵彈會被吸掉；二是「裝備繼承」——你的魚槍等級直接決定艦炮火力，沒升滿在母船裡傷害只剩 10%。
> 全程序化美術與音效（沒有圖片和音檔），載入很快。歡迎回報卡點與數值問題，我會照著改。#獨立遊戲 #HTML5 #基地建造 #逃出大海

## 8. 截圖腳本（可直接執行）

**前置（每台機器一次）**
```powershell
$P = 9305   # E 專用，勿與 A/B/C/D 共用
Start-Process 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList `
  '--headless=new','--disable-gpu','--hide-scrollbars',"--remote-debugging-port=$P",`
  "--user-data-dir=$env:TEMP\cdp-$P",'about:blank'
Start-Sleep 4
Set-Location 'H:\DeepSeek\PROJECT\PROGRAMM\_dev'
$env:CDP_PORT = '9305'; $env:OUT_DIR = 'H:\DeepSeek\PROJECT\PROGRAMM\_shots\E'
```
> `shot.mjs` 固定 1280×800、每張存成 `NN-<scenario>.png`；`EXTRA_EVAL` 在最後一張前執行一段 JS。`node shot.mjs title` **不會自己截圖**，要搭配 `EXTRA_EVAL`。

**5 個必拍畫面＋補資料＋指令**

| # | 畫面（成品檔） | 要先補的 `__T` 假資料 | 指令 |
|---|---|---|---|
| 1 | 標題／母船剪影（`00-title.png`） | 無；想乾淨可 `localStorage.clear()` 後把按鈕文字改「開始遊戲」 | `$env:EXTRA_EVAL="'ok'"; node shot.mjs title` |
| 2 | 海面收集（`02-sea-clean.png`） | `mountAll()` 讓 HUD 有「基地 19 座／BOT 3/3」；傳送到 `(300,-1350)` 顯示「外海 資源×1.3」；手動塞 16 個 pickup＋3 隻怪；先等 3.3s 讓任務 toast 消失 | 見下方 A |
| 3 | 基地面板（`03-base.png`） | `teleportHome(); grantAll(); mountAll()` → 19 座建築、安全圈 486m、平台 20 格 | `node shot.mjs base`（內建） |
| 4 | 裝備／太空船（`04-craft-upgrade.png`、`05-craft-launch.png`） | `mountAll()` 後把 `game.up` 設 `{fin:3,tank:3,suit:3,magnet:3,harpoon:4,shield:3}`，再 `openCraft()`；第二張 `modal-body.scrollTop=99999` 拍零件區 | 見下方 B |
| 5 | 母船決戰（`09-moon-boss.png`、`10-moon-alliance.png`、`11-moon-beam.png`） | `moon.wave=2; moon.aliens=[]; moon.waveT=9` 等 0.2s → Boss 出場；`mountAll()` 後把 `moon.boss.hp` 打到 85% 觸發衛星；`callAlliance()` 加同盟軍 | 見下方 C |

```powershell
# A：海面收集（實際跑過，可重現 02-sea-clean.png）
$env:EXTRA_EVAL = @'
(async () => {
  __T.mountAll();
  await new Promise(r => setTimeout(r, 3300));            // 等任務完成 toast 消失
  const P = __T.sea.player;
  P.x = 300; P.y = -1350; P.hp = 6; P.ox = 100; P.st = 100; P.inv = 0;
  __T.sea.cam.x = P.x - 640; __T.sea.cam.y = P.y - 380;
  __T.sea.pickups.length = 0; __T.sea.hazards.length = 0; __T.sea.floats.length = 0;
  document.getElementById('toasts').innerHTML = '';
  const types = ['plastic','wood','metal','crate','plastic','metal','air'];
  for (let i = 0; i < 16; i++) __T.sea.pickups.push({x: P.x-420+Math.random()*840, y: P.y-260+Math.random()*560, type: types[i%7], t: Math.random()*6, r: types[i%7]==='crate'?24:17, alive: true});
  for (const [ty,dx,dy] of [['shark',-380,-40],['drone',120,-240],['jelly',330,220]])
    __T.sea.hazards.push({type: ty, x: P.x+dx, y: P.y+dy, hp: 3, maxhp: 3, aggr: 1, dmgMul: 1, t: 1, cool: 9, ang: 0.5, r: 20, alive: true, hit: 0, flee: 0});
  return 'clean';
})()
'@
node shot.mjs sea

# B：裝備面板（Lv 全滿）
$env:EXTRA_EVAL = @'
(() => {
  __T.mountAll();
  Object.assign(__T.game.up, { fin: 3, tank: 3, suit: 3, magnet: 3, harpoon: 4, shield: 3 });
  __T.openCraft();
  setTimeout(() => { document.getElementById('modal-body').scrollTop = 99999; }, 60);
  return 'ok';
})()
'@
node shot.mjs craft

# C：母船核心＋衛星光束
$env:EXTRA_EVAL = @'
(async () => {
  __T.mountAll();
  __T.moon.wave = 2; __T.moon.aliens = []; __T.moon.waveT = 9;
  await new Promise(r => setTimeout(r, 200));
  if (__T.moon.boss) __T.moon.boss.hp = __T.moon.boss.maxhp * 0.85;
  return 'beam';
})()
'@
node shot.mjs moon
```

## 9. 待決事項／風險

- **售價**（Lead 已定方向）：itch.io 免費上架、Steam 願望清單優先；價格等有商店頁再定，文件內 US$2.99 為暫定值。
- `[待定]` **Steam 需要 1920×1080 截圖**：目前 `shot.mjs` 寫死 1280×800（`_dev/shot.mjs:94`），要請 Lead 加尺寸參數；在那之前 Steam 頁先用 itch 素材。
- **風險**：所有截圖是 headless 實機畫面，母船與基地的「中文 UI 字型」依賴系統的 Microsoft JhengHei；發行前要在 macOS／Linux 檢查 fallback（`style.css` 字型堆疊）。
- **風險／假設**：README 現有數值與程式不一致（海域倍率、任務數、同盟軍 50%/55%），商店文案先不要寫死具體倍率，數字以 `docs/content/LEVELS-v0.4.md` 第 6 節為準。「一輪 30–45 分鐘」是目標值，S1 平衡後要用乾淨存檔跑 3 次計時，若實際 >60 分鐘就改文案。
