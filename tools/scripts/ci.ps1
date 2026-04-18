#requires -Version 5.1
param(
  [switch]$SkipInstall
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$PSDefaultParameterValues['*:Encoding'] = 'utf8'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# tools/scripts/ci.ps1 — Phase 1a 本地 CI 管线
# 顺序：env → install → typecheck → lint → test → build(非 miniapp) → 归档 → 全绿

$RunId    = '2026-04-17-211321'
$Repo     = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$QaDir    = Join-Path $Repo ".sisyphus\runs\$RunId\qa"
$UnitDir  = Join-Path $QaDir 'unit'
$BuildDir = Join-Path $QaDir 'build'
$LogDir   = Join-Path $Repo ".sisyphus\runs\$RunId\logs\phase-1a"

New-Item -ItemType Directory -Force -Path $QaDir, $UnitDir, $BuildDir, $LogDir | Out-Null

function Write-Step {
  param([int]$N, [string]$Desc)
  Write-Host ("==> Step {0}: {1}" -f $N, $Desc) -ForegroundColor Cyan
}

function Invoke-Shell {
  param([string]$Cmd, [string]$LogPath)
  & cmd /c "$Cmd > `"$LogPath`" 2>&1"
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[CI] 命令失败（退出码 $LASTEXITCODE）：$Cmd" -ForegroundColor Red
    Write-Host "[CI] 日志尾：$LogPath" -ForegroundColor Yellow
    if (Test-Path $LogPath) {
      Get-Content $LogPath | Select-Object -Last 60 | ForEach-Object { Write-Host $_ }
    }
    exit 1
  }
}

Push-Location $Repo
$ciStart = Get-Date
try {

  # Step 1: 环境信息
  Write-Step 1 '打印环境信息'
  Write-Host ("node: " + (node -v))
  Write-Host ("pnpm: " + (pnpm -v))
  Write-Host ("pwd : " + (Get-Location).Path)

  # Step 2: pnpm install
  if ($SkipInstall) {
    Write-Step 2 'pnpm install（已跳过 -SkipInstall）'
  } else {
    Write-Step 2 'pnpm install --frozen-lockfile=false'
    $t = Measure-Command {
      Invoke-Shell 'pnpm install --frozen-lockfile=false' (Join-Path $QaDir 'install.log')
    }
    Write-Host ("    耗时：{0:N1}s" -f $t.TotalSeconds)
  }

  # Step 3: typecheck
  Write-Step 3 'pnpm turbo run typecheck'
  $tTc = Measure-Command {
    Invoke-Shell 'pnpm turbo run typecheck --no-daemon' (Join-Path $QaDir 'typecheck.log')
  }
  Write-Host ("    耗时：{0:N1}s" -f $tTc.TotalSeconds)

  # Step 4: lint
  Write-Step 4 'pnpm turbo run lint'
  $tLint = Measure-Command {
    Invoke-Shell 'pnpm turbo run lint --no-daemon' (Join-Path $QaDir 'lint.log')
  }
  Write-Host ("    耗时：{0:N1}s" -f $tLint.TotalSeconds)

  # Step 5: test
  Write-Step 5 'pnpm turbo run test'
  $tTest = Measure-Command {
    Invoke-Shell 'pnpm turbo run test --no-daemon --output-logs=full' (Join-Path $UnitDir 'turbo.log')
  }
  Write-Host ("    耗时：{0:N1}s" -f $tTest.TotalSeconds)

  # Step 6: build（排除 miniapp）
  Write-Step 6 'pnpm turbo run build --filter=!@bynu/alumni-miniapp'
  $tBuild = Measure-Command {
    Invoke-Shell 'pnpm turbo run build --filter=!@bynu/alumni-miniapp --no-daemon' (Join-Path $QaDir 'build.log')
  }
  Write-Host ("    耗时：{0:N1}s" -f $tBuild.TotalSeconds)

  # Step 7: 归档 unit 汇总
  Write-Step 7 '归档测试产物 → qa/unit/'
  $testLogPath = Join-Path $UnitDir 'turbo.log'
  $testLog = if (Test-Path $testLogPath) { Get-Content $testLogPath -Raw } else { '' }

  $totalPkg = 0; $passedPkg = 0
  if ($testLog -match 'Tasks:\s+(\d+)\s+successful,\s+(\d+)\s+total') {
    $passedPkg = [int]$Matches[1]
    $totalPkg  = [int]$Matches[2]
  }

  $totalTests = 0; $passedTests = 0; $failedTests = 0
  $vitestMatches = [regex]::Matches($testLog, 'Tests\s+(\d+)\s+passed(?:\s*\|\s*(\d+)\s+failed)?\s*\((\d+)\)')
  foreach ($m in $vitestMatches) {
    $passedTests += [int]$m.Groups[1].Value
    if ($m.Groups[2].Success -and $m.Groups[2].Value) { $failedTests += [int]$m.Groups[2].Value }
    $totalTests  += [int]$m.Groups[3].Value
  }

  $summary = [ordered]@{
    runAt          = (Get-Date).ToString('o')
    runId          = $RunId
    totalPackages  = $totalPkg
    passedPackages = $passedPkg
    totalTests     = $totalTests
    passed         = $passedTests
    failed         = $failedTests
    duration       = [math]::Round($tTest.TotalSeconds, 2)
  }
  $summary | ConvertTo-Json -Depth 4 | Set-Content -Path (Join-Path $UnitDir 'summary.json') -Encoding utf8

  # 为每个 workspace 包写一份 stub 摘要
  $pkgDirs = @()
  $pkgDirs += Get-ChildItem (Join-Path $Repo 'apps') -Directory -ErrorAction SilentlyContinue
  $pkgDirs += Get-ChildItem (Join-Path $Repo 'packages') -Directory -Recurse -ErrorAction SilentlyContinue |
              Where-Object { Test-Path (Join-Path $_.FullName 'package.json') }
  $pkgDirs += Get-ChildItem (Join-Path $Repo 'services') -Directory -ErrorAction SilentlyContinue

  foreach ($d in $pkgDirs) {
    $pkgJson = Join-Path $d.FullName 'package.json'
    if (-not (Test-Path $pkgJson)) { continue }
    try {
      $pkg = Get-Content $pkgJson -Raw | ConvertFrom-Json
      if (-not $pkg.name) { continue }
      $safe = ($pkg.name -replace '[/@]', '_').TrimStart('_')
      $outPath = Join-Path $UnitDir ("{0}.json" -f $safe)
      $hasTest = $false
      if ($pkg.PSObject.Properties['scripts'] -and $pkg.scripts -and $pkg.scripts.PSObject.Properties['test']) {
        $hasTest = [bool]$pkg.scripts.test
      }
      $stub = [ordered]@{
        package = $pkg.name
        path    = $d.FullName.Substring($Repo.Length).TrimStart('\')
        hasTest = $hasTest
        runAt   = (Get-Date).ToString('o')
      }
      $stub | ConvertTo-Json -Depth 3 | Set-Content -Path $outPath -Encoding utf8
    } catch { }
  }

  # Step 8: 归档 build 产物大小
  Write-Step 8 '归档构建产物大小 → qa/build/sizes.json'
  $sizes = @()
  foreach ($d in $pkgDirs) {
    $distDir = Join-Path $d.FullName 'dist'
    if (-not (Test-Path $distDir)) { continue }
    $bytes = (Get-ChildItem $distDir -Recurse -File -ErrorAction SilentlyContinue |
              Measure-Object -Property Length -Sum).Sum
    if (-not $bytes) { $bytes = 0 }
    $pkgJson = Join-Path $d.FullName 'package.json'
    $name = if (Test-Path $pkgJson) { (Get-Content $pkgJson -Raw | ConvertFrom-Json).name } else { $d.Name }
    $sizes += [pscustomobject]@{
      package = $name
      path    = $distDir.Substring($Repo.Length).TrimStart('\')
      bytes   = [int64]$bytes
      kb      = [math]::Round($bytes / 1KB, 1)
    }
  }
  $totalBytes = 0
  foreach ($s in $sizes) { $totalBytes += [int64]$s.bytes }
  $sizesOut = [ordered]@{
    runAt    = (Get-Date).ToString('o')
    total    = $sizes.Count
    totalKb  = [math]::Round($totalBytes / 1KB, 1)
    packages = $sizes
  }
  $sizesOut | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $BuildDir 'sizes.json') -Encoding utf8

  # Step 9: 全绿
  $elapsed = (New-TimeSpan -Start $ciStart -End (Get-Date)).TotalSeconds
  "[$((Get-Date).ToString('o'))] Phase 1a CI 全绿 · 总耗时 $([math]::Round($elapsed,1))s" |
    Out-File -FilePath (Join-Path $LogDir 'ci.log') -Append -Encoding utf8
  Write-Host ''
  Write-Host ("==> CI 全绿 · 总耗时 {0:N1}s" -f $elapsed) -ForegroundColor Green
}
finally {
  Pop-Location
}
