import { useMemo, useState } from 'react';
import { Search, GlassWater, Filter, ScanLine } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useBottles } from '../hooks/useBottles';
import { BottleCard } from '../components/BottleCard';
import { CardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { CATEGORIES } from '../lib/taxonomy';

export function Cellar() {
  const { bottles, loading } = useBottles();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bottles.filter((b) => {
      if (category !== 'all' && b.category !== category) return false;
      if (!q) return true;
      const hay = [b.name, b.brand, b.subtype, b.distillery].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [bottles, query, category]);

  return (
    <div className="pb-28">
      <header className="px-5 pb-4 pt-[max(env(safe-area-inset-top),20px)]">
        <h1 className="font-display text-3xl tracking-tight">Cellar</h1>
        <p className="text-xs text-bone/50">{bottles.length} bottle{bottles.length === 1 ? '' : 's'}</p>
      </header>

      <div className="sticky top-0 z-20 -mt-2 bg-ink-950/95 px-5 pb-3 pt-2 backdrop-blur">
        <div className="flex items-center gap-2 rounded-xl border border-ink-800 bg-ink-900 px-3">
          <Search className="h-4 w-4 text-bone/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your cellar…"
            className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-bone/40"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-xs text-bone/40">
              clear
            </button>
          )}
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>
            All
          </Chip>
          {Object.entries(CATEGORIES).map(([key, { label }]) => (
            <Chip key={key} active={category === key} onClick={() => setCategory(key)}>
              {label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="space-y-2 px-5 pt-2">
        {loading && (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}

        {!loading && filtered.length === 0 && bottles.length === 0 && (
          <EmptyState
            icon={GlassWater}
            title="Your cellar is empty"
            hint="Scan a barcode to add your first bottle."
            action={
              <Link
                to="/scan"
                className="inline-flex items-center gap-2 rounded-xl bg-amber px-4 py-2.5 text-sm font-medium text-ink-950"
              >
                <ScanLine className="h-4 w-4" />
                Scan a bottle
              </Link>
            }
          />
        )}

        {!loading && filtered.length === 0 && bottles.length > 0 && (
          <EmptyState icon={Filter} title="No matches" hint="Try a different search or category." />
        )}

        {!loading &&
          filtered.map((b) => (
            <motion.div key={b.id} layout>
              <BottleCard bottle={b} onClick={(b) => navigate(`/bottle/${b.id}`)} />
            </motion.div>
          ))}
      </div>
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition ${
        active
          ? 'border-amber bg-amber/10 text-amber'
          : 'border-ink-800 bg-ink-900 text-bone/60 hover:text-bone'
      }`}
    >
      {children}
    </button>
  );
}
