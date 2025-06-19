
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useInventoryItems = () => {
  return useQuery({
    queryKey: ['inventory-items-for-bom'],
    queryFn: async () => {
      console.log('Fetching inventory items for BOM...');
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name, sku, quantity')
        .order('name');
      
      if (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
      }
      
      console.log('Inventory items fetched:', data);
      return data || [];
    },
  });
};
