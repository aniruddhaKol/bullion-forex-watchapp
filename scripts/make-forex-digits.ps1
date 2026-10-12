$projectRoot = Split-Path -Parent $PSScriptRoot
Add-Type -AssemblyName System.Drawing
$output="$projectRoot/assets/432x514-amazfit-bip-max"
$scale=4
$family=New-Object System.Drawing.FontFamily 'Arial'
$colors=@{white=[System.Drawing.Color]::White;gold=[System.Drawing.Color]::FromArgb(255,255,223,79);amber=[System.Drawing.Color]::FromArgb(255,176,138,48)}
foreach($tone in $colors.Keys){
  foreach($char in '0123456789.-'.ToCharArray()){
    $name=if($char -eq '.'){'dot'}elseif($char -eq '-'){'dash'}else{[string]$char}
    $width=if($char -eq '.'){9}else{19}
    $large=New-Object System.Drawing.Bitmap ($width*$scale),(40*$scale)
    $g=[System.Drawing.Graphics]::FromImage($large)
    $g.SmoothingMode='AntiAlias'
    $path=New-Object System.Drawing.Drawing2D.GraphicsPath
    $format=[System.Drawing.StringFormat]::GenericTypographic
    $path.AddString([string]$char,$family,[int][System.Drawing.FontStyle]::Bold,[float](30*$scale),(New-Object System.Drawing.PointF 0,0),$format)
    $bounds=$path.GetBounds()
    $baselinePath=New-Object System.Drawing.Drawing2D.GraphicsPath
    $baselinePath.AddString('0',$family,[int][System.Drawing.FontStyle]::Bold,[float](30*$scale),(New-Object System.Drawing.PointF 0,0),$format)
    $baselineBounds=$baselinePath.GetBounds()
    $move=New-Object System.Drawing.Drawing2D.Matrix
    $move.Translate([float](($width*$scale-$bounds.Width)/2-$bounds.X),[float]((40*$scale-$baselineBounds.Height)/2-$baselineBounds.Y))
    $path.Transform($move)
    # Centered 1px stroke extends 0.5px outside the white glyph outline.
    $pen=New-Object System.Drawing.Pen ([System.Drawing.Color]::Black),([float]$scale)
    $pen.LineJoin='Round'
    $brush=New-Object System.Drawing.SolidBrush $colors[$tone]
    $g.DrawPath($pen,$path);$g.FillPath($brush,$path)
    $final=New-Object System.Drawing.Bitmap $width,40
    $fg=[System.Drawing.Graphics]::FromImage($final)
    $fg.InterpolationMode='HighQualityBicubic'
    $fg.DrawImage($large,0,0,$width,40)
    $final.Save("$output/fx-$tone-$name.png",[System.Drawing.Imaging.ImageFormat]::Png)
    $baselinePath.Dispose();$fg.Dispose();$final.Dispose();$brush.Dispose();$pen.Dispose();$move.Dispose();$path.Dispose();$g.Dispose();$large.Dispose()
  }
}
$blank=New-Object System.Drawing.Bitmap 8,8
$blank.Save("$output/fx-blank.png",[System.Drawing.Imaging.ImageFormat]::Png)
$blank.Dispose();$family.Dispose()

