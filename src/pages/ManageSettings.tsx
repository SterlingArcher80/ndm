
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import CategoriesLocationsManager from "@/components/inventory/CategoriesLocationsManager";
import WorkflowStagesManager from "@/components/work-order/WorkflowStagesManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ManageSettings = () => {
  const { user, loading } = useAuth();

  // Skip auth in development mode
  const isDevelopment = import.meta.env.DEV;

  if (loading && !isDevelopment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user && !isDevelopment) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-6 w-full">
          <div className="w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your system configuration</p>
            </div>
            
            <Tabs defaultValue="inventory" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="inventory">Inventory Settings</TabsTrigger>
                <TabsTrigger value="workflow">Workflow Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="inventory" className="mt-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Inventory Management</h2>
                  <p className="text-gray-600">Manage categories and locations for your inventory</p>
                </div>
                <CategoriesLocationsManager />
              </TabsContent>
              
              <TabsContent value="workflow" className="mt-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Workflow Management</h2>
                  <p className="text-gray-600">Configure workflow stages for your work orders</p>
                </div>
                <WorkflowStagesManager />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageSettings;
