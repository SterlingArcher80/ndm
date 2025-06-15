
-- Create storage bucket for work order files
INSERT INTO storage.buckets (id, name, public)
VALUES ('work-order-files', 'work-order-files', true);

-- Create RLS policies for the storage bucket to allow authenticated users to manage files
CREATE POLICY "Authenticated users can view work order files"
ON storage.objects FOR SELECT
USING (bucket_id = 'work-order-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload work order files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'work-order-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update work order files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'work-order-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete work order files"
ON storage.objects FOR DELETE
USING (bucket_id = 'work-order-files' AND auth.role() = 'authenticated');

-- Add file_url column to work_order_items table to store the storage path
ALTER TABLE public.work_order_items 
ADD COLUMN file_url TEXT;

-- Add mime_type column to better track file types
ALTER TABLE public.work_order_items 
ADD COLUMN mime_type TEXT;
