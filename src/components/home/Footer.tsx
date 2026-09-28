import Image from "next/image";
import Link from "next/link";

import NewsletterSignup from "@/components/home/NewsletterSignup";

const exploreLinks = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Articles",
    href: "/articles",
  },
  {
    label: "About",
    href: "/#purpose",
  },
  {
    label: "Contact",
    href: "/#footer",
  },
];

const followLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/thecompass.id/",
  },
  {
    label: "Substack",
    href: "https://substack.com/@thecompassedu",
  },
  {
    label: "Email",
    href: "mailto:thecompass.id@gmail.com",
  },
];

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-[#F8F5EC]"
    >
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Main footer */}
        <div className="grid gap-12 pb-12 pt-4 sm:py-14 lg:grid-cols-[1.7fr_0.75fr_0.75fr] lg:gap-20 lg:py-16">
          {/* Brand */}
          <div>
            <Link
              href="/"
              aria-label="The Compass home"
              className="inline-flex items-center gap-4"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FEFCF5] shadow-[0_8px_24px_rgba(39,67,13,0.08)]">
                <Image
                  src="/images/logo.svg"
                  alt=""
                  width={38}
                  height={38}
                  className="h-9 w-9 object-contain"
                />
              </div>

              <span className="font-essays text-2xl font-bold uppercase tracking-[0.03em] text-[#27430D] sm:text-[28px]">
                The Compass
              </span>
            </Link>

            <p className="mt-7 max-w-lg font-essays text-[16px] leading-8 text-[#6F6E60] sm:text-[17px]">
              bridging the gap of financial literacy across the world.
            </p>

            <div className="mt-7 space-y-4">
              <a
                href="mailto:thecompass.id@gmail.com"
                className="group flex w-fit items-center gap-4 font-essays text-[15px] text-[#666658] transition-colors hover:text-[#27430D] sm:text-base"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-[#718F14]"
                  aria-hidden="true"
                >
                  <rect
                    width="20"
                    height="16"
                    x="2"
                    y="4"
                    rx="2"
                  />

                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>

                <span className="transition-opacity group-hover:opacity-80">
                  thecompass.id@gmail.com
                </span>
              </a>

              <div className="flex items-center gap-4 font-essays text-[15px] text-[#666658] sm:text-base">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-[#718F14]"
                  aria-hidden="true"
                >
                  <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />

                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                  />
                </svg>

                <span>Jakarta, Indonesia</span>
              </div>
            </div>
          </div>

          {/* Explore */}
          <div>
            <p className="font-essays text-sm font-bold uppercase tracking-[0.28em] text-[#687704]">
              Explore
            </p>

            <nav
              aria-label="Footer navigation"
              className="mt-7 flex flex-col items-start gap-5"
            >
              {exploreLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="
                    relative
                    font-essays
                    text-lg
                    text-[#27430D]
                    transition-opacity
                    duration-300
                    after:absolute
                    after:-bottom-1
                    after:left-0
                    after:h-px
                    after:w-full
                    after:origin-left
                    after:scale-x-0
                    after:bg-[#27430D]
                    after:transition-transform
                    after:duration-300
                    hover:after:scale-x-100
                  "
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Follow */}
          <div>
            <p className="font-essays text-sm font-bold uppercase tracking-[0.28em] text-[#687704]">
              Follow
            </p>

            <div className="mt-7 flex flex-col items-start gap-5">
              {followLinks.map((link) => {
                const isEmail =
                  link.label === "Email";

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target={
                      isEmail
                        ? undefined
                        : "_blank"
                    }
                    rel={
                      isEmail
                        ? undefined
                        : "noopener noreferrer"
                    }
                    className="
                      relative
                      font-essays
                      text-lg
                      text-[#27430D]
                      transition-opacity
                      duration-300
                      after:absolute
                      after:-bottom-1
                      after:left-0
                      after:h-px
                      after:w-full
                      after:origin-left
                      after:scale-x-0
                      after:bg-[#27430D]
                      after:transition-transform
                      after:duration-300
                      hover:after:scale-x-100
                    "
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-[#27430D]/15 py-10 sm:py-12">
          <div className="grid items-start gap-0 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <h2 className="font-essays text-3xl font-bold text-[#27430D] sm:text-[32px]">
                Stay on course.
              </h2>

              <p className="mt-3 font-essays text-[16px] leading-7 text-[#777466] sm:text-[17px]">
                New articles and fun facts, straight to your inbox.
              </p>
            </div>

            <div className="lg:-mt-9">
              <NewsletterSignup />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[#27430D]/15 py-6">
          <p className="font-essays text-[13px] text-[#6F6E60] sm:text-sm">
            © 2026 The Compass. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}