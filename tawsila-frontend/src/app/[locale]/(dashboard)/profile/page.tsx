'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, userDataApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function ProfilePage() {
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
      toast.success('Véhicule ajouté avec succès');
    },
    onError: () => toast.error('Erreur lors de l\'ajout du véhicule'),
  });

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.marque || !newVehicle.modele || !newVehicle.immatriculation) {
      toast.error('Veuillez remplir tous les champs obligatoires');
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
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0B1F2A] text-white px-6 py-10 sm:px-10"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#0B1F2A_25%,#123A47_75%,#1F7A8C_120%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#BFDBF7]">Espace personnel</p>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight font-display">
              Mon profil
            </h1>
            <p className="mt-4 text-lg text-[#E1E5F2]">
              Retrouvez vos informations et gerez vos vehicules en toute simplicite.
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
            <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-[#0B1F2A]" />
              <div className="absolute top-0 left-0 w-full h-32 bg-[radial-gradient(circle_at_top_left,rgba(191,219,247,0.25),transparent_55%)]" />
              <div className="relative mt-8">
                <div className="w-32 h-32 mx-auto bg-[var(--surface-hover)] border-4 border-[var(--surface)] rounded-full flex items-center justify-center text-4xl font-bold text-[var(--text)] mb-4 shadow-lg">
                  {profile?.name?.charAt(0) || user?.userId?.charAt(0) || 'U'}
                </div>
                <h2 className="text-2xl font-bold text-[var(--text)] font-display">{profile?.name || 'Chargement...'}</h2>
                <p className="text-primary font-medium mb-4">{profile?.email || '...'}</p>
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {profile?.role || user?.role}
                </span>
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
            <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-[var(--text)] mb-6 font-display">Informations personnelles</h2>

              {loadingProfile ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-10 bg-[var(--surface-hover)] rounded-xl w-full" />
                  <div className="h-10 bg-[var(--surface-hover)] rounded-xl w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-1">Nom complet</label>
                    <Input value={profile?.name || ''} readOnly className="bg-[var(--surface-hover)] border-[var(--border)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[var(--text-muted)] mb-1">Email</label>
                    <Input value={profile?.email || ''} readOnly className="bg-[var(--surface-hover)] border-[var(--border)]" />
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-2">
                    * Pour modifier vos informations, veuillez contacter l'administration.
                  </p>
                </div>
              )}
            </div>

            {isDriver && (
              <div className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-[var(--text)] font-display">Mes vehicules</h2>
                  <Button
                    onClick={() => setIsAddingVehicle(!isAddingVehicle)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-primary text-primary hover:bg-primary/10"
                  >
                    {isAddingVehicle ? 'Annuler' : '+ Ajouter'}
                  </Button>
                </div>

                {isAddingVehicle && (
                  <form onSubmit={handleAddVehicle} className="mb-6 bg-[var(--surface-hover)] p-6 rounded-2xl border border-[var(--border)] space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Marque</label>
                        <Input
                          placeholder="ex: Peugeot"
                          value={newVehicle.marque}
                          onChange={e => setNewVehicle({...newVehicle, marque: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Modèle</label>
                        <Input
                          placeholder="ex: 208"
                          value={newVehicle.modele}
                          onChange={e => setNewVehicle({...newVehicle, modele: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Immatriculation</label>
                        <Input
                          placeholder="ex: 123 TUN 4567"
                          value={newVehicle.immatriculation}
                          onChange={e => setNewVehicle({...newVehicle, immatriculation: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Capacite (places)</label>
                        <Input
                          type="number"
                          min={1}
                          max={8}
                          value={newVehicle.capacite}
                          onChange={e => setNewVehicle({...newVehicle, capacite: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={addVehicleMutation.isPending} className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-xl mt-2">
                      {addVehicleMutation.isPending ? 'Enregistrement...' : 'Enregistrer le vehicule'}
                    </Button>
                  </form>
                )}

                {loadingVehicles ? (
                  <div className="h-16 bg-[var(--surface-hover)] rounded-xl animate-pulse" />
                ) : !vehicles || vehicles.length === 0 ? (
                  <div className="text-center py-6 text-[var(--text-muted)] text-sm">
                    Aucun vehicule enregistre. Ajoutez-en un pour commencer a proposer des trajets.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicles.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl hover:bg-[var(--surface-hover)] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-secondary text-white rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text)]">{v.marque} {v.modele}</p>
                            <p className="text-xs text-[var(--text-muted)] uppercase">{v.immatriculation}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="block font-black text-primary">{v.capacite}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Places</span>
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
