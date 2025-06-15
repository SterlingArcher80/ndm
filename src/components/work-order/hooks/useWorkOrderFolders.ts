
import { useMemo } from 'react';
import { WorkOrderFile, WorkOrderFolder } from '../types';

export const useWorkOrderFolders = (workOrderItems: any[], searchQuery: string) => {
  const folders = useMemo(() => {
    const foldersMap = new Map<string, WorkOrderFolder>();
    
    // First pass: create folders
    workOrderItems.forEach(item => {
      const stageId = item.workflow_stage_id;
      if (!foldersMap.has(stageId)) {
        foldersMap.set(stageId, {
          id: stageId,
          name: getStageName(stageId),
          count: 0,
          color: getStageColor(stageId),
          files: [],
          folderPath: getStagePath(stageId)
        });
      }
    });

    // Second pass: add items to folders with proper field mapping
    workOrderItems.forEach(item => {
      const stageId = item.workflow_stage_id;
      const folder = foldersMap.get(stageId);
      
      if (folder) {
        // Map database fields to component properties
        const transformedItem: WorkOrderFile = {
          id: item.id,
          name: item.name,
          type: item.type as 'file' | 'folder',
          size: item.file_size || undefined,
          file_size: item.file_size || undefined,
          modifiedDate: new Date(item.created_at).toLocaleDateString(),
          fileType: mapFileType(item.file_type),
          folderPath: item.file_path,
          workflow_stage_id: item.workflow_stage_id,
          parent_id: item.parent_id,
          file_url: item.file_url,
          mime_type: item.mime_type,
          file_path: item.file_path,
          subItems: []
        };

        folder.files.push(transformedItem);
        if (item.type === 'file') {
          folder.count++;
        }
      }
    });

    // Build nested structure for folders and files
    foldersMap.forEach(folder => {
      folder.files = buildNestedStructure(folder.files);
    });

    // Apply search filter and return filtered folders
    const filteredFolders = Array.from(foldersMap.values());
    if (searchQuery) {
      filteredFolders.forEach(folder => {
        folder.files = filterItems(folder.files, searchQuery);
        folder.count = countFiles(folder.files);
      });
    }

    return filteredFolders;
  }, [workOrderItems, searchQuery]);

  return { folders };
};

function getStageName(stageId: string): string {
  const stageNames: { [key: string]: string } = {
    '1': 'Open',
    '2': 'To be Invoiced',
    '3': 'Shipped',
    '4': 'Invoiced',
    '5': 'Customer History',
    '6': 'Dropship'
  };
  return stageNames[stageId] || `Stage ${stageId}`;
}

function getStageColor(stageId: string): string {
  const stageColors: { [key: string]: string } = {
    '1': 'bg-blue-500',
    '2': 'bg-yellow-500',
    '3': 'bg-green-500',
    '4': 'bg-purple-500',
    '5': 'bg-gray-500',
    '6': 'bg-red-500'
  };
  return stageColors[stageId] || 'bg-gray-500';
}

function getStagePath(stageId: string): string {
  const stagePaths: { [key: string]: string } = {
    '1': 'uploads/Open',
    '2': 'uploads/To be Invoiced',
    '3': 'uploads/Shipped',
    '4': 'uploads/Invoiced',
    '5': 'uploads/Customer History',
    '6': 'uploads/Dropship'
  };
  return stagePaths[stageId] || `uploads/stage-${stageId}`;
}

function mapFileType(fileType: string | null): 'word' | 'excel' | 'pdf' | 'other' {
  if (!fileType) return 'other';
  switch (fileType) {
    case 'word': return 'word';
    case 'excel': return 'excel';
    case 'pdf': return 'pdf';
    default: return 'other';
  }
}

function buildNestedStructure(items: WorkOrderFile[]): WorkOrderFile[] {
  const itemMap = new Map<string, WorkOrderFile>();
  const rootItems: WorkOrderFile[] = [];

  // First pass: create map of all items
  items.forEach(item => {
    itemMap.set(item.id, { ...item, subItems: [] });
  });

  // Second pass: build hierarchy
  items.forEach(item => {
    const mappedItem = itemMap.get(item.id)!;
    
    if (item.parent_id && itemMap.has(item.parent_id)) {
      const parent = itemMap.get(item.parent_id)!;
      if (!parent.subItems) parent.subItems = [];
      parent.subItems.push(mappedItem);
    } else {
      rootItems.push(mappedItem);
    }
  });

  return rootItems;
}

function filterItems(items: WorkOrderFile[], query: string): WorkOrderFile[] {
  const filtered: WorkOrderFile[] = [];
  
  items.forEach(item => {
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase());
    const filteredSubItems = item.subItems ? filterItems(item.subItems as WorkOrderFile[], query) : [];
    
    if (matchesQuery || filteredSubItems.length > 0) {
      filtered.push({
        ...item,
        subItems: filteredSubItems
      });
    }
  });
  
  return filtered;
}

function countFiles(items: WorkOrderFile[]): number {
  return items.reduce((count, item) => {
    if (item.type === 'file') {
      count++;
    }
    if (item.subItems) {
      count += countFiles(item.subItems as WorkOrderFile[]);
    }
    return count;
  }, 0);
}
