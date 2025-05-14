import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { useEffect } from "react";
import { checkAndUpdateHolidays } from "@/lib/holidayService";
import { toast } from "sonner";
import { AuthDebug } from "@/components/AuthDebug";

// Pages
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import TimeOff from "./pages/TimeOff";
import RoomBooking from "./pages/RoomBooking";
import CalendarPage from "./pages/CalendarPage";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // While checking auth status, show loading indicator or spinner
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Admin route component
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();
  
  // While checking auth status, show loading indicator or spinner
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If not admin, redirect to dashboard
  if (!isAdmin) {
    console.log("Not an admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Root component to handle basic routing based on auth state
const Root = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Only redirect after auth is initialized
    if (!isLoading) {
      if (user && location.pathname === '/login') {
        console.log("User already logged in at login page, redirecting to dashboard");
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isLoading, navigate, location.pathname]);
  
  return null;
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();
  
  // Check and update holidays when the app starts and user is authenticated
  useEffect(() => {
    const updateHolidays = async () => {
      if (user) {
        try {
          console.log('Checking and updating holidays...');
          await checkAndUpdateHolidays();
        } catch (error) {
          console.error('Failed to update holidays:', error);
          // Don't show error toast to regular users
          if (user.role === 'admin') {
            toast.error('Failed to update holidays. Please check the console for details.');
          }
        }
      }
    };
    
    updateHolidays();
  }, [user]);
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} />
      
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/time-off" element={<ProtectedRoute><TimeOff /></ProtectedRoute>} />
      <Route path="/room-booking" element={<ProtectedRoute><RoomBooking /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Enable debug mode in development
  const isDebugMode = import.meta.env.DEV;
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {isDebugMode && <AuthDebug />}
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
