# assets/video — 视频文件放这里

页面只引用这个目录里的 `mp4` / `webm`。`tools/build-works.ps1` 遇到
`works-data.json` 里 `"type": "video"` 的段落时，会生成：

```html
<video class="video__el" src="../assets/video/<你的文件名>" controls playsinline preload="metadata">
```

构建时会检查文件是否存在：**文件没放进来就跳过那一段并给一条警告**，
不会让整页构建失败，所以可以先在数据里写好、再补文件。

## 建议规格

| 项 | 建议 |
| --- | --- |
| 容器 / 编码 | MP4（H.264 + AAC）兼容性最好；要更小体积可以再导一份 WebM |
| 分辨率 | 1920 × 1080（横屏 16:9）；手机录屏 1080 × 1920（竖屏 9:16，数据里加 `"portrait": true`） |
| 码率 | 4–6 Mbps；1080p 演示视频 1 分钟约 30–45 MB |
| 单文件体积 | ≤ 20 MB 最稳；超过 50 MB 建议压到 720p，或改用外链嵌入 |
| 音频 | AAC 128 kbps；不需要声音就直接导成静音（自动播放必须是静音） |

## 压缩（本机有 ffmpeg 时）

```
ffmpeg -i in.mov -c:v libx264 -profile:v high -crf 23 -preset slow -vf "scale=1920:-2" ^
  -c:a aac -b:a 128k -movflags +faststart out.mp4
```

`-movflags +faststart` 必加：把索引挪到文件头，浏览器才能边下边播，不用等整段下载完。

## 命名

用英文小写 + 连字符，和项目 slug 对齐，例如 `jiujiu-demo.mp4`、`home-showreel.mp4`；
封面图仍旧放 `assets/images/`，数据里的 `poster` 只写文件名。

## 当前已有

| 文件 | 规格 | 被谁引用 |
| --- | --- | --- |
| `ai-edit-emotion.mp4` | 720 × 1280 竖版 9:16，18 秒，约 2.1 MB | `works/ai-edit-emotion.html` 的「成片」一段（`"portrait": true`） |
| `ai-edit-reversal.mp4` | 720 × 1280 竖版 9:16，15 秒，约 3.9 MB | `works/ai-edit-reversal.html` 的「成片」一段（`"portrait": true`） |
| `ai-edit-trend.mp4` | 720 × 1280 竖版 9:16，18 秒，约 2.0 MB | `works/ai-edit-trend.html` 的「成片」一段（`"portrait": true`） |

换片子的做法：把新文件按同名覆盖进来，再跑一次
`powershell -ExecutionPolicy Bypass -File tools\build-works.ps1`；文件名不同则改
`tools/works-data.json` 里那一段的 `src`（以及 `w` / `h`）。
