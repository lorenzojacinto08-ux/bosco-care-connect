import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Guidance from "./pages/Guidance";
import GuidanceScheduling from "./pages/GuidanceScheduling";
import GuidanceHistory from "./pages/GuidanceHistory";
import Pastoral from "./pages/Pastoral";
import PastoralEvents from "./pages/PastoralEvents";
import SacramentalScriptures from "./pages/SacramentalScriptures";
import StudentRecords from "./pages/StudentRecords";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/guidance" element={<ProtectedRoute><Guidance /></ProtectedRoute>} />
            <Route path="/guidance/scheduling" element={<ProtectedRoute><GuidanceScheduling /></ProtectedRoute>} />
            <Route path="/guidance/history" element={<ProtectedRoute requireAdmin><GuidanceHistory /></ProtectedRoute>} />
            <Route path="/pastoral" element={<ProtectedRoute><Pastoral /></ProtectedRoute>} />
            <Route path="/pastoral/events" element={<ProtectedRoute><PastoralEvents /></ProtectedRoute>} />
            <Route path="/pastoral/scriptures" element={<ProtectedRoute><SacramentalScriptures /></ProtectedRoute>} />
            <Route path="/student-records" element={<ProtectedRoute requireAdmin><StudentRecords /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
