import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import MyCreations from "./pages/MyCreations";
import CreationPage from "./pages/CreationPage";
import Inspiration from "./pages/Inspiration";
import StudioPage from "./pages/StudioPage";
import GameLab from "./pages/GameLab";
import Community from "./pages/Community";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/my-creations" element={<MyCreations />} />
            <Route path="/creation/:id" element={<CreationPage />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/game-lab" element={<GameLab />} />
            <Route path="/community" element={<Community />} />
            <Route path="/studio/new" element={<StudioPage />} />
            <Route path="/studio/:id" element={<StudioPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
