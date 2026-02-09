# Script pour remplacer Header par HeaderWithUser dans tous les fichiers
$files = Get-ChildItem -Path "src\app" -Filter "*.tsx" -Recurse | Where-Object { $_.FullName -notlike "*HeaderWithUser*" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "import Header from '@/components/Header'") {
        $content = $content -replace "import Header from '@/components/Header'", "import Header from '@/components/HeaderWithUser'"
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Done!"
