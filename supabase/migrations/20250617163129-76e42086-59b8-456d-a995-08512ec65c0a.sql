
-- Create the onedrive_file_tracking table to track files uploaded to OneDrive
CREATE TABLE IF NOT EXISTS public.onedrive_file_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_file_id UUID NOT NULL REFERENCES public.work_order_items(id) ON DELETE CASCADE,
  onedrive_file_id TEXT NOT NULL,
  onedrive_file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  upload_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.onedrive_file_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for the onedrive_file_tracking table
CREATE POLICY "Users can view their own tracking records" 
  ON public.onedrive_file_tracking 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.work_order_items 
      WHERE work_order_items.id = onedrive_file_tracking.original_file_id
    )
  );

CREATE POLICY "Users can create tracking records" 
  ON public.onedrive_file_tracking 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.work_order_items 
      WHERE work_order_items.id = onedrive_file_tracking.original_file_id
    )
  );

CREATE POLICY "Users can delete their own tracking records" 
  ON public.onedrive_file_tracking 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.work_order_items 
      WHERE work_order_items.id = onedrive_file_tracking.original_file_id
    )
  );

-- Create an index for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_onedrive_tracking_original_file_id 
  ON public.onedrive_file_tracking(original_file_id);

CREATE INDEX IF NOT EXISTS idx_onedrive_tracking_onedrive_file_id 
  ON public.onedrive_file_tracking(onedrive_file_id);
