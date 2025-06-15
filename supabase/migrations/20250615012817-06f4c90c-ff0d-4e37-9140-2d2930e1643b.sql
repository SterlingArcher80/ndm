
-- Ensure categories and locations tables exist with proper structure
-- Categories table should already exist, but let's make sure it has all needed columns
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Locations table should already exist, but let's make sure it has all needed columns  
ALTER TABLE public.locations
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create or replace function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON public.locations;  
CREATE TRIGGER update_locations_updated_at
    BEFORE UPDATE ON public.locations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on categories and locations tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Create policies for categories (allow all authenticated users to read/write)
DROP POLICY IF EXISTS "Allow authenticated users full access to categories" ON public.categories;
CREATE POLICY "Allow authenticated users full access to categories"
ON public.categories
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policies for locations (allow all authenticated users to read/write)
DROP POLICY IF EXISTS "Allow authenticated users full access to locations" ON public.locations;
CREATE POLICY "Allow authenticated users full access to locations"
ON public.locations  
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
