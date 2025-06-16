
-- Remove the old check constraint that expects numeric workflow_stage_id values
ALTER TABLE public.work_order_items DROP CONSTRAINT IF EXISTS work_order_items_workflow_stage_id_check;

-- Add a new constraint that allows any text workflow_stage_id (since we're using string IDs like 'open', 'shipped', etc.)
-- We'll ensure referential integrity through the application logic instead
ALTER TABLE public.work_order_items 
ADD CONSTRAINT work_order_items_workflow_stage_id_not_empty 
CHECK (workflow_stage_id IS NOT NULL AND length(trim(workflow_stage_id)) > 0);

-- Update existing data to use the proper workflow stage IDs
-- Map numeric IDs to their corresponding text IDs based on the workflow_stages table
UPDATE public.work_order_items 
SET workflow_stage_id = CASE 
  WHEN workflow_stage_id = '1' THEN 'open'
  WHEN workflow_stage_id = '2' THEN 'to-be-invoiced'
  WHEN workflow_stage_id = '3' THEN 'invoiced'
  WHEN workflow_stage_id = '4' THEN 'to-be-shipped-1750072786949'
  WHEN workflow_stage_id = '5' THEN 'shipped'
  WHEN workflow_stage_id = '6' THEN 'dropship'
  WHEN workflow_stage_id = '7' THEN 'customer-history'
  ELSE workflow_stage_id
END
WHERE workflow_stage_id IN ('1', '2', '3', '4', '5', '6', '7');
