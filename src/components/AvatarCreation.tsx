import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, User, Sparkles } from 'lucide-react';

interface AvatarCreationProps {
  onClose: () => void;
  onAvatarCreated: () => void;
}

const AvatarCreation = ({ onClose, onAvatarCreated }: AvatarCreationProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

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

  const handleCreateAvatar = async () => {
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

      // Call edge function to create personalized avatar using OpenRouter
      const { data, error } = await supabase.functions.invoke('create-personalized-avatar-openrouter', {
        body: {
          imageBase64,
          userId: user.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create avatar');

      toast({
        title: "Avatar Created!",
        description: "Your personalized avatar has been created. You can now upload clothing items to see them on your avatar.",
      });

      onAvatarCreated();
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Avatar Creation Error",
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Create Your Personalized Avatar
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-2">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Upload a clear photo of yourself</li>
                  <li>AI creates your personalized avatar</li>
                  <li>Upload clothing items to see them on your avatar</li>
                </ol>
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="avatar-photo">Upload Your Photo</Label>
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
                    id="avatar-photo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="avatar-photo" 
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Click to upload your photo
                  </Label>
                  <p className="text-xs text-muted-foreground mt-2">
                    Max 5MB • JPEG, PNG, WebP
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Tip:</strong> Use a clear, well-lit photo with your face visible for the best results.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAvatar} 
              disabled={!file || uploading}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {uploading ? 'Creating Avatar...' : 'Create Avatar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvatarCreation; 