import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">History</h1>
          <p className="text-gray-400 mt-1">All your past proposals and replies</p>
        </div>
        <Badge variant="success">Pro</Badge>
      </div>
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-16 text-center">
        <History className="h-12 w-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">History — coming in Milestone 5</p>
      </div>
    </div>
  );
}
