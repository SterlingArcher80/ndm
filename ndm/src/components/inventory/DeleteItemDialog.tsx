
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface DeleteItemDialogProps {
  item: {
    id: string;
    name: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteItemDialog = ({ item, open, onOpenChange }: DeleteItemDialogProps) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const queryClient = useQueryClient();

  const deleteItemMutation = useMutation({
    mutationFn: async () => {
      console.log('Deleting item:', item.id);
      
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', item.id);
      
      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }
      
      console.log('Item deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('Item deleted successfully');
      onOpenChange(false);
      setDeleteConfirmation('');
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    },
  });

  const handleDelete = () => {
    if (deleteConfirmation === 'DELETE') {
      deleteItemMutation.mutate();
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setDeleteConfirmation('');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-gray-900 dark:text-white">
            Delete Item
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
            Are you sure you want to delete "{item.name}"? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Type <span className="font-bold text-red-500">DELETE</span> to confirm:
          </p>
          <Input
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type DELETE to confirm"
            className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>

        <AlertDialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteConfirmation !== 'DELETE' || deleteItemMutation.isPending}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
          >
            {deleteItemMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteItemDialog;
