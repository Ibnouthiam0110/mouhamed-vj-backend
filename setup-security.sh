#!/bin/bash

# 🔐 Security Setup Script - Phase 1
# This script helps generate strong secrets and set up .env securely

set -e

echo "🔐 Security Configuration Setup for Mouhamed VJ"
echo "=================================================="
echo ""

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists"
    read -p "Do you want to generate NEW secrets? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Exiting without changes"
        exit 0
    fi
fi

# Generate strong secrets
echo "Generating strong random secrets..."
echo ""

JWT_SECRET=$(openssl rand -hex 32)
DB_PASSWORD=$(openssl rand -base64 32)
ADMIN_PASSWORD=$(openssl rand -base64 24)

echo "📋 Generated Secrets (save these securely!):"
echo "============================================"
echo "JWT_SECRET=$JWT_SECRET"
echo "DB_PASSWORD=$DB_PASSWORD"
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"
echo ""

# Create or update .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
fi

# Update .env with generated secrets
# Using sed with different delimiters for each field
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|" .env
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env
sed -i "s|ADMIN_PASSWORD=.*|ADMIN_PASSWORD=$ADMIN_PASSWORD|" .env

echo "✅ .env file updated with secure values!"
echo ""
echo "⚠️  IMPORTANT:"
echo "   1. Store these secrets in your password manager"
echo "   2. NEVER commit .env to git (it's in .gitignore)"
echo "   3. Update CORS_ORIGIN in .env for your domain"
echo "   4. Run: npm start (backend should start successfully)"
echo ""
