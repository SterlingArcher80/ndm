
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useFileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const queryClient = useQueryClient();

  const uploadMultipleFiles = async (
    files: File[], 
    workflowStageId: string, 
    parentId?: string,
    folderPath?: string
  ) => {
    console.log('📤 Starting file upload:', {
      fileCount: files.length,
      workflowStageId,
      parentId,
      folderPath,
      fileNames: files.map(f => f.name)
    });

    const uploadPromises = files.map(async (file, index) => {
      const fileId = `${Date.now()}-${index}-${file.name}`;
      console.log(`📤 Uploading file ${index + 1}/${files.length}: "${file.name}" with ID: ${fileId}`);
      
      try {
        // Create database record first
        const { data: dbRecord, error: dbError } = await supabase
          .from('work_order_items')
          .insert({
            id: fileId,
            name: file.name,
            type: 'file',
            workflow_stage_id: workflowStageId,
            parent_id: parentId,
            file_size: `${(file.size / 1024).toFixed(1)} KB`,
            mime_type: file.type,
            file_type: file.type.split('/')[0],
            file_path: folderPath ? `${folderPath}/${file.name}` : file.name,
            file_url: `placeholder-url-${fileId}`, // Temporary placeholder
            is_stage_subfolder: false
          })
          .select()
          .single();

        if (dbError) {
          console.error(`❌ Database error for "${file.name}":`, dbError);
          throw dbError;
        }

        console.log(`✅ Database record created for "${file.name}":`, dbRecord);

        // Update progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        toast.success(`File "${file.name}" uploaded successfully`);
        return dbRecord;
      } catch (error) {
        console.error(`❌ Upload failed for "${file.name}":`, error);
        toast.error(`Failed to upload "${file.name}"`);
        throw error;
      }
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log('✅ All files uploaded successfully:', results);
      
      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      await queryClient.invalidateQueries({ queryKey: ['workflow-stage-subfolders'] });
      
      toast.success(`Successfully uploaded ${files.length} file(s)`);
      return results;
    } catch (error) {
      console.error('❌ Batch upload failed:', error);
      toast.error('Some files failed to upload');
      throw error;
    } finally {
      // Clear progress
      setUploadProgress({});
    }
  };

  const handleFolderUpload = async (
    items: DataTransferItemList,
    workflowStageId: string,
    parentId?: string,
    folderPath?: string
  ) => {
    console.log('📁 Processing folder upload:', {
      itemCount: items.length,
      workflowStageId,
      parentId,
      folderPath
    });

    // For now, extract files from folder structure and upload them
    const files: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
    }

    console.log(`📁 Extracted ${files.length} files from folder structure`);
    
    if (files.length > 0) {
      return await uploadMultipleFiles(files, workflowStageId, parentId, folderPath);
    } else {
      toast.error('No files found in the dropped folders');
    }
  };

  return {
    uploadMultipleFiles,
    handleFolderUpload,
    uploadProgress
  };
};
