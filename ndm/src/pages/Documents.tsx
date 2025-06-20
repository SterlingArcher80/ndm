
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import WorkOrderRepository from "@/components/WorkOrderRepository";

const Documents = () => {
  const { user, loading } = useAuth();

  // Skip auth in development mode
  const isDevelopment = import.meta.env.DEV;

  if (loading && !isDevelopment) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user && !isDevelopment) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen w-full flex bg-background">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-6 bg-background">
          <div className="h-full w-full">
            <WorkOrderRepository />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Documents;
