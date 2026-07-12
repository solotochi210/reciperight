import PageWrapper from '../layout/PageWrapper';
import Skeleton from '../ui/Skeleton';

export default function RecipeDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-[420px] w-full sm:h-[520px]" rounded="rounded-none" />
      <PageWrapper className="py-8" animate={false}>
        <Skeleton className="mb-8 h-20 w-full" rounded="rounded-[20px]" />
        <Skeleton className="mb-3 h-5 w-3/4" />
        <Skeleton className="mb-8 h-5 w-1/2" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="h-56 w-full" rounded="rounded-2xl" />
        </div>
      </PageWrapper>
    </div>
  );
}
