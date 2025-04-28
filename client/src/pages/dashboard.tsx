import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import AccountHeader from "@/components/account-header";
import ProjectCard from "@/components/project-card";
import CalendarView from "@/components/calendar-view";
import AssignmentsPanel from "@/components/assignments-panel";

// BJJ classes and events data
const bjjClasses = [
  {
    id: "class-1",
    isSample: false,
    title: "Fundamentals Class",
    description: "The foundation of Brazilian Jiu-Jitsu. Perfect for beginners learning the basics and for experienced practitioners to refine their technique.",
    members: ["Coach", "Assistant1"]
  },
  {
    id: "class-2",
    isSample: false,
    title: "Advanced Techniques",
    description: "For intermediate to advanced students focusing on competition-oriented techniques and strategies.",
    members: ["Coach", "Assistant1", "Assistant2"]
  },
  {
    id: "event-1",
    isSample: false,
    title: "Weekend Competition Prep",
    description: "🥋 Special training sessions to prepare for upcoming tournaments. Focused on competition scenarios and strategies.",
    members: ["Coach", "Assistant1", "Assistant2", "CompTeam1", "CompTeam2", "CompTeam3", "CompTeam4", "CompTeam5"]
  },
  {
    id: "event-2",
    isSample: false,
    title: "Monthly Belt Promotion",
    description: "End of month promotion ceremony for qualifying students.",
    members: ["Coach", "Assistant1", "Assistant2"]
  }
];

export default function Dashboard() {
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white">
        <h1 className="text-2xl mb-4">Authentication Required</h1>
        <p>Please log in to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Main Content */}
      <main className="flex-1 overflow-auto py-6 px-4">
        <div className="container mx-auto">
          <PageHeader
            title="Dashboard"
            description="Welcome to DojoMaster"
            breadcrumbs={[{ label: "Dashboard" }]}
          />
          
          {/* Account Info & Actions */}
          <AccountHeader username={user.username} />

          {/* Classes Section */}
          <div className="mb-10">
            {/* Next Class */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">Next Scheduled Class</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <ProjectCard 
                  title="No-Gi Advanced Class" 
                  description="Today at 7:00 PM - Focus on leg locks and submission transitions"
                  members={[user.username, "Assistant1"]}
                />
              </div>
            </div>

            {/* Classes and Events Heading */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-sm font-medium text-muted-foreground">CLASSES & EVENTS</span>
              </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bjjClasses.map((bjjClass) => (
                <ProjectCard 
                  key={bjjClass.id}
                  title={bjjClass.title} 
                  description={bjjClass.description} 
                  members={bjjClass.members}
                  isSample={bjjClass.isSample}
                />
              ))}
            </div>
          </div>

          {/* Schedule and Student Progress Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Schedule */}
            <CalendarView />
            
            {/* Student Progress Panel */}
            <AssignmentsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
