Get-ChildItem -Path src -Recurse -File -Include *.ts,*.tsx,*.js,*.jsx,*.css,*.html,*.md | ForEach-Object {
    $path = $_.FullName
    try {
        $content = Get-Content $path -Raw -ErrorAction Stop
        if ($null -eq $content) { return }
        
        # Replace Clinkar (brand) but exclude Clinkargo
        $newContent = [regex]::Replace($content, 'Clinkar(?!go)', 'StarterKar')
        $newContent = [regex]::Replace($newContent, 'clinkar(?!go)', 'starterkar')
        
        if ($content -ne $newContent) {
            Set-Content $path $newContent -NoNewline
            Write-Host "Rebranded: $path"
        }
    } catch {
        Write-Warning "Could not process $path"
    }
}
