
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Office365Request {
  action: 'upload' | 'syncback';
  fileId: string;
  fileName: string;
  fileUrl?: string;
  accessToken: string;
}

const supabaseUrl = 'https://tmmtgnjwhpeackuieejd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtbXRnbmp3aHBlYWNrdWllZWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NDAxMzYsImV4cCI6MjA2NTUxNjEzNn0.etAxN3ZQLZcus-UONjGwjp5-uasUKBRp_67wABaawJw';

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('authorization');
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          authorization: authHeader || '',
        },
      },
    });

    const { action, fileId, fileName, fileUrl, accessToken }: Office365Request = await req.json();

    console.log(`Processing ${action} for file: ${fileName}`);

    if (action === 'upload') {
      // Download the file from our storage
      const fileResponse = await fetch(fileUrl!);
      if (!fileResponse.ok) {
        throw new Error('Failed to download file from storage');
      }
      
      const fileBlob = await fileResponse.blob();
      
      // Upload to OneDrive
      const uploadResponse = await fetch('https://graph.microsoft.com/v1.0/me/drive/root:/temp/' + fileName + ':/content', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
        },
        body: fileBlob,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('OneDrive upload error:', errorText);
        throw new Error('Failed to upload file to OneDrive');
      }

      const uploadData = await uploadResponse.json();
      console.log('File uploaded to OneDrive:', uploadData);

      // Create an edit link explicitly
      const editLinkResponse = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${uploadData.id}/createLink`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'edit',
          scope: 'organization'
        }),
      });

      if (!editLinkResponse.ok) {
        const errorText = await editLinkResponse.text();
        console.error('Edit link creation error:', errorText);
        throw new Error('Failed to create edit link');
      }

      const editLinkData = await editLinkResponse.json();
      console.log('Edit link created:', editLinkData);

      // Store the OneDrive file info in our database
      const { error: dbError } = await supabase
        .from('onedrive_file_tracking')
        .insert({
          original_file_id: fileId,
          onedrive_file_id: uploadData.id,
          onedrive_file_path: uploadData.parentReference.path + '/' + uploadData.name,
          file_name: fileName,
          upload_timestamp: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to track file in database');
      }

      // Return the edit link instead of the generic webUrl
      const editUrl = editLinkData.link.webUrl;
      
      return new Response(JSON.stringify({ 
        success: true, 
        oneDriveUrl: editUrl,
        oneDriveFileId: uploadData.id 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (action === 'syncback') {
      // Get the OneDrive file info from our database
      const { data: trackingData, error: trackingError } = await supabase
        .from('onedrive_file_tracking')
        .select('*')
        .eq('original_file_id', fileId)
        .order('upload_timestamp', { ascending: false })
        .limit(1)
        .single();

      if (trackingError || !trackingData) {
        throw new Error('File not found in OneDrive tracking');
      }

      // Get the original file info from work_order_items to get the storage path and MIME type
      const { data: originalFile, error: fileError } = await supabase
        .from('work_order_items')
        .select('file_url, mime_type, workflow_stage_id')
        .eq('id', fileId)
        .single();

      if (fileError || !originalFile) {
        throw new Error('Original file not found in database');
      }

      // Extract the storage path from the file_url
      // file_url format: https://tmmtgnjwhpeackuieejd.supabase.co/storage/v1/object/public/work-order-files/path/to/file
      const urlParts = originalFile.file_url.split('/storage/v1/object/public/work-order-files/');
      if (urlParts.length !== 2) {
        throw new Error('Invalid file URL format');
      }
      const storagePath = urlParts[1];

      console.log('Storage path extracted:', storagePath);

      // Download the updated file from OneDrive
      const downloadResponse = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${trackingData.onedrive_file_id}/content`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!downloadResponse.ok) {
        const errorText = await downloadResponse.text();
        console.error('OneDrive download error:', errorText);
        throw new Error('Failed to download file from OneDrive');
      }

      const updatedFileBlob = await downloadResponse.blob();
      console.log('Downloaded file size:', updatedFileBlob.size);

      // Upload the updated file back to our storage, replacing the original
      const { error: uploadError } = await supabase.storage
        .from('work-order-files')
        .upload(storagePath, updatedFileBlob, {
          upsert: true,
          contentType: originalFile.mime_type || 'application/octet-stream'
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to update file in storage: ${uploadError.message}`);
      }

      console.log('File successfully updated in storage');

      // Update the work_order_items record with the new timestamp
      const { error: updateError } = await supabase
        .from('work_order_items')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', fileId);

      if (updateError) {
        console.error('Failed to update file timestamp:', updateError);
        // Don't throw error here as the file was successfully updated
      } else {
        console.log('File timestamp updated successfully');
      }

      // Delete the file from OneDrive
      const deleteResponse = await fetch(`https://graph.microsoft.com/v1.0/me/drive/items/${trackingData.onedrive_file_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!deleteResponse.ok) {
        console.warn('Failed to delete file from OneDrive, but sync completed');
      } else {
        console.log('File successfully deleted from OneDrive');
      }

      // Remove the tracking record
      const { error: deleteTrackingError } = await supabase
        .from('onedrive_file_tracking')
        .delete()
        .eq('id', trackingData.id);

      if (deleteTrackingError) {
        console.warn('Failed to delete tracking record:', deleteTrackingError);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    throw new Error('Invalid action');

  } catch (error: any) {
    console.error("Error in office365-operations function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
