
import { useMemo } from 'react';
import { WorkOrderFile, WorkOrderFolder } from '../types';

export const useWorkOrderFolders = (workOrderItems: any[], searchQuery: string) => {
  // Group items by workflow stage and calculate counts
  const workflowFolders = useMemo(() => {
    const grouped: Record<string, WorkOrderFile[]> = {
      '1': [],
      '2': [],
      '3': [],
      '4': [],
      '5': [],
      '6': [],
      '7': [],
    };

    workOrderItems.forEach(item => {
      grouped[item.workflow_stage_id]?.push({
        id: item.id,
        name: item.name,
        type: item.type as 'file' | 'folder',
        size: item.file_size || undefined,
        modifiedDate: new Date(item.updated_at).toLocaleDateString(),
        fileType: item.file_type as any || undefined,
        folderPath: item.file_path || undefined,
        workflow_stage_id: item.workflow_stage_id,
        parent_id: item.parent_id || undefined
      });
    });

    return grouped;
  }, [workOrderItems]);

  const folders: WorkOrderFolder[] = [
    { id: '1', name: 'Open', count: workflowFolders['1']?.length || 0, color: 'bg-blue-600', files: workflowFolders['1'] || [], folderPath: 'uploads/Open' },
    { id: '2', name: 'To be Invoiced', count: workflowFolders['2']?.length || 0, color: 'bg-orange-600', files: workflowFolders['2'] || [], folderPath: 'uploads/To be Invoiced' },
    { id: '3', name: 'Invoiced', count: workflowFolders['3']?.length || 0, color: 'bg-green-600', files: workflowFolders['3'] || [], folderPath: 'uploads/Invoiced' },
    { id: '4', name: 'To be Shipped', count: workflowFolders['4']?.length || 0, color: 'bg-purple-600', files: workflowFolders['4'] || [], folderPath: 'uploads/To be Shipped' },
    { id: '5', name: 'Shipped', count: workflowFolders['5']?.length || 0, color: 'bg-indigo-600', files: workflowFolders['5'] || [], folderPath: 'uploads/Shipped' },
    { id: '6', name: 'Dropship', count: workflowFolders['6']?.length || 0, color: 'bg-pink-600', files: workflowFolders['6'] || [], folderPath: 'uploads/Dropship' },
    { id: '7', name: 'Customer History', count: workflowFolders['7']?.length || 0, color: 'bg-gray-600', files: workflowFolders['7'] || [], folderPath: 'uploads/Customer History' },
  ];

  // Filter folders based on search query
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return folders;
    
    return folders.map(folder => ({
      ...folder,
      files: folder.files.filter(file => 
        file.type === 'folder' && 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
      count: folder.files.filter(file => 
        file.type === 'folder' && 
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).length
    }));
  }, [folders, searchQuery]);

  return { folders, filteredFolders, workflowFolders };
};
