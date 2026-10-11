import { Skeleton } from "@/components/ui/skeleton";
import { CardListSkeleton } from "@/components/common/page-parts";
import { getT } from "@/i18n/server";

export default async function MemberLoading() {
  const t = await getT();
  return (
    <div className="space-y-5" aria-busy="true" aria-label={t("Loading")}>
      <Skeleton className="h-8 w-2/3 rounded-xl" />
      <Skeleton className="h-28 w-full rounded-3xl" />
      <CardListSkeleton rows={3} />
    </div>
  );
}
