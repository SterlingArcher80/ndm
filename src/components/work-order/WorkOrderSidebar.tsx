
import React from 'react';
import { useWorkOrderFolders } from './hooks/useWorkOrderFolders';
import { useWorkflowStages } from './hooks/useWorkflowStages';
import UploadArea from './UploadArea';
import SidebarLoadingState from './sidebar/SidebarLoadingState';
import WorkflowStagesList from './sidebar/WorkflowStagesList';
import { useSidebarLogic, useStageSubFolders } from './sidebar/useSidebarLogic';

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
  const { data: stageSubFolders = [] } = useStageSubFolders();
  
  const { expandedStages, folderCounts, toggleStageExpansion } = useSidebarLogic(
    workOrderItems, 
    stageSubFolders, 
    folders
  );

  const handleStageClick = (stageId: string) => {
    console.log('🔍 Stage clicked:', stageId);
    setSelectedFolder(stageId);
    setCurrentPath([]);
  };

  const handleStageSubFolderClick = (subFolder: any) => {
    console.log('🔍 Stage sub-folder clicked:', subFolder);
    setSelectedFolder(subFolder.id);
    setCurrentPath([subFolder.workflow_stage_id, subFolder.id]);
  };

  if (stagesLoading) {
    return <SidebarLoadingState />;
  }

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Workflow Stages</h2>
        <WorkflowStagesList
          folders={folders}
          folderCounts={folderCounts}
          stageSubFolders={stageSubFolders}
          expandedStages={expandedStages}
          selectedFolder={selectedFolder}
          currentPath={currentPath}
          onStageClick={handleStageClick}
          onToggleExpansion={toggleStageExpansion}
          onStageSubFolderClick={handleStageSubFolderClick}
        />
      </div>
      
      <UploadArea selectedFolder={selectedFolder} currentPath={currentPath} folders={folders} />
    </div>
  );
};

export default WorkOrderSidebar;
