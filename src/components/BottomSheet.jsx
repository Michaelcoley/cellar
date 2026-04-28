import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';

export function BottomSheet({ open, onClose, children, title }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose?.();
            }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-sheet bg-ink-900 pb-[max(env(safe-area-inset-bottom),16px)] shadow-card"
          >
            <div className="sticky top-0 z-10 flex flex-col items-center gap-2 bg-ink-900/95 pb-3 pt-3 backdrop-blur">
              <div className="h-1.5 w-12 rounded-full bg-ink-600" />
              {title && <h2 className="font-display text-xl">{title}</h2>}
            </div>
            <div className="px-5">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
