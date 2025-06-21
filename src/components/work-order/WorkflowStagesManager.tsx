import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, GripVertical, Save, X, Loader2, Plus, Trash2, FolderPlus, Folder } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useWorkflowStages } from './hooks/useWorkflowStages';
import { useFolderMutations } from './hooks/useFolderMutations';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const WorkflowStagesManager = () => {
  const { stages, loading, updateStageName, reorderStages, addStage, deleteStage } = useWorkflowStages();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubFolderDialogOpen, setIsSubFolderDialogOpen] = useState(false);
  const [newStageName, setNewStageName] = useState('');
  const [newStageColor, setNewStageColor] = useState('bg-blue-500');
  const [newSubFolderName, setNewSubFolderName] = useState('');
  const [selectedStageForSubFolder, setSelectedStageForSubFolder] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);

  const { createSubFolderMutation, deleteItemMutation } = useFolderMutations(
    () => {}, // setShowNewFolderDialog - not used here
    () => {}, // setNewFolderName - not used here
    () => {}, // setDeleteDialog - not used here
    () => {}  // setDeleteConfirmation - not used here
  );

  // Fetch stage sub-folders for all workflow stages
  const { data: stageSubFolders = [], refetch: refetchStageSubFolders } = useQuery({
    queryKey: ['workflow-stage-subfolders'],
    queryFn: async () => {
      console.log('🔍 Fetching stage sub-folders for workflow stages...');
      const { data, error } = await supabase
        .from('work_order_items')
        .select('*')
        .eq('type', 'folder')
        .eq('is_stage_subfolder', true)
        .is('parent_id', null)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching stage sub-folders:', error);
        throw error;
      }
      
      console.log('📋 Stage sub-folders data:', data);
      return data || [];
    }
  });

  // Refetch stage sub-folders when a new one is created
  React.useEffect(() => {
    if (createSubFolderMutation.isSuccess) {
      refetchStageSubFolders();
    }
  }, [createSubFolderMutation.isSuccess, refetchStageSubFolders]);

  const colorOptions = [
    'bg-blue-500',
    'bg-red-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-gray-500',
    'bg-orange-500',
    'bg-teal-500'
  ];

  const handleEdit = (stage: { id: string; name: string }) => {
    setEditingId(stage.id);
    setEditingName(stage.name);
  };

  const handleSave = async (id: string) => {
    if (!editingName.trim()) return;
    
    await updateStageName(id, editingName.trim());
    setEditingId(null);
    setEditingName('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleAddStage = async () => {
    if (!newStageName.trim()) return;
    
    await addStage(newStageName.trim(), newStageColor);
    setIsAddDialogOpen(false);
    setNewStageName('');
    setNewStageColor('bg-blue-500');
  };

  const handleAddStageSubFolder = (stageId: string) => {
    setSelectedStageForSubFolder(stageId);
    setIsSubFolderDialogOpen(true);
  };

  const handleCreateStageSubFolder = async () => {
    if (!newSubFolderName.trim() || !selectedStageForSubFolder) return;
    
    console.log(`Creating stage sub-folder "${newSubFolderName}" in stage "${selectedStageForSubFolder}"`);
    
    // Create a stage sub-folder with is_stage_subfolder flag
    const { error } = await supabase
      .from('work_order_items')
      .insert({
        name: newSubFolderName.trim(),
        type: 'folder',
        workflow_stage_id: selectedStageForSubFolder,
        parent_id: null,
        is_stage_subfolder: true
      });

    if (error) {
      console.error('❌ Error creating stage sub-folder:', error);
    } else {
      console.log('✅ Stage sub-folder created successfully');
      refetchStageSubFolders();
    }
    
    setIsSubFolderDialogOpen(false);
    setNewSubFolderName('');
    setSelectedStageForSubFolder(null);
  };

  const handleDeleteStage = async (stageId: string) => {
    await deleteStage(stageId);
    setDeleteDialogOpen(null);
  };

  const handleDeleteStageSubFolder = async (subFolderId: string) => {
    await deleteItemMutation.mutateAsync(subFolderId);
    refetchStageSubFolders();
  };

  const getStageSubFoldersForStage = (stageId: string) => {
    return stageSubFolders.filter(folder => folder.workflow_stage_id === stageId);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(stages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update order positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      order_position: index + 1
    }));

    reorderStages(updatedItems);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading workflow stages...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflow Stages</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage the workflow stages for your work orders. Drag to reorder, click edit to rename, and add stage sub-folders for better organization.
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Stage
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Workflow Stage</DialogTitle>
                <DialogDescription>
                  Create a new stage for your workflow process.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="stage-name">Stage Name</Label>
                  <Input
                    id="stage-name"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="Enter stage name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full ${color} border-2 ${
                          newStageColor === color ? 'border-foreground' : 'border-border'
                        }`}
                        onClick={() => setNewStageColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStage} disabled={!newStageName.trim()}>
                  Add Stage
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stages">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {stages.map((stage, index) => {
                  const stageSubFolders = getStageSubFoldersForStage(stage.id);
                  return (
                    <Draggable key={stage.id} draggableId={stage.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg bg-white dark:bg-gray-800 ${
                            snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                          }`}
                        >
                          {/* Stage Header */}
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-3">
                              <div
                                {...provided.dragHandleProps}
                                className="text-gray-400 hover:text-gray-600 cursor-grab"
                              >
                                <GripVertical className="h-5 w-5" />
                              </div>
                              <div className={`w-4 h-4 rounded-full ${stage.color}`}></div>
                              <Badge variant="outline" className="min-w-[3rem] justify-center">
                                {stage.order_position}
                              </Badge>
                              {editingId === stage.id ? (
                                <Input
                                  value={editingName}
                                  onChange={(e) => setEditingName(e.target.value)}
                                  className="max-w-xs"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave(stage.id);
                                    if (e.key === 'Escape') handleCancel();
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span className="font-medium text-gray-900 dark:text-white">{stage.name}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {editingId === stage.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSave(stage.id)}
                                    disabled={!editingName.trim()}
                                  >
                                    <Save className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancel}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleAddStageSubFolder(stage.id)}
                                    title="Add stage sub-folder"
                                  >
                                    <FolderPlus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(stage)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Dialog open={deleteDialogOpen === stage.id} onOpenChange={(open) => setDeleteDialogOpen(open ? stage.id : null)}>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Delete Workflow Stage</DialogTitle>
                                        <DialogDescription>
                                          Are you sure you want to delete the "{stage.name}" stage? This action cannot be undone.
                                          Any work orders in this stage will need to be moved to another stage first.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <DialogFooter>
                                        <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
                                          Cancel
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleDeleteStage(stage.id)}
                                        >
                                          Delete Stage
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Stage sub-folders for this stage */}
                          {stageSubFolders.length > 0 && (
                            <div className="px-4 pb-4">
                              <div className="border-t pt-3">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Stage Sub-Folders:</p>
                                <div className="space-y-1">
                                  {stageSubFolders.map((subFolder) => (
                                    <div
                                      key={subFolder.id}
                                      className="flex items-center justify-between p-2 bg-secondary rounded-md"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <Folder className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                          {subFolder.name}
                                        </span>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleDeleteStageSubFolder(subFolder.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Stage sub-folder creation dialog */}
        <Dialog open={isSubFolderDialogOpen} onOpenChange={setIsSubFolderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Stage Sub-Folder</DialogTitle>
              <DialogDescription>
                Create a new sub-folder that will appear in the sidebar under the selected workflow stage.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="stage-subfolder-name">Stage Sub-Folder Name</Label>
                <Input
                  id="stage-subfolder-name"
                  value={newSubFolderName}
                  onChange={(e) => setNewSubFolderName(e.target.value)}
                  placeholder="Enter stage sub-folder name"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSubFolderDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateStageSubFolder} 
                disabled={!newSubFolderName.trim()}
              >
                Create Stage Sub-Folder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default WorkflowStagesManager;
