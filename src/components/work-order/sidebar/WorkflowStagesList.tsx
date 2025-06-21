
import React from 'react';
import { WorkOrderFolder } from '../types';
import WorkflowStageItem from './WorkflowStageItem';

interface WorkflowStagesListProps {
  folders: WorkOrderFolder[];
  folderCounts: Record<string, number>;
  stageSubFolders: any[];
  expandedStages: Set<string>;
  selectedFolder: string | null;
  currentPath: string[];
  onStageClick: (stageId: string) => void;
  onToggleExpansion: (stageId: string) => void;
  onStageSubFolderClick: (subFolder: any) => void;
}

const WorkflowStagesList = ({
  folders,
  folderCounts,
  stageSubFolders,
  expandedStages,
  selectedFolder,
  currentPath,
  onStageClick,
  onToggleExpansion,
  onStageSubFolderClick
}: WorkflowStagesListProps) => {
  const getStageSubFoldersForStage = (stageId: string) => {
    return stageSubFolders.filter(folder => folder.workflow_stage_id === stageId);
  };

  return (
    <div className="space-y-2 mb-6">
      {folders.map((folder) => {
        const folderCount = folderCounts[folder.id] || 0;
        const stageSubFoldersForStage = getStageSubFoldersForStage(folder.id);
        const isExpanded = expandedStages.has(folder.id);
        const isSelected = selectedFolder === folder.id;
        
        return (
          <WorkflowStageItem
            key={folder.id}
            folder={folder}
            folderCount={folderCount}
            stageSubFolders={stageSubFoldersForStage}
            isExpanded={isExpanded}
            isSelected={isSelected}
            currentPath={currentPath}
            onStageClick={onStageClick}
            onToggleExpansion={onToggleExpansion}
            onStageSubFolderClick={onStageSubFolderClick}
            folderCounts={folderCounts}
          />
        );
      })}
    </div>
  );
};

export default WorkflowStagesList;
