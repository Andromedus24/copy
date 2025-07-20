import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Shirt, Sparkles } from 'lucide-react';

interface SimpleClothingUploadProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

const SimpleClothingUpload = ({ onClose, onUploadComplete }: SimpleClothingUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
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

      // Get user's current avatar
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .single();

      if (profileError || !profileData?.avatar_url) {
        throw new Error('Please create your personalized avatar first before uploading clothing items.');
      }

      // Call OpenRouter API directly
      const openRouterApiKey = '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';
      
      // Analyze the clothing image
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
                  text: 'Analyze this clothing item image in extreme detail. Describe the exact clothing item, including: type of garment, color, pattern, texture, style, fit, any logos or text, decorative elements, fabric appearance, and any unique features. Be very specific and detailed as this description will be used to recreate the exact same clothing item on an avatar.'
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
        throw new Error('Failed to analyze clothing item');
      }

      const visionData = await visionResponse.json();
      const detailedClothingDescription = visionData.choices[0].message.content;

      // Generate clothing try-on
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
          prompt: `Create a single 2D fashion avatar that looks exactly like the person in this reference image: ${profileData.avatar_url}, but wearing this exact clothing item: ${detailedClothingDescription}. The avatar should maintain the same person's appearance, facial features, hair, and body type from the reference image, but now wearing the described clothing item. Style: professional fashion photography, clean white background, good lighting. The person should be wearing the EXACT same clothing item as described while maintaining their unique appearance. Make sure it's only one person in the image.`,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate clothing try-on');
      }

      const data = await response.json();
      const generatedImageUrl = data.data[0].url;

      // Save to wardrobe
      const { error: wardrobeError } = await supabase
        .from('wardrobes')
        .insert({
          user_id: user.id,
          image_url: generatedImageUrl,
          description: description || 'AI-generated avatar wearing uploaded item'
        });

      if (wardrobeError) {
        throw wardrobeError;
      }

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
          {/* Instructions */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-2">Personalized Clothing Try-On</p>
                <p className="text-muted-foreground">
                  Upload a clothing item to see it on your personalized avatar
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

export default SimpleClothingUpload; 