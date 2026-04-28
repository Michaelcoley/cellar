import clsx from 'clsx';
import { STATUS_LABEL } from '../lib/taxonomy';

const STYLES = {
  sealed: 'bg-ink-800 text-bone/70',
  opened: 'bg-amber/15 text-amber',
  in_use: 'bg-success/15 text-success',
  finished: 'bg-ink-800 text-bone/40 line-through',
};

export function StatusBadge({ status, className }) {
  if (!status) return null;
  return (
    <span
      className={clsx('rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide', STYLES[status], className)}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}
