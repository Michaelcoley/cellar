import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';
import { useScanner } from '../hooks/useScanner';
import { useHaptics } from '../hooks/useHaptics';

export function Scanner({ open, onClose, onCode }) {
  const containerRef = useRef(null);
  const [manual, setManual] = useState(false);
  const [code, setCode] = useState('');
  const { tap } = useHaptics();

  useScanner({
    targetRef: containerRef,
    enabled: open && !manual,
    onDetected: (c) => {
      tap('success');
      onCode?.(c);
    },
  });

  useEffect(() => {
    if (!open) {
      setManual(false);
      setCode('');
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <div ref={containerRef} className="absolute inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover [&_canvas]:hidden" />

      {/* Cinematic overlay */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute left-1/2 top-1/2 h-56 w-72 -translate-x-1/2 -translate-y-1/2 [box-shadow:0_0_0_9999px_rgba(0,0,0,0.55)] rounded-2xl">
          <Corner className="left-0 top-0" />
          <Corner className="right-0 top-0 rotate-90" />
          <Corner className="right-0 bottom-0 rotate-180" />
          <Corner className="left-0 bottom-0 -rotate-90" />
          {!manual && (
            <motion.div
              animate={{ y: ['-90%', '90%', '-90%'] }}
              transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
              className="absolute inset-x-3 top-1/2 h-px bg-gradient-to-r from-transparent via-amber to-transparent shadow-[0_0_24px_2px_rgba(212,165,116,0.7)]"
            />
          )}
        </div>
      </div>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[max(env(safe-area-inset-top),16px)]">
        <button
          onClick={onClose}
          className="rounded-full bg-black/60 p-2.5 text-bone backdrop-blur"
          aria-label="Close scanner"
        >
          <X className="h-5 w-5" />
        </button>
        <button
          onClick={() => setManual((m) => !m)}
          className="rounded-full bg-black/60 p-2.5 text-bone backdrop-blur"
          aria-label="Manual entry"
        >
          <Keyboard className="h-5 w-5" />
        </button>
      </div>

      {/* Bottom hint / manual entry */}
      <div className="absolute inset-x-0 bottom-0 p-6 pb-[max(env(safe-area-inset-bottom),24px)]">
        {manual ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (code.trim()) onCode?.(code.trim());
            }}
            className="mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-ink-900/95 p-2 backdrop-blur"
          >
            <input
              autoFocus
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Type a UPC…"
              className="flex-1 bg-transparent px-3 py-2 font-mono text-lg outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-amber px-4 py-2 font-medium text-ink-950 disabled:opacity-50"
              disabled={!code.trim()}
            >
              Lookup
            </button>
          </form>
        ) : (
          <p className="mx-auto max-w-xs text-center text-sm text-bone/70">
            Point at a barcode. We’ll do the rest.
          </p>
        )}
      </div>
    </div>
  );
}

function Corner({ className = '' }) {
  return (
    <span
      aria-hidden
      className={`absolute h-5 w-5 border-amber ${className} border-l-2 border-t-2`}
      style={{ borderTopLeftRadius: 6 }}
    />
  );
}
