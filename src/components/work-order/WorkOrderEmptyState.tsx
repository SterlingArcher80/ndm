
import React from 'react';
import { FolderOpen, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkOrderActions } from './hooks/useWorkOrderActions';

interface WorkOrderEmptyStateProps {
  searchQuery: string;
  selectedFolder: string | null;
  setShowNewFolderDialog: (show: boolean) => void;
}

const WorkOrderEmptyState = ({ searchQuery, selectedFolder, setShowNewFolderDialog }: WorkOrderEmptyStateProps) => {
  const { handleUploadClick, handleNewFolder } = useWorkOrderActions();

  return (
    <div className="text-center py-12">
      <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-400 mb-2">
        {searchQuery ? 'No items match your search' : 'No items in this folder'}
      </h3>
      <p className="text-gray-500 mb-4">
        {searchQuery 
          ? `Try adjusting your search term "${searchQuery}"`
          : 'Upload files or create folders to get started'
        }
      </p>
      {!searchQuery && (
        <div className="flex gap-2 justify-center">
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => handleUploadClick(selectedFolder)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
            onClick={() => handleNewFolder(selectedFolder, setShowNewFolderDialog)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkOrderEmptyState;
