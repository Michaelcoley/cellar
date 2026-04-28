import { NavLink } from 'react-router-dom';
import { Home, ScanLine, BarChart3, Settings } from 'lucide-react';
import clsx from 'clsx';

const TABS = [
  { to: '/', label: 'Cellar', icon: Home, end: true },
  { to: '/scan', label: 'Scan', icon: ScanLine, primary: true },
  { to: '/stats', label: 'Stats', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function TabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-800 bg-ink-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map(({ to, label, icon: Icon, end, primary }) => (
          <li key={to} className="flex-1">
            <NavLink to={to} end={end} className="block">
              {({ isActive }) => (
                <div
                  className={clsx(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors',
                    isActive ? 'text-amber' : 'text-bone/50',
                  )}
                >
                  <span
                    className={clsx(
                      'flex items-center justify-center',
                      primary
                        ? 'h-11 w-11 -mt-4 rounded-full bg-amber text-ink-950 shadow-glow'
                        : 'h-6 w-6',
                    )}
                  >
                    <Icon className={primary ? 'h-5 w-5' : 'h-5 w-5'} />
                  </span>
                  <span>{label}</span>
                </div>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
