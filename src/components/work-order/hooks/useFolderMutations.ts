
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useFolderMutations = (
  setShowNewFolderDialog: (show: boolean) => void,
  setNewFolderName: (name: string) => void,
  setDeleteDialog: (dialog: { open: boolean; itemName: string; itemId: string }) => void,
  setDeleteConfirmation: (confirmation: string) => void
) => {
  const queryClient = useQueryClient();

  // Mutation for creating new folder
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, workflowStageId, parentId }: { name: string; workflowStageId: string; parentId?: string }) => {
      const folderPath = parentId 
        ? `uploads/nested/${name}`
        : `uploads/${name}`;

      const { data, error } = await supabase
        .from('work_order_items')
        .insert({
          name: name.trim(),
          type: 'folder',
          workflow_stage_id: workflowStageId,
          parent_id: parentId || null,
          file_path: folderPath
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating folder:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success(`Folder "${data.name}" created successfully`);
      setShowNewFolderDialog(false);
      setNewFolderName('');
    },
    onError: (error) => {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    }
  });

  // Mutation for deleting items
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('work_order_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success('Item has been deleted successfully.');
      setDeleteDialog({ open: false, itemName: '', itemId: '' });
      setDeleteConfirmation('');
    },
    onError: (error) => {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  });

  return {
    createFolderMutation,
    deleteItemMutation
  };
};
