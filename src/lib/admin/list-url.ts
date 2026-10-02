export type ListParams = {
  q?: string;
  status?: string;
  page?: number;
};

export function buildListHref(
  basePath: string,
  { q, status, page }: ListParams,
  defaultStatus = "all",
) {
  const sp = new URLSearchParams();
  if (q) sp.set("q", q);
  if (status && status !== defaultStatus) sp.set("status", status);
  if (page && page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}