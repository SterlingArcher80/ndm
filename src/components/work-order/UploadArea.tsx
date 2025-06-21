
import React, { useCallback, useState } from 'react';
import { Upload, FolderPlus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFileUpload } from './hooks/useFileUpload';
import { useWorkOrderActions } from './hooks/useWorkOrderActions';

interface UploadAreaProps {
  selectedFolder: string | null;
  currentPath: string[];
  folders: any[];
}

const UploadArea = ({ selectedFolder, currentPath, folders }: UploadAreaProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { uploadMultipleFiles, handleFolderUpload } = useFileUpload();
  const { handleUploadClick, handleFileUpload } = useWorkOrderActions();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (!selectedFolder) {
      return;
    }

    const { items } = e.dataTransfer;
    const files = Array.from(e.dataTransfer.files);
    
    console.log('🎯 Drop detected:', {
      itemsCount: items.length,
      filesCount: files.length,
      selectedFolder,
      currentPath
    });

    // Check if we have folder structure (items with webkitGetAsEntry)
    let hasFolders = false;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.webkitGetAsEntry) {
        const entry = item.webkitGetAsEntry();
        if (entry && entry.isDirectory) {
          hasFolders = true;
          break;
        }
      }
    }

    // Determine the correct workflow stage ID and parent ID for drag & drop
    let workflowStageId = selectedFolder;
    let parentId: string | undefined;
    
    // Check if selectedFolder is actually a stage sub-folder ID
    const allStageSubFolders = folders.flatMap(stage => 
      stage.files.filter((item: any) => item.is_stage_subfolder)
    );
    
    const stageSubFolder = allStageSubFolders.find(sf => sf.id === selectedFolder);
    
    if (stageSubFolder) {
      // We're in a stage sub-folder
      workflowStageId = stageSubFolder.workflow_stage_id;
      parentId = selectedFolder; // The sub-folder itself is the parent
    } else {
      // Regular workflow stage navigation
      parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
    }

    const selectedWorkflowFolder = folders.find(f => f.id === workflowStageId);
    let folderPath = selectedWorkflowFolder?.folderPath || `uploads/stage-${workflowStageId}`;
    
    if (stageSubFolder) {
      // For stage sub-folders, include the sub-folder name in the path
      folderPath = `${folderPath}/${stageSubFolder.name}`;
    } else if (currentPath.length > 0 && selectedWorkflowFolder) {
      // Regular nested folder path building
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
      
      folderPath = pathSegments.join('/');
    }

    if (hasFolders) {
      console.log('📁 Folder structure detected, processing...');
      await handleFolderUpload(items, workflowStageId, parentId, folderPath);
    } else if (files.length > 0) {
      console.log('📄 Regular files detected, processing...');
      await handleFileUpload(files, selectedFolder, currentPath, folders);
    } else {
      console.log('⚠️ No valid files or folders detected');
    }
  }, [selectedFolder, currentPath, folders, handleFolderUpload, handleFileUpload]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files, selectedFolder, currentPath, folders);
  }, [selectedFolder, currentPath, folders, handleFileUpload]);

  return (
    <Card 
      className={`border-2 border-dashed transition-all duration-200 ${
        isDragOver 
          ? 'border-primary bg-primary/10' 
          : 'border-border hover:border-primary/50'
      } bg-card`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-8 text-center">
        <div className="flex justify-center items-center mb-4">
          <Upload className={`h-12 w-12 mr-2 ${
            isDragOver ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <FolderPlus className={`h-12 w-12 ${
            isDragOver ? 'text-primary' : 'text-muted-foreground'
          }`} />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Drop files or folders here
        </h3>
        <p className="text-muted-foreground mb-4">
          Support for individual files, folders, and nested folder structures
        </p>
        <div className="space-x-2">
          <Button 
            onClick={() => handleUploadClick(selectedFolder, currentPath, folders)}
            disabled={!selectedFolder}
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose Files
          </Button>
        </div>
        <input
          id="upload-input"
          type="file"
          multiple
          className="hidden"
          onChange={handleInputChange}
          accept="*/*"
        />
      </div>
    </Card>
  );
};

export default UploadArea;
