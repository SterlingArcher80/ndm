
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddCategoryDialog from './AddCategoryDialog';
import AddLocationDialog from './AddLocationDialog';
import EditCategoryDialog from './EditCategoryDialog';
import EditLocationDialog from './EditLocationDialog';
import { toast } from 'sonner';
import { useColumnByName } from '@/hooks/useInventoryColumns';

const CategoriesLocationsManager = () => {
  const queryClient = useQueryClient();
  const [deleteCategory, setDeleteCategory] = useState<{ open: boolean; category: any | null }>({ 
    open: false, 
    category: null 
  });
  const [deleteLocation, setDeleteLocation] = useState<{ open: boolean; location: any | null }>({ 
    open: false, 
    location: null 
  });

  // Get dynamic column information
  const categoryColumn = useColumnByName('category');
  const locationColumn = useColumnByName('location');

  const { data: categories, isLoading: categoriesLoading } = useQuery({
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

  const { data: locations, isLoading: locationsLoading } = useQuery({
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

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted successfully');
      setDeleteCategory({ open: false, category: null });
    },
    onError: (error) => {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    },
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', locationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      toast.success('Location deleted successfully');
      setDeleteLocation({ open: false, location: null });
    },
    onError: (error) => {
      console.error('Error deleting location:', error);
      toast.error('Failed to delete location');
    },
  });

  const handleDeleteCategory = (category: any) => {
    if (confirm(`Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const handleDeleteLocation = (location: any) => {
    if (confirm(`Are you sure you want to delete the location "${location.name}"? This action cannot be undone.`)) {
      deleteLocationMutation.mutate(location.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Categories & Locations</CardTitle>
        <CardDescription>
          Manage categories and locations for your inventory items. Column names reflect your current inventory column settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="categories">
              {categoryColumn?.label || 'Categories'}
            </TabsTrigger>
            <TabsTrigger value="locations">
              {locationColumn?.label || 'Locations'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Manage {categoryColumn?.label || 'Categories'}
              </h3>
              <AddCategoryDialog />
            </div>
            
            {categoriesLoading ? (
              <div className="text-center py-8">Loading categories...</div>
            ) : categories && categories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <EditCategoryDialog category={category} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No {categoryColumn?.label?.toLowerCase() || 'categories'} found.</p>
                <p className="text-sm">Add your first {categoryColumn?.label?.toLowerCase() || 'category'} to get started.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                Manage {locationColumn?.label || 'Locations'}
              </h3>
              <AddLocationDialog />
            </div>
            
            {locationsLoading ? (
              <div className="text-center py-8">Loading locations...</div>
            ) : locations && locations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.name}</TableCell>
                      <TableCell>{location.description || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <EditLocationDialog location={location} />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteLocation(location)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No {locationColumn?.label?.toLowerCase() || 'locations'} found.</p>
                <p className="text-sm">Add your first {locationColumn?.label?.toLowerCase() || 'location'} to get started.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CategoriesLocationsManager;
