# ============================================================================
#  12 的个人空间 - works-data.json -> works/*.html
#  ---------------------------------------------------------------------------
#  12 个作品详情页共用一套模板：内容全部来自 tools/works-data.json，
#  本脚本把每条数据渲染成静态页 works/<slug>.html（纯静态，可分享、不依赖 JS）。
#
#  用法：   powershell -ExecutionPolicy Bypass -File tools\build-works.ps1
#  加项目： 在 tools\works-data.json 的 projects 里加一条，再跑一次本脚本。
# ============================================================================
param(
  [string]$DataFile = (Join-Path $PSScriptRoot 'works-data.json'),
  [string]$OutDir   = (Join-Path (Split-Path -Parent $PSScriptRoot) 'works')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path $DataFile)) { throw "Missing data file: $DataFile" }

$json     = Get-Content -LiteralPath $DataFile -Raw -Encoding UTF8 | ConvertFrom-Json
$projects = @($json.projects)
if ($projects.Count -lt 1) { throw 'works-data.json 的 projects 为空。' }

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$nl = "`r`n"

function Esc([string]$text) {
  if ([string]::IsNullOrEmpty($text)) { return '' }
  return $text.Replace('&', '&amp;').Replace('<', '&lt;').Replace('>', '&gt;').Replace('"', '&quot;')
}

# 数据里写了本地视频但文件还没放进来时，整段跳过：
# 先过滤再编号，免得到最后一段被跳过、block--last 落在空处。
function Test-SkipSection($s) {
  if ($s.type -ne 'video') { return $false }
  if ($s.embed -or -not $s.src) { return $false }

  $file = Join-Path (Join-Path (Split-Path -Parent $PSScriptRoot) 'assets\video') $s.src
  if (Test-Path -LiteralPath $file) { return $false }

  Write-Warning ("缺少 assets\video\{0}，已跳过 section {1}。" -f $s.src, $s.id)
  return $true
}

# 把一条 section 数据渲染成 <section class="block ..."> 片段
function New-SectionHtml($s) {
  $id = Esc $s.id
  $sb = New-Object System.Text.StringBuilder

  [void]$sb.Append('    <section class="block')
  if ($s.isLast) { [void]$sb.Append(' block--last') }
  [void]$sb.Append('" aria-labelledby="' + $id + '-title">' + $nl)

  if ($s.title) {
    [void]$sb.Append('      <div class="block__head">' + $nl)
    [void]$sb.Append('        <h2 class="block__title" id="' + $id + '-title">' + (Esc $s.title) + '</h2>' + $nl)
    if ($s.note) {
      [void]$sb.Append('        <p class="block__note">' + (Esc $s.note) + '</p>' + $nl)
    }
    [void]$sb.Append('      </div>' + $nl + $nl)
  }

  switch ($s.type) {
    'prose' {
      [void]$sb.Append('      <div class="panel glass glass--soft glass--d60">' + $nl)
      [void]$sb.Append('        <div class="prose">' + $nl)
      foreach ($p in @($s.text)) {
        [void]$sb.Append('          <p>' + (Esc $p) + '</p>' + $nl)
      }
      [void]$sb.Append('        </div>' + $nl)
      [void]$sb.Append('      </div>' + $nl)
    }
    'bullets' {
      [void]$sb.Append('      <div class="panel glass glass--soft glass--d60">' + $nl)
      [void]$sb.Append('        <ul class="bullets">' + $nl)
      foreach ($li in @($s.items)) {
        [void]$sb.Append('          <li>' + (Esc $li) + '</li>' + $nl)
      }
      [void]$sb.Append('        </ul>' + $nl)
      [void]$sb.Append('      </div>' + $nl)
    }
    'figure' {
      # 可选 cls：给 <figure> 追加修饰类（例如 figure--page 让 480 宽的活动页按原尺寸居中）
      $cls = 'figure'
      if ($s.cls) { $cls += ' ' + $s.cls }
      [void]$sb.Append('      <figure class="' + $cls + '">' + $nl)
      [void]$sb.Append('        <img class="figure__img" src="../assets/images/' + (Esc $s.img) + '" width="' +
        $s.w + '" height="' + $s.h + '" alt="' + (Esc $s.alt) + '" />' + $nl)
      [void]$sb.Append('        <figcaption class="figure__cap">' + $nl)
      [void]$sb.Append('          ' + (Esc $s.cap) + $nl)
      [void]$sb.Append('        </figcaption>' + $nl)
      [void]$sb.Append('      </figure>' + $nl)
    }
    'figures' {
      # 两栏并排的图（共用 .figure-row 的 2 列栅格）；用于把两段较矮的截图放在同一屏
      [void]$sb.Append('      <div class="figure-row">' + $nl)
      foreach ($fg in @($s.images)) {
        [void]$sb.Append('        <figure class="figure">' + $nl)
        [void]$sb.Append('          <img class="figure__img" src="../assets/images/' + (Esc $fg.img) + '" width="' +
          $fg.w + '" height="' + $fg.h + '" alt="' + (Esc $fg.alt) + '" />' + $nl)
        [void]$sb.Append('          <figcaption class="figure__cap">' + (Esc $fg.cap) + '</figcaption>' + $nl)
        [void]$sb.Append('        </figure>' + $nl)
      }
      [void]$sb.Append('      </div>' + $nl)
    }
    'video' {
      # 两种用法：
      #   本地文件   -> "src": "jiujiu-demo.mp4"（文件放 assets/video/）+ 可选 "poster": "jiujiu-hero.png"（assets/images/）
      #   第三方嵌入 -> "embed": "https://player.bilibili.com/player.html?bvid=…&autoplay=0"（B 站 / YouTube / 腾讯视频）
      $cls = 'video'
      if ($s.portrait) { $cls += ' video--portrait' }
      $alt = Esc $s.alt
      if (-not $alt) { $alt = Esc $s.cap }

      if ($s.embed) {
        [void]$sb.Append('      <figure class="' + $cls + '">' + $nl)
        [void]$sb.Append('        <div class="video__frame">' + $nl)
        [void]$sb.Append('          <iframe src="' + (Esc $s.embed) + '" title="' + $alt +
          '" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen scrolling="no"></iframe>' + $nl)
        [void]$sb.Append('        </div>' + $nl)
      }
      else {
        if (-not $s.src) { throw "video section $($s.id) 缺少 src 或 embed。" }
        $videoFile = Join-Path (Join-Path (Split-Path -Parent $PSScriptRoot) 'assets\video') $s.src
        if (-not (Test-Path -LiteralPath $videoFile)) {
          # 视频还没放进来时不让整页构建失败，直接跳过这一段并提示
          Write-Warning ("缺少 assets\video\{0}，已跳过 section {1}。" -f $s.src, $s.id)
          return ''
        }

        $w = 1920; if ($s.w) { $w = $s.w }
        $h = 1080; if ($s.h) { $h = $s.h }
        $poster = ''
        if ($s.poster) { $poster = ' poster="../assets/images/' + (Esc $s.poster) + '"' }

        # 自动播放必须同时 muted + playsinline，否则移动端与 Chrome 都会拦
        $flags = ''
        if ($s.autoplay) { $flags += ' autoplay muted' }
        elseif ($s.muted) { $flags += ' muted' }
        if ($s.loop) { $flags += ' loop' }

        [void]$sb.Append('      <figure class="' + $cls + '">' + $nl)
        [void]$sb.Append('        <video class="video__el" src="../assets/video/' + (Esc $s.src) + '"' + $poster +
          ' width="' + $w + '" height="' + $h + '" controls playsinline preload="metadata"' + $flags + '>' + $nl)
        [void]$sb.Append('          <p>你的浏览器不支持 video 标签，可<a href="../assets/video/' + (Esc $s.src) +
          '">点此下载观看</a>。</p>' + $nl)
        [void]$sb.Append('        </video>' + $nl)
      }

      if ($s.cap) {
        [void]$sb.Append('        <figcaption class="video__cap">' + (Esc $s.cap) + '</figcaption>' + $nl)
      }
      [void]$sb.Append('      </figure>' + $nl)
    }
    'gallery' {
      # 可选 text：截图墙上方的一段说明（例如「这里只是整个 App 的一部分」）
      if ($s.text) {
        [void]$sb.Append('      <div class="panel glass glass--soft glass--d60">' + $nl)
        [void]$sb.Append('        <div class="prose">' + $nl)
        foreach ($para in @($s.text)) {
          [void]$sb.Append('          <p>' + (Esc $para) + '</p>' + $nl)
        }
        [void]$sb.Append('        </div>' + $nl)
        [void]$sb.Append('      </div>' + $nl)
        [void]$sb.Append($nl)
      }
      [void]$sb.Append('      <div class="shots">' + $nl)
      foreach ($shot in @($s.shots)) {
        [void]$sb.Append('        <figure class="shots__item">' + $nl)
        [void]$sb.Append('          <img class="shots__img" src="../assets/images/' + (Esc $shot.img) + '" width="' +
          $shot.w + '" height="' + $shot.h + '" alt="' + (Esc $shot.alt) + '" />' + $nl)
        [void]$sb.Append('          <figcaption class="shots__cap">' + (Esc $shot.cap) + '</figcaption>' + $nl)
        [void]$sb.Append('        </figure>' + $nl)
      }
      [void]$sb.Append('      </div>' + $nl)
    }
    'qa' {
      [void]$sb.Append('      <div class="qa">' + $nl)
      foreach ($qa in @($s.items)) {
        [void]$sb.Append('        <div class="qa__card glass glass--soft glass--d35">' + $nl)
        [void]$sb.Append('          <p class="qa__row qa__row--q"><span class="qa__k">问题</span>' + (Esc $qa.q) + '</p>' + $nl)
        [void]$sb.Append('          <p class="qa__row qa__row--a"><span class="qa__k">解决</span>' + (Esc $qa.a) + '</p>' + $nl)
        [void]$sb.Append('        </div>' + $nl)
      }
      [void]$sb.Append('      </div>' + $nl)
    }
    'flow' {
      [void]$sb.Append('      <ol class="flow">' + $nl)
      foreach ($step in @($s.items)) {
        [void]$sb.Append('        <li class="flow__item">' + $nl)
        [void]$sb.Append('          <span class="flow__dot" aria-hidden="true"></span>' + $nl)
        [void]$sb.Append('          <p class="flow__title">' + (Esc $step.t) + '</p>' + $nl)
        [void]$sb.Append('          <p class="flow__text">' + (Esc $step.d) + '</p>' + $nl)
        [void]$sb.Append('        </li>' + $nl)
      }
      [void]$sb.Append('      </ol>' + $nl)
    }
    'swatches' {
      [void]$sb.Append('      <div class="panel glass glass--soft glass--d60">' + $nl)
      [void]$sb.Append('        <div class="swatches" aria-hidden="true">' + $nl)
      foreach ($c in @($s.colors)) {
        [void]$sb.Append('          <span class="swatch swatch--' + (Esc $c) + '"></span>' + $nl)
      }
      [void]$sb.Append('        </div>' + $nl)
      [void]$sb.Append('        <div class="prose" style="margin-top: 18px">' + $nl)
      [void]$sb.Append('          <p>' + (Esc $s.text) + '</p>' + $nl)
      [void]$sb.Append('        </div>' + $nl)
      [void]$sb.Append('      </div>' + $nl)
    }
    'stats' {
      [void]$sb.Append('      <div class="stats">' + $nl)
      foreach ($st in @($s.stats)) {
        [void]$sb.Append('        <div class="stat glass glass--soft glass--d35">' + $nl)
        [void]$sb.Append('          <span class="stat__value">' + (Esc $st.v) + '</span>' + $nl)
        [void]$sb.Append('          <span class="stat__label">' + (Esc $st.l) + '</span>' + $nl)
        [void]$sb.Append('        </div>' + $nl)
      }
      [void]$sb.Append('      </div>' + $nl)
    }
    default { throw "未知的 section 类型：$($s.type)（section $($s.id)）" }
  }

  [void]$sb.Append('    </section>' + $nl)
  return $sb.ToString()
}


# 页面骨架：{{TOKEN}} 由下面的 Replace 填值
$template = @'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{{TITLE}} — 作品详情 · 12 的个人空间</title>
  <meta name="description" content="{{DESC}}" />
  <meta name="theme-color" content="#F5F7FF" />
  <link rel="icon" type="image/png" href="../assets/images/logo-12-favicon.png" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;700&display=swap"
    rel="stylesheet"
  />

  <link rel="stylesheet" href="../assets/styles.css" />
  <link rel="stylesheet" href="../assets/pages.css" />
</head>

<body>
  <div class="page">

    <header class="header">
      <a class="brand" href="../index.html" aria-label="12 的个人空间 · 首页">
        <img class="brand__mark" src="../assets/images/logo-12.png" width="32" height="32" alt="" />
        <span class="brand__text">12 的个人空间</span>
      </a>

      <nav class="nav" aria-label="主导航">
        <a class="nav__link" href="../index.html">首页</a>
        <a class="nav__link" href="../works.html" aria-current="page">作品</a>
        <a class="nav__link" href="../design-system.html">设计规范</a>
        <a class="nav__link" href="../about.html">关于我</a>
      </nav>
    </header>

    <nav class="crumbs" aria-label="面包屑">
      <a href="../index.html">首页</a>
      <span class="crumbs__sep" aria-hidden="true">/</span>
      <a href="../works.html">作品列表</a>
      <span class="crumbs__sep" aria-hidden="true">/</span>
      <span class="crumbs__here">{{TITLE}}</span>
    </nav>

    <header class="phead">
      <span class="phead__eyebrow glass glass--soft glass--d35">{{EYEBROW}}</span>
      <h1 class="phead__title">{{TITLE}}</h1>
      <p class="phead__lead">
        {{LEAD}}
      </p>
    </header>

    <section class="case-meta{{META_MOD}}" aria-label="项目信息">
{{META}}    </section>

    <section class="block" aria-labelledby="visual-title">
      <h2 class="sr-only" id="visual-title">主视觉</h2>
      <figure class="figure">
        <img class="figure__img" src="../assets/images/{{HERO_IMG}}" width="{{HERO_W}}" height="{{HERO_H}}"
          alt="{{HERO_ALT}}" />
        <figcaption class="figure__cap">
          {{HERO_CAP}}
        </figcaption>
      </figure>
    </section>

{{SECTIONS}}
    <nav class="pager" aria-label="上下个项目">
      <a class="pager__link glass glass--soft glass--d35" href="{{PREV_SLUG}}.html">
        <span class="pager__dir">上一个</span>
        <span class="pager__title">{{PREV_TITLE}}</span>
      </a>
      <a class="pager__link pager__link--next glass glass--soft glass--d35" href="{{NEXT_SLUG}}.html">
        <span class="pager__dir">下一个</span>
        <span class="pager__title">{{NEXT_TITLE}}</span>
      </a>
    </nav>

    <footer class="footer">
      <div class="footer__top">
        <p class="footer__brand">12 的个人空间</p>
        <nav class="footer__links" aria-label="页脚导航">
          <a class="footer__link" href="../works.html">作品</a>
          <a class="footer__link" href="../design-system.html">设计规范</a>
          <a class="footer__link" href="../about.html">关于我</a>
        </nav>
      </div>

      <hr class="footer__divider" />

      <p class="footer__bottom">2025 · 12 的个人空间 · 用设计点亮体验。</p>
    </footer>
  </div>
</body>
</html>
'@

$total = $projects.Count

for ($i = 0; $i -lt $total; $i++) {
  $p    = $projects[$i]
  $prev = $projects[($i - 1 + $total) % $total]
  $next = $projects[($i + 1) % $total]

  if (-not $p.slug) { throw "第 $($i + 1) 条数据缺少 slug。" }

  # 项目信息：meta 条数不固定（新项目可以不写「周期」），列数跟着条数走
  $metaList = @($p.meta)
  $metaMod  = ''
  if ($metaList.Count -ge 1 -and $metaList.Count -le 3) { $metaMod = ' case-meta--' + $metaList.Count }

  $metaSb = New-Object System.Text.StringBuilder
  foreach ($m in $metaList) {
    [void]$metaSb.Append('      <div class="meta-item glass glass--soft glass--d35">' + $nl)
    [void]$metaSb.Append('        <span class="meta-item__k">' + (Esc $m.k) + '</span>' + $nl)
    [void]$metaSb.Append('        <span class="meta-item__v">' + (Esc $m.v) + '</span>' + $nl)
    [void]$metaSb.Append('      </div>' + $nl)
  }

  # 正文各段；最后一段加 block--last
  $secSb    = New-Object System.Text.StringBuilder
  $sections = @(@($p.sections) | Where-Object { -not (Test-SkipSection $_) })
  for ($j = 0; $j -lt $sections.Count; $j++) {
    $sections[$j] | Add-Member -NotePropertyName isLast -NotePropertyValue ($j -eq $sections.Count - 1) -Force
    [void]$secSb.Append((New-SectionHtml $sections[$j]))
    if ($j -lt $sections.Count - 1) { [void]$secSb.Append($nl) }
  }

  $html = $template
  $html = $html.Replace('{{TITLE}}',      (Esc $p.title))
  $html = $html.Replace('{{DESC}}',       (Esc $p.desc))
  $html = $html.Replace('{{EYEBROW}}',    (Esc $p.eyebrow))
  $html = $html.Replace('{{LEAD}}',       (Esc $p.lead))
  $html = $html.Replace('{{META}}',       $metaSb.ToString())
  $html = $html.Replace('{{META_MOD}}',   $metaMod)
  $html = $html.Replace('{{HERO_IMG}}',   (Esc $p.hero.img))
  $html = $html.Replace('{{HERO_W}}',     $p.hero.w)
  $html = $html.Replace('{{HERO_H}}',     $p.hero.h)
  $html = $html.Replace('{{HERO_ALT}}',   (Esc $p.hero.alt))
  $html = $html.Replace('{{HERO_CAP}}',   (Esc $p.hero.cap))
  $html = $html.Replace('{{SECTIONS}}',   $secSb.ToString())
  $html = $html.Replace('{{PREV_SLUG}}',  (Esc $prev.slug))
  $html = $html.Replace('{{PREV_TITLE}}', (Esc $prev.title))
  $html = $html.Replace('{{NEXT_SLUG}}',  (Esc $next.slug))
  $html = $html.Replace('{{NEXT_TITLE}}', (Esc $next.title))

  if ($html -match '\{\{[A-Z_]+\}\}') { throw "模板里有未替换的占位符：$($Matches[0])" }

  $out = Join-Path $OutDir ($p.slug + '.html')
  [System.IO.File]::WriteAllText($out, $html, (New-Object System.Text.UTF8Encoding($false)))
  '{0,-18} -> works\{0}.html' -f $p.slug | Write-Host
}

Write-Host ''
Write-Host ("Done -> {0}  ({1} pages)" -f $OutDir, $total)
