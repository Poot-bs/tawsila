'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userDataApi, reservationsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

import { useTranslations } from 'next-intl';

export default function PaymentsPage() {
  const t = useTranslations('payments');
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

  const addMethodMutation = useMutation({
    mutationFn: () => userDataApi.addPaymentMethod({
      passagerId: user!.userId,
      ...newMethod
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-methods'] });
      setIsAdding(false);
      setNewMethod({ holderName: '', type: 'CREDIT_CARD', cardLast4: '' });
      toast.success(t('addSuccess'));
    },
    onError: () => toast.error(t('addError')),
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethod.holderName || newMethod.cardLast4.length !== 4) {
      toast.error(t('validationError'));
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
          <h2 className="text-2xl font-bold text-[var(--text)] mb-4">{t('driverNoticeTitle')}</h2>
          <p className="text-[var(--text-muted)]">{t('driverNoticeDesc')}</p>
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
          className="relative overflow-hidden rounded-[2.5rem] bg-secondary text-white px-6 py-12 sm:px-12 shadow-2xl"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,var(--color-secondary)_30%,var(--color-secondary-light)_75%,var(--color-primary)_120%)] opacity-95" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(191,219,247,0.2),transparent_55%)]" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent/80 mb-3">{t('financialManagement')}</p>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-display leading-tight">
              {t('title')}
            </h1>
            <p className="mt-6 text-lg text-accent/90 font-medium leading-relaxed">
              {t('subtitle')}
            </p>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-sm p-8 sm:p-10"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-[var(--text)] font-display tracking-tight">{t('myCards')}</h2>
              <Button
                onClick={() => setIsAdding(!isAdding)}
                variant="outline"
                className="rounded-xl border-primary text-primary hover:bg-primary/10 font-bold"
              >
                {isAdding ? t('cancel') : `+ ${t('addCard')}`}
              </Button>
            </div>

            {isAdding && (
              <form onSubmit={handleAddSubmit} className="mb-10 bg-[var(--surface-hover)] p-8 rounded-2xl border border-[var(--border)] space-y-6">
                <h3 className="font-black text-[var(--text)] uppercase tracking-widest text-[10px] ml-1">{t('addNewCard')}</h3>
                <div className="space-y-4">
                  <Input
                    placeholder={t('holderName')}
                    value={newMethod.holderName}
                    onChange={e => setNewMethod({...newMethod, holderName: e.target.value})}
                    className="h-14 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <select
                      className="flex h-14 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-bold text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary appearance-none cursor-pointer"
                      value={newMethod.type}
                      onChange={e => setNewMethod({...newMethod, type: e.target.value})}
                    >
                      <option value="CREDIT_CARD">{t('creditCard')}</option>
                      <option value="EDINAR">{t('eDinar')}</option>
                      <option value="D17">{t('d17')}</option>
                    </select>
                    <Input
                      placeholder={t('cardNumber')}
                      maxLength={4}
                      value={newMethod.cardLast4}
                      onChange={e => setNewMethod({...newMethod, cardLast4: e.target.value.replace(/\D/g, '')})}
                      className="h-14 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={addMethodMutation.isPending} className="w-full bg-primary hover:bg-primary-dark text-white font-black rounded-xl h-14 shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]">
                  {addMethodMutation.isPending ? t('saving') : t('save')}
                </Button>
              </form>
            )}

            {loadingMethods ? (
              <div className="space-y-4">
                <div className="h-24 bg-[var(--surface-hover)] rounded-2xl animate-pulse" />
                <div className="h-24 bg-[var(--surface-hover)] rounded-2xl animate-pulse" />
              </div>
            ) : !paymentMethods || paymentMethods.length === 0 ? (
              <div className="text-center py-16 bg-[var(--surface-hover)]/30 rounded-2xl border-2 border-dashed border-[var(--border)]">
                <p className="text-[var(--text-muted)] font-bold">{t('noMethods')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl hover:bg-[var(--surface-hover)]/50 transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                      </div>
                      <div>
                        <p className="font-black text-lg text-[var(--text)] tracking-tight">{method.type} •••• {method.cardLast4}</p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-1">{method.holderName}</p>
                      </div>
                    </div>
                    <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-green-500/20">{t('active')}</span>
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
            className="bg-[var(--surface)] rounded-[2rem] border border-[var(--border)] shadow-sm p-8 sm:p-10"
          >
            <h2 className="text-2xl font-black text-[var(--text)] mb-8 font-display tracking-tight">{t('howItWorks')}</h2>
            <div className="p-10 border border-[var(--border)] rounded-2xl bg-[var(--surface-hover)]/30 space-y-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto text-primary shadow-inner">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-black text-[var(--text)] tracking-tight">{t('howItWorksTitle')}</h3>
                <p className="text-base text-[var(--text-muted)] leading-relaxed font-medium">
                  {t('howItWorksDesc')}
                </p>
              </div>
              <div className="pt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">0%</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)]">Commission</p>
                </div>
                <div className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--border)]">
                  <p className="text-xs font-black text-primary uppercase tracking-widest mb-1">SSL</p>
                  <p className="text-[10px] font-bold text-[var(--text-muted)]">Encrypted</p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
