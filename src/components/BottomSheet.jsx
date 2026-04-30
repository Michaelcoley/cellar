import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { useEffect } from 'react';

export function BottomSheet({ open, onClose, children, title }) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;
    // Always restore to '', not the captured previous value — racing effects
    // (rapid open/close, StrictMode double-mount) can leave `prev` already set
    // to 'hidden', which would permanently lock body scroll on cleanup.
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
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
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 600) onClose?.();
            }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-sheet bg-ink-900 shadow-card"
          >
            {/* Drag handle — only this initiates the dismiss gesture, so the
                content area below scrolls normally on iOS. */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex shrink-0 cursor-grab touch-none flex-col items-center gap-2 bg-ink-900 pb-3 pt-3"
            >
              <div className="h-1.5 w-12 rounded-full bg-ink-600" />
              {title && <h2 className="font-display text-xl">{title}</h2>}
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(env(safe-area-inset-bottom),16px)] [-webkit-overflow-scrolling:touch]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
