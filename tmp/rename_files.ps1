# rename_files.ps1
# Renames Clinkar files to StarterKar while ignoring Clinkargo

Get-ChildItem -Path src -Recurse -File | ForEach-Object {
    $oldName = $_.Name
    
    # Check if name contains Clinkar but NOT Clinkargo
    if ($oldName -like "*Clinkar*" -and $oldName -notlike "*Clinkargo*") {
        $newName = $oldName -replace "Clinkar", "StarterKar"
        Write-Host "Renaming: $($_.FullName) -> $newName"
        Rename-Item -Path $_.FullName -NewName $newName -Force
    }
}
