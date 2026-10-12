Add-Type -AssemblyName System.Drawing
$source = [System.Drawing.Image]::FromFile("$PSScriptRoot/background-source-v1.0.16.png")
$canvas = New-Object System.Drawing.Bitmap 432,514
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.InterpolationMode = 'HighQualityBicubic'
$g.DrawImage($source,0,0,432,514)
$canvas.Save("$PSScriptRoot/assets/432x514-amazfit-bip-max/background.png",[System.Drawing.Imaging.ImageFormat]::Png)
$icon = New-Object System.Drawing.Bitmap 124,124
$ig = [System.Drawing.Graphics]::FromImage($icon)
$ig.Clear([System.Drawing.Color]::Transparent)
$iconSource=[System.Drawing.Image]::FromFile("$PSScriptRoot/store-icon-source.png")
$ig.InterpolationMode='HighQualityBicubic'
$ig.DrawImage($iconSource,0,0,124,124)
$icon.Save("$PSScriptRoot/assets/432x514-amazfit-bip-max/icon.png",[System.Drawing.Imaging.ImageFormat]::Png)
$iconSource.Dispose();$ig.Dispose();$icon.Dispose();$g.Dispose();$canvas.Dispose();$source.Dispose()
& "$PSScriptRoot/make-forex-digits.ps1"










