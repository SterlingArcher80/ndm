
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useBOMFieldMutations } from './hooks/useBOMFieldMutations';

interface DeleteBOMFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: any;
}

const DeleteBOMFieldDialog = ({ open, onOpenChange, field }: DeleteBOMFieldDialogProps) => {
  const { deleteField } = useBOMFieldMutations();

  const handleDelete = async () => {
    if (!field) return;

    try {
      await deleteField.mutateAsync(field.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete BOM Field</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the field "{field?.label}"? This action cannot be undone.
            All data associated with this field will be lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={deleteField.isPending}
          >
            {deleteField.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteBOMFieldDialog;
