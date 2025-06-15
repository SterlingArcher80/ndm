
import { useCallback } from 'react';
import { WorkOrderFolder, WorkOrderFile } from '../types';

export const useWorkOrderNavigation = (
  folders: WorkOrderFolder[], 
  selectedFolder: string | null, 
  currentPath: string[], 
  setCurrentPath: (path: string[]) => void
) => {
  const getCurrentFolderContents = useCallback(() => {
    if (!selectedFolder) return [];
    
    const workflowFolder = folders.find(f => f.id === selectedFolder);
    if (!workflowFolder) return [];

    // Filter items for current folder level
    let currentItems = workflowFolder.files.filter(item => {
      if (currentPath.length === 0) {
        // Root level - items with no parent
        return !item.parent_id;
      } else {
        // Nested level - items with parent matching current path
        const currentParentId = currentPath[currentPath.length - 1];
        return item.parent_id === currentParentId;
      }
    });
    
    return currentItems;
  }, [folders, selectedFolder, currentPath]);

  const navigateToFolder = useCallback((folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
  }, [currentPath, setCurrentPath]);

  const navigateBack = useCallback(() => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  }, [currentPath, setCurrentPath]);

  const navigateToRoot = useCallback(() => {
    setCurrentPath([]);
  }, [setCurrentPath]);

  const getBreadcrumbPath = useCallback(() => {
    if (!selectedFolder) return [];
    
    const workflowFolder = folders.find(f => f.id === selectedFolder);
    if (!workflowFolder) return [];

    const breadcrumbs = [{ name: workflowFolder.name, onClick: navigateToRoot }];
    let currentItems = workflowFolder.files;
    
    for (const pathItem of currentPath) {
      const folderItem = currentItems.find(item => item.id === pathItem && item.type === 'folder') as WorkOrderFile;
      if (folderItem) {
        breadcrumbs.push({ 
          name: folderItem.name, 
          onClick: () => setCurrentPath(currentPath.slice(0, currentPath.indexOf(pathItem) + 1))
        });
        if (folderItem.subItems) {
          currentItems = folderItem.subItems as WorkOrderFile[];
        }
      }
    }
    
    return breadcrumbs;
  }, [folders, selectedFolder, currentPath, setCurrentPath, navigateToRoot]);

  return {
    getCurrentFolderContents,
    navigateToFolder,
    navigateBack,
    navigateToRoot,
    getBreadcrumbPath
  };
};
