import { Card, CardContent } from "@/components/ui/card";
import UserAvatar from "./user-avatar";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  title: string;
  description: string;
  members: string[];
  isSample?: boolean;
  className?: string;
}

export default function ProjectCard({
  title,
  description,
  members,
  isSample = false,
  className = "",
}: ProjectCardProps) {
  return (
    <Card className={cn(
      "bg-card border-border hover:bg-accent transition-colors duration-300", 
      className
    )}>
      <CardContent className="p-5">
        {isSample && (
          <div className="mb-1 text-sm text-orange-400">Sample</div>
        )}
        <h3 className="text-lg font-semibold mb-2 text-card-foreground">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
        )}
        
        {/* Add spacing when no description to match design */}
        {!description && <div className="mt-16"></div>}
        
        {/* Project members avatars */}
        <div className={cn(
          "mt-4 flex", 
          members.length > 1 ? "-space-x-2 overflow-hidden" : ""
        )}>
          {members.map((member, index) => (
            <UserAvatar 
              key={index}
              username={member}
              className={members.length > 1 ? "ring-2 ring-card" : ""}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
