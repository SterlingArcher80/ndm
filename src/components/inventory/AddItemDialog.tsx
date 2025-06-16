
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';

interface AddItemDialogProps {
  trigger?: React.ReactNode;
}

const AddItemDialog = ({ trigger }: AddItemDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    quantity: 0,
    category_id: '',
    location_id: '',
  });

  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  // Fetch categories
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

  // Fetch locations
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

  // Fetch custom columns
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
            required={column.is_required}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(column.name, e.target.value, column.type)}
            required={column.is_required}
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
            <Label htmlFor={column.name} className="text-sm font-normal">
              {column.label}
            </Label>
          </div>
        );
      default: // text
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => handleCustomFieldChange(column.name, e.target.value, column.type)}
            placeholder={`Enter ${column.label.toLowerCase()}`}
            required={column.is_required}
          />
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('inventory_items')
        .insert({
          ...formData,
          created_by: user?.id,
          category_id: formData.category_id || null,
          location_id: formData.location_id || null,
          custom_fields: customFields,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Item added successfully!",
      });

      // Reset form
      setFormData({
        name: '',
        sku: '',
        description: '',
        quantity: 0,
        category_id: '',
        location_id: '',
      });
      setCustomFields({});

      // Refresh the inventory items
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      
      setOpen(false);
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Add New Item
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
          <DialogDescription>
            Fill in the details for your new inventory item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter item name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Enter SKU"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              placeholder="Enter quantity"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Select
              value={formData.location_id}
              onValueChange={(value) => setFormData({ ...formData, location_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((location) => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter item description (optional)"
              rows={3}
            />
          </div>

          {/* Custom Fields */}
          {customColumns && customColumns.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Custom Fields</h3>
              {customColumns.map((column) => (
                <div key={column.id} className="space-y-2">
                  <Label htmlFor={column.name}>
                    {column.label}
                    {column.is_required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderCustomField(column)}
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
