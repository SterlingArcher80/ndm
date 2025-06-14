import React, { useState, useMemo } from 'react';
import { FolderOpen, FileText, Upload, MoreVertical, Eye, Edit, Copy, Trash2, Move, AlertCircle, Search, X, RefreshCw, ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';

interface WorkOrderFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedDate: string;
  status?: string;
  fileType?: 'word' | 'excel' | 'pdf' | 'other';
  subItems?: (WorkOrderFile | WorkOrderFolder)[];
}

interface WorkOrderFolder {
  id: string;
  name: string;
  count: number;
  color: string;
  files: WorkOrderFile[];
}

// MSAL configuration - You'll need to set your actual client and tenant IDs
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID", // Replace with your actual client ID
    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID", // Replace with your tenant ID
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

const WorkOrderRepository = () => {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; itemName: string; itemId: string }>({
    open: false,
    itemName: '',
    itemId: ''
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Sample nested folders for each workflow stage with sub-folders and files
  const workflowFolders = {
    '1': [
      { 
        id: 'f1', 
        name: 'Customer ABC - Project 001', 
        type: 'folder' as const, 
        modifiedDate: '2024-06-10',
        subItems: [
          { id: 'f1-1', name: 'Drawings', type: 'folder' as const, modifiedDate: '2024-06-10' },
          { id: 'f1-2', name: 'Specifications', type: 'folder' as const, modifiedDate: '2024-06-09' },
          { id: 'f1-3', name: 'Work Order.docx', type: 'file' as const, size: '2.3 MB', modifiedDate: '2024-06-10' },
          { id: 'f1-4', name: 'Quote.xlsx', type: 'file' as const, size: '1.1 MB', modifiedDate: '2024-06-09' }
        ]
      },
      { 
        id: 'f2', 
        name: 'Customer XYZ - Repair Job', 
        type: 'folder' as const, 
        modifiedDate: '2024-06-09',
        subItems: [
          { id: 'f2-1', name: 'Photos', type: 'folder' as const, modifiedDate: '2024-06-09' },
          { id: 'f2-2', name: 'Repair Instructions.pdf', type: 'file' as const, size: '890 KB', modifiedDate: '2024-06-09' }
        ]
      },
    ],
    '2': [
      { 
        id: 'f3', 
        name: 'Completed Job - Customer DEF', 
        type: 'folder' as const, 
        modifiedDate: '2024-06-08',
        subItems: [
          { id: 'f3-1', name: 'Final Report.docx', type: 'file' as const, size: '3.2 MB', modifiedDate: '2024-06-08' },
          { id: 'f3-2', name: 'Time Tracking.xlsx', type: 'file' as const, size: '856 KB', modifiedDate: '2024-06-08' }
        ]
      },
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

  // Get current folder contents based on path
  const getCurrentFolderContents = () => {
    if (!selectedFolder) return [];
    
    const workflowFolder = folders.find(f => f.id === selectedFolder);
    if (!workflowFolder) return [];

    let currentItems = workflowFolder.files;
    
    // Navigate through the path to find current folder contents
    for (const pathItem of currentPath) {
      const folderItem = currentItems.find(item => item.id === pathItem && item.type === 'folder') as WorkOrderFile;
      if (folderItem && folderItem.subItems) {
        currentItems = folderItem.subItems as WorkOrderFile[];
      } else {
        return [];
      }
    }
    
    return currentItems;
  };

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

  // Navigation functions
  const navigateToFolder = (folderId: string) => {
    setCurrentPath([...currentPath, folderId]);
  };

  const navigateBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const navigateToRoot = () => {
    setCurrentPath([]);
  };

  // Get breadcrumb path
  const getBreadcrumbPath = () => {
    if (!selectedFolder) return [];
    
    const workflowFolder = folders.find(f => f.id === selectedFolder);
    if (!workflowFolder) return [];

    const breadcrumbs = [{ name: workflowFolder.name, onClick: navigateToRoot }];
    let currentItems = workflowFolder.files;
    
    for (const pathItem of currentPath) {
      const folderItem = currentItems.find(item => item.id === pathItem && item.type === 'folder') as WorkOrderFile;
      if (folderItem) {
        breadcrumbs.push({ 
          name: folderItem.name, 
          onClick: () => setCurrentPath(currentPath.slice(0, currentPath.indexOf(pathItem) + 1))
        });
        if (folderItem.subItems) {
          currentItems = folderItem.subItems as WorkOrderFile[];
        }
      }
    }
    
    return breadcrumbs;
  };

  const authenticateWithMicrosoft = async () => {
    try {
      setIsAuthenticating(true);
      const loginRequest = {
        scopes: ["Files.ReadWrite", "Sites.ReadWrite.All"],
      };

      const response = await msalInstance.loginPopup(loginRequest);
      console.log("Authentication successful:", response);
      return response.accessToken;
    } catch (error) {
      console.error("Authentication failed:", error);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const editInOffice365 = async (file: WorkOrderFile) => {
    try {
      const accessToken = await authenticateWithMicrosoft();
      
      // Here you would implement the logic to:
      // 1. Upload the file to OneDrive
      // 2. Open it in Office 365 online editor
      // This requires Microsoft Graph API calls
      
      console.log(`Opening ${file.name} in Office 365 with token:`, accessToken);
      
      // For now, we'll just open Office 365 online
      window.open('https://office.com', '_blank');
    } catch (error) {
      console.error("Failed to open in Office 365:", error);
    }
  };

  const syncBackFromOneDrive = async (file: WorkOrderFile) => {
    try {
      const accessToken = await authenticateWithMicrosoft();
      
      // Here you would implement the logic to:
      // 1. Download the updated file from OneDrive
      // 2. Replace the local version
      // 3. Delete the file from OneDrive
      
      console.log(`Syncing back ${file.name} from OneDrive`);
      
      // Placeholder for actual implementation
      alert(`${file.name} has been synced back from OneDrive`);
    } catch (error) {
      console.error("Failed to sync back from OneDrive:", error);
    }
  };

  const getFileType = (fileName: string): 'word' | 'excel' | 'pdf' | 'other' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['doc', 'docx'].includes(extension || '')) return 'word';
    if (['xls', 'xlsx'].includes(extension || '')) return 'excel';
    if (extension === 'pdf') return 'pdf';
    return 'other';
  };

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

  const handleDeleteFolder = (folderId: string, folderName: string) => {
    setDeleteDialog({
      open: true,
      itemName: folderName,
      itemId: folderId
    });
    setDeleteConfirmation('');
  };

  const confirmDelete = () => {
    if (deleteConfirmation === 'DELETE') {
      console.log(`Deleting folder: ${deleteDialog.itemId}`);
      // Here you would implement the actual delete logic
      setDeleteDialog({ open: false, itemName: '', itemId: '' });
      setDeleteConfirmation('');
    }
  };

  const handleRenameFolder = (folderId: string) => {
    console.log(`Renaming folder: ${folderId}`);
    // Here you would implement the rename logic
  };

  const handleMoveFolder = (folderId: string) => {
    console.log(`Moving folder: ${folderId}`);
    // Here you would implement the move logic
  };

  const FileContextMenu = ({ file }: { file: WorkOrderFile }) => {
    const fileType = getFileType(file.name);
    const canEditInOffice = fileType === 'word' || fileType === 'excel';

    return (
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
          {canEditInOffice && (
            <DropdownMenuItem 
              className="text-gray-300 hover:bg-gray-700"
              onClick={() => editInOffice365(file)}
              disabled={isAuthenticating}
            >
              <Edit className="mr-2 h-4 w-4" />
              {isAuthenticating ? 'Authenticating...' : 'Edit in Office 365'}
            </DropdownMenuItem>
          )}
          {canEditInOffice && (
            <DropdownMenuItem 
              className="text-gray-300 hover:bg-gray-700"
              onClick={() => syncBackFromOneDrive(file)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Syncback
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-gray-700" />
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
  };

  const FolderContextMenu = ({ folder }: { folder: WorkOrderFile }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-gray-800 border-gray-700">
          <DropdownMenuItem 
            className="text-gray-300 hover:bg-gray-700"
            onClick={() => handleRenameFolder(folder.id)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-gray-300 hover:bg-gray-700"
            onClick={() => handleMoveFolder(folder.id)}
          >
            <Move className="mr-2 h-4 w-4" />
            Move to...
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            className="text-red-400 hover:bg-gray-700"
            onClick={() => handleDeleteFolder(folder.id, folder.name)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const currentContents = getCurrentFolderContents();
  const breadcrumbPath = getBreadcrumbPath();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-950 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Nucleus</h1>
            <p className="text-gray-400 mt-1">DMSI Document Manager</p>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search folders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-white"
                  onClick={() => setSearchQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
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
          <div className="p-4 flex-1 overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4 text-gray-300">Workflow Stages</h2>
            <div className="space-y-2">
              {filteredFolders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedFolder === folder.id
                      ? 'bg-gray-800 border-l-4 border-blue-500'
                      : 'hover:bg-gray-800'
                  }`}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setCurrentPath([]);
                  }}
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
              {/* Breadcrumb Navigation */}
              {breadcrumbPath.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  {currentPath.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigateBack}
                      className="text-gray-400 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {breadcrumbPath.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <button
                          onClick={crumb.onClick}
                          className="hover:text-white transition-colors"
                        >
                          {crumb.name}
                        </button>
                        {index < breadcrumbPath.length - 1 && <span>/</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {breadcrumbPath.length > 0 ? breadcrumbPath[breadcrumbPath.length - 1].name : 'Select a folder'}
                  </h2>
                  <p className="text-gray-400 mt-1">
                    {currentContents.length} items
                    {searchQuery && ` (filtered by "${searchQuery}")`}
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

              {/* File/Folder Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentContents.map((item) => (
                  <Card
                    key={item.id}
                    className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200 cursor-pointer"
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onClick={() => {
                      if (item.type === 'folder') {
                        navigateToFolder(item.id);
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          {item.type === 'folder' ? (
                            <FolderOpen className="h-8 w-8 text-blue-400 mr-3" />
                          ) : (
                            <FileText className="h-8 w-8 text-gray-400 mr-3" />
                          )}
                          <div>
                            <h3 className="font-medium text-white text-sm">{item.name}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {item.size && `${item.size} • `}Modified {item.modifiedDate}
                            </p>
                          </div>
                        </div>
                        {item.type === 'file' ? (
                          <FileContextMenu file={item} />
                        ) : (
                          <FolderContextMenu folder={item} />
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {currentContents.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">
                    {searchQuery ? 'No items match your search' : 'No items in this folder'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? `Try adjusting your search term "${searchQuery}"`
                      : 'Upload files or create folders to get started'
                    }
                  </p>
                  {!searchQuery && (
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Files
                    </Button>
                  )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Folder</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete the folder "{deleteDialog.itemName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-300 mb-2">
              Type <span className="font-bold text-red-400">DELETE</span> to confirm:
            </p>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setDeleteDialog({ open: false, itemName: '', itemId: '' });
                setDeleteConfirmation('');
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteConfirmation !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkOrderRepository;
