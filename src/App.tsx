import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import MicrofinancePage from "./pages/MicrofinancePage";
import CommunityPage from "./pages/CommunityPage";
import MeetingsPage from "./pages/MeetingsPage";
import SettingsPage from "./pages/SettingsPage";
import PricingPage from "./pages/PricingPage";
import DirectoryPage from "./pages/DirectoryPage";
import TransactionsPage from "./pages/TransactionsPage";
import ReceiptPage from "./pages/ReceiptPage";
import RankingPage from "./pages/RankingPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DemoPage from "./pages/DemoPage";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import MobileBottomNav from "@/components/MobileBottomNav";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <OfflineIndicator />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/annuaire" element={<DirectoryPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/community" element={
              <ProtectedRoute><CommunityPage /></ProtectedRoute>
            } />
            <Route path="/meetings" element={
              <ProtectedRoute><MeetingsPage /></ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute><SettingsPage /></ProtectedRoute>
            } />
            <Route path="/profil/:id" element={<PublicProfilePage />} />
            <Route path="/microfinance" element={<MicrofinancePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/:lokalpayId" element={<TransactionsPage />} />
            <Route path="/recu/:id" element={<ReceiptPage />} />
            <Route path="/classement" element={<RankingPage />} />
            <Route path="/admin" element={<RoleProtectedRoute requiredPermission="admin.view"><AdminDashboardPage /></RoleProtectedRoute>} />
            <Route path="/demo" element={<DemoPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <MobileBottomNav />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
