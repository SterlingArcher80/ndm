
import { toast } from '@/components/ui/sonner';

export const useWorkOrderActions = () => {
  const handleUploadClick = (selectedFolder: string | null) => {
    if (!selectedFolder) {
      toast.error('Please select a workflow stage first');
      return;
    }
    document.getElementById('upload-input')?.click();
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
    handleNewFolder
  };
};
