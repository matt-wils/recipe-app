import { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { getAllRecipes, getLastBackupAt } from '../db';
import { exportBackup } from '../services/backup';

const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

/**
 * iOS can evict IndexedDB, so the JSON export is the real backup. Nudge the
 * user to export if it has been >14 days (or never) while recipes exist.
 */
export function BackupNudge() {
  const [show, setShow] = useState(false);

  const check = async () => {
    const recipes = await getAllRecipes();
    if (recipes.length === 0) {
      setShow(false);
      return;
    }
    const last = await getLastBackupAt();
    setShow(last === undefined || Date.now() - last > FOURTEEN_DAYS);
  };

  useEffect(() => {
    void check();
  }, []);

  if (!show) return null;

  const onExport = async () => {
    await exportBackup();
    setShow(false);
  };

  return (
    <div className="m-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
      <Download size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p>It's been a while since your last backup.</p>
        <button onClick={onExport} className="mt-1 font-semibold underline">
          Export now
        </button>
      </div>
      <button aria-label="Dismiss" onClick={() => setShow(false)}>
        <X size={18} />
      </button>
    </div>
  );
}
