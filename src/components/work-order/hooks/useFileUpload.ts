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
      console.log('🚀 Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        workflowStageId,
        parentId,
        folderPath
      });

      // Enhanced file validation
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.size === 0) {
        throw new Error('File is empty. Please select a valid file.');
      }

      // Check for reasonable file size limit (100MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('File is too large. Maximum size is 100MB.');
      }

      if (!workflowStageId) {
        throw new Error('Workflow stage ID is required');
      }

      // Validate and sanitize file name
      if (!file.name || file.name.trim().length === 0) {
        throw new Error('File name is invalid');
      }

      // Clean the original file name to remove any problematic characters
      const cleanFileName = file.name
        .replace(/[~$]/g, '') // Remove ~ and $ characters that might cause issues
        .replace(/^\s+|\s+$/g, '') // Trim whitespace
        .replace(/\s+/g, ' '); // Normalize multiple spaces to single space

      console.log('🧹 Cleaned file name:', { original: file.name, cleaned: cleanFileName });

      // Generate unique file name to avoid conflicts while preserving original extension
      const fileExtension = cleanFileName.split('.').pop() || 'unknown';
      const fileBaseName = cleanFileName.substring(0, cleanFileName.lastIndexOf('.')) || cleanFileName;
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const fileName = `${timestamp}-${randomId}.${fileExtension}`;
      const storagePath = `${workflowStageId}/${fileName}`;

      console.log('📁 Upload path:', storagePath);
      console.log('🔍 File details:', {
        originalName: file.name,
        cleanedName: cleanFileName,
        generatedName: fileName,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });

      try {
        // Try to upload directly first, then handle bucket issues if they arise
        console.log('⬆️ Attempting direct storage upload...');
        const { data: storageData, error: storageError } = await supabase.storage
          .from('work-order-files')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        console.log('📤 Storage upload result:', { storageData, storageError });

        // If upload fails due to bucket not found, let's check what's available
        if (storageError) {
          console.error('❌ Storage upload error:', storageError);
          
          // Check available buckets for debugging
          const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
          console.log('🪣 Available buckets after error:', buckets);
          
          if (bucketError) {
            console.error('❌ Error listing buckets:', bucketError);
          }
          
          // If it's a bucket not found error, try to create it via RPC or provide helpful error
          if (storageError.message?.includes('Bucket not found') || storageError.message?.includes('bucket')) {
            throw new Error(`Storage bucket error: ${storageError.message}. Available buckets: ${buckets?.map(b => b.id).join(', ') || 'none'}`);
          }
          
          throw new Error(`Failed to upload file to storage: ${storageError.message}`);
        }

        if (!storageData || !storageData.path) {
          console.error('❌ Storage upload succeeded but no path returned');
          throw new Error('Storage upload succeeded but no path returned');
        }

        console.log('✅ Storage upload successful:', storageData);

        // Get public URL for the uploaded file
        const { data: publicUrlData } = supabase.storage
          .from('work-order-files')
          .getPublicUrl(storagePath);

        const publicUrl = publicUrlData.publicUrl;
        console.log('🔗 Public URL generated:', publicUrl);

        // Validate that we have a proper URL
        if (!publicUrl || !publicUrl.includes('supabase')) {
          console.error('❌ Invalid public URL generated:', publicUrl);
          // Clean up uploaded file
          await supabase.storage
            .from('work-order-files')
            .remove([storagePath]);
          throw new Error('Failed to generate valid file URL');
        }

        // Test the URL accessibility with more detailed error handling
        console.log('🔍 Testing file accessibility...');
        try {
          const testResponse = await fetch(publicUrl, { 
            method: 'HEAD',
            mode: 'no-cors' // This helps with CORS issues
          });
          console.log('🌐 Accessibility test response:', {
            status: testResponse.status,
            statusText: testResponse.statusText,
            type: testResponse.type
          });
        } catch (fetchError) {
          console.warn('⚠️ Could not test file accessibility (this may be normal due to CORS):', fetchError);
          // Don't fail the upload for CORS issues, as the file might still be accessible
        }

        // Save file metadata to database using the cleaned original name
        console.log('💾 Saving to database...');
        const dbPayload = {
          name: cleanFileName, // Use cleaned original name for display
          type: 'file',
          workflow_stage_id: workflowStageId,
          parent_id: parentId || null,
          file_path: folderPath,
          file_size: `${Math.round(file.size / 1024)} KB`,
          file_type: getFileType(file.type),
          file_url: publicUrl,
          mime_type: file.type || 'application/octet-stream'
        };

        console.log('📝 Database payload:', dbPayload);

        const { data: dbData, error: dbError } = await supabase
          .from('work_order_items')
          .insert(dbPayload)
          .select()
          .single();

        if (dbError) {
          console.error('❌ Database insert error:', dbError);
          // Clean up uploaded file if database insert fails
          await supabase.storage
            .from('work-order-files')
            .remove([storagePath]);
          throw new Error(`Failed to save file metadata: ${dbError.message}`);
        }

        console.log('✅ Database record created successfully:', dbData);
        console.log('🎉 Upload completed successfully!');
        
        return dbData;

      } catch (error) {
        console.error('💥 Upload process failed:', error);
        // Ensure cleanup happens on any error
        try {
          console.log('🧹 Attempting cleanup...');
          await supabase.storage
            .from('work-order-files')
            .remove([storagePath]);
          console.log('✅ Cleanup successful');
        } catch (cleanupError) {
          console.error('❌ Failed to cleanup after error:', cleanupError);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success(`File "${data.name}" uploaded successfully`);
    },
    onError: (error) => {
      console.error('❌ Upload mutation failed:', error);
      toast.error(`Failed to upload file: ${error.message}`);
    }
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ name, workflowStageId, parentId }: { name: string; workflowStageId: string; parentId?: string }) => {
      const folderPath = parentId 
        ? `uploads/nested/${name}`
        : `uploads/${name}`;

      console.log(`🗂️ Creating folder: ${name} in stage: ${workflowStageId}${parentId ? ` under parent: ${parentId}` : ''}`);

      const { data, error } = await supabase
        .from('work_order_items')
        .insert({
          name: name.trim(),
          type: 'folder',
          workflow_stage_id: workflowStageId,
          parent_id: parentId || null,
          file_path: folderPath
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating folder:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      console.log(`✅ Folder "${data.name}" created successfully`);
    },
    onError: (error) => {
      console.error('Failed to create folder:', error);
      throw error;
    }
  });

  const uploadMultipleFiles = async (
    files: File[], 
    workflowStageId: string, 
    parentId?: string,
    folderPath?: string
  ) => {
    console.log('📚 Starting multiple file upload:', {
      fileCount: files.length,
      workflowStageId,
      parentId,
      folderPath
    });

    // Filter out invalid files before attempting upload
    const validFiles = files.filter(file => {
      if (!file || file.size === 0) {
        console.warn('⚠️ Skipping invalid file:', file?.name || 'unknown');
        toast.error(`Skipped invalid file: ${file?.name || 'unknown file'}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) {
      toast.error('No valid files to upload');
      return;
    }

    const uploadPromises = validFiles.map(file => 
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
      
      console.log('📊 Upload results:', { successful, failed, total: validFiles.length });
      
      if (successful > 0) {
        toast.success(`${successful} file(s) uploaded successfully`);
      }
      if (failed > 0) {
        toast.error(`${failed} file(s) failed to upload`);
        console.error('❌ Failed uploads:', results.filter(result => result.status === 'rejected'));
      }
    } catch (error) {
      console.error('💥 Failed to upload files:', error);
      toast.error('Failed to upload files');
    }
  };

  const handleFolderUpload = async (
    items: DataTransferItemList,
    workflowStageId: string,
    parentId?: string,
    baseFolderPath?: string
  ) => {
    console.log('📁 Processing folder upload with items:', items.length);
    
    const processedFolders = new Map<string, string>(); // folder path -> folder id
    const filesToUpload: { file: File; parentFolderId?: string; folderPath: string }[] = [];

    // Process all items and build folder structure
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      if (item.kind === 'file') {
        const entry = item.webkitGetAsEntry();
        
        if (entry) {
          await processEntry(entry, workflowStageId, parentId, baseFolderPath || `uploads/stage-${workflowStageId}`);
        }
      }
    }

    async function processEntry(
      entry: any,
      workflowStageId: string,
      currentParentId?: string,
      currentPath?: string
    ) {
      if (entry.isFile) {
        // Handle file
        entry.file((file: File) => {
          filesToUpload.push({
            file,
            parentFolderId: currentParentId,
            folderPath: currentPath || `uploads/stage-${workflowStageId}`
          });
        });
      } else if (entry.isDirectory) {
        // Handle directory
        const folderKey = `${currentParentId || 'root'}_${entry.name}`;
        
        if (!processedFolders.has(folderKey)) {
          try {
            const folderData = await createFolderMutation.mutateAsync({
              name: entry.name,
              workflowStageId,
              parentId: currentParentId
            });
            
            processedFolders.set(folderKey, folderData.id);
            console.log(`📂 Created folder: ${entry.name} with ID: ${folderData.id}`);
          } catch (error) {
            console.error(`❌ Failed to create folder ${entry.name}:`, error);
            return;
          }
        }

        const folderId = processedFolders.get(folderKey);
        const reader = entry.createReader();
        
        reader.readEntries(async (entries: any[]) => {
          for (const childEntry of entries) {
            await processEntry(
              childEntry,
              workflowStageId,
              folderId,
              `${currentPath}/${entry.name}`
            );
          }
        });
      }
    }

    // Wait a bit for all entries to be processed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Upload all collected files
    if (filesToUpload.length > 0) {
      console.log(`🚀 Uploading ${filesToUpload.length} files from folders`);
      
      for (const { file, parentFolderId, folderPath } of filesToUpload) {
        try {
          await uploadFileMutation.mutateAsync({
            file,
            workflowStageId,
            parentId: parentFolderId,
            folderPath
          });
        } catch (error) {
          console.error(`❌ Failed to upload file ${file.name}:`, error);
        }
      }
      
      toast.success(`Successfully processed folder structure with ${filesToUpload.length} files`);
    }
  };

  return {
    uploadFileMutation,
    uploadMultipleFiles,
    handleFolderUpload,
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
