import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Profile, tone preferences &amp; templates</p>
      </div>
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-16 text-center">
        <Settings className="h-12 w-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">Settings — coming in Milestone 5</p>
      </div>
    </div>
  );
}
