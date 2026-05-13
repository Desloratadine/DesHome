# 重命名塔罗牌图片脚本
Write-Host "开始重命名图片文件..." -ForegroundColor Green

# 切换到images目录
$imagesDir = Join-Path $PSScriptRoot "images"
Set-Location $imagesDir

# 获取所有文件
$files = Get-ChildItem -Filter *.jpg

Write-Host "找到 $($files.Count) 个图片文件" -ForegroundColor Yellow

# 按文件名中的数字部分排序（假设格式中有 764_00 等）
$sortedFiles = $files | ForEach-Object {
    if ($_.Name -match '764_(\d+)') {
        $num = [int]$Matches[1]
        [PSCustomObject]@{
            File = $_
            Number = $num
        }
    }
} | Sort-Object Number

# 生成所有塔罗牌ID
$ids = @()
for ($i=0; $i -le 21; $i++) { $ids += "major_{0:d2}" -f $i }
for ($i=1; $i -le 14; $i++) { $ids += "wands_{0:d2}" -f $i }
for ($i=1; $i -le 14; $i++) { $ids += "cups_{0:d2}" -f $i }
for ($i=1; $i -le 14; $i++) { $ids += "swords_{0:d2}" -f $i }
for ($i=1; $i -le 14; $i++) { $ids += "pents_{0:d2}" -f $i }

Write-Host "总共 $($ids.Count) 张塔罗牌ID" -ForegroundColor Yellow

# 第一步：重命名现有文件
Write-Host "正在重命名现有文件..." -ForegroundColor Cyan
for ($i=0; $i -lt $sortedFiles.Count; $i++) {
    $file = $sortedFiles[$i].File
    $id = $ids[$i]
    $newName = "$id.jpg"
    if ($file.Name -ne $newName) {
        Write-Host "重命名: $($file.Name) -> $newName"
        Rename-Item -Path $file.FullName -NewName $newName -Force
    } else {
        Write-Host "已匹配: $($file.Name) 已经是正确的名称"
    }
}

# 第二步：复制缺失的图片
Write-Host "正在复制缺失的图片..." -ForegroundColor Cyan
$sourceFile = "major_00.jpg"  # 使用第一张牌作为模板
if (Test-Path $sourceFile) {
    for ($i = $sortedFiles.Count; $i -lt $ids.Count; $i++) {
        $id = $ids[$i]
        $destFile = "$id.jpg"
        if (-not (Test-Path $destFile)) {
            Write-Host "创建: $destFile"
            Copy-Item -Path $sourceFile -Destination $destFile -Force
        } else {
            Write-Host "已存在: $destFile"
        }
    }
} else {
    Write-Host "错误: 源文件 $sourceFile 不存在，无法复制" -ForegroundColor Red
}

Write-Host "操作完成！" -ForegroundColor Green
Write-Host "当前目录下的文件列表:"
Get-ChildItem *.jpg | Select-Object Name