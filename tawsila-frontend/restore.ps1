$backupDir = "C:\Users\welba\Desktop\ISSAT\Project-Java\what curser delete"
$destBase = "C:\Users\welba\Desktop\ISSAT\Project-Java\tawsila-frontend"
$srcDir = "$destBase\src"

# Create directories
New-Item -ItemType Directory -Force -Path "$srcDir\components\ui" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\components\layout" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\components\shared" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\components\trips" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\components\chat" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\lib\api" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\lib\stores" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\lib\utils" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\types" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\i18n" | Out-Null
New-Item -ItemType Directory -Force -Path "$destBase\messages" | Out-Null
New-Item -ItemType Directory -Force -Path "$destBase\public" | Out-Null
New-Item -ItemType Directory -Force -Path "$srcDir\app\[locale]\(dashboard)\reservations" | Out-Null

$files = Get-ChildItem -Path $backupDir -File | Where-Object { $_.Extension -ne ".java" }

foreach ($file in $files) {
    $name = $file.Name
    $dest = ""

    if ($name -match "\.mp4$|\.png$|\.svg$|\.ico$") {
        $dest = "$destBase\public\$name"
    }
    elseif ($name -match "\.json$" -and $name -match "^(en|fr|ar)\.json$") {
        $dest = "$destBase\messages\$name"
    }
    elseif ($name -match "config\.ts|config\.mjs|package.*\.json|tsconfig\.json|manifest\.json|\.gitignore|README\.md") {
        $dest = "$destBase\$name"
    }
    elseif ($name -match "\.api\.ts$|client\.ts|index\.ts") {
        $dest = "$srcDir\lib\api\$name"
    }
    elseif ($name -match "store\.ts$") {
        $dest = "$srcDir\lib\stores\$name"
    }
    elseif ($name -in @("cn.ts", "format.ts", "constants.ts")) {
        $dest = "$srcDir\lib\utils\$name"
    }
    elseif ($name -in @("routing.ts", "request.ts", "navigation.ts")) {
        $dest = "$srcDir\i18n\$name"
    }
    elseif ($name -in @("button.tsx", "input.tsx", "skeleton.tsx")) {
        $dest = "$srcDir\components\ui\$name"
    }
    elseif ($name -in @("header.tsx", "footer.tsx", "sidebar.tsx", "mobile-nav.tsx")) {
        $dest = "$srcDir\components\layout\$name"
    }
    elseif ($name -in @("auth-guard.tsx", "language-switcher.tsx", "theme-toggle.tsx", "notification-toast-listener.tsx", "HeroVideoSection.tsx")) {
        $dest = "$srcDir\components\shared\$name"
    }
    elseif ($name -in @("trip-card.tsx", "trip-route-map.tsx")) {
        $dest = "$srcDir\components\trips\$name"
    }
    elseif ($name -in @("chat-ui.tsx")) {
        $dest = "$srcDir\components\chat\$name"
    }
    elseif ($name -eq "page.tsx") {
        $dest = "$srcDir\app\[locale]\(dashboard)\reservations\page.tsx"
    }
    elseif ($name -eq "layout.tsx") {
        $dest = "$srcDir\app\[locale]\(dashboard)\layout.tsx"
    }
    elseif ($name -eq "globals.css") {
        $dest = "$srcDir\app\globals.css"
    }
    elseif ($name -eq "providers.tsx") {
        $dest = "$srcDir\app\providers.tsx"
    }
    elseif ($name -in @("error.tsx", "loading.tsx", "middleware.ts")) {
        $dest = "$srcDir\app\$name"
    }
    else {
        # Catch all types or misc ts files
        if ($name -match "\.ts$") {
            $dest = "$srcDir\types\$name"
        } else {
            $dest = "$srcDir\$name"
        }
    }

    if ($dest -ne "") {
        Write-Host "Restoring $name to $dest"
        Copy-Item -Path $file.FullName -Destination $dest -Force
    }
}
