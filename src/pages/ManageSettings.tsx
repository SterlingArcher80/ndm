
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import CategoriesLocationsManager from "@/components/inventory/CategoriesLocationsManager";
import InventoryColumnsManager from "@/components/inventory/InventoryColumnsManager";
import WorkflowStagesManager from "@/components/work-order/WorkflowStagesManager";
import WorkOrderFieldsManager from "@/components/work-order/WorkOrderFieldsManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ManageSettings = () => {
  const { user, loading } = useAuth();

  // Skip auth in development mode
  const isDevelopment = import.meta.env.DEV;

  if (loading && !isDevelopment) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-950 bg-gray-50">
        <div className="text-lg text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user && !isDevelopment) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-950">
          <div className="h-full w-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage your system configuration</p>
            </div>
            
            <Tabs defaultValue="inventory" className="w-full h-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="inventory">Inventory Settings</TabsTrigger>
                <TabsTrigger value="work-orders">Work Order Settings</TabsTrigger>
                <TabsTrigger value="workflow">Workflow Settings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="inventory" className="mt-6 h-full space-y-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage categories, locations, and custom fields for your inventory</p>
                </div>
                
                <InventoryColumnsManager />
                <CategoriesLocationsManager />
              </TabsContent>

              <TabsContent value="work-orders" className="mt-6 h-full space-y-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Work Order Configuration</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage custom fields for work orders</p>
                </div>
                
                <WorkOrderFieldsManager />
              </TabsContent>
              
              <TabsContent value="workflow" className="mt-6 h-full">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Workflow Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Configure workflow stages for your work orders</p>
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
