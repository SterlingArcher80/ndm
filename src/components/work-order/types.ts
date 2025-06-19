
export interface WorkOrderFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  file_size?: string;
  modifiedDate: string;
  status?: string;
  fileType?: 'word' | 'excel' | 'pdf' | 'other';
  subItems?: WorkOrderFile[];
  folderPath?: string;
  workflow_stage_id: string;
  parent_id?: string;
  file_url?: string;
  mime_type?: string;
  file_path?: string;
  is_locked?: boolean;
}

export interface WorkOrderFolder {
  id: string;
  name: string;
  count: number;
  color: string;
  files: WorkOrderFile[];
  folderPath: string;
}
