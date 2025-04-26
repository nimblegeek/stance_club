import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NavHeader from "@/components/nav-header";
import AccountHeader from "@/components/account-header";
import ProjectCard from "@/components/project-card";
import CalendarView from "@/components/calendar-view";
import AssignmentsPanel from "@/components/assignments-panel";

// Sample project data
const sampleProjects = [
  {
    id: "sample-1",
    isSample: true,
    title: "Getting Started",
    description: "Quickly get up to speed with everything Basecamp",
    members: ["JD"]
  },
  {
    id: "sample-2",
    isSample: true,
    title: "Making a Podcast",
    description: "👋 This is a sample project to showcase how we use ProjectHub to make a podcast called REWORK. Take a look...",
    members: ["User1", "User2", "User3", "User4", "User5", "User6", "User7", "User8"]
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
      {/* Header */}
      <NavHeader />

      {/* Main Content */}
      <main className="flex-1 overflow-auto py-6 px-4">
        <div className="container mx-auto">
          {/* Account Info & Actions */}
          <AccountHeader username={user.username} />

          {/* Projects Section */}
          <div className="mb-10">
            {/* Main Project */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ProjectCard 
                title="My Project" 
                description="" 
                members={[user.username]}
              />
            </div>

            {/* Sample Projects Heading */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-sm font-medium text-muted-foreground">SAMPLE PROJECTS</span>
              </div>
            </div>

            {/* Sample Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleProjects.map((project) => (
                <ProjectCard 
                  key={project.id}
                  title={project.title} 
                  description={project.description} 
                  members={project.members}
                  isSample={project.isSample}
                />
              ))}
            </div>
          </div>

          {/* Schedule and Assignments Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Schedule */}
            <CalendarView />
            
            {/* Assignments Panel */}
            <AssignmentsPanel />
          </div>
        </div>
      </main>
    </div>
  );
}
