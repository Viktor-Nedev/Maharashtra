import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '@/lib/toastStore';

const ICON: Record<string, string> = {
  success: '✓',
  info: '✦',
  error: '!',
};

export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div className="toaster" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={`toast toast--${t.type}`}
            initial={{ opacity: 0, x: 40, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.9 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => dismiss(t.id)}
          >
            <span className="toast__icon">{ICON[t.type]}</span>
            <span className="toast__msg">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
