'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import { Link } from '@/i18n/navigation';

export default function AdminTripsPage() {
  const { user } = useAuthStore();

  const { data: trips, isLoading, isError } = useQuery({
    queryKey: ['admin-trips'],
    queryFn: () => adminApi.trips(),
    enabled: user?.role === 'ADMIN',
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        Accès refusé. Vous devez être administrateur.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0B1F2A] text-white px-6 py-10 sm:px-10 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#0B1F2A_30%,#123A47_75%,#1F7A8C_120%)] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(191,219,247,0.2),transparent_55%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#BFDBF7]">Administration</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight font-display">Supervision des Trajets</h1>
            <p className="mt-4 text-lg text-[#E1E5F2]">Consultez tous les trajets publiés sur la plateforme.</p>
          </div>
          <Link href="/admin" className="text-[#BFDBF7] font-bold hover:text-white transition-colors">
            &larr; Retour
          </Link>
        </div>
      </div>

      <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-red-500 font-medium">
            Erreur lors de la récupération des trajets.
          </div>
        ) : !trips || trips.length === 0 ? (
          <div className="p-16 text-center text-gray-500">
            Aucun trajet n'a été publié.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--surface-hover)] border-b border-[var(--border)] text-[var(--text)]">
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">ID</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Départ / Arrivée</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Date</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Chauffeur</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Places</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Prix</th>
                  <th className="p-4 font-bold text-sm uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {trips.map(trip => (
                  <tr key={trip.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                    <td className="p-4 text-xs font-mono text-gray-500 truncate max-w-[100px]">
                      {trip.id}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[var(--text)]">{trip.depart}</div>
                      <div className="text-sm text-[#1F7A8C]">➔ {trip.arrivee}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">
                      {formatDate(trip.dateDepart)}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[var(--text)]">{trip.chauffeur.nom}</div>
                      <div className="text-xs text-gray-500">{trip.chauffeur.email}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold">{trip.placesDisponibles}</span>
                      <span className="text-gray-400 text-xs mx-1">/</span>
                      <span className="text-gray-500">{trip.placesMax}</span>
                    </td>
                    <td className="p-4 font-bold text-[var(--text)]">
                      {formatCurrency(trip.prixParPlace)}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        trip.etat === 'OPEN' ? 'bg-green-100 text-green-700' :
                        trip.etat === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                        trip.etat === 'CANCELED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {trip.etat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
