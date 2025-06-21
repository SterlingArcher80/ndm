
import React, { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import WorkOrderBreadcrumb from './WorkOrderBreadcrumb';
import WorkOrderGrid from './WorkOrderGrid';
import WorkOrderEmptyState from './WorkOrderEmptyState';
import MoveItemDialog from './MoveItemDialog';
import { useWorkOrderNavigation } from './hooks/useWorkOrderNavigation';
import { useWorkOrderFolders } from './hooks/useWorkOrderFolders';
import { useWorkflowStages } from './hooks/useWorkflowStages';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderFile } from './types';

interface WorkOrderMainContentProps {
  workOrderItems: any[];
  selectedFolder: string | null;
  currentPath: string[];
  setCurrentPath: (path: string[]) => void;
  searchQuery: string;
  setDeleteDialog: (dialog: { open: boolean; itemName: string; itemId: string }) => void;
  setShowNewFolderDialog: (show: boolean) => void;
}

const WorkOrderMainContent = ({ 
  workOrderItems, 
  selectedFolder, 
  currentPath, 
  setCurrentPath, 
  searchQuery,
  setDeleteDialog,
  setShowNewFolderDialog
}: WorkOrderMainContentProps) => {
  const [moveDialog, setMoveDialog] = useState<{
    open: boolean;
    item: WorkOrderFile | null;
  }>({ open: false, item: null });

  const { stages } = useWorkflowStages();
  const { folders } = useWorkOrderFolders(workOrderItems, searchQuery, stages);
  
  // Fetch stage sub-folders for context
  const { data: stageSubFolders = [] } = useQuery({
    queryKey: ['workflow-stage-subfolders-main'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_items')
        .select('*')
        .eq('type', 'folder')
        .eq('is_stage_subfolder', true)
        .is('parent_id', null);
      
      if (error) throw error;
      return data || [];
    }
  });
  
  const { 
    getCurrentFolderContents, 
    getBreadcrumbPath, 
    navigateBack, 
    navigateToFolder 
  } = useWorkOrderNavigation(folders, selectedFolder, currentPath, setCurrentPath);

  const currentContents = getCurrentFolderContents();
  const breadcrumbPath = getBreadcrumbPath();

  const handleMoveItem = (item: WorkOrderFile) => {
    setMoveDialog({ open: true, item });
  };

  // Calculate folder count for display
  const folderCount = currentContents.filter(item => item.type === 'folder').length;

  // Determine the current context for header display
  const getCurrentContextName = () => {
    if (!selectedFolder || breadcrumbPath.length === 0) return 'Select a folder';
    
    // Check if we're in a stage sub-folder
    const stageSubFolder = stageSubFolders.find(sf => sf.id === selectedFolder);
    if (stageSubFolder) {
      const parentStage = folders.find(f => f.id === stageSubFolder.workflow_stage_id);
      if (parentStage) {
        return `${parentStage.name} → ${stageSubFolder.name}`;
      }
    }
    
    // Regular workflow stage or nested folder
    return breadcrumbPath[breadcrumbPath.length - 1]?.name || 'Select a folder';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex-1 p-6 overflow-y-auto">
        {selectedFolder ? (
          <div>
            <WorkOrderBreadcrumb 
              breadcrumbPath={breadcrumbPath}
              currentPath={currentPath}
              navigateBack={navigateBack}
            />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {getCurrentContextName()}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {folderCount} folders, {currentContents.length - folderCount} files
                  {searchQuery && ` (filtered by "${searchQuery}")`}
                </p>
              </div>
            </div>

            {currentContents.length > 0 ? (
              <WorkOrderGrid 
                items={currentContents}
                onFolderClick={navigateToFolder}
                onDeleteFolder={setDeleteDialog}
                onDeleteFile={setDeleteDialog}
                onMoveFile={handleMoveItem}
                onMoveFolder={handleMoveItem}
              />
            ) : (
              <WorkOrderEmptyState 
                searchQuery={searchQuery}
                selectedFolder={selectedFolder}
                setShowNewFolderDialog={setShowNewFolderDialog}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <FolderOpen className="h-20 w-20 text-gray-400 dark:text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-400 mb-4">Select a Workflow Stage</h2>
            <p className="text-gray-600 dark:text-gray-500 text-lg">
              Choose a folder from the sidebar to view and manage work orders
            </p>
          </div>
        )}
      </div>

      <MoveItemDialog
        open={moveDialog.open}
        onOpenChange={(open) => setMoveDialog({ open, item: null })}
        item={moveDialog.item}
        folders={folders}
      />
    </div>
  );
};

export default WorkOrderMainContent;
