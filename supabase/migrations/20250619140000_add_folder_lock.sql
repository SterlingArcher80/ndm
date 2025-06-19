
-- Add is_locked column to work_order_items table
ALTER TABLE public.work_order_items 
ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT false;

-- Create index for performance
CREATE INDEX idx_work_order_items_is_locked ON public.work_order_items(is_locked);
