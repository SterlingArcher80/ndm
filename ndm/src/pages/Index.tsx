import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import WorkOrderRepository from "@/components/WorkOrderRepository";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight } from "lucide-react";

const Index = () => {
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

  if (user || isDevelopment) {
    return <Navigate to="/inventory" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Package className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Inventory Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Streamline your inventory tracking and management with our comprehensive solution
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <a href="/auth">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Inventory</h3>
            <p className="text-gray-600">
              Keep track of all your items with real-time quantity updates and low stock alerts
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Work Orders</h3>
            <p className="text-gray-600">
              Categorize your items and organize them by locations for easy management
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Manufacturing</h3>
            <p className="text-gray-600">
              Get insights into your inventory with detailed analytics and reporting features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
