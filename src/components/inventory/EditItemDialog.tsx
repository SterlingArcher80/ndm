
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  category_id: z.string().optional(),
  location_id: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface EditItemDialogProps {
  item: {
    id: string;
    name: string;
    sku: string;
    description?: string;
    quantity: number;
    category_id?: string;
    location_id?: string;
    custom_fields?: any;
  };
  trigger?: React.ReactNode;
}

const EditItemDialog = ({ item, trigger }: EditItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [customFields, setCustomFields] = useState<Record<string, any>>(item.custom_fields || {});
  const queryClient = useQueryClient();

  console.log('EditItemDialog item prop:', item);

  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: item.name,
      sku: item.sku,
      description: item.description || '',
      quantity: item.quantity,
      category_id: item.category_id || 'none',
      location_id: item.location_id || 'none',
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: customColumns } = useQuery({
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

  const handleCustomFieldChange = (fieldName: string, value: any, fieldType: string) => {
    let processedValue = value;
    
    // Process value based on field type
    if (fieldType === 'number') {
      processedValue = value === '' ? null : Number(value);
    } else if (fieldType === 'boolean') {
      processedValue = Boolean(value);
    } else if (fieldType === 'date') {
      processedValue = value || null;
    }
    
    setCustomFields(prev => ({
      ...prev,
      [fieldName]: processedValue
    }));
  };

  const renderCustomField = (column: any) => {
    const value = customFields[column.name] || '';
    
    switch (column.type) {
      case 'number':
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(column.name, e.target.value, column.type)}
            placeholder={`Enter ${column.label.toLowerCase()}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(column.name, e.target.value, column.type)}
          />
        );
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={column.name}
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleCustomFieldChange(column.name, checked, column.type)}
            />
          </div>
        );
      default: // text
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(column.name, e.target.value, column.type)}
            placeholder={`Enter ${column.label.toLowerCase()}`}
          />
        );
    }
  };

  useEffect(() => {
    setCustomFields(item.custom_fields || {});
  }, [item.custom_fields]);

  const updateItemMutation = useMutation({
    mutationFn: async (values: ItemFormValues) => {
      console.log('Updating item with values:', values);
      console.log('Item ID being updated:', item.id);
      
      const updateData = {
        name: values.name,
        sku: values.sku,
        description: values.description || null,
        quantity: values.quantity,
        category_id: values.category_id === 'none' ? null : values.category_id,
        location_id: values.location_id === 'none' ? null : values.location_id,
        custom_fields: customFields,
        updated_at: new Date().toISOString(),
      };

      console.log('Sending update data to Supabase:', updateData);
      
      const { data: updateResult, error: updateError, count } = await supabase
        .from('inventory_items')
        .update(updateData)
        .eq('id', item.id)
        .select('*');
      
      console.log('Update result:', updateResult);
      console.log('Update count:', count);
      console.log('Update error:', updateError);
      
      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(`Update failed: ${updateError.message}`);
      }
      
      if (!updateResult || updateResult.length === 0) {
        console.error('No rows were updated - possible RLS issue or item not found');
        
        const { data: existingItem, error: fetchError } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('id', item.id)
          .single();
        
        console.log('Can we read the item?', existingItem);
        console.log('Fetch error:', fetchError);
        
        throw new Error('No rows were updated. This might be a Row Level Security issue or the item was not found.');
      }
      
      console.log('Update completed successfully with result:', updateResult);
      return updateResult[0];
    },
    onSuccess: (data) => {
      console.log('Update mutation successful:', data);
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('Item updated successfully');
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast.error(`Failed to update item: ${error.message}`);
    },
  });

  const onSubmit = (values: ItemFormValues) => {
    console.log('Form submitted with values:', values);
    updateItemMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Make changes to the inventory item details.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter item name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter SKU" {...field} />
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
                      placeholder="Enter item description" 
                      className="resize-none" 
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter quantity"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
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
              name="location_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No location</SelectItem>
                      {locations?.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Custom Fields */}
            {customColumns && customColumns.length > 0 && (
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Custom Fields</h3>
                {customColumns.map((column) => (
                  <div key={column.id} className="space-y-2">
                    <FormLabel htmlFor={column.name}>
                      {column.label}
                      {column.is_required && <span className="text-red-500 ml-1">*</span>}
                    </FormLabel>
                    {renderCustomField(column)}
                  </div>
                ))}
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateItemMutation.isPending}
              >
                {updateItemMutation.isPending ? 'Updating...' : 'Update Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditItemDialog;
