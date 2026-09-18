"use client";

import { useActionState } from "react";

import {
  subscribeToNewsletter,
  type SubscribeState,
} from "@/app/actions/newsletter";

const initialState: SubscribeState = {
  status: "idle",
  message: "",
};

export default function NewsletterSignup() {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletter,
    initialState,
  );

  return (
    <div className="mt-9 w-full max-w-135">
      <form
        action={formAction}
        className="
          flex
          w-full
          overflow-hidden
          rounded-lg
          border
          border-[#27430D]/35
          bg-white/20
          transition-all
          duration-300

          focus-within:border-[#27430D]
          focus-within:ring-4
          focus-within:ring-[#27430D]/5
        "
      >
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>

        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email address"
          className="
            min-w-0
            flex-1
            bg-transparent
            px-5
            py-4
            font-essays
            text-[16px]
            text-[#27430D]
            outline-none
            placeholder:text-[#7B886C]/65
            sm:px-6
            sm:text-[17px]
          "
        />

        <button
          type="submit"
          disabled={isPending}
          className="
            shrink-0
            bg-[#27430D]
            px-6
            font-essays
            text-[16px]
            font-semibold
            text-white
            transition-colors
            duration-300

            hover:bg-[#687704]

            disabled:cursor-not-allowed
            disabled:opacity-60

            sm:px-8
            sm:text-[17px]
          "
        >
          {isPending ? "Subscribing..." : "Subscribe"}
        </button>
      </form>

      {/* Success / Error Message */}
      {state.message && (
        <p
          aria-live="polite"
          className={`mt-2 font-essays text-sm ${
            state.status === "success"
              ? "text-[#687704]"
              : "text-red-700"
          }`}
        >
          {state.message}
        </p>
      )}

      {/* Description */}
      <p className="mt-2 font-essays text-[13px] leading-5 text-[#7B886C]/70">
        Get new articles and financial literacy insights delivered to your
        inbox.
      </p>
    </div>
  );
}