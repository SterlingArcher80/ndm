
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderFile, WorkOrderFolder } from './types';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
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

  // Fetch stage sub-folders
  const { data: stageSubFolders = [] } = useQuery({
    queryKey: ['workflow-stage-subfolders-move'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_items')
        .select('*')
        .eq('type', 'folder')
        .eq('is_stage_subfolder', true)
        .is('parent_id', null)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open
  });

  const moveItemMutation = useMutation({
    mutationFn: async ({ itemId, newStageId, parentId }: { itemId: string; newStageId: string; parentId?: string }) => {
      const { error } = await supabase
        .from('work_order_items')
        .update({ 
          workflow_stage_id: newStageId,
          parent_id: parentId || null
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
      toast.error('Please select a destination');
      return;
    }

    // Check if selectedStage is a stage sub-folder
    const stageSubFolder = stageSubFolders.find(sf => sf.id === selectedStage);
    
    if (stageSubFolder) {
      // Moving to a stage sub-folder
      moveItemMutation.mutate({
        itemId: item.id,
        newStageId: stageSubFolder.workflow_stage_id,
        parentId: selectedStage // The sub-folder becomes the parent
      });
    } else {
      // Moving to a regular workflow stage
      moveItemMutation.mutate({
        itemId: item.id,
        newStageId: selectedStage
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedStage('');
  };

  const getStageSubFoldersForStage = (stageId: string) => {
    return stageSubFolders.filter(folder => folder.workflow_stage_id === stageId);
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
              Select Destination
            </label>
            <Select value={selectedStage} onValueChange={setSelectedStage}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Choose a workflow stage or sub-stage" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                {folders.map((folder) => {
                  const stageSubFolders = getStageSubFoldersForStage(folder.id);
                  
                  return (
                    <React.Fragment key={folder.id}>
                      {/* Main workflow stage */}
                      <SelectItem 
                        value={folder.id}
                        className="text-white hover:bg-gray-600"
                      >
                        {folder.name}
                      </SelectItem>
                      
                      {/* Stage sub-folders */}
                      {stageSubFolders.map((subFolder) => (
                        <SelectItem
                          key={subFolder.id}
                          value={subFolder.id}
                          className="text-white hover:bg-gray-600 pl-6"
                        >
                          ↳ {subFolder.name}
                        </SelectItem>
                      ))}
                    </React.Fragment>
                  );
                })}
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
