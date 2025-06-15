
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface WorkflowStage {
  id: string;
  name: string;
  color: string;
  order_position: number;
}

export const useWorkflowStages = () => {
  const [stages, setStages] = useState<WorkflowStage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStages = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_stages')
        .select('*')
        .order('order_position');

      if (error) throw error;
      setStages(data || []);
    } catch (error) {
      console.error('Error fetching workflow stages:', error);
      toast.error('Failed to load workflow stages');
    } finally {
      setLoading(false);
    }
  };

  const updateStageName = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('workflow_stages')
        .update({ name })
        .eq('id', id);

      if (error) throw error;

      setStages(prev => prev.map(stage => 
        stage.id === id ? { ...stage, name } : stage
      ));
      
      toast.success('Stage name updated successfully');
    } catch (error) {
      console.error('Error updating stage name:', error);
      toast.error('Failed to update stage name');
    }
  };

  const reorderStages = async (reorderedStages: WorkflowStage[]) => {
    try {
      // Update order positions in the database
      const updates = reorderedStages.map((stage, index) => ({
        id: stage.id,
        order_position: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('workflow_stages')
          .update({ order_position: update.order_position })
          .eq('id', update.id);

        if (error) throw error;
      }

      setStages(reorderedStages);
      toast.success('Stage order updated successfully');
    } catch (error) {
      console.error('Error reordering stages:', error);
      toast.error('Failed to update stage order');
      // Refresh data from database on error
      fetchStages();
    }
  };

  useEffect(() => {
    fetchStages();
  }, []);

  return {
    stages,
    loading,
    updateStageName,
    reorderStages,
    refetch: fetchStages
  };
};
