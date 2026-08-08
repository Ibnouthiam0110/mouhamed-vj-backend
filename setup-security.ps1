# Security Setup Script - Phase 1 (Windows PowerShell)
# Generates strong secrets and sets up .env file

Write-Host "Security Configuration Setup" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

# Generate strong secrets
Write-Host "Generating strong random secrets..." -ForegroundColor Green
Write-Host ""

# JWT_SECRET: 64 character hex (32 bytes)
$jwtBytes = New-Object byte[] 32
[System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($jwtBytes)
$JWT_SECRET = [System.BitConverter]::ToString($jwtBytes) -replace '-', ''

# DB_PASSWORD: 32 character strong random
$dbBytes = New-Object byte[] 24
[System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($dbBytes)
$DB_PASSWORD = [System.Convert]::ToBase64String($dbBytes)

# ADMIN_PASSWORD: 24 character random
$adminBytes = New-Object byte[] 18
[System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes($adminBytes)
$ADMIN_PASSWORD = [System.Convert]::ToBase64String($adminBytes)

Write-Host "Generated Secrets (save these securely!):" -ForegroundColor Cyan
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host "JWT_SECRET=$JWT_SECRET" -ForegroundColor White
Write-Host "DB_PASSWORD=$DB_PASSWORD" -ForegroundColor White
Write-Host "ADMIN_PASSWORD=$ADMIN_PASSWORD" -ForegroundColor White
Write-Host ""

# Create or update .env file
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file from template..." -ForegroundColor Green
    Copy-Item ".env.example" ".env"
} else {
    Write-Host "Using existing .env file..." -ForegroundColor Yellow
}

# Update .env with generated secrets
$envContent = Get-Content ".env" -Raw

# Replace with actual values
$envContent = $envContent -replace 'DB_PASSWORD=.*', "DB_PASSWORD=$DB_PASSWORD"
$envContent = $envContent -replace 'JWT_SECRET=.*', "JWT_SECRET=$JWT_SECRET"
$envContent = $envContent -replace 'ADMIN_PASSWORD=.*', "ADMIN_PASSWORD=$ADMIN_PASSWORD"

Set-Content ".env" $envContent -Encoding UTF8

Write-Host "OK .env file has been created/updated!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT:" -ForegroundColor Yellow
Write-Host "1. Save these secrets in your password manager"
Write-Host "2. NEVER commit .env to git"
Write-Host "3. Run: npm start (to verify it works)"
Write-Host ""
