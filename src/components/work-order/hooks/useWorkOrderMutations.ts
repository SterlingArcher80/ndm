
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useWorkOrderMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createWorkOrder = useMutation({
    mutationFn: async (workOrderData: any) => {
      console.log('Creating work order:', workOrderData);
      const { data, error } = await supabase
        .from('work_orders')
        .insert({
          ...workOrderData,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating work order:', error);
        throw error;
      }

      console.log('Work order created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });

  return {
    createWorkOrder,
  };
};
