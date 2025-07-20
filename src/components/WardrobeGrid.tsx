import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface WardrobeItem {
  id: string;
  image_url: string;
  description: string;
  created_at: string;
}

interface WardrobeGridProps {
  userId: string;
  isOwnWardrobe: boolean;
}

const WardrobeGrid = ({ userId, isOwnWardrobe }: WardrobeGridProps) => {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWardrobeItems();
  }, [userId]);

  const fetchWardrobeItems = async () => {
    try {
      const { data, error } = await supabase
        .from('wardrobes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load wardrobe items",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('wardrobes')
        .delete()
        .eq('id', itemId);

      if (dbError) throw dbError;

      // Extract file path from URL and delete from storage
      const urlParts = imageUrl.split('/');
      const fileName = urlParts.slice(-2).join('/'); // user_id/filename
      
      await supabase.storage
        .from('wardrobes')
        .remove([fileName]);

      // Update local state
      setItems(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: "Deleted",
        description: "Wardrobe item deleted successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete item",
      });
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {isOwnWardrobe ? "No items in your wardrobe yet" : "No items in this wardrobe"}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-all duration-200">
          <CardContent className="p-0 relative">
            <div className="aspect-square relative overflow-hidden">
              <img
                src={item.image_url}
                alt={item.description || 'Wardrobe item'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
              {isOwnWardrobe && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id, item.image_url);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {item.description && (
              <div className="p-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WardrobeGrid;