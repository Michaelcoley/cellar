import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scanner } from '../components/Scanner';
import { lookupUpc } from '../lib/upcLookup';
import { BottomSheet } from '../components/BottomSheet';
import { BottleForm } from './BottleForm';
import { useBottles } from '../hooks/useBottles';

export function Scan() {
  const [open, setOpen] = useState(true);
  const [draft, setDraft] = useState(null);
  const [looking, setLooking] = useState(false);
  const { addBottle } = useBottles();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(true);
    return () => setOpen(false);
  }, []);

  async function handleCode(code) {
    setLooking(true);
    try {
      const hit = await lookupUpc(code);
      setDraft({
        upc: code,
        name: hit?.name ?? '',
        brand: hit?.brand ?? '',
        category: hit?.category ?? 'whiskey',
        subtype: hit?.subtype ?? '',
        proof: hit?.proof ?? null,
        age_years: hit?.age_years ?? null,
        distillery: hit?.distillery ?? '',
        region: hit?.region ?? '',
        allocated: Boolean(hit?.allocated),
        size_ml: 750,
        photo_url: hit?.photo_url ?? null,
        status: 'sealed',
        fill_pct: 100,
      });
      setOpen(false);
    } finally {
      setLooking(false);
    }
  }

  async function handleSave(values) {
    const created = await addBottle(values);
    setDraft(null);
    navigate(`/bottle/${created.id}`, { replace: true });
  }

  function handleCancel() {
    setDraft(null);
    navigate('/', { replace: true });
  }

  return (
    <>
      <Scanner open={open} onClose={() => navigate(-1)} onCode={handleCode} />
      <BottomSheet open={Boolean(draft)} onClose={handleCancel} title={draft?.name || 'New bottle'}>
        {draft && (
          <BottleForm
            initial={draft}
            onSave={handleSave}
            onCancel={handleCancel}
            saving={looking}
            submitLabel="Add to cellar"
          />
        )}
      </BottomSheet>
    </>
  );
}
