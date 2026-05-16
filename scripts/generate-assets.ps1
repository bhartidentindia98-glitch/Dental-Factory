Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$assetDir = Join-Path $root "assets"
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null

function New-RoundedPath {
  param([float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $R * 2
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $W - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $W - $d, $Y + $H - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $H - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRect {
  param($G, [System.Drawing.Brush]$Brush, [float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)
  $path = New-RoundedPath $X $Y $W $H $R
  $G.FillPath($Brush, $path)
  $path.Dispose()
}

function Stroke-RoundedRect {
  param($G, [System.Drawing.Pen]$Pen, [float]$X, [float]$Y, [float]$W, [float]$H, [float]$R)
  $path = New-RoundedPath $X $Y $W $H $R
  $G.DrawPath($Pen, $path)
  $path.Dispose()
}

function New-Asset {
  param(
    [string]$Name,
    [string]$Kind,
    [string]$Title,
    [string]$Accent = "#0f8b8d",
    [int]$W = 900,
    [int]$H = 620
  )

  $bmp = New-Object System.Drawing.Bitmap $W, $H
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $accentColor = [System.Drawing.ColorTranslator]::FromHtml($Accent)
  $bg1 = [System.Drawing.Color]::FromArgb(246, 250, 248)
  $bg2 = [System.Drawing.Color]::FromArgb(220, 241, 234)
  $rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $bg1, $bg2, 35
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()

  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 252, 250))
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 45, 55))
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(92, 106, 114))
  $accentBrush = New-Object System.Drawing.SolidBrush $accentColor
  $softAccent = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(46, $accentColor.R, $accentColor.G, $accentColor.B))
  $shadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(38, 20, 33, 43))
  $linePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(96, 113, 130, 138)), 6
  $accentPen = New-Object System.Drawing.Pen $accentColor, 12
  $thinAccentPen = New-Object System.Drawing.Pen $accentColor, 6

  Fill-RoundedRect $g $softAccent 44 44 ($W - 88) ($H - 88) 40

  switch ($Kind) {
    "hero" {
      Fill-RoundedRect $g $shadow 462 366 250 54 24
      Fill-RoundedRect $g $white 500 156 220 190 34
      Fill-RoundedRect $g $accentBrush 520 184 180 42 14
      Fill-RoundedRect $g $white 174 296 250 72 28
      $g.DrawLine($accentPen, 382, 312, 520, 226)
      $g.DrawLine($linePen, 530, 338, 500, 440)
      $g.DrawLine($linePen, 666, 338, 706, 440)
      Fill-RoundedRect $g $accentBrush 190 380 150 96 14
      Fill-RoundedRect $g $white 210 396 110 18 8
      Fill-RoundedRect $g $white 210 430 84 16 8
      $g.DrawLine($thinAccentPen, 240, 250, 340, 250)
      $g.DrawLine($thinAccentPen, 250, 226, 348, 226)
      $g.DrawLine($thinAccentPen, 610, 132, 650, 68)
      $g.FillEllipse($accentBrush, 642, 52, 34, 34)
    }
    "handpiece" {
      $g.TranslateTransform(130, 310)
      $g.RotateTransform(-14)
      Fill-RoundedRect $g $shadow 96 76 520 52 22
      Fill-RoundedRect $g $white 88 36 520 80 30
      Stroke-RoundedRect $g $linePen 88 36 520 80 30
      Fill-RoundedRect $g $accentBrush 470 22 138 106 36
      Fill-RoundedRect $g $white 488 46 88 22 10
      Fill-RoundedRect $g $white 194 48 210 24 10
      $g.DrawLine($thinAccentPen, 124, 122, 76, 206)
      Fill-RoundedRect $g $accentBrush 42 196 78 34 12
      $g.ResetTransform()
    }
    "composite" {
      for ($i = 0; $i -lt 4; $i++) {
        $x = 154 + ($i * 142)
        Fill-RoundedRect $g $shadow ($x + 16) 354 78 32 16
        Fill-RoundedRect $g $white $x 158 96 220 28
        Fill-RoundedRect $g $accentBrush ($x + 12) 190 72 52 16
        Fill-RoundedRect $g $white ($x + 20) 260 56 82 16
        Stroke-RoundedRect $g $linePen $x 158 96 220 28
      }
      Fill-RoundedRect $g $accentBrush 180 414 540 68 20
      Fill-RoundedRect $g $white 220 432 160 18 8
      Fill-RoundedRect $g $white 420 432 220 18 8
    }
    "endomotor" {
      Fill-RoundedRect $g $shadow 278 418 330 58 22
      Fill-RoundedRect $g $white 318 166 252 260 42
      Stroke-RoundedRect $g $linePen 318 166 252 260 42
      Fill-RoundedRect $g $accentBrush 354 212 180 68 18
      $g.FillEllipse($softAccent, 380, 308, 128, 76)
      $g.FillEllipse($accentBrush, 410, 324, 68, 44)
      $g.DrawLine($accentPen, 552, 208, 710, 154)
      Fill-RoundedRect $g $white 688 118 74 54 18
      Stroke-RoundedRect $g $linePen 688 118 74 54 18
    }
    "autoclave" {
      Fill-RoundedRect $g $shadow 190 420 540 66 24
      Fill-RoundedRect $g $white 176 174 560 260 42
      Stroke-RoundedRect $g $linePen 176 174 560 260 42
      $g.FillEllipse($softAccent, 260, 214, 190, 160)
      $g.FillEllipse($white, 288, 238, 134, 104)
      Fill-RoundedRect $g $accentBrush 510 220 132 48 16
      Fill-RoundedRect $g $accentBrush 522 300 86 42 14
      $g.DrawLine($thinAccentPen, 224, 454, 686, 454)
    }
    "implant" {
      for ($i = 0; $i -lt 5; $i++) {
        $x = 210 + ($i * 92)
        Fill-RoundedRect $g $shadow ($x + 10) 418 42 42 16
        Fill-RoundedRect $g $white $x 168 58 260 22
        Stroke-RoundedRect $g $linePen $x 168 58 260 22
        $g.DrawLine($thinAccentPen, ($x + 8), 220, ($x + 50), 220)
        $g.DrawLine($thinAccentPen, ($x + 8), 276, ($x + 50), 276)
        $g.DrawLine($thinAccentPen, ($x + 8), 332, ($x + 50), 332)
      }
      Fill-RoundedRect $g $accentBrush 160 466 580 42 18
    }
    "bracket" {
      for ($row = 0; $row -lt 2; $row++) {
        for ($col = 0; $col -lt 5; $col++) {
          $x = 180 + ($col * 110)
          $y = 196 + ($row * 112)
          Fill-RoundedRect $g $shadow ($x + 10) ($y + 70) 70 24 12
          Fill-RoundedRect $g $white $x $y 84 84 20
          Stroke-RoundedRect $g $linePen $x $y 84 84 20
          $g.DrawLine($thinAccentPen, ($x + 14), ($y + 42), ($x + 70), ($y + 42))
          $g.DrawLine($thinAccentPen, ($x + 42), ($y + 14), ($x + 42), ($y + 70))
        }
      }
      $g.DrawLine($accentPen, 146, 284, 756, 284)
    }
    "impression" {
      Fill-RoundedRect $g $shadow 204 404 500 72 30
      Fill-RoundedRect $g $white 190 250 520 150 44
      Stroke-RoundedRect $g $linePen 190 250 520 150 44
      $g.FillEllipse($softAccent, 270, 190, 360, 164)
      $g.FillEllipse($accentBrush, 316, 224, 268, 86)
      Fill-RoundedRect $g $white 250 138 126 96 22
      Fill-RoundedRect $g $accentBrush 268 162 90 34 12
      Fill-RoundedRect $g $white 516 140 118 92 22
      Stroke-RoundedRect $g $linePen 516 140 118 92 22
    }
    "chair" {
      Fill-RoundedRect $g $shadow 236 422 440 64 28
      Fill-RoundedRect $g $white 260 214 250 96 34
      Fill-RoundedRect $g $white 366 140 170 180 34
      Stroke-RoundedRect $g $linePen 260 214 250 96 34
      Stroke-RoundedRect $g $linePen 366 140 170 180 34
      $g.DrawLine($accentPen, 420, 320, 420, 428)
      $g.DrawLine($accentPen, 310, 428, 530, 428)
      $g.DrawLine($thinAccentPen, 540, 178, 700, 112)
      $g.FillEllipse($accentBrush, 694, 92, 52, 52)
      Fill-RoundedRect $g $accentBrush 208 310 116 48 18
    }
  }

  $titleFont = New-Object System.Drawing.Font "Segoe UI", 34, ([System.Drawing.FontStyle]::Bold)
  $labelFont = New-Object System.Drawing.Font "Segoe UI", 18, ([System.Drawing.FontStyle]::Regular)
  $g.DrawString($Title, $titleFont, $ink, 54, ($H - 92))
  $g.DrawString("Dental Factory", $labelFont, $muted, 56, ($H - 52))

  $titleFont.Dispose()
  $labelFont.Dispose()
  $white.Dispose()
  $ink.Dispose()
  $muted.Dispose()
  $accentBrush.Dispose()
  $softAccent.Dispose()
  $shadow.Dispose()
  $linePen.Dispose()
  $accentPen.Dispose()
  $thinAccentPen.Dispose()

  $file = Join-Path $assetDir $Name
  $bmp.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

New-Asset -Name "hero-dental-shop.png" -Kind "hero" -Title "Dental supply desk" -Accent "#0b7f86" -W 1200 -H 760
New-Asset -Name "air-rotor.png" -Kind "handpiece" -Title "Airotor handpiece" -Accent "#0b7f86"
New-Asset -Name "composite-kit.png" -Kind "composite" -Title "Composite kit" -Accent "#e96552"
New-Asset -Name "endomotor.png" -Kind "endomotor" -Title "Endomotor" -Accent "#4b586f"
New-Asset -Name "autoclave.png" -Kind "autoclave" -Title "Autoclave" -Accent "#0b7f86"
New-Asset -Name "implant-kit.png" -Kind "implant" -Title "Implant driver kit" -Accent "#e96552"
New-Asset -Name "bracket-kit.png" -Kind "bracket" -Title "Bracket kit" -Accent "#4b586f"
New-Asset -Name "impression-kit.png" -Kind "impression" -Title "Impression material" -Accent "#f2b84b"
New-Asset -Name "clinic-chair.png" -Kind "chair" -Title "Clinic chair unit" -Accent "#0b7f86"
