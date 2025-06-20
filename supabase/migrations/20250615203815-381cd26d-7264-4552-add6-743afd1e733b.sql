
-- Create a table for workflow stages
CREATE TABLE public.workflow_stages (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  order_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the default workflow stages
INSERT INTO public.workflow_stages (id, name, color, order_position) VALUES
  ('open', 'Open', 'bg-blue-500', 1),
  ('to-be-invoiced', 'To be Invoiced', 'bg-yellow-500', 2),
  ('shipped', 'Shipped', 'bg-green-500', 3),
  ('invoiced', 'Invoiced', 'bg-purple-500', 4),
  ('customer-history', 'Customer History', 'bg-gray-500', 5),
  ('dropship', 'Dropship', 'bg-red-500', 6);

-- Add trigger for updated_at
CREATE TRIGGER update_workflow_stages_updated_at
  BEFORE UPDATE ON public.workflow_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS (optional - you can make this public if all users should see the same stages)
ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read and modify workflow stages
CREATE POLICY "Allow all authenticated users to manage workflow stages"
  ON public.workflow_stages
  FOR ALL
  USING (true)
  WITH CHECK (true);
