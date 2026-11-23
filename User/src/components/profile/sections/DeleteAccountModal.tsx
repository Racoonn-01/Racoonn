'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2, Loader2, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ isOpen, onClose }: DeleteAccountModalProps) {
  const { deleteAccount, user } = useAuthStore();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (!confirmed) return;

    setIsDeleting(true);
    setErrorMessage(null);

    try {
      await deleteAccount();
      toast.success('Your account has been deleted successfully.');
      onClose();
      router.push('/');
    } catch (err: any) {
      console.error('Failed to delete account:', err);
      const msg = err?.message || 'Failed to delete account. Please try again or contact support.';
      setErrorMessage(msg);
      toast.error(msg);
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (isDeleting) return; // Prevent closing while in-flight
    setConfirmed(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 z-10 border border-gray-100 overflow-hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            disabled={isDeleting}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>

          {/* Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-red-100/80 text-red-600 flex items-center justify-center mb-5 ring-8 ring-red-50">
            <Trash2 size={26} className="text-red-600" />
          </div>

          {/* Heading */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Delete Account
          </h3>

          {/* Subtitle / Warning description */}
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Are you sure you want to delete your account? This action is <span className="font-semibold text-red-600">permanent</span> and cannot be undone.
          </p>

          {/* Consequences Alert Box */}
          <div className="bg-red-50/70 border border-red-200/60 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={18} />
              <div className="text-xs text-red-900 space-y-1.5">
                <p className="font-semibold">By deleting your account:</p>
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  <li>Your profile information and contact details will be removed.</li>
                  <li>All saved stays and wishlists will be permanently cleared.</li>
                  <li>You will be immediately logged out and will lose access to this account.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Error Message if any */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 mb-6 cursor-pointer select-none group">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              disabled={isDeleting}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">
              I understand that deleting my account is permanent and all my data will be lost.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!confirmed || isDeleting}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Deleting Account...</span>
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  <span>Delete Account</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
