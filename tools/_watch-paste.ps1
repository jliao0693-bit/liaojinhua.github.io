# temp helper — 抓取 VS Code 粘贴图片
#  VS Code / Cline 把聊天里粘贴的图片写到 %TEMP%\temp_image_<ts>.png，
#  但同一条消息里的多张只会留下最后一张，所以这里轮询复制一份出来。
#  用法：后台跑 15 分钟，把新出现的 temp_image_*.png 立刻拷到
#        _inbox\perfume\raw\watch-<ts>-<n>.png（按内容去重）。
$ErrorActionPreference = 'SilentlyContinue'
$outDir = 'C:\Users\admin\Desktop\gerenboke\_inbox\perfume\raw'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

$seen = @{}
$log  = Join-Path $outDir 'watch.log'
$deadline = (Get-Date).AddMinutes(15)
$n = 0

while ((Get-Date) -lt $deadline) {
  $files = Get-ChildItem $env:TEMP -File -Filter 'temp_image_*.png' -ErrorAction SilentlyContinue
  foreach ($f in $files) {
    if ($seen.ContainsKey($f.Name)) { continue }
    $seen[$f.Name] = 1
    $bytes = $null
    for ($i = 0; $i -lt 12; $i++) {
      try {
        $bytes = [System.IO.File]::ReadAllBytes($f.FullName)
        if ($bytes.Length -gt 1000) { break }
      } catch { $bytes = $null }
      Start-Sleep -Milliseconds 60
    }
    if (-not $bytes -or $bytes.Length -le 1000) { continue }
    $n++
    $dest = Join-Path $outDir ('watch-{0:00}.png' -f $n)
    [System.IO.File]::WriteAllBytes($dest, $bytes)
    Add-Content -Path $log -Value ((Get-Date).ToString('HH:mm:ss') + "  $($f.Name)  $($bytes.Length)B  ->  $dest")
  }
  Start-Sleep -Milliseconds 250
}
Add-Content -Path $log -Value ((Get-Date).ToString('HH:mm:ss') + '  watcher stopped')
