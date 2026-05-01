'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  type?: 'danger' | 'success' | 'info';
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  type = 'info',
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[var(--surface)] rounded-[2.5rem] shadow-2xl overflow-hidden pointer-events-auto border border-[var(--border)]"
            >
              <div className="p-8 sm:p-10 text-center flex flex-col items-center">
                <div className={`w-20 h-20 rounded-[1.5rem] flex items-center justify-center mb-8 shadow-xl ${
                  type === 'danger' ? 'bg-red-500 text-white shadow-red-500/20' : 
                  type === 'success' ? 'bg-green-500 text-white shadow-green-500/20' : 
                  'bg-primary text-white shadow-primary/20'
                }`}>
                  {type === 'danger' ? (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : type === 'success' ? (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>

                <h3 className="text-3xl font-black text-[var(--text)] mb-4 tracking-tighter font-display">{title}</h3>
                <p className="text-[var(--text-muted)] font-medium leading-relaxed mb-10 px-4">{message}</p>

                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest bg-[var(--surface-hover)] hover:bg-[var(--surface-hover)]/80 text-[var(--text)]"
                  >
                    {cancelLabel}
                  </Button>
                  <Button
                    variant={type === 'danger' ? 'danger' : 'primary'}
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                      type === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' : 
                      type === 'success' ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20' : 
                      'bg-primary hover:bg-primary-dark text-white shadow-primary/20'
                    }`}
                  >
                    {isLoading ? (
                      <span className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      confirmLabel
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
