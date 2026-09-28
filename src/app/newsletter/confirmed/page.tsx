import Link from "next/link";

type ConfirmedPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

const states = {
  success: {
    eyebrow:
      "EMAIL CONFIRMED",
    title:
      "You're subscribed.",
    message:
      "Your email has been confirmed. You'll receive new articles and financial literacy insights from The Compass.",
  },
  expired: {
    eyebrow:
      "LINK EXPIRED",
    title:
      "Your confirmation link expired.",
    message:
      "Return to The Compass and subscribe again to receive a new confirmation email.",
  },
  invalid: {
    eyebrow:
      "INVALID LINK",
    title:
      "We couldn't confirm this link.",
    message:
      "The confirmation link may already have been used or is no longer valid.",
  },
  error: {
    eyebrow:
      "SOMETHING WENT WRONG",
    title:
      "We couldn't confirm your email.",
    message:
      "Please try the confirmation link again later or subscribe again from The Compass.",
  },
} as const;

export default async function NewsletterConfirmedPage({
  searchParams,
}: ConfirmedPageProps) {
  const { status } =
    await searchParams;

  const content =
    status &&
    status in states
      ? states[
          status as keyof typeof states
        ]
      : states.invalid;

  const isSuccess =
    status === "success";

  return (
    <main className="min-h-screen bg-[#F8F5EC] px-5 py-16 text-[#27430D] sm:px-8">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-180 items-center justify-center">
        <section className="w-full border border-[#27430D]/15 bg-white px-6 py-12 text-center shadow-[0_18px_50px_rgba(39,67,13,0.08)] sm:px-12 sm:py-16">
          <p className="font-essays text-xs font-semibold tracking-[0.2em] text-[#687704]">
            {content.eyebrow}
          </p>

          <h1 className="mt-4 font-essays text-4xl leading-tight text-[#27430D] sm:text-5xl">
            {content.title}
          </h1>

          <p className="mx-auto mt-5 max-w-135 font-essays text-base leading-7 text-[#523A23]/75">
            {content.message}
          </p>

          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-[#27430D] px-6 py-3.5 font-essays text-base font-semibold text-white transition-colors duration-300 hover:bg-[#687704]"
          >
            {isSuccess
              ? "Back to The Compass"
              : "Return to homepage"}
          </Link>
        </section>
      </div>
    </main>
  );
}
