import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  username: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function UserAvatar({ 
  username, 
  className = "", 
  size = "md" 
}: UserAvatarProps) {
  // Get initials from the username
  const initials = username
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
  
  // Generate a consistent color based on the username
  const colors = [
    "bg-orange-500", // Default color
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
  ];
  
  // Simple hash function to determine color
  const colorIndex = username
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  // Size classes
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };
  
  return (
    <Avatar className={`${sizeClasses[size]} ring-2 ring-background ${colors[colorIndex]} ${className}`}>
      <AvatarFallback className="text-white font-medium">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
