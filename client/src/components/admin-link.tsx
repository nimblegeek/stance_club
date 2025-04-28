import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function AdminLink() {
  const { user } = useAuth();
  
  // Only show this button if the user is an admin
  if (user?.role !== "admin") {
    return null;
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      className="text-primary border-primary hover:bg-primary/10"
      asChild
    >
      <Link href="/admin-land">
        <Key className="mr-2 h-4 w-4" />
        Admin Land
      </Link>
    </Button>
  );
}