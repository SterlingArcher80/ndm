
export interface WorkOrderFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedDate: string;
  status?: string;
  fileType?: 'word' | 'excel' | 'pdf' | 'other';
  subItems?: (WorkOrderFile | WorkOrderFolder)[];
  folderPath?: string;
  workflow_stage_id: string;
  parent_id?: string;
}

export interface WorkOrderFolder {
  id: string;
  name: string;
  count: number;
  color: string;
  files: WorkOrderFile[];
  folderPath: string;
}
