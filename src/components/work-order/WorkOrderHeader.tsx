
import React from 'react';
import { Search, X, Upload, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useWorkOrderActions } from './hooks/useWorkOrderActions';

interface WorkOrderHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedFolder: string | null;
  setShowNewFolderDialog: (show: boolean) => void;
}

const WorkOrderHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  selectedFolder, 
  setShowNewFolderDialog 
}: WorkOrderHeaderProps) => {
  const { handleUploadClick, handleNewFolder } = useWorkOrderActions();

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Nucleus</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">DMSI Document Manager</p>
        </div>
        
        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Search folders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => handleUploadClick(selectedFolder)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Files
          </Button>
          <Button 
            variant="outline" 
            className="border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => handleNewFolder(selectedFolder, setShowNewFolderDialog)}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderHeader;
