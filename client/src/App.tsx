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
import CoachPortal from "@/pages/coach-portal";
import AdminLand from "@/pages/admin-land";
import PaymentsPage from "@/pages/payments-page";
import CheckoutPage from "@/pages/checkout-page";
import { ProtectedRoute, AdminRoute, InstructorRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/classes" component={ClassManagement} />
      <ProtectedRoute path="/members" component={MembersPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <AdminRoute path="/reports" component={ReportsPage} />
      <InstructorRoute path="/coach-portal" component={CoachPortal} />
      <AdminRoute path="/admin-land" component={AdminLand} />
      <ProtectedRoute path="/payments" component={PaymentsPage} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
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
