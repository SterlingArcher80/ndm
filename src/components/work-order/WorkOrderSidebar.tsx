
import React, { useMemo } from 'react';
import { FolderOpen, Folder, ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { WorkOrderFolder } from './types';
import { useWorkOrderFolders } from './hooks/useWorkOrderFolders';
import { useWorkflowStages } from './hooks/useWorkflowStages';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UploadArea from './UploadArea';

interface WorkOrderSidebarProps {
  workOrderItems: any[];
  selectedFolder: string | null;
  setSelectedFolder: (id: string) => void;
  setCurrentPath: (path: string[]) => void;
  searchQuery: string;
  currentPath: string[];
}

const WorkOrderSidebar = ({ 
  workOrderItems, 
  selectedFolder, 
  setSelectedFolder, 
  setCurrentPath, 
  searchQuery,
  currentPath
}: WorkOrderSidebarProps) => {
  const { stages, loading: stagesLoading } = useWorkflowStages();
  const { folders } = useWorkOrderFolders(workOrderItems, searchQuery, stages);
  const [expandedStages, setExpandedStages] = React.useState<Set<string>>(new Set());

  // Fetch stage sub-folders
  const { data: stageSubFolders = [] } = useQuery({
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

  const getStageSubFoldersForStage = (stageId: string) => {
    return stageSubFolders.filter(folder => folder.workflow_stage_id === stageId);
  };

  const toggleStageExpansion = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  const handleStageClick = (stageId: string) => {
    console.log('🔍 Stage clicked:', stageId);
    setSelectedFolder(stageId);
    setCurrentPath([]);
  };

  const handleStageSubFolderClick = (subFolder: any) => {
    console.log('🔍 Stage sub-folder clicked:', subFolder);
    // Set the selected folder to the sub-folder ID
    setSelectedFolder(subFolder.id);
    // Set current path to indicate we're in a stage sub-folder context
    // The path includes the parent stage ID for proper breadcrumb construction
    setCurrentPath([subFolder.workflow_stage_id, subFolder.id]);
  };

  if (stagesLoading) {
    return (
      <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
        <div className="p-4 flex-1 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Workflow Stages</h2>
          <div className="space-y-2">
            <div className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2"></div>
              <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex flex-col">
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Workflow Stages</h2>
        <div className="space-y-2 mb-6">
          {folders.map((folder) => {
            const folderCount = folderCounts[folder.id] || 0;
            const stageSubFolders = getStageSubFoldersForStage(folder.id);
            const isExpanded = expandedStages.has(folder.id);
            const hasSubFolders = stageSubFolders.length > 0;
            
            return (
              <div key={folder.id} className="space-y-1">
                {/* Main workflow stage */}
                <div
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedFolder === folder.id && currentPath.length === 0
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  title={`Upload to: ${folder.folderPath}`}
                >
                  {/* Expand/collapse button */}
                  {hasSubFolders && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStageExpansion(folder.id);
                      }}
                      className="mr-1 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  )}
                  {!hasSubFolders && <div className="w-5" />}
                  
                  <div 
                    className="flex items-center space-x-3 flex-1"
                    onClick={() => handleStageClick(folder.id)}
                  >
                    <div className={`w-3 h-3 rounded-full ${folder.color}`}></div>
                    <FolderOpen className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{folder.name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {hasSubFolders ? `${stageSubFolders.length} sub-stages` : `${folderCount} folders`}
                      </div>
                    </div>
                    {!hasSubFolders && (
                      <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300">
                        {folderCount}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Stage sub-folders (nested with more indentation) */}
                {hasSubFolders && isExpanded && (
                  <div className="ml-8 space-y-1">
                    {stageSubFolders.map((subFolder) => {
                      const subFolderCount = folderCounts[subFolder.id] || 0;
                      
                      return (
                        <div
                          key={subFolder.id}
                          className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                            currentPath.length > 1 && currentPath[1] === subFolder.id
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                          }`}
                          onClick={() => handleStageSubFolderClick(subFolder)}
                          title={`Stage sub-folder: ${subFolder.name}`}
                        >
                          <Folder className="h-4 w-4 text-blue-500 mr-2" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {subFolder.name}
                            </span>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              {subFolderCount} folders
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-300 text-xs">
                            {subFolderCount}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Upload Area moved to sidebar */}
      <UploadArea selectedFolder={selectedFolder} currentPath={currentPath} folders={folders} />
    </div>
  );
};

export default WorkOrderSidebar;
