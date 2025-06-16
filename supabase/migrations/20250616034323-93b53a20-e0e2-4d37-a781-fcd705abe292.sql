
-- Create RLS policies for inventory_items table to allow authenticated users to manage inventory

-- Policy to allow authenticated users to view all inventory items
CREATE POLICY "Authenticated users can view inventory items" 
  ON public.inventory_items 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to insert inventory items
CREATE POLICY "Authenticated users can create inventory items" 
  ON public.inventory_items 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Policy to allow authenticated users to update inventory items
CREATE POLICY "Authenticated users can update inventory items" 
  ON public.inventory_items 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Policy to allow authenticated users to delete inventory items
CREATE POLICY "Authenticated users can delete inventory items" 
  ON public.inventory_items 
  FOR DELETE 
  USING (auth.role() = 'authenticated');
