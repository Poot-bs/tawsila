'use client';

import { useQuery } from '@tanstack/react-query';
import { systemApi } from '@/lib/api';

export function SystemHealthWidget() {
  const { data: health, isLoading, isError } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => systemApi.health(),
    refetchInterval: 30000, // Refresh every 30s
  });

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#E1E5F2] shadow-sm">
      <h2 className="text-xl font-bold text-[#022B3A] mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-[#1F7A8C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Santé du Système
      </h2>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      ) : isError ? (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 font-medium text-sm flex items-start gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Impossible de récupérer l'état du système. Le backend est peut-être hors ligne.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-sm font-bold text-gray-500">Statut API</span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              health?.status === 'UP' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${health?.status === 'UP' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {health?.status || 'UNKNOWN'}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Application</span>
              <span className="font-bold text-[#022B3A]">{health?.application || 'Tawsila'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Base de données</span>
              <span className="font-bold text-[#022B3A] uppercase">{health?.persistenceMode || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500 font-medium">Dernière vérification</span>
              <span className="font-medium text-[#1F7A8C]">
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString('fr-FR') : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
