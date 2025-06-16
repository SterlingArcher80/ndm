
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const columnSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Name must be a valid identifier'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['text', 'number', 'date', 'boolean']),
  is_required: z.boolean().default(false),
});

type ColumnFormValues = z.infer<typeof columnSchema>;

const AddColumnDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      name: '',
      label: '',
      type: 'text',
      is_required: false,
    },
  });

  const addColumnMutation = useMutation({
    mutationFn: async (values: ColumnFormValues) => {
      // Get the current max order position
      const { data: existingColumns } = await supabase
        .from('inventory_columns')
        .select('order_position')
        .order('order_position', { ascending: false })
        .limit(1);

      const maxPosition = existingColumns?.[0]?.order_position || 0;

      const { error } = await supabase
        .from('inventory_columns')
        .insert({
          name: values.name,
          label: values.label,
          type: values.type,
          is_required: values.is_required,
          order_position: maxPosition + 1,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-columns'] });
      toast.success('Column added successfully');
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error adding column:', error);
      toast.error('Failed to add column');
    },
  });

  const onSubmit = (values: ColumnFormValues) => {
    addColumnMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Column
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Column</DialogTitle>
          <DialogDescription>
            Add a new custom field to your inventory items.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <SelectValue placeholder="Select field type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="is_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Required Field</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
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
                disabled={addColumnMutation.isPending}
              >
                {addColumnMutation.isPending ? 'Adding...' : 'Add Column'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnDialog;
