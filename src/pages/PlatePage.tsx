import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { Shuffle, ShoppingCart, ChevronRight, Check } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { useShoppingList } from '../hooks/useShoppingList';
import { pickRandom } from '../utils/shuffle';
import { getPlateComponents, SLOT_LABELS, SLOT_ORDER } from '../data/plates';
import type { PlateComponent, PlateSlot } from '../types';

// Reel geometry: items are a fixed height, so the centered index is just
// round(scrollTop / ITEM_H) — robust and no measuring needed.
const ITEM_H = 44;
const VISIBLE = 5;
const COL_H = ITEM_H * VISIBLE;
const PAD = (COL_H - ITEM_H) / 2; // spacer so the first/last item can center

interface ReelHandle {
  scrollToId: (id: string) => void;
}

interface ReelProps {
  components: PlateComponent[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/** One vertical scroll-snap column; the centered item is the selection. */
const PlateReel = forwardRef<ReelHandle, ReelProps>(function PlateReel(
  { components, selectedId, onSelect },
  ref,
) {
  const elRef = useRef<HTMLDivElement>(null);
  const programmatic = useRef(false); // ignore scroll events we triggered
  const release = useRef<ReturnType<typeof setTimeout>>(undefined);
  const raf = useRef<number>(undefined);

  const scrollToIndex = useCallback((i: number, smooth: boolean) => {
    const el = elRef.current;
    if (!el) return;
    programmatic.current = true;
    clearTimeout(release.current);
    el.scrollTo({ top: i * ITEM_H, behavior: smooth ? 'smooth' : 'auto' });
    release.current = setTimeout(() => (programmatic.current = false), smooth ? 450 : 60);
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      scrollToId: (id) => {
        const i = components.findIndex((c) => c.id === id);
        if (i >= 0) scrollToIndex(i, true);
      },
    }),
    [components, scrollToIndex],
  );

  // Center the initial selection on mount, without animation.
  useLayoutEffect(() => {
    const i = components.findIndex((c) => c.id === selectedId);
    if (i >= 0) scrollToIndex(i, false);
    return () => {
      clearTimeout(release.current);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
    // mount-only: later selection changes are driven by scroll or scrollToId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (programmatic.current) return;
    const el = elRef.current;
    if (!el) return;
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const idx = Math.min(components.length - 1, Math.max(0, Math.round(el.scrollTop / ITEM_H)));
      const c = components[idx];
      if (c && c.id !== selectedId) onSelect(c.id);
    });
  };

  return (
    <div className="relative flex-1">
      {/* center highlight band — sits behind the items (relative z-10 below) so
          the centered name stays readable on top of it. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 -translate-y-1/2"
        style={{ height: ITEM_H }}
      >
        <div className="mx-2 h-full rounded-lg bg-emerald-50 ring-1 ring-emerald-300" />
      </div>
      <div
        ref={elRef}
        onScroll={handleScroll}
        className="no-scrollbar relative z-10 snap-y snap-mandatory overflow-y-auto"
        style={{ height: COL_H }}
      >
        <div style={{ height: PAD }} />
        {components.map((c, i) => (
          <button
            key={c.id}
            onClick={() => {
              onSelect(c.id);
              scrollToIndex(i, true);
            }}
            className={`flex w-full snap-center items-center justify-center px-1 text-center text-sm leading-tight ${
              c.id === selectedId ? 'font-semibold text-gray-900' : 'text-gray-400'
            }`}
            style={{ height: ITEM_H }}
          >
            {c.name}
          </button>
        ))}
        <div style={{ height: PAD }} />
      </div>
    </div>
  );
});

export function PlatePage() {
  const { addPlate, removeExtra, extras } = useShoppingList();

  const bySlot = useMemo(() => {
    const map = {} as Record<PlateSlot, PlateComponent[]>;
    for (const slot of SLOT_ORDER) map[slot] = getPlateComponents(slot);
    return map;
  }, []);

  const [selected, setSelected] = useState<Record<PlateSlot, string>>(() => {
    const init = {} as Record<PlateSlot, string>;
    for (const slot of SLOT_ORDER) init[slot] = getPlateComponents(slot)[0]?.id ?? '';
    return init;
  });

  const reels = useRef<Record<PlateSlot, ReelHandle | null>>({
    protein: null,
    carb: null,
    vegetable: null,
  });

  const select = useCallback((slot: PlateSlot, id: string) => {
    setSelected((prev) => (prev[slot] === id ? prev : { ...prev, [slot]: id }));
  }, []);

  const shuffle = useCallback(() => {
    for (const slot of SLOT_ORDER) {
      const pick = pickRandom(bySlot[slot]);
      if (!pick) continue;
      select(slot, pick.id);
      reels.current[slot]?.scrollToId(pick.id);
    }
  }, [bySlot, select]);

  const chosen = SLOT_ORDER.map((slot) => bySlot[slot].find((c) => c.id === selected[slot])).filter(
    (c): c is PlateComponent => Boolean(c),
  );

  // The whole plate is "on the list" once every chosen component is an extra.
  // Toggling then mirrors the rest of the app (add when off, remove when on).
  const onList = chosen.length > 0 && chosen.every((c) => extras.includes(c.name));

  const toggleList = async () => {
    if (onList) {
      for (const c of chosen) await removeExtra(c.name);
    } else {
      await addPlate(chosen.map((c) => c.name));
    }
  };

  return (
    <>
      <PageHeader title="Build a plate" />
      <div className="flex flex-col gap-5 p-4">
        <p className="text-sm text-gray-500">
          Spin up a simple protein + carb + veg. Scroll each reel or shuffle, then add it to your
          shopping list. Tap any ingredient for a few ways to cook it.
        </p>

        {/* Reels */}
        <div className="flex gap-2">
          {SLOT_ORDER.map((slot) => (
            <div key={slot} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                {SLOT_LABELS[slot]}
              </span>
              <PlateReel
                ref={(h) => {
                  reels.current[slot] = h;
                }}
                components={bySlot[slot]}
                selectedId={selected[slot]}
                onSelect={(id) => select(slot, id)}
              />
            </div>
          ))}
        </div>

        <button
          onClick={shuffle}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-gray-100 font-medium text-gray-700 active:bg-gray-200"
        >
          <Shuffle size={18} /> Shuffle all
        </button>

        {/* Selected plate */}
        <section className="flex flex-col gap-2 rounded-xl border border-gray-200 p-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Your plate
          </h2>
          {chosen.map((c) => (
            <Link
              key={c.id}
              to={`/ingredient/${c.id}`}
              className="flex items-center justify-between rounded-lg px-2 py-2 active:bg-gray-50"
            >
              <span className="font-medium text-gray-900">{c.name}</span>
              <span className="flex items-center gap-1 text-sm text-gray-400">
                {c.methods.length} way{c.methods.length === 1 ? '' : 's'}
                <ChevronRight size={16} />
              </span>
            </Link>
          ))}
          <button
            onClick={() => void toggleList()}
            disabled={chosen.length === 0}
            aria-pressed={onList}
            className={`mt-1 flex h-11 items-center justify-center gap-1.5 rounded-xl font-semibold text-white disabled:opacity-50 ${
              onList
                ? 'bg-emerald-700 active:bg-emerald-800'
                : 'bg-emerald-600 active:bg-emerald-700'
            }`}
          >
            {onList ? (
              <>
                <Check size={18} /> On your list — tap to remove
              </>
            ) : (
              <>
                <ShoppingCart size={18} /> Add to shopping list
              </>
            )}
          </button>
        </section>

        {/* Browse all components as a standalone cooking reference */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            All ingredients
          </h2>
          {SLOT_ORDER.map((slot) => (
            <div key={slot}>
              <h3 className="mb-1 text-sm font-medium text-gray-500">{SLOT_LABELS[slot]}</h3>
              <div className="flex flex-wrap gap-1.5">
                {bySlot[slot].map((c) => (
                  <Link
                    key={c.id}
                    to={`/ingredient/${c.id}`}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 active:bg-gray-200"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
