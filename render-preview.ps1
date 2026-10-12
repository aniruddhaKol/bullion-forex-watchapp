param([string]$LayoutPath='preview-layout.json',[switch]$About,[string]$Output='Rendered-Preview-v1.0.14.png')
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap 432,514
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::Black)
$source = [System.Drawing.Image]::FromFile("$PSScriptRoot/assets/432x514-amazfit-bip-max/background.png")
if(!$About){$g.DrawImage($source,4,4,424,506)}
$g.TextRenderingHint = 'AntiAliasGridFit'
$layout = Get-Content "$PSScriptRoot/$LayoutPath" -Raw -Encoding UTF8 | ConvertFrom-Json
foreach($item in $layout) {
  if($item.kind -eq 'IMG' -and $item.src -like 'fx-*.png'){
    $digit=[System.Drawing.Image]::FromFile("$PSScriptRoot/assets/432x514-amazfit-bip-max/$($item.src)")
    $g.DrawImage($digit,[int]$item.x,[int]$item.y,[int]$item.w,[int]$item.h)
    $digit.Dispose()
  }
  if($item.kind -ne 'TEXT'){continue}
  $family=if($item.font -or $About){'Arial'}else{'Georgia'}
  $font = New-Object System.Drawing.Font $family,([float]$item.text_size),([System.Drawing.FontStyle]::Bold),([System.Drawing.GraphicsUnit]::Pixel)
  $color = [System.Drawing.Color]::FromArgb(255,($item.color -shr 16 -band 255),($item.color -shr 8 -band 255),($item.color -band 255))
  $brush = New-Object System.Drawing.SolidBrush $color
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = 'Center';$format.LineAlignment='Center'
  if($item.align_h -eq 3){$format.Alignment='Far'}
  $rect = New-Object System.Drawing.RectangleF ([float]$item.x),([float]$item.y),([float]$item.w),([float]$item.h)
  $g.DrawString([string]$item.text,$font,$brush,$rect,$format)
  $brush.Dispose();$font.Dispose();$format.Dispose()
}
$contour=Get-Content "$PSScriptRoot/display-contour.json" -Raw | ConvertFrom-Json
for($y=0;$y -lt 514;$y++){
  $row=$contour[$y]
  if(!$row){$row=$contour[$y]}
  if($row.Count -eq 2){
    $g.FillRectangle([System.Drawing.Brushes]::Black,0,$y,[int]$row[0],1)
    $g.FillRectangle([System.Drawing.Brushes]::Black,([int]$row[1]+1),$y,(431-[int]$row[1]),1)
  }
}
$bmp.Save("$PSScriptRoot/$Output",[System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose();$bmp.Dispose()






