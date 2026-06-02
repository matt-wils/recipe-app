import { NavLink } from 'react-router-dom';
import { BookOpen, Search, BarChart3, Settings } from 'lucide-react';

const TABS = [
  { to: '/', label: 'Recipes', icon: BookOpen, end: true },
  { to: '/matcher', label: 'Match', icon: Search, end: false },
  { to: '/common', label: 'Compare', icon: BarChart3, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-40 grid grid-cols-4 border-t border-gray-200 bg-white safe-bottom">
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
