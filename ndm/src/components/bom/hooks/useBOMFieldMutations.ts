
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useBOMFieldMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createField = useMutation({
    mutationFn: async (fieldData: any) => {
      console.log('Creating BOM field:', fieldData);
      const { data, error } = await supabase
        .from('bom_fields')
        .insert(fieldData)
        .select()
        .single();

      if (error) {
        console.error('Error creating BOM field:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bom-fields'] });
      toast({
        title: 'Success',
        description: 'BOM field created successfully',
      });
    },
  });

  const updateField = useMutation({
    mutationFn: async ({ id, ...fieldData }: any) => {
      console.log('Updating BOM field:', id, fieldData);
      const { data, error } = await supabase
        .from('bom_fields')
        .update(fieldData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating BOM field:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bom-fields'] });
      toast({
        title: 'Success',
        description: 'BOM field updated successfully',
      });
    },
  });

  const deleteField = useMutation({
    mutationFn: async (fieldId: string) => {
      console.log('Deleting BOM field:', fieldId);
      const { error } = await supabase
        .from('bom_fields')
        .delete()
        .eq('id', fieldId);

      if (error) {
        console.error('Error deleting BOM field:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bom-fields'] });
      toast({
        title: 'Success',
        description: 'BOM field deleted successfully',
      });
    },
  });

  const reorderField = useMutation({
    mutationFn: async ({ fieldId, newPosition }: { fieldId: string; newPosition: number }) => {
      console.log('Reordering BOM field:', fieldId, 'to position:', newPosition);
      const { error } = await supabase
        .from('bom_fields')
        .update({ order_position: newPosition })
        .eq('id', fieldId);

      if (error) {
        console.error('Error reordering BOM field:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bom-fields'] });
    },
  });

  return {
    createField,
    updateField,
    deleteField,
    reorderField,
  };
};
