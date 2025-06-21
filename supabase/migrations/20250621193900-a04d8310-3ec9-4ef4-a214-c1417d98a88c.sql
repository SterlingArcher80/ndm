
-- Add is_stage_subfolder column to work_order_items table to distinguish stage sub-folders
ALTER TABLE public.work_order_items 
ADD COLUMN is_stage_subfolder BOOLEAN NOT NULL DEFAULT false;

-- Add an index for better performance when querying stage sub-folders
CREATE INDEX idx_work_order_items_stage_subfolder 
ON public.work_order_items(workflow_stage_id, is_stage_subfolder) 
WHERE is_stage_subfolder = true;
