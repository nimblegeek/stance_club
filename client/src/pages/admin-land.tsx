import { useAuth } from "@/hooks/use-auth";
import { Loader2, Key, Users, CalendarDays, FileText, BookOpen, Settings } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import NavHeader from "@/components/nav-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminLand() {
  const { user, isLoading } = useAuth();

  // If still loading, show a spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // This should never happen because of ProtectedRoute, but we'll handle it anyway
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl mb-4">Authentication Required</h1>
        <p>Please log in to view the admin area.</p>
      </div>
    );
  }

  // Check if user is an admin
  const isAuthorized = user.role === "admin";

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavHeader />
        <main className="flex-1 overflow-auto py-6 px-4">
          <div className="container mx-auto">
            <PageHeader
              title="Access Denied"
              description="You need administrator permissions to access this page."
              breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Admin Land" }
              ]}
            />
            <div className="mt-8 flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Admin Permission Required</CardTitle>
                  <CardDescription>
                    This area is restricted to administrators only.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    If you believe you should have access, please contact a system administrator.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavHeader />
      <main className="flex-1 overflow-auto py-6 px-4">
        <div className="container mx-auto">
          <PageHeader
            title="Admin Land"
            description="System management and administration"
            breadcrumbs={[
              { label: "Dashboard", href: "/" },
              { label: "Admin Land" }
            ]}
          />

          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3 md:grid-cols-5">
              <TabsTrigger value="overview" className="flex items-center">
                <Key className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                Schedule
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/reports">
                          Generate Reports
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/coach-portal">
                          Coach Portal
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current system metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Active Members:</dt>
                        <dd className="font-medium">43</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Classes this week:</dt>
                        <dd className="font-medium">17</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Attendance rate:</dt>
                        <dd className="font-medium">87%</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Instructors:</dt>
                        <dd className="font-medium">5</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Latest system events</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-primary pl-4 py-1">
                        <p className="text-sm font-medium">User promotion completed</p>
                        <p className="text-xs text-muted-foreground">Today at 2:30 PM</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4 py-1">
                        <p className="text-sm font-medium">Schedule updated</p>
                        <p className="text-xs text-muted-foreground">Yesterday at 5:15 PM</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4 py-1">
                        <p className="text-sm font-medium">New member registered</p>
                        <p className="text-xs text-muted-foreground">Yesterday at 11:20 AM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>View and manage user accounts and permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    User management functionality will be implemented here. This will include user listing, role management, and account settings.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="schedule" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Schedule Management</CardTitle>
                  <CardDescription>Manage class schedules and special events</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Schedule management functionality will be implemented here. This will include creating recurring classes, special events, and holiday scheduling.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reports" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reports</CardTitle>
                  <CardDescription>Generate and view system reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Reporting functionality will be implemented here. This will include attendance reports, financial reports, and student progress tracking.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Settings</CardTitle>
                  <CardDescription>Configure system-wide settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    System settings functionality will be implemented here. This will include notification settings, system preferences, and integration configurations.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}