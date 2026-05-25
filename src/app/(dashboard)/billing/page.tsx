import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Billing</h1>
        <p className="text-gray-400 mt-1">Manage your plan and subscription</p>
      </div>
      <div className="rounded-2xl border border-white/5 bg-gray-900/40 p-16 text-center">
        <CreditCard className="h-12 w-12 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500">Razorpay billing — coming in Milestone 6</p>
      </div>
    </div>
  );
}
