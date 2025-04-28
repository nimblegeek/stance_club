import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import ClassManagement from "@/pages/class-management";
import MembersPage from "@/pages/members-page";
import EventsPage from "@/pages/events-page";
import ReportsPage from "@/pages/reports-page";
import { ProtectedRoute, AdminRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/classes" component={ClassManagement} />
      <ProtectedRoute path="/members" component={MembersPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <AdminRoute path="/reports" component={ReportsPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
