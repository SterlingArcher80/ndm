
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
      console.log('🔍 Fetching workflow stages...');
      const { data, error } = await supabase
        .from('workflow_stages')
        .select('*')
        .order('order_position');

      if (error) {
        console.error('❌ Error fetching workflow stages:', error);
        throw error;
      }
      
      console.log('📋 Workflow stages from database:', data);
      
      // If no stages exist, create the default ones
      if (!data || data.length === 0) {
        console.log('🔧 No workflow stages found, creating defaults...');
        await createDefaultStages();
        return;
      }
      
      setStages(data || []);
    } catch (error) {
      console.error('Error fetching workflow stages:', error);
      toast.error('Failed to load workflow stages');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultStages = async () => {
    const defaultStages = [
      { id: 'open', name: 'Open', color: 'bg-blue-500', order_position: 1 },
      { id: 'to-be-invoiced', name: 'To be Invoiced', color: 'bg-yellow-500', order_position: 2 },
      { id: 'shipped', name: 'Shipped', color: 'bg-green-500', order_position: 3 },
      { id: 'invoiced', name: 'Invoiced', color: 'bg-purple-500', order_position: 4 },
      { id: 'customer-history', name: 'Customer History', color: 'bg-gray-500', order_position: 5 },
      { id: 'dropship', name: 'Dropship', color: 'bg-red-500', order_position: 6 }
    ];

    try {
      console.log('📝 Inserting default workflow stages...');
      const { data, error } = await supabase
        .from('workflow_stages')
        .insert(defaultStages)
        .select();

      if (error) {
        console.error('❌ Error creating default stages:', error);
        throw error;
      }

      console.log('✅ Default stages created:', data);
      setStages(data || []);
      toast.success('Default workflow stages created');
    } catch (error) {
      console.error('Error creating default workflow stages:', error);
      toast.error('Failed to create default workflow stages');
    }
  };

  const updateStageName = async (id: string, name: string) => {
    try {
      console.log(`📝 Updating stage ${id} name to: ${name}`);
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
      console.log('🔄 Reordering workflow stages...');
      // Update order positions in the database
      const updates = reorderedStages.map((stage, index) => ({
        id: stage.id,
        order_position: index + 1
      }));

      console.log('📝 Stage updates:', updates);

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
