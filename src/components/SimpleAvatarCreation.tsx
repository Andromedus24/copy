import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, User, Sparkles } from 'lucide-react';

interface SimpleAvatarCreationProps {
  onClose: () => void;
  onAvatarCreated: () => void;
}

const SimpleAvatarCreation = ({ onClose, onAvatarCreated }: SimpleAvatarCreationProps) => {
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

      // Call OpenRouter API directly for now
      const openRouterApiKey = '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';
      
      // Analyze the user's photo
      const visionResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://fitzty.com',
          'X-Title': 'Fitzty',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwq-32b:free',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this person\'s photo in extreme detail. Describe their appearance including: gender, age range, hair color and style, eye color, skin tone, facial features, body type, and any distinctive characteristics. Be very specific and detailed as this description will be used to create a personalized avatar that looks like this person.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        }),
      });

      if (!visionResponse.ok) {
        throw new Error('Failed to analyze photo');
      }

      const visionData = await visionResponse.json();
      const personDescription = visionData.choices[0].message.content;

      // Generate avatar
      const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'HTTP-Referer': 'https://fitzty.com',
          'X-Title': 'Fitzty',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: `Create a single 2D fashion avatar of a person that looks exactly like this description: ${personDescription}. The avatar should be a modern, attractive person in a clean studio setting with a neutral pose, showcasing fashion potential. Style: professional fashion photography, clean white background, good lighting, high quality. The person should look exactly like the described person. Make sure it's only one person in the image.`,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate avatar');
      }

      const data = await response.json();
      const generatedAvatarUrl = data.data[0].url;

      // For now, just save the avatar URL to the user's profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: generatedAvatarUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Avatar Created!",
        description: "Your personalized avatar has been created and saved to your profile.",
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
                  <li>Avatar is saved to your profile</li>
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

export default SimpleAvatarCreation; 