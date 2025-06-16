
-- Remove the old check constraint that expects numeric workflow_stage_id values
ALTER TABLE public.work_order_items DROP CONSTRAINT IF EXISTS work_order_items_workflow_stage_id_check;

-- Add a new constraint that allows any text workflow_stage_id (since we're using string IDs like 'open', 'shipped', etc.)
-- We'll ensure referential integrity through the application logic instead
ALTER TABLE public.work_order_items 
ADD CONSTRAINT work_order_items_workflow_stage_id_not_empty 
CHECK (workflow_stage_id IS NOT NULL AND length(trim(workflow_stage_id)) > 0);
