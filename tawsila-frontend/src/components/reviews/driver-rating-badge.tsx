'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';

export function DriverRatingBadge({ chauffeurId }: { chauffeurId: string }) {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['driver-summary', chauffeurId],
    queryFn: () => reviewsApi.getDriverSummary(chauffeurId),
    enabled: !!chauffeurId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <div className="h-6 w-16 bg-gray-200 animate-pulse rounded-full" />;
  }

  if (!summary || summary.reviewsCount === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
        Nouveau
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
      summary.topDriver ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-[#E1E5F2] text-[#022B3A]'
    }`}>
      <svg className={`w-3.5 h-3.5 ${summary.topDriver ? 'text-amber-500 fill-amber-500' : 'text-[#022B3A] fill-[#022B3A]'}`} viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {summary.averageRating.toFixed(1)} 
      <span className="opacity-75 font-normal">({summary.reviewsCount})</span>
      {summary.topDriver && <span className="ml-1 uppercase tracking-wider text-[10px]">Top</span>}
    </span>
  );
}
