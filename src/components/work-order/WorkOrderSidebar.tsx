
import React, { useMemo } from 'react';
import { FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WorkOrderFolder } from './types';
import { useWorkOrderFolders } from './hooks/useWorkOrderFolders';
import { useWorkflowStages } from './hooks/useWorkflowStages';

interface WorkOrderSidebarProps {
  workOrderItems: any[];
  selectedFolder: string | null;
  setSelectedFolder: (id: string) => void;
  setCurrentPath: (path: string[]) => void;
  searchQuery: string;
  currentPath: string[];
}

const WorkOrderSidebar = ({ 
  workOrderItems, 
  selectedFolder, 
  setSelectedFolder, 
  setCurrentPath, 
  searchQuery,
  currentPath
}: WorkOrderSidebarProps) => {
  const { stages, loading: stagesLoading } = useWorkflowStages();
  const { folders } = useWorkOrderFolders(workOrderItems, searchQuery, stages);

  // Calculate folder counts for each workflow stage
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    folders.forEach(folder => {
      const folderCount = folder.files.filter(file => file.type === 'folder').length;
      counts[folder.id] = folderCount;
    });
    
    return counts;
  }, [folders]);

  if (stagesLoading) {
    return (
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Workflow Stages</h2>
          <div className="space-y-2">
            <div className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Workflow Stages</h2>
        <div className="space-y-2">
          {folders.map((folder) => {
            const folderCount = folderCounts[folder.id] || 0;
            return (
              <div
                key={folder.id}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedFolder === folder.id
                    ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                onClick={() => {
                  setSelectedFolder(folder.id);
                  setCurrentPath([]);
                }}
                title={`Upload to: ${folder.folderPath}`}
              >
                <div className={`w-3 h-3 rounded-full ${folder.color} mr-3`}></div>
                <FolderOpen className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{folder.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{folderCount} folders</div>
                </div>
                <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                  {folderCount}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderSidebar;
