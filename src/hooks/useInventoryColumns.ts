
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInventoryColumns = () => {
  return useQuery({
    queryKey: ['inventory-columns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_columns')
        .select('*')
        .order('order_position');
      
      if (error) throw error;
      return data || [];
    },
  });
};

export const useColumnByName = (columnName: string) => {
  const { data: columns } = useInventoryColumns();
  return columns?.find(col => col.name === columnName);
};
