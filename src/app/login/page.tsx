import { login } from "./actions";
import Image from "next/image";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
});

export default function LoginPage() {
  return (
    <main
      className={`${jakarta.className} flex min-h-screen items-center justify-center bg-[#F6F1EA] px-5 py-10`}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          {/* Logo */}
          <Image
            src="/images/logo.svg"
            alt="The Compass logo"
            width={70}
            height={70}
            priority
            className="mx-auto mb-4 h-auto w-17.5"
          />

          <p className="text-xs font-bold tracking-[0.28em] text-[#687704]">
            THE COMPASS
          </p>

          <h1 className="mt-3 text-3xl font-bold text-[#27430D]">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-[#523A23]/60">
            Sign in to manage articles and website content.
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-[#27430D]/10 bg-white p-7 shadow-sm sm:p-8">
          <form action={login} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-[#27430D]"
              >
                Email
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/35 focus:border-[#687704]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-[#27430D]"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-[#27430D]/15 bg-white px-4 py-3 text-sm text-[#27430D] outline-none transition placeholder:text-[#523A23]/35 focus:border-[#687704]"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full rounded-xl bg-[#27430D] px-5 py-3 font-semibold text-white transition hover:bg-[#687704]"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-[#523A23]/45">
          Authorized administrators only
        </p>
      </div>
    </main>
  );
}