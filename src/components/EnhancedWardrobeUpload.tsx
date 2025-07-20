import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, User, Sparkles, Shirt } from 'lucide-react';
import AvatarCreation from './AvatarCreation';

interface EnhancedWardrobeUploadProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

interface PersonalizedAvatar {
  id: string;
  avatar_url: string;
  original_photo_url: string;
}

const EnhancedWardrobeUpload = ({ onClose, onUploadComplete }: EnhancedWardrobeUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [personalizedAvatar, setPersonalizedAvatar] = useState<PersonalizedAvatar | null>(null);
  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [showAvatarCreation, setShowAvatarCreation] = useState(false);

  useEffect(() => {
    checkPersonalizedAvatar();
  }, []);

  const checkPersonalizedAvatar = async () => {
    if (!user) return;

    try {
      setLoadingAvatar(true);
      const { data, error } = await supabase
        .from('personalized_avatars')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setPersonalizedAvatar(data);
    } catch (error: any) {
      console.error('Error checking personalized avatar:', error);
    } finally {
      setLoadingAvatar(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file type",
          description: "Please select an image file (JPEG, PNG, etc.)",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 5MB",
        });
        return;
      }

      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    try {
      // Convert file to base64
      const fileReader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        fileReader.onload = () => {
          const result = fileReader.result as string;
          const base64 = result.split(',')[1]; // Remove data:image/jpeg;base64, prefix
          resolve(base64);
        };
        fileReader.onerror = reject;
      });
      
      fileReader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      // Call edge function to generate clothing try-on using OpenRouter
      const { data, error } = await supabase.functions.invoke('generate-avatar-openrouter', {
        body: {
          imageBase64,
          description: description.trim() || 'Fashion item',
          userId: user.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to generate clothing try-on');

      toast({
        title: "Clothing Try-On Complete!",
        description: "Your personalized avatar wearing the item has been added to your wardrobe.",
      });

      onUploadComplete();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarCreated = () => {
    checkPersonalizedAvatar();
    setShowAvatarCreation(false);
  };

  if (loadingAvatar) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <div className="text-lg">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Show avatar creation if user doesn't have a personalized avatar
  if (!personalizedAvatar) {
    return (
      <>
        <Dialog open={true} onOpenChange={onClose}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Create Your Avatar First
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-2">Personalized Clothing Try-On</p>
                    <p className="text-muted-foreground">
                      To see clothing items on your personalized avatar, you need to create your avatar first.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => setShowAvatarCreation(true)}
                  className="bg-gradient-to-r from-primary to-accent text-white"
                >
                  Create Avatar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {showAvatarCreation && (
          <AvatarCreation
            onClose={() => setShowAvatarCreation(false)}
            onAvatarCreated={handleAvatarCreated}
          />
        )}
      </>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5" />
            Try On Clothing
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Avatar Preview */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <img 
                src={personalizedAvatar.avatar_url} 
                alt="Your avatar" 
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="text-sm">
                <p className="font-medium">Your Personalized Avatar</p>
                <p className="text-muted-foreground">
                  Upload clothing to see it on your avatar
                </p>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="clothing-file">Upload Clothing Item</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {preview ? (
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="max-w-full max-h-48 mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                  <Input
                    id="clothing-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="clothing-file" 
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Click to upload clothing item
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Max 5MB • JPEG, PNG, WebP
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this clothing item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Use clear, well-lit photos of clothing items for the best try-on results.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {uploading ? 'Generating Try-On...' : 'Try On Item'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedWardrobeUpload; 