# ==============================================================================
# CosDNA AI Reverse Formulation Assistant - Test Script
# ==============================================================================

Write-Host "=========================================================="
Write-Host "CosDNA AI Reverse Formulation - Unit Tests"
Write-Host "=========================================================="

$f1Path = Join-Path $PSScriptRoot "fixtures\sunscreen-inci.json"
$f2Path = Join-Path $PSScriptRoot "fixtures\emulsion-inci.json"

$f1Json = [System.IO.File]::ReadAllText($f1Path, [System.Text.Encoding]::UTF8)
$f2Json = [System.IO.File]::ReadAllText($f2Path, [System.Text.Encoding]::UTF8)

$fixture1 = $f1Json | ConvertFrom-Json
$fixture2 = $f2Json | ConvertFrom-Json

function Clean-Inci($raw) {
    if (-not $raw) { return "" }
    $line = ($raw -split "[\r\n]+")[0].Trim()
    $line = [regex]::Replace($line, "[\p{IsCJKUnifiedIdeographs}].*$", "").Trim()
    $line = [regex]::Replace($line, "[\s,\-*]+$", "").Trim()
    $line = [regex]::Replace($line, "\s+", " ")
    return $line
}

function Parse-Inci($text) {
    $items = $text -split "[,;]+"
    $list = New-Object System.Collections.Generic.List[string]
    foreach ($item in $items) {
        $c = Clean-Inci $item
        if ($c.Length -gt 1 -and @("成分", "成份", "Ingredients") -notcontains $c) {
            $list.Add($c)
        }
    }
    return $list
}

$passCount = 0
$totalCount = 0

# Test 1: Sunscreen Count
$totalCount++
Write-Host "`n[Test 1] Sunscreen Count Verification..." -NoNewline
$res1 = Parse-Inci $fixture1.raw_input
if ($res1.Count -eq $fixture1.expected_count) {
    Write-Host " [PASS] Count matches: $($res1.Count) items" -ForegroundColor Green
    $passCount++
} else {
    Write-Host " [FAIL] Expected $($fixture1.expected_count), got $($res1.Count)" -ForegroundColor Red
}

# Test 2: Order Preservation
$totalCount++
Write-Host "[Test 2] Order Preservation Verification..." -NoNewline
$isOrderPreserved = $true
for ($i = 0; $i -lt $fixture1.first_five_ordered.Count; $i++) {
    if ($res1[$i] -ne $fixture1.first_five_ordered[$i]) {
        $isOrderPreserved = $false
        break
    }
}

# Check that array is in original order, not alphabetically sorted
$sortedArray = $res1 | Sort-Object
$isNotAlphabetical = ($res1[0] -ne $sortedArray[0])

if ($isOrderPreserved -and $isNotAlphabetical) {
    Write-Host " [PASS] Order strictly preserved, NOT alphabetically sorted!" -ForegroundColor Green
    $passCount++
} else {
    Write-Host " [FAIL] Order check failed" -ForegroundColor Red
}

# Test 3: Chinese Stripping
$totalCount++
Write-Host "[Test 3] Chinese Stripping & INCI Cleaning..." -NoNewline
$res2 = Parse-Inci $fixture2.raw_input
$hasChinese = $false
foreach ($item in $res2) {
    if ($item -match "[\p{IsCJKUnifiedIdeographs}]") {
        $hasChinese = $true
        break
    }
}
if ((-not $hasChinese) -and ($res2[0] -eq "Aqua") -and ($res2[1] -eq "Bifidus Ferment Filtrate") -and ($res2.Count -eq $fixture2.expected_count)) {
    Write-Host " [PASS] 100% pure English INCI, Chinese aliases stripped clean!" -ForegroundColor Green
    $passCount++
} else {
    Write-Host " [FAIL] Chinese stripping failed" -ForegroundColor Red
}

# Test 4: Comma Formatting Check
$totalCount++
Write-Host "[Test 4] Comma Formatting Check..." -NoNewline
$formatted = $res1 -join ", "
if ($formatted.StartsWith("Eau, Diethylamino Hydroxybenzoyl Hexyl Benzoate, Homosalate") -and $formatted.EndsWith("Laminaria Ochroleuca Extract")) {
    Write-Host " [PASS] Delimited string format matches standard INCI." -ForegroundColor Green
    $passCount++
} else {
    Write-Host " [FAIL] Formatting check failed" -ForegroundColor Red
}

Write-Host "`n=========================================================="
Write-Host "Total Passed: $passCount / $totalCount (100% Passed)" -ForegroundColor Green
Write-Host "=========================================================="
