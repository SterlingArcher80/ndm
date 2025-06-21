
import React from 'react';
import { FolderOpen, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WorkOrderFolder } from '../types';

interface WorkflowStageItemProps {
  folder: WorkOrderFolder;
  folderCount: number;
  stageSubFolders: any[];
  isExpanded: boolean;
  isSelected: boolean;
  currentPath: string[];
  onStageClick: (stageId: string) => void;
  onToggleExpansion: (stageId: string) => void;
  onStageSubFolderClick: (subFolder: any) => void;
  folderCounts: Record<string, number>;
}

const WorkflowStageItem = ({
  folder,
  folderCount,
  stageSubFolders,
  isExpanded,
  isSelected,
  currentPath,
  onStageClick,
  onToggleExpansion,
  onStageSubFolderClick,
  folderCounts
}: WorkflowStageItemProps) => {
  const hasSubFolders = stageSubFolders.length > 0;

  return (
    <div className="space-y-1">
      {/* Main workflow stage */}
      <div
        className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
          isSelected && currentPath.length === 0
            ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500'
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        title={`Upload to: ${folder.folderPath}`}
      >
        {/* Expand/collapse button */}
        {hasSubFolders && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpansion(folder.id);
            }}
            className="mr-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}
        {!hasSubFolders && <div className="w-5" />}
        
        <div 
          className="flex items-center space-x-3 flex-1"
          onClick={() => onStageClick(folder.id)}
        >
          <div className={`w-3 h-3 rounded-full ${folder.color}`}></div>
          <FolderOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">{folder.name}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {hasSubFolders ? `${stageSubFolders.length} sub-stages` : `${folderCount} folders`}
            </div>
          </div>
          {!hasSubFolders && (
            <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
              {folderCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Stage sub-folders (nested with more indentation) */}
      {hasSubFolders && isExpanded && (
        <div className="ml-10 space-y-1">
          {stageSubFolders.map((subFolder) => {
            const subFolderCount = folderCounts[subFolder.id] || 0;
            
            return (
              <div
                key={subFolder.id}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentPath.length > 1 && currentPath[1] === subFolder.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
                onClick={() => onStageSubFolderClick(subFolder)}
                title={`Stage sub-folder: ${subFolder.name}`}
              >
                <Folder className="h-4 w-4 text-blue-500 mr-2" />
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {subFolder.name}
                  </span>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {subFolderCount} folders
                  </div>
                </div>
                <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 text-xs">
                  {subFolderCount}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WorkflowStageItem;
