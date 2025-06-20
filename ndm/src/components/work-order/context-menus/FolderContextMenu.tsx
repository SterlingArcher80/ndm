
import React from 'react';
import { MoreVertical, Edit, Move, Trash2, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { WorkOrderFile } from '../types';
import { toast } from '@/components/ui/sonner';

interface FolderContextMenuProps {
  folder: WorkOrderFile;
  onDelete: (dialog: { open: boolean; itemName: string; itemId: string }) => void;
  onMove?: (folder: WorkOrderFile) => void;
  onToggleLock?: (folder: WorkOrderFile) => void;
}

const FolderContextMenu = ({ folder, onDelete, onMove, onToggleLock }: FolderContextMenuProps) => {
  const handleRename = () => {
    console.log(`Renaming folder: ${folder.id}`);
    toast.info("Rename functionality coming soon");
  };

  const handleMove = () => {
    if (onMove) {
      onMove(folder);
    } else {
      console.log(`Moving folder: ${folder.id}`);
      toast.info("Move functionality coming soon");
    }
  };

  const handleToggleLock = () => {
    if (onToggleLock) {
      onToggleLock(folder);
    } else {
      console.log(`Toggling lock for folder: ${folder.id}`);
      toast.info("Lock functionality coming soon");
    }
  };

  const handleDelete = () => {
    if (folder.is_locked) {
      toast.error("Cannot delete a locked folder. Please unlock it first.");
      return;
    }
    
    onDelete({
      open: true,
      itemName: folder.name,
      itemId: folder.id
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <DropdownMenuItem 
          className="text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleRename}
        >
          <Edit className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            handleMove();
          }}
        >
          <Move className="mr-2 h-4 w-4" />
          Move to...
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleLock();
          }}
        >
          {folder.is_locked ? (
            <>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Lock
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem 
          className={`${folder.is_locked ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 dark:text-red-400'} hover:bg-gray-100 dark:hover:bg-gray-700`}
          onClick={handleDelete}
          disabled={folder.is_locked}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FolderContextMenu;
