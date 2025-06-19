
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useWorkOrderFields } from './hooks/useWorkOrderFields';
import { useWorkOrderMutations } from './hooks/useWorkOrderMutations';
import { toast } from 'sonner';

const workOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']).default('open'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  custom_fields: z.record(z.any()).default({}),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

const WorkOrderForm = () => {
  const { data: fields = [], isLoading: fieldsLoading } = useWorkOrderFields();
  const { createWorkOrder } = useWorkOrderMutations();

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      custom_fields: {},
    },
  });

  const onSubmit = async (data: WorkOrderFormData) => {
    try {
      await createWorkOrder.mutateAsync(data);
      form.reset();
      toast.success('Work order created successfully');
    } catch (error) {
      console.error('Error creating work order:', error);
      toast.error('Failed to create work order');
    }
  };

  const renderCustomField = (field: any) => {
    const fieldName = `custom_fields.${field.name}`;
    
    switch (field.type) {
      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.is_required && <span className="text-red-500">*</span>}</FormLabel>
                <Select onValueChange={formField.onChange} value={formField.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label}`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option: string) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case 'number':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.is_required && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...formField}
                    onChange={(e) => formField.onChange(parseFloat(e.target.value) || '')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case 'date':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.is_required && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input type="date" {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case 'boolean':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={formField.value || false}
                    onChange={(e) => formField.onChange(e.target.checked)}
                    className="w-4 h-4"
                  />
                </FormControl>
                <FormLabel className="text-sm font-normal">
                  {field.label} {field.is_required && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      default:
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={fieldName as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label} {field.is_required && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  <Input {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  if (fieldsLoading) {
    return <div className="text-center">Loading form...</div>;
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Work Order</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter work order title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter work order description"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {fields.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Custom Fields</h3>
                {fields
                  .sort((a, b) => a.order_position - b.order_position)
                  .map(renderCustomField)}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={createWorkOrder.isPending}
            >
              {createWorkOrder.isPending ? 'Creating...' : 'Create Work Order'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WorkOrderForm;
