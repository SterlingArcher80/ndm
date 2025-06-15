
import React, { useState } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { WorkOrderFolder } from './types';
import { useFileUpload } from './hooks/useFileUpload';

interface UploadAreaProps {
  selectedFolder: string | null;
  folders: WorkOrderFolder[];
  currentPath: string[];
}

const UploadArea = ({ selectedFolder, folders, currentPath }: UploadAreaProps) => {
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const { uploadMultipleFiles, isUploading } = useFileUpload();

  const getCurrentParentId = () => {
    if (currentPath.length === 0) {
      return undefined; // Root level
    }
    return currentPath[currentPath.length - 1]; // Current folder ID
  };

  const getCurrentFolderPath = () => {
    if (!selectedFolder) return '';
    
    const selectedWorkflowFolder = folders.find(f => f.id === selectedFolder);
    if (!selectedWorkflowFolder) return '';
    
    if (currentPath.length === 0) {
      return selectedWorkflowFolder.folderPath;
    }
    
    // Build nested path based on current navigation
    const pathSegments = [selectedWorkflowFolder.folderPath];
    let currentItems = selectedWorkflowFolder.files;
    
    for (const pathId of currentPath) {
      const folderItem = currentItems.find(item => item.id === pathId && item.type === 'folder');
      if (folderItem) {
        pathSegments.push(folderItem.name);
        if (folderItem.subItems) {
          currentItems = folderItem.subItems;
        }
      }
    }
    
    return pathSegments.join('/');
  };

  const handleUploadDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(true);
  };

  const handleUploadDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(false);
  };

  const handleUploadDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(false);
    
    if (!selectedFolder) {
      setShowUploadPrompt(true);
      setTimeout(() => setShowUploadPrompt(false), 3000);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    const parentId = getCurrentParentId();
    const folderPath = getCurrentFolderPath();
    
    if (files.length > 0) {
      await uploadMultipleFiles(
        files, 
        selectedFolder, 
        parentId,
        folderPath
      );
    }
  };

  const handleUploadClick = () => {
    if (!selectedFolder) {
      setShowUploadPrompt(true);
      setTimeout(() => setShowUploadPrompt(false), 3000);
      return;
    }
    document.getElementById('upload-input')?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolder) {
      setShowUploadPrompt(true);
      setTimeout(() => setShowUploadPrompt(false), 3000);
      return;
    }

    if (e.target.files) {
      const files = Array.from(e.target.files);
      const parentId = getCurrentParentId();
      const folderPath = getCurrentFolderPath();
      
      if (files.length > 0) {
        await uploadMultipleFiles(
          files, 
          selectedFolder, 
          parentId,
          folderPath
        );
      }
    }
    
    // Reset the input
    e.target.value = '';
  };

  const displayPath = getCurrentFolderPath();

  return (
    <div className="p-4 border-t border-gray-800">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Upload to Current Location</h3>
      
      {showUploadPrompt && (
        <Alert className="mb-3 bg-orange-900/50 border-orange-700">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-orange-300 text-sm">
            Please select a workflow stage first
          </AlertDescription>
        </Alert>
      )}

      <Card 
        className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragOverUpload 
            ? 'border-blue-500 bg-blue-500/10' 
            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleUploadDragOver}
        onDragLeave={handleUploadDragLeave}
        onDrop={handleUploadDrop}
        onClick={handleUploadClick}
      >
        <div className="p-6 text-center">
          {isUploading ? (
            <Loader2 className="h-8 w-8 mx-auto mb-2 text-blue-400 animate-spin" />
          ) : (
            <Upload className={`h-8 w-8 mx-auto mb-2 ${
              isDragOverUpload ? 'text-blue-400' : 'text-gray-400'
            }`} />
          )}
          <p className="text-sm text-gray-300 mb-1">
            {isUploading ? 'Uploading files...' : 'Drop files here'}
          </p>
          <p className="text-xs text-gray-500">
            {selectedFolder ? `→ ${displayPath}` : 'Select a stage first'}
          </p>
        </div>
      </Card>

      <input
        id="upload-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
        disabled={isUploading}
      />
    </div>
  );
};

export default UploadArea;
