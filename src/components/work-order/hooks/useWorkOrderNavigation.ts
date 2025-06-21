
import { useCallback } from 'react';
import { WorkOrderFolder, WorkOrderFile } from '../types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWorkOrderNavigation = (
  folders: WorkOrderFolder[], 
  selectedFolder: string | null, 
  currentPath: string[], 
  setCurrentPath: (path: string[]) => void
) => {
  // Fetch stage sub-folders for navigation context
  const { data: stageSubFolders = [] } = useQuery({
    queryKey: ['workflow-stage-subfolders-navigation'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_items')
        .select('*')
        .eq('type', 'folder')
        .eq('is_stage_subfolder', true)
        .is('parent_id', null);
      
      if (error) throw error;
      return data || [];
    }
  });

  const getCurrentFolderContents = useCallback(() => {
    if (!selectedFolder) return [];
    
    // Check if selectedFolder is a stage sub-folder
    const stageSubFolder = stageSubFolders.find(sf => sf.id === selectedFolder);
    
    if (stageSubFolder) {
      // If we're in a stage sub-folder, get items that belong to this specific sub-folder
      const parentStage = folders.find(f => f.id === stageSubFolder.workflow_stage_id);
      if (!parentStage) return [];
      
      // Filter items that belong to this stage sub-folder
      let currentItems = parentStage.files.filter(item => {
        if (currentPath.length <= 2) {
          // Root level of stage sub-folder - items with parent_id matching the sub-folder
          return item.parent_id === selectedFolder;
        } else {
          // Nested level - items with parent matching current path
          const currentParentId = currentPath[currentPath.length - 1];
          return item.parent_id === currentParentId;
        }
      });
      
      return currentItems;
    } else {
      // Regular workflow stage navigation
      const workflowFolder = folders.find(f => f.id === selectedFolder);
      if (!workflowFolder) return [];

      // Filter items for current folder level
      let currentItems = workflowFolder.files.filter(item => {
        if (currentPath.length === 0) {
          // Root level - items with no parent and not stage sub-folders
          return !item.parent_id && !item.is_stage_subfolder;
        } else {
          // Nested level - items with parent matching current path
          const currentParentId = currentPath[currentPath.length - 1];
          return item.parent_id === currentParentId;
        }
      });
      
      return currentItems;
    }
  }, [folders, selectedFolder, currentPath, stageSubFolders]);

  const navigateToFolder = useCallback((folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
  }, [currentPath, setCurrentPath]);

  const navigateBack = useCallback(() => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  }, [currentPath, setCurrentPath]);

  const navigateToRoot = useCallback(() => {
    // Check if we're in a stage sub-folder context
    const stageSubFolder = stageSubFolders.find(sf => sf.id === selectedFolder);
    if (stageSubFolder) {
      // Reset to the stage sub-folder root
      setCurrentPath([stageSubFolder.workflow_stage_id, selectedFolder]);
    } else {
      // Reset to workflow stage root
      setCurrentPath([]);
    }
  }, [setCurrentPath, selectedFolder, stageSubFolders]);

  const getBreadcrumbPath = useCallback(() => {
    if (!selectedFolder) return [];
    
    // Check if selectedFolder is a stage sub-folder
    const stageSubFolder = stageSubFolders.find(sf => sf.id === selectedFolder);
    
    if (stageSubFolder) {
      // Build breadcrumb for stage sub-folder navigation
      const parentStage = folders.find(f => f.id === stageSubFolder.workflow_stage_id);
      if (!parentStage) return [];
      
      const breadcrumbs = [
        { 
          name: parentStage.name, 
          onClick: () => {
            // Navigate to parent workflow stage
            setCurrentPath([]);
          }
        },
        { 
          name: stageSubFolder.name, 
          onClick: navigateToRoot 
        }
      ];
      
      // Add nested folder breadcrumbs if we're deeper than the stage sub-folder root
      if (currentPath.length > 2) {
        let currentItems = parentStage.files;
        
        for (let i = 2; i < currentPath.length; i++) {
          const folderItem = currentItems.find(item => item.id === currentPath[i] && item.type === 'folder') as WorkOrderFile;
          if (folderItem) {
            breadcrumbs.push({ 
              name: folderItem.name, 
              onClick: () => setCurrentPath(currentPath.slice(0, i + 1))
            });
            if (folderItem.subItems) {
              currentItems = folderItem.subItems as WorkOrderFile[];
            }
          }
        }
      }
      
      return breadcrumbs;
    } else {
      // Regular workflow stage breadcrumb
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
    }
  }, [folders, selectedFolder, currentPath, setCurrentPath, navigateToRoot, stageSubFolders]);

  return {
    getCurrentFolderContents,
    navigateToFolder,
    navigateBack,
    navigateToRoot,
    getBreadcrumbPath
  };
};
