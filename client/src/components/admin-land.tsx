import { Card, CardContent } from "@/components/ui/card";
import { Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function AdminLand() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="bg-accent text-accent-foreground py-1 px-3 text-sm font-medium rounded-md inline-block">
            ADMIN LAND
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Key className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-medium mb-2">Administrative Controls</h3>
          <p className="text-muted-foreground max-w-xs mb-6">
            Access special admin functions to manage your dojo, including reports, user management, and system settings.
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button asChild variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
              <Link href="/reports">
                Reports
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary/10">
              <Link href="/coach-portal">
                Coach Portal
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}