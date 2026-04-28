import { useState } from 'react';
import { Button, Field, Input, Select, Textarea } from '../components/Field';
import { CATEGORIES } from '../lib/taxonomy';

export function BottleForm({ initial, onSave, onCancel, submitLabel = 'Save', saving }) {
  const [v, setV] = useState(initial);
  const set = (key) => (e) => setV((s) => ({ ...s, [key]: e.target?.value ?? e }));
  const subtypes = CATEGORIES[v.category]?.subtypes ?? [];

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(v);
      }}
      className="space-y-3 pb-5"
    >
      <Field label="Name">
        <Input value={v.name ?? ''} onChange={set('name')} required autoFocus />
      </Field>
      <Field label="Brand">
        <Input value={v.brand ?? ''} onChange={set('brand')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <Select
            value={v.category ?? 'whiskey'}
            onChange={(e) => setV((s) => ({ ...s, category: e.target.value, subtype: '' }))}
          >
            {Object.entries(CATEGORIES).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Subtype">
          <Select value={v.subtype ?? ''} onChange={set('subtype')}>
            <option value="">—</option>
            {subtypes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Proof">
          <Input
            inputMode="decimal"
            value={v.proof ?? ''}
            onChange={(e) => setV((s) => ({ ...s, proof: e.target.value === '' ? null : Number(e.target.value) }))}
          />
        </Field>
        <Field label="Age (yrs)">
          <Input
            inputMode="numeric"
            value={v.age_years ?? ''}
            onChange={(e) =>
              setV((s) => ({ ...s, age_years: e.target.value === '' ? null : Number(e.target.value) }))
            }
          />
        </Field>
        <Field label="Size (ml)">
          <Input
            inputMode="numeric"
            value={v.size_ml ?? 750}
            onChange={(e) => setV((s) => ({ ...s, size_ml: Number(e.target.value || 0) }))}
          />
        </Field>
      </div>

      <Field label="Distillery">
        <Input value={v.distillery ?? ''} onChange={set('distillery')} />
      </Field>
      <Field label="Region">
        <Input value={v.region ?? ''} onChange={set('region')} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Mash bill">
          <Input value={v.mash_bill ?? ''} onChange={set('mash_bill')} placeholder="e.g. 75/13/12" />
        </Field>
        <Field label="Cask">
          <Input value={v.cask_type ?? ''} onChange={set('cask_type')} placeholder="e.g. Sherry, ex-bourbon" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Batch">
          <Input value={v.batch_no ?? ''} onChange={set('batch_no')} />
        </Field>
        <Field label="Barrel">
          <Input value={v.barrel_no ?? ''} onChange={set('barrel_no')} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Cost (USD)">
          <Input
            inputMode="decimal"
            value={v.cost ?? ''}
            onChange={(e) => setV((s) => ({ ...s, cost: e.target.value === '' ? null : Number(e.target.value) }))}
          />
        </Field>
        <Field label="UPC">
          <Input value={v.upc ?? ''} onChange={set('upc')} className="font-mono" />
        </Field>
      </div>

      <Field label="Notes">
        <Textarea value={v.notes ?? ''} onChange={set('notes')} />
      </Field>

      <label className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5">
        <input
          type="checkbox"
          checked={Boolean(v.allocated)}
          onChange={(e) => setV((s) => ({ ...s, allocated: e.target.checked }))}
          className="h-4 w-4 accent-amber"
        />
        <span className="text-sm">Allocated bottle (BTAC, Pappy, etc.)</span>
      </label>

      <div className="flex gap-2 pt-2">
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={saving} className="flex-1">
          {saving ? '…' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
