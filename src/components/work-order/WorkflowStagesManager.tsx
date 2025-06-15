
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit2, GripVertical, Save, X } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface WorkflowStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

const WorkflowStagesManager = () => {
  const [stages, setStages] = useState<WorkflowStage[]>([
    { id: '1', name: 'Open', color: 'bg-blue-500', order: 1 },
    { id: '2', name: 'To be Invoiced', color: 'bg-yellow-500', order: 2 },
    { id: '3', name: 'Shipped', color: 'bg-green-500', order: 3 },
    { id: '4', name: 'Invoiced', color: 'bg-purple-500', order: 4 },
    { id: '5', name: 'Customer History', color: 'bg-gray-500', order: 5 },
    { id: '6', name: 'Dropship', color: 'bg-red-500', order: 6 }
  ]);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleEdit = (stage: WorkflowStage) => {
    setEditingId(stage.id);
    setEditingName(stage.name);
  };

  const handleSave = (id: string) => {
    setStages(prev => prev.map(stage => 
      stage.id === id ? { ...stage, name: editingName } : stage
    ));
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

    // Update order numbers
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setStages(updatedItems);
  };

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
                            {stage.order}
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
