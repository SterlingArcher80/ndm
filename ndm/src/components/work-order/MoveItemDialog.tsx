
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderFile, WorkOrderFolder } from './types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface MoveItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: WorkOrderFile | null;
  folders: WorkOrderFolder[];
}

const MoveItemDialog = ({ open, onOpenChange, item, folders }: MoveItemDialogProps) => {
  const [selectedStage, setSelectedStage] = useState<string>('');
  const queryClient = useQueryClient();

  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, newStageId }: { itemId: string; newStageId: string }) => {
      const { error } = await supabase
        .from('work_order_items')
        .update({ 
          workflow_stage_id: newStageId,
          parent_id: null // Move to root level of new stage
        })
        .eq('id', itemId);

      if (error) {
        console.error('Error moving item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-order-items'] });
      toast.success(`Item moved successfully`);
      onOpenChange(false);
      setSelectedStage('');
    },
    onError: (error) => {
      console.error('Failed to move item:', error);
      toast.error('Failed to move item');
    }
  });

  const handleMove = () => {
    if (!item || !selectedStage) {
      toast.error('Please select a workflow stage');
      return;
    }

    moveItemMutation.mutate({
      itemId: item.id,
      newStageId: selectedStage
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedStage('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Move Item</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-300 mb-4">
            Moving: <span className="font-medium">{item?.name}</span>
          </p>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Select Workflow Stage
            </label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Choose a workflow stage" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {folders.map((folder) => (
                  <SelectItem 
                    key={folder.id} 
                    value={folder.id}
                    className="text-white hover:bg-gray-600"
                  >
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            Cancel
          </Button>
          <Button 
            onClick={handleMove} 
            disabled={!selectedStage || moveItemMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {moveItemMutation.isPending ? 'Moving...' : 'Move'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MoveItemDialog;
