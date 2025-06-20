
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useBOMMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const createBOM = useMutation({
    mutationFn: async (bomData: any) => {
      console.log('Creating BOM:', bomData);
      
      const { bom_items, ...bomInfo } = bomData;
      
      // Create the BOM first
      const { data: bom, error: bomError } = await supabase
        .from('boms')
        .insert({
          ...bomInfo,
          created_by: user?.id,
        })
        .select()
        .single();

      if (bomError) {
        console.error('Error creating BOM:', bomError);
        throw bomError;
      }

      // Create BOM items if any
      if (bom_items && bom_items.length > 0) {
        const bomItemsData = bom_items.map((item: any) => ({
          ...item,
          bom_id: bom.id,
        }));

        const { error: itemsError } = await supabase
          .from('bom_items')
          .insert(bomItemsData);

        if (itemsError) {
          console.error('Error creating BOM items:', itemsError);
          throw itemsError;
        }
      }

      console.log('BOM created:', bom);
      return bom;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boms'] });
    },
  });

  return {
    createBOM,
  };
};
