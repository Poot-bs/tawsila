'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mapsApi } from '@/lib/api/maps.api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

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
  const t = useTranslations('trips');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [filters, setFilters] = useState<FilterValues>({
    depart: '',
    arrivee: '',
    dateMin: '',
    prixMax: '',
    seatsMin: '1',
    minRating: '0',
  });


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
    if (window.innerWidth < 1024) setIsExpanded(false);
  };

  return (
    <div className="lg:sticky lg:top-24 font-body">
      <div className="lg:hidden mb-6">
        <Button 
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline" 
          className="w-full flex items-center justify-between h-14 rounded-2xl border-[var(--border)] bg-[var(--surface)] shadow-lg active:scale-[0.98] transition-all"
        >
          <span className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            </div>
            <span className="font-black text-primary uppercase tracking-widest text-xs">{t('filters')}</span>
          </span>
          <svg className={cn("w-5 h-5 transition-transform text-[var(--text-muted)]", isExpanded ? "rotate-180" : "")} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
        </Button>
      </div>

      <form 
        onSubmit={handleSearch} 
        className={cn(
          "bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-2xl shadow-primary/5 backdrop-blur-xl transition-all duration-500",
          !isExpanded ? "hidden lg:block" : "block animate-fade-up"
        )}
      >
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-[var(--border)]">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">{t('filters')}</p>
            <h2 className="text-2xl font-black text-[var(--text)] tracking-tighter font-display leading-none">{t('refineSearch')}</h2>
          </div>
          <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 uppercase tracking-widest">Shared</span>
        </div>

        <div className="space-y-6 mb-8">
          {/* Depart */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('depart')}</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <Input 
                value={filters.depart} 
                onChange={(e) => setFilters(prev => ({ ...prev, depart: e.target.value }))} 
                placeholder={t('depart')}
                className="w-full h-12 pl-12 rounded-xl bg-[var(--surface-hover)]/50 border-[var(--border)] focus:bg-[var(--surface)] font-bold transition-all"
              />
            </div>
          </div>

          {/* Arrivee */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('arrivee')}</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-primary transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <Input 
                value={filters.arrivee} 
                onChange={(e) => setFilters(prev => ({ ...prev, arrivee: e.target.value }))} 
                placeholder={t('arrivee')}
                className="w-full h-12 pl-12 rounded-xl bg-[var(--surface-hover)]/50 border-[var(--border)] focus:bg-[var(--surface)] font-bold transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('date')}</label>
              <Input 
                type="date"
                value={filters.dateMin} 
                onChange={(e) => setFilters(prev => ({ ...prev, dateMin: e.target.value }))} 
                className="w-full h-12 rounded-xl bg-[var(--surface-hover)]/50 border-[var(--border)] font-bold text-xs"
              />
            </div>

            {/* Places */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('placesMin')}</label>
              <Input 
                type="number"
                min="1"
                max="8"
                value={filters.seatsMin} 
                onChange={(e) => setFilters(prev => ({ ...prev, seatsMin: e.target.value }))} 
                className="w-full h-12 rounded-xl bg-[var(--surface-hover)]/50 border-[var(--border)] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Budget */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('budgetMax')}</label>
              <Input 
                type="number"
                step="0.5"
                value={filters.prixMax} 
                onChange={(e) => setFilters(prev => ({ ...prev, prixMax: e.target.value }))} 
                placeholder="ex: 20"
                className="w-full h-12 rounded-xl bg-[var(--surface-hover)]/50 border-[var(--border)] font-bold"
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('minRating')}</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
                className="w-full h-12 bg-[var(--surface-hover)]/50 border border-[var(--border)] rounded-xl px-4 py-2 text-xs font-black focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer"
              >
                <option value="0">{t('allRatings')}</option>
                <option value="3">3+ ★</option>
                <option value="4">4+ ★</option>
                <option value="4.5">4.5+ ★</option>
              </select>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          {t('searchButton')}
        </Button>
      </form>
    </div>
  );
}
