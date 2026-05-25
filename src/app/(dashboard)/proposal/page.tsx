import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

export default function ProposalPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Proposal Generator</h1>
          <p className="text-gray-400 mt-1">Paste a job post → get a winning proposal</p>
        </div>
        <Badge variant="indigo">Milestone 4</Badge>
      </div>
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-16 text-center">
        <FileText className="h-12 w-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">AI Proposal Engine — coming in Milestone 4</p>
      </div>
    </div>
  );
}
