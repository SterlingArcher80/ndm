
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

// Only core system columns that cannot be modified (name, sku, quantity)
const CORE_SYSTEM_COLUMNS = [
  { id: 'name', name: 'name', label: 'Name', type: 'text', is_required: true, order_position: -5 },
  { id: 'sku', name: 'sku', label: 'SKU', type: 'text', is_required: true, order_position: -4 },
  { id: 'quantity', name: 'quantity', label: 'Quantity', type: 'number', is_required: true, order_position: -1 },
];

const InventoryColumnsManager = () => {
  const queryClient = useQueryClient();
  const [deleteColumn, setDeleteColumn] = useState<{ open: boolean; column: any | null }>({ 
    open: false, 
    column: null 
  });

  const { data: customColumns, isLoading } = useQuery({
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

  // Combine core system and custom columns for display
  const allColumns = [
    ...CORE_SYSTEM_COLUMNS,
    ...(customColumns || [])
  ].sort((a, b) => a.order_position - b.order_position);

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
    if (!customColumns) return;
    
    // Only allow moving custom columns (not core system ones)
    const customColumnIds = customColumns.map(col => col.id);
    if (!customColumnIds.includes(columnId)) return;
    
    const currentIndex = customColumns.findIndex(col => col.id === columnId);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= customColumns.length) return;
    
    const newPosition = customColumns[targetIndex].order_position;
    updateOrderMutation.mutate({ columnId, newPosition });
  };

  const isCoreSystemColumn = (columnId: string) => {
    return CORE_SYSTEM_COLUMNS.some(col => col.id === columnId);
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
              <CardTitle>Inventory Columns</CardTitle>
              <CardDescription>
                Manage all columns for your inventory items. Core columns (Name, SKU, Quantity) have limited editing options.
              </CardDescription>
            </div>
            <AddColumnDialog />
          </div>
        </CardHeader>
        <CardContent>
          {allColumns && allColumns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allColumns.map((column, index) => (
                  <TableRow key={column.id}>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        {!isCoreSystemColumn(column.id) && (
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveColumn(column.id, 'up')}
                              disabled={index === CORE_SYSTEM_COLUMNS.length}
                              className="h-6 w-6 p-0"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveColumn(column.id, 'down')}
                              disabled={index === allColumns.length - 1}
                              className="h-6 w-6 p-0"
                            >
                              ↓
                            </Button>
                          </div>
                        )}
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
                      {isCoreSystemColumn(column.id) ? (
                        <span className="text-blue-600 font-medium">Core System</span>
                      ) : (
                        <span className="text-green-600 font-medium">Custom</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {isCoreSystemColumn(column.id) ? (
                          <span className="text-gray-400 text-sm">Limited editing</span>
                        ) : (
                          <>
                            <EditColumnDialog column={column} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteColumn({ open: true, column })}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No columns found.</p>
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
