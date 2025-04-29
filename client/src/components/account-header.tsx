import { Button } from "@/components/ui/button";
import { Keyboard, Award } from "lucide-react";

interface AccountHeaderProps {
  username: string;
}

export default function AccountHeader({ username }: AccountHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-card-foreground">{username}</h1>
        <div className="text-sm hover:text-card-foreground">
          <Button variant="ghost" className="flex items-center text-muted-foreground hover:text-card-foreground">
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="default" className="rounded-full bg-primary hover:bg-primary/90">
          Create a new class or event
        </Button>
        <Button variant="outline" className="rounded-full bg-transparent border-border hover:bg-accent">
          Invite new students
        </Button>
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        <span>View belt requirements</span>
        <span className="mx-2">•</span>
        <span className="flex items-center inline-flex">
          Press 
          <kbd className="mx-1 px-2 py-0.5 bg-accent rounded text-xs border border-border">
            <Keyboard className="h-3 w-3 inline mr-0.5" />
            J
          </kbd> 
          to view techniques
        </span>
      </div>
    </div>
  );
}
