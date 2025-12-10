import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TenantProvider } from "@/contexts/TenantContext";
import { CartProvider } from "@/contexts/CartContext";
import { IntegrationsProvider } from "@/contexts/IntegrationsContext";
import { PasswordManagerProvider } from "@/contexts/PasswordManagerContext";
import { TwoFactorProvider } from "@/contexts/TwoFactorContext";
import { TourProvider } from "@/contexts/TourContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { HealthMonitorProvider } from "@/contexts/HealthMonitorContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { TourOverlay } from "@/components/tour/TourOverlay";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { KeyboardShortcutsProvider } from "@/components/layout/KeyboardShortcutsProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Tenants from "./pages/Tenants";
import Sites from "./pages/Sites";
import Users from "./pages/Users";
import Roles from "./pages/Roles";
import Integrations from "./pages/Integrations";
import AuditLogs from "./pages/AuditLogs";
import Settings from "./pages/Settings";
import Mail from "./pages/Mail";
import SocialPrefill from "./pages/SocialPrefill";
import PasswordManager from "./pages/PasswordManager";
import GuidedTour from "./pages/GuidedTour";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <AuthProvider>
          <TenantProvider>
            <CartProvider>
              <IntegrationsProvider>
                <PasswordManagerProvider>
                  <TwoFactorProvider>
                    <NotificationProvider>
                      <HealthMonitorProvider>
                        <TourProvider>
                          <Toaster />
                          <Sonner />
                          <TourOverlay />
                          <BrowserRouter>
                            <KeyboardShortcutsProvider>
                              <CommandPalette />
                              <Routes>
                                <Route path="/auth" element={<Auth />} />
                                <Route path="/" element={
                                  <ProtectedRoute>
                                    <Index />
                                  </ProtectedRoute>
                                } />
                                <Route path="/mail" element={
                                  <ProtectedRoute>
                                    <Mail />
                                  </ProtectedRoute>
                                } />
                                <Route path="/social-prefill" element={
                                  <ProtectedRoute>
                                    <SocialPrefill />
                                  </ProtectedRoute>
                                } />
                                <Route path="/passwords" element={
                                  <ProtectedRoute>
                                    <PasswordManager />
                                  </ProtectedRoute>
                                } />
                                <Route path="/tenants" element={
                                  <ProtectedRoute>
                                    <Tenants />
                                  </ProtectedRoute>
                                } />
                                <Route path="/sites" element={
                                  <ProtectedRoute>
                                    <Sites />
                                  </ProtectedRoute>
                                } />
                                <Route path="/users" element={
                                  <ProtectedRoute>
                                    <Users />
                                  </ProtectedRoute>
                                } />
                                <Route path="/roles" element={
                                  <ProtectedRoute>
                                    <Roles />
                                  </ProtectedRoute>
                                } />
                                <Route path="/integrations" element={
                                  <ProtectedRoute>
                                    <Integrations />
                                  </ProtectedRoute>
                                } />
                                <Route path="/audit-logs" element={
                                  <ProtectedRoute>
                                    <AuditLogs />
                                  </ProtectedRoute>
                                } />
                                <Route path="/settings" element={
                                  <ProtectedRoute>
                                    <Settings />
                                  </ProtectedRoute>
                                } />
                                <Route path="/guided-tour" element={
                                  <ProtectedRoute>
                                    <GuidedTour />
                                  </ProtectedRoute>
                                } />
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </KeyboardShortcutsProvider>
                          </BrowserRouter>
                        </TourProvider>
                      </HealthMonitorProvider>
                    </NotificationProvider>
                  </TwoFactorProvider>
                </PasswordManagerProvider>
              </IntegrationsProvider>
            </CartProvider>
          </TenantProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
