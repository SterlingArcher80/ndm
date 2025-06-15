
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

      // Validate file before upload
      if (!file || file.size === 0) {
        throw new Error('Invalid file: File is empty or corrupted');
      }

      if (!workflowStageId) {
        throw new Error('Workflow stage ID is required');
      }

      // Generate unique file name to avoid conflicts
      const fileExtension = file.name.split('.').pop() || 'unknown';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const storagePath = `${workflowStageId}/${fileName}`;

      console.log('Upload path:', storagePath);

      try {
        // Upload file to Supabase Storage first
        const { data: storageData, error: storageError } = await supabase.storage
          .from('work-order-files')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (storageError) {
          console.error('Storage upload error:', storageError);
          throw new Error(`Failed to upload file to storage: ${storageError.message}`);
        }

        if (!storageData || !storageData.path) {
          throw new Error('Storage upload succeeded but no path returned');
        }

        console.log('Storage upload successful:', storageData);

        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('work-order-files')
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;
        console.log('Public URL generated:', publicUrl);

        // Validate that we have a proper URL
        if (!publicUrl || !publicUrl.includes('supabase')) {
          console.error('Invalid public URL generated:', publicUrl);
          // Clean up uploaded file
          await supabase.storage
            .from('work-order-files')
            .remove([storagePath]);
          throw new Error('Failed to generate valid file URL');
        }

        // Verify the URL structure is correct
        const expectedUrlPattern = /https:\/\/[^\/]+\.supabase\.co\/storage\/v1\/object\/public\/work-order-files\/.+/;
        if (!expectedUrlPattern.test(publicUrl)) {
          console.error('URL does not match expected pattern:', publicUrl);
          // Clean up uploaded file
          await supabase.storage
            .from('work-order-files')
            .remove([storagePath]);
          throw new Error('Generated URL has incorrect format');
        }

        // Test the URL accessibility
        try {
          const testResponse = await fetch(publicUrl, { method: 'HEAD' });
          if (!testResponse.ok) {
            console.error('File not accessible at URL:', publicUrl, 'Status:', testResponse.status);
            // Clean up uploaded file
            await supabase.storage
              .from('work-order-files')
              .remove([storagePath]);
            throw new Error(`Uploaded file is not accessible (HTTP ${testResponse.status})`);
          }
        } catch (fetchError) {
          console.error('Error testing file accessibility:', fetchError);
          // Clean up uploaded file
          await supabase.storage
            .from('work-order-files')
            .remove([storagePath]);
          throw new Error('Uploaded file is not accessible');
        }

        // Save file metadata to database only after successful storage upload and validation
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
            file_url: publicUrl,
            mime_type: file.type || 'application/octet-stream'
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

        console.log('Database record created successfully:', dbData);
        console.log('Final file_url in database:', dbData.file_url);
        
        return dbData;

      } catch (error) {
        console.error('Upload process failed:', error);
        // Ensure cleanup happens on any error
        try {
          await supabase.storage
            .from('work-order-files')
            .remove([storagePath]);
        } catch (cleanupError) {
          console.error('Failed to cleanup after error:', cleanupError);
        }
        throw error;
      }
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
      const results = await Promise.allSettled(uploadPromises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      if (successful > 0) {
        toast.success(`${successful} file(s) uploaded successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} file(s) failed to upload`);
        console.error('Failed uploads:', results.filter(result => result.status === 'rejected'));
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
      toast.error('Failed to upload files');
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
  if (!mimeType) return 'other';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'word';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'excel';
  if (mimeType.includes('pdf')) return 'pdf';
  return 'other';
};
