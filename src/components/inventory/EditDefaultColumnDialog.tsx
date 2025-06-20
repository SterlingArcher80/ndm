
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';
import { toast } from 'sonner';

const defaultColumnSchema = z.object({
  label: z.string().min(1, 'Label is required'),
});

type DefaultColumnFormValues = z.infer<typeof defaultColumnSchema>;

interface EditDefaultColumnDialogProps {
  column: {
    id: string;
    name: string;
    label: string;
    type: string;
    is_required: boolean;
  };
}

const EditDefaultColumnDialog = ({ column }: EditDefaultColumnDialogProps) => {
  const [open, setOpen] = useState(false);

  const form = useForm<DefaultColumnFormValues>({
    resolver: zodResolver(defaultColumnSchema),
    defaultValues: {
      label: column.label,
    },
  });

  useEffect(() => {
    form.reset({
      label: column.label,
    });
  }, [column, form]);

  const onSubmit = (values: DefaultColumnFormValues) => {
    // For default columns, we only store the label change in localStorage
    // since we can't modify the database structure for system columns
    const customLabels = JSON.parse(localStorage.getItem('customColumnLabels') || '{}');
    customLabels[column.id] = values.label;
    localStorage.setItem('customColumnLabels', JSON.stringify(customLabels));
    
    toast.success('Column label updated successfully');
    setOpen(false);
    
    // Refresh the page to show the updated label
    window.location.reload();
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
          <DialogTitle>Edit System Column</DialogTitle>
          <DialogDescription>
            You can only modify the display label for system columns. The field name and type cannot be changed.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Field Name (Read-only)</label>
              <Input value={column.name} disabled className="bg-gray-100" />
            </div>
            
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Field Type (Read-only)</label>
              <Input value={column.type} disabled className="bg-gray-100 capitalize" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Required (Read-only)</label>
              <Input value={column.is_required ? 'Yes' : 'No'} disabled className="bg-gray-100" />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                Update Label
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDefaultColumnDialog;
