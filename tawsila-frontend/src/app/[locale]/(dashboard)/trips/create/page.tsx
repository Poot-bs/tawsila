'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, userDataApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

export default function CreateTripPage() {
  const t = useTranslations('trips');
  const commonT = useTranslations('common');
  const profileT = useTranslations('profile');
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isDriver = user?.role === 'CHAUFFEUR';

  const [form, setForm] = useState({
    depart: '',
    arrivee: '',
    dateDepart: '',
    heureDepart: '',
    placesMax: 3,
    prixParPlace: 5,
    vehiculeId: '',
  });

  /* ─── Inline vehicle form state ─── */
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    marque: '',
    modele: '',
    immatriculation: '',
    capacite: 4,
  });

  // Get the driver's vehicles
  const { data: vehicles, isLoading: loadingVehicles } = useQuery({
    queryKey: ['vehicles', user?.userId],
    queryFn: () => userDataApi.getVehicles(user!.userId),
    enabled: !!user?.userId && isDriver,
  });

  /* ─── Add vehicle mutation ─── */
  const addVehicleMutation = useMutation({
    mutationFn: () =>
      userDataApi.addVehicle({
        chauffeurId: user!.userId,
        ...newVehicle,
      }),
    onSuccess: (vehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      setShowVehicleForm(false);
      setNewVehicle({ marque: '', modele: '', immatriculation: '', capacite: 4 });
      setForm((f) => ({ ...f, vehiculeId: vehicle.id }));
      toast.success(profileT('vehicleSaved'));
    },
    onError: (err: any) => {
      console.error('Vehicle addition error:', err);
      toast.error(err.message || profileT('errorSavingVehicle'));
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

  const createMutation = useMutation({
    mutationFn: () => {
      const dateTime = `${form.dateDepart}T${form.heureDepart}:00`;
      return tripsApi.create({
        chauffeurId: user!.userId,
        vehiculeId: form.vehiculeId,
        depart: form.depart,
        arrivee: form.arrivee,
        dateDepart: dateTime,
        placesMax: form.placesMax,
        prixParPlace: form.prixParPlace,
      });
    },
    onSuccess: (trip) => {
      toast.success(t('tripPublished'));
      router.push(`/trips/${trip.id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message || commonT('error'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.depart || !form.arrivee || !form.dateDepart || !form.heureDepart) {
      toast.error(commonT('fillAllFields'));
      return;
    }
    if (!form.vehiculeId) {
      toast.error(t('selectVehicle'));
      return;
    }
    createMutation.mutate();
  };

  if (!isDriver) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-3xl p-12">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-800/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-3">{t('driverSpace')}</h2>
          <p className="text-amber-600 dark:text-amber-400 mb-6">{t('driverOnly')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden font-body">
      {/* Background blurs */}
      <div className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.18),transparent_65%)] blur-2xl" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-8 py-12 sm:px-12 sm:py-16 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_30%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(191,219,247,0.25),transparent_55%)]" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent/80 mb-3">{t('driverSpace')}</p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-display leading-[1.1]">
              {t('publishTitle')}
            </h1>
            <p className="mt-6 text-lg text-accent/90 font-medium leading-relaxed">
              {t('publishSubtitle')}
            </p>
          </div>
        </motion.section>

        {/* Main Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-8 sm:p-10 space-y-8"
        >
          {/* Route */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text)] mb-5 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              {t('route')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] mb-1.5">{t('depart')} *</label>
                <Input
                  placeholder="ex: Sousse"
                  value={form.depart}
                  onChange={e => setForm({...form, depart: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] mb-1.5">{t('arrivee')} *</label>
                <Input
                  placeholder="ex: Tunis"
                  value={form.arrivee}
                  onChange={e => setForm({...form, arrivee: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text)] mb-5 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              {t('dateTime')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] mb-1.5">{t('date')} *</label>
                <Input
                  type="date"
                  value={form.dateDepart}
                  onChange={e => setForm({...form, dateDepart: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] mb-1.5">{t('time')} *</label>
                <Input
                  type="time"
                  value={form.heureDepart}
                  onChange={e => setForm({...form, heureDepart: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text)] mb-5 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              {profileT('vehicleSection')}
            </h2>
            {loadingVehicles ? (
              <div className="h-12 bg-[var(--surface-hover)] animate-pulse rounded-xl" />
            ) : !vehicles || vehicles.length === 0 ? (
              /* ── No vehicles: show inline add form ── */
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/40 flex items-center justify-center">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-amber-800 dark:text-amber-300">{profileT('vehicleEmpty')}</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400">{t('addVehiclePrompt')}</p>
                    </div>
                  </div>
                  {!showVehicleForm && (
                    <button
                      type="button"
                      onClick={() => setShowVehicleForm(true)}
                      className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      {profileT('addVehicle')}
                    </button>
                  )}
                </div>

                {showVehicleForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-6 space-y-4"
                  >
                    <h3 className="font-bold text-[var(--text)] flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      {profileT('addVehicle')}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{profileT('vehicleBrand')} *</label>
                        <Input
                          placeholder="ex: Peugeot"
                          value={newVehicle.marque}
                          onChange={e => setNewVehicle({...newVehicle, marque: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{profileT('vehicleModel')} *</label>
                        <Input
                          placeholder="ex: 208"
                          value={newVehicle.modele}
                          onChange={e => setNewVehicle({...newVehicle, modele: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{profileT('vehiclePlate')} *</label>
                        <Input
                          placeholder="ex: 123 TUN 4567"
                          value={newVehicle.immatriculation}
                          onChange={e => setNewVehicle({...newVehicle, immatriculation: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{profileT('vehicleCapacity')}</label>
                        <Input
                          type="number"
                          min={1}
                          max={8}
                          value={newVehicle.capacite}
                          onChange={e => setNewVehicle({...newVehicle, capacite: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleAddVehicle}
                        disabled={addVehicleMutation.isPending}
                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {addVehicleMutation.isPending ? profileT('saving') : profileT('saveVehicle')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowVehicleForm(false)}
                        className="px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-bold hover:bg-[var(--surface)] transition-colors"
                      >
                        {commonT('cancel')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              /* ── Vehicle selector ── */
              <div className="space-y-3">
                <div className="grid gap-3">
                  {vehicles.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setForm({...form, vehiculeId: v.id})}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        form.vehiculeId === v.id
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-[var(--border)] hover:border-[var(--border-hover)] bg-[var(--surface)]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        form.vehiculeId === v.id ? 'bg-primary text-white' : 'bg-[var(--surface-hover)] text-[var(--text-muted)]'
                      }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-[var(--text)]">{v.marque} {v.modele}</p>
                        <p className="text-sm text-[var(--text-muted)]">{v.immatriculation} · {v.capacite} {profileT('seats')}</p>
                      </div>
                      {form.vehiculeId === v.id && (
                        <svg className="w-6 h-6 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setShowVehicleForm(!showVehicleForm)}
                  className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  {profileT('addVehicle')}
                </button>
                {showVehicleForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-6 space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{profileT('vehicleBrand')} *</label>
                        <Input placeholder="ex: Peugeot" value={newVehicle.marque} onChange={e => setNewVehicle({...newVehicle, marque: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{profileT('vehicleModel')} *</label>
                        <Input placeholder="ex: 208" value={newVehicle.modele} onChange={e => setNewVehicle({...newVehicle, modele: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{profileT('vehiclePlate')} *</label>
                        <Input placeholder="ex: 123 TUN 4567" value={newVehicle.immatriculation} onChange={e => setNewVehicle({...newVehicle, immatriculation: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">{profileT('vehicleCapacity')}</label>
                        <Input type="number" min={1} max={8} value={newVehicle.capacite} onChange={e => setNewVehicle({...newVehicle, capacite: Number(e.target.value)})} />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={handleAddVehicle} disabled={addVehicleMutation.isPending} className="flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                        {addVehicleMutation.isPending ? profileT('saving') : commonT('confirm')}
                      </button>
                      <button type="button" onClick={() => setShowVehicleForm(false)} className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-bold hover:bg-[var(--surface)] transition-colors">
                        {commonT('cancel')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Seats & Price */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text)] mb-5 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              {t('seatsAndPrice')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] mb-1.5">{t('placesMin')} *</label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={form.placesMax}
                  onChange={e => setForm({...form, placesMax: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--text-muted)] mb-1.5">{t('budgetMax')} *</label>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.prixParPlace}
                  onChange={e => setForm({...form, prixParPlace: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={createMutation.isPending}
            isLoading={createMutation.isPending}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-14 rounded-2xl text-lg shadow-lg shadow-primary/30"
          >
            {t('proposeButton')}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
