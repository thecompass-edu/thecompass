"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const STORY_DURATION = 8000;

type Story = {
  id: string;
  title: string;
  imageUrl: string;
  funFactNumber: number | null;
};

type FunFactStoryModalProps = {
  stories: Story[];
};

function StoryArrowIcon({
  direction,
}: {
  direction: "left" | "right";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <path
          d="M14.5 6.5L9 12L14.5 17.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M9.5 6.5L15 12L9.5 17.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export default function FunFactStoryModal({
  stories,
}: FunFactStoryModalProps) {
  const [isOpen, setIsOpen] =
    useState(false);

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0);

  const [
    loadedStoryId,
    setLoadedStoryId,
  ] = useState<string | null>(
    null,
  );

  const currentStory =
    stories[currentIndex];

  const nextStory =
    stories[currentIndex + 1] ??
    null;

  const firstStories =
    stories.slice(0, 2);

  function openStories() {
    setCurrentIndex(0);
    setLoadedStoryId(null);
    setIsOpen(true);
  }

  function closeStories() {
    setIsOpen(false);
  }

  function showPrevious() {
    if (currentIndex === 0) {
      return;
    }

    setLoadedStoryId(null);
    setCurrentIndex(
      currentIndex - 1,
    );
  }

  function showNext() {
    if (
      currentIndex >=
      stories.length - 1
    ) {
      closeStories();
      return;
    }

    setLoadedStoryId(null);
    setCurrentIndex(
      currentIndex + 1,
    );
  }

  // Lock scroll and handle keyboard controls.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setIsOpen(false);
        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        if (
          currentIndex >=
          stories.length - 1
        ) {
          setIsOpen(false);
          return;
        }

        setLoadedStoryId(null);
        setCurrentIndex(
          currentIndex + 1,
        );

        return;
      }

      if (
        event.key ===
          "ArrowLeft" &&
        currentIndex > 0
      ) {
        setLoadedStoryId(null);
        setCurrentIndex(
          currentIndex - 1,
        );
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    currentIndex,
    stories.length,
  ]);

  // Start the timer only after the current image loads.
  useEffect(() => {
    if (
      !isOpen ||
      !currentStory ||
      loadedStoryId !==
        currentStory.id
    ) {
      return;
    }

    const timeout =
      window.setTimeout(() => {
        if (
          currentIndex >=
          stories.length - 1
        ) {
          setIsOpen(false);
          return;
        }

        setLoadedStoryId(null);
        setCurrentIndex(
          currentIndex + 1,
        );
      }, STORY_DURATION);

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [
    isOpen,
    currentIndex,
    currentStory,
    loadedStoryId,
    stories.length,
  ]);

  const storyModal =
    isOpen &&
    currentStory &&
    typeof document !==
      "undefined"
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${currentStory.title} story`}
            className="
              fixed
              inset-0
              z-10000
              flex
              h-dvh
              w-screen
              items-center
              justify-center
              overflow-hidden
              bg-black
            "
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeStories();
              }
            }}
          >
            {/* Blurry background */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <Image
                src={
                  currentStory.imageUrl
                }
                alt=""
                width={520}
                height={924}
                sizes="520px"
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
                  scale-110
                  object-cover
                  blur-xl
                "
              />

              <div className="absolute inset-0 bg-black/55" />
            </div>

            {/* Brand */}
            <div
              className="
                fixed
                left-6
                top-6
                z-40
                hidden
                items-center
                gap-3
                sm:flex
              "
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F8F5EC]">
                <Image
                  src="/images/logo.svg"
                  alt=""
                  fill
                  sizes="44px"
                  className="object-contain p-2.5"
                />
              </div>

              <div>
                <p className="text-sm font-bold tracking-[0.12em] text-white">
                  THE COMPASS
                </p>

                {currentStory.funFactNumber && (
                  <p className="mt-0.5 text-xs text-white/60">
                    Weekly Fun Fact #
                    {
                      currentStory.funFactNumber
                    }
                  </p>
                )}
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={
                closeStories
              }
              aria-label="Close stories"
              className="
                fixed
                right-5
                top-5
                z-50
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                text-white
                transition
                hover:bg-white/10
                sm:right-8
                sm:top-7
              "
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-8 w-8"
                aria-hidden="true"
              >
                <path
                  d="M5 5L19 19M19 5L5 19"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Story stage */}
            <div
              className="
                relative
                z-10
                flex
                items-center
                justify-center
                px-4
                sm:px-18
              "
            >
              {/* Left outside arrow */}
              <button
                type="button"
                onClick={showPrevious}
                disabled={currentIndex === 0}
                aria-label="Previous Fun Fact"
                className={`
                  absolute
                  left-0
                  top-1/2
                  z-40
                  hidden
                  h-12
                  w-12
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/15
                  text-white
                  backdrop-blur-md
                  transition
                  sm:flex
                  ${
                    currentIndex === 0
                      ? "cursor-default bg-white/5 opacity-30"
                      : "bg-black/35 hover:bg-black/50"
                  }
                `}
              >
                <StoryArrowIcon direction="left" />
              </button>

              {/* Right outside arrow */}
              <button
                type="button"
                onClick={showNext}
                aria-label="Next Fun Fact"
                className="
                  absolute
                  right-0
                  top-1/2
                  z-40
                  hidden
                  h-12
                  w-12
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/15
                  bg-black/35
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-black/50
                  sm:flex
                "
              >
                <StoryArrowIcon direction="right" />
              </button>

              {/* Story card */}
              <div
                className="
                  relative
                  flex
                  h-dvh
                  w-full
                  max-w-130
                  items-center
                  justify-center
                  overflow-hidden
                  bg-black/15
                  shadow-[0_30px_90px_rgba(0,0,0,0.45)]
                  sm:h-[calc(100dvh-32px)]
                  sm:w-auto
                  sm:aspect-9/16
                "
                onMouseDown={(event) =>
                  event.stopPropagation()
                }
              >
                <Image
                  key={
                    currentStory.id
                  }
                  src={
                    currentStory.imageUrl
                  }
                  alt={
                    currentStory.title
                  }
                  width={520}
                  height={924}
                  sizes="520px"
                  priority
                  onLoad={() =>
                    setLoadedStoryId(
                      currentStory.id,
                    )
                  }
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                />

                {/* Progress */}
                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    z-30
                    flex
                    gap-1
                    px-3
                    pt-3
                  "
                >
                  {stories.map(
                    (
                      story,
                      index,
                    ) => (
                      <div
                        key={
                          story.id
                        }
                        className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/35"
                      >
                        <div
                          className={`h-full bg-white ${
                            index <=
                            currentIndex
                              ? "w-full"
                              : "w-0"
                          }`}
                        />
                      </div>
                    ),
                  )}
                </div>

                {/* Large click areas */}
                <button
                  type="button"
                  onClick={
                    showPrevious
                  }
                  disabled={
                    currentIndex === 0
                  }
                  aria-label="Previous Fun Fact"
                  className="
                    absolute
                    inset-y-0
                    left-0
                    z-20
                    w-1/2
                    disabled:cursor-default
                  "
                />

                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next Fun Fact"
                  className="
                    absolute
                    inset-y-0
                    right-0
                    z-20
                    w-1/2
                  "
                />
              </div>

              {/* Mobile bottom controls */}
              <div
                className="
                  absolute
                  bottom-5
                  left-1/2
                  z-40
                  flex
                  -translate-x-1/2
                  items-center
                  gap-3
                  sm:hidden
                "
              >
                <button
                  type="button"
                  onClick={showPrevious}
                  disabled={currentIndex === 0}
                  aria-label="Previous Fun Fact"
                  className={`
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/15
                    text-white
                    backdrop-blur-md
                    transition
                    ${
                      currentIndex === 0
                        ? "cursor-default bg-white/5 opacity-30"
                        : "bg-black/35 hover:bg-black/50"
                    }
                  `}
                >
                  <StoryArrowIcon direction="left" />
                </button>

                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next Fun Fact"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-white/15
                    bg-black/35
                    text-white
                    backdrop-blur-md
                    transition
                    hover:bg-black/50
                  "
                >
                  <StoryArrowIcon direction="right" />
                </button>
              </div>

              {/* Preload the next story */}
              {nextStory && (
                <div
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    h-px
                    w-px
                    overflow-hidden
                    opacity-0
                  "
                >
                  <Image
                    src={
                      nextStory.imageUrl
                    }
                    alt=""
                    width={520}
                    height={924}
                    sizes="520px"
                    loading="eager"
                  />
                </div>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={openStories}
        className="
          group/story
          relative
          mt-7
          flex
          w-full
          items-center
          justify-between
          overflow-hidden
          border
          border-[#27430D]/20
          bg-[#F8F5EC]
          px-5
          py-4
          font-semibold
          text-[#27430D]
          transition-colors
          duration-300
          hover:bg-[#EEF3E7]
        "
      >
        <span
          className="
            relative
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
            group-hover/story:after:scale-x-100
          "
        >
          View Story
        </span>

        <span
          aria-hidden="true"
          className="
            text-lg
            transition-transform
            duration-300
            group-hover/story:translate-x-1.5
          "
        >
          →
        </span>
      </button>

      {/* Preload the first stories */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          -left-250
          top-0
          h-px
          w-px
          overflow-hidden
          opacity-0
        "
      >
        {firstStories.map(
          (story) => (
            <Image
              key={`preload-${story.id}`}
              src={story.imageUrl}
              alt=""
              width={520}
              height={924}
              sizes="520px"
              priority
            />
          ),
        )}
      </div>

      {storyModal}
    </>
  );
}