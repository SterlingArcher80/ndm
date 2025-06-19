
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkOrderFields } from './hooks/useWorkOrderFields';
import { useWorkOrderMutations } from './hooks/useWorkOrderMutations';
import { useBOMs } from './hooks/useBOMs';
import { useToast } from '@/hooks/use-toast';

const workOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  bom_id: z.string().optional(),
  custom_fields: z.record(z.any()).default({}),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

const WorkOrderForm = () => {
  const { toast } = useToast();
  const { data: workOrderFields = [] } = useWorkOrderFields();
  const { data: boms = [] } = useBOMs();
  const { createWorkOrder } = useWorkOrderMutations();

  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: {
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      bom_id: '',
      custom_fields: {},
    },
  });

  const onSubmit = async (data: WorkOrderFormData) => {
    try {
      const workOrderData = {
        ...data,
        bom_id: data.bom_id || null,
      };
      await createWorkOrder.mutateAsync(workOrderData);
      toast({
        title: 'Success',
        description: 'Work order created successfully',
      });
      form.reset();
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create work order',
        variant: 'destructive',
      });
    }
  };

  const renderCustomField = (field: any) => {
    switch (field.type) {
      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name="custom_fields"
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    form.setValue('custom_fields', {
                      ...form.getValues('custom_fields'),
                      [field.name]: value
                    });
                  }} 
                  defaultValue={form.getValues(`custom_fields.${field.name}`) || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
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
            name="custom_fields"
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    defaultValue={form.getValues(`custom_fields.${field.name}`) || ''}
                    onChange={(e) => {
                      form.setValue('custom_fields', {
                        ...form.getValues('custom_fields'),
                        [field.name]: parseFloat(e.target.value) || 0
                      });
                    }}
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
            name="custom_fields"
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    defaultValue={form.getValues(`custom_fields.${field.name}`) || ''}
                    onChange={(e) => {
                      form.setValue('custom_fields', {
                        ...form.getValues('custom_fields'),
                        [field.name]: e.target.value
                      });
                    }}
                  />
                </FormControl>
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
            name="custom_fields"
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input 
                    defaultValue={form.getValues(`custom_fields.${field.name}`) || ''}
                    onChange={(e) => {
                      form.setValue('custom_fields', {
                        ...form.getValues('custom_fields'),
                        [field.name]: e.target.value
                      });
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Work Order</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="bom_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BOM (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a BOM" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No BOM</SelectItem>
                          {boms.map((bom) => (
                            <SelectItem key={bom.id} value={bom.id}>
                              {bom.name} (v{bom.version})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Custom Fields */}
              {workOrderFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Custom Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workOrderFields.map(renderCustomField)}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={createWorkOrder.isPending}>
                {createWorkOrder.isPending ? 'Creating...' : 'Create Work Order'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkOrderForm;
