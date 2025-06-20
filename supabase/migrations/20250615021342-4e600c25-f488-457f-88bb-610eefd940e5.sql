
-- Create a table to store work order folders and files
CREATE TABLE public.work_order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('file', 'folder')),
  workflow_stage_id TEXT NOT NULL CHECK (workflow_stage_id IN ('1', '2', '3', '4', '5', '6', '7')),
  parent_id UUID REFERENCES public.work_order_items(id) ON DELETE CASCADE,
  file_path TEXT,
  file_size TEXT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.work_order_items ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations for authenticated users
CREATE POLICY "Authenticated users can view work order items" 
  ON public.work_order_items 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create work order items" 
  ON public.work_order_items 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update work order items" 
  ON public.work_order_items 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete work order items" 
  ON public.work_order_items 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create trigger to update the updated_at column
CREATE TRIGGER update_work_order_items_updated_at
  BEFORE UPDATE ON public.work_order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
