
-- Create table for custom inventory columns
CREATE TABLE public.inventory_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'number', 'date', 'boolean')),
  is_required BOOLEAN NOT NULL DEFAULT false,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add trigger to update updated_at column
CREATE TRIGGER update_inventory_columns_updated_at
  BEFORE UPDATE ON public.inventory_columns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.inventory_columns ENABLE ROW LEVEL SECURITY;

-- Create policies for inventory columns (allow all authenticated users to manage columns)
CREATE POLICY "Authenticated users can view inventory columns" 
  ON public.inventory_columns 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create inventory columns" 
  ON public.inventory_columns 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update inventory columns" 
  ON public.inventory_columns 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete inventory columns" 
  ON public.inventory_columns 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Add JSONB column to inventory_items for storing custom field values
ALTER TABLE public.inventory_items 
ADD COLUMN custom_fields JSONB DEFAULT '{}';
