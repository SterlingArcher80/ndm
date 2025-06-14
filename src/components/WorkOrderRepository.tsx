
import React, { useState } from 'react';
import { FolderOpen, FileText, Upload, MoreVertical, Eye, Edit, Copy, Trash2, Move } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

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

  const folders: WorkOrderFolder[] = [
    { id: '1', name: 'Open', count: 12, color: 'bg-blue-600', files: [] },
    { id: '2', name: 'To be Invoiced', count: 8, color: 'bg-orange-600', files: [] },
    { id: '3', name: 'Invoiced', count: 15, color: 'bg-green-600', files: [] },
    { id: '4', name: 'To be Shipped', count: 6, color: 'bg-purple-600', files: [] },
    { id: '5', name: 'Shipped', count: 23, color: 'bg-indigo-600', files: [] },
    { id: '6', name: 'Dropship', count: 4, color: 'bg-pink-600', files: [] },
    { id: '7', name: 'Customer History', count: 156, color: 'bg-gray-600', files: [] },
  ];

  const sampleFiles: WorkOrderFile[] = [
    { id: '1', name: 'Work Order #12345.pdf', type: 'file', size: '2.4 MB', modifiedDate: '2024-06-10' },
    { id: '2', name: 'Customer Specs', type: 'folder', modifiedDate: '2024-06-09' },
    { id: '3', name: 'Invoice Draft.docx', type: 'file', size: '156 KB', modifiedDate: '2024-06-08' },
    { id: '4', name: 'Shipping Label.pdf', type: 'file', size: '89 KB', modifiedDate: '2024-06-07' },
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
        <div className="w-80 border-r border-gray-800 bg-gray-950 p-4 overflow-y-auto">
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
                  <div className="text-sm text-gray-500">{folder.count} items</div>
                </div>
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                  {folder.count}
                </Badge>
              </div>
            ))}
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
                    {folders.find(f => f.id === selectedFolder)?.count} items
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
                {sampleFiles.map((file) => (
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
              {sampleFiles.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">No files yet</h3>
                  <p className="text-gray-500 mb-4">
                    Upload files or drag them here to get started
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
