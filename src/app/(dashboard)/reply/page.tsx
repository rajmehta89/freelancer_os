/**
 * /reply — Reply Assistant page
 * Server component: loads plan info, passes to client.
 */

import { redirect }      from "next/navigation";
import { createClient }  from "@/lib/supabase/server";
import { ReplyClient }   from "./ReplyClient";

export const metadata = { title: "Reply Assistant — FreelancerOS" };

export default async function ReplyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, replies_used")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Reply Assistant</h1>
        <p className="text-gray-400 mt-1">
          Handle lowball offers, follow-ups, and negotiations like a pro
        </p>
      </div>

      <ReplyClient
        plan={        (profile?.plan as "free" | "pro" | "agency") ?? "free"}
        repliesUsed={ profile?.replies_used ?? 0}
      />
    </div>
  );
}
