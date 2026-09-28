param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot "..\public\social")
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$cards = @(
  @{ Id = "portfolio"; Index = "MY / 01"; Label = "PERSONAL SYSTEMS PORTFOLIO"; Title = "蔡旻佑"; Subtitle = "MIN-YU TSAI / BIO AI / EDGE / SYSTEMS"; Accent = "#D8F20B" },
  @{ Id = "vap-early-warning"; Index = "01 / FLAGSHIP RESEARCH"; Label = "VAP EARLY WARNING"; Title = "VAP 早期預警研究"; Subtitle = "EXPLAINABLE ML / PATIENT-LEVEL EVALUATION"; Accent = "#B99CFF" },
  @{ Id = "swallow-eit"; Index = "02 / FLAGSHIP CONCEPT"; Label = "SWALLOWING EIT"; Title = "嚥域"; Subtitle = "SYNTHETIC INTERACTION / REHABILITATION UX"; Accent = "#B99CFF" },
  @{ Id = "biopulse-soc"; Index = "03 / FLAGSHIP EDGE"; Label = "BIOPULSE-SOC"; Title = "BioPulse-SoC"; Subtitle = "MODEL TO FPGA / EDGE INFERENCE"; Accent = "#5DC7FF" },
  @{ Id = "yieldsentry"; Index = "04 / FLAGSHIP INDUSTRY"; Label = "YIELDSENTRY"; Title = "YieldSentry"; Subtitle = "SEMICONDUCTOR AI / TRACEABLE WORKFLOW"; Accent = "#D8F20B" },
  @{ Id = "erp-ai-quote"; Index = "05 / FLAGSHIP PRODUCT"; Label = "ERP AI QUOTE"; Title = "ERP AI 智慧報價系統"; Subtitle = "DOCUMENT-TO-QUOTE / ENTERPRISE WORKFLOW"; Accent = "#FF7A5C" },
  @{ Id = "tradepilot"; Index = "06 / FLAGSHIP PRODUCT"; Label = "TRADEPILOT"; Title = "TradePilot"; Subtitle = "FINTECH / HUMAN-CONFIRMED DECISIONS"; Accent = "#5DC7FF" }
)

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null

function New-Font([float]$Size, [System.Drawing.FontStyle]$Style) {
  return [System.Drawing.Font]::new("Microsoft JhengHei UI", $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
}

foreach ($card in $cards) {
  $bitmap = [System.Drawing.Bitmap]::new(1200, 630)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#101112"))

  $accent = [System.Drawing.ColorTranslator]::FromHtml($card.Accent)
  $coral = [System.Drawing.ColorTranslator]::FromHtml("#FF5A3A")
  $paper = [System.Drawing.ColorTranslator]::FromHtml("#F5F2EA")
  $muted = [System.Drawing.ColorTranslator]::FromHtml("#A9A7A0")
  $grid = [System.Drawing.ColorTranslator]::FromHtml("#343530")
  $accentBrush = [System.Drawing.SolidBrush]::new($accent)
  $coralBrush = [System.Drawing.SolidBrush]::new($coral)
  $paperBrush = [System.Drawing.SolidBrush]::new($paper)
  $mutedBrush = [System.Drawing.SolidBrush]::new($muted)
  $gridPen = [System.Drawing.Pen]::new($grid, 2)
  $accentPen = [System.Drawing.Pen]::new($accent, 3)
  $indexFont = New-Font 18 ([System.Drawing.FontStyle]::Bold)
  $labelFont = New-Font 16 ([System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Font 17 ([System.Drawing.FontStyle]::Bold)
  $footerFont = New-Font 15 ([System.Drawing.FontStyle]::Bold)
  $signalFont = New-Font 16 ([System.Drawing.FontStyle]::Bold)
  $yearFont = New-Font 18 ([System.Drawing.FontStyle]::Bold)
  $titleFont = if ($card.Title.Length -gt 12) { New-Font 50 ([System.Drawing.FontStyle]::Bold) } else { New-Font 64 ([System.Drawing.FontStyle]::Bold) }
  $titleFormat = [System.Drawing.StringFormat]::new()
  $titleFormat.FormatFlags = [System.Drawing.StringFormatFlags]::LineLimit

  for ($x = 40; $x -lt 1200; $x += 120) { $graphics.DrawLine($gridPen, $x, 40, $x, 590) }
  for ($y = 40; $y -lt 630; $y += 110) { $graphics.DrawLine($gridPen, 40, $y, 1160, $y) }

  $graphics.FillRectangle($accentBrush, 50, 52, 18, 18)
  $graphics.DrawString($card.Index, $indexFont, $paperBrush, 86, 48)
  $graphics.DrawString($card.Label, $labelFont, $accentBrush, 50, 108)
  $graphics.DrawString($card.Title, $titleFont, $paperBrush, [System.Drawing.RectangleF]::new(50, 172, 790, 180), $titleFormat)
  $graphics.DrawString($card.Subtitle, $subtitleFont, $mutedBrush, 52, 412)

  $graphics.DrawLine($accentPen, 50, 500, 770, 500)
  $graphics.DrawString("MIN-YU TSAI / SYSTEMS ARCHIVE", $footerFont, $paperBrush, 50, 522)
  $graphics.DrawString("2026", $yearFont, $accentBrush, 50, 556)

  $graphics.DrawRectangle($accentPen, 897, 108, 225, 225)
  $graphics.FillEllipse($accentBrush, 937, 148, 142, 142)
  $graphics.FillEllipse($coralBrush, 1016, 227, 48, 48)
  $graphics.DrawLine($accentPen, 842, 472, 1110, 472)
  $graphics.DrawLine($accentPen, 976, 390, 976, 558)
  $graphics.DrawString("SIGNAL", $signalFont, $mutedBrush, 892, 500)
  $graphics.DrawString("ARCHIVE", $signalFont, $paperBrush, 892, 528)

  $bitmap.Save((Join-Path $OutputDirectory "$($card.Id).png"), [System.Drawing.Imaging.ImageFormat]::Png)

  $titleFormat.Dispose()
  $titleFont.Dispose()
  $yearFont.Dispose()
  $signalFont.Dispose()
  $footerFont.Dispose()
  $subtitleFont.Dispose()
  $labelFont.Dispose()
  $indexFont.Dispose()
  $accentPen.Dispose()
  $gridPen.Dispose()
  $mutedBrush.Dispose()
  $paperBrush.Dispose()
  $coralBrush.Dispose()
  $accentBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}
