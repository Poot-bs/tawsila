'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mapsApi } from '@/lib/api/maps.api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

export interface FilterValues {
  depart: string;
  arrivee: string;
  dateMin: string;
  prixMax: string;
  seatsMin: string;
  minRating: string;
}

interface TripFiltersProps {
  onSearch: (filters: FilterValues) => void;
}

export function TripFilters({ onSearch }: TripFiltersProps) {
  const t = useTranslations();
  
  const [filters, setFilters] = useState<FilterValues>({
    depart: '',
    arrivee: '',
    dateMin: '',
    prixMax: '',
    seatsMin: '1',
    minRating: '0',
  });

  const [departSearch, setDepartSearch] = useState('');
  const [arriveeSearch, setArriveeSearch] = useState('');

  // Geocoding queries
  const { data: departSuggestions } = useQuery({
    queryKey: ['geocode', departSearch],
    queryFn: () => mapsApi.geocode(departSearch),
    enabled: departSearch.length > 2,
    staleTime: 60000,
  });

  const { data: arriveeSuggestions } = useQuery({
    queryKey: ['geocode', arriveeSearch],
    queryFn: () => mapsApi.geocode(arriveeSearch),
    enabled: arriveeSearch.length > 2,
    staleTime: 60000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleSelectDepart = (address: string) => {
    setFilters(prev => ({ ...prev, depart: address }));
    setDepartSearch('');
  };

  const handleSelectArrivee = (address: string) => {
    setFilters(prev => ({ ...prev, arrivee: address }));
    setArriveeSearch('');
  };

  return (
    <form onSubmit={handleSearch} className="bg-white/90 border border-[#E1E5F2] rounded-3xl p-6 shadow-xl shadow-[#022B3A]/5 backdrop-blur">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1F7A8C]">Filtres</p>
          <h2 className="text-2xl font-extrabold text-[#022B3A] mt-2 font-display">Affiner la recherche</h2>
        </div>
        <span className="text-xs font-semibold text-[#1F7A8C] bg-[#E1E5F2] px-3 py-1 rounded-full">Campus rides</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-4">
        {/* Depart */}
        <div className="relative">
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Depart</label>
          <Input 
            value={filters.depart} 
            onChange={(e) => {
              setFilters(prev => ({ ...prev, depart: e.target.value }));
              setDepartSearch(e.target.value);
            }} 
            placeholder="Ville de départ"
            className="w-full"
          />
          {departSuggestions && departSuggestions.length > 0 && departSearch && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {departSuggestions.map(s => (
                <div 
                  key={s.label} 
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => handleSelectDepart(s.label)}
                >
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Arrivee */}
        <div className="relative">
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Arrivee</label>
          <Input 
            value={filters.arrivee} 
            onChange={(e) => {
              setFilters(prev => ({ ...prev, arrivee: e.target.value }));
              setArriveeSearch(e.target.value);
            }} 
            placeholder="Ville d'arrivée"
            className="w-full"
          />
          {arriveeSuggestions && arriveeSuggestions.length > 0 && arriveeSearch && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {arriveeSuggestions.map(s => (
                <div 
                  key={s.label} 
                  className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  onClick={() => handleSelectArrivee(s.label)}
                >
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Date</label>
          <Input 
            type="date"
            value={filters.dateMin} 
            onChange={(e) => setFilters(prev => ({ ...prev, dateMin: e.target.value }))} 
            className="w-full"
          />
        </div>

        {/* Places */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Places min.</label>
          <Input 
            type="number"
            min="1"
            max="8"
            value={filters.seatsMin} 
            onChange={(e) => setFilters(prev => ({ ...prev, seatsMin: e.target.value }))} 
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 mb-6">
        {/* Budget */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Budget max (TND)</label>
          <Input 
            type="number"
            step="0.5"
            value={filters.prixMax} 
            onChange={(e) => setFilters(prev => ({ ...prev, prixMax: e.target.value }))} 
            placeholder="ex: 20"
            className="w-full"
          />
        </div>

        {/* Rating */}
        <div>
          <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Note chauffeur (min)</label>
          <select
            value={filters.minRating}
            onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
            className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-semibold focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="0">Toutes les notes</option>
            <option value="3">3+ Étoiles</option>
            <option value="4">4+ Étoiles</option>
            <option value="4.5">4.5+ Étoiles</option>
          </select>
        </div>

        <div className="flex items-end">
          <Button type="submit" className="w-full h-[48px] font-bold text-base">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            Rechercher
          </Button>
        </div>
      </div>
    </form>
  );
}
