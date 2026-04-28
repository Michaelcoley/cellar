import clsx from 'clsx';

export function Field({ label, hint, children, className }) {
  return (
    <label className={clsx('block', className)}>
      <span className="mb-1 block text-xs uppercase tracking-wider text-bone/50">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-bone/40">{hint}</span>}
    </label>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={clsx(
        'w-full rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-base text-bone outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/30',
        props.className,
      )}
    />
  );
}

export function Textarea(props) {
  return (
    <textarea
      {...props}
      rows={props.rows ?? 3}
      className={clsx(
        'w-full rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-base text-bone outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/30',
        props.className,
      )}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={clsx(
        'w-full appearance-none rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5 text-base text-bone outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/30',
        props.className,
      )}
    >
      {children}
    </select>
  );
}

export function Button({ variant = 'primary', className, children, ...props }) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition active:scale-[0.98] disabled:opacity-50',
        variant === 'primary' && 'bg-amber text-ink-950 hover:bg-amber-300',
        variant === 'ghost' && 'bg-ink-800 text-bone hover:bg-ink-700',
        variant === 'danger' && 'bg-danger/15 text-danger hover:bg-danger/25',
        className,
      )}
    >
      {children}
    </button>
  );
}
