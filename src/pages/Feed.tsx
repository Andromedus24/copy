import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Search, User, Settings } from 'lucide-react';
import FeedSection from '@/components/FeedSection';
import SimpleClothingUpload from '@/components/SimpleClothingUpload';
import SimpleAvatarCreation from '@/components/SimpleAvatarCreation';

const Feed = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Fitzty Feed
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/search')}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setShowUpload(true)}
              size="sm"
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Fit
            </Button>
          </div>
        </div>
      </header>

      {/* Feed Content */}
      <main className="py-8">
        <FeedSection />
      </main>

      {/* Upload Modal */}
      {showUpload && (
        <SimpleClothingUpload
          onClose={() => setShowUpload(false)}
          onUploadComplete={() => {
            setShowUpload(false);
            // Optionally refresh the feed
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default Feed; 