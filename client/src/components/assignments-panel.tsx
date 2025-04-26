import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function AssignmentsPanel() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4">
        <div className="bg-accent text-accent-foreground py-1 px-3 text-sm font-medium rounded-md mb-4 inline-block">
          YOUR ASSIGNMENTS
        </div>
        
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground max-w-xs">
            You don't have any assignments right now. To-dos and cards assigned to you will show up here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
