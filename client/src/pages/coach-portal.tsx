import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import NavHeader from "@/components/nav-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Video, FileText, Users, Medal, Award } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function CoachPortal() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("resources");

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
        <p>Please log in to view the coach portal.</p>
      </div>
    );
  }

  // Check if user is an instructor or admin
  const isAuthorized = user.role === "instructor" || user.role === "admin";

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <NavHeader />
        <main className="flex-1 overflow-auto py-6 px-4">
          <div className="container mx-auto">
            <PageHeader
              title="Access Denied"
              description="You need instructor or admin permissions to access this page."
              breadcrumbs={[
                { label: "Dashboard", href: "/" },
                { label: "Coach Portal" }
              ]}
            />
            <div className="mt-8 flex justify-center">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Permission Required</CardTitle>
                  <CardDescription>
                    This area is restricted to coaches and administrators.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    If you believe you should have access, please contact an administrator.
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
            title="Coach Portal"
            description="Access teaching resources and manage your classes"
            breadcrumbs={[
              { label: "Dashboard", href: "/" },
              { label: "Coach Portal" }
            ]}
          />

          <Tabs 
            defaultValue="resources" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mt-6"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-4">
              <TabsTrigger value="resources" className="flex items-center">
                <Book className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Teaching</span> Resources
              </TabsTrigger>
              <TabsTrigger value="curriculum" className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Curriculum
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Instructional Videos
              </TabsTrigger>
              <TabsTrigger value="certification" className="flex items-center">
                <Medal className="w-4 h-4 mr-2" />
                Certification
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="resources" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Lesson Plans</CardTitle>
                    <CardDescription>Ready-to-use class session structures</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                      <li>Beginner BJJ Fundamentals</li>
                      <li>Intermediate Techniques</li>
                      <li>Advanced Competition Prep</li>
                      <li>No-Gi Specific Training</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Guides</CardTitle>
                    <CardDescription>Methodologies for effective instruction</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                      <li>Teaching Mixed Level Classes</li>
                      <li>Correcting Common Mistakes</li>
                      <li>Class Management Tips</li>
                      <li>Injury Prevention Guidelines</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Student Assessment</CardTitle>
                    <CardDescription>Tools to track student progress</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 list-disc list-inside text-muted-foreground">
                      <li>Belt Promotion Criteria</li>
                      <li>Skill Assessment Checklists</li>
                      <li>Performance Evaluation Forms</li>
                      <li>Competition Readiness Metrics</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="curriculum" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Structured Curriculum</CardTitle>
                    <CardDescription>Organized by belt level and experience</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium flex items-center">
                          <span className="inline-block w-3 h-3 bg-white mr-2 rounded-full"></span>
                          White Belt
                        </h3>
                        <p className="text-sm text-muted-foreground ml-5">Basic positions, escapes, and control principles</p>
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          <span className="inline-block w-3 h-3 bg-blue-500 mr-2 rounded-full"></span>
                          Blue Belt
                        </h3>
                        <p className="text-sm text-muted-foreground ml-5">Submissions, sweeps, and basic combinations</p>
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          <span className="inline-block w-3 h-3 bg-purple-500 mr-2 rounded-full"></span>
                          Purple Belt
                        </h3>
                        <p className="text-sm text-muted-foreground ml-5">Advanced techniques and strategic application</p>
                      </div>
                      <div>
                        <h3 className="font-medium flex items-center">
                          <span className="inline-block w-3 h-3 bg-brown-500 mr-2 rounded-full"></span>
                          Brown Belt
                        </h3>
                        <p className="text-sm text-muted-foreground ml-5">Refinement, teaching skills, and advanced transitions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Order</CardTitle>
                    <CardDescription>Recommended sequence for effective learning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-4 list-decimal list-inside">
                      <li className="text-muted-foreground">
                        <span className="text-card-foreground font-medium">Foundational Movement</span>
                        <p className="text-sm ml-5">Shrimping, bridging, technical stand-up, and hip mobility</p>
                      </li>
                      <li className="text-muted-foreground">
                        <span className="text-card-foreground font-medium">Positional Control</span>
                        <p className="text-sm ml-5">Side control, mount, back control, and guard positions</p>
                      </li>
                      <li className="text-muted-foreground">
                        <span className="text-card-foreground font-medium">Escapes & Reversals</span>
                        <p className="text-sm ml-5">Defensive techniques from inferior positions</p>
                      </li>
                      <li className="text-muted-foreground">
                        <span className="text-card-foreground font-medium">Submissions & Finishes</span>
                        <p className="text-sm ml-5">Joint locks, chokes, and submission entries</p>
                      </li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="videos" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Fundamental Techniques</CardTitle>
                    <CardDescription>Building blocks for all students</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                      <Video className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Detailed breakdowns of essential techniques every student must master
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Competition Training</CardTitle>
                    <CardDescription>Preparing students for tournaments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                      <Video className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Competition-specific training methodologies and drills
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle>Teaching Methodology</CardTitle>
                    <CardDescription>Effective coaching techniques</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center mb-4">
                      <Video className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Demonstrations of teaching approaches for different learning styles
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="certification" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Coach Certification Program</CardTitle>
                  <CardDescription>Structured pathway for instructor development</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Level 1 Certification</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Fundamental teaching skills and basic class management. Required for all assistant instructors.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Level 2 Certification</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Advanced teaching methodology and curriculum development. For lead instructors.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Award className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Level 3 Certification</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Master instructor qualification. Ability to certify other coaches and develop specialized programs.
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 mt-6">
                      <p className="text-sm">
                        To begin your certification journey, please contact the head instructor to schedule your assessment and training sessions.
                      </p>
                    </div>
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