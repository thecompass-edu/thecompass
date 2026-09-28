import { notFound } from "next/navigation";

import FunFactEditor from "@/components/admin/FunFactEditor";
import { createClient } from "@/lib/supabase/server";

import { updateFunFact } from "../actions";

type EditFunFactPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<{
    error?: string;
  }>;
};

type FunFact = {
  id: string;
  title: string;
  description: string;
  fun_fact_number: number | null;
  image_url: string | null;
  status: "draft" | "published";
  published_at: string | null;
};

export default async function EditFunFactPage({
  params,
  searchParams,
}: EditFunFactPageProps) {
  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();

  const {
    data,
    error: fetchError,
  } = await supabase
    .from("fun_facts")
    .select(`
      id,
      title,
      description,
      fun_fact_number,
      image_url,
      status,
      published_at
    `)
    .eq("id", id)
    .maybeSingle();

  if (fetchError) {
    console.error(
      "FUN FACT FETCH ERROR:",
      fetchError,
    );
  }

  if (!data) {
    notFound();
  }

  const funFact = data as FunFact;

  const updateAction =
    updateFunFact.bind(
      null,
      funFact.id,
    );

  return (
    <FunFactEditor
      mode="edit"
      action={updateAction}
      error={error}
      funFactId={funFact.id}
      initialValues={{
        title: funFact.title,
        description:
          funFact.description,
        fun_fact_number:
          funFact.fun_fact_number,
        image_url:
          funFact.image_url,
        status:
          funFact.status,
      }}
    />
  );
}