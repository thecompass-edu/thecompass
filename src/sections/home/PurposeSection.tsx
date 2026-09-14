"use client";

import { useState } from "react";
import Image from "next/image";

import compassLogo from "@/assets/Purpose/compass-logo.png";
import purposeFolder from "@/assets/Purpose/purpose-folder.png";
import purposeGuide from "@/assets/Purpose/purpose-guide.png";
import purposePaper from "@/assets/Purpose/purpose-paper.png";
import purposeTitle from "@/assets/Purpose/purpose-title.png";

const PURPOSE_TABS = ["mission", "vision", "values"] as const;

type PurposeTab = (typeof PURPOSE_TABS)[number];

type PurposeContent = {
  title: string;
  text: string;
};

type TabButtonProps = {
  activeTab: PurposeTab;
  onTabChange: (tab: PurposeTab) => void;
  containerClassName: string;
  buttonClassName: string;
  textClassName: string;
};

type ContentBlockProps = {
  activeTab: PurposeTab;
  animationKey: number;
  variant: "mobile" | "responsive";
};

type CompassCardProps = {
  className: string;
  animateOnHover?: boolean;
};

type GuideProps = {
  className: string;
  interactive?: boolean;
};

type LayoutProps = {
  activeTab: PurposeTab;
  animationKey: number;
  onTabChange: (tab: PurposeTab) => void;
};

const PURPOSE_CONTENT: Record<PurposeTab, PurposeContent> = {
  mission: {
    title: "Our Mission",
    text: "To empower individuals and communities through accessible and reliable financial knowledge.",
  },

  vision: {
    title: "Our Vision",
    text: "A financially literate society where everyone can make confident decisions and create a secure future.",
  },

  values: {
    title: "Our Values",
    text: "We believe financial literacy is not just about money, but about building the skills and confidence to grow, create opportunities, make responsible decisions, and develop a long-term mindset toward money.",
  },
};

function PurposeTabs({
  activeTab,
  onTabChange,
  containerClassName,
  buttonClassName,
  textClassName,
}: TabButtonProps) {
  return (
    <div
      className={containerClassName}
      aria-label="Purpose sections"
    >
      {PURPOSE_TABS.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            aria-pressed={isActive}
            className={`${buttonClassName} ${
              isActive
                ? "bg-[#27430D] text-white"
                : "bg-[#718F14] text-white hover:bg-[#5F7B0E]"
            }`}
          >
            <span className={textClassName}>
              {tab}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function PurposeContentBlock({
  activeTab,
  animationKey,
  variant,
}: ContentBlockProps) {
  const content = PURPOSE_CONTENT[activeTab];
  const isValues = activeTab === "values";
  const isMobile = variant === "mobile";

  const titleClassName = isMobile
    ? `font-bold leading-none text-[#27430D] ${
        isValues ? "text-[17px]" : "text-[20px]"
      }`
    : "text-[26px] font-bold leading-none text-[#27430D] lg:text-5xl lg:leading-normal";

  const descriptionClassName = isMobile
    ? `text-[#8A9D7A] ${
        isValues
          ? "mt-3 text-[9px] leading-[1.45]"
          : "mt-3 text-[10px] leading-normal"
      }`
    : `text-[14px] leading-[1.55] text-[#8A9D7A] lg:text-2xl lg:leading-relaxed ${
        isValues ? "mt-5 lg:mt-8" : "mt-4 lg:mt-6"
      }`;

  return (
    <div
      key={`${variant}-${activeTab}-${animationKey}`}
      className="purpose-content-animation"
    >
      <div className="inline-flex flex-col items-start">
        <h2 className={titleClassName}>
          {content.title}
        </h2>

        <span
          className={
            isMobile
              ? "purpose-underline mt-1 h-0.5 w-full bg-[#27430D]"
              : "purpose-underline mt-1 h-0.5 w-full bg-[#27430D] lg:h-0.75"
          }
        />
      </div>

      <p className={descriptionClassName}>
        {content.text}
      </p>
    </div>
  );
}

function CompassCard({
  className,
  animateOnHover = false,
}: CompassCardProps) {
  return (
    <div className={className}>
      <div className={animateOnHover ? "group relative" : "relative"}>
        <Image
          src={compassLogo}
          alt="The Compass"
          className="h-auto w-full"
        />

        <div className="pointer-events-none absolute left-1/2 top-[43%] w-[27%] -translate-x-1/2 -translate-y-1/2">
          <Image
            src="/images/logo.svg"
            alt=""
            width={160}
            height={160}
            unoptimized
            className={
              animateOnHover
                ? "h-auto w-full group-hover:animate-[spin_4s_linear_infinite]"
                : "h-auto w-full"
            }
          />
        </div>
      </div>
    </div>
  );
}

function PurposeGuide({
  className,
  interactive = false,
}: GuideProps) {
  if (!interactive) {
    return (
      <div className={className}>
        <Image
          src={purposeGuide}
          alt="Our mission, vision, and values guide everything we do."
          className="h-auto w-full"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="group relative transition-all duration-500 ease-out hover:-translate-y-3 hover:-rotate-1 hover:scale-[1.03]">
        <Image
          src={purposeGuide}
          alt="Our mission, vision, and values guide everything we do."
          className="h-auto w-full"
        />

        <span className="purpose-guide-underline pointer-events-none absolute left-[26%] top-[80%] h-0.5 w-[24%] bg-[#4B321F]" />
      </div>
    </div>
  );
}

function TornPaperEdge() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-0 left-0 z-40 h-10 w-full overflow-hidden bg-[#F3F0E8]"
      style={{
        clipPath: `
          polygon(
            0% 24%,
            2% 34%,
            5% 20%,
            8% 32%,
            11% 22%,
            14% 34%,
            17% 21%,
            20% 31%,
            23% 19%,
            26% 33%,
            29% 22%,
            32% 34%,
            35% 20%,
            38% 32%,
            41% 21%,
            44% 34%,
            47% 19%,
            50% 31%,
            53% 21%,
            56% 34%,
            59% 20%,
            62% 32%,
            65% 22%,
            68% 34%,
            71% 19%,
            74% 32%,
            77% 21%,
            80% 34%,
            83% 20%,
            86% 32%,
            89% 22%,
            92% 34%,
            95% 20%,
            98% 32%,
            100% 24%,
            100% 100%,
            0% 100%
          )
        `,
      }}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage: "url('/textures/paper-noise.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          mixBlendMode: "multiply",
        }}
      />
    </div>
  );
}

function MobilePurposeLayout({
  activeTab,
  animationKey,
  onTabChange,
}: LayoutProps) {
  return (
    <div className="block min-h-screen px-4 py-12 md:hidden">
      <div className="relative z-30 flex justify-center">
        <Image
          src={purposeTitle}
          alt="Our Purpose"
          className="h-auto w-55"
          priority
        />
      </div>

      <div className="relative mx-auto mt-10 w-full overflow-hidden">
        <Image
          src={purposeFolder}
          alt="Open folder containing The Compass purpose"
          className="relative -left-35 z-0 h-auto w-[130%] max-w-none"
        />

        <CompassCard className="absolute left-[-25%] top-[27%] z-10 w-[28%]" />

        <div className="absolute left-[35%] top-[15%] z-30 w-[50%]">
          <Image
            src={purposePaper}
            alt=""
            className="h-auto w-full"
          />

          <div className="absolute left-[10%] right-[10%] top-[20%]">
            <PurposeContentBlock
              activeTab={activeTab}
              animationKey={animationKey}
              variant="mobile"
            />
          </div>
        </div>

        <PurposeTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          containerClassName="absolute right-10 top-[19%] z-20 flex flex-col"
          buttonClassName="flex h-14 w-8 items-center justify-center rounded-r-md transition-colors duration-300"
          textClassName="text-[10px] [writing-mode:vertical-rl] capitalize"
        />

        <PurposeGuide className="absolute bottom-[7%] left-[4%] z-40 w-[50%]" />
      </div>

      <TornPaperEdge />
    </div>
  );
}

function ResponsivePurposeLayout({
  activeTab,
  animationKey,
  onTabChange,
}: LayoutProps) {
  const isValues = activeTab === "values";

  return (
    <div className="hidden min-h-screen px-6 py-12 md:block lg:py-16">
      <div className="relative z-30 flex justify-center">
        <div className="transition-all duration-500 ease-out hover:-rotate-2 hover:scale-[1.02]">
          <Image
            src={purposeTitle}
            alt="Our Purpose"
            className="h-auto w-75 lg:w-105"
            priority
          />
        </div>
      </div>

      <div className="relative mx-auto -mt-4 w-[94%] max-w-212.5 lg:-mt-10 lg:w-full lg:max-w-275">
        <Image
          src={purposeFolder}
          alt="Open folder containing The Compass purpose"
          className="relative z-0 h-auto w-full"
        />

        <CompassCard
          className="absolute left-[14%] top-[26%] z-10 w-[19%] lg:left-[15%] lg:top-[25%] lg:w-[22%]"
          animateOnHover
        />

        <PurposeTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          containerClassName="absolute right-[5%] top-[20%] z-10 flex flex-col"
          buttonClassName="flex h-16 w-9 items-center justify-center rounded-r-md text-[11px] transition-all duration-300 lg:h-22.5 lg:w-13.75 lg:rounded-r-lg lg:text-base"
          textClassName="text-center [writing-mode:vertical-rl] capitalize"
        />

        <div className="absolute left-[53%] top-[15%] z-20 w-[39%]">
          <Image
            src={purposePaper}
            alt=""
            className="h-auto w-full"
          />

          <div
            className={`absolute left-[10%] right-[10%] flex flex-col ${
              isValues
                ? "top-[17%] bottom-[7%] lg:top-[19%] lg:bottom-[8%]"
                : "top-[16%] bottom-[9%] lg:bottom-[10%]"
            }`}
          >
            <PurposeContentBlock
              activeTab={activeTab}
              animationKey={animationKey}
              variant="responsive"
            />
          </div>
        </div>

        <PurposeGuide
          className="absolute bottom-[9%] left-[9%] z-30 w-[27%] lg:bottom-[10%] lg:left-[10%] lg:w-[30%]"
          interactive
        />
      </div>

      <TornPaperEdge />
    </div>
  );
}

export default function PurposeSection() {
  const [activeTab, setActiveTab] = useState<PurposeTab>("mission");
  const [animationKey, setAnimationKey] = useState(0);

  const handleTabChange = (tab: PurposeTab) => {
    setActiveTab(tab);
    setAnimationKey((current) => current + 1);
  };

  return (
    <section
      id="purpose"
      className="relative min-h-screen overflow-hidden bg-[#27430D]"
    >
      <MobilePurposeLayout
        activeTab={activeTab}
        animationKey={animationKey}
        onTabChange={handleTabChange}
      />

      <ResponsivePurposeLayout
        activeTab={activeTab}
        animationKey={animationKey}
        onTabChange={handleTabChange}
      />

      <style jsx global>{`
        .purpose-underline {
          display: block;
          transform: scaleX(0);
          transform-origin: left center;
          animation: purposeLineDraw 600ms
            cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .purpose-content-animation {
          animation: purposeContentIn 500ms ease-out both;
        }

        .purpose-guide-underline {
          transform: scaleX(0);
          transform-origin: left center;
          transition: transform 500ms
            cubic-bezier(0.22, 1, 0.36, 1);
        }

        .group:hover .purpose-guide-underline {
          transform: scaleX(1);
        }

        @keyframes purposeLineDraw {
          from {
            transform: scaleX(0);
          }

          to {
            transform: scaleX(1);
          }
        }

        @keyframes purposeContentIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .purpose-underline {
            animation: none;
            transform: scaleX(1);
          }

          .purpose-content-animation {
            animation: none;
          }

          .purpose-guide-underline {
            transition: none;
            transform: scaleX(1);
          }
        }
      `}</style>
    </section>
  );
}