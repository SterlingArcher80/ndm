
-- Add image type support to inventory_columns table
-- First, let's see what constraint exists on the type column
ALTER TABLE inventory_columns DROP CONSTRAINT IF EXISTS inventory_columns_type_check;

-- Add a new constraint that includes 'image' as a valid type
ALTER TABLE inventory_columns ADD CONSTRAINT inventory_columns_type_check 
CHECK (type IN ('text', 'number', 'date', 'boolean', 'image'));

-- Create a storage bucket for inventory images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory-images', 'inventory-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for the inventory images bucket using the correct syntax
CREATE POLICY "Allow public access to inventory images" ON storage.objects
FOR ALL USING (bucket_id = 'inventory-images');
