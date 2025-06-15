
import React from 'react';
import { MoreVertical, Eye, Edit, Copy, Move, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { WorkOrderFile } from '../types';
import { useOffice365Integration } from '../hooks/useOffice365Integration';

interface FileContextMenuProps {
  file: WorkOrderFile;
  onDelete?: (dialog: { open: boolean; itemName: string; itemId: string }) => void;
  onMove?: (file: WorkOrderFile) => void;
  onPreview?: (file: WorkOrderFile) => void;
}

const FileContextMenu = ({ file, onDelete, onMove, onPreview }: FileContextMenuProps) => {
  const { editInOffice365, syncBackFromOneDrive } = useOffice365Integration();
  
  const getFileType = (fileName: string): 'word' | 'excel' | 'pdf' | 'other' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['doc', 'docx'].includes(extension || '')) return 'word';
    if (['xls', 'xlsx'].includes(extension || '')) return 'excel';
    if (extension === 'pdf') return 'pdf';
    return 'other';
  };

  const fileType = getFileType(file.name);
  const canEditInOffice = fileType === 'word' || fileType === 'excel';

  const handleDelete = () => {
    if (onDelete) {
      onDelete({
        open: true,
        itemName: file.name,
        itemId: file.id
      });
    }
  };

  const handleMove = () => {
    if (onMove) {
      onMove(file);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(file);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-gray-800 border-gray-700">
        <DropdownMenuItem 
          className="text-gray-300 hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            handlePreview();
          }}
        >
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </DropdownMenuItem>
        {canEditInOffice && (
          <DropdownMenuItem 
            className="text-gray-300 hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              editInOffice365(file);
            }}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit in Office 365
          </DropdownMenuItem>
        )}
        {canEditInOffice && (
          <DropdownMenuItem 
            className="text-gray-300 hover:bg-gray-700"
            onClick={(e) => {
              e.stopPropagation();
              syncBackFromOneDrive(file);
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Syncback
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
          <Copy className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-gray-300 hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            handleMove();
          }}
        >
          <Move className="mr-2 h-4 w-4" />
          Move to...
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-400 hover:bg-gray-700"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FileContextMenu;
