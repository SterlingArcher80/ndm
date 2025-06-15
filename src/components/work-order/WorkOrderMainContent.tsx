
import React, { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import WorkOrderBreadcrumb from './WorkOrderBreadcrumb';
import WorkOrderGrid from './WorkOrderGrid';
import WorkOrderEmptyState from './WorkOrderEmptyState';
import UploadArea from './UploadArea';
import MoveItemDialog from './MoveItemDialog';
import { useWorkOrderNavigation } from './hooks/useWorkOrderNavigation';
import { useWorkOrderFolders } from './hooks/useWorkOrderFolders';
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

  const { folders } = useWorkOrderFolders(workOrderItems, searchQuery);
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
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
                <h2 className="text-xl font-semibold text-white">
                  {breadcrumbPath.length > 0 ? breadcrumbPath[breadcrumbPath.length - 1].name : 'Select a folder'}
                </h2>
                <p className="text-gray-400 mt-1">
                  {currentContents.length} items
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
            <FolderOpen className="h-20 w-20 text-gray-600 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-400 mb-4">Select a Workflow Stage</h2>
            <p className="text-gray-500 text-lg">
              Choose a folder from the sidebar to view and manage work orders
            </p>
          </div>
        )}
      </div>
      
      <UploadArea 
        selectedFolder={selectedFolder}
        folders={folders}
        currentPath={currentPath}
      />

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
