import { PackageCardSkeleton } from '@/components/skeletons/PageSkeletons';

export default function PackagesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-in fade-in duration-300">
      <div className="space-y-3">
        <div className="h-9 bg-gray-200 rounded-lg w-64 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded-lg w-96 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
        <PackageCardSkeleton />
      </div>
    </div>
  );
}
