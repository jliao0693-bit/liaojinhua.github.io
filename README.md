# 12 的个人空间 — 个人博客（静态复刻 · 6 页面）

Ardot 设计稿 `个人博客设计`（首页 `2:1 玻璃质感设计博客` 1440 × 2487）的静态 HTML / CSS 复刻，
覆盖设计稿中的全部 6 个画板，页面之间可互相跳转。无构建步骤，直接用浏览器打开 `index.html` 即可。

```
gerenboke/
├─ index.html           # 首页 · 玻璃质感设计博客（1440 × 2487 原尺寸复刻）
├─ works.html           # 作品列表页 · 卡片网格 + 两级筛选（类型 / 细分领域）
├─ work-detail.html     # 旧链接兼容页 · 自动跳转到 works/soundlive.html
├─ works/               # 19 个作品详情页（由 tools/works-data.json 生成，一项目一页）
│  ├─ jiujiu-app.html       # 啾啾 · 泛娱乐社交 App
│  ├─ soundlive.html        # 声浪 · 音乐直播分享 App
│  ├─ food-social.html      # 美食社交 App · 美食社区与同城约饭
│  ├─ camp-share.html       # 露营分享 App · 户外足迹社区
│  ├─ swim-social.html      # 游泳社交 · 游泳技术分享社区 App
│  ├─ dive-share.html       # 潜水分享 · 潜水员约潜社区 App
│  ├─ photo-share.html      # 摄影社区 · 摄影作品分享与找搭子 App
│  ├─ diy-drink.html        # DIY 饮品 · 自己调一杯的饮品社区 App
│  ├─ loan-app.html         # 分期借款 App · 西语 / 英语双语钱包
│  ├─ coin-wallet.html      # 加密钱包 App · 印尼语 · 行情 / 持仓 / 买卖
│  ├─ fragrance-app.html    # 香水 App · 香调分析 / 香方社区 · 英文 6 屏
│  ├─ crappo-site.html      # CRAPPO · 加密资产交易官网（PC 端）
│  ├─ media-portal.html     # 融媒体媒资后台 · 工作台 / 素材管理（PC 端）
│  ├─ ai-edit-emotion.html  # AI 剪辑 · 营销视频 · 金融类型 1
│  ├─ summer-fair.html      # 运营 / 营销 · 夏日趣市 · 电商促销活动页（480 宽单页 H5）
│  ├─ finance-campaign.html # 运营 / 营销 · 金融活动页三连（LBANK / moomoo / MEXICASH）
│  ├─ reading-campaign.html # 运营 / 营销 · 阅读 App 充值返券长页（480 × 2077）
│  ├─ view.html             # 本地新增作品的详情页（?slug=…；出厂作品会重定向到静态页）
│  └─ …（共 19 个，命名即 slug，见下）
├─ manage.html           # 作品管理 · 新增 / 批量上传 / 编辑 / 隐藏 / 导出（noindex，不进导航）
├─ spec/                # 3 个项目规范详情页（项目级规范轮播里有独立规范页的 3 个项目）
│  ├─ fitness-app.html      # 移动端 · 悦动 · 健身 App
│  ├─ dashboard-bi.html     # PC 端 · 洞察 · 数据看板
│  └─ city-screen.html      # 大屏 · 智慧城市 · 指挥大屏
├─ project-spec.html    # 早期「项目规范」长文档稿（粘性目录 + 交付 / 验收 / 版本表），现已无入口
├─ design-system.html   # 主要设计规范页 · 项目级规范置顶 + 五类规范标签切换 / 使用原则
├─ about.html           # 关于我页 · 简介 / 数据 / 技能 / 履历 / 联系方式
├─ assets/
│  ├─ styles.css        # 设计令牌、重置、页面框架、玻璃层、各区块布局、响应式
│  ├─ pages.css         # 子页面层：面包屑、页头、文档双栏、案例图文、色卡字阶、规范标签页、履历时间线
│  ├─ works-filter.js   # 作品列表两级筛选（原生 JS，读 data-cat / data-sub，无构建步骤）
│  ├─ works-index.js    # 作品索引种子（由 tools/build-works-index.ps1 从 works.html + works-data.json 生成）
│  ├─ works-store.js    # 作品数据层：种子 + localStorage 增删改 + 图片压缩 + 导出
│  ├─ works-overlay.js  # 列表页叠加层：隐藏 / 改字段 / 新卡片 + 管理模式的编辑·删除按钮
│  ├─ work-view.js      # works/view.html 的渲染（新增作品的详情）
│  ├─ manage.js         # 作品管理页交互（列表 / 编辑器 / 确认弹层 / 批量上传 / 导出）
│  ├─ ds-tabs.js        # 设计规范标签切换（原生 JS，读 data-ds-tab / data-ds-panel，带深链与键盘）
│  ├─ carousel.js       # 通用轮播（首页「精选作品」+ 设计规范「项目级规范」共用）：一屏 3 张、15s 前进一张、无缝循环 + 暂停/进度
│  ├─ spec-cards.js     # 设计规范页的项目卡：按 WorksStore.all() 逐张渲染（分类 -> 设备胶囊），再 manual init 轮播
│  ├─ covers.css        # 9 处图形的 CSS 源（只被 tools/artwork 使用）
│  ├─ video/            # 视频（演示录屏 / 动效稿），规格与压缩命令见该目录 README.md
│  └─ images/           # 卡片图 / 大图：covers.css / artwork 渲染的 2x–4x PNG（含 3 张运营活动页封面与主视觉）+ 啾啾 / 声浪 / 美食社交 / 露营分享 / 游泳社交 / 潜水分享 / 摄影社区 / DIY 饮品 / 分期借款的设计稿原图 + 加密钱包与媒资后台（HTML/CSS 重绘并截图）+ 香水 App（原图 1:1）+ 3 张运营活动页原稿（480 宽，直接 1:1 展示）+ 品牌图标 logo-12.png
├─ tools/
│  ├─ artwork/*.html    # 单张图形页面（精确盒子），供 headless Chrome 截图
│  ├─ works-data.json   # 19 个作品详情页的内容源（标题 / 文案 / 图片 / 数据）
│  ├─ build-works.ps1   # 生成 works/*.html：powershell -File tools\build-works.ps1
│  ├─ build-works-index.ps1  # 生成 assets/works-index.js（改了 works.html 卡片或 works-data.json 后跑一次）
│  └─ build-images.ps1  # 渲染 PNG：powershell -File tools\build-images.ps1
└─ README.md
```

## 页面与跳转

| 页面 | 文件 | 入口 |
| --- | --- | --- |
| 首页 | `index.html` | 品牌 logo / 导航「首页」 |
| 作品列表 | `works.html` | 导航「作品」、首页「查看全部作品」 |
| 作品详情 ×16 | `works/<slug>.html` | 作品列表 / 首页的每张卡片各自指向自己的项目；详情页「上一个 / 下一个」按顺序串联，首尾相接 |
| 新增作品详情 | `works/view.html?slug=…` | 本机新增作品的卡片；命中出厂作品时自动重定向到它的静态详情页 |
| 作品管理 | `manage.html` | 作品列表工具条「＋ 上传 / 管理作品」、卡片管理模式里的「编辑」；`noindex`，不进主导航 |
| 项目规范 ×3 | `spec/<设备>.html` | 设计规范页「项目级规范」轮播里对应项目的卡片（只有登记过规范页的 3 个项目直链过来，其余进作品详情）；页尾「上一份 / 下一份」串联 |
| 主要设计规范 | `design-system.html` | 导航「设计规范」、首页「查看完整规范」 |
| 关于我 | `about.html` | 导航「关于我」、页脚、作品列表底部「联系我」 |

首页保留站内锚点（`#works` / `#guide` / `#about`）用于本页内跳转，导航与页脚一律指向真实页面。

设计规范页（`design-system.html`）分成上下两段：

1. **项目级规范** 置顶：不再写死 3 个示例，而是按「实际上传的作品」逐张渲染项目卡
   （`assets/spec-cards.js` 读 `WorksStore.all()`，出厂 19 个 + 管理页新增 / 隐藏后的结果），
   分类映射成设备胶囊与适配要点（移动端 / PC 端 / 大屏 / 活动页 / 宣传图 / 视频）；
   一屏 3 张、每 15s 前进一张，位移与进度条复用首页那套 `assets/carousel.js`；
2. **主要设计规范**：一块玻璃面板 + 一条胶囊标签栏，色彩系统 / 字体规范 / 间距与圆角 / 玻璃质感 / 组件
   五类点哪个看哪个，同一时刻只展开一个面板；末尾的 **使用原则** 独立成段，始终可见。

**一套轮播两处用**：`assets/carousel.js` 是通用实现（`window.Carousel = { init, initAll }`），
自动初始化只处理没标 `data-carousel="manual"` 的容器。首页直接靠自动初始化跑；
设计规范页的卡片要先由 `spec-cards.js` 渲染，所以容器标了 `manual`，渲染完再 `Carousel.init(root)`
（克隆、克隆件的 `aria-hidden` / `inert`、计数与进度条都在 init 里一次装好）。没有 JS 时页面里的
3 张静态卡仍然可见，轮播退化成静态首屏。

标签切换写在 `assets/ds-tabs.js`（原生 JS，无依赖、无构建）：

| 操作 | 结果 |
| --- | --- |
| 点击标签 | 只展开该分类面板，标签压成墨黑胶囊，其余面板 `hidden` |
| ← → / ↑ ↓ / Home / End | 在同一组标签间移动焦点并直接切换（漫游 `tabindex`，读屏播报 `aria-selected`） |
| 地址栏 | 同步成 `design-system.html#glass` 这类 hash，可直接分享；前进 / 后退与外部深链也会跟着切 |

无 JS 时第一个面板（色彩系统）依旧可见，标签栏退化成静态胶囊，不会出现内容整体消失的情况。

## 项目规范详情页

「项目级规范」轮播里的卡片就是入口：整卡可点，登记过规范页的项目（目前 3 个：移动端 / PC 端 / 大屏）直链到对应的
项目规范详情页（`spec/`，一项目一页，结构与设计稿一致），其余项目进自己的作品详情页。

| 项目 | 页面 | 页面内容 |
| --- | --- | --- |
| 移动端 · 悦动 · 健身 App | `spec/fitness-app.html` | 专项组件（运动圆环 / 训练进度条 / 健康卡片）· iPhone / Android / 平板三档适配 · 项目级渐变与字号 |
| PC 端 · 洞察 · 数据看板 | `spec/dashboard-bi.html` | 专项组件（KPI 卡 / 全局筛选器 / 图表容器）· 1280 / 1440 / 1920 三档断点 · 项目级渐变与字号 |
| 大屏 · 智慧城市 · 指挥大屏 | `spec/city-screen.html` | 专项组件（地图底图 / 指标翻牌 / 异常流）· 1080p / 4K / 拼屏三档 · 项目级渐变与字号 |

每页结构固定四段：页头（项目名 + 适配范围 / 设计稿 / 适配优先 / 版本）→ **专项组件** → **设备适配规范** →
**颜色与字体（项目级）**。面包屑的「设计规范」回到 `design-system.html#plspec-title`；
页尾「上一份 / 下一份」按 移动端 → PC 端 → 大屏 串联，首尾相接。样式是 `pages.css` 里的 `.spec-*` 一组，
令牌（玻璃层、圆角、间距）与作品详情页共用，不新增取值。


## 作品列表的两级筛选

`works.html` 的筛选区按设计稿做成二级结构，交互写在 `assets/works-filter.js`（原生 JS，无依赖、无构建）：

| 级别 | 控件 | 行为 |
| --- | --- | --- |
| 一级 | 全部 / App 设计 / PC 端设计 / 宣传图 Banner / 可视化大屏 / AI 剪辑 · 生成 / 运营 · 营销 | 只看该类型；同时在该类型下展开它自己的细分分组，并清空二级选中态 |
| 二级 | 各类型下的「… 细分」胶囊 | 在该类型范围内再筛一层，再点一次取消；选中时一级自动跟随细分所属的类型 |

`全部` 状态下**不出现**二级细分：筛选区只有一行类型胶囊，点任一类型才展开该类型的一组「… 细分」；
回到 `全部` 时细分整块收起、二级选中态清空。右侧计数与空状态随筛选更新。卡片用
`<article class="work" data-cat="app" data-sub="social">` 声明归属：`data-cat` 对应一级胶囊，
`data-sub` 对应二级胶囊，新增项目只要补这两个属性即可被筛到，不需要改 JS。

筛选状态会同步到地址栏，可直接分享或从首页深链进来：

```
works.html                   # 全部
works.html?cat=app           # App 设计
works.html?cat=promo&sub=finance   # 运营 / 营销 › 金融 / 投资
```

首页只剩「精选作品」轮播（一屏 3 张，每 15s 前进一张）；按类型找作品的入口集中在
`works.html` 的筛选区，`works.html?cat=…` 可以直接从任何地方深链进来。

当前 19 个项目的分布：

| 类型 | 项目 | 细分 |
| --- | --- | --- |
| App 设计 | 啾啾 · 泛娱乐社交 App / 声浪 · 音乐直播分享 App / 美食社交 App · 美食社区与同城约饭 | 社交 / 泛娱乐 |
| App 设计 | 露营分享 App · 户外足迹社区 / 潜水分享 App · 潜水员约潜社区 | 户外 / 生活方式 |
| App 设计 | 游泳社交 App · 游泳技术分享社区 | 运动 / 技术社区 |
| App 设计 | 摄影社区 App · 摄影作品分享与找搭子 | 社交 / 泛娱乐 |
| App 设计 | DIY 饮品 App · 自己调一杯的饮品社区 | 社交 / 泛娱乐 |
| App 设计 | 分期借款 App · 西语 / 英语双语钱包 | 金融 / 工具 |
| App 设计 | 加密钱包 App · 印尼市场 · 行情 / 持仓 / 买卖 | 金融 / 工具 |
| App 设计 | 香水 App · 香调分析 / 香方社区（英文 6 屏） | 社交 / 泛娱乐 |
| PC 端设计 | CRAPPO · 加密资产交易官网（六段单页官网，1440） | 后台 / 官网 / SaaS |
| PC 端设计 | 融媒体媒资后台 · 工作台 / 素材管理（两屏，1920） | 后台 / 官网 / SaaS |
| AI 剪辑 / 生成 | AI 剪辑三支（营销视频 · 金融类型 1 / 2 / 3） | AI 剪辑视频 |
| 运营 / 营销 | 夏日趣市 · 电商促销活动页（480 × 985 单页 H5，满减三档） | 电商 / 大促 |
| 运营 / 营销 | 金融活动页三连（LBANK 理财 / moomoo 开户 / MEXICASH 现金贷） | 金融 / 投资 |
| 运营 / 营销 | 阅读 App · 充值返券长页（480 × 2077，任务两档券 + 双倍券） | 内容 / 充值 |

> 早期铺量的 11 个示例项目（数据看板 / Banner / 大屏等）已从站点撤下，
> 整条 project 数据保留在 `tools/works-archive.json`，需要时贴回 `tools/works-data.json` 再跑一次构建即可复原。

## 作品管理：新增 / 编辑 / 隐藏（本机浏览器）

`manage.html` 是站内的作品后台：**新增作品、批量上传图片、改标题 / 类型 / 细分 / 标签 / 封面、隐藏不想展示的项目**。
纯静态站没有服务端，所以改动写在 `localStorage`（key `gerenboke.works.v1`），叠加在出厂种子之上：

```
assets/works-index.js（出厂状态，只读，由 build-works-index.ps1 生成）
        ＋ localStorage：deleted[] / edits{} / added[]
        ＝ works.html、manage.html、works/view.html 看到的最终内容
```

| 操作 | 入口 | 结果 |
| --- | --- | --- |
| 新增作品 | 管理页「＋ 新增作品」 | 写进 `added`，卡片排在作品列表最前，详情走 `works/view.html?slug=…` |
| 批量上传 | 管理页「批量上传图片」 | 每张图生成一条草稿（标题 = 文件名），再逐个「编辑」补文案 |
| 编辑 | 管理页每行的「编辑」，或列表页管理模式下卡片的「编辑」 | 出厂作品只覆盖卡片字段（`edits`）；新增作品直接改自身 |
| 隐藏 | 管理页「隐藏」/ 卡片「删除」 | 出厂作品进 `deleted`，可随时恢复；新增作品是真删 |
| 恢复初始 | 管理页「恢复初始」 | 清空 `localStorage`，回到出厂状态 |

- 列表页工具栏的「管理模式」是个开关（状态同样存在 `localStorage`）：**关闭时访客看不到任何管理按钮**，
  打开后每张卡片右上角出现「编辑 / 删除」，工具栏按钮变成「退出管理」。
- 封面在选择时就被 `canvas` 压成 584×400 JPEG（约 40–90 KB）再存；5 MB 配额大约放得下几十张，
  写满会给出明确提示，不会静默失败。
- 「导出 JSON ＋ 图片」下载 `works-export.json`（`works-data.json` 的 `projects` 片段）+ 新增作品的封面 PNG。
  把它们交回仓库、重跑 `tools\build-works.ps1`，改动才真正写进静态页（详情页 / 上下篇 / 计数一起更新）。
- 出厂作品的**静态详情页正文**不在管理页编辑范围内 —— 那部分是 `tools/works-data.json` 渲染的，
  编辑弹层里对这一点有明确说明。新增作品要固化：封面存成 `assets/images/work-<slug>.png`，
  把导出的 project 追加进 `tools/works-data.json`，再跑 `build-works.ps1` 与 `build-works-index.ps1`。
- 卡片用 `<article class="work" data-cat data-sub data-slug>` 定位，叠加层只改这几个字段与 DOM 结构，
  所以筛选、计数、空状态与无 JS 时的静态页面都不受影响。

## 作品详情页：14 个项目一一对应

作品详情不再共用一页。`works/` 下每个项目一个静态页，文件名就是 slug；作品列表和首页的卡片各自指向自己的项目：

| slug | 项目 | 主视觉 |
| --- | --- | --- |
| `jiujiu-app` | 啾啾 · 泛娱乐社交 App | `jiujiu-hero.png` ＋ 部分界面截图 5 张（整个 App 三十多屏中节选） |
| `soundlive` | 声浪 · 音乐直播分享 App | `soundlive-hero.png` ＋ 5 屏真实界面截图（`soundlive-home / room / rank / detail / profile`） |
| `food-social` | 美食社交 App · 美食社区与同城约饭 | `foodsocial-hero.png` ＋ 5 屏真实界面截图（`foodsocial-home / filter / card / other / coins`） |
| `camp-share` | 露营分享 App · 户外足迹社区 | `campshare-hero.png` ＋ 6 屏真实界面截图（`campshare-home / post / other / publish / me / coins`） |
| `swim-social` | 游泳社交 App · 游泳技术分享社区 | `swim-hero.png` ＋ 5 屏真实界面截图（`swim-home / topic / publish / profile / call`） |
| `dive-share` | 潜水分享 App · 潜水员约潜社区 | `dive-hero.png` ＋ 8 屏真实界面截图（`diveshare-home / post / places / explore / messages / login / me / me-detail`） |
| `photo-share` | 摄影社区 App · 摄影作品分享与找搭子 | `photo-hero.png` ＋ 5 屏真实界面截图（`photoshare-home / explore / post / detail / me`） |
| `diy-drink` | DIY 饮品 App · 自己调一杯的饮品社区 | `drink-hero.png` ＋ 6 屏真实界面截图（`drink-home / share / create / profile / other / edit`） |
| `loan-app` | 分期借款 App · 西语 / 英语双语钱包 | `loan-hero.png` ＋ 5 屏真实界面截图（`loan-plan-es / plan-en / bills-es / bills-en / account-es`）＋ 双版 Banner（`loan-banner`） |
| `coin-wallet` | 加密钱包 App · 印尼市场 · 行情 / 持仓 / 买卖 | `coin-hero.png` ＋ 5 屏界面（`coin-market / home / profile / portfolio / detail`），全部为 HTML/CSS 重绘后截图 |
| `crappo-site` | CRAPPO · 加密资产交易官网（PC 端） | `crypto-hero.png` ＋ 6 段设计稿原图（`crypto-header / features / trade / why / subscribe / footer`），均为 1440 宽桌面截图 |
| `media-portal` | 融媒体媒资后台 · 工作台 / 素材管理（PC 端） | `media-hero.png` ＋ 2 屏界面（`media-dashboard / media-assets`），1920×1080，全部为 HTML/CSS 重绘后截图 |
| `ai-edit-emotion` | AI 剪辑 · 营销视频 · 金融类型 1 | `work-video-emotion-large.png` ＋ 竖版成片 `assets/video/ai-edit-emotion.mp4` |
| `ai-edit-reversal` | AI 剪辑 · 营销视频 · 金融类型 2 | `work-video-reversal-large.png` ＋ 竖版成片 `assets/video/ai-edit-reversal.mp4` |
| `ai-edit-trend` | AI 剪辑 · 营销视频 · 金融类型 3 | `work-video-trend-large.png` ＋ 竖版成片 `assets/video/ai-edit-trend.mp4` |
| `summer-fair` | 夏日趣市 · 电商促销活动页 | `summer-fair-hero.png` ＋ 完整活动页原稿 `summer-fair-page.png`（480 × 985，1:1） |
| `finance-campaign` | 金融活动页 · 三产品投放三连 | `finance-campaign-hero.png` ＋ 三张活动页原稿 `finance-campaign-{lbank,moomoo,mexicash}.png`（1:1，288 宽的 MEXICASH 按原生宽展示） |
| `reading-campaign` | 阅读 App · 充值返券长页 | `reading-campaign-hero.png` ＋ 完整长页 `reading-campaign-page.png`（480 × 2077，1:1） |

> 声浪的界面截图直接用设计稿原图（`assets/images/soundlive-*.png`），封面与主视觉由
> `tools/artwork/work-soundlive.html`、`soundlive-hero.html` 把原图拼版后截图生成，不用 CSS 重绘界面。
>
> 美食社交同理：11 屏原图在 `assets/images/foodsocial-*.png`（登录选择 / 订阅 / 发布 /
> 个人主页 / 筛选 / 社区首页 / 卡片滑选 / 动态详情 / 他人主页 / 我的 / 资料填写），
> 封面与主视觉由 `tools/artwork/work-foodsocial.html`、`foodsocial-hero.html`（配 `foodsocial.css`）拼版生成。
>
> 露营分享：7 张原图在 `assets/images/campshare-*.png`（首页 / 动态详情 `post` / 他人主页 /
> 发布 / 个人主页 / 金币购买，另有一张首页的第二版导出 `campshare-home-alt.png`，未进正文），
> 封面与主视觉由 `tools/artwork/work-campshare.html`、`campshare-hero.html`（配 `campshare.css`）拼版生成。
> `campshare-places.png` 是早期归位时留下的首页副本（内容与 `campshare-home.png` 相同、未被引用），可随时删除。
>
> 游泳社交：6 张原图在 `assets/images/swim-*.png`（话题广场 `home` / 话题列表 `topic` /
> 发布分流 `publish` / 个人主页 `profile` / 视频通话 `call`，另有一版首页导出 `swim-home-alt.png` 未进正文），
> 封面与主视觉由 `tools/artwork/work-swim.html`、`swim-hero.html`（配 `swim.css`）拼版生成。
> 正文按「整个 App 交付」写：话题、动态、发布两条路、个人主页、消息、视频通话、设置都在范围里，
> 截图只是节选，所以截图墙上方的说明明确写了「这里只是其中 5 屏」。
>
> 潜水分享：8 张原图在 `assets/images/diveshare-*.png`（首页 `home` / 推荐详情 `post` /
> 潜点榜 `places` / 探索 `explore` / 消息 `messages` / 登录 `login` / 个人主页 `me` 与 `me-detail`），
> 封面与主视觉由 `tools/artwork/work-dive.html`、`dive-hero.html`（配 `diveshare.css`）拼版生成。
> 正文按「整个 App 交付」写：登录、首页、推荐详情、潜点榜、探索、消息、个人主页、金币与设置都在范围里，
> 8 屏全部进正文，但截图墙上方明确写了这只是整套界面的一部分。
>
> 摄影社区：5 张原图在 `assets/images/photoshare-*.png`（首页 `home` / 探索 `explore` /
> 发布 `post`（780×1970，长页）/ 作品详情 `detail` / 个人主页 `me`），
> 封面与主视觉由 `tools/artwork/work-photo.html`、`photo-hero.html`（配 `photoshare.css`）拼版生成。
> 正文按「整个 App 交付」写：For You 首页、探索、发布、作品详情、个人主页、活动详情、Quiz Match、
> 器材讨论、消息、金币与设置都在范围里，5 屏只是节选，截图墙上方也写明了这一点。
>
> DIY 饮品：6 张原图在 `assets/images/drink-*.png`（首页 `home`（780×2050，长页）/ 分享 `share` /
> 发布-盲盒 `create` / 个人中心 `profile` / 他人主页 `other` / 发布前的社区规则弹窗 `edit`），
> 封面与主视觉由 `tools/artwork/work-drink.html`、`drink-hero.html`（配 `drinkapp.css`）拼版生成。
> 正文按「整个 App 交付」写：Home、Share、Create 的三条创作入径（Edit / Recipe upload / Blind box）、
> 个人中心、他人主页、My coins、My Recipes、社区规则弹窗、消息与设置都在范围里，6 屏全部进正文。
>
> 分期借款：7 张原图在 `assets/images/loan-*.png`（计划详情 `plan-es / plan-en`、账单 `bills-es / bills-en`、
> 账户 `account-es / account-en`，以及西英双版营销 Banner `loan-banner.png`，390×844 与 788×282 原尺寸），
> 封面与主视觉由 `tools/artwork/work-loan.html`、`loan-hero.html`（配 `loanapp.css`）拼版生成。
> 正文取「三块界面 × 双语言」的思路：截图墙放 plan / bills 的西英各一版 + 账户（西）共 5 屏，
> 双版 Banner 比例不同，单独用一个整幅 `figure` 段展示；`loan-account-en.png` 只用于封面与主视觉里的叠放，不单独进正文。
>
> 加密交易官网（PC 端）：6 张原图在 `assets/images/crypto-*.png`（`header / features / trade / why / subscribe / footer`），
> 都是 1440 宽的桌面截图，不能进 420px 高的手机截图墙，所以正文全部用整幅 `figure`；
> 最后两段（订阅带 1440×392、页脚 1440×552）较矮，用一个 `figures` 段两栏并排。
> 封面 `work-crypto.png` 与主视觉 `crypto-hero.png` 由 `tools/artwork/work-crypto.html`、`crypto-hero.html`（配 `cryptosite.css`）
> 把首屏原图装进「浏览器窗口」拼版生成，不用 CSS 重绘界面。
>
> 加密钱包（印尼市场）：这一组**没有设计稿原图**，五屏界面是照参考截图在
> `tools/artwork/coin-*.html` 里用 HTML/CSS 1:1 重绘（`coin-market / home / profile / portfolio / detail`，
> 画布 390×844，样式集中在 `coinwallet.css`），再用 headless Chrome 截成 780×1688 的 PNG。
> 封面 `work-coin.png` 与主视觉 `coin-hero.png` 由 `work-coin.html`、`coin-hero.html` 以 `<img>` 叠放这几张截图拼版生成，
> 所以 `build-images.ps1` 里必须先出五屏、再出封面与主视觉（脚本里的顺序就是渲染顺序，别调换）。
>
> 融媒体媒资后台（PC 端）：同样是重绘，两屏界面在 `tools/artwork/media-dashboard.html` 与
> `media-assets.html`（画布 1920×1080，样式集中在 `mediaportal.css`），用 headless Chrome 截成 1920×1080 的 PNG；
> 素材卡里的缩略图不是新画的，而是从 `assets/images/photoshare-home.png` 等既有截图里按网格坐标裁切（`media-thumb-1..9`）。
> 封面 `work-media.png` / `work-media-large.png` 与主视觉 `media-hero.png` 由 `work-media.html`、`media-hero.html`
> 以 `<img>` 叠放两屏截图拼版生成，`build-images.ps1` 里同样要先出两屏、再出封面与主视觉。
>
> 香水 App（英文 6 屏）：这一组**有设计稿原图**，六屏在 `_inbox/perfume/raw` 收的原尺寸 780×1688 PNG 已按语义改名进
> `assets/images/fragrance-{home,analysis,feed,post,profile,formula}.png`（`发现.png` = 首页 `fragrance-home`，
> `首页.png` = For You 信息流 `fragrance-feed`，源文件名与内容相反，改名时按截图内容对齐，别再按原文件名换回来）。
> 封面 `work-fragrance.png` 与主视觉 `fragrance-hero.png` 由 `tools/artwork/work-fragrance.html`、`fragrance-hero.html`
> （配 `fragranceapp.css`）以 `<img>` 叠放这几张原图拼版生成，不重绘任何界面。

### 两条内容纪律（新增项目照此办理）

- **不写「周期」**：新项目的 `meta` 只放客户 / 角色 / 工具三项。想补回来直接在 `meta` 里加一条
  `{ "k": "周期", "v": "6 周（2025.03）" }` 即可 —— 渲染器按条数自动换列（1 / 2 / 3 条各有对应栅格），
  四项以上回到默认四栏，不会留下空格子。
- **「问题与解决」的条数不固定**：`qa` 段的 `items` 有几条就渲染几张卡，1 条、2 条、4 条、5 条都出现过；
  `note` 里的数字要跟着条数改（例如「3 个整站级权衡」），别让标题和内容对不上。

页面全部由 `tools/works-data.json` 渲染，换文案 / 换图 / 加项目都不用碰 HTML：

```
powershell -ExecutionPolicy Bypass -File tools\build-works.ps1
```

脚本会按 `projects` 的顺序重新生成 14 个页面，并自动串好「上一个 / 下一个」（首尾相接），
结束时打印每个 slug 对应的输出文件。

### 内容模板

一个项目就是一条 JSON，字段和页面区块一一对应：

| 字段 | 落到页面哪里 | 怎么写 |
| --- | --- | --- |
| `slug` | 文件名 `works/<slug>.html` | 英文短横线；改它等于换文件名，要同步改列表页链接 |
| `title` | `<title>`、面包屑、`h1` | 与列表页卡片标题保持一致，如 `啾啾 · 泛娱乐社交 App` |
| `cat` | 归档用（不渲染） | `App 设计` / `PC 端设计` / `宣传图 / Banner` / `可视化大屏` / `AI 剪辑 / 生成` / `运营 / 营销` |
| `eyebrow` | 标题上方的胶囊 | `Case Study · ` + 一句话定位，如 `Case Study · 泛娱乐社交 App（C 端）` |
| `desc` | `meta description` | 60–90 字，能被搜索结果完整显示 |
| `lead` | 标题下的导语 | 2–3 句：原来什么问题、这次怎么解 |
| `meta` | 信息条（默认四栏） | `k` 是标签、`v` 是值；条数不固定，渲染器按 1 / 2 / 3 条自动换列。常见写法：客户 / 角色 / 工具（新项目**不写周期**，要补再加一条 `周期`） |
| `hero` | 主视觉大图 + 图注 | `img` `w` `h` `alt` `cap`，`img` 只写文件名 |
| `sections` | 正文各段，按数组顺序排 | 见下表 |

`hero` 建议尺寸：卡片 4x 图 `1168 × 800`，看板类 3x 图 `1536 × 1020`。宽度高度写进 `<img>`，
能避免图片加载时页面跳动；换成真实截图后如果比例变了，记得一起改 `w` / `h`。

### 正文区块（sections）

| `type` | 渲染成 | 必填键 |
| --- | --- | --- |
| `prose` | 玻璃面板 + 若干段落 | `id` `title` `note` `text`（字符串数组） |
| `bullets` | 玻璃面板 + 要点列表 | `id` `title` `note` `items` |
| `figure` | 大图 + 图注（整幅 1120 宽） | `id` `title` `note` `img` `w` `h` `alt` `cap` |
| `figures` | 两栏并排的图 + 各自图注（每栏 548 宽，窄屏自动叠成一栏） | `id` `title` `note` `images`（每项 `img` `w` `h` `alt` `cap`） |
| `gallery` | 手机截图墙（一行最多 5 屏，窄屏自动换行换高） | `id` `title` `note` `shots`（每项 `img` `w` `h` `alt` `cap`），可选 `text`（截图墙上方的一段说明） |
| `swatches` | 色卡 + 一段说明 | `id` `title` `note` `colors`（`blue` `violet` `mint` `ink`）、`text` |
| `stats` | 三列数据 | `id` `title` `note` `stats`（每项 `v` 值 + `l` 说明） |
| `qa` | 问题 / 解决复盘卡（宽屏两列、≤900px 一列；**条数不固定**，几条就渲染几张） | `id` `title` `note` `items`（每项 `q` 问题 + `a` 解决） |
| `flow` | 从设计到交付时间线（圆点复用蓝 / 紫 / 薄荷，条数不限） | `id` `title` `note` `items`（每项 `t` 步骤名 + `d` 说明） |
| `video` | 视频播放器（默认 16:9，竖版加 `portrait` 收窄成 9:16） | `id` `title` `note` `src`（`assets/video/` 里的文件名）或 `embed`，可选 `poster` `w` `h` `cap` `portrait` `autoplay` `loop` `muted` |

`note` 是标题右侧的小灰字（时间、样本量、口径），没有就不写；最后一段会自动带上 `block--last` 的底边距。

### 复制即填

把下面这段放进 `tools/works-data.json` 的 `projects` 数组（项目顺序即页面顺序、也就是「上一个 / 下一个」的顺序），
改完再跑一次 `tools\build-works.ps1` 就多一个详情页：

```json
{
  "slug": "your-project",
  "title": "项目名 · 副标题",
  "cat": "App 设计",
  "eyebrow": "Case Study · 一句话定位",
  "desc": "给搜索结果用的 60–90 字摘要。",
  "lead": "两到三句导语：原来什么问题、这次怎么解、结果如何。",
  "meta": [
    { "k": "客户", "v": "客户名" },
    { "k": "角色", "v": "职责，如 UI + 视觉设计" },
    { "k": "工具", "v": "Figma · Ardot" }
  ],
  "hero": {
    "img": "work-fitness-large.png", "w": 1168, "h": 800,
    "alt": "截图里能看到什么（给读屏与 SEO）",
    "cap": "主视觉 · 一句话点评这张图的看点。"
  },
  "sections": [
    { "id": "bg", "title": "项目背景", "note": "2025 Q1 · 访谈 8 场", "type": "prose",
      "text": ["第一段：原来的问题是什么。", "第二段：这次的目标是什么。"] },
    { "id": "strategy", "title": "设计策略", "note": "一句话概括", "type": "bullets",
      "items": ["策略一，尽量写成可验收的动作。", "策略二。", "策略三。"] },
    { "id": "lang", "title": "视觉语言", "note": "与作品集共用一套 token", "type": "swatches",
      "colors": ["blue", "violet", "mint", "ink"],
      "text": "配色与层级怎么定的，一两句说清。" },
    { "id": "result", "title": "成果", "note": "上线后第 6 周数据", "type": "stats",
      "stats": [
        { "v": "-58%", "l": "指标说明（改前 → 改后）" },
        { "v": "24", "l": "指标说明" },
        { "v": "4.7/5", "l": "指标说明（样本量）" }
      ] }
  ]
}
```

新增项目后，别忘了在 `works.html` 里补一张卡片（`data-cat` / `data-sub` 决定筛选归属，
两个链接都指向 `works/<slug>.html`）；`slug` 改名时同理，要同步改列表页的链接。

## 与设计稿的对齐方式

所有尺寸、圆角、阴影、颜色都直接来自设计树，而不是目测：

| 区块 | 画布 y | 高度 |
| --- | --- | --- |
| Header | 0 | 72 |
| 关于我 | 72 | 276 |
| Hero | 348 | 580 |
| 作品展示墙 | 928 | 916 |
| 设计规范 | 1844 | 460 |
| Footer | 2304 | 183 |

关键还原点（容易做错的几处）：

- **导航不是右对齐**：画布中 `Nav` 框宽 826 且贴住右侧内容边距，因此首个链接落在
  x=566，而不是挤在最右边。CSS 里对应 `.nav { flex: 0 1 826px }`。
- **区块标题栏高 127px**：标题在 +16、右侧「查看全部作品」胶囊在 +45，二者垂直居中于
  127 高的框内；分类胶囊已从首页移除，轮播直接接在标题栏下面。
- **首页作品墙改成了 3 张一屏的轮播**：画布原本是 320 固定列 + 第 4 张换行的静态网格
  （区块高 916），右侧留出 336px 空白；现在三张卡片按 `(内容宽 − 2×24) / 3 = 432` 均分，
  每 15s 前进一张、滚到末尾无缝回到第 1 张。实现见 `styles.css` 的 `.carousel*` 与
  `assets/carousel.js`；`--carousel-visible` 是唯一的「一屏几张」开关（3 / 2 / 1），
  卡片仍复用 `.work` 玻璃卡，只是封面换成 1168 宽的 4x 图源通过 `srcset` 取用。
- **设计规范页的项目卡和首页共用同一套轮播**：`assets/carousel.js` 从首页那份抽通用后，
  两边只剩「谁来喂卡片」不同——首页卡片在 HTML 里，设计规范页由 `assets/spec-cards.js`
  按 `WorksStore.all()` 渲染（`data-carousel="manual"` 让自动初始化跳过，渲染完再 init）。
  卡片高度跟着行内最高那张拉伸（`.plspec-carousel .carousel__slide { height: auto }`），
  标题与适配要点各裁两行，翻页时整排不会跳高。
- **玻璃效果降级映射**：画布的 GLASS 含 `refraction / depth / light intensity` 三个
  浏览器没有的参数，按深度映射为 `backdrop-filter` 的模糊/饱和度组合（见 `styles.css`
  顶部注释），并叠加 1px 高光描边与 inset 顶光。

## 图片资产（PNG）

设计稿中的 6 处 IMAGE 填充无法通过 Ardot 导出接口取得（任何 file id 都返回
`Design file does not exist`）。保留方案：把这 6 处图形写成 **同尺寸的 CSS 插画**（`assets/covers.css`），
再用 headless Chrome 按各自盒子栅格化成 PNG，页面里只引用 PNG，CSS 只作为可复现的源。
其中头像（2:84）已换成真实插画，不走渲染流水线，`tools/artwork/avatar.html` 只作为历史稿保留。
后来新增的三张「AI 剪辑」封面（`tools/artwork/work-video-{emotion,reversal,trend}.html`）不在设计稿里，
但沿用同一个 292 × 200 盒子与字号，也走这条流水线，所以和其余封面并排不会跳。
三张共用 `covers.css` 里 `.cover--video` 的结构，只通过 `--cv-*` 变量换配色
（`.cover--video` 冷蓝紫 / `--warm` 暖橙粉 / `--trend` 亮橙）。

| 画布节点 | 盒子 | 输出 PNG | 规格 |
| --- | --- | --- | --- |
| 品牌 logo「12」 | 32×32 圆角 | `assets/images/logo-12.png` | 256 × 256（从原图裁圆角，另存 64px favicon） |
| 2:84 头像 | 180×180 r90 | `assets/images/avatar.png` | 360 × 360（真实插画，非渲染） |
| 2:25 Hero 看板 | 512×340 r18 | `assets/images/hero-dashboard.png` | 1024 × 680（2x） |
| 2:25 同上 · 详情页大图 | 512×340 | `assets/images/hero-dashboard-large.png` | 1536 × 1020（3x） |
| 2:41 健身 App | 292×200 r16 | `assets/images/work-fitness.png` | 584 × 400（2x） |
| 2:46 数据看板 | 292×200 r16 | `assets/images/work-dash.png` | 584 × 400（2x） |
| 2:51 新品宣传图 | 292×200 r16 | `assets/images/work-promo.png` | 584 × 400（2x） |
| 2:56 盛夏 Banner | 292×200 r16 | `assets/images/work-mint.png` | 584 × 400（2x） |
| ai-edit-emotion 金融类型 1 | 292×200 r16 | `assets/images/work-video-emotion.png` | 584 × 400（2x） |
| ai-edit-reversal 金融类型 2 | 292×200 r16 | `assets/images/work-video-reversal.png` | 584 × 400（2x） |
| ai-edit-trend 金融类型 3 | 292×200 r16 | `assets/images/work-video-trend.png` | 584 × 400（2x） |
| summer-fair · 夏日趣市 | 292×200 r16 | `assets/images/work-summer-fair.png` | 584 × 400（2x，另出 4x `-large`） |
| finance-campaign · 金融三连 | 292×200 r16 | `assets/images/work-finance-campaign.png` | 584 × 400（2x，另出 4x `-large`） |
| reading-campaign · 充值返券 | 292×200 r16 | `assets/images/work-reading-campaign.png` | 584 × 400（2x，另出 4x `-large`） |
| 三个运营项目 · 详情页主视觉 | 824×474 | `assets/images/{summer-fair,finance-campaign,reading-campaign}-hero.png` | 1648 × 948（2x） |
| 以上各张 · 详情页大图 | 292×200 | `assets/images/work-*-large.png` | 1168 × 800（4x） |
| 啾啾 · 卡片封面 | 292×200 r16 | `assets/images/work-jiujiu.png` | 584 × 400（2x，主视觉居中裁切） |
| 啾啾 · 主视觉（详情页大图） | 824×474 | `assets/images/jiujiu-hero.png` | 原图 1:1 |
| 啾啾 · 部分界面截图 5 屏 | 246–320 宽 | `assets/images/jiujiu-{weather,home,chat,profile,vip}.png` | 原图 1:1 |
| 声浪 · 卡片封面 | 292×200 r16 | `assets/images/work-soundlive.png` | 584 × 400（2x，`work-soundlive.html` 拼版） |
| 声浪 · 主视觉（详情页大图） | 824×474 | `assets/images/soundlive-hero.png` | 1648 × 948（2x） |
| 声浪 · 界面截图 | 780×1688 | `assets/images/soundlive-*.png` | 原图 1:1 |
| 美食社交 · 卡片封面 | 292×200 r16 | `assets/images/work-foodsocial.png` | 584 × 400（2x，`work-foodsocial.html` 拼版） |
| 美食社交 · 主视觉（详情页大图） | 824×474 | `assets/images/foodsocial-hero.png` | 1648 × 948（2x） |
| 美食社交 · 界面截图 11 屏 | 780×1688 | `assets/images/foodsocial-*.png` | 原图 1:1 |
| 露营分享 · 卡片封面 | 292×200 r16 | `assets/images/work-campshare.png` | 584 × 400（2x，`work-campshare.html` 拼版） |
| 露营分享 · 主视觉（详情页大图） | 824×474 | `assets/images/campshare-hero.png` | 1648 × 948（2x，`campshare-hero.html`） |
| 露营分享 · 界面截图 7 张 | 780×1688 | `assets/images/campshare-*.png` | 原图 1:1（6 屏入正文，`campshare-home-alt.png` 为首页第二版） |
| 游泳社交 · 卡片封面 | 292×200 r16 | `assets/images/work-swim.png` | 584 × 400（2x，`work-swim.html` 拼版） |
| 游泳社交 · 主视觉（详情页大图） | 824×474 | `assets/images/swim-hero.png` | 1648 × 948（2x，`swim-hero.html`） |
| 游泳社交 · 界面截图 6 张 | 780×1688 | `assets/images/swim-*.png` | 原图 1:1（5 屏入正文，`swim-home-alt.png` 为首页第二版） |
| 潜水分享 · 卡片封面 | 292×200 r16 | `assets/images/work-dive.png` | 584 × 400（2x，`work-dive.html` 拼版） |
| 潜水分享 · 主视觉（详情页大图） | 824×474 | `assets/images/dive-hero.png` | 1648 × 948（2x，`dive-hero.html`） |
| 潜水分享 · 界面截图 8 张 | 780×1688 | `assets/images/diveshare-*.png` | 原图 1:1（8 屏全部入正文） |
| 摄影社区 · 卡片封面 | 292×200 r16 | `assets/images/work-photo.png` | 584 × 400（2x，`work-photo.html` 拼版） |
| 摄影社区 · 主视觉（详情页大图） | 824×474 | `assets/images/photo-hero.png` | 1648 × 948（2x，`photo-hero.html`） |
| 摄影社区 · 界面截图 5 屏 | 780×1688（发布页 780×1970） | `assets/images/photoshare-*.png` | 原图 1:1（5 屏全部入正文） |
| DIY 饮品 · 卡片封面 | 292×200 r16 | `assets/images/work-drink.png` | 584 × 400（2x，`work-drink.html` 拼版） |
| DIY 饮品 · 主视觉（详情页大图） | 824×474 | `assets/images/drink-hero.png` | 1648 × 948（2x，`drink-hero.html`） |
| DIY 饮品 · 界面截图 6 屏 | 780×1688（首页 780×2050） | `assets/images/drink-*.png` | 原图 1:1（6 屏全部入正文） |
| 分期借款 · 卡片封面 | 292×200 r16 | `assets/images/work-loan.png` | 584 × 400（2x，`work-loan.html` 拼版） |
| 分期借款 · 主视觉（详情页大图） | 824×474 | `assets/images/loan-hero.png` | 1648 × 948（2x，`loan-hero.html`） |
| 分期借款 · 界面截图 7 张 | 390×844（Banner 788×282） | `assets/images/loan-*.png` | 原图 1:1（5 屏入截图墙，Banner 单独成整幅图） |
| CRAPPO 官网 · 卡片封面 | 292×200 r16 | `assets/images/work-crypto.png` | 584 × 400（2x，`work-crypto.html` 拼版；另出 4x `work-crypto-large.png`） |
| CRAPPO 官网 · 主视觉（详情页大图） | 824×474 | `assets/images/crypto-hero.png` | 1648 × 948（2x，`crypto-hero.html`） |
| CRAPPO 官网 · 页面截图 6 段 | 1440 宽（392–1874 高） | `assets/images/crypto-{header,features,trade,why,subscribe,footer}.png` | 原图 1:1（6 段全部入正文） |
| 加密钱包 · 卡片封面 | 292×200 r16 | `assets/images/work-coin.png` | 584 × 400（2x，`work-coin.html` 拼版；另出 4x `work-coin-large.png`） |
| 加密钱包 · 主视觉（详情页大图） | 824×474 | `assets/images/coin-hero.png` | 1648 × 948（2x，`coin-hero.html`） |
| 加密钱包 · 界面截图 5 屏 | 780×1688 | `assets/images/coin-{market,home,profile,portfolio,detail}.png` | 390×844 重绘后 2x 截屏（5 屏全部入正文） |
| 媒资后台 · 卡片封面 | 292×200 r16 | `assets/images/work-media.png` | 584 × 400（2x，`work-media.html` 拼版；另出 4x `work-media-large.png`） |
| 媒资后台 · 主视觉（详情页大图） | 824×474 | `assets/images/media-hero.png` | 1648 × 948（2x，`media-hero.html`） |
| 媒资后台 · 界面截图 2 屏 | 1920×1080 | `assets/images/media-{dashboard,assets}.png` | 1920×1080 重绘后 1:1 截屏（2 屏全部入正文） |
| 媒资后台 · 素材缩略图 9 张 | 各 188–700 宽 | `assets/images/media-thumb-1..9.png` | 从 `photoshare-home.png` 等截图按网格裁切，供素材卡使用 |
| 香水 App · 卡片封面 | 292×200 r16 | `assets/images/work-fragrance.png` | 584 × 400（2x，`work-fragrance.html` 拼版；另出 4x `work-fragrance-large.png`） |
| 香水 App · 主视觉（详情页大图） | 824×474 | `assets/images/fragrance-hero.png` | 1648 × 948（2x，`fragrance-hero.html`） |
| 香水 App · 界面截图 6 屏 | 780×1688 | `assets/images/fragrance-{home,analysis,feed,post,profile,formula}.png` | 设计稿原图 1:1（6 屏全部入正文） |

重新生成（需要本机 Chrome 或 Edge）：

```
powershell -ExecutionPolicy Bypass -File tools\build-images.ps1
```

脚本会逐个打开 `tools/artwork/*.html`，用
`--headless=new --force-device-scale-factor=N --window-size=W,H --screenshot=…`
渲染并在结束时打印每张图的实际像素尺寸。只想重渲染某几张时按输出名过滤：

```
powershell -ExecutionPolicy Bypass -File tools\build-images.ps1 -Only foodsocial
```

**已知取舍**：作品列表页现在 14 个项目，封面全部是独立图：啾啾、声浪、美食社交、露营分享、游泳社交、潜水分享、摄影社区、DIY 饮品、分期借款与加密交易官网是设计稿原图拼版截图，
加密钱包没有原图、是 HTML/CSS 重绘后截图拼版，三支 AI 剪辑是 CSS 插画（`work-video-*.png`）。声浪、美食社交、露营分享、游泳社交、潜水分享、摄影社区、DIY 饮品、分期借款与加密交易官网的页面截图直接使用原图
（`assets/images/soundlive-*.png`、`foodsocial-*.png`、`campshare-*.png`、`swim-*.png`、`diveshare-*.png`、`photoshare-*.png`、`drink-*.png`、`loan-*.png`、`crypto-*.png`），不再用 CSS 重绘；
加密钱包这一组反过来——屏图本身就是 CSS 重绘的产物（`coin-*.png`），改界面要改 `tools/artwork/coin-*.html` 再重渲染。
要换图直接把 PNG 覆盖到 `assets/images/` 同名文件，布局不会位移。

## 视频资产（MP4）

视频统一放 `assets/video/`，页面用原生 `<video>` 播放，组件样式在 `pages.css`
的 `.video` / `.video__el`（与 `.figure` 同一套圆角 `--r-hero` 与 `--shadow-hero`，
默认 16:9 占位，加载元数据前不会跳动）。

两条路，按文件大小选：

| 方式 | 做法 | 适合 |
| --- | --- | --- |
| 本地文件 | MP4 放 `assets/video/`，页面写 `<video>` | ≤ 20 MB 的演示录屏；完全自主、无广告、可离线 |
| 外链嵌入 | 数据里写 `"embed": "<iframe src>"`（B 站 / YouTube / 腾讯视频） | 几分钟以上的长视频；不占仓库体积，但要联网、有平台水印 |

规格与压缩命令见 `assets/video/README.md`。`-movflags +faststart` 必加，
否则浏览器要下完整个文件才开始播。

现成例子：`works/ai-edit-emotion.html`、`works/ai-edit-reversal.html`、`works/ai-edit-trend.html`
的「成片」一段都是本地文件方案 —— `assets/video/ai-edit-{emotion,reversal,trend}.mp4`
（720 × 1280 竖版，18 / 15 / 18 秒，约 2.1 / 3.9 / 2.0 MB），数据里都加了 `"portrait": true`。
换片子只要把同名文件替换掉再跑一次构建，页面不用动。

### 在作品详情页加视频

在 `tools/works-data.json` 对应项目的 `sections` 里插一段，然后重新构建：

```json
{
  "id": "demo-video",
  "type": "video",
  "title": "动效演示",
  "note": "真机录屏，1 分 12 秒",
  "src": "jiujiu-demo.mp4",
  "poster": "jiujiu-hero.png",
  "w": 1920,
  "h": 1080,
  "cap": "首页下拉、消息气泡与 VIP 页的过渡"
}
```

| 字段 | 说明 |
| --- | --- |
| `src` | `assets/video/` 里的文件名；文件不存在时构建会跳过这一段并给警告，不算失败 |
| `poster` | 封面图，写 `assets/images/` 里的文件名，缺省则播放器显示深色底 |
| `w` / `h` | 原始像素，写进 `width` / `height` 供浏览器预留比例；缺省 1920 × 1080 |
| `portrait` | `true` 时收窄到 420px 并改成 9:16（手机录屏 / 短视频式演示） |
| `autoplay` | 自动播放，会同时加上 `muted` + `playsinline`（不加静音会被浏览器拦） |
| `loop` / `muted` | 循环 / 静音 |
| `embed` | 填了就改用第三方播放器，此时 `src` / `poster` 不再需要 |

构建后页面里是：

```html
<figure class="video">
  <video class="video__el" src="../assets/video/jiujiu-demo.mp4" poster="../assets/images/jiujiu-hero.png"
         width="1920" height="1080" controls playsinline preload="metadata">
    <p>你的浏览器不支持 video 标签，可<a href="../assets/video/jiujiu-demo.mp4">点此下载观看</a>。</p>
  </video>
  <figcaption class="video__cap">首页下拉、消息气泡与 VIP 页的过渡</figcaption>
</figure>
```

### 在其他静态页（首页 / 关于我 / 作品列表）加视频

那几个页面是手写的 HTML，不用构建，直接贴同一套类名即可：

```html
<figure class="video">
  <video class="video__el" src="assets/video/showreel.mp4" poster="assets/images/hero-dashboard-large.png"
         width="1920" height="1080" controls playsinline preload="metadata"></video>
  <figcaption class="video__cap">2025 作品集 · 1 分 30 秒</figcaption>
</figure>
```

第三方播放器则用外层比例框 + `iframe`，`iframe` 自己铺满，不必手算高度：

```html
<figure class="video">
  <div class="video__frame">
    <iframe src="//player.bilibili.com/player.html?bvid=BV1xx411c7mD&autoplay=0"
            title="作品演示" loading="lazy" allowfullscreen scrolling="no"></iframe>
  </div>
</figure>
```

## 部署到 GitHub Pages

整站是纯静态文件（没有打包产物），把仓库推到 GitHub 就能直接跑：

1. 站点根目录要等于仓库根 —— `index.html` 在第一层，不要再套一层子目录，
   否则 `assets/`、`works/` 的相对路径全要改。
2. GitHub → **Settings → Pages → Build and deployment**，Source 选 `Deploy from a branch`，
   Branch 选 `main` + 目录 `/ (root)`，保存后等 1–2 分钟。
3. 地址形如 `https://<用户名>.github.io/<仓库名>/`。页面里全部是相对路径，
   放在子路径下也能正常跳转。

与 GitHub Pages 有关的几条限制：

| 项 | 限制 | 这里的做法 |
| --- | --- | --- |
| 单文件 | 100 MB 硬上限 | 视频压到 ≤ 20 MB 并加 `-movflags +faststart`，更大的走 iframe 外链 |
| 仓库体积 | 建议 ≤ 1 GB | 只提交压好的 mp4 / png，原始素材不进仓库 |
| 路径大小写 | 区分大小写 | 文件名统一英文小写 + 连字符，已有文件均按此约定 |
| Jekyll | 默认会用 Jekyll 处理一遍 | 纯静态站点可以放一个空的 `.nojekyll`，跳过处理、也避免下划线开头的文件被忽略 |

部署完打开 `works/ai-edit-emotion.html` 点一次播放，确认视频在线上能加载即可。

## 响应式

首页（`styles.css`）：

| 断点 | 变化 |
| --- | --- |
| ≤1280 | Hero 两栏收窄 |
| ≤1024 | Hero 改为上下堆叠，轮播（首页 + 设计规范页共用）2 张一屏（`--carousel-visible: 2`），规范卡 1 列 |
| ≤760 | 栅格 24px 边距，标题降级，轮播 1 张一屏、卡间距 16（`--carousel-visible: 1`） |
| ≤600 | Header 折成两行；Hero 看板改为裁切显示，避免 5px 文字被压缩 |
| ≤480 | 按钮通栏 |

子页面（`pages.css`）：

| 断点 | 变化 |
| --- | --- |
| ≤1280 | 作品列表 4 列 → 3 列，色卡 6 列 → 4 列 |
| ≤1024 | 文档页目录取消吸顶改为置顶；作品 2 列；meta / 数据 / 联系卡 2 列；流程 4 → 2 |
| ≤760 | 全部单列；筛选区两级胶囊换行、二级胶囊降为 30 高；规范标签栏改为横向滚动；字阶行、时间线改为上下结构；个人简介竖向排列 |


## 无障碍

- `lang="zh-CN"`；`h1`（页面主标题）→ `h2`（区块）→ `h3`（卡片）层级完整，子页面的视觉标题
  用 `.sr-only` 补充，避免出现无标题的区块。
- 装饰性插画 `aria-hidden="true"`；语义图（头像、看板、作品封面）一律带描述性 `alt`。
- 导航用 `aria-current="page"` 标识当前页；筛选用 `aria-pressed`，结果计数容器带 `aria-live="polite"`，
  筛选后读屏会播报「共 N 个项目」；无 JS 时全部卡片直接可见，筛选胶囊只是无动作的按钮。
- 设计规范的标签是完整的 `tablist / tab / tabpanel` 结构：`aria-selected` 与漫游 `tabindex` 同步选中态，
  面板用 `aria-labelledby` 指回所属标签；无 JS 时首个面板仍然显示。
- 表格带 `<caption>` 与 `th[scope]`。
- 精选作品轮播（首页 `data-carousel`）与项目级规范轮播（设计规范页 `data-carousel="manual"`）
  是同一个 `assets/carousel.js`：外层 `role="region"` + `aria-roledescription="carousel"`，每张卡是
  `role="group"` + `aria-roledescription="slide"` + `aria-label="n / 19"`；循环用的克隆件挂了
  `aria-hidden` 与 `inert`，不会重复进无障碍树或被 Tab 到。自动播放只在本区块进入视口时进行，
  hover / 聚焦 / 切后台都会暂停，前后按钮是原生 `<button>`。
- 键盘焦点统一 `:focus-visible` 描边；`prefers-reduced-motion` 下关闭全部位移与过渡，
  轮播不自动播放、进度条隐藏，只留手动翻页。

## 技术栈

- 原生 HTML + 自定义 CSS（精确像素控制）。`index.html` 通过 Tailwind Play CDN 引入同一套设计令牌
  （`text-hero` / `bg-ink` / `shadow-card` / `rounded-hero` 等）；子页面不加载 Tailwind，
  直接复用 `styles.css` 的 CSS 变量与组件类，减少重复配置。
- 两个样式层：`styles.css`（令牌 + 首页 + 通用组件）与 `pages.css`（子页面布局），
  子页面只引用后者新增的类，不覆盖首页规则。作品列表的筛选交互单独放在 `assets/works-filter.js`
  （原生 JS，约 150 行），不引入任何框架。
- 作品管理没有后端：`assets/works-store.js` 把 `localStorage` 当成一层「覆盖层」，
  叠在只读种子 `assets/works-index.js` 之上；图片用 `canvas` 压成 584×400 JPEG 再存，
  导出时还原成 `works-data.json` 片段 + PNG，交回构建脚本固化。所有脚本都是 ES5 风格的原生 JS，
  `file://` 双击打开即可使用（已在 Chrome 实测 `localStorage` / canvas / Blob / `<dialog>` 可用）。
- 字体：Inter（西文 / 数字）+ 中文回退（Noto Sans SC 由 Google Fonts 提供，系统栈兜底）。

