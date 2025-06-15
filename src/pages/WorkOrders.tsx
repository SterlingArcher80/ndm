
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import WorkOrderRepository from "@/components/WorkOrderRepository";

const WorkOrders = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-6 w-full">
          <div className="w-full">
            <WorkOrderRepository />
          </div>
        </main>
      </div>
    </div>
  );
};

export default WorkOrders;
