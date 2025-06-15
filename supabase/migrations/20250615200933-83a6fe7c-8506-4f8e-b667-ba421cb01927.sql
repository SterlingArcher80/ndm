
-- Check if the storage bucket exists
SELECT * FROM storage.buckets WHERE id = 'work-order-files';

-- Create or update the storage bucket with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('work-order-files', 'work-order-files', true, 52428800, ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

-- Create RLS policies for the storage bucket (using the correct approach)
DROP POLICY IF EXISTS "Public can view work order files" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload work order files" ON storage.objects;
DROP POLICY IF EXISTS "Public can update work order files" ON storage.objects;
DROP POLICY IF EXISTS "Public can delete work order files" ON storage.objects;

-- Create permissive policies for testing
CREATE POLICY "Public can view work order files"
ON storage.objects FOR SELECT
USING (bucket_id = 'work-order-files');

CREATE POLICY "Public can upload work order files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'work-order-files');

CREATE POLICY "Public can update work order files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'work-order-files');

CREATE POLICY "Public can delete work order files"
ON storage.objects FOR DELETE
USING (bucket_id = 'work-order-files');
