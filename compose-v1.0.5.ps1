Add-Type -AssemblyName System.Drawing
$original=[System.Drawing.Image]::FromFile("$PSScriptRoot/background-source-v1.0.4.png")
$expanded=[System.Drawing.Image]::FromFile("$PSScriptRoot/bullion-expanded-edit-v1.0.5.png")
$result=New-Object System.Drawing.Bitmap $original
$graphics=[System.Drawing.Graphics]::FromImage($result)
$graphics.InterpolationMode='HighQualityBicubic'
function Patch($image,$dx,$dy,$dw,$dh,$ix,$iy,$iw,$ih) {
  $destination=New-Object System.Drawing.Rectangle $dx,$dy,$dw,$dh
  $inputRegion=New-Object System.Drawing.Rectangle $ix,$iy,$iw,$ih
  $graphics.DrawImage($image,$destination,$inputRegion,[System.Drawing.GraphicsUnit]::Pixel)
}
# Use the generated taller bullion panels while preserving the established
# rounded outside frame and upper clock space from the approved source.
Patch $expanded 90 300 1074 50 90 270 1074 60
Patch $expanded 90 350 1074 490 90 330 1074 545
# Move the established currency labels exactly 25 source pixels upward.
# Their former trailing area uses the same flags' blank strip.
Patch $original 140 905 970 160 140 930 970 160
Patch $original 140 1065 970 50 140 1090 970 50
Patch $original 380 860 500 75 380 860 500 75
$result.Save("$PSScriptRoot/background-source-v1.0.5.png",[System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose();$result.Dispose();$expanded.Dispose();$original.Dispose()
