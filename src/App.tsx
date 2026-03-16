import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Index from "./pages/Index";
import Login from "./pages/Login";
import RegisterHospital from "./pages/RegisterHospital";
import RegisterDonor from "./pages/RegisterDonor";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

import HospitalLayout from "./pages/hospital/HospitalLayout";
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import BloodStockPage from "./pages/hospital/BloodStockPage";
import HospitalEmergencyRequestPage from "./pages/hospital/HospitalEmergencyRequestPage";
import SearchDonorsPage from "./pages/hospital/SearchDonorsPage";
import SendRequestPage from "./pages/hospital/SendRequestPage";
import IncomingRequestsPage from "./pages/hospital/IncomingRequestsPage";
import RequestHistoryPage from "./pages/hospital/RequestHistoryPage";

import DonorLayout from "./pages/donor/DonorLayout";
import DonorProfile from "./pages/donor/DonorProfile";
import EmergencyRequestsPage from "./pages/donor/EmergencyRequestsPage";
import DonationHistoryPage from "./pages/donor/DonationHistoryPage";
import AvailabilityPage from "./pages/donor/AvailabilityPage";

const queryClient = new QueryClient();

function ProtectedRoute({ role, children }: { role: "hospital" | "donor"; children: React.ReactNode }) {
  const { isAuthenticated, user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register/hospital" element={<RegisterHospital />} />
            <Route path="/register/donor" element={<RegisterDonor />} />
            <Route path="/about" element={<About />} />

            <Route path="/hospital" element={<ProtectedRoute role="hospital"><HospitalLayout /></ProtectedRoute>}>
              <Route index element={<HospitalDashboard />} />
              <Route path="blood-stock" element={<BloodStockPage />} />
              <Route path="emergency-request" element={<HospitalEmergencyRequestPage />} />
              <Route path="search-donors" element={<SearchDonorsPage />} />
              <Route path="send-request" element={<SendRequestPage />} />
              <Route path="incoming-requests" element={<IncomingRequestsPage />} />
              <Route path="request-history" element={<RequestHistoryPage />} />
            </Route>

            <Route path="/donor" element={<ProtectedRoute role="donor"><DonorLayout /></ProtectedRoute>}>
              <Route index element={<DonorProfile />} />
              <Route path="emergency" element={<EmergencyRequestsPage />} />
              <Route path="history" element={<DonationHistoryPage />} />
              <Route path="availability" element={<AvailabilityPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
