
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import WorkOrderRepository from "@/components/WorkOrderRepository";

const WorkOrders = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen dark:bg-gray-950 bg-gray-50">
        <div className="text-lg text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-6 w-full bg-gray-50 dark:bg-gray-950">
          <div className="w-full">
            <WorkOrderRepository />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkOrders;
