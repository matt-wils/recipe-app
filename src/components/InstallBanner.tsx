import { useEffect, useState } from 'react';
import { Share, X } from 'lucide-react';

const DISMISS_KEY = 'a2hs-dismissed';

/**
 * iOS Safari has no programmatic install prompt - users must use the Share
 * menu. Show a one-time hint only when running in Safari (not standalone) on iOS.
 */
export function InstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    const nav = window.navigator as Navigator & { standalone?: boolean };
    const isStandalone =
      nav.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    const isIos = /iphone|ipad|ipod/i.test(nav.userAgent);
    if (isIos && !isStandalone) setShow(true);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShow(false);
  };

  return (
    <div className="m-3 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
      <Share size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1">
        Install this app: tap the Share button, then{' '}
        <strong>Add to Home Screen</strong>.
      </p>
      <button aria-label="Dismiss" onClick={dismiss}>
        <X size={18} />
      </button>
    </div>
  );
}
