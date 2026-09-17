"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`
        sticky top-0 z-50 w-full
        transition-[padding] duration-700
        ease-[cubic-bezier(0.22,1,0.36,1)]
        ${isScrolled ? "pt-5" : "pt-3"}
      `}
    >
      {/* Navbar Shape */}
      <nav
        className={`
          mx-auto w-full
          transition-[max-width,border-radius,background-color,border-color,box-shadow,backdrop-filter]
          duration-700
          ease-[cubic-bezier(0.22,1,0.36,1)]

          ${
            isScrolled
              ? `
                max-w-[1175px]
                rounded-[36px]
                border border-white/25
                bg-[#F3F0E8]/65
                shadow-[0_8px_30px_rgba(39,67,13,0.08)]
                backdrop-blur-md
              `
              : `
                max-w-full
                rounded-none
                border border-transparent
                bg-transparent
                shadow-none
                backdrop-blur-none
              `
          }
        `}
      >
        {/* Fixed Inner Layout */}
        <div
          className="
            mx-auto flex
            min-h-[72px]
            w-full max-w-[1175px]
            items-center justify-between
            px-5 py-2.5
            sm:px-6
            lg:px-7
          "
        >
          {/* Logo / Brand */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5 text-[#27430D]"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm">
              <Image
                src="/images/logo.svg"
                alt="The Compass logo"
                width={38}
                height={38}
                priority
                className="h-[38px] w-[38px] object-contain"
              />
            </div>

            <span className="text-base font-semibold tracking-wide sm:text-[17px]">
              THE COMPASS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-9 text-[16px] font-semibold text-[#27430D] md:flex lg:gap-11">
            <Link
              href="/"
              className="transition-colors duration-300 hover:text-[#687704]"
            >
              Home
            </Link>

            <Link
              href="/articles"
              className="transition-colors duration-300 hover:text-[#687704]"
            >
              Articles
            </Link>

            <Link
              href="/#about"
              className="transition-colors duration-300 hover:text-[#687704]"
            >
              About
            </Link>

            <Link
              href="/#contact"
              className="transition-colors duration-300 hover:text-[#687704]"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="flex items-center md:hidden">
            <Link
              href="/articles"
              className="
                rounded-full
                border border-[#27430D]/15
                bg-white/30
                px-3.5 py-1.5
                text-sm font-semibold
                text-[#27430D]
                backdrop-blur-sm
                transition-colors duration-300
                hover:bg-[#27430D]
                hover:text-white
              "
            >
              Articles
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}