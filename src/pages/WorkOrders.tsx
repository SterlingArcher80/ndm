
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import WorkOrderForm from "@/components/work-order/WorkOrderForm";

const WorkOrders = () => {
  const { user, loading } = useAuth();

  // Skip auth in development mode
  const isDevelopment = import.meta.env.DEV;

  if (loading && !isDevelopment) {
    return (
      <div className="min-h-screen bg-white text-black dark:bg-gray-800 dark:text-white">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Work Orders</h1>
              <p className="text-gray-600 dark:text-gray-400">Create and manage work orders</p>
            </div>
            <WorkOrderForm />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkOrders;
