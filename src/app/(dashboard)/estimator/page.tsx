import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

export default function EstimatorPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Project Estimator</h1>
          <p className="text-gray-400 mt-1">AI-powered timeline, pricing &amp; milestones</p>
        </div>
        <Badge variant="indigo">Milestone 4</Badge>
      </div>
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-16 text-center">
        <Calculator className="h-12 w-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">Project Estimator — coming in Milestone 4</p>
      </div>
    </div>
  );
}
