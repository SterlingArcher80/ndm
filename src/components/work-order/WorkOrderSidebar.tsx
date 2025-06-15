
import React, { useMemo } from 'react';
import { FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WorkOrderFolder } from './types';
import UploadArea from './UploadArea';
import { useWorkOrderFolders } from './hooks/useWorkOrderFolders';

interface WorkOrderSidebarProps {
  workOrderItems: any[];
  selectedFolder: string | null;
  setSelectedFolder: (id: string) => void;
  setCurrentPath: (path: string[]) => void;
  searchQuery: string;
}

const WorkOrderSidebar = ({ 
  workOrderItems, 
  selectedFolder, 
  setSelectedFolder, 
  setCurrentPath, 
  searchQuery 
}: WorkOrderSidebarProps) => {
  const { folders, filteredFolders } = useWorkOrderFolders(workOrderItems, searchQuery);

  return (
    <div className="w-80 border-r border-gray-800 bg-gray-950 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Workflow Stages</h2>
        <div className="space-y-2">
          {filteredFolders.map((folder) => (
            <div
              key={folder.id}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedFolder === folder.id
                  ? 'bg-gray-800 border-l-4 border-blue-500'
                  : 'hover:bg-gray-800'
              }`}
              onClick={() => {
                setSelectedFolder(folder.id);
                setCurrentPath([]);
              }}
              title={`Upload to: ${folder.folderPath}`}
            >
              <div className={`w-3 h-3 rounded-full ${folder.color} mr-3`}></div>
              <FolderOpen className="h-5 w-5 text-gray-400 mr-3" />
              <div className="flex-1">
                <div className="font-medium text-gray-300">{folder.name}</div>
                <div className="text-sm text-gray-500">{folder.count} items</div>
              </div>
              <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                {folder.count}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <UploadArea selectedFolder={selectedFolder} folders={folders} />
    </div>
  );
};

export default WorkOrderSidebar;
