import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import UnlockEvent from "./pages/UnlockEvent";
import Dashboard from "./pages/Dashboard";
import AccessByPin from "./pages/AccessByPin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/criar" element={<CreateEvent />} />
          <Route path="/editar/:id" element={<EditEvent />} />
          <Route path="/desbloquear/:id" element={<UnlockEvent />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/acessar-pin" element={<AccessByPin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
