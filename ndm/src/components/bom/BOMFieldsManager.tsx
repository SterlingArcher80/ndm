
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { useBOMFields } from './hooks/useBOMFields';
import { useBOMFieldMutations } from './hooks/useBOMFieldMutations';
import AddBOMFieldDialog from './AddBOMFieldDialog';
import EditBOMFieldDialog from './EditBOMFieldDialog';
import DeleteBOMFieldDialog from './DeleteBOMFieldDialog';

const BOMFieldsManager = () => {
  const { data: fields = [] } = useBOMFields();
  const { reorderField } = useBOMFieldMutations();
  const [selectedField, setSelectedField] = useState<any>(null);
  const [dialogState, setDialogState] = useState<{
    add: boolean;
    edit: boolean;
    delete: boolean;
  }>({
    add: false,
    edit: false,
    delete: false,
  });

  const openDialog = (type: keyof typeof dialogState, field?: any) => {
    setSelectedField(field || null);
    setDialogState(prev => ({ ...prev, [type]: true }));
  };

  const closeDialogs = () => {
    setSelectedField(null);
    setDialogState({ add: false, edit: false, delete: false });
  };

  const handleReorder = async (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;
    
    const newPosition = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newPosition < 0 || newPosition >= fields.length) return;
    
    try {
      await reorderField.mutateAsync({ fieldId, newPosition });
    } catch (error) {
      console.error('Error reordering field:', error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      text: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      number: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      date: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      boolean: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      select: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    };
    return colors[type as keyof typeof colors] || colors.text;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>BOM Custom Fields</CardTitle>
          <Button onClick={() => openDialog('add')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Field
          </Button>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No custom fields configured. Add your first field to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(field.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReorder(field.id, 'down')}
                          disabled={index === fields.length - 1}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{field.name}</TableCell>
                    <TableCell>{field.label}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(field.type)}>{field.type}</Badge>
                    </TableCell>
                    <TableCell>
                      {field.is_required ? (
                        <Badge variant="destructive">Required</Badge>
                      ) : (
                        <Badge variant="secondary">Optional</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog('edit', field)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDialog('delete', field)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddBOMFieldDialog
        open={dialogState.add}
        onOpenChange={() => closeDialogs()}
      />

      <EditBOMFieldDialog
        open={dialogState.edit}
        onOpenChange={() => closeDialogs()}
        field={selectedField}
      />

      <DeleteBOMFieldDialog
        open={dialogState.delete}
        onOpenChange={() => closeDialogs()}
        field={selectedField}
      />
    </>
  );
};

export default BOMFieldsManager;
