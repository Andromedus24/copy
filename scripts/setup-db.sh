#!/bin/bash

# Fitzty Database Setup Script
# This script sets up the complete database schema for Fitzty

echo "🚀 Setting up Fitzty Database..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if user is logged in
if ! supabase status &> /dev/null; then
    echo "🔐 Please login to Supabase first:"
    echo "supabase login"
    exit 1
fi

# Check if project is linked
if ! supabase status | grep -q "Linked"; then
    echo "🔗 Please link your Supabase project first:"
    echo "supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "📊 Running database migrations..."

# Run all migrations
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Database setup complete!"
    echo ""
    echo "🎉 Your Fitzty database is ready with:"
    echo "   • User authentication"
    echo "   • Social feed (likes, comments)"
    echo "   • Competitions system"
    echo "   • Communities"
    echo "   • Gamification (coins, badges)"
    echo "   • AI avatar generation"
    echo ""
    echo "🚀 You can now start the development server:"
    echo "npm run dev"
else
    echo "❌ Database setup failed. Please check the error messages above."
    exit 1
fi 