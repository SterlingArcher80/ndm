
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { useWorkOrderFields } from './hooks/useWorkOrderFields';
import { useWorkOrderFieldMutations } from './hooks/useWorkOrderFieldMutations';
import { toast } from 'sonner';

const fieldSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Name must be a valid identifier'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
  options: z.array(z.string()).optional(),
  is_required: z.boolean().default(false),
});

type FieldFormData = z.infer<typeof fieldSchema>;

const WorkOrderFieldsManager = () => {
  const { data: fields = [], isLoading } = useWorkOrderFields();
  const { createField, updateField, deleteField, reorderFields } = useWorkOrderFieldMutations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<any>(null);
  const [optionsText, setOptionsText] = useState('');

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: '',
      label: '',
      type: 'text',
      options: [],
      is_required: false,
    },
  });

  const watchedType = form.watch('type');

  const handleSubmit = async (data: FieldFormData) => {
    try {
      const fieldData = {
        ...data,
        options: data.type === 'select' ? optionsText.split('\n').filter(Boolean) : null,
        order_position: editingField ? editingField.order_position : fields.length,
      };

      if (editingField) {
        await updateField.mutateAsync({ id: editingField.id, ...fieldData });
        toast.success('Field updated successfully');
      } else {
        await createField.mutateAsync(fieldData);
        toast.success('Field created successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving field:', error);
      toast.error('Failed to save field');
    }
  };

  const handleEdit = (field: any) => {
    setEditingField(field);
    form.reset({
      name: field.name,
      label: field.label,
      type: field.type,
      is_required: field.is_required,
    });
    setOptionsText(field.options?.join('\n') || '');
    setIsDialogOpen(true);
  };

  const handleDelete = async (fieldId: string) => {
    if (confirm('Are you sure you want to delete this field?')) {
      try {
        await deleteField.mutateAsync(fieldId);
        toast.success('Field deleted successfully');
      } catch (error) {
        console.error('Error deleting field:', error);
        toast.error('Failed to delete field');
      }
    }
  };

  const handleReorder = async (fieldId: string, direction: 'up' | 'down') => {
    const currentIndex = fields.findIndex(f => f.id === fieldId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    try {
      await reorderFields.mutateAsync({ fieldId, newPosition: newIndex });
      toast.success('Field reordered successfully');
    } catch (error) {
      console.error('Error reordering field:', error);
      toast.error('Failed to reorder field');
    }
  };

  const resetForm = () => {
    form.reset();
    setOptionsText('');
    setEditingField(null);
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return <div className="text-center">Loading fields...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Work Order Fields</CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingField ? 'Edit Field' : 'Add New Field'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Name</FormLabel>
                      <FormControl>
                        <Input placeholder="field_name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Field Label" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="date">Date</SelectItem>
                          <SelectItem value="boolean">Checkbox</SelectItem>
                          <SelectItem value="select">Select</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchedType === 'select' && (
                  <div>
                    <Label htmlFor="options">Options (one per line)</Label>
                    <textarea
                      id="options"
                      value={optionsText}
                      onChange={(e) => setOptionsText(e.target.value)}
                      className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md"
                      placeholder="Option 1&#10;Option 2&#10;Option 3"
                    />
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="is_required"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                      <FormLabel className="text-sm font-normal">
                        Required field
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createField.isPending || updateField.isPending}>
                    {editingField ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {fields.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No custom fields defined. Add your first field to get started.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm text-gray-500">#{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(field.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReorder(field.id, 'down')}
                        disabled={index === fields.length - 1}
                      >
                        <MoveDown className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{field.label}</TableCell>
                  <TableCell className="font-mono text-sm">{field.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{field.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {field.is_required ? (
                      <Badge variant="destructive">Required</Badge>
                    ) : (
                      <Badge variant="outline">Optional</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(field)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(field.id)}
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
  );
};

export default WorkOrderFieldsManager;
