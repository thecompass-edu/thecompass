import { redirect } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminToastHost from "@/components/admin/AdminToastHost";
import { createClient } from "@/lib/supabase/server";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect(
      "/login?redirectTo=/admin",
    );
  }

  // Check admin access
  const {
    data: adminAccess,
    error: adminAccessError,
  } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminAccessError) {
    console.error(
      "ADMIN AUTHORIZATION ERROR:",
      adminAccessError,
    );

    redirect("/");
  }

  if (!adminAccess) {
    redirect("/");
  }

  return (
    <div
      className={`${jakarta.className} min-h-screen bg-[#FEFEFE] text-[#27430D]`}
    >
      <AdminSidebar />

      <main className="min-h-screen lg:ml-68">
        {children}
      </main>

      <AdminToastHost />
    </div>
  );
}