import { redirect }    from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar }      from "@/components/shared/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Get authenticated user — server-side, secure
  const { data: authData, error } = await supabase.auth.getUser();
  const user = authData?.user ?? null;
  if (error || !user) redirect("/login");

  // Fetch profile for sidebar
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen bg-gray-950 overflow-hidden">
      <Sidebar
        userEmail={user.email}
        userName={profile?.full_name ?? undefined}
        plan={(profile?.plan as "free" | "pro" | "agency") ?? "free"}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto md:pt-0 pt-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
