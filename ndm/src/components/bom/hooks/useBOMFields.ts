
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBOMFields = () => {
  return useQuery({
    queryKey: ['bom-fields'],
    queryFn: async () => {
      console.log('Fetching BOM fields...');
      const { data, error } = await supabase
        .from('bom_fields')
        .select('*')
        .order('order_position', { ascending: true });
      
      if (error) {
        console.error('Error fetching BOM fields:', error);
        throw error;
      }
      
      console.log('BOM fields fetched:', data);
      return data || [];
    },
  });
};
