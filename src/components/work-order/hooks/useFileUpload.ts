
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const useFileUpload = () => {
  const queryClient = useQueryClient();

  const uploadFileMutation = useMutation({
    mutationFn: async ({ 
      file, 
      workflowStageId, 
      parentId,
      folderPath 
    }: { 
      file: File; 
      workflowStageId: string; 
      parentId?: string;
      folderPath: string;
    }) => {
      console.log('Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        workflowStageId,
        parentId,
        folderPath
      });

      // Generate unique file name to avoid conflicts
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const storagePath = `${workflowStageId}/${fileName}`;

      console.log('Upload path:', storagePath);

      // Upload file to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('work-order-files')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Storage upload error:', storageError);
        throw new Error(`Failed to upload file: ${storageError.message}`);
      }

      console.log('Storage upload successful:', storageData);

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('work-order-files')
        .getPublicUrl(storagePath);

      console.log('Public URL generated:', publicUrlData.publicUrl);

      // Save file metadata to database
      const { data: dbData, error: dbError } = await supabase
        .from('work_order_items')
        .insert({
          name: file.name,
          type: 'file',
          workflow_stage_id: workflowStageId,
          parent_id: parentId || null,
          file_path: folderPath,
          file_size: `${Math.round(file.size / 1024)} KB`,
          file_type: getFileType(file.type),
          file_url: publicUrlData.publicUrl,
          mime_type: file.type
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('work-order-files')
          .remove([storagePath]);
        throw new Error(`Failed to save file metadata: ${dbError.message}`);
      }

      console.log('Database record created:', dbData);
      return dbData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success(`File "${data.name}" uploaded successfully`);
    },
    onError: (error) => {
      console.error('Failed to upload file:', error);
      toast.error(`Failed to upload file: ${error.message}`);
    }
  });

  const uploadMultipleFiles = async (
    files: File[], 
    workflowStageId: string, 
    parentId?: string,
    folderPath?: string
  ) => {
    const uploadPromises = files.map(file => 
      uploadFileMutation.mutateAsync({ 
        file, 
        workflowStageId, 
        parentId,
        folderPath: folderPath || `uploads/stage-${workflowStageId}`
      })
    );

    try {
      await Promise.all(uploadPromises);
      toast.success(`${files.length} files uploaded successfully`);
    } catch (error) {
      console.error('Failed to upload some files:', error);
      toast.error('Some files failed to upload');
    }
  };

  return {
    uploadFileMutation,
    uploadMultipleFiles,
    isUploading: uploadFileMutation.isPending
  };
};

// Helper function to determine file type for display
const getFileType = (mimeType: string): 'word' | 'excel' | 'pdf' | 'other' => {
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'excel';
  if (mimeType.includes('pdf')) return 'pdf';
  return 'other';
};
