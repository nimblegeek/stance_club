import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import UserAvatar from "./user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Bell,
  Menu,
  Home,
  Calendar,
  Users,
  BookOpen,
  BarChart,
  Award,
  LogOut,
  Loader2,
} from "lucide-react";

export default function NavHeader() {
  const { user, logoutMutation, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <Button variant="ghost" className="p-0 mr-2 text-primary" asChild>
                <a href="#" className="flex items-center">
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <span className="ml-2 text-lg font-bold text-card-foreground">
                    Stance
                  </span>
                </a>
              </Button>
            </div>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <Button variant="ghost" className="p-0 mr-2 text-primary" asChild>
                <a href="#" className="flex items-center">
                  <svg
                    className="h-8 w-8"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                  </svg>
                  <span className="ml-2 text-lg font-bold text-card-foreground">
                    Stance
                  </span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const [location] = useLocation();

  const navItems = [
    {
      name: "Dashboard",
      icon: <Home className="h-4 w-4 mr-2" />,
      path: "/",
      active: location === "/",
    },
    {
      name: "Classes",
      icon: <Calendar className="h-4 w-4 mr-2" />,
      path: "/classes",
      active: location === "/classes",
    },
    {
      name: "Members",
      icon: <Users className="h-4 w-4 mr-2" />,
      path: "/members",
      active: location === "/members" || location.startsWith("/members/"),
    },
    {
      name: "Techniques",
      icon: <BookOpen className="h-4 w-4 mr-2" />,
      path: "/techniques",
      active: location === "/techniques",
    },
    {
      name: "Promotions",
      icon: <Award className="h-4 w-4 mr-2" />,
      path: "/promotions",
      active: location === "/promotions",
    },
  ];

  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex items-center mr-8">
            <Button variant="ghost" className="p-0 mr-2 text-primary" asChild>
              <Link href="/" className="flex items-center">
                <svg
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
                <span className="ml-3 text-xl font-bold text-card-foreground">
                  Stance
                </span>
              </Link>
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={`text-sm ${item.active ? "text-card-foreground" : "text-muted-foreground"} hover:text-card-foreground`}
                asChild
              >
                <Link href={item.path}>{item.name}</Link>
              </Button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-card-foreground"
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-card-foreground"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <UserAvatar username={user.username} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.username}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden py-2 px-4 mt-2 bg-accent rounded-md">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className={`justify-start ${item.active ? "text-card-foreground" : "text-muted-foreground"} hover:text-card-foreground`}
                asChild
              >
                <Link href={item.path}>
                  {item.icon}
                  {item.name}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
