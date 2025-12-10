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
import { TourOverlay } from "@/components/tour/TourOverlay";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
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
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/mail" element={<Mail />} />
                            <Route path="/social-prefill" element={<SocialPrefill />} />
                            <Route path="/passwords" element={<PasswordManager />} />
                            <Route path="/tenants" element={<Tenants />} />
                            <Route path="/sites" element={<Sites />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/roles" element={<Roles />} />
                            <Route path="/integrations" element={<Integrations />} />
                            <Route path="/audit-logs" element={<AuditLogs />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/guided-tour" element={<GuidedTour />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </BrowserRouter>
                      </TourProvider>
                    </HealthMonitorProvider>
                  </NotificationProvider>
                </TwoFactorProvider>
              </PasswordManagerProvider>
            </IntegrationsProvider>
          </CartProvider>
        </TenantProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
