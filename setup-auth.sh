#!/bin/bash

# SpeedMock Auth Setup Script
# This script sets up Supabase and Redis authentication for SpeedMock

echo "═══════════════════════════════════════════════════════════"
echo "🚀 SpeedMock Authentication Setup"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server/.env from template..."
    cp server/.env.example server/.env
    echo "⚠️  IMPORTANT: Edit server/.env with your actual credentials"
    echo ""
fi

if [ ! -f "client/.env.local" ]; then
    echo "📝 Creating client/.env.local from template..."
    cp client/.env.example client/.env.local
    echo "⚠️  IMPORTANT: Edit client/.env.local with your actual credentials"
    echo ""
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd server
npm install bcryptjs jsonwebtoken pg ioredis dotenv cors --save
cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Edit server/.env with your Supabase & Redis credentials"
echo "2. Edit client/.env.local with your Supabase & API URL"
echo "3. Create database tables (see AUTH_SETUP_GUIDE.md)"
echo "4. Run: npm start (in server/)"
echo "5. Run: npm run dev (in client/)"
echo ""
echo "📚 Documentation: AUTH_SETUP_GUIDE.md"
echo "📊 Status: AUTH_INTEGRATION_STATUS.md"
echo ""
