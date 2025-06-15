
import React, { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { WorkOrderFolder } from './types';

interface UploadAreaProps {
  selectedFolder: string | null;
  folders: WorkOrderFolder[];
}

const UploadArea = ({ selectedFolder, folders }: UploadAreaProps) => {
  const [isDragOverUpload, setIsDragOverUpload] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);

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
    const selectedWorkflowFolder = folders.find(f => f.id === selectedFolder);
    console.log(`Uploading ${files.length} files to: ${selectedWorkflowFolder?.folderPath}`);
    
    // TODO: Implement file upload to Supabase
    toast.success(`${files.length} file(s) uploaded successfully`);
  };

  const handleUploadClick = () => {
    if (!selectedFolder) {
      setShowUploadPrompt(true);
      setTimeout(() => setShowUploadPrompt(false), 3000);
      return;
    }
    document.getElementById('upload-input')?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedFolder) {
      setShowUploadPrompt(true);
      setTimeout(() => setShowUploadPrompt(false), 3000);
      return;
    }

    if (e.target.files) {
      const files = Array.from(e.target.files);
      const selectedWorkflowFolder = folders.find(f => f.id === selectedFolder);
      console.log(`Uploading ${files.length} files to: ${selectedWorkflowFolder?.folderPath}`);
      
      // TODO: Implement file upload to Supabase
      toast.success(`${files.length} file(s) uploaded successfully`);
    }
    
    // Reset the input
    e.target.value = '';
  };

  return (
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
        onClick={handleUploadClick}
      >
        <div className="p-6 text-center">
          <Upload className={`h-8 w-8 mx-auto mb-2 ${
            isDragOverUpload ? 'text-blue-400' : 'text-gray-400'
          }`} />
          <p className="text-sm text-gray-300 mb-1">
            Drop files here
          </p>
          <p className="text-xs text-gray-500">
            {selectedFolder ? `→ ${folders.find(f => f.id === selectedFolder)?.folderPath}` : 'Select a stage first'}
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
  );
};

export default UploadArea;
