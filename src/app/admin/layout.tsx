import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus_Jakarta_Sans } from "next/font/google";

import { createClient } from "@/lib/supabase/server";
import { logout } from "./actions";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className={`${jakarta.className} min-h-screen bg-[#F6F1EA]`}>
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-[260px] border-r border-[#27430D]/10 bg-white lg:flex lg:flex-col">
        {/* Brand */}
        <div className="border-b border-[#27430D]/10 px-6 py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.svg"
              alt="The Compass logo"
              width={42}
              height={42}
              className="h-10 w-10"
            />

            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-[#687704]">
                THE COMPASS
              </p>

              <p className="mt-1 text-sm font-semibold text-[#27430D]">
                Admin CMS
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            <Link
              href="/admin"
              className="flex items-center rounded-xl bg-[#F6F1EA] px-4 py-3 text-sm font-semibold text-[#27430D]"
            >
              Dashboard
            </Link>

            <Link
              href="/admin/articles"
              className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-[#523A23]/65 transition hover:bg-[#F6F1EA] hover:text-[#27430D]"
            >
              Articles
            </Link>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-[#27430D]/10 p-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium text-[#523A23]/65 transition hover:bg-[#F6F1EA] hover:text-[#27430D]"
          >
            View live website
          </a>

          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center rounded-xl px-4 py-3 text-left text-sm font-medium text-[#523A23]/65 transition hover:bg-red-50 hover:text-red-700"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-h-screen lg:ml-[260px]">{children}</main>
    </div>
  );
}