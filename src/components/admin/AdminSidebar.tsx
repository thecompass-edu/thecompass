"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  DocumentTextIcon,
  ExportIcon,
  HomeIcon,
  LogoutIcon,
} from "@solar-icons/react/linear";

import { logout } from "@/app/admin/actions";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  exact?: boolean;
};

function FunFactIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9 18h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M10 22h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M8.5 15.5C6.96 14.42 6 12.64 6 10.5a6 6 0 1 1 12 0c0 2.14-.96 3.92-2.5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    exact: true,
    icon: (
      <HomeIcon
        size={20}
        strokeWidth={1.7}
        aria-hidden="true"
      />
    ),
  },
  {
    label: "Articles",
    href: "/admin/articles",
    icon: (
      <DocumentTextIcon
        size={20}
        strokeWidth={1.7}
        aria-hidden="true"
      />
    ),
  },
  {
    label: "Fun Facts",
    href: "/admin/fun-facts",
    icon: <FunFactIcon />,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(item: NavigationItem) {
    if (item.exact) {
      return pathname === item.href;
    }

    return (
      pathname === item.href ||
      pathname.startsWith(`${item.href}/`)
    );
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-68 border-r border-[#27430D]/10 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-19 items-center border-b border-[#27430D]/10 px-7">
        <Link
          href="/admin"
          className="flex items-center gap-3"
        >
          <div className="relative h-9 w-9 shrink-0">
            <Image
              src="/images/logo.svg"
              alt="The Compass"
              fill
              priority
              className="object-contain"
            />
          </div>

          <div>
            <p className="text-base font-bold tracking-tight text-[#27430D]">
              The Compass
            </p>

            <p className="text-xs font-medium text-[#523A23]/45">
              Admin
            </p>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6">
        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-[#523A23]/35">
          Content
        </p>

        <div className="space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition duration-200 ${
                  active
                    ? "bg-[#F7FAF3] text-[#27430D]"
                    : "text-[#523A23]/70 hover:bg-[#F6F1EA] hover:text-[#27430D]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition duration-200 ${
                    active
                      ? "bg-[#EEF4E7] text-[#27430D]"
                      : "text-[#687704]"
                  }`}
                >
                  {item.icon}
                </span>

                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-[#27430D]/10 p-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#523A23]/70 transition duration-200 hover:bg-[#F7FAF3] hover:text-[#27430D]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg text-[#687704]">
            <ExportIcon
              size={20}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </span>

          <span>View live website</span>
        </a>

        <form action={logout}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#523A23]/70 transition duration-200 hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg">
              <LogoutIcon
                size={20}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </span>

            <span>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}