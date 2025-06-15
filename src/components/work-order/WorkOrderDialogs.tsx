
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFolderMutations } from './hooks/useFolderMutations';

interface WorkOrderDialogsProps {
  showNewFolderDialog: boolean;
  setShowNewFolderDialog: (show: boolean) => void;
  newFolderName: string;
  setNewFolderName: (name: string) => void;
  selectedFolder: string | null;
  currentPath: string[];
  deleteDialog: { open: boolean; itemName: string; itemId: string };
  setDeleteDialog: (dialog: { open: boolean; itemName: string; itemId: string }) => void;
  deleteConfirmation: string;
  setDeleteConfirmation: (confirmation: string) => void;
}

const WorkOrderDialogs = ({
  showNewFolderDialog,
  setShowNewFolderDialog,
  newFolderName,
  setNewFolderName,
  selectedFolder,
  currentPath,
  deleteDialog,
  setDeleteDialog,
  deleteConfirmation,
  setDeleteConfirmation
}: WorkOrderDialogsProps) => {
  const { createFolderMutation, deleteItemMutation } = useFolderMutations(
    setShowNewFolderDialog,
    setNewFolderName,
    setDeleteDialog,
    setDeleteConfirmation
  );

  const createNewFolder = () => {
    if (!newFolderName.trim() || !selectedFolder) return;

    const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
    
    createFolderMutation.mutate({
      name: newFolderName,
      workflowStageId: selectedFolder,
      parentId
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmation === 'DELETE') {
      deleteItemMutation.mutate(deleteDialog.itemId);
    }
  };

  return (
    <>
      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Folder</DialogTitle>
            <DialogDescription className="text-gray-300">
              Enter a name for the new folder.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="bg-gray-700 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && createNewFolder()}
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowNewFolderDialog(false);
                setNewFolderName('');
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={createNewFolder}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!newFolderName.trim() || createFolderMutation.isPending}
            >
              {createFolderMutation.isPending ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Item</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete "{deleteDialog.itemName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-300 mb-2">
              Type <span className="font-bold text-red-400">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialog({ open: false, itemName: '', itemId: '' });
                setDeleteConfirmation('');
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteConfirmation !== 'DELETE' || deleteItemMutation.isPending}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {deleteItemMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WorkOrderDialogs;
