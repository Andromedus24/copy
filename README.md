# Fitzty - Gen Z Fashion Social Network

Fitzty is a Gen Z-first fashion social network where users post real-world or avatar outfits, join location-based style maps, and compete in gamified challenges. We fuse the utility of a digital closet with the virality of TikTok and the personalization power of AI.

## 🚀 MVP Features (Aug → Oct 2025)

### ✅ Completed Features
- **Authentication System** - Supabase Auth with email/password
- **User Profiles** - Customizable profiles with following system
- **Personalized Avatar System** - AI-powered avatar creation from user photos
- **Enhanced Clothing Try-On** - Personalized clothing visualization on user avatars
- **Beautiful Landing Page** - Modern, responsive design with animations
- **Database Schema** - Complete Supabase setup with RLS policies

### 🔄 In Progress (MVP Core)
- **Fit Feed** - Social feed with likes, comments, and sharing
- **Competitions** - Weekly challenges with leaderboards and rewards
- **Communities** - Location-based fashion communities
- **Gamification** - Coins, badges, and streaks system

### 📋 Version 2 Roadmap (Nov 2025 → Q1 2026)
- **StyleMap** - Geo-tagged outfit discovery
- **AI Stylist** - Personalized outfit recommendations
- **Marketplace** - Brand drops and affiliate commerce
- **Avatar Closet** - DressX integration for digital fashion

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: OpenAI GPT-4 Vision + DALL-E 3
- **Deployment**: Vercel/Netlify ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm/yarn/bun
- Supabase account
- OpenAI API key

### 1. Clone & Install
```bash
git clone <repository-url>
cd fitzty-glow-up-waitlist-main
npm install
```

### 2. Environment Setup
Create `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 3. Database Setup
```bash
# Run the complete setup script
./scripts/setup-db.sh

# Or run the personalized avatar setup specifically
./scripts/setup-personalized-avatars.sh
```

### 4. OpenRouter API Setup
```bash
# Set up OpenRouter API integration for personalized avatars
./scripts/setup-openrouter.sh
```

### 4. Start Development
```bash
npm run dev
```

Visit `http://localhost:5173` to see your app!

## 📊 Database Schema

### Core Tables
- `profiles` - User profiles and metadata
- `personalized_avatars` - User's custom avatars created from photos
- `wardrobes` - AI-generated clothing try-ons on personalized avatars
- `follows` - User following relationships
- `likes` - Post like interactions
- `comments` - Post comment system
- `competitions` - Weekly challenges
- `communities` - Location-based groups
- `user_coins` - Gamification currency
- `user_badges` - Achievement system

### Key Features
- **Row Level Security (RLS)** - Secure data access
- **Real-time subscriptions** - Live feed updates
- **Automatic triggers** - Member counts, coin distribution
- **Optimized indexes** - Fast queries and performance

## 🎯 Feature Implementation Status

### Core MVP (Target: Oct 2025)

| Feature | Status | Progress |
|---------|--------|----------|
| Fit Feed | 🔄 In Progress | 80% |
| Personalized Avatar Creation | ✅ Complete | 100% |
| Enhanced Clothing Try-On | ✅ Complete | 100% |
| Competitions | 🔄 In Progress | 60% |
| Communities | 🔄 In Progress | 70% |
| Gamification | 🔄 In Progress | 40% |

### Success KPIs
- **Avg session ≥ 3 min** - Feed engagement
- **≥ 3 fits posted per WAU/wk** - Content creation
- **≥ 15% WAU submit** - Competition participation
- **50% WAU join community** - Social engagement
- **D7 retention ≥ 40%** - User retention

## 🎨 Design System

### Brand Colors
- **Primary**: `#6366f1` (Indigo)
- **Accent**: `#ec4899` (Pink)
- **Background**: `#ffffff` (White)
- **Foreground**: `#0f172a` (Slate)

### Typography
- **Font**: Inter (Light weights for modern feel)
- **Headings**: Light tracking for premium look
- **Body**: Optimized for mobile reading

### Components
- **shadcn/ui** - Consistent, accessible components
- **Custom animations** - Smooth transitions and micro-interactions
- **Responsive design** - Mobile-first approach

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── FeedSection.tsx # Social feed
│   ├── CompetitionsSection.tsx # Challenges
│   └── CommunitiesSection.tsx # Location groups
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── integrations/       # External services
└── lib/               # Utilities and helpers
```

### Key Components
- **FeedSection** - Main social feed with infinite scroll
- **AvatarCreation** - Personalized avatar creation from user photos
- **EnhancedWardrobeUpload** - Clothing try-on with personalized avatars
- **AvatarManager** - Avatar management and updates
- **CompetitionsSection** - Gamified challenges
- **CommunitiesSection** - Location-based communities

### API Integration
- **Supabase Client** - Database and auth
- **OpenRouter API** - Qwen/QWQ-32B for image analysis + DALL-E 3 for avatar generation
- **Real-time subscriptions** - Live updates

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Environment Variables
Ensure all environment variables are set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_OPENAI_API_KEY`

## 📈 Analytics & Monitoring

### Key Metrics to Track
- **User Engagement**: Session duration, posts per user
- **Content Creation**: Uploads, competitions participation
- **Social Features**: Follows, likes, comments
- **Retention**: D1, D7, D30 retention rates

### Tools
- **Supabase Analytics** - Database performance
- **Vercel Analytics** - Frontend performance
- **Custom Events** - Feature usage tracking

## 🤝 Contributing

### Development Workflow
1. Create feature branch: `git checkout -b feature/feed-section`
2. Implement changes with tests
3. Update documentation
4. Submit pull request

### Code Standards
- **TypeScript** - Strict type checking
- **ESLint** - Code quality
- **Prettier** - Code formatting
- **Conventional Commits** - Git commit messages

## 📱 Mobile Optimization

### Progressive Web App (PWA)
- **Offline support** - Service worker caching
- **App-like experience** - Full-screen mode
- **Push notifications** - Engagement features

### Performance
- **Image optimization** - WebP format, lazy loading
- **Code splitting** - Route-based chunks
- **Bundle analysis** - Size monitoring

## 🔮 Future Enhancements

### Version 2 Features
- **StyleMap** - Mapbox integration for location-based discovery
- **AI Stylist** - RAG-powered outfit recommendations
- **Marketplace** - Stripe integration for commerce
- **AR Try-On** - Virtual fitting room

### Technical Improvements
- **React Native** - Mobile app development
- **GraphQL** - Optimized data fetching
- **Redis** - Caching and session management
- **CDN** - Global content delivery

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:
- **Email**: tech@fitzty.com
- **Discord**: [Fitzty Dev Community]
- **Documentation**: [docs.fitzty.com]

---

**Built with ❤️ by the Fitzty Team**
