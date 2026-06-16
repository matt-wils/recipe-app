import { NavLink } from 'react-router-dom';
import { Shuffle, BookOpen, Search, ShoppingCart, UtensilsCrossed } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Tonight', icon: Shuffle, end: true },
  { to: '/browse', label: 'Browse', icon: BookOpen, end: false },
  { to: '/matcher', label: 'Match', icon: Search, end: false },
  { to: '/plate', label: 'Plate', icon: UtensilsCrossed, end: false },
  { to: '/shopping-list', label: 'Shopping', icon: ShoppingCart, end: false },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-40 grid grid-cols-5 border-t border-gray-200 bg-white safe-bottom">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${
              isActive ? 'text-emerald-600' : 'text-gray-500'
            }`
          }
        >
          <Icon size={22} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
