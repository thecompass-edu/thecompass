"use client";

import { useState } from "react";

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
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const [
    isLogoutModalOpen,
    setIsLogoutModalOpen,
  ] = useState(false);

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
    <>
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

        {/* Main navigation */}
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

        {/* Bottom actions */}
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

          <button
            type="button"
            onClick={() =>
              setIsLogoutModalOpen(true)
            }
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
        </div>
      </aside>

      {/* Logout confirmation */}
      {isLogoutModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-100
            flex
            items-center
            justify-center
            bg-black/30
            px-5
            backdrop-blur-[2px]
          "
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setIsLogoutModalOpen(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            aria-describedby="logout-description"
            className="
              w-full
              max-w-md
              rounded-2xl
              border
              border-[#27430D]/10
              bg-white
              p-6
              shadow-[0_24px_70px_rgba(39,67,13,0.18)]
              sm:p-7
            "
          >
            <h2
              id="logout-title"
              className="text-xl font-bold tracking-tight text-[#27430D]"
            >
              Sign out?
            </h2>

            <p
              id="logout-description"
              className="mt-2 text-sm leading-6 text-[#523A23]/60"
            >
              Are you sure you want to sign out
              of The Compass admin?
            </p>

            <div className="mt-7 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setIsLogoutModalOpen(false)
                }
                className="
                  rounded-xl
                  border
                  border-[#27430D]/10
                  bg-white
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-[#523A23]/70
                  transition
                  duration-200
                  hover:bg-[#F7FAF3]
                  hover:text-[#27430D]
                "
              >
                Cancel
              </button>

              <form action={logout}>
                <button
                  type="submit"
                  className="
                    rounded-xl
                    bg-red-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    duration-200
                    hover:bg-red-700
                    focus:outline-none
                    focus:ring-4
                    focus:ring-red-600/15
                  "
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}