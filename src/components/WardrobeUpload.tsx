import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Upload, X } from 'lucide-react';

interface WardrobeUploadProps {
  onClose: () => void;
  onUploadComplete: () => void;
}

const WardrobeUpload = ({ onClose, onUploadComplete }: WardrobeUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
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

      // Call edge function to generate avatar
      const { data, error } = await supabase.functions.invoke('generate-avatar', {
        body: {
          imageBase64,
          description: description.trim() || 'Fashion item',
          userId: user.id
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to generate avatar');

      toast({
        title: "Avatar Generated!",
        description: "Your AI avatar wearing the item has been added to your wardrobe.",
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
          <DialogTitle>Add Wardrobe Item</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file">Select Image</Label>
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
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label 
                    htmlFor="file" 
                    className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
                  >
                    Click to upload an image
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe this item..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Add to Wardrobe'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WardrobeUpload;