
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useWorkOrderFieldMutations = () => {
  const queryClient = useQueryClient();

  const createField = useMutation({
    mutationFn: async (fieldData: any) => {
      console.log('Creating work order field:', fieldData);
      const { data, error } = await supabase
        .from('work_order_fields')
        .insert(fieldData)
        .select()
        .single();

      if (error) {
        console.error('Error creating field:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-fields'] });
    },
  });

  const updateField = useMutation({
    mutationFn: async ({ id, ...fieldData }: any) => {
      console.log('Updating work order field:', id, fieldData);
      const { data, error } = await supabase
        .from('work_order_fields')
        .update(fieldData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating field:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-fields'] });
    },
  });

  const deleteField = useMutation({
    mutationFn: async (fieldId: string) => {
      console.log('Deleting work order field:', fieldId);
      const { error } = await supabase
        .from('work_order_fields')
        .delete()
        .eq('id', fieldId);

      if (error) {
        console.error('Error deleting field:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-fields'] });
    },
  });

  const reorderFields = useMutation({
    mutationFn: async ({ fieldId, newPosition }: { fieldId: string; newPosition: number }) => {
      console.log('Reordering field:', fieldId, 'to position:', newPosition);
      
      // Get current fields to understand the reordering
      const { data: fields, error: fetchError } = await supabase
        .from('work_order_fields')
        .select('*')
        .order('order_position');

      if (fetchError) throw fetchError;

      // Update the order positions
      const updates = fields.map((field, index) => {
        if (field.id === fieldId) {
          return { id: field.id, order_position: newPosition };
        } else if (index >= newPosition && field.id !== fieldId) {
          return { id: field.id, order_position: index + 1 };
        } else if (index < newPosition && field.id !== fieldId) {
          return { id: field.id, order_position: index };
        }
        return { id: field.id, order_position: field.order_position };
      });

      // Batch update all positions
      for (const update of updates) {
        const { error } = await supabase
          .from('work_order_fields')
          .update({ order_position: update.order_position })
          .eq('id', update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-fields'] });
    },
  });

  return {
    createField,
    updateField,
    deleteField,
    reorderFields,
  };
};
