import { Badge } from "@/components/ui/badge";
import { Kanban } from "lucide-react";

export default function CRMPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Pipeline</h1>
          <p className="text-gray-400 mt-1">Track leads from proposal to paid</p>
        </div>
        <Badge variant="success">Pro</Badge>
      </div>
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-16 text-center">
        <Kanban className="h-12 w-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">Freelancer CRM — coming in Milestone 5</p>
      </div>
    </div>
  );
}
