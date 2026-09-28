type ActionSpinnerProps = {
  size?: "sm" | "md";
};

export default function ActionSpinner({
  size = "sm",
}: ActionSpinnerProps) {
  const sizeClass =
    size === "md"
      ? "h-5 w-5"
      : "h-4 w-4";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`${sizeClass} shrink-0 animate-spin`}
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="3"
        className="opacity-25"
      />

      <path
        d="M21 12A9 9 0 0 0 12 3"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-100"
      />
    </svg>
  );
}