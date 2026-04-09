@echo off
chcp 65001 >nul
echo 🚀 开始执行构建流程...

setlocal enabledelayedexpansion

set "currentDir=%cd%"
set "releaseDir=%currentDir%\release"
set "release1Dir=%currentDir%\release1"
set "winUnpackedDir=%currentDir%\release\win-unpacked"
set "resourcesDir=%winUnpackedDir%\resources"

REM 1. 检查 release 目录是否存在，如果存在则重命名为 release1
if exist "%releaseDir%" (
    echo 📁 将 release 目录重命名为 release1...
    move "%releaseDir%" "%release1Dir%"
    if !errorlevel! neq 0 (
        echo ❌ 重命名 release 目录失败
        exit /b 1
    )
    echo ✅ release 目录已重命名为 release1
) else (
    echo ℹ️  release 目录不存在，跳过重命名步骤
)

REM 2. 执行 pnpm run build:all
echo 🔨 开始执行 pnpm run build:all...
call pnpm run build:all
if %errorlevel% neq 0 (
    echo ❌ pnpm run build:all 执行失败，退出码: %errorlevel%
    exit /b 1
)
echo ✅ pnpm run build:all 执行完成

REM 3. 检查 win-unpacked/resources 目录是否存在
if not exist "%resourcesDir%" (
    echo ❌ win-unpacked/resources 目录不存在: %resourcesDir%
    exit /b 1
)

REM 4. 检查 release1 目录是否存在
if not exist "%release1Dir%" (
    echo ❌ release1 目录不存在: %release1Dir%
    exit /b 1
)

REM 5. 将 win-unpacked/resources 的内容复制到 release1 对应目录
echo 📋 复制 resources 内容到 release1...

REM 查找 release1 中的 win-unpacked 目录
set "release1WinUnpackedDir=%release1Dir%\win-unpacked"
if exist "%release1WinUnpackedDir%" (
    set "release1ResourcesDir=%release1WinUnpackedDir%\resources"
    
    REM 如果 release1 中已有 resources 目录，先删除
    if exist "%release1ResourcesDir%" (
        echo 🗑️  删除 release1 中现有的 resources 目录...
        rmdir /s /q "%release1ResourcesDir%"
    )
    
    REM 复制新的 resources 目录
    echo 📋 复制 resources 目录...
    xcopy "%resourcesDir%" "%release1ResourcesDir%" /e /i /y
    if !errorlevel! neq 0 (
        echo ❌ 复制 resources 目录失败
        exit /b 1
    )
    echo ✅ resources 目录复制完成
) else (
    echo ⚠️  release1 中没有找到 win-unpacked 目录，跳过复制
)

REM 6. 删除新生成的 release 目录
if exist "%releaseDir%" (
    echo 🗑️  删除新生成的 release 目录...
    rmdir /s /q "%releaseDir%"
    if !errorlevel! neq 0 (
        echo ❌ 删除 release 目录失败
        exit /b 1
    )
    echo ✅ release 目录已删除
)

REM 7. 将 release1 重命名为 release
echo 📁 将 release1 重命名为 release...
move "%release1Dir%" "%releaseDir%"
if !errorlevel! neq 0 (
    echo ❌ 重命名 release1 失败
    exit /b 1
)
echo ✅ release1 已重命名为 release

echo 🎉 构建流程完成！
echo 📂 最终输出目录: %releaseDir%

endlocal 