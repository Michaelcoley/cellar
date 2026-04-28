import { motion } from 'framer-motion';

export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-xs px-6 py-20 text-center"
    >
      {Icon && (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber/10 text-amber">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="font-display text-xl">{title}</h3>
      {hint && <p className="mt-2 text-sm text-bone/60">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}
