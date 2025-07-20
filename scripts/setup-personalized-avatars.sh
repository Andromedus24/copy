#!/bin/bash

# Fitzty Personalized Avatar Setup Script
# This script sets up the personalized avatar feature

echo "🎭 Setting up Personalized Avatar Feature..."

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

echo "📊 Running personalized avatar migrations..."

# Run the new migration
supabase db push

if [ $? -eq 0 ]; then
    echo "✅ Personalized avatar database setup complete!"
    echo ""
    echo "🎉 Your personalized avatar feature is ready with:"
    echo "   • personalized_avatars table"
    echo "   • original-photos storage bucket"
    echo "   • Enhanced wardrobe upload system"
    echo "   • Avatar creation workflow"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Deploy the new edge function:"
    echo "      supabase functions deploy create-personalized-avatar"
    echo "   2. Update your environment variables:"
    echo "      VITE_OPENAI_API_KEY=your_openai_api_key"
    echo "   3. Start the development server:"
    echo "      npm run dev"
    echo ""
    echo "💡 Feature workflow:"
    echo "   1. User uploads photo → AI creates personalized avatar"
    echo "   2. User uploads clothing → AI puts it on their avatar"
    echo "   3. Results saved to wardrobe with avatar reference"
else
    echo "❌ Database setup failed. Please check the error messages above."
    exit 1
fi 