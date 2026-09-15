"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import ActionSpinner from "@/components/admin/ActionSpinner";

type ActionButtonVariant =
  | "primary"
  | "accent"
  | "secondary"
  | "danger";

type ActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> & {
  loading?: boolean;
  loadingText?: string;
  variant?: ActionButtonVariant;
  children: ReactNode;
};

const variantClasses: Record<
  ActionButtonVariant,
  string
> = {
  primary: `
    bg-[#27430D]
    text-white
    hover:bg-[#687704]
    focus:ring-[#687704]/20
  `,

  accent: `
    bg-[#687704]
    text-white
    hover:bg-[#596604]
    focus:ring-[#687704]/20
  `,

  secondary: `
    border
    border-[#27430D]/15
    bg-white
    text-[#27430D]
    hover:bg-[#F6F1EA]
    focus:ring-[#687704]/15
  `,

  danger: `
    bg-red-600
    text-white
    hover:bg-red-700
    focus:ring-red-600/15
  `,
};

const ActionButton = forwardRef<
  HTMLButtonElement,
  ActionButtonProps
>(function ActionButton(
  {
    loading = false,
    loadingText = "Loading…",
    variant = "primary",
    children,
    disabled,
    className = "",
    type = "button",
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? true : undefined}
      className={`
        inline-flex
        h-11
        items-center
        justify-center
        gap-2
        rounded-xl
        px-5
        text-sm
        font-semibold
        transition
        focus:outline-none
        focus:ring-4
        disabled:opacity-70
        ${
          loading
            ? "disabled:cursor-wait"
            : "disabled:cursor-not-allowed"
        }

        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading ? (
        <>
          <ActionSpinner />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
});

export default ActionButton;
