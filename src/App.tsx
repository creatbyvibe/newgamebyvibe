import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Analytics } from "@vercel/analytics/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Loading } from "@/components/Loading";
import "@/lib/i18n/config"; // Initialize i18n
import Index from "./pages/Index";

// 懒加载非关键页面
const MyCreations = lazy(() => import("./pages/MyCreations"));
const CreationPage = lazy(() => import("./pages/CreationPage"));
const Inspiration = lazy(() => import("./pages/Inspiration"));
const StudioPage = lazy(() => import("./pages/StudioPage"));
const GameLab = lazy(() => import("./pages/GameLab"));
const Community = lazy(() => import("./pages/Community"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<Loading fullScreen text="加载中..." />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route
                  path="/my-creations"
                  element={
                    <Suspense fallback={<Loading text="加载我的创作..." />}>
                      <MyCreations />
                    </Suspense>
                  }
                />
                <Route
                  path="/creation/:id"
                  element={
                    <Suspense fallback={<Loading text="加载创作..." />}>
                      <CreationPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/inspiration"
                  element={
                    <Suspense fallback={<Loading text="加载灵感库..." />}>
                      <Inspiration />
                    </Suspense>
                  }
                />
                <Route
                  path="/game-lab"
                  element={
                    <Suspense fallback={<Loading text="加载游戏实验室..." />}>
                      <GameLab />
                    </Suspense>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <Suspense fallback={<Loading text="加载社区..." />}>
                      <Community />
                    </Suspense>
                  }
                />
                <Route
                  path="/studio/new"
                  element={
                    <Suspense fallback={<Loading text="加载工作室..." />}>
                      <StudioPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/studio/:id"
                  element={
                    <Suspense fallback={<Loading text="加载工作室..." />}>
                      <StudioPage />
                    </Suspense>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route
                  path="*"
                  element={
                    <Suspense fallback={<Loading text="加载中..." />}>
                      <NotFound />
                    </Suspense>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Analytics />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
