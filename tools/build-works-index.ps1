# ============================================================================
#  12 的个人空间 - works.html / works-data.json -> assets/works-index.js
#  ---------------------------------------------------------------------------
#  作品管理页（manage.html）和列表页的增删改都靠这份「静态种子」当基线：
#  种子只读，浏览器里的改动写在 localStorage（assets/works-store.js），
#  渲染时 = 种子 + 改动。所以改内容以后跑一次本脚本即可刷新种子。
#
#  用法： powershell -ExecutionPolicy Bypass -File tools\build-works-index.ps1
# ============================================================================
param(
  [string]$HtmlFile = (Join-Path (Split-Path -Parent $PSScriptRoot) 'works.html'),
  [string]$DataFile = (Join-Path $PSScriptRoot 'works-data.json'),
  [string]$OutFile  = (Join-Path (Split-Path -Parent $PSScriptRoot) 'assets\works-index.js')
)

$ErrorActionPreference = 'Stop'

foreach ($f in @($HtmlFile, $DataFile)) {
  if (-not (Test-Path -LiteralPath $f)) { throw "Missing file: $f" }
}

$html = Get-Content -LiteralPath $HtmlFile -Raw -Encoding UTF8
$data = Get-Content -LiteralPath $DataFile -Raw -Encoding UTF8 | ConvertFrom-Json

# slug -> 详情页数据（一句话 / 导语），卡片上没有这两项
$details = @{}
foreach ($p in @($data.projects)) { $details[$p.slug] = $p }

$cardPattern = '(?s)<article class="work[^"]*"\s+data-cat="(?<cat>[^"]+)"\s+data-sub="(?<sub>[^"]+)"\s*>(?<body>.*?)</article>'
$cards = [regex]::Matches($html, $cardPattern)
if ($cards.Count -lt 1) { throw 'works.html 里没有找到 article.work 卡片。' }

$items = New-Object System.Collections.ArrayList

foreach ($card in $cards) {
  $body = $card.Groups['body'].Value

  $slugMatch = [regex]::Match($body, 'href="works/(?<slug>[^"/]+)\.html"')
  if (-not $slugMatch.Success) { throw '有卡片没找到 works/<slug>.html 链接。' }
  $slug = $slugMatch.Groups['slug'].Value

  $img     = [regex]::Match($body, 'src="(?<src>assets/images/[^"]+)"')
  $dims    = [regex]::Match($body, 'width="(?<w>\d+)"\s+height="(?<h>\d+)"')
  $alt     = [regex]::Match($body, 'alt="(?<alt>[^"]*)"')
  $title   = [regex]::Match($body, '<h3 class="work__title">\s*<a[^>]*>(?<t>.*?)</a>')
  $catLbl  = [regex]::Match($body, '<p class="work__cat">(?<c>.*?)</p>')
  $tagMs   = [regex]::Matches($body, '<li class="tag">(?<tag>.*?)</li>')

  $tags = @()
  foreach ($t in $tagMs) { $tags += $t.Groups['tag'].Value }

  $desc = ''
  $lead = ''
  if ($details.ContainsKey($slug)) {
    $desc = [string]$details[$slug].desc
    $lead = [string]$details[$slug].lead
  } else {
    Write-Warning "works-data.json 里没有 $slug，一句话 / 导语留空。"
  }

  $item = [ordered]@{
    slug     = $slug
    title    = $title.Groups['t'].Value
    cat      = $card.Groups['cat'].Value
    sub      = $card.Groups['sub'].Value
    catLabel = $catLbl.Groups['c'].Value
    tags     = $tags
    cover    = $img.Groups['src'].Value
    coverAlt = $alt.Groups['alt'].Value
    cardW    = if ($dims.Success) { [int]$dims.Groups['w'].Value } else { 292 }
    cardH    = if ($dims.Success) { [int]$dims.Groups['h'].Value } else { 200 }
    href     = 'works/' + $slug + '.html'
    desc     = $desc
    lead     = $lead
  }

  [void]$items.Add($item)
}

$payload = [ordered]@{
  generatedAt = (Get-Date).ToString('yyyy-MM-dd HH:mm')
  source      = 'works.html + tools/works-data.json'
  items       = @($items)
}

$banner = @'
/* ==========================================================================
   12 的个人空间 - 作品索引（静态种子）
   --------------------------------------------------------------------------
   由 tools/build-works-index.ps1 生成，请勿手改：
     powershell -ExecutionPolicy Bypass -File tools\build-works-index.ps1
   数据源：works.html 的卡片（分类 / 细分 / 标签 / 封面）+ tools/works-data.json（一句话 / 导语）。

   assets/works-store.js 读 window.WORKS_SEED 当基线，再叠加浏览器里的
   增 / 删 / 改（localStorage）。所以这份文件只是「出厂状态」。
   ========================================================================== */
'@

$json = $payload | ConvertTo-Json -Depth 8
$js   = $banner + "`r`nwindow.WORKS_SEED = " + $json + ";" + "`r`n"

[System.IO.File]::WriteAllText($OutFile, $js, (New-Object System.Text.UTF8Encoding($false)))

Write-Host ("Done -> {0}  ({1} 个作品)" -f $OutFile, $items.Count)
