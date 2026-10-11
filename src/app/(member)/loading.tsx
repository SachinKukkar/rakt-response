import { Skeleton } from "@/components/ui/skeleton";
import { CardListSkeleton } from "@/components/common/page-parts";

export default function MemberLoading() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-2/3 rounded-xl" />
      <Skeleton className="h-28 w-full rounded-3xl" />
      <CardListSkeleton rows={3} />
    </div>
  );
}
