import { useMemo } from 'react';
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { GlassWater, AlertTriangle, Wallet, Sparkles } from 'lucide-react';
import { useBottles } from '../hooks/useBottles';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { CATEGORIES, freshnessThresholdDays } from '../lib/taxonomy';
import { daysSince, fmtMoney } from '../lib/format';

export function Stats() {
  const { bottles } = useBottles();

  const summary = useMemo(() => {
    let totalValue = 0;
    let allocated = 0;
    let lowFill = 0;
    let stale = 0;
    const byCategory = {};

    for (const b of bottles) {
      const fill = (b.fill_pct ?? 100) / 100;
      if (b.cost) totalValue += Number(b.cost) * fill;
      if (b.allocated) allocated += 1;
      if (b.status !== 'finished' && fill > 0 && fill < 0.2) lowFill += 1;
      if (b.opened_at) {
        const d = daysSince(b.opened_at);
        if (d != null && d > freshnessThresholdDays(b.category)) stale += 1;
      }
      byCategory[b.category] = (byCategory[b.category] ?? 0) + 1;
    }

    return { totalValue, allocated, lowFill, stale, byCategory };
  }, [bottles]);

  const chart = Object.entries(summary.byCategory).map(([key, count]) => ({
    key,
    label: CATEGORIES[key]?.label ?? 'Other',
    count,
  }));

  return (
    <div className="px-5 pb-28 pt-[max(env(safe-area-inset-top),20px)]">
      <h1 className="font-display text-3xl tracking-tight">Stats</h1>
      <p className="text-xs text-bone/50">A quiet look at the cellar.</p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Stat icon={GlassWater} label="Bottles" value={<AnimatedNumber value={bottles.length} />} />
        <Stat
          icon={Wallet}
          label="Cellar value"
          value={<AnimatedNumber value={summary.totalValue} format={(n) => fmtMoney(n)} />}
        />
        <Stat icon={Sparkles} label="Allocated" value={<AnimatedNumber value={summary.allocated} />} accent />
        <Stat
          icon={AlertTriangle}
          label="Low / stale"
          value={<AnimatedNumber value={summary.lowFill + summary.stale} />}
          warn
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-2xl border border-ink-800 bg-ink-900 p-4"
      >
        <h3 className="mb-3 text-sm font-medium text-bone/80">By category</h3>
        {chart.length === 0 ? (
          <p className="text-xs text-bone/50">Nothing to plot yet.</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={chart} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
                <XAxis dataKey="label" tick={{ fill: '#a8a29e', fontSize: 10 }} />
                <YAxis tick={{ fill: '#a8a29e', fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(212,165,116,0.08)' }}
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #262626', borderRadius: 12 }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chart.map((_, i) => (
                    <Cell key={i} fill="#D4A574" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </motion.section>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent, warn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-ink-800 bg-ink-900 p-4"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-bone/50">{label}</span>
        <Icon className={`h-4 w-4 ${accent ? 'text-amber' : warn ? 'text-warning' : 'text-bone/40'}`} />
      </div>
      <div className="mt-2 font-display text-2xl">{value}</div>
    </motion.div>
  );
}
