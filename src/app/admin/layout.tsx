import { redirect } from "next/navigation";

import {
  Plus_Jakarta_Sans,
} from "next/font/google";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminToastHost from "@/components/admin/AdminToastHost";

import { createClient } from "@/lib/supabase/server";

const jakarta =
  Plus_Jakarta_Sans({
    subsets: ["latin"],
    display: "swap",
    variable:
      "--font-jakarta",
  });

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  // Protect every route inside /admin.
  if (!user) {
    redirect(
      "/login?redirectTo=/admin",
    );
  }

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