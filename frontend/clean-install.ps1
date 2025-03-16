# Remove existing node_modules and lock files
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path package-lock.json) {
    Remove-Item -Force package-lock.json
}

# Install dependencies
npm install

# Clear Vite cache
if (Test-Path node_modules/.vite) {
    Remove-Item -Recurse -Force node_modules/.vite
}

Write-Host "Clean installation completed!" 