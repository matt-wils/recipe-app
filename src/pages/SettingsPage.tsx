import { useEffect, useRef, useState } from 'react';
import { Download, Upload, HardDrive, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { exportBackup, readImportPlan, commitImport } from '../services/backup';
import type { ImportPlan } from '../types';

export function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<ImportPlan | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string>('');
  const [usage, setUsage] = useState<{ used: number; persisted: boolean } | null>(null);

  const loadStorage = async () => {
    if (navigator.storage?.estimate) {
      const est = await navigator.storage.estimate();
      const persisted = (await navigator.storage.persisted?.()) ?? false;
      setUsage({ used: est.usage ?? 0, persisted });
    }
  };

  useEffect(() => {
    void loadStorage();
  }, []);

  const onExport = async () => {
    await exportBackup();
    setStatus('Backup downloaded.');
  };

  const onPickFile = async (file: File) => {
    setError('');
    try {
      setPlan(await readImportPlan(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read file.');
    }
  };

  const onConfirmImport = async () => {
    if (!plan) return;
    await commitImport(plan);
    setPlan(null);
    setStatus(`Imported: ${plan.toAdd} added, ${plan.toUpdate} updated.`);
    void loadStorage();
  };

  return (
    <>
      <PageHeader title="Settings" />
      <div className="flex flex-col gap-6 p-4">
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-gray-500">Backup</h2>
          <Button onClick={onExport} className="flex items-center justify-center gap-2">
            <Download size={18} /> Export all recipes (JSON)
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2"
          >
            <Upload size={18} /> Import from file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onPickFile(file);
              e.target.value = '';
            }}
          />
          {status && <p className="text-sm text-emerald-700">{status}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs text-gray-500">
            Importing merges by recipe — existing recipes are updated, new ones added,
            and nothing is deleted.
          </p>
        </section>

        {usage && (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-500">Storage</h2>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <HardDrive size={16} /> {(usage.used / 1024 / 1024).toFixed(1)} MB used
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <ShieldCheck size={16} />
              {usage.persisted
                ? 'Storage is persistent (less likely to be cleared).'
                : 'Storage is not persistent — export backups regularly.'}
            </div>
          </section>
        )}
      </div>

      <Modal open={plan !== null} title="Confirm import" onClose={() => setPlan(null)}>
        {plan && (
          <>
            <p className="mb-4 text-sm text-gray-600">
              This will add <strong>{plan.toAdd}</strong> new recipe
              {plan.toAdd === 1 ? '' : 's'} and update{' '}
              <strong>{plan.toUpdate}</strong> existing one
              {plan.toUpdate === 1 ? '' : 's'}. Nothing will be deleted.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setPlan(null)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={onConfirmImport}>
                Import
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
