
import { useState, useEffect } from 'react';
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
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

const columnSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Name must be a valid identifier'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['text', 'number', 'date', 'boolean', 'image']),
  is_required: z.boolean().default(false),
});

type ColumnFormValues = z.infer<typeof columnSchema>;

interface EditColumnDialogProps {
  column: {
    id: string;
    name: string;
    label: string;
    type: string;
    is_required: boolean;
  };
}

const EditColumnDialog = ({ column }: EditColumnDialogProps) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      name: column.name,
      label: column.label,
      type: column.type as 'text' | 'number' | 'date' | 'boolean' | 'image',
      is_required: column.is_required,
    },
  });

  useEffect(() => {
    form.reset({
      name: column.name,
      label: column.label,
      type: column.type as 'text' | 'number' | 'date' | 'boolean' | 'image',
      is_required: column.is_required,
    });
  }, [column, form]);

  const updateColumnMutation = useMutation({
    mutationFn: async (values: ColumnFormValues) => {
      const { error } = await supabase
        .from('inventory_columns')
        .update(values)
        .eq('id', column.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-columns'] });
      toast.success('Column updated successfully');
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error updating column:', error);
      toast.error('Failed to update column');
    },
  });

  const onSubmit = (values: ColumnFormValues) => {
    updateColumnMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Custom Column</DialogTitle>
          <DialogDescription>
            Update the custom field configuration.
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
                      <SelectItem value="image">Image</SelectItem>
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
                disabled={updateColumnMutation.isPending}
              >
                {updateColumnMutation.isPending ? 'Updating...' : 'Update Column'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditColumnDialog;
