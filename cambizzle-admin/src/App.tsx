import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Ads from "./pages/admin/Ads";
import Categories from "./pages/admin/Categories";
import Filters from "./pages/admin/Filters";
import Brands from "./pages/admin/Brands";
import Locations from "./pages/admin/Locations";
import Reports from "./pages/admin/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
          <Route path="/admin/users" element={<AdminLayout><Users /></AdminLayout>} />
          <Route path="/admin/ads" element={<AdminLayout><Ads /></AdminLayout>} />
          <Route path="/admin/categories" element={<AdminLayout><Categories /></AdminLayout>} />
          <Route path="/admin/filters" element={<AdminLayout><Filters /></AdminLayout>} />
          <Route path="/admin/brands" element={<AdminLayout><Brands /></AdminLayout>} />
          <Route path="/admin/locations" element={<AdminLayout><Locations /></AdminLayout>} />
          <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
