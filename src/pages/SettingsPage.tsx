import { useEffect, useState } from 'react';
import { HardDrive, ShieldCheck, BookOpen } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { useRecipes } from '../hooks/useRecipes';
import { formatBytes, usageBuckets, type UsageBucket, type UsageDetails } from '../utils/storage';

interface UsageState {
  used: number;
  persisted: boolean;
  buckets: UsageBucket[];
}

export function SettingsPage() {
  const { recipes } = useRecipes();
  const [usage, setUsage] = useState<UsageState | null>(null);

  useEffect(() => {
    void (async () => {
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        const persisted = (await navigator.storage.persisted?.()) ?? false;
        const details = (est as { usageDetails?: UsageDetails }).usageDetails;
        setUsage({ used: est.usage ?? 0, persisted, buckets: usageBuckets(details) });
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
              <HardDrive size={16} /> {formatBytes(usage.used)} used
            </div>
            {usage.buckets.length > 0 ? (
              <ul className="ml-6 flex flex-col gap-1 text-xs text-gray-500">
                {usage.buckets.map((bucket) => (
                  <li key={bucket.key} className="flex justify-between">
                    <span>{bucket.label}</span>
                    <span>{formatBytes(bucket.bytes)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500">
                This is a rough total reported by your browser. It includes the offline app cache
                and browser padding, so it’s usually far larger than the recipe data actually kept
                on this device (your favorites and history are only a few KB).
              </p>
            )}
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
