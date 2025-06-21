
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
    console.log('🔎 Search query:', searchQuery);

    // Create folders based on workflow stages from database
    const stageFolders: WorkOrderFolder[] = workflowStages
      .sort((a, b) => a.order_position - b.order_position)
      .map((stage) => {
        // Filter items for this specific workflow stage, INCLUDING stage sub-folders
        const stageItems = workOrderItems.filter(item => {
          const matches = item.workflow_stage_id === stage.id;
          console.log(`🔍 Checking item "${item.name}" (stage: ${item.workflow_stage_id}, is_stage_subfolder: ${item.is_stage_subfolder}) against stage "${stage.id}": ${matches ? 'MATCH' : 'NO MATCH'}`);
          return matches;
        });

        console.log(`📋 Stage "${stage.name}" has ${stageItems.length} items (including stage sub-folders)`);

        // Convert database items to WorkOrderFile format
        const files: WorkOrderFile[] = stageItems.map(item => {
          // Determine the correct folder path based on item type
          let itemFolderPath = `uploads/${stage.name}`;
          
          if (item.is_stage_subfolder) {
            // Stage sub-folders should show their parent stage path
            itemFolderPath = `uploads/${stage.name}`;
          } else if (item.parent_id) {
            // Regular items with parents - find the parent to build the path
            const parentItem = stageItems.find(si => si.id === item.parent_id);
            if (parentItem && parentItem.is_stage_subfolder) {
              // If parent is a stage sub-folder, include it in the path
              itemFolderPath = `uploads/${stage.name}/${parentItem.name}`;
            }
          }

          const convertedFile = {
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
            folderPath: itemFolderPath,
            is_locked: item.is_locked,
            is_stage_subfolder: item.is_stage_subfolder
          };
          
          console.log(`📄 Converted item "${item.name}" to WorkOrderFile with folderPath: ${itemFolderPath}`, convertedFile);
          return convertedFile;
        });

        // Filter files based on search query if provided
        const filteredFiles = searchQuery 
          ? files.filter(file => {
              const matches = file.name.toLowerCase().includes(searchQuery.toLowerCase());
              console.log(`🔎 Search filter "${file.name}" with query "${searchQuery}": ${matches ? 'MATCH' : 'NO MATCH'}`);
              return matches;
            })
          : files;

        const folder: WorkOrderFolder = {
          id: stage.id,
          name: stage.name,
          count: filteredFiles.length,
          color: stage.color,
          files: filteredFiles,
          folderPath: `uploads/${stage.name}`
        };

        console.log(`📁 Created folder for "${stage.name}" with ${filteredFiles.length} files:`, filteredFiles.map(f => f.name));
        return folder;
      });

    console.log('📁 Final generated folders:', stageFolders.map(f => ({ 
      name: f.name, 
      count: f.count, 
      fileNames: f.files.map(file => file.name) 
    })));
    
    return stageFolders;
  }, [workOrderItems, searchQuery, workflowStages]);

  return { folders };
};
