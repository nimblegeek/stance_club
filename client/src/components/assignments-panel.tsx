import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function AssignmentsPanel() {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="bg-gray-800 text-gray-300 py-1 px-3 text-sm font-medium rounded-md mb-4 inline-block">
          YOUR ASSIGNMENTS
        </div>
        
        <div className="flex flex-col items-center justify-center text-center py-12">
          <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-gray-600" />
          </div>
          <p className="text-gray-400 max-w-xs">
            You don't have any assignments right now. To-dos and cards assigned to you will show up here.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
