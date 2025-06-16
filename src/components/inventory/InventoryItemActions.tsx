
import { useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import EditItemDialog from './EditItemDialog';
import DeleteItemDialog from './DeleteItemDialog';

interface InventoryItemActionsProps {
  item: {
    id: string;
    name: string;
    sku: string;
    description?: string;
    quantity: number;
    category_id?: string;
    location_id?: string;
  };
}

const InventoryItemActions = ({ item }: InventoryItemActionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const duplicateItemMutation = useMutation({
    mutationFn: async () => {
      console.log('Duplicating item:', item);
      
      const { error } = await supabase
        .from('inventory_items')
        .insert({
          name: `${item.name} (Copy)`,
          sku: `${item.sku}-COPY`,
          description: item.description,
          quantity: item.quantity,
          category_id: item.category_id,
          location_id: item.location_id,
        });
      
      if (error) {
        console.error('Supabase duplicate error:', error);
        throw error;
      }
      
      console.log('Item duplicated successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('Item duplicated successfully');
    },
    onError: (error) => {
      console.error('Error duplicating item:', error);
      toast.error('Failed to duplicate item');
    },
  });

  const handleDuplicate = () => {
    duplicateItemMutation.mutate();
  };

  return (
    <div className="flex items-center space-x-2">
      <EditItemDialog item={item} />
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={handleDuplicate}
        disabled={duplicateItemMutation.isPending}
      >
        <Copy className="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => setDeleteDialogOpen(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteItemDialog
        item={item}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
};

export default InventoryItemActions;
