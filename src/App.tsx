
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InventorySystem from "./pages/InventorySystem";
import ManageSettings from "./pages/ManageSettings";
import WorkOrders from "./pages/WorkOrders";
import Documents from "./pages/Documents";
import BOM from "./pages/BOM";
import AuthPage from "./components/auth/AuthPage";
import CMSEditor from "./pages/CMSEditor";

const App = () => {
  // Create QueryClient inside the component to ensure React context is available
  const queryClient = React.useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    },
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/work-orders" element={<WorkOrders />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/inventory" element={<InventorySystem />} />
                <Route path="/bom" element={<BOM />} />
                <Route path="/settings" element={<ManageSettings />} />
                <Route path="/cms/edit/:pageId" element={<CMSEditor />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
