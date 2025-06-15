
import { toast } from '@/components/ui/sonner';
import { useFileUpload } from './useFileUpload';

export const useWorkOrderActions = () => {
  const { uploadMultipleFiles } = useFileUpload();

  const handleUploadClick = (
    selectedFolder: string | null, 
    currentPath: string[] = [],
    folders: any[] = []
  ) => {
    if (!selectedFolder) {
      toast.error('Please select a workflow stage first');
      return;
    }
    document.getElementById('upload-input')?.click();
  };

  const handleFileUpload = async (
    files: FileList | null, 
    selectedFolder: string | null,
    currentPath: string[] = [],
    folders: any[] = []
  ) => {
    if (!selectedFolder) {
      toast.error('Please select a workflow stage first');
      return;
    }

    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      
      // Determine parent ID based on current path
      const parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
      
      // Build folder path
      const selectedWorkflowFolder = folders.find(f => f.id === selectedFolder);
      let folderPath = selectedWorkflowFolder?.folderPath || `uploads/stage-${selectedFolder}`;
      
      if (currentPath.length > 0 && selectedWorkflowFolder) {
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
      
      await uploadMultipleFiles(
        fileArray, 
        selectedFolder, 
        parentId,
        folderPath
      );
    }
  };

  const handleNewFolder = (selectedFolder: string | null, setShowNewFolderDialog: (show: boolean) => void) => {
    if (!selectedFolder) {
      toast.error("Please select a workflow stage first");
      return;
    }
    setShowNewFolderDialog(true);
  };

  return {
    handleUploadClick,
    handleFileUpload,
    handleNewFolder
  };
};
