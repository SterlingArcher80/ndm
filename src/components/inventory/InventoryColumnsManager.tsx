
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react';
import AddColumnDialog from './AddColumnDialog';
import EditColumnDialog from './EditColumnDialog';
import DeleteColumnDialog from './DeleteColumnDialog';
import { toast } from 'sonner';

const InventoryColumnsManager = () => {
  const queryClient = useQueryClient();
  const [deleteColumn, setDeleteColumn] = useState<{ open: boolean; column: any | null }>({ 
    open: false, 
    column: null 
  });

  const { data: columns, isLoading } = useQuery({
    queryKey: ['inventory-columns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_columns')
        .select('*')
        .order('order_position');
      
      if (error) throw error;
      return data;
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ columnId, newPosition }: { columnId: string; newPosition: number }) => {
      const { error } = await supabase
        .from('inventory_columns')
        .update({ order_position: newPosition })
        .eq('id', columnId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-columns'] });
      toast.success('Column order updated');
    },
    onError: (error) => {
      console.error('Error updating column order:', error);
      toast.error('Failed to update column order');
    },
  });

  const moveColumn = (columnId: string, direction: 'up' | 'down') => {
    if (!columns) return;
    
    const currentIndex = columns.findIndex(col => col.id === columnId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= columns.length) return;
    
    const newPosition = columns[targetIndex].order_position;
    updateOrderMutation.mutate({ columnId, newPosition });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading columns...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Custom Inventory Columns</CardTitle>
              <CardDescription>
                Add custom fields to your inventory items for additional data tracking
              </CardDescription>
            </div>
            <AddColumnDialog />
          </div>
        </CardHeader>
        <CardContent>
          {columns && columns.length > 0 ? (
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
                {columns.map((column, index) => (
                  <TableRow key={column.id}>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveColumn(column.id, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveColumn(column.id, 'down')}
                            disabled={index === columns.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            ↓
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{column.name}</TableCell>
                    <TableCell>{column.label}</TableCell>
                    <TableCell>
                      <span className="capitalize">{column.type}</span>
                    </TableCell>
                    <TableCell>
                      {column.is_required ? (
                        <span className="text-red-600 font-medium">Required</span>
                      ) : (
                        <span className="text-gray-500">Optional</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <EditColumnDialog column={column} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteColumn({ open: true, column })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No custom columns found. Add your first custom column to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteColumnDialog
        open={deleteColumn.open}
        onOpenChange={(open) => setDeleteColumn({ open, column: null })}
        column={deleteColumn.column}
      />
    </div>
  );
};

export default InventoryColumnsManager;
