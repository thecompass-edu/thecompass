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

    const navbarOffset = 95;

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

  return (
    <>
      <header
        className={`
          fixed
          top-0
          z-50
          w-full
          transition-[padding,background-color]
          duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]

          md:sticky

          md:${
            isScrolled
              ? "bg-transparent pt-5"
              : "bg-transparent pt-3"
          }
        `}
      >
        {/* Mobile Navbar */}
        <nav className="border-b border-[#27430D]/8 bg-[#F8F5EC] md:hidden">
          <div className="flex min-h-24 items-center justify-between px-5">
            {/* Brand */}
            <Link
              href="/"
              onClick={handleHomeClick}
              className="group flex items-center gap-4 text-[#27430D]"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#27430D]/10 bg-white shadow-sm">
                <Image
                  src="/images/logo.svg"
                  alt="The Compass logo"
                  width={44}
                  height={44}
                  priority
                  className="
                    h-11
                    w-11
                    object-contain
                    transition-transform
                    duration-700
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    group-hover:rotate-360
                  "
                />
              </div>

              <span className="font-essays text-xl font-semibold tracking-wide">
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
              className="relative flex h-12 w-12 items-center justify-center text-[#27430D]"
            >
              <span
                className={`
                  absolute
                  h-0.5
                  w-7
                  rounded-full
                  bg-current
                  transition-all
                  duration-300
                  ${
                    isMenuOpen
                      ? "translate-y-0 rotate-45"
                      : "-translate-y-2"
                  }
                `}
              />

              <span
                className={`
                  absolute
                  h-0.5
                  w-7
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
                  w-7
                  rounded-full
                  bg-current
                  transition-all
                  duration-300
                  ${
                    isMenuOpen
                      ? "translate-y-0 -rotate-45"
                      : "translate-y-2"
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

      {/* Mobile Menu */}
      <div
        className={`
          fixed
          inset-x-0
          bottom-0
          top-24
          z-40
          bg-[#F8F5EC]
          transition-all
          duration-500
          ease-[cubic-bezier(0.22,1,0.36,1)]
          md:hidden

          ${
            isMenuOpen
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none -translate-y-5 opacity-0"
          }
        `}
      >
        <nav className="flex h-full flex-col px-8 pb-10 pt-10">
          <div className="flex flex-1 flex-col justify-start gap-10">
            <Link
              href="/"
              onClick={handleHomeClick}
              className="
                group
                relative
                w-fit
                font-essays
                text-5xl
                font-semibold
                leading-none
                text-[#27430D]
                transition-all
                duration-300
                hover:translate-x-2
                hover:text-[#687704]
              "
            >
              Home

              <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[#687704] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>

            <Link
              href="/articles"
              onClick={closeMenu}
              className="
                group
                relative
                w-fit
                font-essays
                text-5xl
                font-semibold
                leading-none
                text-[#27430D]
                transition-all
                duration-300
                hover:translate-x-2
                hover:text-[#687704]
              "
            >
              Articles

              <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[#687704] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>

            <Link
              href="/#purpose"
              onClick={(event) =>
                handleSectionClick(
                  event,
                  "purpose",
                )
              }
              className="
                group
                relative
                w-fit
                font-essays
                text-5xl
                font-semibold
                leading-none
                text-[#27430D]
                transition-all
                duration-300
                hover:translate-x-2
                hover:text-[#687704]
              "
            >
              About

              <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[#687704] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>

            <Link
              href="/#footer"
              onClick={(event) =>
                handleSectionClick(
                  event,
                  "footer",
                )
              }
              className="
                group
                relative
                w-fit
                font-essays
                text-5xl
                font-semibold
                leading-none
                text-[#27430D]
                transition-all
                duration-300
                hover:translate-x-2
                hover:text-[#687704]
              "
            >
              Contact

              <span className="absolute -bottom-2 left-0 h-px w-full origin-left scale-x-0 bg-[#687704] transition-transform duration-300 group-hover:scale-x-100" />
            </Link>
          </div>

          <div className="border-t border-[#27430D]/10 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#687704]">
              The Compass
            </p>

            <p className="mt-2 max-w-xs text-sm leading-6 text-[#523A23]/55">
              Financial literacy for young
              people.
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}