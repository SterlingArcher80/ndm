
import React, { useState } from 'react';
import { FolderOpen, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { WorkOrderFile } from './types';
import FileContextMenu from './context-menus/FileContextMenu';
import FolderContextMenu from './context-menus/FolderContextMenu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface WorkOrderGridProps {
  items: WorkOrderFile[];
  onFolderClick: (folderId: string) => void;
  onDeleteFolder: (dialog: { open: boolean; itemName: string; itemId: string }) => void;
  onDeleteFile: (dialog: { open: boolean; itemName: string; itemId: string }) => void;
  onMoveFile: (file: WorkOrderFile) => void;
}

const WorkOrderGrid = ({ 
  items, 
  onFolderClick, 
  onDeleteFolder, 
  onDeleteFile, 
  onMoveFile 
}: WorkOrderGridProps) => {
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const moveToFolderMutation = useMutation({
    mutationFn: async ({ itemId, targetFolderId }: { itemId: string; targetFolderId: string }) => {
      const { error } = await supabase
        .from('work_order_items')
        .update({ parent_id: targetFolderId })
        .eq('id', itemId);

      if (error) {
        console.error('Error moving item to folder:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success('Item moved to folder successfully');
    },
    onError: (error) => {
      console.error('Failed to move item to folder:', error);
      toast.error('Failed to move item to folder');
    }
  });

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folderId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault();
    setDragOverFolderId(null);
    
    const draggedItemId = e.dataTransfer.getData('text/plain');
    if (draggedItemId && draggedItemId !== targetFolderId) {
      moveToFolderMutation.mutate({
        itemId: draggedItemId,
        targetFolderId: targetFolderId
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className={`bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer ${
            item.type === 'folder' && dragOverFolderId === item.id 
              ? 'border-blue-500 bg-blue-500/10' 
              : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
          onDragOver={(e) => item.type === 'folder' ? handleDragOver(e, item.id) : undefined}
          onDragLeave={(e) => item.type === 'folder' ? handleDragLeave(e) : undefined}
          onDrop={(e) => item.type === 'folder' ? handleDrop(e, item.id) : undefined}
          onClick={() => {
            if (item.type === 'folder') {
              onFolderClick(item.id);
            }
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                {item.type === 'folder' ? (
                  <FolderOpen className="h-8 w-8 text-blue-400 mr-3" />
                ) : (
                  <FileText className="h-8 w-8 text-gray-400 mr-3" />
                )}
                <div>
                  <h3 className="font-medium text-white text-sm">{item.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {item.size && `${item.size} • `}Modified {item.modifiedDate}
                  </p>
                  {item.folderPath && (
                    <p className="text-xs text-gray-500 mt-1" title={item.folderPath}>
                      Path: {item.folderPath}
                    </p>
                  )}
                </div>
              </div>
              {item.type === 'file' ? (
                <FileContextMenu 
                  file={item} 
                  onDelete={onDeleteFile}
                  onMove={onMoveFile}
                />
              ) : (
                <FolderContextMenu folder={item} onDelete={onDeleteFolder} />
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default WorkOrderGrid;
