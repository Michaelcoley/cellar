import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Sparkles } from 'lucide-react';
import { categoryLabel } from '../lib/taxonomy';
import { fmtProof, daysSince } from '../lib/format';

export function BottleCard({ bottle, onClick }) {
  const fill = Math.max(0, Math.min(100, bottle.fill_pct ?? 100));
  const lowFill = fill > 0 && fill < 20;

  return (
    <motion.button
      layout
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick?.(bottle)}
      className="group relative flex w-full items-center gap-4 rounded-2xl border border-ink-800 bg-ink-900 p-3 text-left shadow-card transition-colors hover:border-amber/40"
    >
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-ink-800">
        {bottle.photo_url ? (
          <img src={bottle.photo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-amber/40 font-display text-2xl">
            {bottle.name?.[0] ?? '·'}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-ink-700">
            <div
              className={clsx('h-full transition-all', lowFill ? 'bg-warning' : 'bg-amber')}
              style={{ width: `${fill}%` }}
            />
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {bottle.allocated && <Sparkles className="h-3.5 w-3.5 shrink-0 text-amber" />}
          <h3 className="truncate font-display text-base font-medium leading-tight">{bottle.name || 'Untitled'}</h3>
        </div>
        <p className="mt-0.5 truncate text-xs text-bone/60">
          {bottle.brand && <span>{bottle.brand}</span>}
          {bottle.subtype && <span> · {bottle.subtype}</span>}
          {!bottle.brand && !bottle.subtype && <span>{categoryLabel(bottle.category)}</span>}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-bone/50">
          {bottle.proof != null && <span className="font-mono">{fmtProof(bottle.proof)}</span>}
          {bottle.age_years && <span>· {bottle.age_years}yr</span>}
          {bottle.opened_at && (
            <span>· opened {daysSinceLabel(daysSince(bottle.opened_at))}</span>
          )}
          {bottle.status && bottle.status !== 'sealed' && (
            <span className="rounded-full bg-amber/10 px-1.5 py-0.5 text-amber">{bottle.status}</span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

function daysSinceLabel(d) {
  if (d == null) return '—';
  if (d < 1) return 'today';
  if (d < 30) return `${d}d`;
  if (d < 365) return `${Math.round(d / 30)}mo`;
  return `${(d / 365).toFixed(1)}y`;
}
