# Student Management System - Setup & Deployment Script
# This script automates the setup and deployment process

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('setup', 'dev', 'build', 'deploy', 'full')]
    [string]$Task = 'full'
)

$ProjectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Student Management System Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Check-Requirements {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    $hasNode = $null -ne (Get-Command node -ErrorAction SilentlyContinue)
    $hasGit = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
    
    if (-not $hasNode) {
        Write-Host "❌ Node.js is not installed!" -ForegroundColor Red
        Write-Host "Please download and install Node.js from: https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
    
    if (-not $hasGit) {
        Write-Host "❌ Git is not installed!" -ForegroundColor Red
        Write-Host "Please download and install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
        exit 1
    }
    
    $nodeVersion = node --version
    $gitVersion = git --version
    
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
    Write-Host "✅ Git $gitVersion" -ForegroundColor Green
    Write-Host ""
}

function Setup-Project {
    Write-Host "Setting up project..." -ForegroundColor Yellow
    
    Set-Location $ProjectPath
    
    # Install dependencies
    Write-Host "Installing dependencies..." -ForegroundColor Cyan
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    
    # Initialize Git
    Write-Host "Initializing Git repository..." -ForegroundColor Cyan
    git init
    git config user.email "f.elmoudni@esisa.ac.ma"
    git config user.name "Student Management"
    git add .
    git commit -m "Initial commit: Complete student management system with Next.js, SQLite, and NextAuth"
    
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
    
    # Initialize database
    Write-Host "Initializing database..." -ForegroundColor Cyan
    npm run db:init
    
    Write-Host "✅ Setup complete!" -ForegroundColor Green
    Write-Host ""
}

function Start-Dev {
    Write-Host "Starting development server..." -ForegroundColor Yellow
    Write-Host "Application will be available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Login credentials:" -ForegroundColor Cyan
    Write-Host "  Email: admin@example.com" -ForegroundColor Yellow
    Write-Host "  Password: password123" -ForegroundColor Yellow
    Write-Host ""
    
    Set-Location $ProjectPath
    npm run dev
}

function Build-Project {
    Write-Host "Building project for production..." -ForegroundColor Yellow
    
    Set-Location $ProjectPath
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
        Write-Host "To start production server, run: npm start" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        exit 1
    }
}

function Deploy-Vercel {
    Write-Host "Preparing for Vercel deployment..." -ForegroundColor Yellow
    
    # Check if Vercel CLI is installed
    $hasVercel = $null -ne (Get-Command vercel -ErrorAction SilentlyContinue)
    
    if (-not $hasVercel) {
        Write-Host "Installing Vercel CLI..." -ForegroundColor Cyan
        npm install -g vercel
    }
    
    # Push to GitHub first
    Write-Host "Pushing code to GitHub..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Make sure you have:" -ForegroundColor Yellow
    Write-Host "  1. Created a GitHub repository at: https://github.com/elmoudni-fatimazahrae/student-managment" -ForegroundColor Cyan
    Write-Host "  2. Set up your GitHub credentials" -ForegroundColor Cyan
    Write-Host ""
    
    Set-Location $ProjectPath
    
    $existingRemote = git remote -v | Select-String "origin"
    
    if (-not $existingRemote) {
        git remote add origin https://github.com/elmoudni-fatimazahrae/student-managment.git
    }
    
    git status
    
    Write-Host ""
    Write-Host "Ready to push to GitHub?" -ForegroundColor Yellow
    $response = Read-Host "Enter 'yes' to continue, or 'no' to skip"
    
    if ($response -eq 'yes') {
        git branch -M main
        git push -u origin main
        Write-Host "✅ Code pushed to GitHub" -ForegroundColor Green
    }
    
    # Deploy to Vercel
    Write-Host ""
    Write-Host "Starting Vercel deployment..." -ForegroundColor Yellow
    vercel
}

function Run-Full-Setup {
    Check-Requirements
    Setup-Project
    
    Write-Host "Setup complete! What would you like to do next?" -ForegroundColor Cyan
    Write-Host "1. Start development server" -ForegroundColor Yellow
    Write-Host "2. Build for production" -ForegroundColor Yellow
    Write-Host "3. Deploy to Vercel" -ForegroundColor Yellow
    Write-Host "4. Nothing, I'll do it myself" -ForegroundColor Yellow
    Write-Host ""
    
    $choice = Read-Host "Enter your choice (1-4)"
    
    switch ($choice) {
        '1' { Start-Dev }
        '2' { Build-Project }
        '3' { Deploy-Vercel }
        '4' { Write-Host "Goodbye!" -ForegroundColor Green }
        default { Write-Host "Invalid choice" -ForegroundColor Red }
    }
}

# Main execution
switch ($Task) {
    'setup' {
        Check-Requirements
        Setup-Project
    }
    'dev' {
        Check-Requirements
        Start-Dev
    }
    'build' {
        Check-Requirements
        Build-Project
    }
    'deploy' {
        Check-Requirements
        Deploy-Vercel
    }
    'full' {
        Run-Full-Setup
    }
    default {
        Write-Host "Unknown task: $Task" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
