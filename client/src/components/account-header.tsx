import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

interface AccountHeaderProps {
  username: string;
}

export default function AccountHeader({ username }: AccountHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">{username}</h1>
        <div className="text-sm text-gray-400 hover:text-white">
          <Button variant="ghost" className="flex items-center text-muted-foreground hover:text-white">
            <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" 
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            <span>Adminland</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button variant="default" className="rounded-full bg-primary hover:bg-primary/90">
          Upgrade to add another project
        </Button>
        <Button variant="outline" className="rounded-full bg-transparent border-gray-700 hover:bg-gray-800">
          Invite people
        </Button>
      </div>
      <div className="mt-3 text-sm text-gray-400">
        <span>View templates</span>
        <span className="mx-2">•</span>
        <span className="flex items-center inline-flex">
          Press 
          <kbd className="mx-1 px-2 py-0.5 bg-gray-800 rounded text-xs border border-gray-700">
            <Keyboard className="h-3 w-3 inline mr-0.5" />
            J
          </kbd> 
          anytime to jump
        </span>
      </div>
    </div>
  );
}
