import { useEffect, useState } from 'react';
import { HardDrive, ShieldCheck, BookOpen } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { useRecipes } from '../hooks/useRecipes';

export function SettingsPage() {
  const { recipes } = useRecipes();
  const [usage, setUsage] = useState<{ used: number; persisted: boolean } | null>(null);

  useEffect(() => {
    void (async () => {
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        const persisted = (await navigator.storage.persisted?.()) ?? false;
        setUsage({ used: est.usage ?? 0, persisted });
      }
    })();
  }, []);

  return (
    <>
      <PageHeader title="Settings" />
      <div className="flex flex-col gap-6 p-4">
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold text-gray-500">Library</h2>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <BookOpen size={16} /> {recipes.length} recipe{recipes.length === 1 ? '' : 's'}
          </div>
          <p className="text-xs text-gray-500">
            Recipes live in <code>recipes.yaml</code> in the project and ship with the app. Edit
            them on GitHub and push to update every device — your favorites and last-cooked dates
            stay on this phone.
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
                ? 'Storage is persistent.'
                : 'Storage is not persistent (favorites may be cleared by the OS).'}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
