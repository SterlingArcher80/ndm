
-- Enable RLS on tables that don't have it yet
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_columns ENABLE ROW LEVEL SECURITY;

-- Create policies for categories table
CREATE POLICY "Anyone can view categories" 
  ON public.categories 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Anyone can create categories" 
  ON public.categories 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update categories" 
  ON public.categories 
  FOR UPDATE 
  TO public
  USING (true);

CREATE POLICY "Anyone can delete categories" 
  ON public.categories 
  FOR DELETE 
  TO public
  USING (true);

-- Create policies for locations table
CREATE POLICY "Anyone can view locations" 
  ON public.locations 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Anyone can create locations" 
  ON public.locations 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update locations" 
  ON public.locations 
  FOR UPDATE 
  TO public
  USING (true);

CREATE POLICY "Anyone can delete locations" 
  ON public.locations 
  FOR DELETE 
  TO public
  USING (true);

-- Create policies for inventory_columns table
CREATE POLICY "Anyone can view inventory columns" 
  ON public.inventory_columns 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Anyone can create inventory columns" 
  ON public.inventory_columns 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can update inventory columns" 
  ON public.inventory_columns 
  FOR UPDATE 
  TO public
  USING (true);

CREATE POLICY "Anyone can delete inventory columns" 
  ON public.inventory_columns 
  FOR DELETE 
  TO public
  USING (true);
