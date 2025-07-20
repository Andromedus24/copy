#!/bin/bash

# Fitzty OpenRouter API Setup Script
# This script sets up the OpenRouter API integration for personalized avatars

echo "🤖 Setting up OpenRouter API Integration..."

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

echo "📊 Setting up environment variables..."

# Set OpenRouter API key
supabase secrets set OPENROUTER_API_KEY=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

# Set site information
supabase secrets set SITE_URL=https://fitzty.com
supabase secrets set SITE_NAME=Fitzty

echo "🚀 Deploying OpenRouter edge functions..."

# Deploy the OpenRouter edge functions
supabase functions deploy create-personalized-avatar-openrouter
supabase functions deploy generate-avatar-openrouter

if [ $? -eq 0 ]; then
    echo "✅ OpenRouter API integration setup complete!"
    echo ""
    echo "🎉 Your personalized avatar feature is ready with:"
    echo "   • OpenRouter API integration"
    echo "   • Qwen/QWQ-32B model for image analysis"
    echo "   • DALL-E 3 for avatar generation"
    echo "   • Direct API calls from frontend"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Start the development server:"
    echo "      npm run dev"
    echo "   2. Test the avatar creation:"
    echo "      - Go to /profile"
    echo "      - Click 'Create Avatar'"
    echo "      - Upload a photo"
    echo "   3. Test clothing try-on:"
    echo "      - Click 'Add Item'"
    echo "      - Upload clothing"
    echo ""
    echo "💡 Feature workflow:"
    echo "   1. User uploads photo → OpenRouter analyzes → Creates avatar"
    echo "   2. User uploads clothing → OpenRouter analyzes → Generates try-on"
    echo "   3. Results saved to user's profile and wardrobe"
    echo ""
    echo "🔧 API Configuration:"
    echo "   • API Key: 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"
    echo "   • Vision Model: qwen/qwq-32b:free"
    echo "   • Image Model: dall-e-3"
    echo "   • Site: https://fitzty.com"
else
    echo "❌ OpenRouter setup failed. Please check the error messages above."
    exit 1
fi 