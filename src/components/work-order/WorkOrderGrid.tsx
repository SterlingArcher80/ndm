
import React from 'react';
import { FolderOpen, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { WorkOrderFile } from './types';
import FileContextMenu from './context-menus/FileContextMenu';
import FolderContextMenu from './context-menus/FolderContextMenu';

interface WorkOrderGridProps {
  items: WorkOrderFile[];
  onFolderClick: (folderId: string) => void;
  onDeleteFolder: (dialog: { open: boolean; itemName: string; itemId: string }) => void;
}

const WorkOrderGrid = ({ items, onFolderClick, onDeleteFolder }: WorkOrderGridProps) => {
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card
          key={item.id}
          className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer"
          draggable
          onDragStart={(e) => handleDragStart(e, item.id)}
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
                <FileContextMenu file={item} />
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
