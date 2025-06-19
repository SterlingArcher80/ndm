
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { useBOMFields } from './hooks/useBOMFields';
import { useBOMMutations } from './hooks/useBOMMutations';
import { useInventoryItems } from './hooks/useInventoryItems';
import { useToast } from '@/hooks/use-toast';

const bomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  version: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']),
  custom_fields: z.record(z.any()).default({}),
  bom_items: z.array(z.object({
    inventory_item_id: z.string().min(1, 'Inventory item is required'),
    quantity_required: z.number().min(0.01, 'Quantity must be greater than 0'),
    notes: z.string().optional(),
  })).default([]),
});

type BOMFormData = z.infer<typeof bomSchema>;

const BOMForm = () => {
  const { toast } = useToast();
  const { data: bomFields = [] } = useBOMFields();
  const { data: inventoryItems = [] } = useInventoryItems();
  const { createBOM } = useBOMMutations();

  const form = useForm<BOMFormData>({
    resolver: zodResolver(bomSchema),
    defaultValues: {
      name: '',
      description: '',
      version: '1.0',
      status: 'draft',
      custom_fields: {},
      bom_items: [{ inventory_item_id: '', quantity_required: 1, notes: '' }],
    },
  });

  const { fields: bomItemFields, append, remove } = useFieldArray({
    control: form.control,
    name: 'bom_items',
  });

  const onSubmit = async (data: BOMFormData) => {
    try {
      await createBOM.mutateAsync(data);
      toast({
        title: 'Success',
        description: 'BOM created successfully',
      });
      form.reset();
    } catch (error) {
      console.error('Error creating BOM:', error);
      toast({
        title: 'Error',
        description: 'Failed to create BOM',
        variant: 'destructive',
      });
    }
  };

  const addBOMItem = () => {
    append({ inventory_item_id: '', quantity_required: 1, notes: '' });
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
          <CardTitle>Create New BOM</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
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
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
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
              {bomFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Custom Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bomFields.map(renderCustomField)}
                  </div>
                </div>
              )}

              {/* BOM Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">BOM Items</h3>
                  <Button type="button" onClick={addBOMItem} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {bomItemFields.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name={`bom_items.${index}.inventory_item_id`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inventory Item *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select item" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {inventoryItems.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name} ({item.sku})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`bom_items.${index}.quantity_required`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`bom_items.${index}.notes`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                          disabled={bomItemFields.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Button type="submit" disabled={createBOM.isPending}>
                {createBOM.isPending ? 'Creating...' : 'Create BOM'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default BOMForm;
