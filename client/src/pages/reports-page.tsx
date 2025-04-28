import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import NavHeader from "@/components/nav-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, FileText, BarChart2, ChevronDown, Download, Users, Calendar } from "lucide-react";

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("statistics");
  
  // Check if user is admin
  const isAdmin = user && user.role === "admin";

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavHeader />
        <main className="flex-1 overflow-auto py-6 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col items-center justify-center h-[60vh]">
              <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
              <p className="text-muted-foreground">You need admin permissions to view this page.</p>
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
            title="Reports"
            description="Access statistics, reports, and documents"
            breadcrumbs={[{ label: "Reports" }]}
          />
          
          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            {/* Statistics Tab */}
            <TabsContent value="statistics" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                    <CardDescription>All registered users</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">126</div>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">+12 from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Class Attendance</CardTitle>
                    <CardDescription>Monthly average</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">85%</div>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">+4% from last month</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Instructors</CardTitle>
                    <CardDescription>Current count</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">8</div>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Same as last month</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>Monthly class attendance over time</CardDescription>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center">
                  <div className="text-muted-foreground flex flex-col items-center">
                    <BarChart2 className="h-16 w-16 mb-4" />
                    <p>Chart visualization would appear here</p>
                    <p className="text-sm">Showing attendance data for the last 6 months</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Available Reports</CardTitle>
                  <CardDescription>Download and analyze member and class data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Member Activity Report</p>
                          <p className="text-sm text-muted-foreground">All member attendance, classes, and progress</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Export
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Class Performance Report</p>
                          <p className="text-sm text-muted-foreground">Attendance rates and class popularity metrics</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Export
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Instructor Workload Report</p>
                          <p className="text-sm text-muted-foreground">Instructor hours, classes taught, and student feedback</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Custom Reports</CardTitle>
                  <CardDescription>Generate custom reports with specific parameters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40">
                    <Button className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Create Custom Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Dojo Documents</CardTitle>
                  <CardDescription>Official documents and templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Liability Waiver Template</p>
                          <p className="text-sm text-muted-foreground">Standard liability waiver for new members</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Membership Agreement</p>
                          <p className="text-sm text-muted-foreground">Standard membership terms and conditions</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Dojo Rules and Etiquette</p>
                          <p className="text-sm text-muted-foreground">Guidelines for behavior in the dojo</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-3 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Belt Promotion Criteria</p>
                          <p className="text-sm text-muted-foreground">Requirements for each belt promotion</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="flex items-center">
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Upload Document</CardTitle>
                  <CardDescription>Add new documents to the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40">
                    <Button className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Upload New Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}