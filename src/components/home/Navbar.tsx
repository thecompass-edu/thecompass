"use client";

import {
  type MouseEvent,
  useEffect,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] =
    useState(false);

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      },
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
      );
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function scrollToSection(
    sectionId: string,
  ) {
    const section =
      document.getElementById(sectionId);

    if (!section) {
      return;
    }

    const navbarOffset = 82;

    const sectionTop =
      section.getBoundingClientRect().top +
      window.scrollY -
      navbarOffset;

    window.scrollTo({
      top: sectionTop,
      behavior: "smooth",
    });
  }

  function handleHomeClick(
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    closeMenu();

    if (pathname !== "/") {
      return;
    }

    event.preventDefault();

    window.history.replaceState(
      null,
      "",
      "/",
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleSectionClick(
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) {
    closeMenu();

    if (pathname !== "/") {
      return;
    }

    event.preventDefault();

    window.history.replaceState(
      null,
      "",
      `#${sectionId}`,
    );

    scrollToSection(sectionId);
  }

  const desktopLinkClassName = `
    group
    relative
    py-2
    transition-colors
    duration-300
    hover:text-[#687704]

    after:absolute
    after:-bottom-0.5
    after:left-0
    after:h-px
    after:w-full
    after:origin-left
    after:scale-x-0
    after:bg-[#687704]
    after:transition-transform
    after:duration-300
    after:ease-out
    hover:after:scale-x-100
  `;

  const mobileLinkClassName = `
    group
    relative
    flex
    w-full
    items-center
    rounded-2xl
    px-4
    py-4
    font-essays
    text-[22px]
    font-semibold
    text-[#27430D]
    transition-all
    duration-300
    hover:bg-[#27430D]/6
    hover:text-[#687704]
  `;

  return (
    <>
<header
  className={`
    fixed
    top-0
    z-50
    w-full

    md:sticky
    md:transition-[padding,background-color]
    md:duration-700
    md:ease-[cubic-bezier(0.22,1,0.36,1)]

    ${
      isScrolled
        ? "md:bg-transparent md:pt-5"
        : "md:bg-transparent md:pt-3"
    }
  `}
>
        {/* Mobile Navbar */}
        <nav className="border-b border-[#27430D]/8 bg-[#F8F5EC] md:hidden">
          <div className="flex min-h-20 items-center justify-between px-5">
            {/* Brand */}
            <Link
              href="/"
              onClick={handleHomeClick}
              className="group flex items-center gap-3 text-[#27430D]"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#27430D]/10 bg-white shadow-sm">
                <Image
                  src="/images/logo.svg"
                  alt="The Compass logo"
                  width={32}
                  height={32}
                  priority
                  className="
                    h-8
                    w-8
                    object-contain
                    transition-transform
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    group-hover:rotate-360
                  "
                />
              </div>

              <span className="font-essays text-lg font-semibold tracking-wide">
                THE COMPASS
              </span>
            </Link>

            {/* Menu Button */}
            <button
              type="button"
              onClick={() =>
                setIsMenuOpen(
                  (current) => !current,
                )
              }
              aria-label={
                isMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              aria-expanded={isMenuOpen}
              className="relative flex h-10 w-10 items-center justify-center text-[#27430D]"
            >
              <span
                className={`
                  absolute
                  h-0.5
                  w-6
                  rounded-full
                  bg-current
                  transition-all
                  duration-300
                  ${
                    isMenuOpen
                      ? "translate-y-0 rotate-45"
                      : "-translate-y-1.5"
                  }
                `}
              />

              <span
                className={`
                  absolute
                  h-0.5
                  w-6
                  rounded-full
                  bg-current
                  transition-all
                  duration-300
                  ${
                    isMenuOpen
                      ? "opacity-0"
                      : "opacity-100"
                  }
                `}
              />

              <span
                className={`
                  absolute
                  h-0.5
                  w-6
                  rounded-full
                  bg-current
                  transition-all
                  duration-300
                  ${
                    isMenuOpen
                      ? "translate-y-0 -rotate-45"
                      : "translate-y-1.5"
                  }
                `}
              />
            </button>
          </div>
        </nav>

        {/* Desktop Navbar */}
        <nav
          className={`
            mx-auto
            hidden
            w-full
            transition-[max-width,border-radius,background-color,border-color,box-shadow,backdrop-filter]
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]
            md:block

            ${
              isScrolled
                ? `
                  max-w-293.75
                  rounded-[36px]
                  border
                  border-white/25
                  bg-[#F8F5EC]/65
                  shadow-[0_8px_30px_rgba(39,67,13,0.08)]
                  backdrop-blur-md
                `
                : `
                  max-w-full
                  rounded-none
                  border
                  border-transparent
                  bg-transparent
                  shadow-none
                  backdrop-blur-none
                  hover:bg-[#F8F5EC]/90
                  hover:backdrop-blur-sm
                `
            }
          `}
        >
          <div
            className="
              mx-auto
              flex
              min-h-18
              w-full
              max-w-293.75
              items-center
              justify-between
              px-5
              py-2.5
              sm:px-6
              lg:px-7
            "
          >
            {/* Brand */}
            <Link
              href="/"
              onClick={handleHomeClick}
              className="group flex shrink-0 items-center gap-2.5 text-[#27430D]"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm">
                <Image
                  src="/images/logo.svg"
                  alt="The Compass logo"
                  width={38}
                  height={38}
                  priority
                  className="
                    h-9.5
                    w-9.5
                    object-contain
                    transition-transform
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    group-hover:rotate-360
                  "
                />
              </div>

              <span className="text-base font-semibold tracking-wide sm:text-[17px]">
                THE COMPASS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-9 text-[16px] font-semibold text-[#27430D] lg:gap-11">
              <Link
                href="/"
                onClick={handleHomeClick}
                className={desktopLinkClassName}
              >
                Home
              </Link>

              <Link
                href="/articles"
                className={desktopLinkClassName}
              >
                Articles
              </Link>

              <Link
                href="/#purpose"
                onClick={(event) =>
                  handleSectionClick(
                    event,
                    "purpose",
                  )
                }
                className={desktopLinkClassName}
              >
                About
              </Link>

              <Link
                href="/#footer"
                onClick={(event) =>
                  handleSectionClick(
                    event,
                    "footer",
                  )
                }
                className={desktopLinkClassName}
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Backdrop */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={closeMenu}
        className={`
          fixed
          inset-0
          z-50
          bg-black/35
          backdrop-blur-[2px]
          transition-opacity
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]
          md:hidden
          ${
            isMenuOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      />

      {/* Mobile Side Drawer */}
      <aside
        className={`
          fixed
          bottom-0
          left-0
          top-0
          z-60
          flex
          w-[84%]
          max-w-90
          flex-col
          bg-[#F8F5EC]
          shadow-[20px_0_60px_rgba(39,67,13,0.18)]
          transition-transform
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]
          md:hidden
          ${
            isMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Drawer Header */}
        <div className="flex min-h-20 items-center justify-between border-b border-[#27430D]/10 px-5">
          <Link
            href="/"
            onClick={handleHomeClick}
            className="group flex items-center gap-3 text-[#27430D]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
              <Image
                src="/images/logo.svg"
                alt="The Compass logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
            </div>

            <span className="font-essays text-base font-semibold tracking-wide">
              THE COMPASS
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close navigation menu"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              text-[#27430D]
              transition-colors
              duration-300
              hover:bg-[#27430D]/5
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={handleHomeClick}
              className={mobileLinkClassName}
            >
              <span className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#27430D]/6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m3 11 9-8 9 8" />
                  <path d="M5 10v10h14V10" />
                </svg>
              </span>

              Home
            </Link>

            <Link
              href="/articles"
              onClick={closeMenu}
              className={mobileLinkClassName}
            >
              <span className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#27430D]/6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 5h16" />
                  <path d="M4 9h16" />
                  <path d="M4 13h10" />
                  <path d="M4 17h10" />
                </svg>
              </span>

              Articles
            </Link>

            <Link
              href="/#purpose"
              onClick={(event) =>
                handleSectionClick(
                  event,
                  "purpose",
                )
              }
              className={mobileLinkClassName}
            >
              <span className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#27430D]/6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />
                  <path d="m14.8 9.2-2 5.6-5.6 2 2-5.6 5.6-2Z" />
                </svg>
              </span>

              About
            </Link>

            <Link
              href="/#footer"
              onClick={(event) =>
                handleSectionClick(
                  event,
                  "footer",
                )
              }
              className={mobileLinkClassName}
            >
              <span className="mr-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#27430D]/6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect
                    width="18"
                    height="14"
                    x="3"
                    y="5"
                    rx="2"
                  />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </span>

              Contact
            </Link>
          </div>

          {/* Divider */}
          <div className="my-6 border-t border-[#27430D]/10" />

          {/* Follow */}
          <div className="px-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#687704]">
              Follow
            </p>

            <div className="mt-5 space-y-4">
              <a
                href="#"
                className="block font-essays text-lg text-[#27430D] transition-colors hover:text-[#687704]"
              >
                Instagram
              </a>

              <a
                href="#"
                className="block font-essays text-lg text-[#27430D] transition-colors hover:text-[#687704]"
              >
                Substack
              </a>

              <a
                href="mailto:thecompass.id@gmail.com"
                className="block font-essays text-lg text-[#27430D] transition-colors hover:text-[#687704]"
              >
                Email
              </a>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="mt-auto border-t border-[#27430D]/10 px-4 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687704]">
              The Compass
            </p>

            <p className="mt-2 max-w-xs text-sm leading-6 text-[#523A23]/55">
              Financial literacy for young
              people.
            </p>
          </div>
        </nav>
      </aside>
    </>
  );
}