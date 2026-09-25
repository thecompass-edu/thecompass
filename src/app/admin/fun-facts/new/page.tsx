import FunFactEditor from "@/components/admin/FunFactEditor";

import { createFunFact } from "../actions";

type NewFunFactPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewFunFactPage({
  searchParams,
}: NewFunFactPageProps) {
  const { error } = await searchParams;

  return (
    <FunFactEditor
      mode="create"
      action={createFunFact}
      error={error}
    />
  );
}