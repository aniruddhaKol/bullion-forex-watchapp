$projectRoot = Split-Path -Parent $PSScriptRoot
Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Image]::FromFile("$projectRoot/artwork/background-source-v1.0.16.png")
$canvas = New-Object System.Drawing.Bitmap 432,514
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($source,0,0,432,514)
$canvas.Save("$projectRoot/assets/432x514-amazfit-bip-max/background.png",[System.Drawing.Imaging.ImageFormat]::Png)
$icon = New-Object System.Drawing.Bitmap 124,124
$ig = [System.Drawing.Graphics]::FromImage($icon)
$ig.Clear([System.Drawing.Color]::Transparent)
$iconSource=[System.Drawing.Image]::FromFile("$projectRoot/previews/store-icon-source.png")
$ig.InterpolationMode='HighQualityBicubic'
$ig.DrawImage($iconSource,0,0,124,124)
$icon.Save("$projectRoot/assets/432x514-amazfit-bip-max/icon.png",[System.Drawing.Imaging.ImageFormat]::Png)
$iconSource.Dispose();$ig.Dispose();$icon.Dispose();$g.Dispose();$canvas.Dispose();$source.Dispose()
& "$projectRoot/scripts/make-forex-digits.ps1"










