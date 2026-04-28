import { LogOut, Database, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/Field';
import { clearUpcCache } from '../lib/upcLookup';

export function Settings() {
  const { user, signOut } = useAuth();

  return (
    <div className="px-5 pb-28 pt-[max(env(safe-area-inset-top),20px)]">
      <h1 className="font-display text-3xl tracking-tight">Settings</h1>

      <section className="mt-5 rounded-2xl border border-ink-800 bg-ink-900 p-4">
        <p className="text-xs uppercase tracking-wider text-bone/50">Account</p>
        <p className="mt-1 break-all text-sm">{user?.email}</p>
      </section>

      <section className="mt-3 space-y-2 rounded-2xl border border-ink-800 bg-ink-900 p-4">
        <p className="text-xs uppercase tracking-wider text-bone/50">Maintenance</p>
        <Button
          variant="ghost"
          onClick={() => {
            clearUpcCache();
            alert('UPC cache cleared.');
          }}
          className="w-full justify-start"
        >
          <Database className="h-4 w-4" /> Clear UPC cache
        </Button>
      </section>

      <section className="mt-3 space-y-2 rounded-2xl border border-ink-800 bg-ink-900 p-4">
        <Button variant="danger" onClick={signOut} className="w-full justify-start">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </section>

      <p className="mt-8 text-center text-[11px] text-bone/30">
        <Trash2 className="mr-1 inline h-3 w-3" />
        Built with respect for collectors.
      </p>
    </div>
  );
}
