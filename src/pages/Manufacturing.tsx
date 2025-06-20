
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Sidebar from "@/components/layout/Sidebar";
import TopNavbar from "@/components/layout/TopNavbar";
import { Factory, Clock } from "lucide-react";

const Manufacturing = () => {
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
          <div className="h-full w-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-8">
                <Factory className="mx-auto h-24 w-24 text-blue-600 dark:text-blue-400 mb-4" />
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Manufacturing Module
              </h1>
              <h2 className="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
                Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We're working hard to bring you powerful manufacturing capabilities. 
                This module will include production planning, scheduling, quality control, 
                and real-time manufacturing analytics.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Manufacturing;
