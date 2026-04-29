'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userDataApi, reservationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function PaymentsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const isDriver = user?.role === 'CHAUFFEUR';

  const [isAdding, setIsAdding] = useState(false);
  const [newMethod, setNewMethod] = useState({
    holderName: '',
    type: 'CREDIT_CARD',
    cardLast4: '',
  });

  const { data: paymentMethods, isLoading: loadingMethods } = useQuery({
    queryKey: ['payment-methods', user?.userId],
    queryFn: () => userDataApi.getPaymentMethods(user!.userId),
    enabled: !!user?.userId && !isDriver,
  });

  const { data: reservations, isLoading: loadingReservations } = useQuery({
    queryKey: ['reservations', 'passager', user?.userId],
    queryFn: () => reservationsApi.tracking(user!.userId),
    enabled: !!user?.userId && !isDriver,
  });

  const addMethodMutation = useMutation({
    mutationFn: () => userDataApi.addPaymentMethod({
      passagerId: user!.userId,
      ...newMethod
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setIsAdding(false);
      setNewMethod({ holderName: '', type: 'CREDIT_CARD', cardLast4: '' });
      toast.success('Moyen de paiement ajouté avec succès');
    },
    onError: () => toast.error('Erreur lors de l\'ajout du moyen de paiement'),
  });



  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethod.holderName || newMethod.cardLast4.length !== 4) {
      toast.error('Veuillez remplir correctement les champs (4 derniers chiffres requis)');
      return;
    }
    addMethodMutation.mutate();
  };

  if (isDriver) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] p-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">Espace Chauffeur</h2>
          <p className="text-[var(--text-muted)]">Vos revenus sont gérés directement via la plateforme. Vous n'avez pas besoin d'ajouter de moyen de paiement.</p>
        </div>
      </div>
    );
  }



  return (
    <div className="relative font-body">
      <div className="pointer-events-none absolute -top-40 left-1/3 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(31,122,140,0.15),transparent_65%)] blur-2xl" />

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-[#0B1F2A] text-white px-6 py-10 sm:px-10 sm:py-12 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,#0B1F2A_30%,#123A47_75%,#1F7A8C_120%)] opacity-90" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#BFDBF7]">Gestion financière</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight font-display">
              Paiements
            </h1>
            <p className="mt-4 text-lg text-[#E1E5F2]">
              Gérez vos cartes et réglez vos réservations en attente.
            </p>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 sm:p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[var(--text)]">Mes cartes</h2>
              <Button
                onClick={() => setIsAdding(!isAdding)}
                variant="outline"
                className="rounded-xl border-primary text-primary hover:bg-primary/10"
              >
                {isAdding ? 'Annuler' : '+ Ajouter'}
              </Button>
            </div>

            {isAdding && (
              <form onSubmit={handleAddSubmit} className="mb-8 bg-[var(--surface-hover)] p-6 rounded-2xl border border-[var(--border)] space-y-4">
                <h3 className="font-bold text-[var(--text)] mb-2">Ajouter une nouvelle carte</h3>
                <Input
                  placeholder="Nom du titulaire"
                  value={newMethod.holderName}
                  onChange={e => setNewMethod({...newMethod, holderName: e.target.value})}
                />
                <div className="flex gap-4">
                  <select
                    className="flex h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm font-medium text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={newMethod.type}
                    onChange={e => setNewMethod({...newMethod, type: e.target.value})}
                  >
                    <option value="CREDIT_CARD">Carte de crédit</option>
                    <option value="EDINAR">e-Dinar</option>
                    <option value="D17">D17</option>
                  </select>
                  <Input
                    placeholder="4 derniers chiffres"
                    maxLength={4}
                    value={newMethod.cardLast4}
                    onChange={e => setNewMethod({...newMethod, cardLast4: e.target.value.replace(/\D/g, '')})}
                  />
                </div>
                <Button type="submit" disabled={addMethodMutation.isPending} className="w-full bg-primary hover:bg-primary-dark text-white font-bold rounded-xl h-10">
                  {addMethodMutation.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </form>
            )}

            {loadingMethods ? (
              <div className="space-y-4">
                <div className="h-20 bg-[var(--surface-hover)] rounded-2xl animate-pulse" />
                <div className="h-20 bg-[var(--surface-hover)] rounded-2xl animate-pulse" />
              </div>
            ) : !paymentMethods || paymentMethods.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-[var(--text-muted)] font-medium">Aucun moyen de paiement enregistré.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-4 bg-[var(--surface)] border-2 border-[var(--border)] rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary text-white rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text)]">{method.type} •••• {method.cardLast4}</p>
                        <p className="text-sm text-[var(--text-muted)] uppercase">{method.holderName}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-full uppercase">Actif</span>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Automatic Payments Info Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[var(--surface)] rounded-3xl border border-[var(--border)] shadow-sm p-6 sm:p-8"
          >
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">Comment ça marche ?</h2>
            <div className="text-center py-12 px-6 border-2 border-[var(--border)] rounded-2xl bg-[var(--surface-hover)] space-y-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">Paiements 100% automatiques</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Vous n'avez pas besoin de payer manuellement. Une fois que vous ajoutez votre carte, le montant est <b>sécurisé</b> lorsque vous réservez un trajet.
                  <br /><br />
                  Le paiement est <b>automatiquement validé</b> uniquement lorsque le chauffeur accepte votre réservation.
                </p>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
