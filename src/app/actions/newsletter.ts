"use server";

import { createClient } from "@/lib/supabase/server";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function subscribeToNewsletter(
  _previousState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const rawEmail = formData.get("email");

  if (typeof rawEmail !== "string") {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  const email = rawEmail.trim().toLowerCase();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({
      email,
      status: "active",
    });

  if (error) {
    if (error.code === "23505") {
      return {
        status: "success",
        message: "You're already subscribed.",
      };
    }

    console.error("NEWSLETTER SUBSCRIPTION ERROR:", error);

    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }

  return {
    status: "success",
    message: "You're subscribed! We'll keep you updated.",
  };
}