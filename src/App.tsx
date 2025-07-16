import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Pointeuse from "./pages/Pointeuse";
import Journal from "./pages/Journal";
import Finance from "./pages/Finance";
import Contrats from "./pages/Contrats";
import AdminJournal from "./pages/AdminJournal";
import AdminLocation from "./pages/AdminLocation";
import EmployeeDetails from "./pages/EmployeeDetails";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagerPointeuse from "./pages/ManagerPointeuse";
import ManagerJournal from "./pages/ManagerJournal";
import ManagerFinance from "./pages/ManagerFinance";
import ManagerContrats from "./pages/ManagerContrats";
import DashboardLayout from "./components/DashboardLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pointeuse" element={<Pointeuse />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/contrats" element={<Contrats />} />
            <Route path="/admin/journal" element={<AdminJournal />} />
            <Route path="/admin/location/:locationId" element={<AdminLocation />} />
            <Route path="/admin/employee/:employeeId" element={<EmployeeDetails />} />
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/pointeuse" element={<ManagerPointeuse />} />
            <Route path="/manager/journal" element={<ManagerJournal />} />
            <Route path="/manager/finance" element={<ManagerFinance />} />
            <Route path="/manager/contrats" element={<ManagerContrats />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
