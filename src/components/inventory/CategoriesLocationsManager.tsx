
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EditCategoryDialog from './EditCategoryDialog';
import EditLocationDialog from './EditLocationDialog';
import AddCategoryDialog from './AddCategoryDialog';
import AddLocationDialog from './AddLocationDialog';

const CategoriesLocationsManager = () => {
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

  if (categoriesLoading || locationsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Manage your inventory categories
              </CardDescription>
            </div>
            <AddCategoryDialog />
          </div>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
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
                    <TableCell>{category.description || 'No description'}</TableCell>
                    <TableCell>
                      <EditCategoryDialog category={category} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No categories found. Add your first category to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Locations Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Manage your storage locations
              </CardDescription>
            </div>
            <AddLocationDialog />
          </div>
        </CardHeader>
        <CardContent>
          {locations && locations.length > 0 ? (
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
                    <TableCell>{location.description || 'No description'}</TableCell>
                    <TableCell>
                      <EditLocationDialog location={location} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No locations found. Add your first location to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesLocationsManager;
