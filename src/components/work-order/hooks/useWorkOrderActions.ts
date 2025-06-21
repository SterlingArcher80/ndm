
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
    files: FileList | File[] | null, 
    selectedFolder: string | null,
    currentPath: string[] = [],
    folders: any[] = []
  ) => {
    if (!selectedFolder) {
      toast.error('Please select a workflow stage first');
      return;
    }

    if (files && files.length > 0) {
      // Convert FileList to File[] if needed
      const fileArray = Array.isArray(files) ? files : Array.from(files);
      
      console.log('🔍 Upload context analysis:', {
        selectedFolder,
        currentPath,
        foldersCount: folders.length
      });
      
      // Determine the correct workflow stage ID and parent ID
      let workflowStageId = selectedFolder;
      let parentId: string | undefined;
      
      // Check if selectedFolder is actually a stage sub-folder ID
      const allStageSubFolders = folders.flatMap(stage => 
        stage.files.filter((item: any) => item.is_stage_subfolder)
      );
      
      console.log('🔍 All stage sub-folders:', allStageSubFolders.map(sf => ({ id: sf.id, name: sf.name, workflow_stage_id: sf.workflow_stage_id })));
      
      const stageSubFolder = allStageSubFolders.find(sf => sf.id === selectedFolder);
      console.log('🔍 Found stage sub-folder match:', stageSubFolder);
      
      if (stageSubFolder) {
        // We're in a stage sub-folder, so use its workflow_stage_id as the main stage
        workflowStageId = stageSubFolder.workflow_stage_id;
        parentId = selectedFolder; // The sub-folder itself is the parent
        console.log('🔍 Using stage sub-folder context:', { workflowStageId, parentId });
      } else {
        // Check if selectedFolder is a regular workflow stage
        const workflowStage = folders.find(f => f.id === selectedFolder);
        if (workflowStage) {
          // Regular workflow stage navigation
          workflowStageId = selectedFolder;
          parentId = currentPath.length > 0 ? currentPath[currentPath.length - 1] : undefined;
          console.log('🔍 Using workflow stage context:', { workflowStageId, parentId });
        } else {
          console.error('❌ Could not determine upload context for selectedFolder:', selectedFolder);
          toast.error('Invalid folder selection');
          return;
        }
      }
      
      // Build folder path
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
      
      console.log('📁 Final upload context:', {
        selectedFolder,
        workflowStageId,
        parentId,
        folderPath,
        isStageSubFolder: !!stageSubFolder
      });
      
      await uploadMultipleFiles(
        fileArray, 
        workflowStageId, 
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
