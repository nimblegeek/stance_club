import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AdminButton() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleBecomeAdmin = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/become-admin");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Success",
        description: "You are now an admin. Refresh the page to see the Reports section.",
      });
    } catch (error) {
      console.error("Error becoming admin:", error);
      toast({
        title: "Error",
        description: "Failed to update your role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Only show this button if the user is not already an admin
  if (user?.role === "admin") {
    return null;
  }
  
  return (
    <Button 
      onClick={handleBecomeAdmin} 
      disabled={isLoading}
      className="mt-4"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>Become Admin (Testing)</>
      )}
    </Button>
  );
}