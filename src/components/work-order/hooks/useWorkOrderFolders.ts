
import { useMemo } from 'react';
import { WorkOrderFile, WorkOrderFolder } from '../types';

interface WorkflowStage {
  id: string;
  name: string;
  color: string;
  order_position: number;
}

export const useWorkOrderFolders = (
  workOrderItems: any[], 
  searchQuery: string,
  workflowStages: WorkflowStage[] = []
) => {
  const folders = useMemo(() => {
    // Don't process if stages haven't loaded yet
    if (!workflowStages || workflowStages.length === 0) {
      console.log('⏳ Waiting for workflow stages to load...');
      return [];
    }

    console.log('🔍 Processing work order folders with stages:', workflowStages);
    console.log('📋 Work order items to process:', workOrderItems);

    // Create folders based on workflow stages from database
    const stageFolders: WorkOrderFolder[] = workflowStages
      .sort((a, b) => a.order_position - b.order_position)
      .map((stage) => {
        // Filter items for this specific workflow stage
        const stageItems = workOrderItems.filter(item => {
          console.log(`🔍 Checking item ${item.name} with workflow_stage_id: "${item.workflow_stage_id}" against stage: "${stage.id}"`);
          return item.workflow_stage_id === stage.id;
        });

        console.log(`📋 Stage ${stage.name} has ${stageItems.length} items`);

        // Convert database items to WorkOrderFile format
        const files: WorkOrderFile[] = stageItems.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as 'file' | 'folder',
          size: item.file_size,
          file_size: item.file_size,
          modifiedDate: new Date(item.updated_at).toLocaleDateString(),
          workflow_stage_id: item.workflow_stage_id,
          parent_id: item.parent_id,
          file_url: item.file_url,
          mime_type: item.mime_type,
          file_path: item.file_path,
          fileType: item.file_type || 'other',
          folderPath: `uploads/${stage.name}`
        }));

        // Filter files based on search query if provided
        const filteredFiles = searchQuery 
          ? files.filter(file => 
              file.name.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : files;

        const folder: WorkOrderFolder = {
          id: stage.id,
          name: stage.name,
          count: filteredFiles.length,
          color: stage.color,
          files: filteredFiles,
          folderPath: `uploads/${stage.name}`
        };

        console.log(`📁 Created folder for ${stage.name} with ${filteredFiles.length} files`);
        return folder;
      });

    console.log('📁 Generated folders:', stageFolders.map(f => ({ name: f.name, count: f.count })));
    return stageFolders;
  }, [workOrderItems, searchQuery, workflowStages]);

  return { folders };
};
