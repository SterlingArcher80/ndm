
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useBOMFieldMutations } from './hooks/useBOMFieldMutations';

const fieldSchema = z.object({
  name: z.string().min(1, 'Name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Name must be a valid identifier'),
  label: z.string().min(1, 'Label is required'),
  type: z.enum(['text', 'number', 'date', 'boolean', 'select']),
  options: z.array(z.string()).optional(),
  is_required: z.boolean().default(false),
});

type FieldFormData = z.infer<typeof fieldSchema>;

interface EditBOMFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  field: any;
}

const EditBOMFieldDialog = ({ open, onOpenChange, field }: EditBOMFieldDialogProps) => {
  const { updateField } = useBOMFieldMutations();
  const [optionsText, setOptionsText] = React.useState('');

  const form = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      name: '',
      label: '',
      type: 'text',
      is_required: false,
    },
  });

  const watchType = form.watch('type');

  useEffect(() => {
    if (field && open) {
      form.reset({
        name: field.name,
        label: field.label,
        type: field.type,
        is_required: field.is_required,
      });
      setOptionsText(field.options ? field.options.join('\n') : '');
    }
  }, [field, open, form]);

  const onSubmit = async (data: FieldFormData) => {
    if (!field) return;

    try {
      const fieldData = {
        ...data,
        id: field.id,
        options: data.type === 'select' && optionsText 
          ? optionsText.split('\n').map(s => s.trim()).filter(Boolean)
          : null,
      };

      await updateField.mutateAsync(fieldData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating field:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit BOM Field</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>Field Name *</FormLabel>
                  <FormControl>
                    <Input {...formField} placeholder="e.g., material_grade" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="label"
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>Display Label *</FormLabel>
                  <FormControl>
                    <Input {...formField} placeholder="e.g., Material Grade" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>Field Type *</FormLabel>
                  <Select onValueChange={formField.onChange} value={formField.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchType === 'select' && (
              <div>
                <label className="text-sm font-medium">Options (one per line)</label>
                <Textarea
                  value={optionsText}
                  onChange={(e) => setOptionsText(e.target.value)}
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                  className="mt-1"
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="is_required"
              render={({ field: formField }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Required Field</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      This field must be filled when creating a BOM
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={formField.value}
                      onCheckedChange={formField.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateField.isPending}>
                {updateField.isPending ? 'Updating...' : 'Update Field'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBOMFieldDialog;
