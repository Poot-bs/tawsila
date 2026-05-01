'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, userDataApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const commonT = useTranslations('common');
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isDriver = user?.role === 'CHAUFFEUR';

  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    marque: '',
    modele: '',
    immatriculation: '',
    capacite: 4,
  });

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ['profile', user?.userId],
    queryFn: () => authApi.me(),
    enabled: !!user?.userId,
  });

  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles', user?.userId],
    queryFn: () => userDataApi.getVehicles(user!.userId),
    enabled: !!user?.userId && isDriver,
  });

  const addVehicleMutation = useMutation({
    mutationFn: () => userDataApi.addVehicle({
      chauffeurId: user!.userId,
      ...newVehicle
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setIsAddingVehicle(false);
      setNewVehicle({ marque: '', modele: '', immatriculation: '', capacite: 4 });
      toast.success(t('vehicleSaved'));
    },
    onError: (err: any) => {
      console.error('Add vehicle error:', err);
      toast.error(err.message || t('errorSavingVehicle'));
    },
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.marque || !newVehicle.modele || !newVehicle.immatriculation) {
      toast.error(commonT('fillAllFields'));
      return;
    }
    addVehicleMutation.mutate();
  };

  return (
    <div className="relative font-body">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.18),transparent_70%)] blur-2xl" />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-6 py-12 sm:px-12"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_25%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-accent/80">{t('personalSpace')}</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-black tracking-tight font-display">
              {t('title')}
            </h1>
            <p className="mt-6 text-lg text-accent/90 max-w-2xl font-medium leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="col-span-1"
          >
            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-secondary" />
              <div className="absolute top-0 left-0 w-full h-32 bg-[radial-gradient(circle_at_top_left,rgba(191,219,247,0.2),transparent_55%)]" />
              <div className="relative mt-8">
                <div className="w-32 h-32 mx-auto bg-[var(--surface)] border-4 border-[var(--surface)] rounded-full flex items-center justify-center text-4xl font-black text-primary mb-4 shadow-xl">
                  {profile?.name?.charAt(0) || user?.userId?.charAt(0) || 'U'}
                </div>
                <h2 className="text-2xl font-black text-[var(--text)] font-display tracking-tight">{profile?.name || commonT('loading')}</h2>
                <p className="text-primary font-bold mt-1 mb-6">{profile?.email || '...'}</p>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  {profile?.role || user?.role}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Info + Vehicles */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-1 lg:col-span-2 space-y-8"
          >
            <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-sm p-8 sm:p-10">
              <h2 className="text-2xl font-black text-[var(--text)] mb-8 font-display tracking-tight">{t('personalSection')}</h2>

              {loadingProfile ? (
                <div className="space-y-6 animate-pulse">
                  <div className="h-14 bg-[var(--surface-hover)] rounded-2xl w-full" />
                  <div className="h-14 bg-[var(--surface-hover)] rounded-2xl w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-primary uppercase tracking-[0.2em] ml-1">{t('personalName')}</label>
                    <Input value={profile?.name || ''} readOnly className="h-14 rounded-2xl bg-[var(--surface-hover)] border-[var(--border)] font-bold text-[var(--text)] focus:ring-0 cursor-default" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-primary uppercase tracking-[0.2em] ml-1">{t('personalEmail')}</label>
                    <Input value={profile?.email || ''} readOnly className="h-14 rounded-2xl bg-[var(--surface-hover)] border-[var(--border)] font-bold text-[var(--text)] focus:ring-0 cursor-default" />
                  </div>
                  <div className="pt-4 flex items-start gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                      {t('personalNote')}
                    </p>
                  </div>
                </div>
              )}
            </div>

                    {isDriver && (
              <div className="bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8 sm:p-10">
                <div className="flex items-center justify-between mb-10 pb-6 border-b border-[var(--border)]">
                  <div>
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">GESTION</p>
                    <h2 className="text-2xl font-black text-[var(--text)] font-display tracking-tight">{t('vehicleSection')}</h2>
                  </div>
                  <Button
                    onClick={() => setIsAddingVehicle(!isAddingVehicle)}
                    variant="outline"
                    className={cn(
                      "rounded-2xl border-primary text-primary hover:bg-primary hover:text-white font-black text-xs uppercase tracking-widest transition-all h-12 px-6",
                      isAddingVehicle ? "border-red-500 text-red-500 hover:bg-red-500" : ""
                    )}
                  >
                    {isAddingVehicle ? commonT('cancel') : `+ ${t('addVehicle')}`}
                  </Button>
                </div>

                {isAddingVehicle && (
                  <form onSubmit={handleAddVehicle} className="mb-8 bg-[var(--surface-hover)] p-8 rounded-[2rem] border border-[var(--border)] space-y-6 animate-fade-down">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('vehicleBrand')}</label>
                        <Input
                          placeholder="ex: Peugeot"
                          value={newVehicle.marque}
                          onChange={e => setNewVehicle({...newVehicle, marque: e.target.value})}
                          className="h-14 rounded-xl border-[var(--border)] bg-[var(--surface)] font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('vehicleModel')}</label>
                        <Input
                          placeholder="ex: 208"
                          value={newVehicle.modele}
                          onChange={e => setNewVehicle({...newVehicle, modele: e.target.value})}
                          className="h-14 rounded-xl border-[var(--border)] bg-[var(--surface)] font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('vehiclePlate')}</label>
                        <Input
                          placeholder="ex: 123 TUN 4567"
                          value={newVehicle.immatriculation}
                          onChange={e => setNewVehicle({...newVehicle, immatriculation: e.target.value})}
                          className="h-14 rounded-xl border-[var(--border)] bg-[var(--surface)] font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">{t('vehicleCapacity')}</label>
                        <Input
                          type="number"
                          min={1}
                          max={8}
                          value={newVehicle.capacite}
                          onChange={e => setNewVehicle({...newVehicle, capacite: Number(e.target.value)})}
                          className="h-14 rounded-xl border-[var(--border)] bg-[var(--surface)] font-bold"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={addVehicleMutation.isPending} className="w-full h-16 bg-primary hover:bg-primary-dark text-white font-black rounded-2xl text-sm uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                      {addVehicleMutation.isPending ? t('saving') : t('saveVehicle')}
                    </Button>
                  </form>
                )}

                {loadingVehicles ? (
                  <div className="h-20 bg-[var(--surface-hover)] rounded-2xl animate-pulse" />
                ) : !vehicles || vehicles.length === 0 ? (
                  <div className="text-center py-12 px-6 border-2 border-dashed border-[var(--border)] rounded-[2rem] bg-[var(--surface-hover)]/30">
                    <p className="text-[var(--text-muted)] font-black text-sm uppercase tracking-widest opacity-60">
                      {t('vehicleEmpty')}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {vehicles.map(v => (
                      <div key={v.id} className="group flex items-center justify-between p-6 bg-[var(--surface-hover)]/50 border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-hover)] transition-all hover:scale-[1.02] hover:border-primary/30">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-secondary text-white rounded-[1.25rem] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                          </div>
                          <div>
                            <p className="font-black text-[var(--text)] text-lg tracking-tight leading-none mb-1">{v.marque} {v.modele}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest opacity-70">{v.immatriculation}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block font-black text-2xl text-primary leading-none tracking-tighter">{v.capacite}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-60">{t('seats')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
}
