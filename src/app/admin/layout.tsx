import { redirect } from "next/navigation";

import {
  Plus_Jakarta_Sans,
} from "next/font/google";

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

  /* -------------------------------------------------
     CHECK AUTHENTICATION
  ------------------------------------------------- */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  /*
   * Not logged in:
   * send the visitor to the login page.
   */
  if (userError || !user) {
    redirect(
      "/login?redirectTo=/admin",
    );
  }

  /* -------------------------------------------------
     CHECK ADMIN AUTHORIZATION
  ------------------------------------------------- */

  const {
    data: adminAccess,
    error: adminAccessError,
  } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  /*
   * Fail closed.
   *
   * If Supabase cannot verify admin access,
   * do not allow access to the admin panel.
   */
  if (adminAccessError) {
    console.error(
      "ADMIN AUTHORIZATION ERROR:",
      adminAccessError,
    );

    redirect("/");
  }

  /*
   * User is authenticated,
   * but their UID is not in admin_users.
   */
  if (!adminAccess) {
    redirect("/");
  }

  /* -------------------------------------------------
     AUTHORIZED ADMIN
  ------------------------------------------------- */

  return (
    <div
      className={`${jakarta.className} min-h-screen bg-[#FEFEFE] text-[#27430D]`}
    >
      <AdminSidebar />

      {/* Leave room for the fixed sidebar on desktop. */}
      <main className="min-h-screen lg:ml-68">
        {children}
      </main>

      {/*
       * One notification renderer for the
       * entire admin application.
       */}
      <AdminToastHost />
    </div>
  );
}