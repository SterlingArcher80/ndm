
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSidebarLogic = (workOrderItems: any[], stageSubFolders: any[], folders: any[]) => {
  const [expandedStages, setExpandedStages] = React.useState<Set<string>>(new Set());

  // Calculate folder counts for each workflow stage and sub-stage
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    folders.forEach(folder => {
      // Count regular folders (not stage sub-folders) for the main workflow stage
      const regularFolders = folder.files.filter(file => 
        file.type === 'folder' && 
        !stageSubFolders.some(sf => sf.id === file.id)
      );
      
      // Get stage sub-folders for this workflow stage
      const stageSubFoldersForStage = stageSubFolders.filter(sf => sf.workflow_stage_id === folder.id);
      
      if (stageSubFoldersForStage.length > 0) {
        // If there are sub-stages, don't show count on the main stage
        counts[folder.id] = 0;
        
        // Calculate counts for each sub-stage
        stageSubFoldersForStage.forEach(subFolder => {
          const subFolderItems = folder.files.filter(file => 
            file.parent_id === subFolder.id && file.type === 'folder'
          );
          counts[subFolder.id] = subFolderItems.length;
        });
      } else {
        // No sub-stages, show count on the main stage
        counts[folder.id] = regularFolders.length;
      }
    });
    
    return counts;
  }, [folders, stageSubFolders]);

  const toggleStageExpansion = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  return {
    expandedStages,
    folderCounts,
    toggleStageExpansion
  };
};

export const useStageSubFolders = () => {
  return useQuery({
    queryKey: ['workflow-stage-subfolders'],
    queryFn: async () => {
      console.log('🔍 Fetching stage sub-folders for sidebar...');
      const { data, error } = await supabase
        .from('work_order_items')
        .select('*')
        .eq('type', 'folder')
        .eq('is_stage_subfolder', true)
        .is('parent_id', null)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching stage sub-folders:', error);
        throw error;
      }
      
      return data || [];
    }
  });
};
