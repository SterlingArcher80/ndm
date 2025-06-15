import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { WorkOrderFile } from './types';

interface FilePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: WorkOrderFile | null;
}

const FilePreviewDialog = ({ open, onOpenChange, file }: FilePreviewDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!file) return null;

  const getFileType = (fileName: string, mimeType?: string): 'image' | 'video' | 'pdf' | 'word' | 'excel' | 'other' => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (mimeType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '')) {
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
  const fileUrl = file.file_url;

  console.log('File preview debug:', {
    fileName: file.name,
    fileUrl: fileUrl,
    mimeType: file.mime_type,
    fileType: fileType,
    fileId: file.id
  });

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('Failed to load file:', fileUrl);
  };

  const openInNewTab = () => {
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    }
  };

  const downloadFile = () => {
    if (fileUrl) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderPreview = () => {
    if (!fileUrl) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">File URL not available</p>
            <p className="text-xs text-gray-500 mb-4">File ID: {file.id}</p>
            <p className="text-xs text-gray-500">The file may not have been uploaded to storage properly.</p>
          </div>
        </div>
      );
    }

    if (hasError) {
      return (
        <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">Unable to preview this file</p>
            <p className="text-xs text-gray-500 mb-4">URL: {fileUrl}</p>
            <Button onClick={openInNewTab} variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={fileUrl}
              alt={file.name}
              className="max-w-full max-h-96 object-contain"
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
            <video
              src={fileUrl}
              controls
              className="max-w-full max-h-96"
              onLoadedData={handleLoad}
              onError={handleError}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'pdf':
        return (
          <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
              className="w-full h-full"
              title={file.name}
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        );

      case 'word':
        // For Word documents, we'll use Office Online viewer
        const wordViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
        return (
          <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
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
        // For Excel documents, we'll use Office Online viewer
        const excelViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
        return (
          <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
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
          <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold truncate pr-4">
              {file.name}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {fileUrl && (
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
              <Button onClick={() => onOpenChange(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogDescription className="text-sm text-gray-500">
            {(file.file_size || file.size) && `${file.file_size || file.size} • `}Modified {file.modifiedDate}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading preview...</p>
              </div>
            </div>
          )}
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreviewDialog;
