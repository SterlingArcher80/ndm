
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface DeleteColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: {
    id: string;
    name: string;
    label: string;
  } | null;
}

const DeleteColumnDialog = ({ open, onOpenChange, column }: DeleteColumnDialogProps) => {
  const queryClient = useQueryClient();

  const deleteColumnMutation = useMutation({
    mutationFn: async () => {
      if (!column) return;
      
      const { error } = await supabase
        .from('inventory_columns')
        .delete()
        .eq('id', column.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-columns'] });
      toast.success('Column deleted successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Error deleting column:', error);
      toast.error('Failed to delete column');
    },
  });

  const handleDelete = () => {
    deleteColumnMutation.mutate();
  };

  if (!column) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Custom Column</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the column "{column.label}"? This will remove the field from all inventory items and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteColumnMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteColumnMutation.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteColumnDialog;
