
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWorkOrderFields = () => {
  return useQuery({
    queryKey: ['work-order-fields'],
    queryFn: async () => {
      console.log('Fetching work order fields...');
      const { data, error } = await supabase
        .from('work_order_fields')
        .select('*')
        .order('order_position', { ascending: true });
      
      if (error) {
        console.error('Error fetching work order fields:', error);
        throw error;
      }
      
      console.log('Work order fields fetched:', data);
      return data || [];
    },
  });
};
