# ============================================================================
#  12 的个人空间 — artwork -> PNG
#  ---------------------------------------------------------------------------
#  The Ardot file's bitmap fills cannot be exported (the MCP export API
#  reports "Design file does not exist" for every file id we can reach), so the
#  same artwork is kept as CSS in assets/covers.css and rasterised here with
#  headless Chrome. Output lands in assets/images/ at 2x for card use and at
#  3-4x for the large hero / case-study slots.
#
#  Avatar 例外：assets/images/avatar.png 现在是真实插画头像，不再由
#  tools/artwork/avatar.html 生成，重跑本脚本不会覆盖它。
#
#  Usage:  powershell -ExecutionPolicy Bypass -File tools\build-images.ps1
# ============================================================================
param(
  [string]$Chrome = 'C:\Program Files\Google\Chrome\Application\chrome.exe',
  # 只渲染名字里包含该关键字的任务，例如 -Only foodsocial
  [string]$Only = ''
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

if (-not (Test-Path $Chrome)) {
  $Chrome = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
}
if (-not (Test-Path $Chrome)) { throw "No Chromium browser found for rasterising." }

$root    = Split-Path -Parent $PSScriptRoot          # gerenboke/
$artDir  = Join-Path $PSScriptRoot 'artwork'
$outDir  = Join-Path $root 'assets\images'
$profile = Join-Path $env:TEMP 'aurora-artwork-profile'

New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# ---------------------------------------------------------------------------
#  媒资后台的素材缩略图：案例里没有可用的图源（原稿截图不在仓库里），所以从既有
#  App 截图的口播图 / 详情大图上按 3:2 裁出 9 张真实照片，拼进 media-assets.html
#  的素材卡片里。顺序即 media-thumb-1..9，页面里的 <img> 按同名引用。
# ---------------------------------------------------------------------------
if (-not $Only -or $Only -like '*media*' -or 'media-thumb' -like "*$Only*") {
  # 源文件, 取景框（源图像素：x, y, w, h）, 输出名
  $thumbs = @(
    @{ src = 'photoshare-home.png';   x = 80;  y = 620;  w = 630; h = 250; name = 'media-thumb-1' },
    @{ src = 'photoshare-detail.png'; x = 40;  y = 200;  w = 700; h = 660; name = 'media-thumb-2' },
    @{ src = 'diveshare-explore.png'; x = 86;  y = 370;  w = 614; h = 342; name = 'media-thumb-3' },
    @{ src = 'diveshare-home.png';    x = 70;  y = 995;  w = 645; h = 295; name = 'media-thumb-4' },
    @{ src = 'photoshare-home.png';   x = 78;  y = 1150; w = 288; h = 170; name = 'media-thumb-5' },
    @{ src = 'photoshare-home.png';   x = 415; y = 1150; w = 285; h = 170; name = 'media-thumb-6' },
    @{ src = 'diveshare-explore.png'; x = 86;  y = 1037; w = 614; h = 342; name = 'media-thumb-7' },
    @{ src = 'diveshare-home.png';    x = 477; y = 447;  w = 188; h = 173; name = 'media-thumb-8' },
    @{ src = 'diveshare-home.png';    x = 0;   y = 120;  w = 702; h = 180; name = 'media-thumb-9' }
  )

  foreach ($t in $thumbs) {
    $source = Join-Path $outDir $t.src
    if (-not (Test-Path $source)) { throw "Missing thumb source: $source" }

    # 在取景框内居中对齐裁成 3:2，再原尺寸输出（不放大，卡片的 302x200 足够）
    $ratio = 3 / 2
    $cw = [int]$t.w; $ch = [int]$t.h
    if ($cw / $ch -gt $ratio) { $cw = [int]($ch * $ratio) } else { $ch = [int]($cw / $ratio) }
    $cx = [int]$t.x + [int](($t.w - $cw) / 2)
    $cy = [int]$t.y + [int](($t.h - $ch) / 2)

    $src = [System.Drawing.Image]::FromFile($source)
    $rect = New-Object System.Drawing.Rectangle($cx, $cy, $cw, $ch)
    $bmp = New-Object System.Drawing.Bitmap($cw, $ch)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = 'HighQualityBicubic'
    $g.DrawImage($src, (New-Object System.Drawing.Rectangle(0, 0, $cw, $ch)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $dest = Join-Path $outDir ($t.name + '.png')
    $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose(); $src.Dispose()

    "{0,-22} {1,5} x {2,-5} (crop {3},{4} from {5})" -f $t.name, $cw, $ch, $cx, $cy, $t.src | Write-Host
  }
  Write-Host ""
}

# file, css box (1x), scale factor, output name
$jobs = @(
  # avatar 已换成真实插画（assets/images/avatar.png），不再用 artwork/avatar.html 渲染
  @{ file = 'shot.html';          w = 512; h = 340; scale = 2; name = 'hero-dashboard' },
  @{ file = 'shot.html';          w = 512; h = 340; scale = 3; name = 'hero-dashboard-large' },
  @{ file = 'work-fitness.html';  w = 292; h = 200; scale = 2; name = 'work-fitness' },
  @{ file = 'work-dash.html';     w = 292; h = 200; scale = 2; name = 'work-dash' },
  @{ file = 'work-promo.html';    w = 292; h = 200; scale = 2; name = 'work-promo' },
  @{ file = 'work-mint.html';     w = 292; h = 200; scale = 2; name = 'work-mint' },
  @{ file = 'work-fitness.html';  w = 292; h = 200; scale = 4; name = 'work-fitness-large' },
  @{ file = 'work-dash.html';     w = 292; h = 200; scale = 4; name = 'work-dash-large' },
  @{ file = 'work-promo.html';    w = 292; h = 200; scale = 4; name = 'work-promo-large' },
  @{ file = 'work-mint.html';     w = 292; h = 200; scale = 4; name = 'work-mint-large' },
  # 新增项目：AI 剪辑三支竖版成片（不在设计稿里，沿用 292x200 盒子）
  @{ file = 'work-video-emotion.html';  w = 292; h = 200; scale = 2; name = 'work-video-emotion' },
  @{ file = 'work-video-reversal.html'; w = 292; h = 200; scale = 2; name = 'work-video-reversal' },
  @{ file = 'work-video-trend.html';    w = 292; h = 200; scale = 2; name = 'work-video-trend' },
  @{ file = 'work-video-emotion.html';  w = 292; h = 200; scale = 4; name = 'work-video-emotion-large' },
  @{ file = 'work-video-reversal.html'; w = 292; h = 200; scale = 4; name = 'work-video-reversal-large' },
  @{ file = 'work-video-trend.html';    w = 292; h = 200; scale = 4; name = 'work-video-trend-large' },
  # 新项目：声浪 SoundLive（音乐直播分享 App）——封面 + 主视觉；四屏界面直接用设计稿原图
  @{ file = 'work-soundlive.html';      w = 292; h = 200; scale = 2; name = 'work-soundlive' },
  @{ file = 'work-soundlive.html';      w = 292; h = 200; scale = 4; name = 'work-soundlive-large' },
  @{ file = 'soundlive-hero.html';      w = 824; h = 474; scale = 2; name = 'soundlive-hero' },
  # 新项目：美食社交 App（社区 + 同城约饭）——封面 + 主视觉；11 屏界面直接用设计稿原图
  @{ file = 'work-foodsocial.html';     w = 292; h = 200; scale = 2; name = 'work-foodsocial' },
  @{ file = 'work-foodsocial.html';     w = 292; h = 200; scale = 4; name = 'work-foodsocial-large' },
  @{ file = 'foodsocial-hero.html';     w = 824; h = 474; scale = 2; name = 'foodsocial-hero' },
  # 新项目：露营分享 App（户外足迹社区）——封面 + 主视觉；7 屏界面直接用设计稿原图
  @{ file = 'work-campshare.html';      w = 292; h = 200; scale = 2; name = 'work-campshare' },
  @{ file = 'work-campshare.html';      w = 292; h = 200; scale = 4; name = 'work-campshare-large' },
  @{ file = 'campshare-hero.html';      w = 824; h = 474; scale = 2; name = 'campshare-hero' },
  # 新项目：游泳社交 App（话题广场 + 视频约泳）——封面 + 主视觉；界面直接用设计稿原图
  @{ file = 'work-swim.html';           w = 292; h = 200; scale = 2; name = 'work-swim' },
  @{ file = 'work-swim.html';           w = 292; h = 200; scale = 4; name = 'work-swim-large' },
  @{ file = 'swim-hero.html';           w = 824; h = 474; scale = 2; name = 'swim-hero' },
  # 新项目：潜水分享 App（热门潜点 + 约潜社区）——封面 + 主视觉；8 屏界面直接用设计稿原图
  @{ file = 'work-dive.html';           w = 292; h = 200; scale = 2; name = 'work-dive' },
  @{ file = 'work-dive.html';           w = 292; h = 200; scale = 4; name = 'work-dive-large' },
  @{ file = 'dive-hero.html';           w = 824; h = 474; scale = 2; name = 'dive-hero' },
  # 新项目：摄影社区 App（每日活动 + 找搭子 + 器材讨论）——封面 + 主视觉；5 屏界面直接用设计稿原图
  @{ file = 'work-photo.html';          w = 292; h = 200; scale = 2; name = 'work-photo' },
  @{ file = 'work-photo.html';          w = 292; h = 200; scale = 4; name = 'work-photo-large' },
  @{ file = 'photo-hero.html';          w = 824; h = 474; scale = 2; name = 'photo-hero' },
  # 新项目：DIY 饮品 App（盲盒配方 + AI 助手 + 每日挑战）——封面 + 主视觉；6 屏界面直接用设计稿原图
  @{ file = 'work-drink.html';          w = 292; h = 200; scale = 2; name = 'work-drink' },
  @{ file = 'work-drink.html';          w = 292; h = 200; scale = 4; name = 'work-drink-large' },
  @{ file = 'drink-hero.html';          w = 824; h = 474; scale = 2; name = 'drink-hero' },
  # 新项目：金融借款 App（还款计划 + 账单状态 + 西 / 英双语）——封面 + 主视觉；6 屏界面直接用设计稿原图
  @{ file = 'work-loan.html';           w = 292; h = 200; scale = 2; name = 'work-loan' },
  @{ file = 'work-loan.html';           w = 292; h = 200; scale = 4; name = 'work-loan-large' },
  @{ file = 'loan-hero.html';           w = 824; h = 474; scale = 2; name = 'loan-hero' },
  # 新项目：金融 / 加密资产交易官网（CRAPPO · PC 端）——封面 + 主视觉；六段页面截图直接用设计稿原图
  @{ file = 'work-crypto.html';         w = 292; h = 200; scale = 2; name = 'work-crypto' },
  @{ file = 'work-crypto.html';         w = 292; h = 200; scale = 4; name = 'work-crypto-large' },
  @{ file = 'crypto-hero.html';         w = 824; h = 474; scale = 2; name = 'crypto-hero' },
  # 新项目：金融 / 加密资产交易 App（印尼语 · 行情 / 持仓 / 买卖）——五屏按原稿重绘后截图，
  # 封面与主视觉再拿这五张渲染图拼版（顺序不能换：先五屏，后封面）
  @{ file = 'coin-market.html';         w = 390; h = 844; scale = 2; name = 'coin-market' },
  @{ file = 'coin-home.html';           w = 390; h = 844; scale = 2; name = 'coin-home' },
  @{ file = 'coin-profile.html';        w = 390; h = 844; scale = 2; name = 'coin-profile' },
  @{ file = 'coin-portfolio.html';      w = 390; h = 844; scale = 2; name = 'coin-portfolio' },
  @{ file = 'coin-detail.html';         w = 390; h = 844; scale = 2; name = 'coin-detail' },
  @{ file = 'work-coin.html';           w = 292; h = 200; scale = 2; name = 'work-coin' },
  @{ file = 'work-coin.html';           w = 292; h = 200; scale = 4; name = 'work-coin-large' },
  @{ file = 'coin-hero.html';           w = 824; h = 474; scale = 2; name = 'coin-hero' },
  # 新项目：香水 App（香调分析 + 香方社区）——六屏界面直接用设计稿原图（780x1688），
  # 只需要渲染封面与主视觉两张拼版（顺序无所谓：拼的是 assets/images 里的原图）
  @{ file = 'work-fragrance.html';      w = 292; h = 200; scale = 2; name = 'work-fragrance' },
  @{ file = 'work-fragrance.html';      w = 292; h = 200; scale = 4; name = 'work-fragrance-large' },
  @{ file = 'fragrance-hero.html';      w = 824; h = 474; scale = 2; name = 'fragrance-hero' },
  # 新项目：融媒体媒资后台（PC 后台 · 工作台 / 素材管理）——两屏按原稿 1:1 重绘成
  # 1920x1080 的 HTML 后按 1x 截图（后台不需要 2x，网格里只看整体信息密度），
  # 封面与主视觉再用这两张渲染图拼版（顺序不能换：先两屏，后封面）
  @{ file = 'media-dashboard.html';     w = 1920; h = 1080; scale = 1; name = 'media-dashboard' },
  @{ file = 'media-assets.html';        w = 1920; h = 1080; scale = 1; name = 'media-assets' },
  @{ file = 'work-media.html';          w = 292; h = 200; scale = 2; name = 'work-media' },
  @{ file = 'work-media.html';          w = 292; h = 200; scale = 4; name = 'work-media-large' },
  @{ file = 'media-hero.html';          w = 824; h = 474; scale = 2; name = 'media-hero' },
  # 新项目：运营 / 营销活动页三张（电商促销 / 金融活动 / 阅读充值）——活动页长图直接用
  # 上传的交付稿原图（480 宽，已放进 assets/images），这里只渲染三张封面与三张主视觉
  @{ file = 'work-summer-fair.html';    w = 292; h = 200; scale = 2; name = 'work-summer-fair' },
  @{ file = 'work-summer-fair.html';    w = 292; h = 200; scale = 4; name = 'work-summer-fair-large' },
  @{ file = 'summer-fair-hero.html';    w = 824; h = 474; scale = 2; name = 'summer-fair-hero' },
  @{ file = 'work-finance-campaign.html'; w = 292; h = 200; scale = 2; name = 'work-finance-campaign' },
  @{ file = 'work-finance-campaign.html'; w = 292; h = 200; scale = 4; name = 'work-finance-campaign-large' },
  @{ file = 'finance-campaign-hero.html'; w = 824; h = 474; scale = 2; name = 'finance-campaign-hero' },
  @{ file = 'work-reading-campaign.html'; w = 292; h = 200; scale = 2; name = 'work-reading-campaign' },
  @{ file = 'work-reading-campaign.html'; w = 292; h = 200; scale = 4; name = 'work-reading-campaign-large' },
  @{ file = 'reading-campaign-hero.html'; w = 824; h = 474; scale = 2; name = 'reading-campaign-hero' }
)

foreach ($job in $jobs) {
  if ($Only -and $job.name -notlike "*$Only*") { continue }
  $src = Join-Path $artDir $job.file
  if (-not (Test-Path $src)) { throw "Missing artwork page: $src" }

  $uri = ([System.Uri]$src).AbsoluteUri
  $png = Join-Path $outDir ($job.name + '.png')

  $ErrorActionPreference = 'Continue'   # Chrome logs its progress to stderr
  & $Chrome --headless=new --disable-gpu --hide-scrollbars --no-first-run `
            --no-default-browser-check --disable-extensions `
            "--user-data-dir=$profile" "--force-device-scale-factor=$($job.scale)" `
            "--window-size=$($job.w),$($job.h)" "--screenshot=$png" $uri 2>&1 | Out-Null
  $ErrorActionPreference = 'Stop'

  if (-not (Test-Path $png)) { throw "Render failed: $($job.name)" }

  $img = [System.Drawing.Image]::FromFile($png)
  "{0,-22} {1,5} x {2,-5} (css {3}x{4} @{5}x)" -f `
    $job.name, $img.Width, $img.Height, $job.w, $job.h, $job.scale | Write-Host
  $img.Dispose()
}

Write-Host ""
Write-Host "Done -> $outDir"
