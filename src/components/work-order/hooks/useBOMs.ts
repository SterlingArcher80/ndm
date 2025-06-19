
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBOMs = () => {
  return useQuery({
    queryKey: ['boms-for-work-orders'],
    queryFn: async () => {
      console.log('Fetching BOMs for work orders...');
      const { data, error } = await supabase
        .from('boms')
        .select('id, name, version, status')
        .eq('status', 'active')
        .order('name');
      
      if (error) {
        console.error('Error fetching BOMs:', error);
        throw error;
      }
      
      console.log('BOMs fetched:', data);
      return data || [];
    },
  });
};
