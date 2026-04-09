# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:LANG = "zh_CN.UTF-8"
$env:LC_ALL = "zh_CN.UTF-8"
$env:LC_CTYPE = "zh_CN.UTF-8"

Write-Host "正在启动开发服务器..." -ForegroundColor Green
pnpm run start 