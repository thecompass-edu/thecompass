import Image from "next/image";

import coins from "@/assets/Hero/coins.png";
import piggybank from "@/assets/Hero/piggybank.png";
import NewsletterSignup from "@/components/home/NewsletterSignup";

const marqueeItems = [
  {
    text: "Build confidence",
    brown: false,
  },
  {
    text: "Long Term Mindset",
    brown: true,
  },
  {
    text: "Develop better habits",
    brown: false,
  },
  {
    text: "Thoughtful Decisions",
    brown: true,
  },
  {
    text: "Understand your money",
    brown: false,
  },
];

const marqueeLoopItems = [
  ...marqueeItems,
  ...marqueeItems,
];

function HeroVisual({
  mobile = false,
}: {
  mobile?: boolean;
}) {
  return (
    <div
      className={
        mobile
          ? "relative mx-auto mt-8 flex h-105 w-full max-w-105 items-end justify-center"
          : "relative mx-auto hidden h-135 w-full max-w-140 items-end justify-center lg:flex"
      }
    >
      {/* Coins */}
      <div
        className={
          mobile
            ? "absolute left-1/2 top-0 z-10 w-40 -translate-x-1/2 sm:w-46"
            : "absolute left-1/2 -top-6.25 z-10 w-45 -translate-x-1/2"
        }
      >
        <div className="hero-coins-enter">
          <Image
            src={coins}
            alt=""
            priority
            className="
              h-auto
              w-full
              object-contain
              drop-shadow-[0_12px_16px_rgba(39,67,13,0.10)]
              transition-transform
              duration-700
              ease-out
              hover:-translate-y-2
            "
            sizes={
              mobile
                ? "(max-width: 768px) 190px"
                : "260px"
            }
          />
        </div>
      </div>

      {/* Piggybank */}
      <div
        className={
          mobile
            ? "relative z-20 w-72 translate-y-4 sm:w-80"
            : "relative z-20 w-97.5 translate-y-6"
        }
      >
        <div className="hero-piggy-enter">
          <Image
            src={piggybank}
            alt="Green piggy bank"
            priority
            className="
              h-auto
              w-full
              object-contain
              drop-shadow-[0_20px_24px_rgba(39,67,13,0.12)]
              transition-transform
              duration-700
              ease-[cubic-bezier(0.22,1,0.36,1)]
              hover:scale-[1.015]
            "
            sizes={
              mobile
                ? "(max-width: 768px) 320px"
                : "470px"
            }
          />
        </div>
      </div>

      {/* Shadow */}
      <div
        aria-hidden="true"
        className="
          absolute
          bottom-3
          left-1/2
          z-0
          h-10
          w-[72%]
          -translate-x-1/2
          rounded-full
          bg-[#27430D]/10
          blur-xl
        "
      />
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F8F5EC]">
      {/* Main Hero */}
      <div className="relative mx-auto w-full max-w-360 px-5 pb-16 pt-28 sm:px-8 md:pt-20 lg:min-h-155 lg:px-12 lg:pb-0 lg:pt-20">
        <div className="relative z-10 grid items-center gap-12 lg:min-h-130 lg:grid-cols-[1fr_0.9fr] lg:gap-4">
          {/* Left Content */}
          <div className="max-w-172.5 lg:translate-x-29 lg:-translate-y-11">
            <div className="hero-copy-enter">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#687704] sm:text-sm">
                Financial literacy for everyone
              </p>

              <h1 className="max-w-162.5 font-essays text-[42px] font-semibold leading-[0.98] tracking-[-0.02em] text-[#27430D] sm:text-[64px] lg:text-[76px]">
                Know Your Money,
                <br />
                Own Your Future.
              </h1>

              <p className="mt-6 max-w-155 font-essays text-[18px] leading-8 text-[#7B886C] sm:mt-8 sm:text-[20px] sm:leading-9">
                We&apos;re a youth organization working to
                close the financial literacy gap through
                accessible education, real-world tools, and
                community.
              </p>

              {/* Mobile Visual */}
              <div className="lg:hidden">
                <HeroVisual mobile />
              </div>

              {/* Newsletter */}
              <div className="hero-newsletter-enter mt-8 lg:mt-0">
                <NewsletterSignup />
              </div>
            </div>
          </div>

          {/* Desktop Visual */}
          <HeroVisual />
        </div>
      </div>

      {/* Values Marquee */}
      <div className="hero-marquee-enter relative z-20 -mt-3 w-full overflow-hidden border-y border-[#27430D]/10 bg-[#F8F5EC]">
        <div className="compass-marquee flex w-max">
          {/* First Group */}
          <div className="flex shrink-0 items-center py-4">
            {marqueeLoopItems.map(
              (item, index) => (
                <div
                  key={`first-${item.text}-${index}`}
                  className="flex shrink-0 items-center"
                >
                  <span
                    className={`whitespace-nowrap font-essays text-[16px] font-medium sm:text-[18px] ${
                      item.brown
                        ? "text-[#523A23]"
                        : "text-[#27430D]"
                    }`}
                  >
                    {item.text}
                  </span>

                  <Image
                    src="/images/logo.svg"
                    alt=""
                    width={24}
                    height={24}
                    aria-hidden="true"
                    className="mx-8 h-6 w-6 shrink-0 object-contain opacity-70 sm:mx-10"
                  />
                </div>
              ),
            )}
          </div>

          {/* Second Group */}
          <div
            aria-hidden="true"
            className="flex shrink-0 items-center py-4"
          >
            {marqueeLoopItems.map(
              (item, index) => (
                <div
                  key={`second-${item.text}-${index}`}
                  className="flex shrink-0 items-center"
                >
                  <span
                    className={`whitespace-nowrap font-essays text-[16px] font-medium sm:text-[18px] ${
                      item.brown
                        ? "text-[#523A23]"
                        : "text-[#27430D]"
                    }`}
                  >
                    {item.text}
                  </span>

                  <Image
                    src="/images/logo.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="mx-8 h-6 w-6 shrink-0 object-contain opacity-70 sm:mx-10"
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes hero-copy-in {
          0% {
            opacity: 0;
            transform: translateY(28px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-copy-enter {
          opacity: 0;
          animation:
            hero-copy-in 900ms
            cubic-bezier(0.22, 1, 0.36, 1)
            120ms forwards;
        }

        @keyframes hero-newsletter-in {
          0% {
            opacity: 0;
            transform: translateY(18px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-newsletter-enter {
          opacity: 0;
          animation:
            hero-newsletter-in 800ms
            cubic-bezier(0.22, 1, 0.36, 1)
            420ms forwards;
        }

        @keyframes hero-coins-in {
          0% {
            opacity: 0;
            transform: translateY(-36px) scale(0.96);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .hero-coins-enter {
          opacity: 0;
          animation:
            hero-coins-in 1100ms
            cubic-bezier(0.22, 1, 0.36, 1)
            250ms forwards;
        }

        @keyframes hero-piggy-in {
          0% {
            opacity: 0;
            transform: translateY(40px) scale(0.97);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .hero-piggy-enter {
          opacity: 0;
          animation:
            hero-piggy-in 1050ms
            cubic-bezier(0.22, 1, 0.36, 1)
            180ms forwards;
        }

        @keyframes hero-marquee-in {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-marquee-enter {
          opacity: 0;
          animation:
            hero-marquee-in 700ms
            cubic-bezier(0.22, 1, 0.36, 1)
            700ms forwards;
        }

        @keyframes compass-marquee-scroll {
          from {
            transform: translate3d(0, 0, 0);
          }

          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .compass-marquee {
          animation:
            compass-marquee-scroll
            40s linear infinite;
          will-change: transform;
        }

        .compass-marquee:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-copy-enter,
          .hero-newsletter-enter,
          .hero-coins-enter,
          .hero-piggy-enter,
          .hero-marquee-enter {
            opacity: 1;
            animation: none;
            transform: none;
          }

          .compass-marquee {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}