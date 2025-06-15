
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, GripVertical, Save, X, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { useWorkflowStages } from './hooks/useWorkflowStages';

const WorkflowStagesManager = () => {
  const { stages, loading, updateStageName, reorderStages } = useWorkflowStages();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

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
        <CardTitle>Workflow Stages</CardTitle>
        <p className="text-sm text-gray-600">
          Manage the workflow stages for your work orders. Drag to reorder, click edit to rename.
        </p>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stages">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                {stages.map((stage, index) => (
                  <Draggable key={stage.id} draggableId={stage.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-4 border rounded-lg bg-white ${
                          snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                        }`}
                      >
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
                            <span className="font-medium">{stage.name}</span>
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(stage)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};

export default WorkflowStagesManager;
