import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, Sparkles, Wine, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBottles } from '../hooks/useBottles';
import { usePours } from '../hooks/usePours';
import { useHaptics } from '../hooks/useHaptics';
import { Button } from '../components/Field';
import { StatusBadge } from '../components/StatusBadge';
import { BottomSheet } from '../components/BottomSheet';
import { BottleForm } from './BottleForm';
import { categoryLabel, defaultPourOz } from '../lib/taxonomy';
import { fmtMoney, fmtProof, fmtMl, daysSince, relativeDays, pourCost, poursRemaining } from '../lib/format';

export function BottleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bottles, updateBottle, deleteBottle } = useBottles();
  const { pours, logPour } = usePours(id);
  const { tap } = useHaptics();
  const [editing, setEditing] = useState(false);

  const bottle = useMemo(() => bottles.find((b) => b.id === id), [bottles, id]);
  if (!bottle) {
    return (
      <div className="flex h-screen items-center justify-center text-bone/50">
        <p>Bottle not found.</p>
      </div>
    );
  }

  const pourOz = defaultPourOz();
  const remaining = poursRemaining(bottle, pourOz);
  const oneCost = pourCost(bottle, pourOz);

  async function pour() {
    tap('medium');
    const next = Math.max(0, (bottle.fill_pct ?? 100) - (pourOz * 29.5735 * 100) / bottle.size_ml);
    const patch = { fill_pct: Number(next.toFixed(2)) };
    if (bottle.status === 'sealed') {
      patch.status = 'opened';
      patch.opened_at = new Date().toISOString();
    }
    await Promise.all([updateBottle(bottle.id, patch), logPour({ bottle_id: bottle.id, oz: pourOz })]);
  }

  async function remove() {
    if (!confirm(`Remove "${bottle.name}" from your cellar?`)) return;
    await deleteBottle(bottle.id);
    navigate('/', { replace: true });
  }

  return (
    <div className="pb-28">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-ink-950/95 px-3 pb-3 pt-[max(env(safe-area-inset-top),12px)] backdrop-blur">
        <button onClick={() => navigate(-1)} className="rounded-full bg-ink-800 p-2.5">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          <button onClick={() => setEditing(true)} className="rounded-full bg-ink-800 p-2.5">
            <Edit3 className="h-5 w-5" />
          </button>
          <button onClick={remove} className="rounded-full bg-ink-800 p-2.5 text-danger">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-5"
      >
        <div className="flex flex-col items-center pb-4 pt-2">
          <div className="relative h-44 w-32 overflow-hidden rounded-2xl bg-ink-800 shadow-card">
            {bottle.photo_url ? (
              <img src={bottle.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-5xl text-amber/40">
                {bottle.name?.[0] ?? '·'}
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1.5">
              {bottle.allocated && <Sparkles className="h-4 w-4 text-amber" />}
              <h1 className="font-display text-2xl">{bottle.name}</h1>
            </div>
            {bottle.brand && <p className="text-sm text-bone/60">{bottle.brand}</p>}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-bone/60">
              <span>{categoryLabel(bottle.category)}</span>
              {bottle.subtype && <span>· {bottle.subtype}</span>}
              {bottle.region && <span>· {bottle.region}</span>}
            </div>
            <div className="mt-3"><StatusBadge status={bottle.status} /></div>
          </div>
        </div>

        {/* Fill meter */}
        <div className="rounded-2xl border border-ink-800 bg-ink-900 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-xs uppercase tracking-wider text-bone/50">Remaining</span>
            <span className="font-mono text-lg">{Math.round(bottle.fill_pct ?? 100)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-800">
            <motion.div
              layout
              animate={{ width: `${bottle.fill_pct ?? 100}%` }}
              transition={{ type: 'spring', damping: 24 }}
              className="h-full bg-gradient-to-r from-amber-300 to-amber"
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
            <Stat label="Pours left" value={remaining ?? '—'} />
            <Stat label="Per pour" value={oneCost != null ? fmtMoney(oneCost) : '—'} />
            <Stat
              label="Opened"
              value={bottle.opened_at ? relativeDays(daysSince(bottle.opened_at)) : '—'}
            />
          </div>
        </div>

        {/* Specs */}
        <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl border border-ink-800 bg-ink-900 p-4 text-sm">
          <Spec label="Proof" value={fmtProof(bottle.proof)} />
          <Spec label="Size" value={fmtMl(bottle.size_ml)} />
          <Spec label="Age" value={bottle.age_years ? `${bottle.age_years} yr` : '—'} />
          <Spec label="Cost" value={fmtMoney(bottle.cost)} />
          <Spec label="Distillery" value={bottle.distillery || '—'} />
          <Spec label="Mash bill" value={bottle.mash_bill || '—'} />
          <Spec label="Cask" value={bottle.cask_type || '—'} />
          <Spec label="Batch" value={bottle.batch_no || bottle.barrel_no || '—'} />
        </div>

        {/* Pour log */}
        <div className="mt-3 rounded-2xl border border-ink-800 bg-ink-900 p-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-bone/80">
            <Clock className="h-4 w-4" /> Pour log
          </h3>
          {pours.length === 0 ? (
            <p className="text-xs text-bone/50">No pours logged yet.</p>
          ) : (
            <ul className="divide-y divide-ink-800 text-xs">
              {pours.slice(0, 8).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span>{new Date(p.poured_at).toLocaleString()}</span>
                  <span className="font-mono text-bone/60">{p.oz} oz</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Pour FAB */}
        {bottle.status !== 'finished' && (
          <Button onClick={pour} className="mt-5 w-full !py-4 text-base">
            <Wine className="h-5 w-5" /> Pour {pourOz} oz
          </Button>
        )}
      </motion.div>

      <BottomSheet open={editing} onClose={() => setEditing(false)} title="Edit bottle">
        <BottleForm
          initial={bottle}
          onSave={async (values) => {
            await updateBottle(bottle.id, values);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
          submitLabel="Save changes"
        />
      </BottomSheet>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-ink-850 px-2 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-bone/50">{label}</div>
      <div className="mt-0.5 font-mono text-sm">{value}</div>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-bone/50">{label}</div>
      <div className="mt-0.5 truncate">{value}</div>
    </div>
  );
}
