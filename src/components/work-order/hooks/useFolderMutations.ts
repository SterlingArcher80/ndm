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

  // Mutation for creating new folder (including sub-folders)
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, workflowStageId, parentId }: { name: string; workflowStageId: string; parentId?: string }) => {
      console.log(`🗂️ Creating folder: ${name} in stage: ${workflowStageId}${parentId ? ` under parent: ${parentId}` : ''}`);

      // If parentId exists, we need to check if it's a stage sub-folder
      let actualWorkflowStageId = workflowStageId;
      
      if (parentId) {
        // Get parent information to determine the correct workflow_stage_id
        const { data: parentData, error: parentError } = await supabase
          .from('work_order_items')
          .select('workflow_stage_id, is_stage_subfolder')
          .eq('id', parentId)
          .single();

        if (parentError) {
          console.error('Error fetching parent data:', parentError);
          throw parentError;
        }

        // If parent is a stage sub-folder, use its workflow_stage_id
        if (parentData?.is_stage_subfolder) {
          actualWorkflowStageId = parentData.workflow_stage_id;
          console.log(`📁 Parent is stage sub-folder, using workflow_stage_id: ${actualWorkflowStageId}`);
        }
      }

      const folderPath = parentId 
        ? `uploads/nested/${name}`
        : `uploads/${name}`;

      const { data, error } = await supabase
        .from('work_order_items')
        .insert({
          name: name.trim(),
          type: 'folder',
          workflow_stage_id: actualWorkflowStageId,
          parent_id: parentId || null,
          file_path: folderPath
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating folder:', error);
        throw error;
      }

      console.log(`✅ Created folder successfully:`, data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stage-subfolders'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-stage-subfolders-main'] });
      const folderType = data.parent_id ? 'Sub-folder' : 'Folder';
      toast.success(`${folderType} "${data.name}" created successfully`);
      setShowNewFolderDialog(false);
      setNewFolderName('');
    },
    onError: (error) => {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    }
  });

  // Mutation for creating sub-folders specifically
  const createSubFolderMutation = useMutation({
    mutationFn: async ({ name, workflowStageId, parentId }: { name: string; workflowStageId: string; parentId: string | null }) => {
      const folderPath = parentId 
        ? `uploads/nested/${workflowStageId}/${name}`
        : `uploads/${workflowStageId}/${name}`;

      console.log(`📁 Creating sub-folder: ${name} in stage: ${workflowStageId}${parentId ? ` under parent: ${parentId}` : ' at root level'}`);

      const { data, error } = await supabase
        .from('work_order_items')
        .insert({
          name: name.trim(),
          type: 'folder',
          workflow_stage_id: workflowStageId,
          parent_id: parentId,
          file_path: folderPath
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating sub-folder:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success(`Sub-folder "${data.name}" created successfully`);
    },
    onError: (error) => {
      console.error('Failed to create sub-folder:', error);
      toast.error('Failed to create sub-folder');
    }
  });

  // Mutation for toggling folder lock status
  const toggleFolderLockMutation = useMutation({
    mutationFn: async ({ folderId, isLocked }: { folderId: string; isLocked: boolean }) => {
      console.log(`${isLocked ? 'Locking' : 'Unlocking'} folder: ${folderId}`);
      
      const { data, error } = await supabase
        .from('work_order_items')
        .update({ is_locked: isLocked } as any) // Temporary type assertion until types are updated
        .eq('id', folderId)
        .select()
        .single();

      if (error) {
        console.error('Error toggling folder lock:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      const isLocked = (data as any).is_locked; // Temporary type assertion until types are updated
      toast.success(`Folder "${data.name}" has been ${isLocked ? 'locked' : 'unlocked'}`);
    },
    onError: (error) => {
      console.error('Failed to toggle folder lock:', error);
      toast.error('Failed to update folder lock status');
    }
  });

  // Mutation for deleting items (including files from storage)
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      // First, get the item details to check if it's a file with storage
      const { data: item, error: fetchError } = await supabase
        .from('work_order_items')
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError) {
        console.error('Error fetching item:', fetchError);
        throw fetchError;
      }

      // Check if folder is locked before allowing deletion
      if (item.type === 'folder' && (item as any).is_locked) { // Temporary type assertion until types are updated
        throw new Error('Cannot delete a locked folder. Please unlock it first.');
      }

      // If it's a file with a storage URL, delete from storage first
      if (item.type === 'file' && item.file_url) {
        // Extract storage path from URL
        const urlParts = item.file_url.split('/');
        const bucketIndex = urlParts.findIndex(part => part === 'work-order-files');
        if (bucketIndex !== -1 && bucketIndex < urlParts.length - 1) {
          const storagePath = urlParts.slice(bucketIndex + 1).join('/');
          
          const { error: storageError } = await supabase.storage
            .from('work-order-files')
            .remove([storagePath]);

          if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Continue with database deletion even if storage deletion fails
          }
        }
      }

      // Delete from database
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
      toast.error(error.message || 'Failed to delete item');
    }
  });

  return {
    createFolderMutation,
    createSubFolderMutation,
    deleteItemMutation,
    toggleFolderLockMutation
  };
};
