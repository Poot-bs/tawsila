'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  passagerId: string;
  chauffeurId: string;
  driverName: string;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  reservationId,
  passagerId,
  chauffeurId,
  driverName,
}: ReviewSubmissionModalProps) {
  const queryClient = useQueryClient();
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: () => reviewsApi.create({
      reservationId,
      passagerId,
      chauffeurId,
      stars,
      comment,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-summary', chauffeurId] });
      queryClient.invalidateQueries({ queryKey: ['driver-reviews', chauffeurId] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#022B3A] mb-2">Évaluer votre trajet</h2>
            <p className="text-gray-500 text-sm">
              Comment s'est passé votre voyage avec <span className="font-bold text-[#1F7A8C]">{driverName}</span> ?
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverStars(star)}
                onMouseLeave={() => setHoverStars(0)}
                onClick={() => setStars(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <svg
                  className={`w-10 h-10 transition-colors ${
                    (hoverStars || stars) >= star ? 'fill-amber-400 text-amber-400' : 'fill-transparent text-gray-300'
                  }`}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Commentaire <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:border-[#1F7A8C] focus:ring-1 focus:ring-[#1F7A8C] outline-none min-h-[100px] resize-none"
            />
          </div>

          <Button
            onClick={() => submitMutation.mutate()}
            disabled={stars === 0 || submitMutation.isPending}
            className="w-full bg-[#1F7A8C] hover:bg-[#022B3A] text-white font-bold h-12 rounded-xl transition-colors"
          >
            {submitMutation.isPending ? 'Envoi en cours...' : 'Envoyer mon avis'}
          </Button>

          {submitMutation.isError && (
            <p className="mt-3 text-sm text-red-500 text-center font-medium">
              Une erreur est survenue. Veuillez réessayer.
            </p>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
