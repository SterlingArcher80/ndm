import React, { useState } from 'react';
import { FolderOpen, FileText, Upload, MoreVertical, Eye, Edit, Copy, Trash2, Move, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkOrderFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedDate: string;
  status?: string;
}

interface WorkOrderFolder {
  id: string;
  name: string;
  count: number;
  color: string;
  files: WorkOrderFile[];
}

const WorkOrderRepository = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);

  // Sample nested folders for each workflow stage
  const workflowFolders = {
    '1': [
      { id: 'f1', name: 'Customer ABC - Project 001', type: 'folder' as const, modifiedDate: '2024-06-10' },
      { id: 'f2', name: 'Customer XYZ - Repair Job', type: 'folder' as const, modifiedDate: '2024-06-09' },
    ],
    '2': [
      { id: 'f3', name: 'Completed Job - Customer DEF', type: 'folder' as const, modifiedDate: '2024-06-08' },
      { id: 'f4', name: 'Rush Order - Customer GHI', type: 'folder' as const, modifiedDate: '2024-06-07' },
      { id: 'f5', name: 'Standard Service - Customer JKL', type: 'folder' as const, modifiedDate: '2024-06-06' },
    ],
    '3': [
      { id: 'f6', name: 'Invoice Sent - Customer MNO', type: 'folder' as const, modifiedDate: '2024-06-05' },
      { id: 'f7', name: 'Payment Received - Customer PQR', type: 'folder' as const, modifiedDate: '2024-06-04' },
    ],
    '4': [
      { id: 'f8', name: 'Ready to Ship - Customer STU', type: 'folder' as const, modifiedDate: '2024-06-03' },
    ],
    '5': [
      { id: 'f9', name: 'Shipped - Customer VWX', type: 'folder' as const, modifiedDate: '2024-06-02' },
      { id: 'f10', name: 'Delivered - Customer YZA', type: 'folder' as const, modifiedDate: '2024-06-01' },
      { id: 'f11', name: 'Completed - Customer BCD', type: 'folder' as const, modifiedDate: '2024-05-31' },
    ],
    '6': [
      { id: 'f12', name: 'Dropship Order - Vendor EFG', type: 'folder' as const, modifiedDate: '2024-05-30' },
    ],
    '7': [
      { id: 'f13', name: 'Customer HIJ - Historical Records', type: 'folder' as const, modifiedDate: '2024-05-29' },
      { id: 'f14', name: 'Customer KLM - Past Projects', type: 'folder' as const, modifiedDate: '2024-05-28' },
      { id: 'f15', name: 'Customer NOP - Archive', type: 'folder' as const, modifiedDate: '2024-05-27' },
      { id: 'f16', name: 'Customer QRS - Old Jobs', type: 'folder' as const, modifiedDate: '2024-05-26' },
    ],
  };

  const folders: WorkOrderFolder[] = [
    { id: '1', name: 'Open', count: workflowFolders['1']?.length || 0, color: 'bg-blue-600', files: workflowFolders['1'] || [] },
    { id: '2', name: 'To be Invoiced', count: workflowFolders['2']?.length || 0, color: 'bg-orange-600', files: workflowFolders['2'] || [] },
    { id: '3', name: 'Invoiced', count: workflowFolders['3']?.length || 0, color: 'bg-green-600', files: workflowFolders['3'] || [] },
    { id: '4', name: 'To be Shipped', count: workflowFolders['4']?.length || 0, color: 'bg-purple-600', files: workflowFolders['4'] || [] },
    { id: '5', name: 'Shipped', count: workflowFolders['5']?.length || 0, color: 'bg-indigo-600', files: workflowFolders['5'] || [] },
    { id: '6', name: 'Dropship', count: workflowFolders['6']?.length || 0, color: 'bg-pink-600', files: workflowFolders['6'] || [] },
    { id: '7', name: 'Customer History', count: workflowFolders['7']?.length || 0, color: 'bg-gray-600', files: workflowFolders['7'] || [] },
  ];

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== targetId) {
      console.log(`Moving ${draggedItem} to ${targetId}`);
      // Here you would implement the actual move logic
    }
    setDraggedItem(null);
  };

  const handleUploadDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(true);
  };

  const handleUploadDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(false);
  };

  const handleUploadDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverUpload(false);
    
    if (!selectedFolder) {
      setShowUploadPrompt(true);
      setTimeout(() => setShowUploadPrompt(false), 3000);
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    console.log(`Uploading ${files.length} files to workflow stage: ${selectedFolder}`);
    // Here you would implement the actual upload logic
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolder) {
      setShowUploadPrompt(true);
      setTimeout(() => setShowUploadPrompt(false), 3000);
      return;
    }

    if (e.target.files) {
      const files = Array.from(e.target.files);
      console.log(`Uploading ${files.length} files to workflow stage: ${selectedFolder}`);
      // Here you would implement the actual upload logic
    }
  };

  const FileContextMenu = ({ file }: { file: WorkOrderFile }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-gray-800 border-gray-700">
        <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
          <Edit className="mr-2 h-4 w-4" />
          Edit in Office 365
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
          <Copy className="mr-2 h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem className="text-gray-300 hover:bg-gray-700">
          <Move className="mr-2 h-4 w-4" />
          Move to...
        </DropdownMenuItem>
        <DropdownMenuItem className="text-red-400 hover:bg-gray-700">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Work Order Repository</h1>
            <p className="text-gray-400 mt-1">Manage customer work orders from open to delivery</p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
              New Folder
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Folder Structure */}
        <div className="w-80 border-r border-gray-800 bg-gray-950 flex flex-col">
          {/* Workflow Stages */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-300">Workflow Stages</h2>
            <div className="space-y-2">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedFolder === folder.id
                      ? 'bg-gray-800 border-l-4 border-blue-500'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedFolder(folder.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, folder.id)}
                >
                  <div className={`w-3 h-3 rounded-full ${folder.color} mr-3`}></div>
                  <FolderOpen className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <div className="font-medium text-gray-300">{folder.name}</div>
                    <div className="text-sm text-gray-500">{folder.count} folders</div>
                  </div>
                  <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                    {folder.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div className="p-4 border-t border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Upload to Current Stage</h3>
            
            {showUploadPrompt && (
              <Alert className="mb-3 bg-orange-900/50 border-orange-700">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-300 text-sm">
                  Please select a workflow stage first
                </AlertDescription>
              </Alert>
            )}

            <Card 
              className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
                isDragOverUpload 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
              }`}
              onDragOver={handleUploadDragOver}
              onDragLeave={handleUploadDragLeave}
              onDrop={handleUploadDrop}
              onClick={() => document.getElementById('upload-input')?.click()}
            >
              <div className="p-6 text-center">
                <Upload className={`h-8 w-8 mx-auto mb-2 ${
                  isDragOverUpload ? 'text-blue-400' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-300 mb-1">
                  Drop files here
                </p>
                <p className="text-xs text-gray-500">
                  {selectedFolder ? `→ ${folders.find(f => f.id === selectedFolder)?.name}` : 'Select a stage first'}
                </p>
              </div>
            </Card>

            <input
              id="upload-input"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedFolder ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {folders.find(f => f.id === selectedFolder)?.name}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {folders.find(f => f.id === selectedFolder)?.count} folders
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Sort by Date
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Filter
                  </Button>
                </div>
              </div>

              {/* File Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {folders.find(f => f.id === selectedFolder)?.files.map((file) => (
                  <Card
                    key={file.id}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer"
                    draggable
                    onDragStart={(e) => handleDragStart(e, file.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {file.type === 'folder' ? (
                            <FolderOpen className="h-8 w-8 text-blue-400 mr-3" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-400 mr-3" />
                          )}
                          <div>
                            <h3 className="font-medium text-white text-sm">{file.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {file.size && `${file.size} • `}Modified {file.modifiedDate}
                            </p>
                          </div>
                        </div>
                        <FileContextMenu file={file} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {(!folders.find(f => f.id === selectedFolder)?.files || folders.find(f => f.id === selectedFolder)?.files.length === 0) && (
                <div className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No folders yet</h3>
                  <p className="text-gray-500 mb-4">
                    Upload folders or drag them here to get started
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <FolderOpen className="h-20 w-20 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-400 mb-4">Select a Workflow Stage</h2>
              <p className="text-gray-500 text-lg">
                Choose a folder from the sidebar to view and manage work orders
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkOrderRepository;
