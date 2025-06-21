
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { WorkOrderFile } from './types';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: WorkOrderFile | null;
}

const FilePreviewDialog = ({ open, onOpenChange, file }: FilePreviewDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const queryClient = useQueryClient();

  // Check if file is in OneDrive and get the latest version
  const { data: oneDriveInfo } = useQuery({
    queryKey: ['onedrive-info', file?.id],
    queryFn: async () => {
      if (!file?.id) return null;
      
      const { data, error } = await supabase
        .from('onedrive_file_tracking')
        .select('*')
        .eq('original_file_id', file.id)
        .order('upload_timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error checking OneDrive status:', error);
        return null;
      }

      return data;
    },
    enabled: !!file?.id && open
  });

  // Update the current file URL based on OneDrive status
  useEffect(() => {
    if (!file) {
      setCurrentFileUrl(null);
      return;
    }

    // If file is in OneDrive, we'll use the original file URL but add a cache-busting parameter
    if (oneDriveInfo) {
      // Add timestamp to break cache for files that might have been updated
      const url = new URL(file.file_url || '');
      url.searchParams.set('t', Date.now().toString());
      setCurrentFileUrl(url.toString());
    } else {
      setCurrentFileUrl(file.file_url || null);
    }
  }, [file, oneDriveInfo]);

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const { error } = await supabase
        .from('work_order_items')
        .delete()
        .eq('id', fileId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success('File record deleted successfully');
      onOpenChange(false);
      setShowDeleteConfirm(false);
    },
    onError: (error) => {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file record');
    }
  });

  const cleanupOrphanedFileMutation = useMutation({
    mutationFn: async (fileId: string) => {
      // Delete the orphaned database record
      const { error } = await supabase
        .from('work_order_items')
        .delete()
        .eq('id', fileId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success('Orphaned file record cleaned up successfully');
      onOpenChange(false);
    },
    onError: (error) => {
      console.error('Failed to cleanup orphaned file:', error);
      toast.error('Failed to cleanup orphaned file record');
    }
  });

  if (!file) return null;

  const getFileType = (fileName: string, mimeType?: string): 'image' | 'video' | 'pdf' | 'word' | 'excel' | 'other' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension || '')) {
      return 'image';
    }
    if (mimeType?.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension || '')) {
      return 'video';
    }
    if (mimeType === 'application/pdf' || extension === 'pdf') {
      return 'pdf';
    }
    if (mimeType?.includes('word') || ['doc', 'docx'].includes(extension || '')) {
      return 'word';
    }
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet') || ['xls', 'xlsx'].includes(extension || '')) {
      return 'excel';
    }
    return 'other';
  };

  const fileType = getFileType(file.name, file.mime_type);
  const isOrphanedFile = !currentFileUrl || !file.mime_type;

  console.log('File preview debug:', {
    fileName: file.name,
    originalFileUrl: file.file_url,
    currentFileUrl: currentFileUrl,
    mimeType: file.mime_type,
    fileType: fileType,
    fileId: file.id,
    hasFileUrl: !!currentFileUrl,
    isOrphanedFile: isOrphanedFile,
    filePath: file.file_path,
    oneDriveInfo: oneDriveInfo
  });

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('Failed to load file:', currentFileUrl);
  };

  const openInNewTab = () => {
    if (currentFileUrl) {
      window.open(currentFileUrl, '_blank');
    }
  };

  const downloadFile = () => {
    if (currentFileUrl) {
      const link = document.createElement('a');
      link.href = currentFileUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteFile = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    deleteFileMutation.mutate(file.id);
  };

  const handleCleanupOrphanedFile = () => {
    if (confirm(`This file record appears to be orphaned (upload failed). Do you want to remove the database record for "${file.name}"?`)) {
      cleanupOrphanedFileMutation.mutate(file.id);
    }
  };

  const refreshPreview = () => {
    setIsLoading(true);
    setHasError(false);
    
    // Force refresh by updating the cache-busting parameter
    if (file.file_url) {
      const url = new URL(file.file_url);
      url.searchParams.set('t', Date.now().toString());
      setCurrentFileUrl(url.toString());
    }
    
    // Also refetch OneDrive info
    queryClient.invalidateQueries({ queryKey: ['onedrive-info', file.id] });
  };

  const renderPreview = () => {
    if (isOrphanedFile) {
      return (
        <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">File Upload Failed</h3>
            <p className="text-gray-600 mb-4">
              This file was not properly uploaded to storage. The database record exists but the file is missing.
            </p>
            
            <div className="space-y-2 text-xs text-left bg-gray-50 p-4 rounded border">
              <p><strong>Debug Information:</strong></p>
              <p>• File name: {file.name}</p>
              <p>• File ID: {file.id}</p>
              <p>• MIME type: {file.mime_type || 'Not set'}</p>
              <p>• File path: {file.file_path || 'Not set'}</p>
              <p>• Storage URL: {currentFileUrl || 'Missing'}</p>
              <p>• Workflow stage: {file.workflow_stage_id}</p>
            </div>

            <div className="flex gap-2 mt-4 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
              <Button 
                onClick={handleCleanupOrphanedFile}
                variant="destructive" 
                size="sm"
                disabled={cleanupOrphanedFileMutation.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {cleanupOrphanedFileMutation.isPending ? 'Cleaning...' : 'Clean Up Record'}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-4">Failed to load preview</p>
            <Button onClick={refreshPreview} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-[500px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            <img
              src={currentFileUrl!}
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              onLoad={handleLoad}
              onError={handleError}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden h-[500px]">
            <video
              src={currentFileUrl!}
              controls
              className="max-w-full max-h-full"
              onLoadedData={handleLoad}
              onError={handleError}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={`${currentFileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );

      case 'word':
        const wordViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentFileUrl!)}`;
        return (
          <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={wordViewerUrl}
              className="w-full h-full"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );

      case 'excel':
        const excelViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(currentFileUrl!)}`;
        return (
          <div className="w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={excelViewerUrl}
              className="w-full h-full"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-[500px] bg-gray-100 rounded-lg">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <Button onClick={openInNewTab} variant="outline">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[800px] max-w-[800px] h-[80vh] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-lg font-semibold truncate">
                    {file.name} {isOrphanedFile && <span className="text-red-500 text-sm">(Upload Failed)</span>}
                    {oneDriveInfo && <span className="text-blue-500 text-sm">(In OneDrive)</span>}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-500 mt-1">
                    {(file.file_size || file.size) && `${file.file_size || file.size} • `}Modified {file.modifiedDate}
                    {isOrphanedFile && <span className="text-red-500 ml-2">• Upload incomplete</span>}
                    {oneDriveInfo && <span className="text-blue-500 ml-2">• Latest version from OneDrive</span>}
                  </DialogDescription>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button onClick={refreshPreview} variant="outline" size="sm">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  {currentFileUrl && !isOrphanedFile && (
                    <>
                      <Button onClick={downloadFile} variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button onClick={openInNewTab} variant="outline" size="sm">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open
                      </Button>
                    </>
                  )}
                  {!isOrphanedFile && (
                    <Button 
                      onClick={handleDeleteFile} 
                      variant="destructive" 
                      size="sm"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  )}
                  <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {renderPreview()}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete "{file?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white border-gray-600 hover:bg-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              disabled={deleteFileMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FilePreviewDialog;
