
-- Create table for BOM custom fields configuration
CREATE TABLE public.bom_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'number', 'date', 'boolean', 'select')),
  options TEXT[], -- For select type fields
  is_required BOOLEAN NOT NULL DEFAULT false,
  order_position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for BOMs (Bill of Materials)
CREATE TABLE public.boms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  custom_fields JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for BOM items (links BOMs to inventory items with quantities)
CREATE TABLE public.bom_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bom_id UUID NOT NULL REFERENCES public.boms(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity_required DECIMAL NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bom_id, inventory_item_id) -- Prevent duplicate items in same BOM
);

-- Add BOM reference to work_orders table
ALTER TABLE public.work_orders 
ADD COLUMN bom_id UUID REFERENCES public.boms(id);

-- Add triggers to update updated_at columns
CREATE TRIGGER update_bom_fields_updated_at
  BEFORE UPDATE ON public.bom_fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_boms_updated_at
  BEFORE UPDATE ON public.boms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bom_items_updated_at
  BEFORE UPDATE ON public.bom_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.bom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bom_items ENABLE ROW LEVEL SECURITY;

-- Create policies for BOM fields
CREATE POLICY "Authenticated users can view BOM fields" 
  ON public.bom_fields 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create BOM fields" 
  ON public.bom_fields 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update BOM fields" 
  ON public.bom_fields 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete BOM fields" 
  ON public.bom_fields 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create policies for BOMs
CREATE POLICY "Authenticated users can view BOMs" 
  ON public.boms 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create BOMs" 
  ON public.boms 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update BOMs" 
  ON public.boms 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete BOMs" 
  ON public.boms 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create policies for BOM items
CREATE POLICY "Authenticated users can view BOM items" 
  ON public.bom_items 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create BOM items" 
  ON public.bom_items 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update BOM items" 
  ON public.bom_items 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete BOM items" 
  ON public.bom_items 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
