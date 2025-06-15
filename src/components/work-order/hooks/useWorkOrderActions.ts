
import { toast } from '@/components/ui/sonner';
import { useFileUpload } from './useFileUpload';

export const useWorkOrderActions = () => {
  const { uploadMultipleFiles } = useFileUpload();

  const handleUploadClick = (selectedFolder: string | null, folderPath?: string) => {
    if (!selectedFolder) {
      toast.error('Please select a workflow stage first');
      return;
    }
    document.getElementById('upload-input')?.click();
  };

  const handleFileUpload = async (
    files: FileList | null, 
    selectedFolder: string | null,
    folderPath?: string
  ) => {
    if (!selectedFolder) {
      toast.error('Please select a workflow stage first');
      return;
    }

    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      await uploadMultipleFiles(
        fileArray, 
        selectedFolder, 
        undefined, 
        folderPath || `uploads/stage-${selectedFolder}`
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
